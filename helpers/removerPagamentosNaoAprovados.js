const DAOPagamento = require('../database/DAOPagamento');
const DAOReserva = require('../database/DAOReserva');
const cron = require('node-cron');
const { deleteCobranca } = require('./API_Pagamentos');
const moment = require('moment-timezone');

const cancelaReservaEPagamento = async (codigoPagamento) => {
    await DAOPagamento.atualizaSituacaoParaCancelado(codigoPagamento)
    await DAOReserva.atualizaSituacaoParaCancelada(codigoPagamento)
}

const removerPagamentosAPI = async () => {
    try {
        let lista = await DAOPagamento.listaPagamentosComPrazoExpirado()
        lista.forEach(element => {
            deleteCobranca(element.dataValues.codigoPagamento)
            cancelaReservaEPagamento(element.dataValues.codigoPagamento)
        });
    } catch(erro) {
        console.error(erro.toString());
    }
}

// Agendar a execução da função a cada 30 minutos
cron.schedule('*/1 * * * *', async () => {
    console.log("Removendo reservas que não foram pagas...", /*moment.tz(new Date(), 'America/Sao_Paulo')*/);
    await removerPagamentosAPI()
});

module.exports = {removerPagamentosAPI}
