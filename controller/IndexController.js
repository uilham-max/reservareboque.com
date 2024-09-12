const express = require('express')
const routerIndex = express.Router()
const DAOReboque = require('../database/DAOReboque')
const {clienteNome} = require('../helpers/getSessionNome')

const DAOCliente =  require('../database/DAOCliente')
const bcrypt = require('bcryptjs')
const Login = require('../bill_modules/Login')


const getIndex = (req, res) => {

    Login.cliente(process.env.CLIENTE_EMAIL_TESTE, process.env.CLIENTE_SENHA_TESTE, req)

    DAOReboque.getAll().then(reboques => {
        if(reboques){
            res.render('index', {user: clienteNome(req, res), mensagem: '',reboques: reboques})
        } else {
            res.render('erro', {mensagem: "Erro ao listar reboques."})
        }
    })
    
}


module.exports = {getIndex}