const express = require('express')
const routerPagamento = express.Router()
const DAOReboque = require('../database/DAOReboque')
const DAOPagamento = require('../database/DAOPagamento')
const DAOCliente = require('../database/DAOCliente')
const DAOReserva = require('../database/DAOReserva')
const Diaria = require('../bill_modules/Diaria')



// ISSO DEVE OCORRE QUANDO O QR CODE FOR ESCENADO PELO CLIENTE
routerPagamento.post('/pagamento/salvar', async (req, res) => {

    let {nome, sobrenome, email, senha, cpf, rg, telefone, dataNascimento, cep, logradouro, complemento, bairro, localidade, uf, numeroDaCasa, idReboque, dataInicio, dataFim, valorDiaria, valorTotalDaReserva} = req.body
    // console.log("data de nascimento: "+dataNascimento);

    valorTotalDaReserva = Diaria.calcularValorTotalDaReserva(Diaria.calcularDiarias(dataInicio,dataFim), valorDiaria)

    const codigoPagamento = await DAOPagamento.verificaPagamento()
    if(!codigoPagamento){
        res.render('erro', {mensagem: 'Erro ao verificar pagamento.'})
    }
    
    const idPagamento = await DAOPagamento.insert(codigoPagamento, valorTotalDaReserva)
    if(!idPagamento){
       res.render('erro', {mensagem: "Erro ao criar pagamento."})
    }

    const idCliente = await DAOCliente.insertCliente(nome, sobrenome, email, senha, cpf, rg, telefone, dataNascimento, cep, logradouro, complemento, bairro, localidade, uf, numeroDaCasa)
    if(!idCliente){
        res.render('erro', {mensagem: 'Erro ao criar cliente.'})
    }

    DAOReserva.insert(dataInicio, dataFim, valorDiaria, idCliente, idReboque, idPagamento).then(inserido => {
        if(inserido){
            res.render('pagamento/sucesso', {mensagem: ""})
        } else {
            res.render('erro', {mensagem: 'Erro ao criar reserva.'})
        }
    })
})


// GERANDO QR CODE PARA O CLIENTE
routerPagamento.post('/pagamento/pagamento', (req, res) => {

    let {nome, sobrenome, email, senha, cpf, rg, telefone, cep, dataNascimento, logradouro, complemento, bairro, 
    localidade, uf, numeroDaCasa, idReboque, dataInicio, dataFim, valorDiaria} = req.body
    // console.log("dataNascimento: "+dataNascimento+ uf);
    
    valorTotalDaReserva = Diaria.calcularValorTotalDaReserva(Diaria.calcularDiarias(dataInicio,dataFim), valorDiaria)

    // Cria o objeto Reserva
    reserva = {
        'idReboque': idReboque,
        'dataInicio': dataInicio,
        'dataFim': dataFim,
        'valorDiaria': valorDiaria
    }

    // Cria o objeto Cliente 
    cliente = {
        'nome': nome,
        'sobrenome': sobrenome,
        'email': email,
        'senha': senha,
        'cpf': cpf,
        'rg': rg,
        'telefone': telefone,
        'cep': cep,
        'dataNascimento': dataNascimento,
        'logradouro': logradouro,
        'complemento': complemento,
        'bairro': bairro,
        'localidade': localidade,
        'uf': uf,
        'numeroDaCasa': numeroDaCasa
    }

    // BUSCAR QR CODE NA API NO PSP (PROVEDOR DE SERVIÇOS DE PAGAMENTO)
    DAOPagamento.getQRCode().then(qrCode => {
        if(qrCode){
            DAOReboque.getOne(idReboque).then(reboque => {
                if(reboque){
                    res.render('pagamento/pagamento', {mensagem: "", cliente: cliente, reboque: reboque, reserva: reserva, qrCode: qrCode, valorTotalDaReserva: valorTotalDaReserva})
                } else {
                    res.render('erro', {mensagem: "erro => PagamentoController.js"})
                }
            })

        } else {
            console.log("erro ao busca qrCode!");
        }

    })
    
})


module.exports = routerPagamento

