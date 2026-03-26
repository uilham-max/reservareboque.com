const CreditosReserva = require('../model/CreditosReserva');

class DAOCreditosReserva {
    static async criarCreditoReserva(reservaId, clienteCpf, creditos) {
        let criado_em = moment.tz(new Date(), 'America/Sao_Paulo').format()
        let atualizado_em = moment.tz(new Date(), 'America/Sao_Paulo').format()
        try {
            const novoCredito = await CreditosReserva.create({
                reservaId,
                clienteCpf,
                creditos,
                utilizado: false,
                criado_em: criado_em,
                atualizado_em: atualizado_em
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