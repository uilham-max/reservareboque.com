const Reserva = require('../model/Reserva.js')
const Reboque = require('../model/Reboque.js')
const Cliente = require('../model/Cliente.js')
const { Op, Sequelize, QueryTypes } = require('sequelize')
const conexao = require('./conexao.js')


class DAOReserva {

    // INSERT
    static async insert(dataSaida, dataChegada, valorDiaria, diarias, valorTotal, cliente, reboque) {
        try {
            let reservas = await DAOReserva.getVerificaDisponibilidade(reboque, dataSaida, dataChegada)
            if (reservas.length !== 0) {
                return false
            } else {
                await Reserva.create({ dataSaida: dataSaida, dataChegada: dataChegada, valorDiaria: valorDiaria, diarias: diarias, valorTotal: valorTotal, clienteId: cliente, reboqueId: reboque })
                return true
            }
        }
        catch (error) {
            console.log(error.toString())
            return false
        }
    }

                                           

    // GETONE
    static async getOne(id) {
        try {
            let reserva = await Reserva.findByPk(id)
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

    // UPDATE
    static async update(id, dataSaida, dataChegada, valorDiaria, cliente, reboque) {
        try {
            await Reserva.update({ dataSaida: dataSaida, dataChegada: dataChegada, valorDiaria: valorDiaria, clienteId: cliente, reboqueId: reboque }, { where: { id: id } })
            return true
        }
        catch (error) {
            console.log(error.toString());
            return false
        }
    }

    static async getVerificaDisponibilidade(reboque, dataInicio, dataFim) {
        try {
            let reservas = await Reserva.findAll({
                attributes: ['id', 'dataSaida', 'dataChegada'],
                where: {
                    [Op.and]: { reboqueId: { [Op.eq]: reboque } },
                    [Op.or]: [
                        {
                            dataSaida: { [Op.between]: [dataInicio, dataFim] },
                        },
                        {
                            dataChegada: { [Op.between]: [dataInicio, dataFim] },
                        },
                        {
                            dataSaida: { [Op.lte]: dataInicio },
                            dataChegada: { [Op.gte]: dataFim },
                        },
                        {
                            dataSaida: { [Op.gte]: dataInicio },
                            dataChegada: { [Op.lte]: dataFim },
                        },
                    ],
                },
                order: ['id'],
                include: [{ model: Reboque }, { model: Cliente }]
            });

            // console.log('Reservas encontradas:', reservas.map(reserva => reserva.toJSON()));
            return reservas
        } catch (error) {
            console.error('Erro ao obter relatório de histórico:', error);
            return undefined
        }
    }

    /**METODOS ENCARREGADOS PELA PARTE DOS RELATORIOS */


    // RELATORIO ATIVAS
    static async getAtivas() {
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
            return reservas
        }
        catch (error) {
            console.log(error.toString())
            return undefined
        }
    }

    // RELATORIO HISTORICO
    // static async getRelatorioHistorico(dataInicio, dataFim) {
    //     console.log(dataInicio+dataFim);
    //     try {
    //         let reservas = await Reserva.findAll({
    //             attributes: ['id', 'dataSaida', 'dataChegada'],
    //             where:{
    //                 [Op.or]: [
    //                     // {[dataInicio]: {[Op.between]: [dataInicio, dataFim]}},
    //                     // {[dataInicio]: {[Op.between]: [dataSaida, dataChegada]}},
    //                     // {[dataFim]: {[Op.between]: [dataSaida, dataChegada]}},
    //                     {dataSaida: {[Op.between]: [dataInicio, dataFim]}},
    //                     {dataChegada: {[Op.between]: [dataInicio, dataFim]}},
    //                     // conexao.literal(`'${dataInicio}' between  'dataSaida'  and 'dataChegada' `),
    //                     // conexao.literal(`'${dataFim}' between  'dataSaida'  and 'dataChegada' `),
    //                     // { dataSaida: { [Op.between]: [dataInicio, dataFim] } },
    //                     // { dataChegada: { [Op.between]: [dataInicio, dataFim] } },

    //                 ],
    //             },    
    //             order: ['id'], 
    //             include: [{ model: Reboque }, {model: Cliente}]
    //         })
    //         console.log(reservas);
    //         return reservas
    //     }
    //     catch (error) {
    //         console.log('reservas encontradas: ', )
    //         return undefined
    //     }
    // }


    static async getRelatorioHistorico(dataInicio, dataFim) {
        try {
            let reservas = await Reserva.findAll({
                where: {
                    [Op.or]: [
                        {
                            dataSaida: { [Op.between]: [dataInicio, dataFim] },
                        },
                        {
                            dataChegada: { [Op.between]: [dataInicio, dataFim] },
                        },
                        {
                            dataSaida: { [Op.lte]: dataInicio },
                            dataChegada: { [Op.gte]: dataFim },
                        },
                        {
                            dataSaida: { [Op.gte]: dataInicio },
                            dataChegada: { [Op.lte]: dataFim },
                        },
                    ],
                },
                order: ['id'],
                include: [{ model: Reboque }, { model: Cliente }]
            });

            console.log('Reservas encontradas:', reservas.map(reserva => reserva.toJSON()));
            return reservas
        } catch (error) {
            console.error('Erro ao obter relatório de histórico:', error);
            return undefined
        }
    }


    // RELATORIO LUCRO
    static async getRelatorioLucro(dataInicio, dataFim) {
        try {
            let reboques = await Reserva.findAll({
                attributes: ['reboqueId', [Sequelize.fn('SUM', Sequelize.col('valorTotal')), 'valorTotal']],
                where: { dataSaida: { [Op.between]: [dataInicio, dataFim] } },
                group: ['reboque.id', 'reserva.reboqueId'],
                include: [{ model: Reboque }]
            })
            return reboques
        }
        catch (error) {
            console.log(error.toString())
            return undefined
        }
    }


}

module.exports = DAOReserva