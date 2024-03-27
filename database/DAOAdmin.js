const Admin = require('../model/Admin')
const bcrypt = require('bcryptjs')


class DAOAdmin {

    static async insert(nome, email, senha){
        try{
            await Admin.create({nome: nome, email: email, senha: senha})
            return true
        }
        catch(error){
            console.log(error.toString());
            return false
        }
    }

    static async login(email, senha){
        try{
            let admin = await Admin.findOne({where: {email: email}})
            if(admin){
                if(bcrypt.compareSync(senha, admin.senha)){
                    return admin
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

module.exports = DAOAdmin