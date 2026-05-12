const DAOCreditosReserva = require('../database/DAOCreditosReserva');
const ReservaService = require('./ReservaService');
const sequelize = require('../database/conexao');
const { SituacaoReserva } = require('../enums');

class CreditosReservaService {

    constructor() {
        this.daoCreditosReserva = new DAOCreditosReserva();
        this.reservaService = new ReservaService();
    }

    async criarCreditoReserva(idReserva) {
        const t = await sequelize.transaction();
        try {

            const creditoExistente = await this.daoCreditosReserva.getByReservaId(idReserva);
            let credito, reservaAtualizada;
            if (creditoExistente) {
                // ativa crédito existente
                console.log("Tentando ativar crédito existente.");
                credito = await this.daoCreditosReserva.alternarUtilizacaoParaFalso(idReserva, { transaction: t });
                reservaAtualizada = await this.reservaService.cancelaComCreditoReservaExistente(idReserva, { transaction: t });
                console.log("Ativando reserva com crédito existente para APROVADO.");
            } else {
                // cria novo crédito
                console.log("Tentando criar novo crédito para reserva.");
                reservaAtualizada = await this.reservaService.cancelarComCredito(idReserva, { transaction: t });
                credito = await this.daoCreditosReserva.novoCreditoReserva(idReserva, reservaAtualizada.clienteCpf, reservaAtualizada.diarias, { transaction: t });
            }
            
            await t.commit();
            console.log("Reserva atualizada com sucesso.");
            return { credito, reserva: reservaAtualizada };
        } catch (error) {
            await t.rollback();
            console.log('CreditosReservaService não pode criar crédito.', error);
            throw new Error('CreditosReservaService não pode criar crédito.');
        }
    }

    async usarCreditoReserva(reservaId) {
        const t = await sequelize.transaction();
        try {
            const credito = await this.daoCreditosReserva.usar(reservaId, { transaction: t });
            const {reservaAtualizada, mensagem} = await this.reservaService.aplicarCredito(reservaId, { transaction: t });
            if (mensagem !== '') {
                await t.rollback();
                return { credito: credito, reserva: reservaAtualizada, mensagem };
            }
            await this.reservaService.registrarMotivoCancelamento(reservaId, null, { transaction: t });
            
            await t.commit();
            mensagem = 'Crédito de reserva aplicado com sucesso.';
            return { credito, reserva: reservaAtualizada, mensagem };
        } catch (error) {
            await t.rollback();
            console.error('O serviço não pode usar crédito.', error);
            throw new Error('O serviço não pode usar o crédito.');
        }
    }
}

module.exports = CreditosReservaService;