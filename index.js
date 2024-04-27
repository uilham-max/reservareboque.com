const conexao = require('./database/conexao.js')
const express = require('express')
const session = require('express-session')
const bodyParser = require('body-parser')

const port = 443

const ClienteController = require('./controller/ClienteController')
const ReboqueController = require('./controller/ReboqueController')
const ReservaController = require('./controller/ReservaController')
const AdminController = require('./controller/AdminController')
const IndexController = require('./controller/IndexController');
const pagamentoController = require('./controller/PagamentoController');
const app = express()

// Para Express 4.16 ou superior
app.use(express.json())
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
app.use(session({secret: 'udjs93ka0', resave: true, saveUninitialized: true}));

// Para versões anteriores ao Express 4.16
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())



app.use(ClienteController)
app.use(ReboqueController)
app.use(ReservaController)
app.use(AdminController)
app.use(IndexController)
app.use(pagamentoController)

conexao.authenticate().then(()=>{
    app.listen(port,()=>{
        console.log(`Servidor rodando http://localhost:${port}`)
    })
}).catch(() => {
    console.error("Erro. Banco de dados não iniciado.")
})
