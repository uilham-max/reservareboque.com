const express = require('express')
const routerPagamento = express.Router()
const DAOReboque = require('../database/DAOReboque')
const DAOPagamento = require('../database/DAOPagamento')
const DAOCliente = require('../database/DAOCliente')
const DAOReserva = require('../database/DAOReserva')



// ISSO DEVE OCORRE QUANDO O QR CODE FOR ESCENADO PELO CLIENTE
routerPagamento.post('/pagamento/salvar', (req, res) => {

    let {nome, cpf, telefone, email, cep, numero, idReboque, dataInicio, dataFim, valorDiaria} = req.body

    DAOPagamento.verificaPagamento().then(pagamento => {
        if(pagamento){
            DAOCliente.insertCliente(nome, cpf, telefone, email, cep, numero).then(inserido => {
                if(inserido){
                    DAOCliente.getLastInsertedClientId().then(ultimoId => {
                        if(ultimoId){
                            DAOReserva.insert(dataInicio, dataFim, valorDiaria, ultimoId, idReboque).then(iserido => {
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
            res.render('erro', {mensagem: 'Pagamento não realizado'})
        }
    })
})


// GERANDO QR CODE PARA O CLIENTE
routerPagamento.post('/pagamento/pagamento', (req, res) => {

    let {nome, cpf, telefone, email, cep, numero, idReboque, dataInicio, dataFim, valorDiaria} = req.body

    reserva = {
        'idReboque': idReboque,
        'dataInicio': dataInicio,
        'dataFim': dataFim,
        'valorDiaria': valorDiaria
    }

    cliente = {
        'nome': nome,
        'cpf': cpf,
        'telefone': telefone,
        'email': email,
        'cep': cep,
        'numeroCasa': numero
    }

    // BUSCAR QR CODE NA API NO PSP (PROVEDOR DE SERVIÇOS DE PAGAMENTO)
    DAOPagamento.getQRCode().then(qrCode => {
        if(qrCode){
            DAOReboque.getOne(idReboque).then(reboque => {
                if(reboque){
                    res.render('pagamento/pagamento', {mensagem: "", cliente: cliente, reboque: reboque, reserva: reserva, qrCode: qrCode})
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

