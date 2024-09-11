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

// CANCELAMENTO DE RESERVA PELO CLIENTE
routerCliente.get('/cliente/reserva/guardar/:idReserva?', clienteAutorizacao, async (req, res) => {

    console.log("Executando adiamento de reserva...");

    const reserva = await DAOReserva.getOne(req.params.idReserva)

    let dataInicio = moment(reserva.dataSaida)
    let dataChegada = moment(reserva.dataChegada)
    let dataAtual =  moment.tz( new Date(), 'America/Sao_Paulo' )

    if (dataInicio.diff(moment.tz(new Date(), 'America/Sao_Paulo'), 'hours') < 48) {
        console.log("Tentativa de alteração de data da reserva negada. Menos de 48h.");
        return res.render('erro', { mensagem: 'Erro. Faltam menos de 48h para a retirada' });
    }

    

    
})


// SUJESTÃO: '/cliente/reserva/edita'
routerCliente.get('/cliente/reserva/editar/:idReserva', clienteAutorizacao,  async (req, res) => {
    
    let idReserva = req.params.idReserva

    let reserva = await DAOReserva.getReserva(idReserva)
    if(!reserva){
        return res.render('erro', {mensagem: "Erro ao obter reserva."})
    }

    let reboquePlaca = reserva.dataValues.reboquePlaca

    // NÃO PODE ALTERAR A DATA DE UMA RESERVA EM ANDAMENTO
    if(reserva.dataValues.situacaoReserva == 'ANDAMENTO'){
        return res.render('erro', {mensagem: "Erro. Não pode alterar a data de uma reserva em andamento."})
    }
    // console.log(reserva.dataValues.situacaoReserva);
    DAOReserva.getAtivasPorID(reboquePlaca).then(reservas => {
        DAOReboque.getOne(reboquePlaca).then(reboque => {
            if(reboque){
                res.render('cliente/reserva/editar', {user: clienteNome(req, res), mensagem: "", reboque: reboque, reservas: reservas, reserva: reserva, idReserva: idReserva})
            } else {
                res.render('erro', {mensagem: "Erro ao mostrar reboque."})
            }
        })
    })
})


