const Reserva = require('../model/Reserva.js')
const Reboque = require('../model/Reboque.js')
const Cliente = require('../model/Cliente.js')
const { Op, Sequelize, QueryTypes } = require('sequelize')
const utilitario = require('./utilitario')
const sequelize = require('sequelize')
const Pagamento = require('../model/Pagamento.js')
const moment = require('moment-timezone')


class DAOReserva {


    // Atualiza situação de uma reserva para aprovado
    static async atualizaSituacaoParaAprovada(codigoPagamento){
        try{
            await Reserva.update(
                {situacao: "APROVADO"},
                {where: {pagamentoCodigoPagamento: codigoPagamento}}
            )
            console.log('Atualizando a situação da reserva para "APROVADO"...');
            return true
        }catch(erro){
            console.log(erro.toString());
            return false
        }

    }



    // Atualiza situação de uma reserva para cancelado
    static async atualizaSituacaoParaCancelada(codigoPagamento){
        try{
            await Reserva.update(
                {situacao: "CANCELADO"},
                {where: {pagamentoCodigoPagamento: codigoPagamento}},
            )
            console.log('Atualizando a situação da reserva para CANCELADO...');
            return true
        }catch(erro){
            console.log("Erro ao atualizar reserva para CANCELADO\n",erro.toString());
            return false
        }

    }



    // Não permite realizar dois pagamentos de uma mesma reserva
    static async verificaPagamentoId(){
        try {
            let reservas = Reserva.findAll({order:['id']})
            return reservas
        } catch(erro){
            console.error(erro.toString());
            return false
        }
    }


    
    static async getReserva(idReserva){
        try {
            let reserva = Reserva.findByPk(idReserva, {
                
                include: [
                    {
                        model: Reboque,
                        required: true
                    },
                    {
                        model: Pagamento,
                        required: true
                    }
                ]
            })
            // console.log(reserva);
            return reserva
        } catch(erro) {
            console.log(erro.toString());
            return false
        }
    }



    static async historicoLocacoes(cpf){
        let dataAtual = moment.tz(new Date(), 'America/Sao_Paulo')
        try {
            let locacoes = Reserva.findAll({
                include: [
                  {
                    model: Cliente,
                    where: { cpf: cpf }, // Filtra pelo cliente com id 16
                    required: true     // Garante que apenas reservas com clientes correspondentes sejam retornadas
                  },
                  {
                    model: Pagamento,
                    required: true     // Inclui a associação com pagamentos
                  },
                  {
                    model: Reboque,
                    required: true
                  }
                ],
                where: {
                  dataSaida: {
                    [Sequelize.Op.lt]: dataAtual // Filtra onde dataChegada é anterior à data atual
                  }
                }
              }).then(reservas => {
                console.log(reservas);
                return reservas
              }).catch(error => {
                console.error(error.toString());
                return undefined
            });
            return locacoes
        } catch(erro){
            console.log(erro.toString());
            return false
        }

    }



    static async getReservas(reboquePlaca){
        try {
            let reservas = await Reserva.findAll({
                where: {reboquePlaca: reboquePlaca},
                include: [{model: Pagamento}]
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

    // Recupera as reservas de um cliente
    static async getMinhasReservas(cpf){
        try {
            const currentDate = new Date()
            const reservas = await Reserva.findAll({
                where: {
                    [Op.or]: [
                        { dataSaida: { [Op.gte]: currentDate } },
                        { dataChegada: { [Op.gte]: currentDate } }
                    ],
                    clienteCpf: cpf,
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




    // INSERT - Cria uma reserva com situação igual a aguardando pagamento
    static async insert(dataInicio, dataFim, valorDiaria, dias, valorTotal, clienteCpf, reboquePlaca, codigoPagamento) {
        try {
            let reserva = await Reserva.create({id: reboquePlaca+codigoPagamento, dataSaida: dataInicio, dataChegada: dataFim, valorDiaria: valorDiaria, diarias: dias, valorTotal: valorTotal, clienteCpf: clienteCpf, reboquePlaca: reboquePlaca, pagamentoCodigoPagamento: codigoPagamento, situacao: "AGUARDANDO_PAGAMENTO" })
            console.log('Reserva criada! aguardando pagamento...');
            return reserva
        }
        catch (error) {
            console.log("Restrição de Unicidade.",error.toString())
            return false
        }
    }

                                           

    // GETONE
    static async getOne(id) {
        try {
            console.log('ID -->', id);
            let reserva = await Reserva.findByPk(id, {include: [{model: Cliente}, {model: Reboque}, {model: Pagamento}]})
            return reserva
        }
        catch (error) {
            console.log(error.toString())
            return undefined
        }
    }



    // DELETE
    // static async delete(id) {
    //     try {
    //         await Reserva.destroy({ where: { id: id } })
    //         console.log("Reserva removida...");
    //         return true
    //     }
    //     catch (error) {
    //         console.log(error.toString())
    //         return false
    //     }
    // }



    // UPDATE
    static async update(id, dataSaida, dataChegada, valorDiaria, clienteCpf, reboquePlaca) {
        try {
            await Reserva.update({ dataSaida: dataSaida, dataChegada: dataChegada, valorDiaria: valorDiaria, clienteCpf: clienteCpf, reboquePlaca: reboquePlaca }, { where: { id: id } })
            return true
        }
        catch (error) {
            console.log(error.toString());
            return false
        }
    }



    // DISPONIBILIDADE
    static async getVerificaDisponibilidade(reboquePlaca, inicioDoPeriodo, fimDoPeriodo) {
        try {
            let reservas = await Reserva.findAll({
                where: {
                    [Op.and]: [
                        sequelize.literal(`("dataSaida", "dataChegada") OVERLAPS (:inicioDoPeriodo, :fimDoPeriodo)`),
                        {reboquePlaca: reboquePlaca},
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
    static async getAtivasPorID(reboquePlaca) {
        try {
            const currentDate = new Date()
            const reservas = await Reserva.findAll({
                where: {
                    [Op.or]: [
                        { dataSaida: { [Op.gte]: currentDate } },
                        { dataChegada: { [Op.gte]: currentDate } }
                    ],
                    reboquePlaca: reboquePlaca,
                },
                order: ['id'],
                include: [{ model: Reboque }, { model: Cliente }, {model: Pagamento}]
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