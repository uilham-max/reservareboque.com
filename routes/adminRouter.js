const express = require('express')
const router = express.Router()

const AdminController = require('../controller/AdminController')
const autorizacao = require('../autorizacao/autorizacao')

router.get('/cadastro', autorizacao, AdminController.getCadastro)
router.post('/cadastro', autorizacao, AdminController.postCadastro)
router.get('/login', AdminController.getLogin)
router.post('/login', AdminController.postLogin)
router.get('/logout', autorizacao, AdminController.getLogout)

module.exports = router