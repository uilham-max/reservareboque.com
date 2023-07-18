const Sequelize = require('sequelize')
const Reserva = require('../model/Reserva.js')
const Reboque = require('../model/Reboque.js')
const Cliente = require('../model/Cliente.js')


class DAOReserva{

    // inserindo uma locação no banco
    static async insert(dataSaida, dataChegada, valorDiaria, valorTotal, cliente, reboque){
        console.log("\nInsert:  "+dataChegada+"\n"+dataSaida+"\n"+valorDiaria+"\n"+valorTotal+"\n"+cliente+"\n"+reboque)
        try{
            await Reserva.create({dataSaida: dataSaida, dataChegada: dataChegada, valorDiaria: valorDiaria, valorTotal: valorTotal, clienteId: cliente, reboqueId: reboque})
            return true
        }
        catch(error){
            console.log(error.toString())
            return false
        }
    }

    static async getAll(){
        try{
            let reservas = await Reserva.findAll({order: ['id'], include: [{ model: Reboque }, {model: Cliente}]})
            return reservas
        }
        catch(error){
            console.log(error.toString())
            return undefined
        }
    }

    static async getOne(id){
        try{
            let reserva = await findByPk(id)
            return reserva
        }
        catch(error){
            console.log(error.toString())
            return undefined
        }
    }

    static async delete(id){
        try{
            await Reserva.destroy({where: {id: id}})
            return true
        }
        catch(error){
            console.log(error.toString())
            return false
        }
    }

    
}

module.exports = DAOReserva