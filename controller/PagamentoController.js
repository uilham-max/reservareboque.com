const DAOPagamento = require('../database/DAOPagamento')
const DAOReserva = require('../database/DAOReserva')
const ServiceEmail = require('../modules/ServiceEmail')
const { SituacaoReserva } = require('../enums')


class PagamentoController {

    static async postWebHookPixRecebido(req, res) {
        try{ 
            let codigoPagamento = req.body.payment.id
            console.log("Executar: Atualizar situação de pagamento e reserva para aprovado:",codigoPagamento);
            await DAOPagamento.atualizarPagamentoParaAprovado(codigoPagamento)
            let reservas = await DAOReserva.getOneByPagamentoCodigoPagamento(codigoPagamento)
            await DAOReserva.atualizaSituacao(reservas[0].id, SituacaoReserva.APROVADO)
            await ServiceEmail.enviarEmailParaClienteComDadosDaReserva(await ServiceEmail.formatarDadosDoClienteParaEmail((await DAOReserva.getOneByPagamentoCodigoPagamento(codigoPagamento))[0]))
        }catch(error){
            console.warn(error);
        }finally{
            res.sendStatus(200) ;
        }    
        
    }
    static async getPagamentoVerificaStatus(req, res) {
        let {codigoPagamento} = req.params
        try{
            let resposta = await DAOPagamento.verificaPagamento(codigoPagamento)
            if(resposta.aprovado == true){
                console.log("Pagamento aprovado:",codigoPagamento);
                res.status(200).json({aprovado: true})
            }else{
                res.status(200).json({aprovado: false})
            }
        }catch(erro){
            console.log(codigoPagamento ," --> Erro ao processar pagamento!");
            console.error(erro);
        }
    }

}

module.exports = PagamentoController

