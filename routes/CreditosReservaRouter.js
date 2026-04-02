const CreditosReservaController = require('../controller/CreditosReservaController');
const express = require('express');
const router = express.Router();
const clienteAutorizacao = require('../autorizacao/clienteAutorizacao');

const controller = new CreditosReservaController();

router.get('/cliente/:cpf', controller.listarPorCliente);
router.post('/:id/aplicar', controller.aplicarCredito);
router.get('/:id', controller.detalhar);
router.post('/criar', controller.postCriarCreditoReserva);
router.put('/marcar-utilizado/:reservaId', clienteAutorizacao, controller.putMarcarComoUtilizado);

module.exports = router;