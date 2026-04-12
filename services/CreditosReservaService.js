const DAOCreditosReserva = require('../database/DAOCreditosReserva');
const ReservaService = require('./ReservaService');
const sequelize = require('../database/conexao');
const DAOReserva = require('../database/DAOReserva');
const { SituacaoReserva } = require('../enums');
const { logger } = require('sequelize/lib/utils/logger');

class CreditosReservaService {

    constructor() {
        const daoReserva = new DAOReserva();
        this.daoCreditosReserva = new DAOCreditosReserva();
        this.reservaService = new ReservaService(daoReserva);
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
                console.log("Reserva com crédito existente atualizada para APROVADO com sucesso.");
            } else {
                // cria novo crédito
                console.log("Tentando criar novo crédito para reserva.");
                reservaAtualizada = await this.reservaService.cancelarComCredito(idReserva, { transaction: t });
                credito = await this.daoCreditosReserva.novoCreditoReserva(idReserva, reservaAtualizada.clienteCpf, reservaAtualizada.diarias, { transaction: t });
            }
            
            await t.commit();
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
            const reservaAtualizada = await this.reservaService.aplicarCredito(reservaId, { transaction: t });
            await this.reservaService.registrarMotivoCancelamento(reservaId, null, { transaction: t });

            await t.commit();
            return { credito, reserva: reservaAtualizada };
        } catch (error) {
            await t.rollback();
            console.error('O serviço não pode usar crédito.', error);
            throw new Error('O serviço não pode usar o crédito.');
        }
    }
}

module.exports = CreditosReservaService;