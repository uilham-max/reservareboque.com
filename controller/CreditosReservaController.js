const CreditosReservaService = require('../services/CreditosReservaService');
var { clienteNome } = require('../helpers/getSessionNome')


class CreditosReservaController {

    constructor() {
        this.creditosReservaService = new CreditosReservaService();
    }

    async getCriarCreditoReserva(req, res) {
        const idReserva = req.params.idReserva;
        try {
            const { credito, reserva } = await this.creditosReservaService.criarCreditoReserva(idReserva);
            return res.render('reserva/cliente/detalhe', { user: clienteNome(req, res), mensagem: 'Crédito de reserva gerado com sucesso.', reserva: reserva, credito: credito});
        } catch (error) {
            console.error(error);
            return res.render('erro', { mensagem: 'Erro ao gerar crédito para a reserva.' });
        }
    }

    async getUsarCreditoReserva(req, res) {
        const idReserva = req.params.idReserva;
        try {
            const { credito, reserva } = await this.creditosReservaService.usarCreditoReserva(idReserva);
            return res.render('reserva/cliente/detalhe', { user: clienteNome(req, res), mensagem: 'Crédito de reserva aplicado com sucesso.', reserva: reserva, credito: credito});
        } catch (error) {
            console.error(error);
            return res.render('erro', { mensagem: 'Erro ao aplicar crédito para a reserva'});
        }
    }


}

module.exports = CreditosReservaController;