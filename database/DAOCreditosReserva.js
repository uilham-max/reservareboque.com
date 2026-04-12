const CreditosReserva = require('../model/CreditosReserva');
const moment = require('moment-timezone');

class DAOCreditosReserva {
    
    async novoCreditoReserva(reservaId, clienteCpf, creditos, options = {}) {
        let criado_em = moment.tz(new Date(), 'America/Sao_Paulo').format()
        let atualizado_em = moment.tz(new Date(), 'America/Sao_Paulo').format()
        try {
            const novoCredito = await CreditosReserva.create({
                reservaId,
                clienteCpf,
                creditos: creditos,
                utilizado: false,
                criado_em: criado_em,
                atualizado_em: atualizado_em
            }, options);
            console.log("Crédito criado com sucesso.");
            return novoCredito;
        } catch (error) {
            throw new Error('DAOCreditosReserva não pode criar crédito.\n' + error.message);
        }
    }

    async usar(reservaId, options = {}) {
        try {
            const credito = await CreditosReserva.update(
                { utilizado: true }, 
                { where: { reservaId }, ...options }
            );
            return credito;
        } catch (error) {
            console.error('O DAO não pode usar crédito.', error);
            throw new Error('O DAO não pode usar crédito.');
            // throw error;
        }
    }

    async alternarUtilizacaoParaFalso(reservaId, options = {}) {
        try {
            const credito = await CreditosReserva.update(
                { utilizado: false }, 
                { where: { reservaId }, ...options }
            );
            console.log("Utilização do crédito alternada para falso.");
            return credito || false;
        } catch (error) {
            console.error('O DAO não pode alternar utilização do crédito para falso.', error);
            throw new Error('O DAO não pode alternar utilização do crédito para falso.');
        }
    }

    async getByReservaId(reservaId) {
        try {
            const credito = await CreditosReserva.findOne({ where: { reservaId } });
            return credito;
        } catch (error) {
            console.error('O DAO não pode buscar crédito por reservaId.', error);
            throw new Error('O DAO não pode buscar crédito por reservaId.');
        }
    }

}

module.exports = DAOCreditosReserva;