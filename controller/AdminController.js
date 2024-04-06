const express = require('express')
const routerAdmin = express.Router()
const DAOAdmin = require('../database/DAOAdmin')
const bcrypt = require('bcryptjs')
const autorizacao = require('../autorizacao/autorizacao')
const { adminNome } = require('../helpers/getSessionNome')


routerAdmin.get('/admin/painel', autorizacao, (req, res) => {
    res.render('admin/painel', {user: adminNome(req, res), mensagem: ''})
})



// ROTAS DO CADASTRO
routerAdmin.get('/admin/cadastro', autorizacao, (req, res) => {
    res.render('admin/cadastro', {user: adminNome(req, res), mensagem: ''})
})



routerAdmin.post('/admin/cadastro/salvar', autorizacao, (req, res) => {
    let {nome, email, senha} = req.body,
        salt = bcrypt.genSaltSync(10)
    senha = bcrypt.hashSync(senha, salt)
    if(DAOAdmin.insert(nome, email, senha)){
        res.redirect('/admin/painel')
    } else {
        res.render('erro', {mensagem: "Erro ao tentar incluir usuário."})
    }
})




//ROTAS DO LOGIN
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




routerAdmin.get("/logout", function (req, res) {
    req.session.admin = undefined
    res.redirect("/")
});


module.exports = routerAdmin