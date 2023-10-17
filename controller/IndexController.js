const express = require('express')
const routerIndex = express.Router()
const DAOReboque = require('../database/DAOReboque')
const DAOReserva = require('../database/DAOReserva')


routerIndex.get('/', (req, res) => {
    DAOReboque.getAll().then(reboques => {
        if(reboques){
            res.render('index', {reboques: reboques})
        } else {
            res.render('erro', {mensagem: "Erro ao listar reboques."})
        }
    })
})

routerIndex.get('/login', (req, res) => {
    res.render('login', {mensagem: ""})
})


routerIndex.get('/reserva/:id/:mensagem?', (req, res) => {
    id = req.params.id
    DAOReserva.getAtivasPorID(id).then(reservas => {
        DAOReboque.getOne(id).then(reboque => {
            if(reboque){
                res.render('reserva', {mensagem: "", reboque: reboque, reservas: reservas})
            } else {
                res.render('erro', {mensagem: "Erro ao mostrar reboque."})
            }
        })
    })
})

routerIndex.post('/reserva-dados', (req, res) => {
    let {id, dataInicio, dataFim} =  req.body

    DAOReserva.getVerificaDisponibilidade(id, dataInicio, dataFim).then( resposta => {
        DAOReboque.getOne(id).then(reboque => {
            if(reboque && resposta.length === 0){
                res.render('reserva-dados', {reboque: reboque, dataInicio: dataInicio, dataFim: dataFim})
            } else {
                DAOReserva.getAtivas(id).then(reservas => {
                    res.render('reserva', {reboque: reboque, reservas: reservas, mensagem: "Indisponivel para esta data."})
                })
                
            }
        })
    } )
})

routerIndex.post('/reserva/pagamento', (req, res) => {
    
})





module.exports = routerIndex;