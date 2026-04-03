const CreditosReserva = require('../model/CreditosReserva');
const moment = require('moment-timezone');

class DAOCreditosReserva {
    async criarCreditoReserva(reservaId, clienteCpf, creditos) {
        let criado_em = moment.tz(new Date(), 'America/Sao_Paulo').format()
        let atualizado_em = moment.tz(new Date(), 'America/Sao_Paulo').format()
        try {
            const novoCredito = await CreditosReserva.create({
                reservaId,
                clienteCpf,
                creditos: creditos,
                utilizado: false,
                criado_em: criado_em,
                atualizado_em: atualizado_em
            });
            return novoCredito;
        } catch (error) {
            throw new Error('DAOCreditosReserva não pode criar crédito.\n' + error.message);
        }
    }

    async marcarComoUtilizado(reservaId) {
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