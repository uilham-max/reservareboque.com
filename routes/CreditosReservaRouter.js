const CreditosReservaController = require('../controller/CreditosReservaController');
const express = require('express');
const router = express.Router();
const clienteAutorizacao = require('../autorizacao/clienteAutorizacao');

router.get('/teste', CreditosReservaController.teste);
router.post('/criar', CreditosReservaController.criarCreditoReserva);
// router.post('/criar', clienteAutorizacao, CreditosReservaController.criarCreditoReserva);
router.put('/marcar-utilizado/:reservaId', clienteAutorizacao, CreditosReservaController.marcarComoUtilizado);


module.exports = router;