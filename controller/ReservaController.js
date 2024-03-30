const express = require('express')
const routerReserva = express.Router()
const DAOReserva = require('../database/DAOReserva')
const DAOCliente = require('../database/DAOCliente')
const DAOReboque = require('../database/DAOReboque')
const autorizacao = require('../autorizacao/autorizacao')



// TELA ONDE É ESCOLHIDO O PERÍODO DA RESERVA
routerReserva.get('/reserva/periodo/:id?/:mensagem?', (req, res) => {
    let user = 'User'
    if(req.session.cliente && req.session.cliente.nome){
        user = req.session.cliente.nome
    }
    id = req.params.id
    DAOReserva.getAtivasPorID(id).then(reservas => {
        console.log("ID da reserva: "+reservas);

        DAOReboque.getOne(id).then(reboque => {
            if(reboque){
                res.render('reserva/periodo', {user: user, mensagem: "", reboque: reboque, reservas: reservas})
            } else {
                res.render('erro', {mensagem: "Erro ao mostrar reboque."})
            }
        })
    })
})



// CRIAR GET
routerReserva.get('/reserva/novo', autorizacao, (req, res) => {
    DAOReboque.getAll().then(reboques => {
        DAOCliente.getAll().then(clientes => {
            if(reboques.length != 0 && clientes.length != 0){
                res.render('reserva/novo', {mensagem: "", reboques: reboques, clientes: clientes})
            } else {
                res.render('erro', {mensagem: "Lista de reboques ou clientes vazia."})
            }
        })
    })
})


// CRIAR POST
routerReserva.post('/reserva/salvar', autorizacao, (req, res) => {
    let {dataSaida, dataChegada, valorDiaria, cliente, reboque } = req.body
    DAOReserva.insert(dataSaida, dataChegada, valorDiaria, cliente, reboque).then(inserido => {
        DAOReboque.getAll().then(reboques => {
            DAOCliente.getAll().then(clientes => {
                if (inserido) {
                    res.render('reserva/novo', { mensagem: "Reserva inserido", reboques: reboques, clientes: clientes, inserido: inserido })
                }
                else {
                    res.render('reserva/novo', { mensagem: "Veículo indisponível para o período.", reboques: reboques, clientes: clientes, inserido: inserido })
                }
            })
        })
    })
})


// DELETAR 
routerReserva.get('/reserva/excluir/:id', autorizacao, (req, res) => {
    let id = req.params.id
    DAOReserva.delete(id).then(excluido =>{
        if(excluido){
            res.redirect('/reserva/lista')
        } else {
            res.render('erro', {mensagem: "Erro ao excluir"})
        }
    })
})

// ATUALIZAR GET
routerReserva.get('/reserva/editar/:id', autorizacao, (req, res) => {
    let id = req.params.id
    DAOReserva.getOne(id).then(reserva => {
        DAOReboque.getAll().then(reboques => {
            DAOCliente.getAll().then(clientes => {
                if(reserva){
                    res.render('reserva/editar', {reserva: reserva, reboques: reboques, clientes: clientes, mensagem: ""})
                } else {
                    res.render('erro', {mensagem: "Erro ao editar reserva."})
                }
            })
        })
    })
})

// ATUALIZAR POST
routerReserva.post('/reserva/atualizar', autorizacao, (req, res) => {
    let {id, dataSaida, dataChegada, valorDiaria, cliente, reboque} = req.body
    DAOReserva.update(id, dataSaida, dataChegada, valorDiaria, cliente, reboque).then(inserido => {
        if(inserido){
            res.redirect('/reserva/lista')
        } else {
            res.render('erro', { mensagem: "Erro ao atualizar." })
        }
    })
})

/** CONTROLADORES ENCARREGADOS DA PARTE DOS RELATÓRIOS */

// LISTAR GET
routerReserva.get('/reserva/lista/:mensagem?', autorizacao, (req, res) => {
    DAOReserva.getAtivas().then(reservas => {
        if (reservas) {
            res.render('reserva/reserva', { reservas: reservas, mensagem: req.params.mensagem ? "Erro! Item já referenciado" : "" })
        } else {
            res.render('erro', { mensagem: "Erro na listagem de reservas." })
        }
    })
})


// RELATORIO HISTORICO GET
routerReserva.get('/reserva/historico/:mensagem?',autorizacao,  (req, res) => {
    DAOReserva.getRelatorioHistorico().then(reservas => {
        if (reservas) {
            res.render('reserva/historico', { reservas: reservas, 
                mensagem: req.params.mensagem ? "Erro! Item já referenciado" : "" })
        } else {
            res.render('erro', { mensagem: "Erro na listagem do historico." })
        }
    })
})

// RELATORIO HISTORICO POST
routerReserva.post('/reserva/filtrarHistorico', autorizacao, (req, res) => {
    let {dataInicio, dataFim} = req.body
    DAOReserva.getRelatorioHistorico(dataInicio, dataFim).then(reservas => {
        if(reservas){
            res.render('reserva/historico', {reservas: reservas})
        } else {
            res.render('erro', {mensagem: "Erro ao filtrar."})
        }
    })
})

// RELATORIO LUCRO GET
routerReserva.get('/reserva/lucro/:mensagem?', autorizacao, async (req, res) => {
    let reservas = await DAOReserva.getRelatorioLucro()
    if(reservas){
        let lucroTotal = await DAOReserva.getLucroTotal()
        res.render('reserva/lucro', {lucroTotal: lucroTotal, reservas: reservas, mensagem: req.params.mensagem ? 
            "Não é possível excluir um reboque já referenciado por uma locação.":""})
    } else {
        res.render('erro', {mensagem: "Erro ao listar lucros."})
    }
})


routerReserva.post('/reserva/filtrar', autorizacao, async (req, res) => {
    let {dataInicio, dataFim} = req.body
    let reservas = await DAOReserva.getRelatorioLucro(dataInicio, dataFim)
    // console.log("Reservas relatorio lucro: ", reservas.map(reserva => reserva.toJSON()));
    if(reservas){
        let lucroTotal = await DAOReserva.getLucroTotal(dataInicio, dataFim)
        res.render('reserva/lucro', {lucroTotal: lucroTotal, reservas: reservas})
    } else {
        res.render('erro', {mensagem: "Erro ao filtrar lucros."})
    }
})

module.exports = routerReserva