const Pagamento = require('../model/Pagamento')


class DAOPagamento {

    // Recebe o valor da reserva e um código do sistema de pagamento
    static async insert(valorTotalDaReserva, codigoPagamento){
        try{
            const pagamento = await Pagamento.create({valor: valorTotalDaReserva, codigoPagamento: codigoPagamento, descricao: "PIX"})
            return pagamento.id

        } catch(erro){
            console.log(erro.toString());
            return undefined
        }
    }

    static async getQRCode(){
        let qrCode = 'qrcode.jpg'
        return qrCode
    }

    // Realiza o pagamento e retorna um valor (código do pagamento)
    static async verificaPagamento(){
        // Logica para gerar o codigo do pagamento
        try{
            let codigoDePagamento = Math.floor(Math.random() * 100000)
            return codigoDePagamento
        } catch(erro){
            console.log(erro.toString());
            return undefined
        }
    }
}


module.exports = DAOPagamento