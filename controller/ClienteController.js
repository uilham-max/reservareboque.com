const express = require('express')
const routerCliente = express.Router()
const DAOCliente =  require('../database/DAOCliente')
const DAOReboque = require('../database/DAOReboque')
const autorizacao = require('../autorizacao/autorizacao')
const DAOReserva = require('../database/DAOReserva')
const Diaria = require('../bill_modules/Diaria')


routerCliente.post('/cliente/dados_cliente', (req, res) => {
    let {id, dataInicio, dataFim} =  req.body

    DAOReserva.getVerificaDisponibilidade(id, dataInicio, dataFim).then( resposta => {
        DAOReboque.getOne(id).then(reboque => {
            if(reboque && resposta.length === 0){
                let valorTotalDaReserva = Diaria.calcularValorTotalDaReserva(Diaria.calcularDiarias(dataInicio, dataFim), reboque.valorDiaria)
                res.render('cliente/dados_cliente', {reboque: reboque, dataInicio: dataInicio, dataFim: dataFim, valorTotalDaReserva: valorTotalDaReserva})
            } else {
                DAOReserva.getAtivas(id).then(reservas => {
                    res.render('reserva/periodo', {reboque: reboque, reservas: reservas, mensagem: "Indisponivel para esta data."})
                })
                
            }
        })
    } )
})


routerCliente.get('/cliente/novo', autorizacao, (req, res) => {
    res.render('cliente/novo', {mensagem: ""})
})

routerCliente.post('/cliente/salvar', autorizacao, (req, res) => {
    let {nome, cpf, telefone, endereco} = req.body
    DAOCliente.insert(nome, cpf, telefone, endereco).then(inserido => {
        if(inserido){
            res.render('cliente/novo', {mensagem: "Cliente incluído!"})
        } else {
            res.render('erro', {mensagem: "Não foi possível incluir o cliente!"})
        }
    })
})

routerCliente.get('/cliente/lista/:mensagem?', autorizacao, (req, res) => {
    DAOCliente.getAll().then(clientes => {
        if(clientes){
            res.render('cliente/cliente', {clientes: clientes, mensagem: req.params.mensagem? 
                "Não é possivel excluir um cliente já refereciado por uma locação":""})
        } else {
            res.render('erro', {mensagem: "Erro na listagem de clientes."})
        }
    })
})

routerCliente.get('/cliente/editar/:id', autorizacao, (req, res) => {
    let id = req.params.id
    DAOCliente.getOne(id).then(cliente => {
        if(cliente){
            res.render('cliente/editar', {cliente: cliente} )
        } else {
            res.render('erro', {mensagem: "Erro na tentativa de edição de cliente"})
        }
    })
})


routerCliente.post('/cliente/atualizar', autorizacao, (req,res) => {
    let {id, nome, cpf, telefone, endereco} = req.body
    DAOCliente.update(id, nome, cpf, telefone, endereco).then(cliente => {
        if(cliente){
            res.redirect('/cliente/lista')
        } else {
            res.render('erro', {mensagem: "Não foi possível atualizar o cliente."})
        }
    })
})


routerCliente.get('/cliente/excluir/:id', autorizacao, (req,res) => {
    let id = req.params.id
    DAOCliente.delete(id).then(excluido => {
        if(excluido){
            res.redirect('/cliente/lista')
        } else {
            res.render('erro', {mensagem: "Erro ao excluir cliente."})
        }
    })
})



module.exports = routerCliente
