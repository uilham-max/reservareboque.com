const Reboque = require('../model/Reboque.js')
const Sequelize = require('sequelize')


class DAOReboque {

    static async insert(modelo, placa, valorDiaria, cor){
        try{
            await Reboque.create({modelo, placa, valorDiaria, cor})
            return true
        }
        catch(error){
            console.log(error.toString())
            return false
        }
    }

    static async update(id, modelo, placa, valorDiaria, cor){
        try{
            await Reboque.update({modelo: modelo, placa: placa, valorDiaria: valorDiaria, cor: cor}, {where: {id: id}})
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

    // RELATORIO
    // static async getRelatorio() {
    //     try {
    //         let reboques = await Reboque.findAll({
    //             attributes: [
    //                 'reboque',
    //                 [Sequelize.fn('SUM', Sequelize.col('valorDiaria')), 'valorTotal']
    //             ],
    //             group: ['reboque']
    //         });
    
    //         console.log(reboques);
    //         return reboques;
    //     } catch (error) {
    //         console.log(error.toString());
    //         return undefined;
    //     }
    // }
    

}

module.exports = DAOReboque