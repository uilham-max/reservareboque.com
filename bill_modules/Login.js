const DAOAdmin = require("../database/DAOAdmin")
const DAOCliente = require("../database/DAOCliente")
const bcrypt = require('bcryptjs')


class Login{

    static async admin(email, senha, req){
        await DAOAdmin.login(email, senha).then(admin => {
            if(admin){
                if(bcrypt.compareSync(senha, admin.senha)){
                    req.session.admin = {id: admin.id, nome: admin.nome, email: admin.email}
                }
            }
        })
    }

    static async cliente(email, senha, req){
        await DAOCliente.login(email, senha).then(cliente => {
            if(cliente){
                if(bcrypt.compareSync(senha, cliente.senha)){
                    req.session.cliente = {cpf: cliente.cpf, nome: cliente.nome, email: cliente.email, senha: senha}
                    console.log(req.session.cliente.nome, "fez login...");
                }
            }
        })
    }


}

module.exports = Login
