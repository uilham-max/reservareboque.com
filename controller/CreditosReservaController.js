
const DAOCreditosReserva = require('../database/DAOCreditosReserva');
const { SituacaoReserva, motivoCancelamento } = require('../helpers/enums');
const DAOReserva = require('../database/DAOReserva');

class CreditosReservaController {

    static async teste(req, res) {
        res.status(200).json({ message: 'Teste de rota para créditos de reserva funcionando!' });
    }

    static async criarCreditoReserva(req, res) {
        try {
            const { reservaId, clienteCpf, diarias } = req.body;
            const creditos = diarias;
            console.log('Criando crédito de reserva com os seguintes dados:', { reservaId, clienteCpf, creditos });
            const novoCredito = await DAOCreditosReserva.criarCreditoReserva(reservaId, clienteCpf, creditos);
            
            await DAOReserva.atualizaSituacao(reservaId, SituacaoReserva.CANCELADO_COM_CREDITO);
            await DAOReserva.registrarMotivoCancelamento(reservaId, motivoCancelamento.CREDITO);
            
            res.status(201).json(novoCredito);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async marcarComoUtilizado(req, res) {
        try {
            const { reservaId } = req.params;
            await DAOCreditosReserva.marcarComoUtilizado(reservaId);
            res.status(200).json({ message: 'Crédito marcado como utilizado com sucesso.' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = CreditosReservaController;