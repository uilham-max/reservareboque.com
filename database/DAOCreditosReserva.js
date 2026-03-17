const CreditosReserva = require('../model/CreditosReserva');

class DAOCreditosReserva {
    static async criarCreditoReserva(reservaId, clienteCpf, creditos) {
        try {
            const novoCredito = await CreditosReserva.create({
                reservaId,
                clienteCpf,
                creditos,
                utilizado: false
            });
            return novoCredito;
        } catch (error) {
            console.error('Erro ao criar crédito de reserva:', error);
            throw error;
        }
    }

    static async marcarComoUtilizado(reservaId) {
        try {
            const credito = await CreditosReserva.findOne({ where: { reservaId } });
            if (credito) {
                credito.utilizado = true;
                await credito.save();
            }
        } catch (error) {
            console.error('Erro ao marcar crédito como utilizado:', error);
            throw error;
        }
    }
}

module.exports = DAOCreditosReserva;