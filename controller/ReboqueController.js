const DiariaCalculo = require('../bill_modules/DiariaCalculo')
const DAOCliente = require('../database/DAOCliente')
const DAOReboque = require('../database/DAOReboque')
const DAOReserva = require('../database/DAOReserva')
const {adminNome} = require('../helpers/getSessionNome')

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
        
        if(new Date().getDay() == dataInicio && horaInicio < new Date().getHours()){
            return res.render('erro', {mensagem: "A hora de início não pode ser menor que a hora atual."})
        }

        dataInicio = new Date(dataInicio)
        dataFim = new Date(dataFim)
        dataInicio.setHours(horaInicio, 0, 0)
        dataFim.setHours(horaFim, 0, 0)
    
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