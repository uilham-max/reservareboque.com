const Reserva = require('../model/Reserva.js')
const Reboque = require('../model/Reboque.js')
const Cliente = require('../model/Cliente.js')
const { Op, Sequelize, QueryTypes } = require('sequelize')
const utilitario = require('./utilitario')
const sequelize = require('sequelize')
const Pagamento = require('../model/Pagamento.js')
const moment = require('moment-timezone')
const { startOfMonth, endOfMonth } = require('date-fns')
const { SituacaoReserva, MotivoCancelamento, StatusPagamento } = require('../enums')


class DAOReserva {

    async registrarMotivoCancelamento(idReserva, motivo) {
        // motivo: CLIENTE, ADMIN, NAO_PAGO, CREDITO
        let atualizado_em = moment.tz(new Date(), 'America/Sao_Paulo').format()
        try {
            await Reserva.update(
                { motivoCancelamento: motivo, atualizado_em: atualizado_em },
                { where: { id: idReserva } }
            );
            console.log(`Motivo de cancelamento registrado para a reserva ${idReserva}: ${motivo}`);
            return true;
        } catch (error) {
            console.error(`Erro ao registrar motivo de cancelamento para a reserva ${idReserva}:`, error);
            return false;
        }
    }
    static async atualizaSituacao(idReserva, status){
        // situacaoReserva: APROVADO, CONCLUIDO, CANCELADO, ANDAMENTO, AGUARDANDO_PAGAMENTO, ADIADO, AGUARDANDO_ACEITACAO, CANCELADO_COM_CREDITO
        let atualizado_em = moment.tz(new Date(), 'America/Sao_Paulo').format()
        console.log('Atualizando situação da reserva para ', status);
        try{
            await Reserva.update(
                {situacaoReserva: status, atualizado_em: atualizado_em},
                {where: {id: idReserva}},
            )
            console.log('Situação atualizada para ', status, ' com sucesso!');
            return true
        } catch(erro) {
            console.error(`Erro ao atualizar situação da reserva para ${status} \n ${erro}`);
            return false
        }
    }
    static async adminAtualizaPeriodo(idReserva, dataInicio, dataFim, reboquePlaca, diarias){
        let atualizado_em = moment.tz(new Date(), 'America/Sao_Paulo').format()
        try{
            const [numLinhasAtualizadas] = await Reserva.update(
                {dataSaida: dataInicio, dataChegada: dataFim, diarias: diarias, atualizado_em: atualizado_em},
                {where: {id: idReserva}},
            )
            // console.log('Atualizando status do pagamento para aprovado...');
            if (numLinhasAtualizadas > 0) {
                console.log(idReserva, '--> Período atualizado');
                let reserva = await Reserva.findByPk(idReserva)
                return reserva;
            } else {
                console.log('Nenhuma linha foi atualizada. Reserva não encontrada.');
                return undefined;
            }
        } catch(erro) {
            console.log("Erro ao alterar data da reserva", erro);
            return false
        }
    }

    static async insert(dataInicio, dataFim, valorDiaria, dias, valorTotal, clienteCpf, reboquePlaca, codigoPagamento, situacaoReserva) {
        let criado_em = moment.tz(new Date(), 'America/Sao_Paulo').format()
        let atualizado_em = moment.tz(new Date(), 'America/Sao_Paulo').format()
        try {
            let reserva = await Reserva.create({id: reboquePlaca+"_"+codigoPagamento, dataSaida: dataInicio, dataChegada: dataFim, valorDiaria: valorDiaria.toFixed(0), diarias: dias, valorTotal: valorTotal, clienteCpf: clienteCpf, reboquePlaca: reboquePlaca, pagamentoCodigoPagamento: codigoPagamento, situacaoReserva: situacaoReserva, criado_em: criado_em, atualizado_em: atualizado_em })
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

    static async getTodasReservas(pagina = 1, limite = 10) {
        try { 
            const offset = (pagina - 1) * limite
            const {count, rows} = await Reserva.findAndCountAll({
                order: [['dataSaida', 'DESC']],
                limit: limite,
                offset: offset,
                include: [{ model: Reboque }, { model: Cliente }, {model: Pagamento}]
            })
            return {
                total: count,
                reservas: rows,
                paginaAtual: pagina,
                totalPaginas: Math.ceil(count / limite)
            }
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
                        {situacaoReserva: SituacaoReserva.APROVADO},
                        {situacaoReserva: SituacaoReserva.ANDAMENTO},
                        {situacaoReserva: SituacaoReserva.CANCELADO_COM_CREDITO},
                        {situacaoReserva: SituacaoReserva.AGUARDANDO_ACEITACAO},
                        {situacaoReserva: SituacaoReserva.AGUARDANDO_PAGAMENTO},
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
                        { situacaoReserva: SituacaoReserva.APROVADO },
                        { situacaoReserva: SituacaoReserva.ANDAMENTO },
                        { situacaoReserva: SituacaoReserva.AGUARDANDO_PAGAMENTO },
                        { situacaoReserva: SituacaoReserva.AGUARDANDO_ACEITACAO },
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

    static async getSomaReservasPorReboqueMesAtual(competencia) {
        try {
            const dataCompetencia = moment.tz( competencia, 'YYYY-MM', 'America/Sao_Paulo' );
            const startDate = startOfMonth(new Date(dataCompetencia));
            const endDate = endOfMonth(new Date(dataCompetencia));
    
            const reservas = await Reserva.findAll({
                attributes: [
                    'reboquePlaca',
                    [sequelize.fn('SUM', sequelize.col('pagamento.valor')), 'total']
                ],
                where: {
                    dataSaida: {
                        [Op.gte]: startDate
                    },
                    dataChegada: {
                        [Op.lte]: endDate
                    }
                },
                include: [
                    {
                        model: Pagamento,
                        attributes: [],
                        where: {
                            situacao: StatusPagamento.APROVADO
                        }
                    }
                ],
                group: ['reserva.reboquePlaca'],
                raw: true
            });

            return reservas;
        } catch (error) {
            console.log(error.toString());
            return undefined;
        }
    }



    static async getVerificaDisponibilidade(reboquePlaca, inicioDoPeriodo, fimDoPeriodo) {
        try {
            let reservas = await Reserva.findAll({
                where: {
                    [Op.and]: [
                        sequelize.literal(`("dataSaida", "dataChegada") OVERLAPS (:inicioDoPeriodo, :fimDoPeriodo)`),
                        {reboquePlaca: reboquePlaca},
                        { situacaoReserva: { [Op.ne]: SituacaoReserva.CANCELADO } } // Modificado para mostrar as reservas canceladas na tela de periodo da reserva
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
                        { situacaoReserva: SituacaoReserva.APROVADO },
                        { situacaoReserva: SituacaoReserva.ANDAMENTO },
                        { situacaoReserva: SituacaoReserva.AGUARDANDO_PAGAMENTO},
                        { situacaoReserva: SituacaoReserva.AGUARDANDO_ACEITACAO},
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
    static async getAtivasDesteReboqueGrafico(reboquePlaca, competencia) {
        try {
            // Obtendo o primeiro e o último dia do mês atual
            const startDate = startOfMonth(new Date(competencia));
            const endDate = endOfMonth(new Date(competencia));
            
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