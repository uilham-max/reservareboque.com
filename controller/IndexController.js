const express = require('express')
const routerIndex = express.Router()
const DAOReboque = require('../database/DAOReboque')


routerIndex.get('/login', (req, res) => {
    res.render('login', {mensagem: ""})
})


routerIndex.get('/', (req, res) => {
    DAOReboque.getAll().then(reboques => {
        if(reboques){
            res.render('index', {reboques: reboques})
        } else {
            res.render('erro', {mensagem: "Erro ao listar reboques."})
        }
    })
})


module.exports = routerIndex;