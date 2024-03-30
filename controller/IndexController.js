const express = require('express')
const routerIndex = express.Router()
const DAOReboque = require('../database/DAOReboque')


routerIndex.get('/login', (req, res) => {
    res.render('login', {mensagem: ""})
})

routerIndex.get('/cadastro', (req, res) => {
    let user = 'User'
    if(req.session.cliente && req.session.cliente.nome){
        user = req.session.cliente.nome
    }
    res.render('cadastro', {user: user, mensagem: ''})
})

routerIndex.post('/cadastro/create', (req, res) => {
    let {nome, sobrenome, cpf, rg, telefone, dataNascimento, cep, logradouro, complemento, bairro, localidade, uf, numeroDaCasa, email, senha, senhaRepita} = req.body
    if(senha !== senhaRepita){
        res.render('erro', {mensagem: 'Senhas diferentes.'})
    } else if(senha.length < 8){
        res.render('erro', {mensagem: 'A senha de ter mais de 8 dígitos.'})
    }

    

    console.log(req.body);
})


routerIndex.get('/', (req, res) => {
    let user = 'User'
    if(req.session.cliente && req.session.cliente.nome){
        user = req.session.cliente.nome
    }
    DAOReboque.getAll().then(reboques => {

        if(reboques){
            res.render('index', {user: user, mensagem: '',reboques: reboques})
        } else {
            res.render('erro', {mensagem: "Erro ao listar reboques."})
        }
    })

    
})


module.exports = routerIndex;