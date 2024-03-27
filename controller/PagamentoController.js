const express = require('express')
const routerPagamento = express.Router()
const DAOReboque = require('../database/DAOReboque')
const DAOPagamento = require('../database/DAOPagamento')
const DAOCliente = require('../database/DAOCliente')
const DAOReserva = require('../database/DAOReserva')
const Diaria = require('../bill_modules/Diaria')



// ISSO DEVE OCORRE QUANDO O QR CODE FOR ESCENADO PELO CLIENTE
routerPagamento.post('/pagamento/salvar', (req, res) => {

    let {nome, cpf, telefone, email, cep, numeroDaCasa, idReboque, dataInicio, dataFim, valorDiaria, valorTotalDaReserva} = req.body
    // console.log("log: "+req.body.valorTotalDaReserva);

    valorTotalDaReserva = Diaria.calcularValorTotalDaReserva(Diaria.calcularDiarias(dataInicio,dataFim), valorDiaria)
    DAOPagamento.verificaPagamento().then(codigoPagamento => {
        if(codigoPagamento){
            DAOPagamento.insert(codigoPagamento, valorTotalDaReserva).then(pagamentoSuccess => {
                if(pagamentoSuccess){
                    DAOPagamento.getIdUltimoPagamentoInserido().then(idUltimoPagamento => {
                        if(idUltimoPagamento){
                            DAOCliente.insertCliente(nome, sobrenome, email, cpf, rg, telefone, dataNascimento, cep, logradouro, complemento, bairro, localidade, uf, numeroDaCasa).then(inserido => {
                                if(inserido){
                                    DAOCliente.getLastInsertedClientId().then(idUltimoCliente => {
                                        if(idUltimoCliente){
                                            DAOReserva.insert(dataInicio, dataFim, valorDiaria, idUltimoCliente, idReboque, idUltimoPagamento).then(inserido => {
                                                if(inserido){
                                                    res.render('pagamento/sucesso', {mensagem: ""})
                                                } else {
                                                    res.render('erro', {mensagem: 'erro ao realizar pagamento'})
                                                }
                                            })
                                        } else {
                                            res.render('erro', {mensagem: 'erro ao buscar ultimo id do cliente'})
                                        }
                                    })
                                } else {
                                    res.render('erro', {mensagem: 'erro ao inserir cliente no bd'})
                                }
                            })
                        } else {
                            res.render('erro', {mensagem: 'erro ao recuperar o id do último pagamento'})
                        }
                    })
                } else {
                    res.render('erro', {mensagem: "erro ao inserir pagamento no BD"})
                }
            })
        } else {
            res.render('erro', {mensagem: 'Pagamento não realizado'})
        }
    })
})


// GERANDO QR CODE PARA O CLIENTE
routerPagamento.post('/pagamento/pagamento', (req, res) => {

    let {nome, sobrenome, email, cpf, rg, telefone, cep, dataNascimento, logradouro, complemento, bairro, 
    localidade, numeroDaCasa, idReboque, dataInicio, dataFim, valorDiaria} = req.body
    
    valorTotalDaReserva = Diaria.calcularValorTotalDaReserva(Diaria.calcularDiarias(dataInicio,dataFim), valorDiaria)

    // Cria o objeto Reserva
    reserva = {
        'idReboque': idReboque,
        'dataInicio': dataInicio,
        'dataFim': dataFim,
        'valorDiaria': valorDiaria
    }

    // Cria o objeto Cliente 
    cliente = {
        'nome': nome,
        'sobrenome': sobrenome,
        'email': email,
        'cpf': cpf,
        'rg': rg,
        'telefone': telefone,
        'cep': cep,
        'dataNascimento': dataNascimento,
        'logradouro': logradouro,
        'complemento': complemento,
        'bairro': bairro,
        'localidade': localidade,
        'numeroDaCasa': numeroDaCasa
    }

    // BUSCAR QR CODE NA API NO PSP (PROVEDOR DE SERVIÇOS DE PAGAMENTO)
    DAOPagamento.getQRCode().then(qrCode => {
        if(qrCode){
            DAOReboque.getOne(idReboque).then(reboque => {
                if(reboque){
                    res.render('pagamento/pagamento', {mensagem: "", cliente: cliente, reboque: reboque, reserva: reserva, qrCode: qrCode, valorTotalDaReserva: valorTotalDaReserva})
                } else {
                    res.render('erro', {mensagem: "erro => PagamentoController.js"})
                }
            })

        } else {
            console.log("erro ao busca qrCode!");
        }

    })
    
})


module.exports = routerPagamento

