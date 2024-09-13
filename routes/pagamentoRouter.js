const express = require('express')
const router = express.Router()

const PagamentoController = require('../controller/PagamentoController')

router.post('/webhook/pix', PagamentoController.postWebHookPixRecebido)
router.get('/aprovado/:codigoPagamento', PagamentoController.getPagamentoVerificaStatus)


module.exports = router