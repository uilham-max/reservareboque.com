const express = require('express')
const routerReserva = express.Router()
const DAOReserva = require('../database/DAOReserva')
const DAOCliente = require('../database/DAOCliente')
const DAOReboque = require('../database/DAOReboque')
const autorizacao = require('../autorizacao/autorizacao')


// PUBLICA
// TELA ONDE É ESCOLHIDO O PERÍODO DA RESERVA
routerReserva.get('/reserva/periodo/:id?', (req, res) => {
    let user = 'User'
    if(req.session.cliente && req.session.cliente.nome){
        let a = req.session.cliente.nome
        let b = req.session.cliente.sobrenome
        user = a[0] + b[0]
    }
    id = req.params.id
    DAOReserva.getAtivasPorID(id).then(reservas => {
        // console.log("ID da reserva: "+reservas);

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
    let user = 'User'
    if(req.session.admin && req.session.admin.nome){
        let a = req.session.cliente.nome
        let b = req.session.cliente.sobrenome
        user = a[0] + b[0]
    }
    DAOReboque.getAll().then(reboques => {
        DAOCliente.getAll().then(clientes => {
            if(reboques.length != 0 && clientes.length != 0){
                res.render('reserva/novo', {user: user, mensagem: "", reboques: reboques, clientes: clientes})
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
    let user = 'User'
    if(req.session.admin && req.session.admin.nome){
        let a = req.session.cliente.nome
        let b = req.session.cliente.sobrenome
        user = a[0] + b[0]
    }
    let id = req.params.id
    DAOReserva.getOne(id).then(reserva => {
        DAOReboque.getAll().then(reboques => {
            DAOCliente.getAll().then(clientes => {
                if(reserva){
                    res.render('reserva/editar', {user: user, reserva: reserva, reboques: reboques, clientes: clientes, mensagem: ""})
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
routerReserva.get('/reserva/lista', autorizacao, (req, res) => {
    let user = 'User'
    if(req.session.admin && req.session.admin.nome){
        let a = req.session.cliente.nome
        let b = req.session.cliente.sobrenome
        user = a[0] + b[0]
    }
    DAOReserva.getAtivas().then(reservas => {
        if (reservas) {
            res.render('reserva/reserva', {user: user, reservas: reservas, mensagem: "" })
        } else {
            res.render('erro', { mensagem: "Erro na listagem de reservas." })
        }
    })
})


// RELATORIO HISTORICO GET
routerReserva.get('/reserva/historico', autorizacao, (req, res) => {
    let user = 'User'
    if(req.session.admin && req.session.admin.nome){
        let a = req.session.cliente.nome
        let b = req.session.cliente.sobrenome
        user = a[0] + b[0]
    }
    DAOReserva.getRelatorioHistorico().then(reservas => {
        if (reservas) {
            res.render('reserva/historico', {user: user, reservas: reservas, mensagem: "" })
        } else {
            res.render('erro', { mensagem: "Erro na listagem do historico." })
        }
    })
})

// RELATORIO HISTORICO POST
routerReserva.post('/reserva/filtrarHistorico', autorizacao, (req, res) => {
    let user = 'User'
    if(req.session.admin && req.session.admin.nome){
        let a = req.session.cliente.nome
        let b = req.session.cliente.sobrenome
        user = a[0] + b[0]
    }
    let {dataInicio, dataFim} = req.body
    DAOReserva.getRelatorioHistorico(dataInicio, dataFim).then(reservas => {
        if(reservas){
            res.render('reserva/historico', {user: user, reservas: reservas})
        } else {
            res.render('erro', {mensagem: "Erro ao filtrar."})
        }
    })
})

// RELATORIO LUCRO GET
routerReserva.get('/reserva/lucro', autorizacao, async (req, res) => {
    let user = 'User'
    if(req.session.admin && req.session.admin.nome){
        let a = req.session.cliente.nome
        let b = req.session.cliente.sobrenome
        user = a[0] + b[0]
    }
    let reservas = await DAOReserva.getRelatorioLucro()
    if(reservas){
        let lucroTotal = await DAOReserva.getLucroTotal()
        res.render('reserva/lucro', {user: user, lucroTotal: lucroTotal, reservas: reservas, mensagem: ""})
    } else {
        res.render('erro', {mensagem: "Erro ao listar lucros."})
    }
})


routerReserva.post('/reserva/filtrar', autorizacao, async (req, res) => {
    let user = 'User'
    if(req.session.admin && req.session.admin.nome){
        let a = req.session.cliente.nome
        let b = req.session.cliente.sobrenome
        user = a[0] + b[0]
    }
    let {dataInicio, dataFim} = req.body
    let reservas = await DAOReserva.getRelatorioLucro(dataInicio, dataFim)
    // console.log("Reservas relatorio lucro: ", reservas.map(reserva => reserva.toJSON()));
    if(reservas){
        let lucroTotal = await DAOReserva.getLucroTotal(dataInicio, dataFim)
        res.render('reserva/lucro', {user: user, lucroTotal: lucroTotal, reservas: reservas})
    } else {
        res.render('erro', {mensagem: "Erro ao filtrar lucros."})
    }
})

module.exports = routerReserva