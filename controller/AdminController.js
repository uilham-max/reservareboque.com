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


routerAdmin.get('/admin/painel', async (req, res) => {

    Login.admin(process.env.ADMIN_EMAIL_TESTE, process.env.ADMIN_SENHA_TESTE, req)

    let useragent = req.useragent

    const reservas = await DAOReserva.getAtivas();

    res.render('admin/painel', { user: adminNome(req, res), mensagem: '', dataJSON: await Grafico.reservas(), reservas: reservas, useragent: useragent });
});

routerAdmin.get('/admin/cadastro', autorizacao, (req, res) => {
    res.render('admin/cadastro', {user: adminNome(req, res), mensagem: ''})
})

routerAdmin.post('/admin/cadastro/salvar', autorizacao, (req, res) => {
    let {nome, email, senha, cpf} = req.body,
        salt = bcrypt.genSaltSync(10)
    senha = bcrypt.hashSync(senha, salt)
    if(DAOAdmin.insert(nome, email, senha, cpf)){
        res.redirect('/admin/painel')
    } else {
        res.render('erro', {mensagem: "Erro ao tentar incluir usuário."})
    }
})

routerAdmin.get('/admin/login', (req, res) => {
    res.render('admin/login', {user: adminNome(req, res), mensagem: ""})
})

routerAdmin.post('/admin/login/salvar', (req, res) => {
    let {email, senha} = req.body
    DAOAdmin.login(email, senha).then(admin => {
        if(admin){
            if(bcrypt.compareSync(req.body.senha, admin.senha)){
                req.session.admin = {id: admin.id, nome: admin.nome, email: admin.email}
                res.redirect('/admin/painel')
            } else {
                res.render('admin/login', {mensagem: "Usuário ou senha inválidos."})
            }
        } else {
            res.render('admin/login', {mensagem: "Usuário ou senha inválidos."})
        }
    })
})

routerAdmin.get("/admin/logout", function (req, res) {
    req.session.admin = undefined
    res.redirect("/")
});

module.exports = routerAdmin