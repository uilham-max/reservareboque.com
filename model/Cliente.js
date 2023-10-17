const Sequelize = require('sequelize')
const conexao = require('../database/conexao.js')

const Cliente = conexao.define('cliente', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nome: Sequelize.STRING,
    email: Sequelize.STRING,
    senha: Sequelize.STRING,
    cpf: Sequelize.STRING,
    rua: Sequelize.STRING,
    numero: Sequelize.INTEGER,
    bairro: Sequelize.STRING,
    cidade: Sequelize.STRING,
    uf: Sequelize.STRING,
    cep: Sequelize.STRING,
    telefone: Sequelize.STRING
},
{
    timestamps: false,
})

// Cliente.sync(({force: true}))

module.exports = Cliente