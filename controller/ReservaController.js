const express = require('express')
const routerReserva = express.Router()
const DAOReserva = require('../database/DAOReserva')
const DAOCliente = require('../database/DAOCliente')
const DAOReboque = require('../database/DAOReboque')
var {clienteNome, adminNome} = require('../helpers/getSessionNome')
const autorizacao = require('../autorizacao/autorizacao')
const Diaria = require('../bill_modules/Diaria')
const { estornoPagamento, receiveInCash, criarCobranca } = require('../helpers/API_Pagamentos')
const DAOPagamento = require('../database/DAOPagamento')
const clienteAutorizacao = require('../autorizacao/clienteAutorizacao')
const moment = require('moment-timezone')
const Grafico = require('../bill_modules/Grafico')
const emailPagamentoAprovado = require('../helpers/emailPagamentoAprovado')

routerReserva.get('/cliente/reserva/periodo/:reboquePlaca?', (req, res) => {
    let reboquePlaca = req.params.reboquePlaca
    DAOReserva.getAtivasPorID(reboquePlaca).then(reservas => {
        DAOReboque.getOne(reboquePlaca).then(reboque => {
            if(reboque){
                res.render('cliente/reserva/periodo', {user: clienteNome(req, res), mensagem: "", reboque: reboque, reservas: reservas})
            } else {
                res.render('erro', {mensagem: "Erro ao mostrar reboque."})
            }
        })
    })
})

routerReserva.post('/cliente/reserva/formulario', (req, res) => {
    let {reboquePlaca, dataInicio, dataFim} =  req.body

    if(dataInicio > dataFim){
        res.render('erro', {mensagem: 'Erro com as datas.'})
        return
    }

    DAOReserva.getVerificaDisponibilidade(reboquePlaca, dataInicio, dataFim).then( resposta => {
        DAOReboque.getOne(reboquePlaca).then(reboque => {
            if(reboque && resposta.length === 0){
                
                let dias = Diaria.calcularDiarias(dataInicio, dataFim)
                let valorTotalDaReserva = Diaria.calcularValorTotalDaReserva(dias, reboque.valorDiaria)
                let valorTotalDaReservaComDesconto = Diaria.aplicarDescontoNaDiariaParaCliente(valorTotalDaReserva, dias)
                res.render('cliente/reserva/formulario', {user: clienteNome(req, res), dias: dias, reboque: reboque, dataInicio: dataInicio, dataFim: dataFim, valorTotalDaReserva: valorTotalDaReserva,  valorTotalDaReservaComDesconto: valorTotalDaReservaComDesconto,})

            } else {
                
                DAOReserva.getAtivasPorID(reboquePlaca).then(reservas => {
                    res.render('cliente/reserva/periodo', {user: clienteNome(req, res), reboque: reboque, reservas: reservas, mensagem: "Indisponível para esta data."})
                })
                
            }
        })
    } )
})

