const express = require('express')
const routerReboque = express.Router()
const DAOReboque = require('../database/DAOReboque')
const autorizacao = require('../autorizacao/autorizacao')
const { upload } = require('../helpers/uploadFoto');




routerReboque.get('/reboque/novo', autorizacao, (req, res) => {
    let user = 'User'
    if(req.session.admin && req.session.admin.nome){
        let a = req.session.cliente.nome
        let b = req.session.cliente.sobrenome
        user = a[0] + b[0]
    }
    res.render('reboque/novo', {user: user, mensagem: ""})
})

routerReboque.post('/reboque/salvar/', autorizacao, upload.single("foto"), (req, res) => {
    let {modelo, placa, valorDiaria, cor, pesoBruto, comprimento, largura, altura, quantidadeDeEixos, anoFabricacao, ativo, descricao} = req.body
    let foto = `img/${req.file.filename}` 
    DAOReboque.insert(modelo, placa, valorDiaria, cor, foto, pesoBruto, comprimento, largura, altura, quantidadeDeEixos, anoFabricacao, ativo, descricao).then(inserido => {
        if(inserido){
            res.render('reboque/novo', {mensagem: "Reboque incluído!"})
        } else {
            res.render('erro', {mensagem: "Não foi possível incluir reboque"})
        }
    })
})  

routerReboque.get('/reboque/lista/', autorizacao, (req, res) => {
    let user = 'User'
    if(req.session.admin && req.session.admin.nome){
        let a = req.session.cliente.nome
        let b = req.session.cliente.sobrenome
        user = a[0] + b[0]
    }
    DAOReboque.getAll().then(reboques => {
        if(reboques){
            res.render('reboque/reboque', {user: user, reboques: reboques, mensagem: ""})
        } else {
            res.render('erro', {mensagem: "Erro ao listar reboques."})
        }
    })
})

routerReboque.get('/reboque/editar/:id', autorizacao, (req,res) => {
    let user = 'User'
    if(req.session.admin && req.session.admin.nome){
        let a = req.session.cliente.nome
        let b = req.session.cliente.sobrenome
        user = a[0] + b[0]
    }
    let id = req.params.id
    DAOReboque.getOne(id).then(reboque => {
        if(reboque){
            res.render('reboque/editar', {user: user, reboque: reboque})
        } else {
            res.render('erro', {mensagem: "Erro na tentativa de edição. "})
        }
    })
})

routerReboque.post('/reboque/atualizar', autorizacao, (req,res) => {
    let {id, modelo, placa, valorDiaria, cor} = req.body
    DAOReboque.update(id, modelo, placa, valorDiaria, cor).then(atualizado => {
        if(atualizado){
            res.redirect('/reboque/lista')
        } else {
            res.render('erro', {mensagem: "Erro ao atualizar reboque."})
        }
    })
})

routerReboque.get('/reboque/excluir/:id', autorizacao, (req, res) => {
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