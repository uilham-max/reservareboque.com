const DAOAdmin = require('../database/DAOAdmin')
const bcrypt = require('bcryptjs')
const { adminNome } = require('../helpers/getSessionNome')

class AdminController {

    static async getNovo(req, res) {
        res.render('admin/novo', {user: adminNome(req, res), mensagem: ''})
    }
    
    static async postNovo(req, res) {
        let {nome, email, senha, cpf} = req.body,
            salt = bcrypt.genSaltSync(10)
        senha = bcrypt.hashSync(senha, salt)
        if(DAOAdmin.insert(nome, email, senha, cpf)){
            res.redirect('/reserva/admin/painel')
        } else {
            res.render('erro', {mensagem: "Erro ao tentar incluir usuário."})
        }
    }
    
    static async getEntrar(req, res) {
        res.render('admin/entrar', {user: adminNome(req, res), mensagem: ""})
    }
    
    static async postEntrar(req, res) {
        let {email, senha} = req.body
        DAOAdmin.login(email, senha).then(admin => {
            if(admin){
                if(bcrypt.compareSync(req.body.senha, admin.senha)){
                    req.session.admin = {id: admin.id, nome: admin.nome, email: admin.email}
                    res.redirect('/reserva/admin/painel')
                } else {
                    res.render('admin/entrar', {mensagem: "Usuário ou senha inválidos."})
                }
            } else {
                res.render('admin/entrar', {mensagem: "Usuário ou senha inválidos."})
            }
        })
    }
    
    static async getSair(req, res) {
        req.session.admin = undefined
        res.redirect("/")
    }

}


module.exports = AdminController