routerReserva.post('/cliente/reserva/confirmar', async (req, res) => {
    
    let {nome, cpf, telefone, email, cep, logradouro, complemento, localidade,
    numeroDaCasa, reboquePlaca, horaInicio, horaFim, dataInicio, dataFim, formaPagamento} = req.body

  
    // Injeta a hora na data de inicio
    dataInicio = moment.tz(dataInicio, 'America/Sao_Paulo').set({
        hour: horaInicio,
        minute: 0,
        second: 0,
        millisecond: 0
    });
    dataInicio = dataInicio.format()

    // Injeta a hora na data de fim
    dataFim = moment.tz(dataFim, 'America/Sao_Paulo').set({
        hour: horaFim,
        minute: 0,
        second: 0,
        millisecond: 0
    });
    dataFim = dataFim.format()


    /**
     * Este é um tratamento para caso o cliente tente realizar uma reserva dentro de um periodo de indisponibilidade
    */

    let resposta = await DAOReserva.getVerificaDisponibilidade(reboquePlaca, dataInicio, dataFim)
    if(resposta.length > 0){
        let reboque = await DAOReboque.getOne(reboquePlaca)
        let reservas = await DAOReserva.getAtivasPorID(reboquePlaca)
        res.render('cliente/reserva/periodo', {user: clienteNome(req, res), reboque: reboque, reservas: reservas, mensagem: "Indisponível para esta data."})
        return
    }

    /**
     * Se o cliente que estiver acessando esta rota estiver for cliente e estiver logado, ele será usado para montar 
     *  o objeto cliente que será usado para criar uma cobrança
    */

    let clienteLogado = {}
    if(req.session.cliente){
        clienteLogado = await DAOCliente.getOne(req.session.cliente.cpf)
        if(!clienteLogado){
            res.render('erro', {mensagem: "Erro ao buscar cliente"})
            return
        }
    }

    /**
     * Será montado um objeto cliente com os dados ou do formulario da reserva ou do cliente cadastrado no banco de dados.
     * Quando um cliente é cadastrado e está logado ele não precisa preencher o formulario da reserva.
     * Esse objeto é motado para ser enviado para a tela de confirmação dos dados do cliente e da reserva e posteriormente 
     * serem usados para inserir no banco de dados
    */

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

    /**
     * Realiza a busca do reboque que será reservado para que seus dados como valor de cada diaria 
     * para realizar calculos de descontos
    */

    let reboque = await DAOReboque.getOne(reboquePlaca)
    if(!reboque){
        res.render('erro', {mensagem: "Erro ao buscar reboque"})
        return
    }


    // CALCULA VALORES E APLICA DESCONTOS PARA CLIENTES CADASTRADOS E LOGADOS
    let dias = Diaria.calcularDiarias(dataInicio, dataFim)
    let valorTotalDaReserva = Diaria.calcularValorTotalDaReserva(dias, reboque.valorDiaria)
    let valorTotalDaReservaComDesconto = Diaria.aplicarDescontoNaDiariaParaCliente(valorTotalDaReserva, dias)
    
    /**
     * É montado um objeto reserva com os dados necessario para inserir no banco de dados
    */

    reserva = {
        'reboquePlaca': reboquePlaca,
        'dataInicio': dataInicio,
        'dataFim': dataFim,
        'horaInicio': horaInicio,
        'horaFim': horaFim,
        'valorDiaria': req.session.cliente ? reboque.valorDiaria/dias : reboque.valorDiaria, 
        'dias': dias, 
        'valorTotalDaReserva': req.session.cliente ? valorTotalDaReservaComDesconto : valorTotalDaReserva,
        'desconto': valorTotalDaReserva - valorTotalDaReservaComDesconto,
        'formaPagamento': formaPagamento,
    }

    /**
     * Finalmente o servidor retorna a página de confirmação dos dados com os objetos criados
    */

    res.render('cliente/reserva/confirmar', 
        {user: clienteNome(req, res), reboque: reboque, cliente: cliente, reserva: reserva, mensagem: '' 
    })

})

routerReserva.get('/cliente/reserva/realizado/:formaPagamento?', async (req, res) => {
    if(req.session.cliente){
        emailPagamentoAprovado(req.session.cliente.email)
    }
    return res.render('cliente/reserva/sucesso', {user: clienteNome(req, res), formaPagamento: req.params.formaPagamento, mensagem: ""})
})

