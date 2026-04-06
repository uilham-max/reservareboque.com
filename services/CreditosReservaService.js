const DAOCreditosReserva = require('../database/DAOCreditosReserva');
const ReservaService = require('./ReservaService');
const sequelize = require('../database/conexao');

class CreditosReservaService {

    constructor() {
        this.daoCreditosReserva = new DAOCreditosReserva();
        this.reservaService = new ReservaService();
    }

    async criarCreditoReserva(idReserva) {
        const t = await sequelize.transaction();
        try {

            const reservaAtualizada = await this.reservaService.cancelarComCredito(idReserva, { transaction: t });
            const novoCredito = await this.daoCreditosReserva.novoCreditoReserva(idReserva, reservaAtualizada.clienteCpf, reservaAtualizada.diarias, { transaction: t });

            await t.commit();
            return { credito: novoCredito, reserva: reservaAtualizada };

        } catch (error) {
            await t.rollback();
            console.error(error.message);
            throw new Error('CreditosReservaService não pode criar crédito.\n' + error.message);
        }
    }

    async marcarComoUtilizado(reservaId) {
        try {
            await this.daoCreditosReserva.marcarComoUtilizado(reservaId);
            return { message: 'Crédito marcado como utilizado com sucesso.' };
        } catch (error) {
            throw new Error('Erro ao marcar crédito como utilizado.');
        }
    }
}

module.exports = CreditosReservaService;