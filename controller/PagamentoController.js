const express = require('express')
const routerPagamento = express.Router()
const DAOPagamento = require('../database/DAOPagamento')
const DAOCliente = require('../database/DAOCliente')
const DAOReserva = require('../database/DAOReserva')
const getSessionNome = require('../bill_modules/getSessionNomeCliente')
const clienteAutorizacao = require('../autorizacao/clienteAutorizacao')


// ROTA PUBLICA
routerPagamento.post('/pagamento/realizado', async (req, res) => {
    
    let {idPagamento} = req.body
    const pagamentoAprovado = await DAOPagamento.verificaPagamento()
    if(!pagamentoAprovado){
        res.render('erro', {mensagem: 'erro. pagamento não aprovado'})
    }
    const update = await DAOPagamento.atualizarPagamentoParaAprovado(idPagamento)
    if(!update){
        res.render('erro', {mensagem: 'erro ao atualizar pagamento para aprovado'})
    }
    res.render('pagamento/sucesso', {user: getSessionNome(req, res), mensagem: ""})

})



// PAGAMENTO REALIZADO SOMENTE POR CLIENTES CADASTRADOS
routerPagamento.post('/pagamento/qrcode-cliente', clienteAutorizacao, async (req, res) => {
    
    let {idCliente, idReboque, dataInicio, dataFim, valorDiaria, valorTotalDaReserva } = req.body

    // Gera o QR code com os dados de pagamento
    const pagamento = await DAOPagamento.getDadosPagamento(valorTotalDaReserva)
    if(!pagamento){
       res.render('erro', { mensagem: "Erro ao criar pagamento."})
    }

    // Insere o pagamento no BD com a flaq aprovado = false e retorna o seu id
    const idPagamento = await DAOPagamento.insert(pagamento.codigo, valorTotalDaReserva)
    if(!idPagamento){
       res.render('erro', { mensagem: "Erro ao criar pagamento."})
    }

    // Insere a reserva usando o id do pagamento
    const reserva = await DAOReserva.insert(dataInicio, dataFim, valorDiaria, idCliente, idReboque, idPagamento)
    if(!reserva){
        res.render('erro', {mensagem: 'Erro ao criar reserva.'})
    } else {
        res.render('pagamento/qrcode-cliente', {user: getSessionNome(req, res), idPagamento: idPagamento, qrCode: pagamento.qrCode, mensagem: ''})
    }

})



// PUBLICO
routerPagamento.post('/pagamento/qrcode', async (req, res) => {
    
    let {nome, sobrenome, email, cpf, rg, telefone, cep, dataNascimento, logradouro, complemento, bairro, 
    localidade, uf, numeroDaCasa, idReboque, dataInicio, dataFim, valorDiaria} = req.body

    const idCliente = await DAOCliente.insertClienteQueNaoQuerSeCadastrar(nome, sobrenome, email, cpf, rg, telefone, cep, dataNascimento, logradouro, complemento, bairro, localidade, uf, numeroDaCasa)
    if(!idCliente){
        res.render('erro', {mensagem: 'erro ao criar cliente'})
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
    const reserva = await DAOReserva.insert(dataInicio, dataFim, valorDiaria, idCliente, idReboque, idPagamento)
    if(!reserva){
        res.render('erro', {mensagem: 'Erro ao criar reserva.'})
    } else {
        res.render('pagamento/qrcode', {user: getSessionNome(req, res), idPagamento: idPagamento, qrCode: pagamento.qrCode, mensagem: ''})
    }

})


module.exports = routerPagamento
