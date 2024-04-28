const express = require('express')
const routerPagamento = express.Router()
const DAOPagamento = require('../database/DAOPagamento')
const DAOCliente = require('../database/DAOCliente')
const DAOReserva = require('../database/DAOReserva')
const {clienteNome} = require('../helpers/getSessionNome')
const clienteAutorizacao = require('../autorizacao/clienteAutorizacao')
const { criarCobrancaPIX } = require('../helpers/API_Pagamentos')
const moment = require('moment-timezone')



// PAGAMENTO REALIZADO SOMENTE POR CLIENTES CADASTRADOS
routerPagamento.post('/pagamento/qrcode-cliente', clienteAutorizacao, async (req, res) => {
    
    let {idCliente, idReboque, dataInicio, dataFim, valorDiaria, valorTotalDaReserva, dias } = req.body

    const cliente = await DAOCliente.getOne(idCliente)
    if(!cliente){
       res.render('erro', { mensagem: "Erro ao buscar cliente."})
    }
    
    let data_vencimento = moment.tz( new Date(), 'America/Sao_Paulo' )
    data_vencimento = data_vencimento.format('YYYY-MM-DD')

    // Consome API
    let retorno;
    try{

        retorno = await criarCobrancaPIX(cliente.cpf, cliente.nome, valorTotalDaReserva, data_vencimento)
    
    }catch(error){

        res.render('erro', { mensagem: "Erro ao criar cobrança PIX."})

    }finally{

        // Insere o pagamento no BD com a flaq aprovado = false e retorna o seu id
        const idPagamento = await DAOPagamento.insert(retorno.id_cobranca, (retorno.netValue * dias), retorno.billingType)
        if(!idPagamento){
        res.render('erro', { mensagem: "Erro ao criar pagamento."})
        }

        // Insere a reserva usando o id do pagamento
        const reserva = await DAOReserva.insert(dataInicio, dataFim, valorDiaria, dias, valorTotalDaReserva, idCliente, idReboque, idPagamento)
        if(!reserva){
            res.render('erro', {mensagem: 'Erro ao criar reserva.'})
        } else {
            res.render('pagamento/qrcode-cliente', {user: clienteNome(req, res),id_cobranca: retorno.id_cobranca, image: retorno.encodedImage, idPagamento: idPagamento, mensagem: ''})
            //res.redirect(`${retorno.invoiceUrl}`)
        }

    }
})



// PUBLICO
routerPagamento.post('/pagamento/qrcode', async (req, res) => {
    
    let {nome, sobrenome, email, cpf, rg, telefone, cep, dataNascimento, logradouro, complemento, bairro, 
    localidade, uf, numeroDaCasa, idReboque, dataInicio, dataFim, valorDiaria, dias, valorTotalDaReserva} = req.body

    let idCliente

    // Faz aproveitamento de clientes não cadastrados
    const cliente = await DAOCliente.verificaSeOClienteJaExiste(cpf)
    if(!cliente){
        idCliente = await DAOCliente.insertClienteQueNaoQuerSeCadastrar(nome, sobrenome, email, cpf, rg, telefone, dataNascimento, cep, logradouro, complemento, bairro, localidade, uf, numeroDaCasa)
        if(!idCliente){
            res.render('erro', {mensagem: 'erro ao criar cliente'})
        }  
    } else {
        idCliente = cliente.id
    }


    // Envia os dados de pagamento para API e recebe JSON com os dados de pagamento 
    const pagamento = await DAOPagamento.getDadosPagamento(valorTotalDaReserva)
    if(!pagamento){
       res.render('erro', { mensagem: "Erro ao criar pagamento."})
    }

    // Insere o pagamento no BD com a flaq aprovado = false e retorna o seu id
    const idPagamento = await DAOPagamento.insert(pagamento.codigo, valorTotalDaReserva)
    if(!idPagamento){
       res.render('erro', { mensagem: "Erro ao criar pagamento."})
    }

    // Insere a reserva usando o id do pagamento e do cliente inserido
    const reserva = await DAOReserva.insert(dataInicio, dataFim, valorDiaria, dias, valorTotalDaReserva, idCliente, idReboque, idPagamento)
    if(!reserva){
        res.render('erro', {mensagem: 'Erro ao criar reserva.'})
    } else {
        res.render('pagamento/qrcode', {user: clienteNome(req, res), idPagamento: idPagamento, qrCode: pagamento.qrCode, mensagem: ''})
    }

})


// API de comunicação com Assas
routerPagamento.post('/pagamento/webhook/pix', async (req, res) => {
    try{
        let idPagamento = req.body.payment.id
        let update = await DAOPagamento.atualizarPagamentoParaAprovado(idPagamento)
    }catch(error){
        console.warn(error);
    }finally{
        res.sendStatus(200) ;
    }
})

// Configuração de CORS
routerPagamento.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});


// API que fica testando se o qrcode do PIX foi pago
routerPagamento.post('/pagamento/aprovado', async (req, res) => {
    let {codigoPagamento} = req.body
    try{
        let resposta = await DAOPagamento.verificaPagamento(codigoPagamento)
        if(resposta.aprovado == true){
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
    res.render('pagamento/sucesso', {user: clienteNome(req, res), mensagem: ""})
})


module.exports = routerPagamento