// ENDPOINT PARA ALTERAR A DATA DE UMA RESERVA PELO CLIENTE
routerCliente.post('/cliente/reserva/editar', clienteAutorizacao, async (req, res) => {
    try {
        let { idReserva, reboquePlaca, dataInicioAntiga, dataFimAntiga, dataInicioNova, dataFimNova, diarias, horaInicio, horaFim } = req.body;


        // PARSE PARA OBJETO MOMENT.TZ E CONVERTE PARA UTC
        dataInicioAntiga = moment.tz(new Date(dataInicioAntiga), 'America/Sao_Paulo');
        dataFimAntiga = moment.tz( new Date(dataFimAntiga), 'America/Sao_Paulo');
        dataInicioNova = moment.tz(dataInicioNova, 'America/Sao_Paulo');
        dataFimNova = moment.tz(dataFimNova, 'America/Sao_Paulo');

        // Injeta a hora na data de inicio
        dataInicioNova = moment.tz(dataInicioNova, 'America/Sao_Paulo').set({
            hour: horaInicio,
            minute: 0,
            second: 0,
            millisecond: 0
        });

        // Injeta a hora na data de fim
        dataFimNova = moment.tz(dataFimNova, 'America/Sao_Paulo').set({
            hour: horaFim,
            minute: 0,
            second: 0,
            millisecond: 0
        });

        
        // O MOMENTO DO PEDIDO DEVE SER MAIOR QUE 48 HORAS PARA FAZER A ALTERAÇÃO DA DATA DA RESERVA
        if (dataInicioAntiga.diff(moment.tz(new Date(), 'America/Sao_Paulo'), 'hours') < 48) {
            console.log("Tentativa de alteração de data da reserva negada. Menos de 48h.");
            return res.render('erro', { mensagem: 'Erro. Faltam menos de 48h para a retirada' });
        }

        // O PERÍODO NOVO NÃO PODE SER MAIOR QUE O ANTIGO
        if ((diarias * 24) !== dataFimNova.diff(dataInicioNova, 'hours')) {
            console.log("Tentativa de alteração de data da reserva negada. Período diferente.");
            return res.render('erro', { mensagem: 'Erro. O período deve ser o mesmo' });
        }

        // FORMATA AS DATAS PARA STRING PARA INSERIR NO BD
        dataInicioNova = dataInicioNova.format();
        dataFimNova = dataFimNova.format();
        
        // VERIFICA DISPONIBILIDADE
        let reservas = await DAOReserva.getVerificaDisponibilidade(reboquePlaca, dataInicioNova, dataFimNova); 

        // ENCONTROU UMA OU DUAS RESERVAS DENTRO DO PERÍODO ESCOLHIDO PELO CLIENTE
        if (reservas.length !== 0) {
            let autorizado = false;

            reservas.forEach(reserva => {
                if (idReserva === reserva.dataValues.id) {
                    console.log("Alteração autorizada para nova data.");
                    autorizado = true;
                }
            });

            if (!autorizado) {
                console.log("Alteração não autorizada.");
                return res.render('erro', { mensagem: 'Não foi possível alterar a data. Erro ao verificar disponibilidade' }); 
            }
        }

        // ACESSA O BANCO DE DADOS PARA REALIZAR A ALTERAÇÃO DAS DATAS
        let resposta = await DAOReserva.alterarDataReserva(idReserva, dataInicioNova, dataFimNova); 
        if (!resposta) {
            return res.render('erro', { mensagem: 'Erro ao alterar a data da reserva' });
        }
        console.log("Data da reserva alterada com sucesso.");

        // RETORNA A RESERVA ALTERADA AO CLIENTE
        let reserva = await DAOReserva.getOne(idReserva); 
        res.render('cliente/reserva/detalhe', { user: clienteNome(req, res), mensagem: '', reserva: reserva });
    } catch (error) {
        console.error("Erro ao alterar a data da reserva:", error);
        res.render('erro', { mensagem: 'Erro interno. Por favor, tente novamente mais tarde' });
    }
});


// SUJESTÃO: '/cliente/reserva/detalhe'
routerCliente.get('/cliente/reserva/detalhe/:reservaId?', clienteAutorizacao, async (req, res) => {
    
    let reserva = await DAOReserva.getOne(req.params.reservaId)
    console.log(reserva.dataValues.dataSaida);
    return res.render('cliente/reserva/detalhe', {user: clienteNome(req, res), mensagem: '', reserva: reserva})

})




// SUJESTÃO: '/cliente/reserva/concluida'
routerCliente.get('/cliente/reserva/concluido', clienteAutorizacao, async (req, res) => {
    let clienteCpf
    if(req.session.cliente && req.session.cliente.cpf){
        clienteCpf = req.session.cliente.cpf
    }
    let locacoes = await DAOReserva.historicoLocacoes(clienteCpf)
    console.log('Reservas erro:',locacoes);
    if(!locacoes){
        return res.render('erro', {mensagem: "Erro ao obter locações."})
    }
    return res.render('cliente/reserva/concluido', {user: clienteNome(req, res), mensagem: "", locacoes: locacoes})
})


// SUJESTÃO: '/cliente/reserva/lista'
routerCliente.get('/cliente/reserva/lista', clienteAutorizacao, async (req, res) => {
    let clienteCpf
    if(req.session.cliente && req.session.cliente.cpf){
        clienteCpf = req.session.cliente.cpf
    }
    let reservas = await DAOReserva.getMinhasReservas(clienteCpf)
    if(reservas == ''){
        return res.render('cliente/reserva/lista', {user: clienteNome(req, res), reservas: reservas, mensagem: "Sua lista de reservas está vazia."})
    }
    return res.render('cliente/reserva/lista', {user: clienteNome(req, res), reservas: reservas, mensagem: ''})
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


// SUJESTÃO: '/cliente/cadastro'
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


// DEVO TESTAR ESSA MENSAGEM PASSADA POR PARAMENTRO, POIS AINDA NÃO SEI COMO ELA FUNCIONA
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
