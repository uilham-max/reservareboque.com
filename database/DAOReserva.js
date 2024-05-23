const Reserva = require('../model/Reserva.js')
const Reboque = require('../model/Reboque.js')
const Cliente = require('../model/Cliente.js')
const { Op, Sequelize, QueryTypes } = require('sequelize')
const utilitario = require('./utilitario')
const Diaria = require('../bill_modules/Diaria')
const conexao = require('./conexao')
const sequelize = require('sequelize')
const Pagamento = require('../model/Pagamento.js')


class DAOReserva {

    static async getReservas(reboqueId){
        try {
            let reservas = await Reserva.findAll({
                where: {reboqueId: reboqueId}
            })
            return reservas
        } catch(erro) {
            console.log(erro.toString());
            return undefined
        }
    }


    static async getAll(){
        try { 
            let reservas = await Reserva.findAll()
            return reservas
        } catch(erro) {
            console.log(erro.toString());
            return undefined
        }
    }


    static async getMinhasReservas(idCliente){
        try {
            const currentDate = new Date()
            const reservas = await Reserva.findAll({
                where: {
                    [Op.or]: [
                        { dataSaida: { [Op.gte]: currentDate } },
                        { dataChegada: { [Op.gte]: currentDate } }
                    ],
                    clienteId: idCliente,
                },
                order: ['id'],
                include: [{ model: Reboque }, { model: Cliente }, {model: Pagamento}]
            })
            // testando saida
            // console.log('Reservas encontradas:', reservas.map(reserva => reserva.toJSON()));
            return reservas
        }catch(erro){
            console.log(erro.toString());
            return false
        }
    }



    static async deletePeloPagamento(pagamentoId){
        try{
            await Reserva.destroy({where: {pagamentoId: pagamentoId}})
            console.log("Removendo reserva sem pagamento...");
            return true
        }catch(erro){
            console.log(erro.toString());
            return false
        }

    }
    


    // INSERT
    static async insert(dataInicio, dataFim, valorDiaria, dias, valorTotal, cliente, reboque, idPagamento) {
        try {
            let reserva = await Reserva.create({ dataSaida: dataInicio, dataChegada: dataFim, valorDiaria: valorDiaria, diarias: dias, valorTotal: valorTotal, clienteId: cliente, reboqueId: reboque, pagamentoId: idPagamento })
            console.log('Reserva criada! aguardando pagamento...');
            return reserva
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
            console.log("Reserva removida...");
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



    // DISPONIBILIDADE
    static async getVerificaDisponibilidade(reboque, inicioDoPeriodo, fimDoPeriodo) {
        try {
            let reservas = await Reserva.findAll({
                where: {
                    [Op.and]: [
                        sequelize.literal(`("dataSaida", "dataChegada") OVERLAPS (:inicioDoPeriodo, :fimDoPeriodo)`),
                        {reboqueId: reboque},
                    ],
                },
                replacements: {inicioDoPeriodo, fimDoPeriodo},
                type: QueryTypes.SELECT,
            })

            // console.log('Reservas encontradas:', reservas.map(reserva => reserva.toJSON()));
            return reservas
        } catch (error) {
            console.error('Erro ao verificar disponibilidade:', error);
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
                include: [{ model: Reboque }, { model: Cliente }, {model: Pagamento}]
            })
            return reservas
        }
        catch (error) {
            console.log(error.toString())
            return undefined
        }
    }



    // RELATORIO ATIVAS POR ID
    static async getAtivasPorID(id) {
        try {
            const currentDate = new Date()
            const reservas = await Reserva.findAll({
                where: {
                    [Op.or]: [
                        { dataSaida: { [Op.gte]: currentDate } },
                        { dataChegada: { [Op.gte]: currentDate } }
                    ],
                    reboqueId: id,
                },
                order: ['id'],
                include: [{ model: Reboque }, { model: Cliente }]
            })
            // testando saida
            // console.log('Reservas encontradas:', reservas.map(reserva => reserva.toJSON()));
            return reservas
        }
        catch (error) {
            console.log(error.toString())
            return undefined
        }
    }



    // RELATORIO HISTORICO
    static async getRelatorioHistorico(inicioDoPeriodo, fimDoPeriodo) {

        if(!inicioDoPeriodo){
            let datas = utilitario.preencheDatasVazias({datas: {inicioDoPeriodo, fimDoPeriodo}})
            inicioDoPeriodo = datas.inicioDoPeriodo
            fimDoPeriodo = datas.fimDoPeriodo
        }
        
        try {
            const reservas = await Reserva.findAll({
                where: sequelize.literal(
                    `("dataSaida", "dataChegada") OVERLAPS (:inicioDoPeriodo, :fimDoPeriodo)`
                ),
                order: [['id', 'ASC']],
                include: [{ model: Reboque }, { model: Cliente }],
                replacements: {
                    inicioDoPeriodo,
                    fimDoPeriodo,
                },
            });
    
            return reservas;
        } catch (error) {
            console.error('Erro ao obter relatório de histórico:', error);
            return undefined
        }
    }



    static async getLucroTotal(inicioDoPeriodo, fimDoPeriodo) {
        
        if(!inicioDoPeriodo){
            let datas = utilitario.preencheDatasVazias({datas: {inicioDoPeriodo, fimDoPeriodo}})
            inicioDoPeriodo = datas.inicioDoPeriodo
            fimDoPeriodo = datas.fimDoPeriodo
        }
        
        try {
            let resultado = await Reserva.sum('valorTotal', {
              where: {
                dataSaida: {
                  [Op.between]: [inicioDoPeriodo, fimDoPeriodo],
                },
              },
            });
            return resultado;
        } 
        catch (error) {
            console.log(error.toString());
            return null;
        }
       
    }



    // RELATORIO LUCRO
    static async getRelatorioLucro(inicioDoPeriodo, fimDoPeriodo) {

        if(!inicioDoPeriodo){
            let datas = utilitario.preencheDatasVazias({datas: {inicioDoPeriodo, fimDoPeriodo}})
            inicioDoPeriodo = datas.inicioDoPeriodo
            fimDoPeriodo = datas.fimDoPeriodo
        }

        try {
            let reboques = await Reserva.findAll({
                attributes: ['reboqueId', [Sequelize.fn('SUM', Sequelize.col('valorTotal')), 'valorTotal']],
                where:{ dataSaida: { [Op.between]: [inicioDoPeriodo, fimDoPeriodo] } },
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