const { SituacaoReserva, MotivoCancelamento } = require('../enums');
const DAOReserva = require('../database/DAOReserva');

class ReservaService {

    constructor() {
        this.daoReserva = new DAOReserva();
    }

    async cancelarComCredito(reservaId, options = {}) {
        try {

            const reserva = await this.daoReserva.getOne(reservaId);
            this.podeGerarCredito(reserva);
            await this.daoReserva.atualizaSituacao(reservaId, SituacaoReserva.CANCELADO_COM_CREDITO, options);
            await this.daoReserva.registrarMotivoCancelamento(reservaId, MotivoCancelamento.CLIENTE, options);
            const reservaAtualizada = await this.daoReserva.getOne(reservaId);
            return reservaAtualizada;

        } catch (error) {
            console.error(error);
            throw new Error('Serviço de reserva não pode gerar crédito.');
        }
    }

    async aplicarCredito(reservaId, options = {}) {
        try {
            let mensagem = '';
            const reserva = await this.daoReserva.getOne(reservaId);
            const disponibilidade = await this.daoReserva.getVerificaDisponibilidade(reserva.reboquePlaca, reserva.dataSaida, reserva.dataChegada, options);
            if (disponibilidade.length > 0) {
                mensagem = 'ERRO: Não é possível ativar a reserva, pois o período não está mais disponível';
                return { reserva, mensagem };
            }
            await this.podeAplicarCredito(reserva, options);
            await this.daoReserva.atualizaSituacao(reservaId, SituacaoReserva.APROVADO, options);
            const reservaAtualizada = await this.daoReserva.getOne(reservaId);
            return {reservaAtualizada, mensagem};
        } catch (error) {
            console.error(error);
            throw new Error('Serviço de reserva não pode aplicar crédito.');
        }
    }

    async registrarMotivoCancelamento(reservaId, motivo, options = {}) {
        try {
            await this.daoReserva.registrarMotivoCancelamento(reservaId, motivo, options);
        } catch (error) {
            console.error('Serviço de reserva não pode registrar motivo de cancelamento.', error);
            throw new Error('Serviço de reserva não pode registrar motivo de cancelamento.');
        }
    }

    async cancelaComCreditoReservaExistente(reservaId, options = {}) {
        try {
            const reserva = await this.daoReserva.getOne(reservaId);
            this.podeGerarCredito(reserva);
            await this.daoReserva.atualizaSituacao(reservaId, SituacaoReserva.CANCELADO_COM_CREDITO, options);  
            await this.daoReserva.registrarMotivoCancelamento(reservaId, MotivoCancelamento.CLIENTE, options);
            const reservaAtualizada = await this.daoReserva.getOne(reservaId);
            console.log("Reserva atualizada para CANCELADO_COM_CREDITO com sucesso.");
            return reservaAtualizada;
        } catch (error) {
            console.error('Serviço de reserva não pode ativar crédito existente.', error);
            throw new Error('Serviço de reserva não pode ativar crédito existente.');
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

    async podeAplicarCredito(reserva, options = {}) {

        if (reserva === undefined || reserva === null) {
            throw new Error('Reserva inválida');
        }

    }

}

module.exports = ReservaService;
    