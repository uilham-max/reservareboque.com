const Sequelize = require('sequelize')
const conexao = require('../database/conexao.js')

const Cliente = conexao.define('cliente', {
    id: {
        type: Sequelize.INTEGER,
        // primaryKey: true,
        autoIncrement: true
    },
    nome: Sequelize.STRING,
    email: {
        type: Sequelize.STRING,
        // unique: true,
    },
    senha: Sequelize.STRING,
    cpf: {
        type: Sequelize.STRING,
        primaryKey: true,
        unique: true,
    }, 
    telefone: Sequelize.STRING,
    data_nascimento: Sequelize.DATEONLY,
    cep: Sequelize.STRING,
    logradouro: Sequelize.STRING,
    complemento: Sequelize.STRING,
    bairro: Sequelize.STRING,
    localidade: Sequelize.STRING,
    uf: Sequelize.STRING,
    numero_da_casa: Sequelize.INTEGER,
    ativo: Sequelize.BOOLEAN,
    cadastrado: Sequelize.BOOLEAN,
    resetPasswordToken: Sequelize.STRING,
    resetPasswordExpires: Sequelize.DATE,
},
{
    timestamps: false,
})

module.exports = Cliente