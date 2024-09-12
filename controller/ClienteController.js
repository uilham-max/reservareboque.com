const express = require('express')
const routerCliente = express.Router()
const DAOCliente =  require('../database/DAOCliente')
const autorizacao = require('../autorizacao/autorizacao')
const {adminNome, clienteNome} = require('../helpers/getSessionNome')
const bcrypt = require('bcryptjs')
const clienteAutorizacao = require('../autorizacao/clienteAutorizacao')
const DAOReserva = require('../database/DAOReserva')
const DAOReboque = require('../database/DAOReboque')
const moment = require('moment-timezone')
const Diaria = require('../bill_modules/Diaria')

routerCliente.get('/cliente/login', (req, res) => {
    res.render('cliente/login', {user: clienteNome(req, res), mensagem: ""})
})

routerCliente.get('/cliente/cadastro', (req, res) => {
    res.render('cliente/cadastro', {user: clienteNome(req, res), mensagem: ''})
})

routerCliente.post('/login/entrar', async (req, res) => {
    let {email, senha} = req.body
    DAOCliente.login(email, senha).then( cliente => {
        if(cliente){
            if(bcrypt.compareSync(senha, cliente.senha)){
                req.session.cliente = {cpf: cliente.cpf, nome: cliente.nome, email: cliente.email}
                console.log(req.session.cliente.nome, "fez login...");
                res.redirect('/')
            } else {
                
                return res.render('login', {user: clienteNome(req, res), mensagem: 'Usuário ou senha inválidos.'})
            }
        } else {
            return res.render('login', {user: clienteNome(req, res), mensagem: 'Usuário ou senha inválidos.'})
        }
    })

})

routerCliente.get('/cliente/logout', (req, res) => {
    console.log(req.session.cliente.nome,'fez logout...');
    req.session.cliente = undefined
    res.redirect('/')
})

routerCliente.get('/cliente/existe/:cpf?', (req, res) => {
    /**
     * USADO PARA CONSULTAR PELO CPF DO CLIENTE QUE SERÁ CRIADO E SE ELE EXISTIR PREENCHER 
     * OS CAMPOS DE INPUTS DA PÁGINA DE CADASTRO DE CLIENTE
    */
    let cpf = req.params.cpf
    DAOCliente.verificaSeClienteExiste(cpf).then(cliente => {
        if(cliente){
            res.json(cliente);
        }
        
    })
} )

routerCliente.post('/cadastro/create', async (req, res) => {

    let {nome, email, senha, senhaRepita, cpf, telefone, dataNascimento, cep, 
        logradouro, complemento, bairro, localidade, uf, numeroDaCasa} = req.body

    cpf = cpf.replace(/\D/g, '')
    telefone = telefone.replace(/\D/g, '')
    cep = cep.replace(/\D/g, '')

    if(senha.length < 8){
        return res.render('erro', {mensagem: "Erro. Senha com menos de 8 dígitos."})
    }
    
    if(senha !== senhaRepita){
        return res.render('erro', {mensagem: 'Erro. Senhas diferentes.'})
    }
    
    // Logica para criptografar a senha que será inserida no banco de dados
    salt = bcrypt.genSaltSync(10)
    senha = bcrypt.hashSync(senha, salt)
    
    /**
     * Se o cliente já existe é feito um update em seus dados para ele se tornar cadastrado
     * aproveitando o mesmo id que ele usava
    */
    
    let cliente = await DAOCliente.verificaSeClienteExiste(cpf)
    if(cliente){
        cliente = await DAOCliente.updateClienteComReservaMasNaoEraCadastrado(nome, email, senha, cpf, telefone, dataNascimento, cep, logradouro, complemento, bairro, localidade, uf, numeroDaCasa)
        if(!cliente){
            return res.render('erro', {mensagem: 'Erro ao inserir cliente'})
        }
    } else {
        cliente = await DAOCliente.insert(nome, email, senha, cpf, telefone, dataNascimento, cep, logradouro, complemento, bairro, localidade, uf, numeroDaCasa)
        if(!cliente){
            return res.render('erro', {mensagem: 'Erro ao inserir cliente'})
        }
    }

    if(cliente){
        req.session.cliente = {cpf: cliente.cpf, nome: cliente.nome, email: cliente.email}
        console.log(cliente.nome,"criado...");
        return res.redirect('/')
    } else {
        return res.render('erro', {mensagem: 'Erro ao inserir cliente'})
    }
})

routerCliente.get('/admin/cliente/lista/:mensagem?', autorizacao, (req, res) => {
    DAOCliente.getAll().then(clientes => {
        if(clientes){
            return res.render('admin/cliente/cliente', {user: adminNome(req, res), clientes: clientes, mensagem: req.params.mensagem? 
                "Não é possivel excluir um cliente já refereciado por uma locação":""})
        } else {
            return res.render('erro', {mensagem: "Erro na listagem de clientes."})
        }
    })
})


module.exports = routerCliente
