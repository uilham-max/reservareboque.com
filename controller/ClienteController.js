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


// RECURSO PARA ALTERAR A DATA DE UMA RESERVA PELO CLIENTE
routerCliente.post('/cliente/editarDataReserva', clienteAutorizacao, async (req, res) => {

    let {idReserva, reboquePlaca, dataInicioAntiga, dataFimAntiga, dataInicioNova, dataFimNova, diarias} = req.body;

    console.log("Iniciando uma alteração de data para a reserva:____", idReserva);
    console.log("Período antido:____________________________________", dataInicioAntiga, "-", dataFimAntiga);
    console.log("Período novo:______________________________________", dataInicioNova, "-", dataFimNova);

    // CALCULA PERIODO EM HORAS DA RESERVA ANTIGA
    let horasPeriodoAntigo = diarias*24

    // RECUPERAR A HORA ATUAL DO PEDIDO
    let dataAtual = moment.tz(new Date(), 'America/Sao_Paulo');

    // PARSE PARA OBJETO MOMENT.TZ
    dataInicioAntiga = moment.tz(dataInicioAntiga, 'America/Sao_Paulo'); 
    
    // CALCULAR O PERIODO EM HORAS DA NOVA RESERVA
    dataInicioNova = moment.tz(dataInicioNova, 'America/Sao_Paulo')
    dataFimNova = moment.tz(dataFimNova, 'America/Sao_Paulo')
    let horasPeriodoNovo = dataFimNova.diff(dataInicioNova, 'hours')
    
    // CALCULAR DIFERENÇA EM HORAS DA DATA ATUAL E DATA SOLICITADA PARA A NOVA RESERVA
    let diferencaEmHorasPrazo = dataInicioAntiga.diff(dataAtual, 'hours');
    
    // O PRAZO DEVE SER MAIOR QUE 48 HORAS PARA FAZER A ALTERAÇÃO
    if(diferencaEmHorasPrazo < 48){
        console.log("Tentativa de alteração de data da reserva negada. Menos de 48h.");
        return res.render('erro', {mensagem: 'Erro. Faltam menos de 48h para retirada'});
    }
    
    // O PERIODO NÃO PODE SER MAIOR QUE O ORIGINAL
    if(horasPeriodoAntigo != horasPeriodoNovo){
        console.log("Tentativa de alteração de data da reserva negada. Período diferente.");
        return res.render('erro', {mensagem: 'Erro. O período deve ser o mesmo'});
    }

    // FORMATA AS DATAS PRA STRING
    dataInicioNova = dataInicioNova.format('YYYY-MM-DD')
    dataFimNova = dataFimNova.format('YYYY-MM-DD')
    
    
    // VERIFICA DISPONIBILIDADE
    let reservas = await DAOReserva.getVerificaDisponibilidade(reboquePlaca, dataInicioNova, dataFimNova); 

    // O PROPRIETÁRIO DA RESERVA PODE ALTERAR UMA DATA DENTRO DO SEU PERIODO
    let autorizacao = false
    if(reservas.length !== 0){
        // PERCORRE PELAS RESERVAS 
        reservas.forEach(reserva => {
            // AUTORIZA AO CLIENTE CRIAR UMA RESERVA NOVA DENTRO DO MESMO PERIODO DA RESERVA ANTIGA
            if(idReserva === reserva.dataValues.id){
                console.log("Alteração autorizada para nova data.");
                autorizacao = true
            }
        });
    }

    if(!autorizacao){
        console.log("Alteração não autorizada.");
        return res.render('erro', {mensagem: 'Não foi possível alterar a data. Erro ao verificar disponibilidade'}); 
    }

    // ACESSA O BANCO DE DADOS PARA REALIZAR A ALTERAÇÃO DAS DATAS
    let resposta = await DAOReserva.alterarDataReserva(idReserva, dataInicioNova, dataFimNova); 
    if(!resposta){
        return res.render('erro', {mensagem: 'Erro ao alterar a data da reserva'});
    }
    console.log("Data da reserva alterada com sucesso.");
    
    // RETORNA A RESERVA ALTERADA AO CLIENTE
    let reserva = await DAOReserva.getOne(idReserva); 
    res.render('cliente/reserva-detalhe', {user: clienteNome(req, res), mensagem: '', reserva: reserva});

   
});



routerCliente.get('/cliente/reserva-detalhe/:reservaId?', clienteAutorizacao, async (req, res) => {
    
    let reserva = await DAOReserva.getOne(req.params.reservaId)
    res.render('cliente/reserva-detalhe', {user: clienteNome(req, res), mensagem: '', reserva: reserva})

})


routerCliente.get('/cliente/editar-reserva/:idReserva', clienteAutorizacao,  async (req, res) => {
    
    let idReserva = req.params.idReserva

    let reserva = await DAOReserva.getReserva(idReserva)
    if(!reserva){
        res.render('erro', {mensagem: "Erro ao obter reserva."})
    }

    let reboquePlaca = reserva.dataValues.reboquePlaca

    // NÃO PODE ALTERAR A DATA DE UMA RESERVA EM ANDAMENTO
    if(reserva.dataValues.situacao == 'ANDAMENTO'){
        res.render('erro', {mensagem: "Erro. Não pode alterar a data de uma reserva em andamento."})
    }
    // console.log(reserva.dataValues.situacao);
    DAOReserva.getAtivasPorID(reboquePlaca).then(reservas => {
        DAOReboque.getOne(reboquePlaca).then(reboque => {
            if(reboque){
                res.render('cliente/editar-reserva', {user: clienteNome(req, res), mensagem: "", reboque: reboque, reservas: reservas, reserva: reserva, idReserva: idReserva})
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
