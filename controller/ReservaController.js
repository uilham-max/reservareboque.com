const express = require('express')
const routerReserva = express.Router()
const DAOReserva = require('../database/DAOReserva')
const DAOCliente = require('../database/DAOCliente')
const DAOReboque = require('../database/DAOReboque')
var {clienteNome, adminNome} = require('../helpers/getSessionNome')
const autorizacao = require('../autorizacao/autorizacao')
const Diaria = require('../bill_modules/Diaria')
const { estornoPagamento } = require('../helpers/API_Pagamentos')
const DAOPagamento = require('../database/DAOPagamento')
const clienteAutorizacao = require('../autorizacao/clienteAutorizacao')
const moment = require('moment-timezone')


// REMOVER RESERVA ADMIN
routerReserva.get('/admin/reserva/remover/:codigoPagamento?/:valor?', autorizacao, async (req, res) => {

    // console.log(req.params.codigoPagamento, "coidgoPagamento");

    console.log("Removendo a reserva...");
    console.log('Estornando o pagamento...');
    await estornoPagamento(req.params.codigoPagamento, req.params.valor)
    // O MESMO QUE REMOVER A RESERVA (DELETE ON CASCADE)
    console.log('Cancelando a reserva...');
    // await DAOPagamento.removePeloCodigoPagamento(req.params.codigoPagamento)
    await DAOPagamento.atualizaSituacaoParaCancelado(req.params.codigoPagamento)
    // await DAOReserva.atualizaSituacaoParaCancelada()

    let reservas = await DAOReserva.getAtivas()
    
    if(reservas == ''){
        res.render('reserva/reserva', {user: adminNome(req, res), reservas: reservas, mensagem: "A lista de reservas está vazia."})
    }
    res.render('reserva/reserva', {user: adminNome(req, res), reservas: reservas, mensagem: ''})
    
})


// CANCELAMENTO DE RESERVA PELO CLIENTE
routerReserva.get('/reserva/remover/:codigoPagamento?/:valor?/:dataSaida?', clienteAutorizacao, async (req, res) => {

    console.log("Executando o cancelamento da reserva...");

    let clienteCpf
    if(req.session.cliente && req.session.cliente.cpf){
        clienteCpf = req.session.cliente.cpf
    }

    // Pega a data atual
    let dataAtual =  moment.tz( new Date(), 'America/Sao_Paulo' )

    // Formata a data de saida da reserva ( necessário para realizar o cálculo )
    let dataSaida = moment(req.params.dataSaida)

    // Calcula a diferença entre a datas d saída e atual ( horas )
    var horasRestantes = dataSaida.diff(dataAtual, 'hours')

    let reservas

    // Não será possível cancelar a reserva se houver menos de 24h para a retirada
    if( horasRestantes < 48 || (dataSaida.format("YYYY-MM-DD") == dataAtual.format("YYYY-MM-DD"))) {
        reservas = await DAOReserva.getMinhasReservas(clienteCpf)
        console.error("Não foi possível cancelar a reserva!");
        res.render('cliente/minhas-reservas', {user: clienteNome(req, res), reservas: reservas, mensagem: "Sua reserva não pode ser cancelada. Faltam menos de 24 horas para retirada."})
    } else {
        console.log('Estornando o pagamento...');
        await estornoPagamento(req.params.codigoPagamento, req.params.valor)
        // O MESMO QUE REMOVER A RESERVA (DELETE ON CASCADE)
        console.log('Cancelando a reserva...');
        // await DAOPagamento.removePeloCodigoPagamento(req.params.codigoPagamento)
        console.log(req.params.codigoPagamento, "coidgoPagamento");

        await DAOPagamento.atualizaSituacaoParaCancelado(req.params.codigoPagamento)
        let codigoPagamento = await DAOPagamento.recuperaPeloCodigoPagamento(req.params.codigoPagamento)
        await DAOReserva.atualizaSituacaoParaCancelada(codigoPagamento)

        reservas = await DAOReserva.getMinhasReservas(clienteCpf)
        
        if(reservas == ''){
            res.render('cliente/minhas-reservas', {user: clienteNome(req, res), reservas: reservas, mensagem: "Sua lista de reservas está vazia."})
        }
        res.render('cliente/minhas-reservas', {user: clienteNome(req, res), reservas: reservas, mensagem: ''})
    }
    
})



