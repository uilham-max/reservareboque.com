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

    static async update(foto, modelo, placa, valorDiaria, cor){
        try{
            await Reboque.update({foto: foto, modelo: modelo, placa: placa, valorDiaria: valorDiaria, cor: cor, foto: foto}, {where: {placa: placa}})
            return true
        }
        catch(error){
            console.log(error.toString())
            return false
        }
    }

    static async delete(placa){
        try{
            await Reboque.destroy({where: {placa: placa}})
            return true
        }
        catch(error){
            console.log(error.toString())
            return false
        }
    }

    static async getOne(placa){
        try{
            let reboque = await Reboque.findByPk(placa)
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

    static async getAllAtivos(){
        try{
            let reboques = await Reboque.findAll({
                order: [['modelo', 'ASC']], // 'ASC' para ordenar de forma ascendente (opcional)
                where: { ativo: true }
            });
            return reboques
        }
        catch(error){
            console.log(error.toString())
            return undefined
        }
    }

    static async ativar(placa, isAtivo){
        try{
            const resultado = await Reboque.update({ativo: isAtivo}, {where: {placa: placa}})
            if (resultado[0] === 1) {
                return true
            } else {
                return false
            }
        } catch(erro) {
            console.error(`Erro ao atualizar status ${erro}`);
            return false
        }
    }

}

module.exports = DAOReboque