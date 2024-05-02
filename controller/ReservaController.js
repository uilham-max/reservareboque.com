const express = require('express')
const routerReserva = express.Router()
const DAOReserva = require('../database/DAOReserva')
const DAOCliente = require('../database/DAOCliente')
const DAOReboque = require('../database/DAOReboque')
var {clienteNome, adminNome} = require('../helpers/getSessionNome')
const autorizacao = require('../autorizacao/autorizacao')
const Diaria = require('../bill_modules/Diaria')


// ROTA PÚBLICA - TELA ONDE É ESCOLHIDO O PERÍODO DA RESERVA
routerReserva.get('/reserva/periodo/:id?', (req, res) => {
    let idReboque = req.params.id
    DAOReserva.getAtivasPorID(idReboque).then(reservas => {
        DAOReboque.getOne(idReboque).then(reboque => {
            if(reboque){
                res.render('reserva/periodo', {user: clienteNome(req, res), mensagem: "", reboque: reboque, reservas: reservas})
            } else {
                res.render('erro', {mensagem: "Erro ao mostrar reboque."})
            }
        })
    })
})


// SOMENTE PARA CLIENTES SEM CADASTRO
routerReserva.post('/reserva/dados-informa', (req, res) => {
    let {idReboque, dataInicio, dataFim} =  req.body

    if(dataInicio > dataFim){
        res.render('erro', {mensagem: 'Erro com as datas.'})
    }

    DAOReserva.getVerificaDisponibilidade(idReboque, dataInicio, dataFim).then( resposta => {
        DAOReboque.getOne(idReboque).then(reboque => {
            if(reboque && resposta.length === 0){
                let dias = Diaria.calcularDiarias(dataInicio, dataFim)
                let valorTotalDaReserva = Diaria.calcularValorTotalDaReserva(dias, reboque.valorDiaria)
                let valorTotalDaReservaComDesconto = Diaria.aplicarDescontoNaDiariaParaCliente(valorTotalDaReserva, dias)
                        
                res.render('reserva/dados-informa', {user: clienteNome(req, res), dias: dias, reboque: reboque, dataInicio: dataInicio, dataFim: dataFim, valorTotalDaReserva: valorTotalDaReserva,  valorTotalDaReservaComDesconto: valorTotalDaReservaComDesconto,})
            } else {
                DAOReserva.getAtivasPorID(idReboque).then(reservas => {
                    res.render('reserva/periodo', {user: clienteNome(req, res), reboque: reboque, reservas: reservas, mensagem: "Indisponível para esta data."})
                })
                
            }
        })
    } )
})



// ROTA PUBLICA
routerReserva.post('/reserva/dados-confirma', async (req, res) => {
    
    let {nome, cpf, telefone, cep, logradouro, complemento, localidade,
    numeroDaCasa, idReboque, dataInicio, dataFim} = req.body


    // CLIENTE LOGADO
    let clienteLogado = {}
    if(req.session.cliente){
        clienteLogado = await DAOCliente.getOne(req.session.cliente.id)
        if(!clienteLogado){
            res.render('erro', {mensagem: "Erro ao buscar cliente"})
        }
    }


    // Cria o objeto Cliente 
    cliente = {
        'nome': clienteLogado.nome ? clienteLogado.nome : nome, 
        'cpf':clienteLogado.cpf ? clienteLogado.cpf : cpf, 
        'telefone':clienteLogado.telefone ? clienteLogado.telefone : telefone, 
        'cep':clienteLogado.cep ? clienteLogado.cep : cep, 
        'logradouro':clienteLogado.logradouro ? clienteLogado.logradouro : logradouro, 
        'complemento':clienteLogado.complemento ? clienteLogado.complemento : complemento, 
        'localidade':clienteLogado.localidade ? clienteLogado.localidade : localidade, 
        'numeroDaCasa':clienteLogado.numero_da_casa ? clienteLogado.numero_da_casa : numeroDaCasa,
    }


    // BUSCA REBOQUE POR ID
    let reboque = await DAOReboque.getOne(idReboque)
    if(!reboque){
        res.render('erro', {mensagem: "Erro ao buscar reboque"})
    }


    // CALCULA VALORES E APLICA DESCONTOS
    let dias = Diaria.calcularDiarias(dataInicio, dataFim)
    let valorTotalDaReserva = Diaria.calcularValorTotalDaReserva(dias, reboque.valorDiaria)
    let valorTotalDaReservaComDesconto = Diaria.aplicarDescontoNaDiariaParaCliente(valorTotalDaReserva, dias)
    
    
    // Cria o objeto Reserva
    reserva = {
        'idReboque': idReboque,
        'dataInicio': dataInicio,
        'dataFim': dataFim,
        'valorDiaria': req.session.cliente ? reboque.valorDiaria/dias : reboque.valorDiaria, 
        'dias': dias, 
        'valorTotalDaReserva': req.session.cliente ? valorTotalDaReservaComDesconto : valorTotalDaReserva,
        'desconto': valorTotalDaReserva - valorTotalDaReservaComDesconto,
    }


    res.render('reserva/dados-confirma', 
        {user: clienteNome(req, res), reboque: reboque, cliente: cliente, reserva: reserva, mensagem: '' 
    })

})


// CRIAR GET
routerReserva.get('/reserva/novo', autorizacao, (req, res) => {
    DAOReboque.getAll().then(reboques => {
        DAOCliente.getAll().then(clientes => {
            if(reboques.length != 0 && clientes.length != 0){
                res.render('reserva/novo', {user: adminNome(req, res), mensagem: "", reboques: reboques, clientes: clientes})
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
                    res.render('reserva/editar', {user: adminNome(req, res), reserva: reserva, reboques: reboques, clientes: clientes, mensagem: ""})
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
    DAOReserva.getAtivas().then(reservas => {
        if (reservas) {
            res.render('reserva/reserva', {user: adminNome(req, res), reservas: reservas, mensagem: "" })
        } else {
            res.render('erro', { mensagem: "Erro na listagem de reservas." })
        }
    })
})



// RELATORIO HISTORICO GET
routerReserva.get('/reserva/historico', autorizacao, (req, res) => {
    DAOReserva.getRelatorioHistorico().then(reservas => {
        if (reservas) {
            res.render('reserva/historico', {user: adminNome(req, res), reservas: reservas, mensagem: "" })
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
            res.render('reserva/historico', {user: adminNome(req, res), reservas: reservas})
        } else {
            res.render('erro', {mensagem: "Erro ao filtrar."})
        }
    })
})



// RELATORIO LUCRO GET
routerReserva.get('/reserva/lucro', autorizacao, async (req, res) => {
    let reservas = await DAOReserva.getRelatorioLucro()
    if(reservas){
        let lucroTotal = await DAOReserva.getLucroTotal()
        res.render('reserva/lucro', {user: adminNome(req, res), lucroTotal: lucroTotal, reservas: reservas, mensagem: ""})
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
        res.render('reserva/lucro', {user: adminNome(req, res), lucroTotal: lucroTotal, reservas: reservas})
    } else {
        res.render('erro', {mensagem: "Erro ao filtrar lucros."})
    }
})

module.exports = routerReserva