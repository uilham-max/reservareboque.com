const Sequelize = require('sequelize')
const conexao = require('../database/conexao.js')

const Cliente = conexao.define('cliente', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nome: Sequelize.STRING,
    cpf: Sequelize.STRING,
    logradouro: Sequelize.STRING,
    telefone: Sequelize.STRING
},
{
    timestamps: false,
})

// Cliente.sync(({force: true}))

module.exports = Cliente