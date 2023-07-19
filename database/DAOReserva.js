const Sequelize = require('sequelize')
const Reserva = require('../model/Reserva.js')
const Reboque = require('../model/Reboque.js')
const Cliente = require('../model/Cliente.js')
const {Op} = require('sequelize')


class DAOReserva{

    // inserindo uma locação no banco
    static async insert(dataSaida, dataChegada, valorDiaria, diarias, valorTotal, cliente, reboque){
        try{
            await Reserva.create({dataSaida: dataSaida, dataChegada: dataChegada, valorDiaria: valorDiaria, diarias: diarias, valorTotal: valorTotal, clienteId: cliente, reboqueId: reboque})
            return true
        }
        catch(error){
            console.log(error.toString())
            return false
        }
    }

    static async getAll(){
        const currentDate = new Date()
        try{
            let reservas = await Reserva.findAll({where:{dataSaida: {[Op.gte]: currentDate}},order: ['id'], include: [{ model: Reboque }, {model: Cliente}]})
            // let reservas = await Reserva.findAll({order: ['id'], include: [{ model: Reboque }, {model: Cliente}]})
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