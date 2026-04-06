const express = require('express');
const router = express.Router();
const clienteAutorizacao = require('../autorizacao/clienteAutorizacao');

const CreditosReservaController = require('../controller/CreditosReservaController');
const creditosReservacontroller = new CreditosReservaController();

router.get('/:idReserva/criar', clienteAutorizacao, creditosReservacontroller.getCriarCreditoReserva.bind(creditosReservacontroller));

module.exports = router;