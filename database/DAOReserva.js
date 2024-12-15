const Reserva = require('../model/Reserva.js')
const Reboque = require('../model/Reboque.js')
const Cliente = require('../model/Cliente.js')
const { Op, Sequelize, QueryTypes } = require('sequelize')
const utilitario = require('./utilitario')
const sequelize = require('sequelize')
const Pagamento = require('../model/Pagamento.js')
const moment = require('moment-timezone')
const { startOfMonth, endOfMonth } = require('date-fns')


class DAOReserva {

    static async atualizaSituacaoParaAprovado(codigoPagamento){
        try{
            await Reserva.update(
                {situacaoReserva: "APROVADO"},
                {where: {pagamentoCodigoPagamento: codigoPagamento}}
            )
            console.log('Atualizando a situação da reserva para "APROVADO"...');
            return true
        }catch(erro){
            console.log(erro.toString());
            return false
        }

    }
    static async atualizaSituacaoParaConcluido(idReserva){
        const currentDate = moment.tz(new Date(), 'America/Sao_Paulo').format();
        console.log('Atualizando situação da reserva para CONCLUIDO...');
        try{
            await Reserva.update(
                {
                    situacaoReserva: 'CONCLUIDO', 
                    dataChegada: currentDate
                },
                {where: {id: idReserva}},
            )
            console.log('Situação atualizada para CONCLUIDO com sucesso!');
            return true
        } catch(erro) {
            console.error(`Erro ao atualizar situação da reserva para CONCLUIDO \n ${erro}`);
            return false
        }
    }
    static async atualizaSituacaoParaAndamento(idReserva){
        console.log('Atualizando situação da reserva para ANDAMENTO...');
        try{
            await Reserva.update(
                {situacaoReserva: 'ANDAMENTO'},
                {where: {id: idReserva}},
            )
            console.log('Situação atualizada para ANDAMENTO com sucesso!');
            return true
        } catch(erro) {
            console.error(`Erro ao atualizar situação da reserva para ANDAMENTO \n ${erro}`);
            return false
        }
    }
    static async atualizaSituacaoParaCancelada(codigoPagamento){
        try{
            await Reserva.update(
                {situacaoReserva: "CANCELADO"},
                {where: {pagamentoCodigoPagamento: codigoPagamento}},
            )
            console.log(`${codigoPagamento} --> Reserva "CANCELADA"`);
            return true
        }catch(erro){
            console.log("Erro ao atualizar reserva para CANCELADO\n",erro.toString());
            return false
        }

    }
    static async alterarPeriodo(idReserva, dataIncio, dataFim){
        try{
            await Reserva.update(
                {dataSaida: dataIncio, dataChegada: dataFim},
                {where: {id: idReserva}},
            )
            return true
        } catch(erro) {
            console.log("Erro ao alterar data da reserva", erro);
            return false
        }
    }

