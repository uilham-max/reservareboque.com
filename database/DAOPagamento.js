const Pagamento = require('../model/Pagamento')


class DAOPagamento {


    static async getIdUltimoPagamentoInserido() {
        try {
            // Realiza a consulta usando o Sequelize para recuperar o último pagamento inserido
            const ultimoPagamento = await Pagamento.findOne({
                order: [['id', 'DESC']], // Ordena pelo ID em ordem decrescente
                attributes: ['id'] // Apenas recupera o ID do pagamento
            });
    
            if (ultimoPagamento) {
                return ultimoPagamento.id; // Retorna o ID do último pagamento inserido
            } else {
                throw new Error('Nenhum pagamento encontrado.'); // Lança um erro se nenhum pagamento for encontrado
            }
        } catch (error) {
            console.error('Erro ao recuperar o ID do último pagamento inserido:', error);
            return null; // Ou você pode retornar undefined, dependendo do tratamento desejado para erros
        }
    }

    // Recebe o valor da reserva e um código do sistema de pagamento
    static async insert(valorTotalDaReserva, codigoPagamento){
        try{
            await Pagamento.create({valor: valorTotalDaReserva, codigoPagamento: codigoPagamento, descricao: "PIX"})
            return true

        } catch(erro){
            console.log(erro.toString());
            return false
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
            return 0
        }
    }



}


module.exports = DAOPagamento