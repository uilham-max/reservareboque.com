const Pagamento = require('../model/Pagamento')


class DAOPagamento {


    static async atualizarPagamentoParaAprovado(idPagamento){
        try{
            const [numLinhasAtualizadas] = await Pagamento.update(
                {aprovado: true},
                {where: {id: idPagamento}}
            );
            // console.log('Atualizando status do pagamento para aprovado...');
            if (numLinhasAtualizadas > 0) {
                console.log('Pagamento atualizado para aprovado com sucesso.');
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
    static async insert(codigoPagamento, valorTotalDaReserva){
        try{
            const pagamento = await Pagamento.create({valor: valorTotalDaReserva, codigoPagamento: codigoPagamento, descricao: "PIX", aprovado: false})
            console.log('Pagamento criado...');
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

    static async delete(id){
        try{
            await Pagamento.destroy({where:{id: id}})
            console.log("Removendo pagamento da reserva...");
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