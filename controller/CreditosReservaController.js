
const DAOCreditosReserva = require('../database/DAOCreditosReserva');
const CreditosReservaService = require('../services/CreditosReservaService');
const DAOReserva = require('../database/DAOReserva');
const creditosReservaService = new CreditosReservaService();

class CreditosReservaController {

    constructor() {
        this.creditosReservaService = new CreditosReservaService();
    }

    async listarPorCliente(req, res) {
    }

    async aplicarCredito(req, res) {
    }

    async detalhar(req, res) {
    }

    async postCriarCreditoReserva(req, res) {
        // Reserva decide se pode ou não criar crédito, então não tem autorização de cliente aqui, só o ID da reserva para criar o crédito
        // Crédito executa como criar o crédito, atualiza a reserva para cancelada com crédito e registra o motivo do cancelamento como cliente

        const { reservaId } = req.body;
        try {
            const dadosView = await this.creditosReservaService.criarCreditoReserva(reservaId);
            res.status(201).json(dadosView);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async putMarcarComoUtilizado(req, res) {
        try {
            const { reservaId } = req.params;
            await creditosReservaService.marcarComoUtilizado(reservaId);
            res.status(200).json({ message: 'Crédito marcado como utilizado com sucesso.' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = CreditosReservaController;