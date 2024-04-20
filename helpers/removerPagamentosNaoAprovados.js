const DAOPagamento = require('../database/DAOPagamento');
const cron = require('node-cron');

const removerPagamentosNaoAprovados = async () => {
    try {
        // Remover pagamentos sem pagamento no prazo indicado
        await DAOPagamento.removePagamentoComPrazoExpirado()
    } catch (error) {
        console.error('Erro ao remover pagamentos não aprovados e suas reservas associadas:', error);
    }
}

// Agendar a execução da função a cada 30 minutos
cron.schedule('*/10 * * * *', async () => {
    // console.log('Executando função para remover pagamentos não aprovados e suas reservas associadas...');
    await removerPagamentosNaoAprovados()
});
