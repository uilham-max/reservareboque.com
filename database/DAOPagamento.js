const Pagamento = require('../model/Pagamento')


class DAOPagamento {

    static async getQRCode(){

        let qrCode = 'qrcode.jpg'
        return qrCode
    }

    static async verificaPagamento(){
        return true
    }

}


module.exports = DAOPagamento