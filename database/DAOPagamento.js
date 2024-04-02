const Pagamento = require('../model/Pagamento')


class DAOPagamento {


    static async atualizarPagamentoParaAprovado(idPagamento){
        try{
            await Pagamento.update(
                {aprovado: true},
                {where: {id: idPagamento}}
            )
            console.log('atualizando status do pagamento para aprovado...');
            return true 
        } catch(erro){
            console.log(erro.toString());
            return false
        }
    }

    // Recebe o valor da reserva e um código do sistema de pagamento
    static async insert(codigoPagamento, valorTotalDaReserva){
        try{
            const pagamento = await Pagamento.create({valor: valorTotalDaReserva, codigoPagamento: codigoPagamento, descricao: "PIX", aprovado: false})
            console.log(codigoPagamento, 'criado. Aguardando pagamento...');
            return pagamento.id

        } catch(erro){
            console.log(erro.toString());
            return undefined
        }
    }

    static async getDadosPagamento(valorPagamento){
        try{
            let pagamento = {
                'qrCode':  'qrcode.jpg',
                'codigo': Math.floor(Math.random() * 100000),
                'valor': valorPagamento
            }
            return pagamento
        } catch(erro){
            console.log(erro.toString());
            return undefined
        }
        
    }

    static async verificaPagamento(){
        try{
            return true
        } catch(erro){
            console.log(erro.toString());
            return false
        }
    }
}


module.exports = DAOPagamento