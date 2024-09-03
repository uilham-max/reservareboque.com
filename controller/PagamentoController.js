const express = require('express')
const routerPagamento = express.Router()
const DAOPagamento = require('../database/DAOPagamento')
const DAOCliente = require('../database/DAOCliente')
const DAOReserva = require('../database/DAOReserva')
const { clienteNome, adminNome } = require('../helpers/getSessionNome')
const { criarCobranca, receiveInCash } = require('../helpers/API_Pagamentos')
const moment = require('moment-timezone')
const DAOReboque = require('../database/DAOReboque')
const Diaria = require('../bill_modules/Diaria')
const emailPagamentoAprovado = require('../helpers/emailPagamentoAprovado')
const emailPagamentoCriado = require('../helpers/emailPagamentoCriado')
const autorizacao = require('../autorizacao/autorizacao')



routerPagamento.post('/pagamento/recebeEmDinheiro', autorizacao, async (req, res)=>{

    let {codigoPagamento, valor} = req.body

    let data_pagamento = moment.tz( new Date(), 'America/Sao_Paulo' )
    data_pagamento = data_pagamento.format('YYYY-MM-DD')
    
    let response = await receiveInCash(codigoPagamento, valor, data_pagamento)
    
    if(!response){
        res.render('erro', {mensagem: 'Erro ao acessar recurso'})
    }
    
    res.redirect('/reserva/lista')

})


routerPagamento.post('/pagamento/qrcode', async (req, res) => {
    
    let {nome, cpf, telefone, email, cep, logradouro, complemento, 
    localidade, numeroDaCasa, reboquePlaca, dataInicio, dataFim, formaPagamento} = req.body

    
    // Criar um identificador único para o formulário
    const formIdentifier = `${reboquePlaca}-${dataInicio}-${dataFim}`;

    // Verificar se o formulário já foi enviado com base no identificador
    if (req.session.submittedForms && req.session.submittedForms.includes(formIdentifier)) {
        console.log("O formulário está duplicado. Envio cancelado!");
        return res.render('erro', { mensagem: 'Erro. Formulário duplicado!' });
    }
    
    cpf = cpf.replace(/\D/g, '')
    telefone = telefone.replace(/\D/g, '')
    cep = cep.replace(/\D/g, '')

    let valorDiaria = 0

    // BUSCAR REBOQUE NO BD
    let reboque = await DAOReboque.getOne(reboquePlaca)
    if(!reboque){
        res.render('erro', {mensagem: 'erro ao buscar reboque'})
        return
    }
    
    // CALCULA VALORES E APLICA DESCONTOS
    let dias = Diaria.calcularDiarias(dataInicio, dataFim)
    let valorTotalDaReserva = Diaria.calcularValorTotalDaReserva(dias, reboque.valorDiaria)
    let valorTotalDaReservaComDesconto = Diaria.aplicarDescontoNaDiariaParaCliente(valorTotalDaReserva, dias)
    

    // CLIENTE COM LOGIN?
    let cliente = {}
    if(req.session.cliente){
        cliente = await DAOCliente.getOne(req.session.cliente.cpf)
        if(!cliente){
            res.render('erro', {mensagem: "Erro ao buscar cliente"})
            return
        }
        valorDiaria = valorTotalDaReservaComDesconto/dias
        valorTotalDaReserva = valorTotalDaReservaComDesconto
    } else {
        // PROCURA CLIENTE
        cliente = await DAOCliente.verificaSeClienteExiste(cpf)
        if(!cliente){
            // INSERT CLIENTE 
            cliente = await DAOCliente.insertClienteQueNaoQuerSeCadastrar(nome, cpf, telefone, email, cep, logradouro, complemento, localidade, numeroDaCasa)
            if(!cliente){
                res.render('erro', {mensagem: 'erro ao criar cliente'})
                return
            }  
        }
        valorDiaria = reboque.valorDiaria
    }


    // CHAMA A API DO SISTEMA DE PAGAMENTO
    let retorno;
    try{
        let data_vencimento = moment.tz( new Date(), 'America/Sao_Paulo' )
        data_vencimento = data_vencimento.format('YYYY-MM-DD')

        /**
         * Verificar se não foi criada uma cobrança para essa reserva.
         * Não pode haver mais de uma cobrança para uma reserva.
        */

        retorno = await criarCobranca(cliente.cpf, cliente.nome, telefone, email, valorTotalDaReserva, data_vencimento, dataInicio, dataFim, reboque.placa, formaPagamento)
    }catch(error){
        res.render('erro', { mensagem: "Erro ao criar cobrança PIX."})
        return
    }finally{

        // Adiciona 60 minutos como tempo de expiração da reservas caso não seja paga
        var dataExpiracao = moment.tz(new Date(), 'America/Sao_Paulo')
        dataExpiracao.add(60, 'minutes')

        // PAGAMENTO INSERT
        const codigoPagamento = await DAOPagamento.insert(retorno.id_cobranca, retorno.netValue, retorno.billingType, dataExpiracao)
        if(!codigoPagamento){
        res.render('erro', { mensagem: "Erro ao criar pagamento."})
        }


        // RESERVA INSERT
        const reserva = await DAOReserva.insert(dataInicio, dataFim, valorDiaria, dias, retorno.netValue, cliente.cpf, reboquePlaca, codigoPagamento)
        if(!reserva){
            res.render('erro', {mensagem: 'Erro ao criar reserva.'})
        } else {

            // Marcar o formulário específico como enviado
            console.log("Marcando formulário como enviado...");
            req.session.submittedForms = req.session.submittedForms || [];
            req.session.submittedForms.push(formIdentifier);

            if(formaPagamento == 'PIX'){
                res.render('pagamento/qrcode', {user: clienteNome(req, res), formaPagamento: formaPagamento, id_cobranca: retorno.id_cobranca, image: retorno.encodedImage, PIXCopiaECola: retorno.PIXCopiaECola, mensagem: ''})
            } else {
                res.render('pagamento/sucesso', {user: clienteNome(req, res), formaPagamento: formaPagamento, mensagem: ""})
            }
            //res.redirect(`${retorno.invoiceUrl}`)
        }

    }

})


