const { SituacaoReserva, MotivoCancelamento } = require('../enums');

class ReservaService {

    constructor(daoReserva) {
        this.daoReserva = daoReserva;
    }

    async cancelarComCredito(reservaId, options = {}) {
        try {

            const reserva = await this.daoReserva.getOne(reservaId);
            this.podeGerarCredito(reserva);
            await this.daoReserva.atualizaSituacao(reservaId, SituacaoReserva.CANCELADO_COM_CREDITO, options);
            await this.daoReserva.registrarMotivoCancelamento(reservaId, MotivoCancelamento.CLIENTE, options);
            const reservaAtualizada = await this.daoReserva.getOne(reservaId);
            console.log("Reserva atualizada com sucesso.");
            return reservaAtualizada;

        } catch (error) {
            console.error(error);
            throw new Error('Serviço de reserva não pode gerar crédito.');
        }
    }

    async aplicarCredito(reservaId, options = {}) {
        try {
            await this.daoReserva.atualizaSituacao(reservaId, SituacaoReserva.APROVADO, options);
            const reservaAtualizada = await this.daoReserva.getOne(reservaId);
            return reservaAtualizada;
        } catch (error) {
            console.error(error);
            throw new Error('Serviço de reserva não pode aplicar crédito.');
        }
    }

    async atualizaSituacao(reservaId, novaSituacao, options = {}) {
        console.log("Atualizando situação da reserva para", novaSituacao);
        try {
            await this.daoReserva.atualizaSituacao(reservaId, novaSituacao, options);   
            const reservaAtualizada = await this.daoReserva.getOne(reservaId);
            console.log(`Reserva ${reservaId} atualizada para ${novaSituacao} com sucesso.`);
            return reservaAtualizada;
        } catch (error) {
            console.error('Serviço de reserva não pode atualizar situação.', error);
            throw new Error('Serviço de reserva não pode atualizar situação.');
        }
    }

    async getOne(reservaId) {
        try {
            const reserva = await this.daoReserva.getOne(reservaId);    
            return reserva;
        } catch (error) {
            console.error('Serviço de reserva não pode buscar reserva por id.', error);
            throw new Error('Serviço de reserva não pode buscar reserva por id.');
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

}

module.exports = ReservaService;
    