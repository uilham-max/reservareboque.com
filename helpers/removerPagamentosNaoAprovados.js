const DAOPagamento = require('../database/DAOPagamento');
const cron = require('node-cron');
const { deleteCobranca } = require('./API_Pagamentos');

const removerPagamentosAPI = async () => {
    try {
        const lista = await DAOPagamento.listaPagamentosComPrazoExpirado()
        lista.forEach(element => {
            // REMOVE PAGAMENTOS EXTERNOS
            deleteCobranca(element.dataValues.codigoPagamento)
            // REMOVE PAGAMENTOS INTERNOS
            DAOPagamento.removePeloCodigoPagamento(element.dataValues.codigoPagamento)
        });
    } catch(erro) {
        console.error(erro.toString());
    }
}

// Agendar a execução da função a cada 30 minutos
cron.schedule('*/3 * * * *', async () => {
    await removerPagamentosAPI()
});

module.exports = {removerPagamentosAPI}