// PERÍODO
routerReserva.get('/reserva/periodo/:reboquePlaca?', (req, res) => {
    let reboquePlaca = req.params.placa
    DAOReserva.getAtivasPorID(reboquePlaca).then(reservas => {
        DAOReboque.getOne(reboquePlaca).then(reboque => {
            if(reboque){
                res.render('reserva/periodo', {user: clienteNome(req, res), mensagem: "", reboque: reboque, reservas: reservas})
            } else {
                res.render('erro', {mensagem: "Erro ao mostrar reboque."})
            }
        })
    })
})


// INFORMAR DADOS
routerReserva.post('/reserva/dados-informa', (req, res) => {
    let {reboquePlaca, dataInicio, dataFim} =  req.body

    if(dataInicio > dataFim){
        res.render('erro', {mensagem: 'Erro com as datas.'})
    }

    DAOReserva.getVerificaDisponibilidade(reboquePlaca, dataInicio, dataFim).then( resposta => {
        DAOReboque.getOne(reboquePlaca).then(reboque => {
            if(reboque && resposta.length === 0){
                
                let dias = Diaria.calcularDiarias(dataInicio, dataFim)
                let valorTotalDaReserva = Diaria.calcularValorTotalDaReserva(dias, reboque.valorDiaria)
                let valorTotalDaReservaComDesconto = Diaria.aplicarDescontoNaDiariaParaCliente(valorTotalDaReserva, dias)
                res.render('reserva/dados-informa', {user: clienteNome(req, res), dias: dias, reboque: reboque, dataInicio: dataInicio, dataFim: dataFim, valorTotalDaReserva: valorTotalDaReserva,  valorTotalDaReservaComDesconto: valorTotalDaReservaComDesconto,})

            } else {
                
                DAOReserva.getAtivasPorID(reboquePlaca).then(reservas => {
                    res.render('reserva/periodo', {user: clienteNome(req, res), reboque: reboque, reservas: reservas, mensagem: "Indisponível para esta data."})
                })
                
            }
        })
    } )
})



// ROTA PUBLICA
routerReserva.post('/reserva/dados-confirma', async (req, res) => {
    
    let {nome, cpf, telefone, email, cep, logradouro, complemento, localidade,
    numeroDaCasa, reboquePlaca, dataInicio, dataFim, formaPagamento} = req.body

    let resposta = await DAOReserva.getVerificaDisponibilidade(reboquePlaca, dataInicio, dataFim)
    if(resposta.length > 0){
        let reboque = await DAOReboque.getOne(reboquePlaca)
        let reservas = await DAOReserva.getAtivasPorID(reboquePlaca)
        res.render('reserva/periodo', {user: clienteNome(req, res), reboque: reboque, reservas: reservas, mensagem: "Indisponível para esta data."})
        return
    }


    // CLIENTE LOGADO
    let clienteLogado = {}
    if(req.session.cliente){
        clienteLogado = await DAOCliente.getOne(req.session.cliente.cpf)
        if(!clienteLogado){
            res.render('erro', {mensagem: "Erro ao buscar cliente"})
            return

        }
    }


    // Cria o objeto Cliente 
    cliente = {
        'nome': clienteLogado.nome ? clienteLogado.nome : nome, 
        'cpf':clienteLogado.cpf ? clienteLogado.cpf : cpf, 
        'telefone':clienteLogado.telefone ? clienteLogado.telefone : telefone, 
        'email':clienteLogado.email ? clienteLogado.email : email, 
        'cep':clienteLogado.cep ? clienteLogado.cep : cep, 
        'logradouro':clienteLogado.logradouro ? clienteLogado.logradouro : logradouro, 
        'complemento':clienteLogado.complemento ? clienteLogado.complemento : complemento, 
        'localidade':clienteLogado.localidade ? clienteLogado.localidade : localidade, 
        'numeroDaCasa':clienteLogado.numero_da_casa ? clienteLogado.numero_da_casa : numeroDaCasa,
    }


    // BUSCA REBOQUE POR ID
    let reboque = await DAOReboque.getOne(reboquePlaca)
    if(!reboque){
        res.render('erro', {mensagem: "Erro ao buscar reboque"})
    }


    // CALCULA VALORES E APLICA DESCONTOS
    let dias = Diaria.calcularDiarias(dataInicio, dataFim)
    let valorTotalDaReserva = Diaria.calcularValorTotalDaReserva(dias, reboque.valorDiaria)
    let valorTotalDaReservaComDesconto = Diaria.aplicarDescontoNaDiariaParaCliente(valorTotalDaReserva, dias)
    
    
    // Cria o objeto Reserva
    reserva = {
        'reboquePlaca': reboquePlaca,
        'dataInicio': dataInicio,
        'dataFim': dataFim,
        'valorDiaria': req.session.cliente ? reboque.valorDiaria/dias : reboque.valorDiaria, 
        'dias': dias, 
        'valorTotalDaReserva': req.session.cliente ? valorTotalDaReservaComDesconto : valorTotalDaReserva,
        'desconto': valorTotalDaReserva - valorTotalDaReservaComDesconto,
        'formaPagamento': formaPagamento,
    }


    res.render('reserva/dados-confirma', 
        {user: clienteNome(req, res), reboque: reboque, cliente: cliente, reserva: reserva, mensagem: '' 
    })

})


