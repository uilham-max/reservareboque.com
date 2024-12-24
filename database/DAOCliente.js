const Cliente = require('../model/Cliente.js')
const bcrypt = require('bcryptjs')
const { Op } = require('sequelize')



class DAOCliente{

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
    static async updateClienteComReservaMasNaoEraCadastrado(nome, email, senha, cpf, telefone, data_nascimento, cep, logradouro, complemento, bairro, localidade, uf, numero_da_casa) {
        try {
            let [numLinhasAtualizadas, clientesAtualizados] = await Cliente.update({
                nome: nome,
                email: email,
                senha: senha,
                cpf: cpf,
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
            console.log(nome, 'atualizou seu cadastro para cliente...');
            return clientesAtualizados[0]; // Retorna o primeiro cliente atualizado do array
        } catch (error) {
            console.log(error.toString());
            return false;
        }
    }
    static async verificaSeClienteExiste(cpf){
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
    static async insertClienteQueNaoQuerSeCadastrar(nome, cpf, telefone, email, cep, logradouro, complemento, localidade, numero_da_casa){
        console.log("Inserindo cliente sem cadastro...");
        try{
            const cliente = await Cliente.create({nome: nome, email: email, cpf: cpf, telefone: telefone, data_nascimento: null, cep: cep, logradouro: logradouro, complemento: complemento, bairro: null, localidade: localidade, uf: null, numero_da_casa: numero_da_casa, ativo: true, cadastrado: false})
            // console.log(nome, 'Cliente sem cadastro inserido!');
            return cliente
        }
        catch(erro){
            console.log(erro.toString())
            return false
        }
    }
    static async insert(nome, email, senha, cpf, telefone, data_nascimento, cep, logradouro, complemento, bairro, localidade, uf, numero_da_casa){
        try{
            let cliente = await Cliente.create({nome, email, senha, cpf, telefone, data_nascimento, cep, logradouro, complemento, bairro, localidade, uf, numero_da_casa, ativo: true, cadastrado: true})
            console.log(nome,'se cadastrou como cliente...');
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
    // static async delete(id){
    //     try{
    //         await Cliente.destroy({where: {id: id}})
    //         return true
    //     }
    //     catch(error){
    //         console.log(error.toString())
    //         return false
    //     }
    // }
    static async getOne(cpf){
        try{
            let cliente = await Cliente.findByPk(cpf)
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
    static async getOneByEmail(email){
        try{
            let cliente = await Cliente.findOne({where: {email: email}})
            return cliente
        }
        catch(error){
            console.log(error.toString())
            return false
        }
    }
    static async save(cliente){
        try{
            await cliente.save()
            return true
        }catch(erro){
            console.log(`Erro ao salvar cliente: ${erro}`);
            return false
        }
    }
    static async getOneByToken(token) {
        try{
            const cliente = await Cliente.findOne({
                where: {
                    resetPasswordToken: token,
                    resetPasswordExpires: {[Op.gt]: Date.now()}
                }
            })
            return cliente
        } catch (erro) {
            console.log(`Erro ao consultar cliente: ${erro}`);
            return false
        }
    }

}


module.exports = DAOCliente