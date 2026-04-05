const { Sequelize } = require('sequelize');
const Pagamento = require('../model/Pagamento')
const { StatusPagamento } = require('../enums')
const moment = require('moment-timezone')


class DAOPagamento {

    // static async recuperaPeloCodigoPagamento(codigoPagamento){
    //     try{
    //         let pagamento = await Pagamento.findOne({where: {codigoPagamento: codigoPagamento}})
    //         return pagamento.id
    //     } catch(erro){
    //         console.log("Erro ao buscar pagamento pelo codigoPagamento:",erro);
    //         return false
    //     }
    // }


    // Atualiza a situação do pagamento para cancelado
    static async atualizaSituacaoParaCancelado(codigoPagamento){
        let atualizado_em = moment.tz(new Date(), 'America/Sao_Paulo').format()
        try {
            let cancelado = await Pagamento.update(
                {situacao: StatusPagamento.CANCELADO, atualizado_em: atualizado_em},
                {where: {codigoPagamento: codigoPagamento}}
            )
            if(cancelado){
                console.log(`${codigoPagamento}" --> Pagamento "CANCELADO"`);
            } else {
                console.log("Sem pagamentos expirados!");
            }
        } catch(erro) {
            console.error(erro.toString());
        }
    }
    // static async removePeloCodigoPagamento(codigoPagamento){
    //     try {
    //         let removido = await Pagamento.destroy({where: {codigoPagamento: codigoPagamento}})
    //         if(removido){
    //             console.log(codigoPagamento ," --> Pagamento removido do BD!");
    //         } else {
    //             console.log("Sem pagamentos expirados!");
    //         }
    //     } catch(erro) {
    //         console.error(erro.toString());
    //     }
    // }
    static async listaPagamentosComPrazoExpirado(){
        try {
            var horas = moment.tz(new Date(), 'America/Sao_Paulo')
            let lista = await Pagamento.findAll({
                where: {
                    aprovado: false,
                    situacao: StatusPagamento.AGUARDANDO_PAGAMENTO,
                    dataExpiracao: {
                        [Sequelize.Op.lt]: horas
                    }
                }
            })
            return lista
        } catch(erro) {
            console.error(erro.toString());
            return undefined
        }
    }
    static async verificaPagamento(codigoPagamento){
        try{
            let resposta = await Pagamento.findOne({where: {codigoPagamento: codigoPagamento}})
            return resposta
        }catch(erro){
            console.error(erro.toString());
            return undefined
        }
    }
    static async atualizarPagamentoParaAprovado(codigoPagamento){
        let atualizado_em = moment.tz(new Date(), 'America/Sao_Paulo').format()
        try{
            const [numLinhasAtualizadas] = await Pagamento.update(
                {aprovado: true, situacao: StatusPagamento.APROVADO, atualizado_em: atualizado_em},
                {where: {codigoPagamento: codigoPagamento}}
            );
            // console.log('Atualizando status do pagamento para aprovado...');
            if (numLinhasAtualizadas > 0) {
                console.log(codigoPagamento, '--> Pagamento atualizado para aprovado com sucesso.');
                let pagamento = await Pagamento.findByPk(codigoPagamento)
                return pagamento;
            } else {
                console.log('Nenhuma linha foi atualizada. O pagamento não foi encontrado.');
                return undefined;
            }
        } catch(erro){
            console.error('Erro ao atualizar o status do pagamento para aprovado:', erro);
            return false;
        }
    }
    // Recebe o valor da reserva e um código do sistema de pagamento
    static async insert(codigoPagamento, valorTotalDaReserva, billingType, dataExpiracao){
        let criado_em = moment.tz(new Date(), 'America/Sao_Paulo').format()
        let atualizado_em = moment.tz(new Date(), 'America/Sao_Paulo').format()
        try{
            const pagamento = await Pagamento.create(
                {
                    valor: valorTotalDaReserva.toFixed(2), 
                    codigoPagamento: codigoPagamento, 
                    forma: billingType, 
                    aprovado: false, 
                    dataExpiracao: dataExpiracao, 
                    situacao: StatusPagamento.AGUARDANDO_PAGAMENTO,
                    criado_em: criado_em,
                    atualizado_em: atualizado_em
                }
            )
            console.log('A cobrança criada expira em: ',dataExpiracao.format('YYYY-MM-DD HH:mm:ss'));
            return pagamento.codigoPagamento

        } catch(erro){
            console.log("Erro ao inserir pagamento: \n",erro.toString());
            return undefined
        }
    }
    static async updateValor(codigoPagamento, valor){
        let atualizado_em = moment.tz(new Date(), 'America/Sao_Paulo').format()
        try{ 
            const [numLinhasAtualizadas] = await Pagamento.update(
                {valor: valor, atualizado_em: atualizado_em},
                {where: {codigoPagamento: codigoPagamento}}
            );
            // console.log('Atualizando status do pagamento para aprovado...');
            if (numLinhasAtualizadas > 0) {
                console.log(codigoPagamento, '--> Valor do pagamento atualizado.');
                let pagamento = await Pagamento.findByPk(codigoPagamento)
                return pagamento;
            } else {
                console.log('Nenhuma linha foi atualizada. O pagamento não foi encontrado.');
                return undefined;
            }
        } catch(erro){
            console.error('Erro ao atualizar o valor do pagamento:', erro);
            return false;
        }
    }
    // static async delete(id){
    //     try{
    //         await Pagamento.destroy({where:{id: id}})
    //         console.log("Removendo reserva sem pagamento...");
    //         return true
    //     }catch(erro) {
    //         console.log(erro.toString());
    //         return false
    //     }
    // }
    static async getAllPagamentosFalse(){
        try{
            const pagamentos = await Pagamento.findAll({where:{aprovado: false}})
            return pagamentos
        }catch(erro){
            console.log(erro.toString());
            return false
        }
    }
}


module.exports = DAOPagamento