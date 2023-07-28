const conexao = require('./database/conexao.js')
const express = require('express')
const session = require('express-session')

const port = 3000

const ClienteController = require('./controller/ClienteController')
const ReboqueController = require('./controller/ReboqueController')
const ReservaController = require('./controller/ReservaController')
const UsuarioController = require('./controller/UsuarioController')
const app = express()

app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
app.use(session({secret: 'udjs93ka0', resave: true, saveUninitialized: true}));

app.use(ClienteController)
app.use(ReboqueController)
app.use(ReservaController)
app.use(UsuarioController)

conexao.authenticate().then(()=>{
    app.listen(port,()=>{
        console.log(`Servidor rodando http://localhost:${port}`)
    })
}).catch(() => {
    console.error("Erro. Banco de dados não iniciado.")
})
