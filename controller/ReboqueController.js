const DiariaCalculo = require('../bill_modules/DiariaCalculo')
const DAOCliente = require('../database/DAOCliente')
const DAOReboque = require('../database/DAOReboque')
const DAOReserva = require('../database/DAOReserva')
const {adminNome} = require('../helpers/getSessionNome')
const moment = require('moment-timezone')
const DAOPagamento = require('../database/DAOPagamento')
const { estornoPagamento, receiveInCash, criarCobranca } = require('../helpers/API_Pagamentos')




class ReboqueController {

    static async getReservar(req, res){
        const reboquePlaca = req.params.placa
        const reservas = await DAOReserva.getAtivasDesteReboque(reboquePlaca)
        if(!reservas){
            return res.render('erro', {mensagem: `Erro ao buscar reservas deste reboque: ${reboquePlaca}`})
        }
        const reboque = await DAOReboque.getOne(reboquePlaca)
        if(!reboque){
            return res.render('erro', {mensagem: `Erro ao buscar reboque: ${reboquePlaca}`})
        }
        return res.render('reboque/reservar', {user: "", mensagem: "", reboque: reboque, reservas: reservas})
    
    }
    static async postReservar(req, res){
        let {cpf, reboquePlaca, horaInicio, horaFim, dataInicio, dataFim, formaPagamento} = req.body
        cpf = cpf.replace(/\D/g, '')

        // SE O USUÁRIO NÃO INTERAGIR COM O DATEPICKER, AS DATAS SERÃO DEFINIDAS COMO HOJE E AMANHÃ
        if(dataInicio == '' || dataFim == ''){
            let hoje = new Date()
            let amanha = new Date()
            amanha.setDate(hoje.getDate() +1)
            dataInicio = hoje
            dataFim = amanha
        }

        dataInicio = moment.tz(new Date(dataInicio), 'America/Sao_Paulo');
        dataFim = moment.tz(new Date(dataFim), 'America/Sao_Paulo');

        dataInicio = new Date(dataInicio)
        dataFim = new Date(dataFim)
        dataInicio.setHours(horaInicio, 0, 0)
        dataFim.setHours(horaFim, 0, 0)

        dataInicio = moment.tz(dataInicio, 'America/Sao_Paulo');
        dataFim = moment.tz(dataFim, 'America/Sao_Paulo');
    
        let cliente = await DAOCliente.getOne(cpf)
        if(!cliente){
            return res.render('erro', {mensagem: "Erro ao buscar cliente"})
        }

        const reboque = await DAOReboque.getOne(reboquePlaca)
        if(!reboque){
            return res.render('erro', {mensagem: "Erro ao buscar reboque"})
        }
    
        // CALCULA VALORES E APLICA DESCONTOS PARA CLIENTES CADASTRADOS E LOGADOS
        let dias = DiariaCalculo.calculaNumeroDeDias(dataInicio, dataFim)
        let valorTotalDaReserva = DiariaCalculo.calculaTotal(dataInicio, dataFim, reboque.valorDiaria)
        let valorTotalDaReservaComDesconto = DiariaCalculo.calculaTotal(dataInicio, dataFim, reboque.valorDiaria)

        const reserva = {
            'reboquePlaca': reboquePlaca,
            'dataInicio': dataInicio,
            'dataFim': dataFim, 
            'horaInicio': horaInicio,
            'horaFim': horaFim,
            'valorDiaria': valorTotalDaReserva/dias, 
            'dias': dias, 
            'valorTotalDaReserva': valorTotalDaReserva,
            'desconto': valorTotalDaReserva - valorTotalDaReservaComDesconto,
            'formaPagamento': formaPagamento,
        }
    
        return res.render('reboque/confirmar', {user:'', reboque: reboque, cliente: cliente, reserva: reserva, mensagem: '' })
    
    }
    static async postGerarReserva(req, res){
        
        let {reservaStr, clienteStr} = req.body

        const reservaObj = JSON.parse(reservaStr);
        const clienteObj = JSON.parse(clienteStr);

        let dataInicio = moment.tz(new Date(reservaObj.dataInicio), 'America/Sao_Paulo');
        let dataFim = moment.tz(new Date(reservaObj.dataFim), 'America/Sao_Paulo');

        
        // Criar um identificador único para o formulário
        const formIdentifier = `${reservaObj.reboquePlaca}-${reservaObj.dataInicio}-${reservaObj.dataFim}`;
    
        // Verificar se o formulário já foi enviado com base no identificador
        if (req.session.submittedForms && req.session.submittedForms.includes(formIdentifier)) {
            console.log("O formulário está duplicado. Envio cancelado!");
            return res.render('erro', { mensagem: 'Erro. Formulário duplicado!' });
        }

        let data_vencimento = moment.tz( new Date(), 'America/Sao_Paulo' )
        data_vencimento = data_vencimento.format('YYYY-MM-DD')
        
        // Cria cobrança na API de pagamentos
        const retorno = await criarCobranca(clienteObj.cpf, clienteObj.nome, clienteObj.telefone, clienteObj.email, reservaObj.valorTotalDaReserva, data_vencimento, dataInicio, dataFim, reservaObj.reboquePlaca, reservaObj.formaPagamento)
        if(!retorno){
            return res.render('erro', { mensagem: "Erro ao criar cobrança PIX."})
        }        

        // Adiciona 60 minutos como tempo de expiração da reservas caso não seja paga
        var reservaDataExpiracao = moment.tz(new Date(), 'America/Sao_Paulo')
        reservaDataExpiracao.add(60, 'minutes')
        
        // PAGAMENTO INSERT
        const codigoPagamento = await DAOPagamento.insert(retorno.id_cobranca, reservaObj.valorTotalDaReserva, retorno.billingType, reservaDataExpiracao)
        if(!codigoPagamento){
            return res.render('erro', { mensagem: "Erro ao criar pagamento."})
        }

        let situacaoReserva = 'APROVADO'
        if(reservaObj.formaPagamento == 'DINHEIRO'){
            situacaoReserva = 'AGUARDANDO_ACEITACAO'
        }

        // RESERVA INSERT
        const reserva = await DAOReserva.insert(reservaObj.dataInicio, reservaObj.dataFim, (reservaObj.valorTotalDaReserva/reservaObj.dias), reservaObj.dias, reservaObj.valorTotalDaReserva, clienteObj.cpf, reservaObj.reboquePlaca, codigoPagamento, situacaoReserva)
        if(!reserva){
            return res.render('erro', {mensagem: 'Erro ao criar reserva.'})
        }
        
        // Marcar o formulário específico como enviado
        console.log("Marcando formulário como enviado...");
        req.session.submittedForms = req.session.submittedForms || [];
        req.session.submittedForms.push(formIdentifier);
        
        return res.redirect('/reserva/admin/painel')
    
    }

