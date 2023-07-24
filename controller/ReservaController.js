const express = require('express')
const routerReserva = express.Router()
const DAOReserva = require('../database/DAOReserva')
const DAOCliente = require('../database/DAOCliente')
const DAOReboque = require('../database/DAOReboque')
const Diaria = require('../bill_modules/Diaria')
const autorizacao = require('../autorizacao/autorizacao')



// LISTAR
routerReserva.get('/reserva/lista/:mensagem?', autorizacao, (req, res) => {
    DAOReserva.getAll().then(reservas => {
        if (reservas) {
            res.render('reserva/reserva', { reservas: reservas, mensagem: req.params.mensagem ? "Erro! Item já referenciado" : "" })
        } else {
            res.render('erro', { mensagem: "Erro na listagem de reservas." })
        }
    })
})

// RELATORIO HISTORICO
routerReserva.get('/reserva/historico/:mensagem?', autorizacao, (req, res) => {
    DAOReserva.getRelatorioHistorico().then(reservas => {
        if (reservas) {
            res.render('reserva/historico', { reservas: reservas, mensagem: req.params.mensagem ? "Erro! Item já referenciado" : "" })

        } else {
            res.render('erro', { mensagem: "Erro na listagem de reservas." })
        }
    })
})

// RELATORIO SOMA COM FILTRO GET
routerReserva.get('/reserva/lucro/:mensagem?', autorizacao, (req, res) => {
    DAOReserva.getRelatorioReservasPorRoboqueFiltro().then(reservas => {
        if(reservas){
            res.render('reserva/lucro', {reservas: reservas, mensagem: req.params.mensagem ? 
                "Não é possível excluir um reboque já referencia por uma locação.":""})
        } else {
            res.render('erro', {mensagem: "Erro ao listar reboques."})
        }
    })
})

// RELATORIO SOMA COM FILTRO POST
routerReserva.post('/reserva/filtrar', autorizacao,(req, res) => {
    let {dataInicio, dataFim} = req.body
    DAOReserva.getRelatorioReservasPorRoboqueFiltro(dataInicio, dataFim).then(reservas => {
        if(reservas){
            res.render('reserva/lucro', {reservas: reservas})
        } else {
            res.render('erro', {mensagem: "Erro ao listar reboques."})
        }
    })
})

// CRIAR
routerReserva.get('/reserva/novo/:mensagem?', autorizacao, (req, res) => {
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
routerReserva.post('/reserva/salvar', autorizacao, (req, res) => {
    let { dataSaida, dataChegada, valorDiaria, cliente, reboque } = req.body
    let diarias = Diaria.calcularDiarias(dataSaida, dataChegada)
    valorTotal = diarias*valorDiaria
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

routerReserva.post('/reserva/atualizar', (req, res) => {
    let {id, dataSaida, dataChegada, valorDiaria, cliente, reboque} = req.body
    // console.log(id+"="+dataSaida+"="+dataChegada+"="+valorDiaria+"="+cliente+"="+reboque);
    DAOReserva.update(id, dataSaida, dataChegada, valorDiaria, cliente, reboque).then(inserido => {
        if(inserido){
            res.redirect('/reserva/lista')
        }
        
    })
})

module.exports = routerReserva