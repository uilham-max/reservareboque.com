const express = require('express')
const router = express.Router()
const autorizacao = require('../autorizacao/autorizacao')

const AdminController = require('../controller/AdminController')

router.get('/novo', autorizacao, AdminController.getNovo)
router.post('/novo', autorizacao, AdminController.postNovo)
router.get('/entrar', AdminController.getEntrar)
router.post('/entrar', AdminController.postEntrar)
router.get('/sair', autorizacao, AdminController.getSair)

module.exports = router