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
            return res.redirect(`/reserva/cliente/detalhe/${idReserva}?mensagem=${encodeURIComponent('Reserva com estado EM ESPERA.')}`);
        } catch (error) {
            console.error(error);
            return res.render('erro', { mensagem: 'Erro ao gerar crédito para a reserva.' });
        }
    }

    async getUsarCreditoReserva(req, res) {
        const idReserva = req.params.idReserva;
        try {
            const { credito, reserva, mensagem } = await this.creditosReservaService.usarCreditoReserva(idReserva);
            return res.redirect(`/reserva/cliente/detalhe/${idReserva}?mensagem=${encodeURIComponent(mensagem)}`);
        } catch (error) {
            console.error(error);
            return res.render('erro', { mensagem: 'Erro ao aplicar crédito para a reserva'});
        }
    }


}

module.exports = CreditosReservaController;