const DAOPagamento = require('../database/DAOPagamento');
const DAOReserva = require('../database/DAOReserva');
const cron = require('node-cron');
const { deleteCobranca } = require('./API_Pagamentos');
const moment = require('moment-timezone');
const { SituacaoReserva } = require('../enums');
const { th } = require('date-fns/locale/th');

const cancelaReservaEPagamento = async (codigoPagamento) => {
    await DAOPagamento.atualizaSituacaoParaCancelado(codigoPagamento)
    let reservas = await DAOReserva.getOneByPagamentoCodigoPagamento(codigoPagamento) 
    await DAOReserva.atualizaSituacao(reservas[0].id, SituacaoReserva.CANCELADO)
}

const removerPagamentosAPI = async () => {
    try {
        let lista = await DAOPagamento.listaPagamentosComPrazoExpirado()
        if (lista && lista.length > 0) {
            lista.forEach(element => {
                deleteCobranca(element.dataValues.codigoPagamento)
                cancelaReservaEPagamento(element.dataValues.codigoPagamento)
            });
        }
    } catch(erro) {
        console.error("Erro ao executar scheduler de remoção de pagamentos não aprovados", erro.toString());
        throw new Error("Erro ao executar scheduler de remoção de pagamentos não aprovados: " + erro.toString());
    }
}

// Agendar a execução da função a cada 30 minutos
cron.schedule('*/60 * * * *', async () => {
    console.log(`[${new Date().toLocaleTimeString()}] Removendo reservas não pagas...` /*moment.tz(new Date(), 'America/Sao_Paulo')*/);
    await removerPagamentosAPI()
});

module.exports = {removerPagamentosAPI}
