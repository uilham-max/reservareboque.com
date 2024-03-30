const express = require('express')
const routerCliente = express.Router()
const DAOCliente =  require('../database/DAOCliente')
const DAOReboque = require('../database/DAOReboque')
const autorizacao = require('../autorizacao/autorizacao')
const DAOReserva = require('../database/DAOReserva')
const Diaria = require('../bill_modules/Diaria')
const bcrypt = require('bcryptjs')

routerCliente.get('/cliente/logout', (req, res) => {
    req.session.cliente = undefined
    res.redirect('/')
})

// criado em 29/03/2024
routerCliente.post('/login/entrar', (req, res) => {
    let {email, senha} = req.body
    DAOCliente.login(email, senha).then( cliente => {
        if(cliente){
            if(bcrypt.compareSync(senha, cliente.senha)){
                req.session.cliente = {id: cliente.id, nome: cliente.nome, email: cliente.email}
                // console.log(req.session.cliente.email);
                res.redirect('/')
            } else {
                
                res.render('login', {mensagem: 'Usuário ou senha inválidos.'})
            }
        } else {
            res.render('login', {mensagem: 'Usuário ou senha inválidos.'})
        }
    })

})


// Data da criação 28/03/2024
routerCliente.get('/cliente/existe/:cpf?', (req, res) => {
    /**
     * USADO PARA CONSULTAR PELO CPF DO CLIENTE QUE SERÁ CRIADO E SE ELE EXISTIR PREENCHER 
     * OS CAMPOS DE INPUTS DA PÁGINA DE CADASTRO DE CLIENTE
    */
    let cpf = req.params.cpf
    DAOCliente.buscarClientePorCPF(cpf).then(cliente => {
        res.json(cliente);
    })
} )

routerCliente.post('/cadastro/create', async (req, res) => {
    let {nome, sobrenome, email, senha, senhaRepita, cpf, rg, telefone, dataNascimento, cep, 
        logradouro, complemento, bairro, localidade, uf, numeroDaCasa} = req.body

    if(senha.length < 8){
        res.render('erro', {mensagem: "Erro. Senha com menos de 8 dígitos."})
    }
    if(senha !== senhaRepita){
        res.render('erro', {mensagem: 'Erro. Senhas diferentes.'})
    }

    salt = bcrypt.genSaltSync(10)
    senha = bcrypt.hashSync(senha, salt)

    /**
     * Se o Cliente já for cadastrado, ou seja, ele já definiu os dados de login e senha, então ele não poderá 
     * utilizar essa rota 
    */

    DAOCliente.buscarClientePorCPF(cpf).then(cliente => {
        if(cliente.cadastrado){
            DAOCliente.insertClienteComReservaMasNaoEraCadastrado(nome, sobrenome, email, senha, cpf, rg, telefone, dataNascimento, cep, logradouro, complemento, bairro, localidade, uf, numeroDaCasa).then(sucesso => {
                if(sucesso){
                    res.redirect('/')
                } else {
                    res.render('erro', {mensagem: 'Erro ao inserir cliente'})
                }
            })
        } else {
            DAOCliente.insert(nome, sobrenome, email, senha, cpf, rg, telefone, dataNascimento, cep, logradouro, complemento, bairro, localidade, uf, numeroDaCasa).then(sucesso => {
                if(sucesso){
                    res.redirect('/')
                } else {
                    res.render('erro', {mensagem: 'Erro ao inserir cliente'})
                }
            })
        }
        
    })

})



routerCliente.post('/cliente/dados_cliente', (req, res) => {
    let user = 'User'
    if(req.session.cliente && req.session.cliente.nome){
        user = req.session.cliente.nome
    }
    let {id, dataInicio, dataFim} =  req.body

    DAOReserva.getVerificaDisponibilidade(id, dataInicio, dataFim).then( resposta => {
        DAOReboque.getOne(id).then(reboque => {
            if(reboque && resposta.length === 0){
                let valorTotalDaReserva = Diaria.calcularValorTotalDaReserva(Diaria.calcularDiarias(dataInicio, dataFim), reboque.valorDiaria)
                res.render('cliente/dados_cliente', {user: user, reboque: reboque, dataInicio: dataInicio, dataFim: dataFim, valorTotalDaReserva: valorTotalDaReserva})
            } else {
                DAOReserva.getAtivas(id).then(reservas => {
                    res.render('reserva/periodo', {user: user, reboque: reboque, reservas: reservas, mensagem: "Indisponivel para esta data."})
                })
                
            }
        })
    } )
})


routerCliente.get('/cliente/novo', autorizacao, (req, res) => {
    res.render('cliente/novo', {mensagem: ""})
})

routerCliente.post('/cliente/salvar', autorizacao, (req, res) => {
    let {nome, cpf, telefone, endereco} = req.body
    DAOCliente.insert(nome, cpf, telefone, endereco).then(inserido => {
        if(inserido){
            res.render('cliente/novo', {mensagem: "Cliente incluído!"})
        } else {
            res.render('erro', {mensagem: "Não foi possível incluir o cliente!"})
        }
    })
})

routerCliente.get('/cliente/lista/:mensagem?', autorizacao, (req, res) => {
    DAOCliente.getAll().then(clientes => {
        if(clientes){
            res.render('cliente/cliente', {clientes: clientes, mensagem: req.params.mensagem? 
                "Não é possivel excluir um cliente já refereciado por uma locação":""})
        } else {
            res.render('erro', {mensagem: "Erro na listagem de clientes."})
        }
    })
})

routerCliente.get('/cliente/editar/:id', autorizacao, (req, res) => {
    let id = req.params.id
    DAOCliente.getOne(id).then(cliente => {
        if(cliente){
            res.render('cliente/editar', {cliente: cliente} )
        } else {
            res.render('erro', {mensagem: "Erro na tentativa de edição de cliente"})
        }
    })
})


routerCliente.post('/cliente/atualizar', autorizacao, (req,res) => {
    let {id, nome, cpf, telefone, endereco} = req.body
    DAOCliente.update(id, nome, cpf, telefone, endereco).then(cliente => {
        if(cliente){
            res.redirect('/cliente/lista')
        } else {
            res.render('erro', {mensagem: "Não foi possível atualizar o cliente."})
        }
    })
})


routerCliente.get('/cliente/excluir/:id', autorizacao, (req,res) => {
    let id = req.params.id
    DAOCliente.delete(id).then(excluido => {
        if(excluido){
            res.redirect('/cliente/lista')
        } else {
            res.render('erro', {mensagem: "Erro ao excluir cliente."})
        }
    })
})



module.exports = routerCliente
