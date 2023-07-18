const conexao = require('./database/conexao.js')
const express = require('express')

const port = 3000
const Sequelize = require('sequelize')

const ClienteController = require('./controller/ClienteController')
const ReboqueController = require('./controller/ReboqueController')
const ReservaController = require('./controller/ReservaController')
const UsuarioController = require('./controller/UsuarioController')
const app = express()

app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.set('view engine', 'ejs');

app.use(ClienteController)
app.use(ReboqueController)
app.use(ReservaController)
app.use(UsuarioController)

conexao.authenticate()
app.listen(port,()=>{
    console.log(`Servidor rodando http://localhost:${port}`)
})