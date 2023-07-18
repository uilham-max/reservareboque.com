const express = require('express')
const routerCliente = express.Router()
const DAOCliente =  require('../database/DAOCliente')


routerCliente.get('/cliente/novo', (req, res) => {
    res.render('cliente/novo', {mensagem: ""})
})

routerCliente.post('/cliente/salvar', (req, res) => {
    let {nome, cpf, telefone, logradouro} = req.body
    DAOCliente.insert(nome, cpf, telefone, logradouro).then(inserido => {
        if(inserido){
            res.render('cliente/novo', {mensagem: "Cliente incluído!"})
        } else {
            res.render('erro', {mensagem: "Não foi possível incluir o cliente!"})
        }
    })
})

// Trata a requisição para a renderização da página de listagem de clientes
// ????????????????????????????????????????????????????????????????????????
// Não entendi como que está funcionando a integridade referencial neste caso,
// se funciona da mesma forma que categorias e contatos
routerCliente.get('/cliente/lista/:mensagem?', (req, res) => {
    DAOCliente.getAll().then(clientes => {
        // console.log(clientes)
        if(clientes){
            res.render('cliente/cliente', {clientes: clientes, mensagem: req.params.mensagem? 
                "Não é possivel excluir um cliente já refereciado por uma locação":""})
        } else {
            res.render('erro', {mensagem: "Erro na listagem de clientes."})
        }
    })
})

routerCliente.get('/cliente/editar/:id', (req, res) => {
    let id = req.params.id
    DAOCliente.getOne(id).then(cliente => {
        if(cliente){
            res.render('cliente/editar', {cliente: cliente} )
        } else {
            res.render('erro', {mensagem: "Erro na tentativa de edição de cliente"})
        }
    })
})


routerCliente.post('/cliente/atualizar', (req,res) => {
    let {id, nome, cpf, telefone, logradouro} = req.body
    DAOCliente.update(id, nome, cpf, telefone, logradouro).then(cliente => {
        if(cliente){
            res.redirect('/cliente/lista')
        } else {
            res.render('erro', {mensagem: "Não foi possível atualizar o cliente."})
        }
    })
})


routerCliente.get('/cliente/excluir/:id', (req,res) => {
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
