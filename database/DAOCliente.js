const Cliente = require('../model/Cliente.js')
const bcrypt = require('bcryptjs')


class DAOCliente{

    // Criado em 29/03/2024
    static async login(email, senha){
        let cliente = await Cliente.findOne({where: {email: email}})
        try{
            if(cliente){
                    return cliente
            } else {
                return undefined
            }
        } catch(erro){
            console.log(erro.toString);
            return undefined
        }
        
    }

    // Data da criação 28/03/2024
    static async updateClienteComReservaMasNaoEraCadastrado(nome, sobrenome, email, senha, cpf, rg, telefone, data_nascimento, cep, logradouro, complemento, bairro, localidade, uf, numero_da_casa) {
        try {
            let [numLinhasAtualizadas, clientesAtualizados] = await Cliente.update({
                nome: nome,
                sobrenome: sobrenome,
                email: email,
                senha: senha,
                cpf: cpf,
                rg: rg,
                telefone: telefone,
                data_nascimento: data_nascimento,
                cep: cep,
                logradouro: logradouro,
                complemento: complemento,
                bairro: bairro,
                localidade: localidade,
                uf: uf,
                numero_da_casa: numero_da_casa,
                ativo: true,
                cadastrado: true
            }, {
                where: { cpf: cpf },
                returning: true // Essa opção é importante para retornar os objetos atualizados
            });
    
            return clientesAtualizados[0]; // Retorna o primeiro cliente atualizado do array
        } catch (error) {
            console.log(error.toString());
            return false;
        }
    }
    

    // Data da criação 28/03/2024
    static async verificaSeOClienteJaExiste(cpf){
        try{
            const cliente = await Cliente.findOne(
                {
                    where:{cpf: cpf}
                }
            )
            if(cliente){
                return cliente
            }
            return false
        } catch(error) {
            console.error('Erro ao buscar cliente por CPF', error);
            throw error
        }
    }

    // Criado em 20/03/2024
    static async insertClienteQueNaoQuerSeCadastrar(nome, sobrenome, email, senha, cpf, rg, telefone, data_nascimento, cep, logradouro, complemento, bairro, localidade, uf, numero_da_casa){
        try{
            const cliente = await Cliente.create({nome, sobrenome, email, senha, cpf, rg, telefone, data_nascimento, cep, logradouro, complemento, bairro, localidade, uf, numero_da_casa, ativo: true, cadastrado: false})
            return cliente.id
        }
        catch(erro){
            console.log(erro.toString())
            return undefined
        }
    }


    static async insert(nome, sobrenome, email, senha, cpf, rg, telefone, data_nascimento, cep, logradouro, complemento, bairro, localidade, uf, numero_da_casa){
        try{
            let cliente = await Cliente.create({nome, sobrenome, email, senha, cpf, rg, telefone, data_nascimento, cep, logradouro, complemento, bairro, localidade, uf, numero_da_casa, ativo: true, cadastrado: true})
            return cliente
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