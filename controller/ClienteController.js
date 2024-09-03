const express = require('express')
const routerCliente = express.Router()
const DAOCliente =  require('../database/DAOCliente')
const autorizacao = require('../autorizacao/autorizacao')
const {adminNome, clienteNome} = require('../helpers/getSessionNome')
const bcrypt = require('bcryptjs')
const clienteAutorizacao = require('../autorizacao/clienteAutorizacao')
const DAOReserva = require('../database/DAOReserva')
const DAOReboque = require('../database/DAOReboque')


routerCliente.get('/cliente/reserva-detalhe/:reservaId?', clienteAutorizacao, async (req, res) => {
    
    let reserva = await DAOReserva.getOne(req.params.reservaId)
    res.render('cliente/reserva-detalhe', {user: clienteNome(req, res), mensagem: '', reserva: reserva})

})


routerCliente.post('/cliente/atualizar-reserva', clienteAutorizacao, (req, res) => {
    res.send('Recurso indisponivel no momento. Contate o suporte.')
})


routerCliente.get('/cliente/editar-reserva/:idReserva', clienteAutorizacao,  async (req, res) => {
    let idReserva = req.params.idReserva
    let reserva = await DAOReserva.getReserva(idReserva)
    if(!reserva){
        res.render('erro', {mensagem: "Erro ao obter reserva."})
    }
    DAOReserva.getAtivasPorID(reserva.dataValues.reboquePlaca).then(reservas => {
        DAOReboque.getOne(reserva.dataValues.reboquePlaca).then(reboque => {
            if(reboque){
                res.render('cliente/editar-reserva', {user: clienteNome(req, res), mensagem: "", reboque: reboque, reservas: reservas, reserva: reserva})
            } else {
                res.render('erro', {mensagem: "Erro ao mostrar reboque."})
            }
        })
    })
})



routerCliente.get('/cliente/minhas-locacoes', clienteAutorizacao, async (req, res) => {
    let clienteCpf
    if(req.session.cliente && req.session.cliente.cpf){
        clienteCpf = req.session.cliente.cpf
    }
    let locacoes = await DAOReserva.historicoLocacoes(clienteCpf)
    console.log('Reservas erro:',locacoes);
    if(!locacoes){
        res.render('erro', {mensagem: "Erro ao obter locações."})
    }
    res.render('cliente/minhas-locacoes', {user: clienteNome(req, res), mensagem: "", locacoes: locacoes})
})



routerCliente.get('/cliente/minhas-reservas', clienteAutorizacao, async (req, res) => {
    let clienteCpf
    if(req.session.cliente && req.session.cliente.cpf){
        clienteCpf = req.session.cliente.cpf
    }
    let reservas = await DAOReserva.getMinhasReservas(clienteCpf)
    if(reservas == ''){
        res.render('cliente/minhas-reservas', {user: clienteNome(req, res), reservas: reservas, mensagem: "Sua lista de reservas está vazia."})
    }
    res.render('cliente/minhas-reservas', {user: clienteNome(req, res), reservas: reservas, mensagem: ''})
})





// criado em 29/03/2024
routerCliente.post('/login/entrar', async (req, res) => {
    let {email, senha} = req.body
    DAOCliente.login(email, senha).then( cliente => {
        if(cliente){
            if(bcrypt.compareSync(senha, cliente.senha)){
                req.session.cliente = {cpf: cliente.cpf, nome: cliente.nome, email: cliente.email}
                console.log(req.session.cliente.nome, "fez login...");
                res.redirect('/')
            } else {
                
                res.render('login', {user: clienteNome(req, res), mensagem: 'Usuário ou senha inválidos.'})
            }
        } else {
            res.render('login', {user: clienteNome(req, res), mensagem: 'Usuário ou senha inválidos.'})
        }
    })

})


routerCliente.get('/cliente/logout', (req, res) => {
    console.log(req.session.cliente.nome,'fez logout...');
    req.session.cliente = undefined
    res.redirect('/')
})


// Data da criação 28/03/2024
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
        res.render('erro', {mensagem: "Erro. Senha com menos de 8 dígitos."})
    }
    
    if(senha !== senhaRepita){
        res.render('erro', {mensagem: 'Erro. Senhas diferentes.'})
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
            res.render('erro', {mensagem: 'Erro ao inserir cliente'})
        }
    } else {
        cliente = await DAOCliente.insert(nome, email, senha, cpf, telefone, dataNascimento, cep, logradouro, complemento, bairro, localidade, uf, numeroDaCasa)
        if(!cliente){
            res.render('erro', {mensagem: 'Erro ao inserir cliente'})
        }
    }

    if(cliente){
        req.session.cliente = {cpf: cliente.cpf, nome: cliente.nome, email: cliente.email}
        console.log(cliente.nome,"criado...");
        res.redirect('/')
    } else {
        res.render('erro', {mensagem: 'Erro ao inserir cliente'})
    }
})


// DEVO TESTAR ESSA MENSAGEM PASSADA POR PARAMENTRO, POIS AINDA NÃO SEI COMO ELA FUNCIONA
routerCliente.get('/cliente/lista/:mensagem?', autorizacao, (req, res) => {
    DAOCliente.getAll().then(clientes => {
        if(clientes){
            res.render('cliente/cliente', {user: adminNome(req, res), clientes: clientes, mensagem: req.params.mensagem? 
                "Não é possivel excluir um cliente já refereciado por uma locação":""})
        } else {
            res.render('erro', {mensagem: "Erro na listagem de clientes."})
        }
    })
})


routerCliente.get('/cliente/editar/:cpf', autorizacao, (req, res) => {
    let id = req.params.cpf
    DAOCliente.getOne(id).then(cliente => {
        if(cliente){
            res.render('cliente/editar', {user: adminNome(req, res), cliente: cliente} )
        } else {
            res.render('erro', {mensagem: "Erro na tentativa de edição de cliente"})
        }
    })
})



routerCliente.post('/cliente/atualizar', autorizacao,  (req,res) => {
    let {nome, cpf, telefone, endereco} = req.body
    DAOCliente.update(nome, cpf, telefone, endereco).then(cliente => {
        if(cliente){
            res.redirect('/cliente/lista')
        } else {
            res.render('erro', {user: adminNome(req, res), mensagem: "Não foi possível atualizar o cliente."})
        }
    })
})



module.exports = routerCliente
