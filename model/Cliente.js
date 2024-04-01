const Sequelize = require('sequelize')
const conexao = require('../database/conexao.js')

const Cliente = conexao.define('cliente', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nome: Sequelize.STRING,
    sobrenome: Sequelize.STRING,
    email: Sequelize.STRING, // tornar unique mais tarde
    senha: Sequelize.STRING,
    cpf: Sequelize.STRING, // tornar unique mais tarde
    rg: Sequelize.STRING,
    telefone: Sequelize.STRING, // tornar unique mais tarde
    data_nascimento: Sequelize.DATEONLY,
    cep: Sequelize.STRING,
    logradouro: Sequelize.STRING,
    complemento: Sequelize.STRING,
    bairro: Sequelize.STRING,
    localidade: Sequelize.STRING,
    uf: Sequelize.STRING,
    numero_da_casa: Sequelize.INTEGER,
    ativo: Sequelize.BOOLEAN,
    cadastrado: Sequelize.BOOLEAN
},
{
    timestamps: false,
})

module.exports = Cliente