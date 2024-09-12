const express = require('express')
const routerAdmin = express.Router()
const DAOAdmin = require('../database/DAOAdmin')
const bcrypt = require('bcryptjs')
const autorizacao = require('../autorizacao/autorizacao')
const { adminNome } = require('../helpers/getSessionNome')
const DAOReserva = require('../database/DAOReserva')
const moment = require('moment-timezone')
const DAOReboque = require('../database/DAOReboque')
const useragent = require('express-useragent')
const Login = require('../bill_modules/Login')
const Grafico = require('../bill_modules/Grafico')


const getCadastro = async (req, res) => {
    res.render('admin/cadastro', {user: adminNome(req, res), mensagem: ''})
}

const postCadastro = async (req, res) => {
    let {nome, email, senha, cpf} = req.body,
        salt = bcrypt.genSaltSync(10)
    senha = bcrypt.hashSync(senha, salt)
    if(DAOAdmin.insert(nome, email, senha, cpf)){
        res.redirect('/reserva/admin/painel')
    } else {
        res.render('erro', {mensagem: "Erro ao tentar incluir usuário."})
    }
}

const getLogin = async (req, res) => {
    res.render('admin/login', {user: adminNome(req, res), mensagem: ""})
}

const postLogin = async (req, res) => {
    let {email, senha} = req.body
    DAOAdmin.login(email, senha).then(admin => {
        if(admin){
            if(bcrypt.compareSync(req.body.senha, admin.senha)){
                req.session.admin = {id: admin.id, nome: admin.nome, email: admin.email}
                res.redirect('/reserva/admin/painel')
            } else {
                res.render('admin/login', {mensagem: "Usuário ou senha inválidos."})
            }
        } else {
            res.render('admin/login', {mensagem: "Usuário ou senha inválidos."})
        }
    })
}

const getLogout = async (req, res) => {
    req.session.admin = undefined
    res.redirect("/")
}

module.exports = {
    getCadastro,
    postCadastro,
    getLogin,
    postLogin,
    getLogout
}