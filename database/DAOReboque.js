const Reboque = require('../model/Reboque.js')

class DAOReboque {

    static async insert(modelo, placa, valorDiaria, cor, foto, pesoBruto, comprimento, largura, altura, quantidadeDeEixos, anoFabricacao, ativo, descricao){
        console.log();
        
        try{
            await Reboque.create({modelo, placa, valorDiaria, cor, foto, pesoBruto, comprimento, largura, altura, quantidadeDeEixos, anoFabricacao, ativo, descricao})
            return true
        }
        catch(error){
            console.log(error.toString())
            return false
        }
    }

    static async update(foto, id, modelo, placa, valorDiaria, cor){
        try{
            await Reboque.update({foto: foto, modelo: modelo, placa: placa, valorDiaria: valorDiaria, cor: cor, foto: foto}, {where: {id: id}})
            return true
        }
        catch(error){
            console.log(error.toString())
            return false
        }
    }

    static async delete(id){
        try{
            await Reboque.destroy({where: {id: id}})
            return true
        }
        catch(error){
            console.log(error.toString())
            return false
        }
    }

    static async getOne(id){
        try{
            let reboque = await Reboque.findByPk(id)
            return reboque
        }
        catch(error){
            console.log(error.toString())
            return undefined
        }
    }

    static async getAll(){
        try{
            let reboques = await Reboque.findAll({order: ['modelo']})
            return reboques
        }
        catch(error){
            console.log(error.toString())
            return undefined
        }
    }

}

module.exports = DAOReboque