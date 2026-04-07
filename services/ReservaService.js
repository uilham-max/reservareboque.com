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
            return reservaAtualizada;

        } catch (error) {
            console.error(error.message);
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
    