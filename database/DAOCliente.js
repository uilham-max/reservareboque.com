const Cliente = require('../model/Cliente.js')


class DAOCliente{

    static async insert(nome, cpf, telefone, endereco){
        try{
            await Cliente.create({nome, cpf, telefone, endereco})
            return true
        }
        catch(erro){
            console.log(erro.toString())
            return false
        }
    }

    static async getLastInsertedClientId() {
        try {
            // Realiza a consulta usando o Sequelize para recuperar o último cliente inserido
            const ultimoCliente = await Cliente.findOne({
                order: [['id', 'DESC']], // Ordena pelo ID em ordem decrescente
                attributes: ['id'] // Apenas recupera o ID do cliente
            });
    
            if (ultimoCliente) {
                return ultimoCliente.id; // Retorna o ID do último cliente inserido
            } else {
                throw new Error('Nenhum cliente encontrado.'); // Lança um erro se nenhum cliente for encontrado
            }
        } catch (error) {
            console.error('Erro ao recuperar o ID do último cliente inserido:', error);
            return null; // Ou você pode retornar undefined, dependendo do tratamento desejado para erros
        }
    }
    

    static async insertCliente(nome, cpf, telefone, email, cep, numeroDaCasa){
        try{
            await Cliente.create({nome, cpf, telefone, email, cep, numeroDaCasa})
            return true
        }
        catch(erro){
            console.log(erro.toString())
            return false
        }
    }

    static async update(id, nome, cpf, telefone, endereco){
        try{
            await Cliente.update({nome: nome, cpf: cpf, telefone: telefone, endereco: endereco},{where: {id: id}})
            return true
        }
        catch(error){
            console.log(error.toString())
            return false
        }
    }

    static async delete(id){
        try{
            await Cliente.destroy({where: {id: id}})
            return true
        }
        catch(error){
            console.log(error.toString())
            return false
        }
    }

    static async getOne(id){
        try{
            let cliente = await Cliente.findByPk(id)
            return cliente
        }
        catch(error){
            console.log(error.toString())
            return undefined
        }
    }

    static async getAll(){
        try{
            let clientes = await Cliente.findAll({order: ['nome']})
            return clientes
        }
        catch(error){
            console.log(error.toString())
            return undefined
        }
    }

}


module.exports = DAOCliente