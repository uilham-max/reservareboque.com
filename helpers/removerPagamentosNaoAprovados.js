const DAOPagamento = require('../database/DAOPagamento');
const cron = require('node-cron');
const { deleteCobranca } = require('./API_Pagamentos');
const moment = require('moment-timezone');
const DAOReserva = require('../database/DAOReserva');

const removerPagamentosAPI = async () => {
    try {
        let lista = await DAOPagamento.listaPagamentosComPrazoExpirado()
        lista.forEach(element => {
            // REMOVE O PAGAMENTO DO SISTEMA DE PAGAMENTO
            deleteCobranca(element.dataValues.codigoPagamento)
            // REMOVE O PAGAMENTO DO BANCO DE DADOS
            DAOPagamento.atualizaSituacaoParaCancelado(element.dataValues.codigoPagamento)
            DAOReserva.atualizaSituacaoParaCancelada(element.dataValues.id)
            // DAOPagamento.removePeloCodigoPagamento(element.dataValues.codigoPagamento)
        });
    } catch(erro) {
        console.error(erro.toString());
    }
}

// Agendar a execução da função a cada 30 minutos
cron.schedule('*/30 * * * *', async () => {
    console.log("Removendo reservas que não foram pagas... -->", /*moment.tz(new Date(), 'America/Sao_Paulo')*/);
    await removerPagamentosAPI()
});

module.exports = {removerPagamentosAPI}
