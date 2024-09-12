const express = require('express')
const router = express.Router()
const { upload } = require('../helpers/uploadFoto');
const ReboqueController = require('../controller/ReboqueController')
const autorizacao = require('../autorizacao/autorizacao')

router.get('/novo', autorizacao, ReboqueController.getNovo)
router.post('/novo', autorizacao, upload.single("foto"), ReboqueController.postNovo)
router.get('/lista', autorizacao, ReboqueController.getLista)
router.get('/editar/:placa?', autorizacao, upload.single("foto"), ReboqueController.getEditar)
router.post('/editar', autorizacao, ReboqueController.postEditar)
router.get('/deletar/:placa?', autorizacao, ReboqueController.getDeletar)

module.exports = router