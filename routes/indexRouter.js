const express = require('express')
const router = express.Router()
const IndexController = require('../controller/IndexController')
router.get('/', IndexController.getIndex)
router.post('/financeiro', IndexController.postSalvarLocalizacao)
router.get('/financeiro', IndexController.getSalvarLocalizacao)
module.exports = router