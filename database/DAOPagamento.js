const { Sequelize } = require('sequelize');
const Pagamento = require('../model/Pagamento')
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
        try {
            let cancelado = await Pagamento.update({situacao: "CANCELADO"},{where: {codigoPagamento: codigoPagamento}})
            if(cancelado){
                console.log(codigoPagamento ," --> Pagamento atualizado para CANCELADO");
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
                    situacao: "AGUARDANDO_PAGAMENTO",
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
        try{
            const [numLinhasAtualizadas] = await Pagamento.update(
                {aprovado: true, situacao: "APROVADO"},
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
        try{
            const pagamento = await Pagamento.create({valor: valorTotalDaReserva, codigoPagamento: codigoPagamento, descricao: billingType, aprovado: false, dataExpiracao: dataExpiracao, situacao: "AGUARDANDO_PAGAMENTO"})
            console.log('A cobrança criada expira em: ',dataExpiracao.format('YYYY-MM-DD HH:mm:ss'));
            return pagamento.codigoPagamento

        } catch(erro){
            console.log(erro.toString());
            return undefined
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