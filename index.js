const conexao = require('./database/conexao.js')
const express = require('express')
const session = require('express-session')
const bodyParser = require('body-parser')
const useragent = require('express-useragent')




const port = 3000
const app = express()

const indexRouter = require('./routes/indexRouter')
const adminRouter = require('./routes/adminRouter')

const ClienteController = require('./controller/ClienteController')
const ReboqueController = require('./controller/ReboqueController')
const ReservaController = require('./controller/ReservaController')
// const AdminController = require('./controller/AdminController')
// const IndexController = require('./controller/IndexController');
const pagamentoController = require('./controller/PagamentoController');
var { removerPagamentosAPI } = require('./helpers/removerPagamentosNaoAprovados.js')


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

app.use(ClienteController)
app.use(ReboqueController)
app.use(ReservaController)
// app.use(AdminController)
// app.use(IndexController)
app.use(pagamentoController)


// Mon Sep 30 2024 15:00:00 GMT-0300 (Horário Padrão de Brasília)
// let dataInicioAntiga = 'Mon Sep 30 2024 15:00:00 GMT-0300 (Horário Padrão de Brasília)'
// dataInicioAntiga = moment.tz(new Date(dataInicioAntiga),'America/Sao_Paulo')
// console.log(dataInicioAntiga);

// let horaAtual = moment.tz(new Date(), 'America/Sao_Paulo').format()
// console.log(horaAtual);


// TESTENDO MOMENT.TZ
// let hoje = moment.tz(new Date(), 'America/Sao_Paulo')
// let inicio = moment.tz(new Date(), 'America/Sao_Paulo')
// let fim = moment.tz(new Date(), 'America/Sao_Paulo')
// let dia = moment.tz(new Date(), 'America/Sao_Paulo')

// inicio.add(10,'days')
// fim.add(12,'days')
// dia.add(11, 'days')

// console.log("hoje:", hoje);
// console.log("inicio:", inicio);
// console.log("fim:", fim);
// console.log("dia:", dia);


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


