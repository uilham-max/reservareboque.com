const DAOCreditosReserva = require('../database/DAOCreditosReserva');

class CreditosReservaService {

    // constructor(daoCreditosReserva) {
    //     this.daoCreditosReserva = daoCreditosReserva;
    // }

    constructor() {
        this.daoCreditosReserva = new DAOCreditosReserva();
    }

    async criarCreditoReserva(reservaId, clienteCpf, diarias) {
        try {
            if (!reservaId || !clienteCpf || diarias == null) {
                throw new Error('Parâmetros inválidos para criação de crédito.');
            }
            const creditos = diarias;

            console.log('Criando crédito de reserva:', { reservaId, clienteCpf, creditos });

            const novoCredito = await this.daoCreditosReserva.criarCreditoReserva(reservaId, clienteCpf, creditos);
            return novoCredito;
        } catch (error) {
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