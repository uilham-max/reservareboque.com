
const sequelize = require('../database/conexao');
const DAOReserva = require('../database/DAOReserva');
const { SituacaoReserva, MotivoCancelamento } = require('../helpers/enums');

class ReservaService {

    constructor(daoReserva, creditosReservaService) {
        this.creditosReservaService = creditosReservaService;
        this.daoReserva = daoReserva;
    }

    async novoCreditoReserva(reservaId) {
        const t = await sequelize.transaction();
        try {
            
            const reserva = await DAOReserva.getOne(
                reservaId
            );
            
            this.podeGerarCredito(
                reserva
            )

            const novoCredito = await this.creditosReservaService.criarCreditoReserva(
                reservaId, 
                reserva.clienteCpf, 
                reserva.diarias,
                { transaction: t }
            );

            await DAOReserva.atualizaSituacao(
                reservaId, 
                SituacaoReserva.CANCELADO_COM_CREDITO,
                { transaction: t }
            );
            
            await this.daoReserva.registrarMotivoCancelamento(
                reservaId, 
                MotivoCancelamento.CLIENTE,
                { transaction: t }
            );

            await t.commit();
            
            const reservaAtualizada = await DAOReserva.getOne(
                reservaId
            );
            
            return { 
                credito: novoCredito, 
                reserva: reservaAtualizada 
            };
        } catch (error) {
            await t.rollback();
            throw new Error('Serviço de reserva não pode gerar crédito.\n' + error.message);
        }
    }

    podeGerarCredito(reserva) {

        if (!reserva) {
            throw new Error('Reserva inválida');
        }

        if (reserva.situacaoReserva === SituacaoReserva.CANCELADO_COM_CREDITO) {
            throw new Error('Reserva já possui crédito gerado');
        }

        if (reserva.situacaoReserva !== SituacaoReserva.APROVADO) {
            throw new Error('Reserva não está aprovada');
        }

        // 🔥 aqui entra a regra das 24h depois
    }

}

module.exports = ReservaService;
    