    static async insert(dataInicio, dataFim, valorDiaria, dias, valorTotal, clienteCpf, reboquePlaca, codigoPagamento, situacaoReserva) {
        try {
            let reserva = await Reserva.create({id: reboquePlaca+"_"+codigoPagamento, dataSaida: dataInicio, dataChegada: dataFim, valorDiaria: valorDiaria.toFixed(0), diarias: dias, valorTotal: valorTotal, clienteCpf: clienteCpf, reboquePlaca: reboquePlaca, pagamentoCodigoPagamento: codigoPagamento, situacaoReserva: situacaoReserva })
            console.log('Reserva criada! aguardando pagamento...');
            return reserva
        }
        catch (error) {
            console.log("Restrição de Unicidade.",error.toString())
            return false
        }
    }
    static async getOne(id) {
        try {
            // console.log('ID -->', id);
            let reserva = await Reserva.findByPk(id, {include: [{model: Cliente}, {model: Reboque}, {model: Pagamento}]})
            return reserva
        }
        catch (error) {
            console.log(error.toString())
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
    static async getOneByPagamentoCodigoPagamento(codigoPagamento){
        try {
            const reserva = Reserva.findAll({
                include: [
                  { model: Cliente, required: true },
                  { model: Pagamento, required: true },
                  { model: Reboque, required: true }
                ],
                where: { pagamentoCodigoPagamento: codigoPagamento }
            })
            return reserva
        } catch(erro){
            console.log(erro.toString());
            return undefined
        }
    }


    static async getTodasDesteCliente(cpf){
        let dataAtual = moment.tz(new Date(), 'America/Sao_Paulo').format()
        try {
            let locacoes = Reserva.findAll({
                include: [
                  { model: Cliente, where: { cpf: cpf }, required: true },
                  { model: Pagamento, required: true },
                  { model: Reboque, required: true }
                ],
                where: { dataSaida: { [Sequelize.Op.lt]: dataAtual } }
            })
            return locacoes
        } catch(erro){
            console.log(erro.toString());
            return false
        }

    }
    static async getAtivasDesteCliente(cpf){
        try {
            const currentDate = moment.tz(new Date(), 'America/Sao_Paulo').format()
            const reservas = await Reserva.findAll({
                where: {
                    [Op.or]: [
                        { dataSaida: { [Op.gte]: currentDate } },
                        { dataChegada: { [Op.gte]: currentDate } }
                    ],
                    clienteCpf: cpf,
                    [Op.or]: [
                        {situacaoReserva: 'APROVADO'},
                        {situacaoReserva: 'ANDAMENTO'}
                    ]
                    
                },
                order: [['dataSaida', 'ASC']],
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
    static async getAtivas() {
        try {
            const currentDate = moment.tz(new Date(), 'America/Sao_Paulo').format()

            const reservas = await Reserva.findAll({
                where: {
                    [Op.or]: [
                        { dataSaida: { [Op.gte]: currentDate } },
                        { dataChegada: { [Op.gte]: currentDate } }
                    ],
                    [Op.or]: [
                        { situacaoReserva: 'APROVADO' },
                        { situacaoReserva: 'ANDAMENTO' },
                        { situacaoReserva: 'AGUARDANDO_PAGAMENTO' },
                        { situacaoReserva: 'AGUARDANDO_ACEITACAO' },
                    ]
                },
                order: ['dataSaida'],
                include: [{ model: Reboque }, { model: Cliente }, {model: Pagamento}]
            })
            return reservas
        }
        catch (error) {
            console.log(error.toString())
            return undefined
        }
    }


    static async getVerificaDisponibilidade(reboquePlaca, inicioDoPeriodo, fimDoPeriodo) {
        try {
            let reservas = await Reserva.findAll({
                where: {
                    [Op.and]: [
                        sequelize.literal(`("dataSaida", "dataChegada") OVERLAPS (:inicioDoPeriodo, :fimDoPeriodo)`),
                        {reboquePlaca: reboquePlaca},
                        { situacaoReserva: { [Op.ne]: 'CANCELADO' } } // Modificado para mostrar as reservas canceladas na tela de periodo da reserva
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
    static async getTodasDesteReboque(reboquePlaca){
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
    static async getAtivasDesteReboque(reboquePlaca) {
        try {
            const currentDate = moment.tz(new Date(), 'America/Sao_Paulo').format();
    
            const reservas = await Reserva.findAll({
                where: {
                    reboquePlaca: reboquePlaca,
                    [Op.or]: [
                        { dataSaida: { [Op.gte]: currentDate } },
                        { dataChegada: { [Op.gte]: currentDate } }
                    ],
                    [Op.or]: [
                        { situacaoReserva: 'APROVADO' },
                        { situacaoReserva: 'ANDAMENTO' },
                        { situacaoReserva: 'AGUARDANDO_PAGAMENTO'},
                        { situacaoReserva: 'AGUARDANDO_ACEITACAO'},
                    ]
                },
                order: [['id', 'ASC']],
                include: [
                    { model: Reboque }, 
                    { model: Cliente }, 
                    { model: Pagamento },
                ]
            });
            // console.log(reservas);
            return reservas;
        } catch (error) {
            console.log(error.toString());
            return undefined;
        }
    }
    // static async getAtivasDesteReboqueGrafico(reboquePlaca) {
    //     try {
    //         const currentDate = moment.tz(new Date(), 'America/Sao_Paulo').format();
    
    //         const reservas = await Reserva.findAll({
    //             where: {
    //                 reboquePlaca: reboquePlaca,
    //                 [Op.or]: [
    //                     { dataSaida: { [Op.gte]: currentDate } },
    //                     { dataChegada: { [Op.gte]: currentDate } }
    //                 ],
    //                 [Op.or]: [
    //                     { situacaoReserva: 'APROVADO' },
    //                     { situacaoReserva: 'ANDAMENTO' },
    //                     { situacaoReserva: 'AGUARDANDO_PAGAMENTO'},
    //                     { situacaoReserva: 'CONCLUIDO'},
    //                     { situacaoReserva: 'AGUARDANDO_ACEITACAO'},
    //                 ]
    //             },
    //             order: [
    //                 ['id', 'ASC'],
    //             ],
    //             include: [
    //                 { model: Reboque }, 
    //                 { model: Cliente }, 
    //                 { model: Pagamento },
    //             ]
    //         });
    //         // console.log(reservas);
    //         return reservas;
    //     } catch (error) {
    //         console.log(error.toString());
    //         return undefined;
    //     }
    // }

    static async getAtivasDesteReboqueGrafico(reboquePlaca) {
        try {
            // Obtendo o primeiro e o último dia do mês atual
            const startDate = startOfMonth(new Date());
            const endDate = endOfMonth(new Date());

            const reservas = await Reserva.findAll({
                where: {
                    reboquePlaca: reboquePlaca,
                    [Op.or]: [
                        {
                            dataSaida: {
                                [Op.gte]: startDate,
                                [Op.lt]: endDate,
                            },
                        },
                        {
                            dataChegada: {
                                [Op.gte]: startDate,
                                [Op.lt]: endDate,
                            },
                        },
                    ],
                    situacaoReserva: {
                        [Op.in]: [
                            'APROVADO',
                            'ANDAMENTO',
                            'AGUARDANDO_PAGAMENTO',
                            'CONCLUIDO',
                            'AGUARDANDO_ACEITACAO',
                        ],
                    },
                },
                order: [['id', 'ASC']],
                include: [
                    { model: Reboque },
                    { model: Cliente },
                    { model: Pagamento },
                ],
            });
            // console.log(reservas);
            return reservas;
        } catch (error) {
            console.log(error.toString());
            return undefined;
        }
    }


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
                include: [{ model: Reboque }, { model: Cliente }, {model: Pagamento}],
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
    static async getRelatorioLucro(inicioDoPeriodo, fimDoPeriodo) {

        if(!inicioDoPeriodo){
            let datas = utilitario.preencheDatasVazias({datas: {inicioDoPeriodo, fimDoPeriodo}})
            inicioDoPeriodo = datas.inicioDoPeriodo
            fimDoPeriodo = datas.fimDoPeriodo
        }

        try {
            let reboques = await Reserva.findAll({
                attributes: ['reboquePlaca', [Sequelize.fn('SUM', Sequelize.col('valorTotal')), 'valorTotal']],
                where:{ dataSaida: { [Op.between]: [inicioDoPeriodo, fimDoPeriodo] } },
                group: ['reboque.placa', 'reserva.reboquePlaca'],
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