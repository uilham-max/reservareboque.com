const conexao = require('./database/conexao.js')
const express = require('express')
const session = require('express-session')
const bodyParser = require('body-parser')
const useragent = require('express-useragent')
var { removerPagamentosAPI } = require('./helpers/removerPagamentosNaoAprovados.js')

const port = 3000
const app = express()

const indexRouter = require('./routes/indexRouter')
const adminRouter = require('./routes/adminRouter')
const clienteRouter = require('./routes/clienteRouter')
const reboqueRouter = require('./routes/reboqueRouter')
const pagamentoRouter = require('./routes/pagamentoRouter')

const ReservaController = require('./controller/ReservaController')

// Para Express 4.16 ou superior
app.use(express.json())
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
app.use(session({secret: 'udjs93ka0', resave: true, saveUninitialized: true}));
app.use(useragent.express())

// Para versões anteriores ao Express 4.16
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use('/', indexRouter)
app.use('/admin', adminRouter)
app.use('/cliente', clienteRouter)
app.use('/reboque', reboqueRouter)
app.use ('/pagamento', pagamentoRouter)

app.use(ReservaController)

// Como o render não fica mais de 1 minuto no ar, isso remove pagamenos quando ele sobe.
try{
    console.log("Removendo pagamentos com data vencida...");
    removerPagamentosAPI()
}catch(erro){
    console.error(erro);
}

conexao.authenticate().then(()=>{
    app.listen(port,()=>{
        console.log(`Conexão com BD foi estabelecida com sucesso!`)
    })
}).catch((erro) => {
    console.error(`Erro. Banco de dados não iniciado.\n ${erro}`)
})


