const express = require('express')
const routerReserva = express.Router()
const DAOReserva = require('../database/DAOReserva')
const DAOCliente = require('../database/DAOCliente')
const DAOReboque = require('../database/DAOReboque')
const getSessionNome = require('../bill_modules/getSessionNomeCliente')
const autorizacao = require('../autorizacao/autorizacao')
const Diaria = require('../bill_modules/Diaria')
const clienteAutorizacao = require('../autorizacao/clienteAutorizacao')


// ROTA PUBLICA
routerReserva.post('/reserva/dados-informa', (req, res) => {
    let {id, dataInicio, dataFim} =  req.body

    DAOReserva.getVerificaDisponibilidade(id, dataInicio, dataFim).then( resposta => {
        DAOReboque.getOne(id).then(reboque => {
            if(reboque && resposta.length === 0){
                let valorTotalDaReserva = Diaria.calcularValorTotalDaReserva(Diaria.calcularDiarias(dataInicio, dataFim), reboque.valorDiaria)
                res.render('reserva/dados-informa', {user: getSessionNome(req, res), reboque: reboque, dataInicio: dataInicio, dataFim: dataFim, valorTotalDaReserva: valorTotalDaReserva})
            } else {
                DAOReserva.getAtivas(id).then(reservas => {
                    res.render('reserva/periodo', {user: getSessionNome(req, res), reboque: reboque, reservas: reservas, mensagem: "Indisponivel para esta data."})
                })
                
            }
        })
    } )
})


/**
 * Essa rota deve verificar as datas informadas. Se estiver tudo certo, então 
 * deve mostrar a página com o card do reboque e o período escolhido, um card com
 * os dados do cliente e outro com o endereço dele
*/

// ROTA PRIVADA DO CLIENTE
routerReserva.post('/reserva/dados-confirma-cliente', clienteAutorizacao, (req, res) => {
    let {id, dataInicio, dataFim} =  req.body
    let idCliente = req.session.cliente.id

    DAOReserva.getVerificaDisponibilidade(id, dataInicio, dataFim).then( resposta => {
        DAOReboque.getOne(id).then(reboque => {
            if(reboque && resposta.length === 0){
                DAOCliente.getOne(idCliente).then(cliente => {
                    if(cliente){
                        let valorTotalDaReserva = Diaria.calcularValorTotalDaReserva(Diaria.calcularDiarias(dataInicio, dataFim), reboque.valorDiaria)
                        let reserva = {
                            'idReboque': id,
                            'dataInicio': dataInicio,
                            'dataFim': dataFim,
                            'valorDiaria': reboque.valorDiaria
                        }
                        res.render('reserva/dados-confirma-cliente', {user: getSessionNome(req, res), reserva: reserva, cliente: cliente, reboque: reboque, dataInicio: dataInicio, dataFim: dataFim, valorTotalDaReserva: valorTotalDaReserva})
                    } else {
                        res.render('reserva/periodo', {user: getSessionNome(req, res), reboque: reboque, reservas: reservas, mensagem: "Erro os buscar cliente."})
                    }
                })
            } else {
                DAOReserva.getAtivas(id).then(reservas => {
                    res.render('reserva/periodo', {user: getSessionNome(req, res), reboque: reboque, reservas: reservas, mensagem: "Indisponivel para esta data."})
                })
            }
        })
    } )
})


// ROTA PUBLICA
routerReserva.post('/reserva/dados-confirma', (req, res) => {
    let {nome, sobrenome, email, cpf, rg, telefone, cep, dataNascimento, logradouro, complemento, bairro, 
    localidade, uf, numeroDaCasa, idReboque, dataInicio, dataFim, valorDiaria} = req.body

    valorTotalDaReserva = Diaria.calcularValorTotalDaReserva(Diaria.calcularDiarias(dataInicio,dataFim), valorDiaria)

    // Cria o objeto Reserva
    reserva = {'idReboque': idReboque,'dataInicio': dataInicio,'dataFim': dataFim,'valorDiaria': valorDiaria}

    // Cria o objeto Cliente 
    cliente = {'nome':nome, 'sobrenome':sobrenome, 'email':email, 'cpf':cpf, 'rg':rg, 'telefone':telefone, 'cep':cep, 'dataNascimento':dataNascimento, 'logradouro':logradouro, 'complemento':complemento, 'bairro':bairro, 'localidade':localidade, 'uf':uf, 'numeroDaCasa':numeroDaCasa}

    DAOReboque.getOne(idReboque).then(reboque => {
        if(reboque){
            res.render('reserva/dados-confirma', {user: getSessionNome(req, res), reboque: reboque, cliente: cliente, reserva: reserva, mensagem: '' })
        } else {
            res.render('erro', {mensagem: 'erro ao buscar reboque.'})
        }
    })

})


/**
 * Se o cliente que estiver acessando essa rota for cadastrado, então ele deve ser redirecionado
 * diretamente para a tela de confirmação dos dados da reserva
 * Ess rota apenas irá mostrar as datas de indisponibilidade do reboque
*/

// ROTA PÚBLICA - TELA ONDE É ESCOLHIDO O PERÍODO DA RESERVA
routerReserva.get('/reserva/periodo/:id?', (req, res) => {
    id = req.params.id
    DAOReserva.getAtivasPorID(id).then(reservas => {
        DAOReboque.getOne(id).then(reboque => {
            if(reboque){
                res.render('reserva/periodo', {user: getSessionNome(req, res), mensagem: "", reboque: reboque, reservas: reservas})
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
                res.render('reserva/novo', {user: getSessionNome(req, res), mensagem: "", reboques: reboques, clientes: clientes})
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
                    res.render('reserva/editar', {user: getSessionNome(req, res), reserva: reserva, reboques: reboques, clientes: clientes, mensagem: ""})
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
            res.render('reserva/reserva', {user: getSessionNome(req, res), reservas: reservas, mensagem: "" })
        } else {
            res.render('erro', { mensagem: "Erro na listagem de reservas." })
        }
    })
})



// RELATORIO HISTORICO GET
routerReserva.get('/reserva/historico', autorizacao, (req, res) => {
    DAOReserva.getRelatorioHistorico().then(reservas => {
        if (reservas) {
            res.render('reserva/historico', {user: getSessionNome(req, res), reservas: reservas, mensagem: "" })
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
            res.render('reserva/historico', {user: getSessionNome(req, res), reservas: reservas})
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
        res.render('reserva/lucro', {user: getSessionNome(req, res), lucroTotal: lucroTotal, reservas: reservas, mensagem: ""})
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
        res.render('reserva/lucro', {user: getSessionNome(req, res), lucroTotal: lucroTotal, reservas: reservas})
    } else {
        res.render('erro', {mensagem: "Erro ao filtrar lucros."})
    }
})

module.exports = routerReserva