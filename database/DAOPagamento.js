const { Sequelize } = require('sequelize');
const Pagamento = require('../model/Pagamento')
const moment = require('moment-timezone')


class DAOPagamento {


    static async removePeloCodigoPagamento(codigoPagamento){
        try {
            let removido = await Pagamento.destroy({where: {codigoPagamento: codigoPagamento}})
            if(removido){
                console.log(codigoPagamento ," --> Pagamento removido do BD...");
            }
        } catch(erro) {
            console.error(erro.toString());
        }
    }


    static async listaPagamentosComPrazoExpirado(){
        try {
            var horas = moment.tz(new Date(), 'America/Sao_Paulo')
            let lista = await Pagamento.findAll({
                where: {
                    aprovado: false,
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


    // static async removePagamentoComPrazoExpirado(){
    //     try{
    //         // Remover pagamentos expirados
    //         var horas = moment.tz(new Date(), 'America/Sao_Paulo')
    //         let pagamentos = await Pagamento.destroy({
    //             where: {
    //                 aprovado: false,
    //                 dataExpiracao: { 
    //                     [Sequelize.Op.lt]: horas
    //                 }
    //             }
    //         })
    //         if(pagamentos){
    //             console.log(pagamentos, '> pagamentos expirados removidos');
    //         }
    //         return pagamentos
    //     }catch(erro){
    //         console.error(erro.toString());
    //         return undefined
    //     }
    // }





    static async atualizarPagamentoParaAprovado(idPagamento){
        try{
            const [numLinhasAtualizadas] = await Pagamento.update(
                {aprovado: true},
                {where: {codigoPagamento: idPagamento}}
            );
            // console.log('Atualizando status do pagamento para aprovado...');
            if (numLinhasAtualizadas > 0) {
                console.log(idPagamento, '--> Pagamento atualizado para aprovado com sucesso.');
                return true;
            } else {
                console.log('Nenhuma linha foi atualizada. O pagamento não foi encontrado.');
                return false;
            }
        } catch(erro){
            console.error('Erro ao atualizar o status do pagamento para aprovado:', erro);
            return false;
        }
    }
    

    // Recebe o valor da reserva e um código do sistema de pagamento
    static async insert(codigoPagamento, valorTotalDaReserva, billingType, dataExpiracao){
        try{
            // var dataExpiracao = moment.tz(new Date(), 'America/Sao_Paulo')
            // dataExpiracao.add(10, 'minutes')
            const pagamento = await Pagamento.create({valor: valorTotalDaReserva, codigoPagamento: codigoPagamento, descricao: billingType, aprovado: false, dataExpiracao: dataExpiracao})
            console.log('Pagamento criado...');
            console.log('Data de expiração: ',dataExpiracao);
            return pagamento.id

        } catch(erro){
            console.log(erro.toString());
            return undefined
        }
    }

    static async delete(id){
        try{
            await Pagamento.destroy({where:{id: id}})
            console.log("Removendo reserva sem pagamento...");
            return true
        }catch(erro) {
            console.log(erro.toString());
            return false
        }
    }

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