    static async getNovo(req, res) {
        res.render('reboque/novo', {user: adminNome(req, res), mensagem: ""})
    }
    
    static async postNovo(req, res) {
        let {modelo, placa, valorDiaria, cor, pesoBruto, comprimento, largura, altura, quantidadeDeEixos, anoFabricacao, ativo, descricao} = req.body
        let foto = `img/${req.file.filename}` 
        DAOReboque.insert(modelo, placa, valorDiaria, cor, foto, pesoBruto, comprimento, largura, altura, quantidadeDeEixos, anoFabricacao, ativo, descricao).then(inserido => {
            if(inserido){
                res.render('reboque/novo', {user: adminNome(req, res), mensagem: "Reboque incluído!"})
            } else {
                res.render('erro', {mensagem: "Não foi possível incluir reboque"})
            }
        })
    }
    
    static async getLista(req, res) {
        DAOReboque.getAll().then(reboques => {
            if(reboques){
                res.render('reboque/lista', {user: adminNome(req, res), reboques: reboques, mensagem: ""})
            } else {
                res.render('erro', {mensagem: "Erro ao listar reboques."})
            }
        })
    }
    
    static async getEditar(req,res) {
        let placa = req.params.placa
        DAOReboque.getOne(placa).then(reboque => {
            if(reboque){
                res.render('reboque/editar', {user: adminNome(req, res), reboque: reboque})
            } else {
                res.render('erro', {mensagem: "Erro na tentativa de edição. "})
            }
        })
    }
    
    static async postEditar(req,res) {
        let {modelo, placa, valorDiaria, cor} = req.body
        // console.log("nome da foto",req.file.filename);
        let foto = `img/${req.file.filename}` 
        // let foto = `${req.file.filename}` 
        DAOReboque.update(foto, modelo, placa, valorDiaria, cor).then(atualizado => {
            if(atualizado){
                res.redirect('/reboque/lista')
            } else {
                res.render('erro', {mensagem: "Erro ao atualizar reboque."})
            }
        })
    }
    
    static async getDeletar(req, res) {
        let reboquePlaca = req.params.reboquePlaca
        DAOReboque.delete(reboquePlaca).then(excluido =>{
            if(excluido){
                res.redirect('/reboque/lista')
            } else {
                res.render('erro', {mensagem: "Erro ao excluir"})
            }
        })
    }

    static async APIAtivarReboque(req, res) {

        try {
            const { placa } = req.params;
            const { ativo } = req.body;
            const resultado = await DAOReboque.ativar(placa, ativo)
            if (resultado) {
                return res.json({ success: true });
            } else {
                return res.json({ success: false });
            }
        } catch (error) {
            console.error(error);
            res.json({ success: false });
        }
        
    }

}


module.exports = ReboqueController