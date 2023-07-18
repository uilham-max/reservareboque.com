const express = require('express')
const routerUsuario = express.Router()

routerUsuario.get('/', (req, res) => {
    res.render('index', { usuario: "" })
})

routerUsuario.get('/index', (req, res) => {
    res.render("index", { usuario: "" })
})

module.exports = routerUsuario