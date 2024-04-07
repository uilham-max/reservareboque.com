const DAOPagamento = require('../database/DAOPagamento');
const cron = require('node-cron');

const removerPagamentosNaoAprovados = async () => {
    try {
        // Consultar todos os pagamentos não aprovados
        const pagamentosNaoAprovados = await DAOPagamento.getAllPagamentosFalse()

        // Para cada pagamento não aprovado, remover a reserva associada
        for (const pagamento of pagamentosNaoAprovados) {

            // Remover o pagamento não aprovado
            await DAOPagamento.delete(pagamento.id)
        }

        // console.log('Pagamentos não aprovados e suas reservas associadas removidos com sucesso.');
    } catch (error) {
        console.error('Erro ao remover pagamentos não aprovados e suas reservas associadas:', error);
    }
}



// Agendar a execução da função a cada 30 minutos
cron.schedule('*/1 * * * *', async () => {
    // console.log('Executando função para remover pagamentos não aprovados e suas reservas associadas...');
    await removerPagamentosNaoAprovados()
});
