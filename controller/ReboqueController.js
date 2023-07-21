const { Router } = require('express')
const express = require('express')
const routerReboque = express.Router()
const DAOReboque = require('../database/DAOReboque')
const DAOReserva = require('../database/DAOReserva')


routerReboque.get('/reboque/novo', (req, res) => {
    res.render('reboque/novo', {mensagem: ""})
})

routerReboque.post('/reboque/salvar/:mensagem?', (req, res) => {
    let {modelo, placa, valorDiaria, cor} = req.body
    DAOReboque.insert(modelo, placa, valorDiaria, cor).then(inserido => {
        if(inserido){
            res.render('reboque/novo', {mensagem: "Reboque incluído!"})
        } else {
            res.render('erro', {mensagem: "Não foi possível incluir reboque"})
        }
    })
})  

routerReboque.get('/reboque/lista/:mensagem?', (req, res) => {
    DAOReboque.getAll().then(reboques => {
        if(reboques){
            res.render('reboque/reboque', {reboques: reboques, mensagem: req.params.mensagem ? 
                "Não é possível excluir um reboque já referencia por uma locação.":""})
        } else {
            res.render('erro', {mensagem: "Erro ao listar reboques."})
        }
    })
})

routerReboque.get('/reboque/editar/:id', (req,res) => {
    let id = req.params.id
    DAOReboque.getOne(id).then(reboque => {
        if(reboque){
            res.render('reboque/editar', {reboque: reboque})
        } else {
            res.render('erro', {mensagem: "Erro na tentativa de edição. "})
        }
    })
})

routerReboque.post('/reboque/atualizar', (req,res) => {
    let {id, modelo, placa, valorDiaria, cor} = req.body
    DAOReboque.update(id, modelo, placa, valorDiaria, cor).then(atualizado => {
        if(atualizado){
            res.redirect('/reboque/lista')
        } else {
            res.render('erro', {mensagem: "Erro ao atualizar reboque."})
        }
    })
})

routerReboque.get('/reboque/excluir/:id', (req, res) => {
    let id = req.params.id
    DAOReboque.delete(id).then(excluido =>{
        if(excluido){
            res.redirect('/reboque/lista')
        } else {
            res.render('erro', {mensagem: "Erro ao excluir"})
        }
    })
})

module.exports = routerReboque