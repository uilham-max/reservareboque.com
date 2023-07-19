const express = require('express')
const routerReserva = express.Router()
const DAOReserva = require('../database/DAOReserva')
const DAOCliente = require('../database/DAOCliente')
const DAOReboque = require('../database/DAOReboque')
const Diaria = require('../bill_modules/Diaria')


// LISTAR
routerReserva.get('/reserva/lista/:mensagem?', (req, res) => {
    DAOReserva.getAll().then(reservas => {
        if (reservas) {
            res.render('reserva/reserva', { reservas: reservas, mensagem: req.params.mensagem ? "Erro! Item já referenciado" : "" })
        } else {
            res.render('erro', { mensagem: "Erro na listagem de reservas." })
        }
    })
})

// RELATORIO HISTORICO
routerReserva.get('/reserva/relatorio/:mensagem?', (req, res) => {
    DAOReserva.getRelatorioHistorico().then(reservas => {
        if (reservas) {
            res.render('reserva/relatorio', { reservas: reservas, mensagem: req.params.mensagem ? "Erro! Item já referenciado" : "" })
        } else {
            res.render('erro', { mensagem: "Erro na listagem de reservas." })
        }
    })
})

// CRIAR
routerReserva.get('/reserva/novo/:mensagem?', (req, res) => {
    DAOReboque.getAll().then(reboques => {
        DAOCliente.getAll().then(clientes => {
            if(req.params.mensagem){ 
                res.render('reserva/novo', {mensagem: "Reserva incluída.", reboques: reboques, clientes: clientes})
            } else {
                if(reboques && clientes){
                    res.render('reserva/novo', {mensagem: "", reboques: reboques, clientes: clientes})
                } else {
                    res.redirect('reserva/lista/reboques_ou_clientes_vazio')
                }
            } 
        })
    })
})

// SALVAR
routerReserva.post('/reserva/salvar', (req, res) => {
    let { dataSaida, dataChegada, valorDiaria, valorTotal, cliente, reboque } = req.body
    let diarias = Diaria.calcularDiarias(dataSaida, dataChegada)
    // console.log(valorDiaria+"<<<<<<<<<<<<<<<<<<<<<<<")

    DAOReserva.insert(dataSaida, dataChegada, valorDiaria, diarias, valorTotal, cliente, reboque).then(inserido => {
        DAOReboque.getAll().then(reboques => {
            DAOCliente.getAll().then(clientes => {
                if (inserido) {
                    res.render('reserva/novo', { mensagem: "Reserva inserido", reboques: reboques, clientes: clientes })
                }
                else {
                    res.render('erro', { mensagem: "Erro ao inserir a reserva." })
                }
            })
        })
    })
})

// DELETAR
routerReserva.get('/reserva/excluir/:id', (req, res) => {
    let id = req.params.id
    DAOReserva.delete(id).then(excluido =>{
        if(excluido){
            res.redirect('/reserva/lista')
        } else {
            res.render('erro', {mensagem: "Erro ao excluir"})
        }
    })
})

module.exports = routerReserva