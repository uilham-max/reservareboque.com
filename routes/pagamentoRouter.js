const express = require('express')
const router = express.Router()

const PagamentoController = require('../controller/PagamentoController')

router.post('/webhook/pix', PagamentoController.postAprovarPagamento)
router.get('/aprovado/:codigoPagamento', PagamentoController.getPagamentoAprovado)


module.exports = router