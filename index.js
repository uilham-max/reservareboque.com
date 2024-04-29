const conexao = require('./database/conexao.js')
const express = require('express')
const session = require('express-session')
const bodyParser = require('body-parser')
const cors = require('cors')

const port = 3000
const app = express()
app.use(cors())


const ClienteController = require('./controller/ClienteController')
const ReboqueController = require('./controller/ReboqueController')
const ReservaController = require('./controller/ReservaController')
const AdminController = require('./controller/AdminController')
const IndexController = require('./controller/IndexController');
const pagamentoController = require('./controller/PagamentoController');
var { removerPagamentosNaoAprovados } = require('./helpers/removerPagamentosNaoAprovados.js')


// Lista de origens permitidas
// const whitelist = ['https://reboquesoliveira.com', 'https://www.reboquesoliveira.com'];

// Opções do cors
// const corsOptions = {
//     origin: function (origin, callback) {
//         if (whitelist.indexOf(origin) !== -1 || !origin) {
//             callback(null, true);
//         } else {
//             callback(new Error('Not allowed by CORS'));
//         }
//     }
// };



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

// Como o render não fica mais de 1 minuto no ar, isso remove pagamenos quando ele sobe.
    
try{
    console.log("Removendo pagamentos com data vencida...");
    removerPagamentosNaoAprovados()
}catch(erro){
    console.error(erro);
}
    
conexao.authenticate().then(()=>{
    app.listen(port,()=>{
        console.log(`Servidor rodando http://localhost:${port}`)
    })
}).catch(() => {
    console.error("Erro. Banco de dados não iniciado.")
})


