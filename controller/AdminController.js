const express = require('express')
const routerAdmin = express.Router()
const DAOAdmin = require('../database/DAOAdmin')
const bcrypt = require('bcryptjs')
const autorizacao = require('../autorizacao/autorizacao')
const DAOReboque = require('../database/DAOReboque')


routerAdmin.get('/admin/painel/:mensagem?', (req, res) => {
    DAOReboque.getAll().then(reboques => {
        if(reboques){
            res.render('admin/painel', {reboques: reboques, mensagem: req.params.mensagem ? "Não é possível excluir um reboque já referenciado por uma reserva" : ""})
        } else {
            res.render('erro', {mensagem: "erro ao listar reboques"})
        }
    })
    
})


// ROTAS DO CADASTRO
routerAdmin.get('/cadastro/novo', (req, res) => {
    res.render('cadastro')
})
routerAdmin.post('/cadastro/salvar', (req, res) => {
    let {nome, email, senha} = req.body,
        salt = bcrypt.genSaltSync(10)
    senha = bcrypt.hashSync(senha, salt)
    if(DAOAdmin.insert(nome, email, senha)){
        res.redirect('/')
        // res.redirect('/', {mensagem: "Usuário incluído."})
    } else {
        res.render('erro', {mensagem: "Erro ao tentar incluir usuário."})
    }
})

//ROTAS DO LOGIN
// routerAdmin.get('/login', (req, res) => {
//     res.render('login')
// })

routerAdmin.post('/login/salvar', (req, res) => {
    let {email, senha} = req.body
    DAOAdmin.login(email, senha).then(admin => {
        if(admin){
            if(bcrypt.compareSync(req.body.senha, admin.senha)){
                req.session.admin = {id: admin.id, nome: admin.nome, email: admin.email}
                res.redirect('/index')
            } else {
                res.render('login', {mensagem: "Usuário ou senha inválidos."})
            }
        } else {
            res.render('login', {mensagem: "Usuário ou senha inválidos."})
        }
    })
})


// routerAdmin.get('/index', autorizacao,(req, res) => { // 
//     res.render("index", { admin: req.session.admin.nome })
// })

routerAdmin.get("/logout", function (req, res) {
    req.session.admin = undefined
    res.redirect("/")
});


module.exports = routerAdmin