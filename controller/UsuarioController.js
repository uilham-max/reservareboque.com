const express = require('express')
const routerUsuario = express.Router()
const DAOUsuario = require('../database/DAOUsuario')
const bcrypt = require('bcryptjs')
const autorizacao = require('../autorizacao/autorizacao')


// ROTAS DO CADASTRO
routerUsuario.get('/cadastro/novo', (req, res) => {
    res.render('cadastro')
})
routerUsuario.post('/cadastro/salvar', (req, res) => {
    let {nome, email, senha} = req.body,
        salt = bcrypt.genSaltSync(10)
    senha = bcrypt.hashSync(senha, salt)
    if(DAOUsuario.insert(nome, email, senha)){
        res.render('login', {mensagem: "Usuário incluído."})
    } else {
        res.render('erro', {mensagem: "Erro ao tentar incluir usuário."})
    }
})

//ROTAS DO LOGIN
routerUsuario.get('/', (req, res) => {
    res.render('login', { mensagem: "" })
})
routerUsuario.post('/login', (req, res) => {
    let {email, senha} = req.body
    DAOUsuario.login(email, senha).then(usuario => {
        if(usuario){
            if(bcrypt.compareSync(req.body.senha, usuario.senha)){
                req.session.usuario = {id: usuario.id, nome: usuario.nome, email: usuario.email}
                res.redirect('/index')
            } else {
                res.render('login', {mensagem: "Usuário ou senha inválidos."})
            }
        } else {
            res.render('login', {mensagem: "Usuário ou senha inválidos."})
        }
    })
})


routerUsuario.get('/index', autorizacao, (req, res) => { // autorização
    res.render("index", { usuario: req.session.usuario.nome })
})

routerUsuario.get("/logout", function (req, res) {
    req.session.usuario = undefined
    res.redirect("/")
});


module.exports = routerUsuario