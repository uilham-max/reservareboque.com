const DAOReboque = require('../database/DAOReboque')
const Login = require('../bill_modules/Login')
const {clienteNome} = require('../helpers/getSessionNome')

class IndexController{

    static async getIndex(req, res) {

        // await Login.cliente(process.env.CLIENTE_EMAIL_TESTE, process.env.CLIENTE_SENHA_TESTE, req)
    
        DAOReboque.getAll().then(reboques => {
            if(reboques){
                res.render('index', {user: clienteNome(req, res), mensagem: '',reboques: reboques})
            } else {
                res.render('erro', {mensagem: "Erro ao listar reboques."})
            }
        })
        
    }

}

module.exports = IndexController