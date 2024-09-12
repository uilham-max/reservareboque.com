const DAOReboque = require('../database/DAOReboque')
const {adminNome} = require('../helpers/getSessionNome')

class ReboqueController {

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

}


module.exports = ReboqueController