routerReserva.post('/cliente/reserva/qrcode', async (req, res) => {
    
    let {nome, cpf, telefone, email, cep, logradouro, complemento, 
    localidade, numeroDaCasa, reboquePlaca, dataInicio, dataFim, formaPagamento} = req.body

    // Criar um identificador único para o formulário
    const formIdentifier = `${reboquePlaca}-${dataInicio}-${dataFim}`;

    /**
     * Verifica se não foi criada uma cobrança para essa reserva.
    */

    // Verificar se o formulário já foi enviado com base no identificador
    if (req.session.submittedForms && req.session.submittedForms.includes(formIdentifier)) {
        console.log("O formulário está duplicado. Envio cancelado!");
        return res.render('erro', { mensagem: 'Erro. Formulário duplicado!' });
    }
    
    // Remove caracteres não numéricos para inserir no banco de dados
    cpf = cpf.replace(/\D/g, '')
    telefone = telefone.replace(/\D/g, '')
    cep = cep.replace(/\D/g, '')

    // Inicializa o valor da diária com 0
    let valorDiaria = 0

    // BUSCAR REBOQUE NO BD
    let reboque = await DAOReboque.getOne(reboquePlaca)
    if(!reboque){
        return res.render('erro', {mensagem: 'erro ao buscar reboque'})
    }
    
    /**
     * Calcula o valos da diária com desconto para clientes com ou sem cadastro
    */

    let dias = Diaria.calcularDiarias(dataInicio, dataFim)
    let valorTotalDaReserva = Diaria.calcularValorTotalDaReserva(dias, reboque.valorDiaria)
    let valorTotalDaReservaComDesconto = Diaria.aplicarDescontoNaDiariaParaCliente(valorTotalDaReserva, dias)
    
    /**
     * Se o cliente estiver cadastrado e logado, será calculado o desconto nas diarias
     * O cliente que está fazendo a reserva será registrado no banco de dados com status registrado = false
    */

    let cliente = {}
    if(req.session.cliente){
        // O cliente está logado!
        cliente = await DAOCliente.getOne(req.session.cliente.cpf)
        if(!cliente){
            return res.render('erro', {mensagem: "Erro ao buscar cliente"})
        }
        // Aplica o desconto na reserva
        valorDiaria = valorTotalDaReservaComDesconto/dias
        valorTotalDaReserva = valorTotalDaReservaComDesconto
    } else {
        // O cliente não está logado!
        cliente = await DAOCliente.verificaSeClienteExiste(cpf)
        if(!cliente){ 
            cliente = await DAOCliente.insertClienteQueNaoQuerSeCadastrar(nome, cpf, telefone, email, cep, logradouro, complemento, localidade, numeroDaCasa)
            if(!cliente){
                return res.render('erro', {mensagem: 'erro ao criar cliente'})
            }  
        }
        // A diaria não recebe desconto
        valorDiaria = reboque.valorDiaria
    }


    // CHAMA A API DO SISTEMA DE PAGAMENTO
    let retorno;
    try{
        let data_vencimento = moment.tz( new Date(), 'America/Sao_Paulo' )
        data_vencimento = data_vencimento.format('YYYY-MM-DD')

       

        retorno = await criarCobranca(cliente.cpf, cliente.nome, telefone, email, valorTotalDaReserva, data_vencimento, dataInicio, dataFim, reboque.placa, formaPagamento)
    }catch(error){
        return res.render('erro', { mensagem: "Erro ao criar cobrança PIX."})
    }finally{

        // Adiciona 60 minutos como tempo de expiração da reservas caso não seja paga
        var dataExpiracao = moment.tz(new Date(), 'America/Sao_Paulo')
        dataExpiracao.add(60, 'minutes')

        // PAGAMENTO INSERT
        const codigoPagamento = await DAOPagamento.insert(retorno.id_cobranca, retorno.netValue, retorno.billingType, dataExpiracao)
        if(!codigoPagamento){
            return res.render('erro', { mensagem: "Erro ao criar pagamento."})
        }

        let situacaoReserva = 'AGUARDANDO_PAGAMENTO'
        if(formaPagamento == 'DINHEIRO'){
            situacaoReserva == 'AGUARDANDO_ACEITACAO'
        }


        // RESERVA INSERT
        const reserva = await DAOReserva.insert(dataInicio, dataFim, valorDiaria, dias, retorno.netValue, cliente.cpf, reboquePlaca, codigoPagamento, situacaoReserva)
        if(!reserva){
            return res.render('erro', {mensagem: 'Erro ao criar reserva.'})
        } else {

            // Marcar o formulário específico como enviado
            console.log("Marcando formulário como enviado...");
            req.session.submittedForms = req.session.submittedForms || [];
            req.session.submittedForms.push(formIdentifier);

            if(formaPagamento == 'PIX'){
                return res.render('cliente/reserva/qrcode', {user: clienteNome(req, res), formaPagamento: formaPagamento, id_cobranca: retorno.id_cobranca, image: retorno.encodedImage, PIXCopiaECola: retorno.PIXCopiaECola, mensagem: ''})
            } else {
                return res.render('cliente/reserva/sucesso', {user: clienteNome(req, res), formaPagamento: formaPagamento, mensagem: ""})
            }
            //res.redirect(`${retorno.invoiceUrl}`)
        }

    }

})

