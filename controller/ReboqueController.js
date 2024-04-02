const express = require('express')
const routerReboque = express.Router()
const DAOReboque = require('../database/DAOReboque')
const autorizacao = require('../autorizacao/autorizacao')
const { upload } = require('../helpers/uploadFoto');
const getSessionNome = require('../bill_modules/getSessionNomeCliente')



routerReboque.get('/reboque/novo', autorizacao, (req, res) => {
    res.render('reboque/novo', {user: getSessionNome(req, res), mensagem: ""})
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
    DAOReboque.getAll().then(reboques => {
        if(reboques){
            res.render('reboque/reboque', {user: getSessionNome(req, res), reboques: reboques, mensagem: ""})
        } else {
            res.render('erro', {mensagem: "Erro ao listar reboques."})
        }
    })
})



routerReboque.get('/reboque/editar/:id', autorizacao, (req,res) => {
    let id = req.params.id
    DAOReboque.getOne(id).then(reboque => {
        if(reboque){
            res.render('reboque/editar', {user: getSessionNome(req, res), reboque: reboque})
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