const express = require('express')
const router = express.Router()
const autorizacao = require('../autorizacao/autorizacao')
const clienteAutorizacao = require('../autorizacao/clienteAutorizacao')

const ClienteController = require('../controller/ClienteController')

router.get('/novo', ClienteController.getNovo)
router.post('/novo', ClienteController.postNovo)
router.get('/entrar', ClienteController.getEntrar)
router.post('/entrar', ClienteController.postEntrar)
router.get('/sair', clienteAutorizacao, ClienteController.getSair)
router.get('/existe/:cpf?', ClienteController.getExiste)
router.get('/lista', autorizacao, ClienteController.getLista)

module.exports = router