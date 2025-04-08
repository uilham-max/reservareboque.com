const express = require('express')
const router = express.Router()
const autorizacao = require('../autorizacao/autorizacao')
const clienteAutorizacao = require('../autorizacao/clienteAutorizacao')

const ReservaController = require('../controller/ReservaController')


router.get('/cliente/periodo/:reboquePlaca?', ReservaController.getClienteInformaPeriodo)
router.post('/cliente/formulario', ReservaController.postClienteFormularioReserva)
router.post('/cliente/confirmar', ReservaController.postClienteConfirmaDadosFormularioReserva)
router.post('/cliente/qrcode', ReservaController.postGerarQRCode)
router.get('/cliente/sucesso', ReservaController.getDirecionaClienteParaSucesso)


router.get('/admin/painel', autorizacao, ReservaController.getAdminPainel);
router.post('/admin/pagamento/dinheiro', autorizacao, ReservaController.postAdminAprovaPagamentoEmDinheiro)
router.get('/admin/situacao/:idReserva?/:situacao?', autorizacao, ReservaController.getAdminSituacaoReserva)


router.get('/cliente/lista', clienteAutorizacao, ReservaController.getClienteListarReservas)
router.get('/cliente/detalhe/:reservaId?', clienteAutorizacao, ReservaController.getClienteDetalharReserva)
router.get('/cliente/editar/:idReserva', clienteAutorizacao, ReservaController.getClienteEditarReserva)
router.post('/cliente/editar', clienteAutorizacao, ReservaController.postClienteEditarReserva);
router.get('/cliente/concluido', clienteAutorizacao, ReservaController.getClienteListarReservasConcluidas)


router.get('/admin/historico', autorizacao, ReservaController.getHistoricoReserva)
router.post('/admin/historico', autorizacao, ReservaController.postHistoricoReservas)
router.get('/admin/receita', autorizacao, ReservaController.getReceitaPeriodo)
router.post('/admin/receita', autorizacao, ReservaController.postReceitaPeriodo)

router.get('/admin/editar/:reservaId', autorizacao, ReservaController.getReservaAdminEditar)
router.post('/admin/editar', autorizacao, ReservaController.postReservaAdminEditar)
router.get('/admin/cancelar/:codigoPagamento', autorizacao, ReservaController.getReservaAdminCancelar)
//router.post('/admin/adiar', autorizacao, ReservaController.postReservaAdminAdiar)
router.get('/admin/lista', autorizacao, ReservaController.getReservaAdminLista)


module.exports = router