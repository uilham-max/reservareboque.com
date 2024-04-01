const express = require('express')
const routerIndex = express.Router()
const DAOReboque = require('../database/DAOReboque')
const getSessionNome = require('../bill_modules/User')


routerIndex.get('/login', (req, res) => {
    res.render('login', {mensagem: ""})
})



routerIndex.get('/cadastro', (req, res) => {
    res.render('cadastro', {user: getSessionNome(req, res), mensagem: ''})
})



routerIndex.get('/', (req, res) => {
    DAOReboque.getAll().then(reboques => {

        if(reboques){
            res.render('index', {user: getSessionNome(req, res), mensagem: '',reboques: reboques})
        } else {
            res.render('erro', {mensagem: "Erro ao listar reboques."})
        }
    })

    
})


module.exports = routerIndex;