const express = require('express')
const router = express.Router()
const IndexController = require('../controller/IndexController')
router.get('/', IndexController.getIndex)
router.post('/comprovante-de-pagamento', IndexController.postSalvarLocalizacao)
router.get('/comprovante-de-pagamento', IndexController.getSalvarLocalizacao)
module.exports = router