// // CRIAR GET
// routerReserva.get('/reserva/novo', autorizacao, (req, res) => {
//     DAOReboque.getAll().then(reboques => {
//         DAOCliente.getAll().then(clientes => {
//             if(reboques.length != 0 && clientes.length != 0){
//                 res.render('reserva/novo', {user: adminNome(req, res), mensagem: "", reboques: reboques, clientes: clientes})
//             } else {
//                 res.render('erro', {mensagem: "Lista de reboques ou clientes vazia."})
//             }
//         })
//     })
// })



// CRIAR POST
// routerReserva.post('/reserva/salvar', autorizacao, (req, res) => {
//     let {dataSaida, dataChegada, valorDiaria, cliente, reboque } = req.body
//     DAOReserva.insert(dataSaida, dataChegada, valorDiaria, cliente, reboque).then(inserido => {
//         DAOReboque.getAll().then(reboques => {
//             DAOCliente.getAll().then(clientes => {
//                 if (inserido) {
//                     res.render('reserva/novo', { mensagem: "Reserva inserido", reboques: reboques, clientes: clientes, inserido: inserido })
//                 }
//                 else {
//                     res.render('reserva/novo', { mensagem: "Veículo indisponível para o período.", reboques: reboques, clientes: clientes, inserido: inserido })
//                 }
//             })
//         })
//     })
// })



// DELETAR 
// routerReserva.get('/reserva/excluir/:id', autorizacao, (req, res) => {
//     let id = req.params.id
//     DAOReserva.delete(id).then(excluido =>{
//         if(excluido){
//             res.redirect('/reserva/lista')
//         } else {
//             res.render('erro', {mensagem: "Erro ao excluir"})
//         }
//     })
// })



// ATUALIZAR GET
// routerReserva.get('/reserva/editar/:id', autorizacao, (req, res) => {
//     let id = req.params.id
//     DAOReserva.getOne(id).then(reserva => {
//         DAOReboque.getAll().then(reboques => {
//             DAOCliente.getAll().then(clientes => {
//                 if(reserva){
//                     res.render('reserva/editar', {user: adminNome(req, res), reserva: reserva, reboques: reboques, clientes: clientes, mensagem: ""})
//                 } else {
//                     res.render('erro', {mensagem: "Erro ao editar reserva."})
//                 }
//             })
//         })
//     })
// })



// ATUALIZAR POST
// routerReserva.post('/reserva/atualizar', autorizacao, (req, res) => {
//     let {id, dataSaida, dataChegada, valorDiaria, clienteCpf, reboquePlaca} = req.body
//     DAOReserva.update(id, dataSaida, dataChegada, valorDiaria, clienteCpf, reboquePlaca).then(inserido => {
//         if(inserido){
//             res.redirect('/reserva/lista')
//         } else {
//             res.render('erro', { mensagem: "Erro ao atualizar." })
//         }
//     })
// })



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