const Usuario = require('../model/Usuario')
const bcrypt = require('bcryptjs')


class DAOUsuario {

    static async insert(nome, email, senha){
        try{
            await Usuario.create({nome: nome, email: email, senha: senha})
            return true
        }
        catch(error){
            console.log(error.toString());
            return false
        }
    }

    static async login(email, senha){
        try{
            let usuario = await Usuario.findOne({where: {email: email}})
            if(usuario){
                if(bcrypt.compareSync(senha, usuario.senha)){
                    return usuario
                }
            } else {
                return undefined
            }
            
        }
        catch(error){
            console.log(error.toString());
            return undefined
        }
    }

}

module.exports = DAOUsuario