const express = require('express')
const routerPagamento = express.Router()
const DAOPagamento = require('../database/DAOPagamento')
const DAOCliente = require('../database/DAOCliente')
const DAOReserva = require('../database/DAOReserva')
const {clienteNome} = require('../helpers/getSessionNome')
const clienteAutorizacao = require('../autorizacao/clienteAutorizacao')
const { criarCobrancaPIX } = require('../helpers/API_Pagamentos')
const moment = require('moment-timezone')
const DAOReboque = require('../database/DAOReboque')
const Diaria = require('../bill_modules/Diaria')
const nodemailer = require("nodemailer");
const emailPagamentoAprovado = require('../helpers/emailPagamentoAprovado')
const MAIL_USER = process.env.MAIL_USER
const MAIL_PASS = process.env.MAIL_PASS



routerPagamento.post('/pagamento/qrcode', async (req, res) => {
    
    let {nome, cpf, telefone, email, cep, logradouro, complemento, 
    localidade, numeroDaCasa, idReboque, dataInicio, dataFim} = req.body
    let valorDiaria = 0

    // BUSCAR REBOQUE NO BD
    let reboque = await DAOReboque.getOne(idReboque)
    if(!reboque){
        res.render('erro', {mensagem: 'erro ao buscar reboque'})
    }
    
    // CALCULA VALORES E APLICA DESCONTOS
    let dias = Diaria.calcularDiarias(dataInicio, dataFim)
    let valorTotalDaReserva = Diaria.calcularValorTotalDaReserva(dias, reboque.valorDiaria)
    let valorTotalDaReservaComDesconto = Diaria.aplicarDescontoNaDiariaParaCliente(valorTotalDaReserva, dias)
    

    // CLIENTE LOGADO?
    let cliente = {}
    if(req.session.cliente){
        cliente = await DAOCliente.getOne(req.session.cliente.id)
        if(!cliente){
            res.render('erro', {mensagem: "Erro ao buscar cliente"})
        }
        valorDiaria = valorTotalDaReservaComDesconto/dias
        valorTotalDaReserva = valorTotalDaReservaComDesconto
    } else {
        // VERIFICA SE O CPF FOI USADO ANTERIORMENTE. SE FOR, A RESERVA SERÁ CONTABILIZADA NESTE CPF
        cliente = await DAOCliente.verificaSeClienteExiste(cpf)
        if(!cliente){
            // CASO O CPF NÃO SEJA ENCONTRADO SERÁ CRIADO UM CLIENTE NOVO 
            cliente = await DAOCliente.insertClienteQueNaoQuerSeCadastrar(nome, cpf, telefone, email, cep, logradouro, complemento, localidade, numeroDaCasa)
            if(!cliente){
                res.render('erro', {mensagem: 'erro ao criar cliente'})
            }  
        }
        valorDiaria = reboque.valorDiaria
    }

    // console.log(cliente.dataValues);

    // return

    // CHAMA A API DO SISTEMA DE PAGAMENTO
    let retorno;
    try{
        let data_vencimento = moment.tz( new Date(), 'America/Sao_Paulo' )
        data_vencimento = data_vencimento.format('YYYY-MM-DD')
        retorno = await criarCobrancaPIX(cliente.cpf, cliente.nome, telefone, email, valorTotalDaReserva, data_vencimento, dataInicio, dataFim, reboque.placa)
    }catch(error){
        res.render('erro', { mensagem: "Erro ao criar cobrança PIX."})
    }finally{

        // PAGAMENTO INSERT
        const idPagamento = await DAOPagamento.insert(retorno.id_cobranca, retorno.netValue, retorno.billingType)
        if(!idPagamento){
        res.render('erro', { mensagem: "Erro ao criar pagamento."})
        }


        // RESERVA INSERT
        const reserva = await DAOReserva.insert(dataInicio, dataFim, valorDiaria, dias, retorno.netValue, cliente.id, idReboque, idPagamento)
        if(!reserva){
            res.render('erro', {mensagem: 'Erro ao criar reserva.'})
        } else {
            res.render('pagamento/qrcode', {user: clienteNome(req, res),id_cobranca: retorno.id_cobranca, image: retorno.encodedImage, PIXCopiaECola: retorno.PIXCopiaECola, mensagem: ''})
            //res.redirect(`${retorno.invoiceUrl}`)
        }

    }

})


// API de comunicação com Assas
routerPagamento.post('/pagamento/webhook/pix', async (req, res) => {
    try{
        let idPagamento = req.body.payment.id
        await DAOPagamento.atualizarPagamentoParaAprovado(idPagamento)
    }catch(error){
        console.warn(error);
    }finally{
        res.sendStatus(200) ;
    }
})


// API que fica testando se o qrcode do PIX foi pago
routerPagamento.get('/pagamento/aprovado/:codigoPagamento', async (req, res) => {
    let {codigoPagamento} = req.params
    try{
        let resposta = await DAOPagamento.verificaPagamento(codigoPagamento)
        if(resposta.aprovado == true){
            console.log("Aprovado pagamento com codigo:",codigoPagamento);
            res.status(200).json({aprovado: true})
        }else{
            res.status(200).json({aprovado: false})
        }
    }catch(erro){
        console.error(erro);
    }
})


// ROTA PUBLICA
routerPagamento.get('/pagamento/realizado', async (req, res) => {

    if(req.session.cliente){
        emailPagamentoAprovado(req.session.cliente.email)
    }

    res.render('pagamento/sucesso', {user: clienteNome(req, res), mensagem: ""})
})


module.exports = routerPagamento

