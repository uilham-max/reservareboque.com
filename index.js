const conexao = require('./database/conexao.js')
const express = require('express')
const session = require('express-session')
const Pagamento = require('./model/Pagamento')
const Reserva = require('./model/Reserva.js')


const cron = require('node-cron');

// Função para remover pagamentos não aprovados e suas reservas associadas
async function removerPagamentosNaoAprovados() {
    try {
        // Consultar todos os pagamentos não aprovados
        const pagamentosNaoAprovados = await Pagamento.findAll({ where: { aprovado: false } });

        // Para cada pagamento não aprovado, remover a reserva associada
        for (const pagamento of pagamentosNaoAprovados) {
            // Remover a reserva associada ao pagamento
            await Reserva.destroy({ where: { pagamentoId: pagamento.id } });

            // Remover o pagamento não aprovado
            await pagamento.destroy();
        }

        console.log('Pagamentos não aprovados e suas reservas associadas removidos com sucesso.');
    } catch (error) {
        console.error('Erro ao remover pagamentos não aprovados e suas reservas associadas:', error);
    }
}

// Agendar a execução da função a cada 30 minutos
cron.schedule('*/90 * * * *', async () => {
    console.log('Executando função para remover pagamentos não aprovados e suas reservas associadas...');
    await removerPagamentosNaoAprovados();
});



const port = 3000

const ClienteController = require('./controller/ClienteController')
const ReboqueController = require('./controller/ReboqueController')
const ReservaController = require('./controller/ReservaController')
const AdminController = require('./controller/AdminController')
const IndexController = require('./controller/IndexController');
const pagamentoController = require('./controller/PagamentoController');
// const Pagamento = require('./model/Pagamento.js');
const app = express()

app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
app.use(session({secret: 'udjs93ka0', resave: true, saveUninitialized: true}));

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
