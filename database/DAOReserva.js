const Reserva = require('../model/Reserva.js')
const Reboque = require('../model/Reboque.js')
const Cliente = require('../model/Cliente.js')
const { Op, Sequelize } = require('sequelize')


class DAOReserva {

    // INSERT
    static async insert(dataSaida, dataChegada, valorDiaria, diarias, valorTotal, cliente, reboque) {
        try {
            await Reserva.create({ dataSaida: dataSaida, dataChegada: dataChegada, valorDiaria: valorDiaria, diarias: diarias, valorTotal: valorTotal, clienteId: cliente, reboqueId: reboque })
            return true
        }
        catch (error) {
            console.log(error.toString())
            return false
        }
    }

    // READ
    static async getAll() {

        try {
            const currentDate = new Date()
            const reservas = await Reserva.findAll({
                where: {
                    [Op.or]: [
                        { dataSaida: { [Op.gte]: currentDate } },
                        { dataChegada: { [Op.gte]: currentDate } }
                    ],
                },
                order: ['id'],
                include: [{ model: Reboque }, { model: Cliente }]
            })
            // let reservas = await Reserva.findAll({order: ['id'], include: [{ model: Reboque }, {model: Cliente}]})
            return reservas
        }
        catch (error) {
            console.log(error.toString())
            return undefined
        }
    }

    // RELATORIO HISTORICO
    static async getRelatorioHistorico() {

        try {
            const currentDate = new Date()
            let reservas = await Reserva.findAll({
                where:{
                    dataChegada: {[Op.lt]: currentDate}},    
                order: ['id'], 
                include: [{ model: Reboque }, {model: Cliente}]
            })
            console.log(reservas) //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
            return reservas
        }
        catch (error) {
            console.log(error.toString())
            return undefined
        }
    }

    // RELATORIO REBOQUES SOMA 
    // static async getRelatorioReservasPorRoboque(){
    //     try{
    //         let reboques = await Reserva.findAll({
    //             attributes: ['reboqueId', [Sequelize.fn('SUM', Sequelize.col('valorTotal')), 'valorTotal']],
    //             where: {dataSaida: {[Op.between]: ['2023-07-01', '2023-07-30']}},
    //             group: ['reboque.id', 'reserva.reboqueId'],
    //             // include: [{model: Reboque}]
    //             include: [{model: Reboque, attributes: ['id', 'placa']}]
    //         })
    //         console.log(reboques) //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    //         return reboques
    //     }
    //     catch(error){
    //         console.log(error.toString())
    //         return undefined
    //     }
    // }

    // TESTE RELATORIO
    static async getRelatorioReservasPorRoboque(){
        try{
            let reboques = await Reserva.findAll({
                attributes: ['reboque.placa',[Sequelize.fn('SUM', Sequelize.col('valorTotal')), 'valorTotal']],
                where: {dataSaida: {[Op.between]: ['2023-07-01', '2023-07-30']}},
                group: ['reboque.id', 'reboque.placa'],
                // include: [{model: Reboque}]
                include: [{model: Reboque, attributes: ['id', 'placa']}]
            })
            console.log(reboques) //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
            return reboques
        }
        catch(error){
            console.log(error.toString())
            return undefined
        }
    }


    // GETONE
    static async getOne(id) {
        try {
            let reserva = await findByPk(id)
            return reserva
        }
        catch (error) {
            console.log(error.toString())
            return undefined
        }
    }

    // DELETE
    static async delete(id) {
        try {
            await Reserva.destroy({ where: { id: id } })
            return true
        }
        catch (error) {
            console.log(error.toString())
            return false
        }
    }


}

module.exports = DAOReserva