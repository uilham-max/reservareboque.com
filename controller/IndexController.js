const express = require('express')
const routerIndex = express.Router()
const DAOReboque = require('../database/DAOReboque')
const {clienteNome} = require('../helpers/getSessionNome')

const DAOCliente =  require('../database/DAOCliente')
const bcrypt = require('bcryptjs')
const Login = require('../bill_modules/Login')


routerIndex.get('/login', (req, res) => {
    res.render('login', {user: clienteNome(req, res), mensagem: ""})
})


routerIndex.get('/cadastro', (req, res) => {
    res.render('cadastro', {user: clienteNome(req, res), mensagem: ''})
})


routerIndex.get('/', (req, res) => {


    Login.cliente(process.env.CLIENTE_EMAIL_TESTE, process.env.CLIENTE_SENHA_TESTE, req)
    // console.log(req);


    DAOReboque.getAll().then(reboques => {
        if(reboques){
            res.render('index', {user: clienteNome(req, res), mensagem: '',reboques: reboques})
        } else {
            res.render('erro', {mensagem: "Erro ao listar reboques."})
        }
    })
})


module.exports = routerIndex;