routerReserva.post('/admin/reserva/pagamento/dinheiro', autorizacao, async (req, res)=>{

    let {codigoPagamento, valor} = req.body

    let data_pagamento = moment.tz( new Date(), 'America/Sao_Paulo' )
    data_pagamento = data_pagamento.format('YYYY-MM-DD')
    
    let response = await receiveInCash(codigoPagamento, valor, data_pagamento)
    await DAOReserva.atualizaSituacaoParaAprovado(codigoPagamento)
    
    if(!response){
        return res.render('erro', {mensagem: 'Erro ao acessar recurso'})
    }
    
    return res.redirect('/admin/painel')

})

routerReserva.get('/admin/reserva/situacao/:idReserva?/:situacao?', autorizacao, async (req, res) => {

    let idReserva = req.params.idReserva
    let situacao = req.params.situacao
    let resposta
    
    switch (situacao) {
        case 'APROVADO':
            resposta = await DAOReserva.atualizaSituacaoParaAndamento(idReserva)
            break
        case 'ANDAMENTO':
            resposta = await DAOReserva.atualizaSituacaoParaConcluido(idReserva)
            break
        default:
            return res.render('erro', {mensagem: "Erro ao atualizar situação da reserva"})
    }

    if(!resposta){
        return res.render('erro', {mensagem: "Erro ao atualizar situação da reserva"})
    }

    const reservas = await DAOReserva.getAtivas()
    if (!reservas) {
        return res.render('erro', { mensagem: "Erro na listagem de reservas." })
    }
    res.render('admin/painel', {user: adminNome(req, res), reservas: reservas, mensagem: "", dataJSON: await Grafico.reservas() })

})

routerReserva.get('/admin/reserva/lista', autorizacao, (req, res) => {
    DAOReserva.getAtivas().then(reservas => {
        if (reservas) {
            res.render('admin/reserva/lista', {user: adminNome(req, res), reservas: reservas, mensagem: "" })
        } else {
            res.render('erro', { mensagem: "Erro na listagem de reservas." })
        }
    })
})

routerReserva.get('/admin/reserva/historico', autorizacao, (req, res) => {
    DAOReserva.getRelatorioHistorico().then(reservas => {
        if (reservas) {
            res.render('admin/reserva/historico', {user: adminNome(req, res), reservas: reservas, mensagem: "" })
        } else {
            res.render('erro', { mensagem: "Erro na listagem do historico." })
        }
    })
})

routerReserva.post('/admin/reserva/filtrarHistorico', autorizacao, (req, res) => {
    let {dataInicio, dataFim} = req.body
    DAOReserva.getRelatorioHistorico(dataInicio, dataFim).then(reservas => {
        if(reservas){
            res.render('admin/reserva/historico', {user: adminNome(req, res), reservas: reservas})
        } else {
            res.render('erro', {mensagem: "Erro ao filtrar."})
        }
    })
})

routerReserva.get('/admin/reserva/lucro', autorizacao, async (req, res) => {
    let reservas = await DAOReserva.getRelatorioLucro()
    if(reservas){
        let lucroTotal = await DAOReserva.getLucroTotal()
        res.render('admin/reserva/lucro', {user: adminNome(req, res), lucroTotal: lucroTotal, reservas: reservas, mensagem: ""})
    } else {
        res.render('erro', {mensagem: "Erro ao listar lucros."})
    }
})

routerReserva.post('/admin/reserva/filtrar', autorizacao, async (req, res) => {
    let {dataInicio, dataFim} = req.body
    let reservas = await DAOReserva.getRelatorioLucro(dataInicio, dataFim)
    // console.log("Reservas relatorio lucro: ", reservas.map(reserva => reserva.toJSON()));
    if(reservas){
        let lucroTotal = await DAOReserva.getLucroTotal(dataInicio, dataFim)
        res.render('admin/reserva/lucro', {user: adminNome(req, res), lucroTotal: lucroTotal, reservas: reservas})
    } else {
        res.render('erro', {mensagem: "Erro ao filtrar lucros."})
    }
})

module.exports = routerReserva