// WEB SERVICE - API PIX CRIADO
routerPagamento.post('/pagamento/webhook/pixCriado', async (req, res) => {
    let destino = "uilhamgoncalves@gmail.com"
    try{
        console.log(req.body.event, "Enviar email para o admin.");
        emailPagamentoCriado(destino)
    }catch(error){
        console.warn(error);
    }finally{
        res.sendStatus(200) ;
    }
    
})


// WEB SERVICE - ESCUTA O WEBHOOK --- ATUALIZA PAGAMENTO PARA APROVADO --- API PIX RECEBIDO
routerPagamento.post('/pagamento/webhook/pix', async (req, res) => {
    
    try{ 
        console.log("Executar: Atualizar situação de pagamento e reserva para aprovado");
        let codigoPagamento = req.body.payment.id
        let pagamento = await DAOPagamento.atualizarPagamentoParaAprovado(codigoPagamento)
        console.log(pagamento);
        console.log(pagamento.id);
        await DAOReserva.atualizaSituacaoParaAprovada((pagamento.id)) // Recuperar Id da reserva para atualizar a situação dela para aprovado

    }catch(error){
        console.warn(error);
    }finally{
        res.sendStatus(200) ;
    }    
    
})


// WEB SERVICE - ESCUTA A ROTA /pagamento/qrcode
routerPagamento.get('/pagamento/aprovado/:codigoPagamento', async (req, res) => {
    let {codigoPagamento} = req.params
    try{
        let resposta = await DAOPagamento.verificaPagamento(codigoPagamento)
        // console.log("Testando resposta ao verificar o pagamento -->",resposta.aprovado);
        // console.log("Testando resposta dataValues ao verificar o pagamento --> ",resposta.dataValues.aprovado);
        if(resposta.aprovado == true){
            console.log(codigoPagamento ," --> Aprovado pagamento!");
            res.status(200).json({aprovado: true})
        }else{
            // console.log(codigoPagamento ," --> Aguardando aprovação...");
            res.status(200).json({aprovado: false})
        }
    }catch(erro){
        console.log(codigoPagamento ," --> Erro ao processar pagamento!");
        console.error(erro);
    }
})


// ROTA PUBLICA
routerPagamento.get('/pagamento/realizado/:formaPagamento?', async (req, res) => {
    if(req.session.cliente){
        emailPagamentoAprovado(req.session.cliente.email)
    }
    res.render('pagamento/sucesso', {user: clienteNome(req, res), formaPagamento: req.params.formaPagamento, mensagem: ""})
})


module.exports = routerPagamento

