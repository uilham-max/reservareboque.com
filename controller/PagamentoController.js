const DAOPagamento = require('../database/DAOPagamento')
const DAOReserva = require('../database/DAOReserva')
const enviarEmailParaClienteComDadosDaReserva = require('../helpers/enviarEmailParaClienteComDadosDaReserva');
const formatarDadosDoClienteParaEmail = require('../helpers/formatarDadosDoClienteParaEmail');

class PagamentoController {

    static async postWebHookPixRecebido(req, res) {
        try{ 
            let codigoPagamento = req.body.payment.id
            console.log("Executar: Atualizar situação de pagamento e reserva para aprovado:",codigoPagamento);
            await DAOPagamento.atualizarPagamentoParaAprovado(codigoPagamento)
            await DAOReserva.atualizaSituacaoParaAprovado(codigoPagamento) // Recuperar Id da reserva para atualizar a situação dela para aprovado
            enviarEmailParaClienteComDadosDaReserva(await formatarDadosDoClienteParaEmail((await DAOReserva.getOneByPagamentoCodigoPagamento(codigoPagamento))[0]))
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

