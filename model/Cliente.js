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
})

// Cliente.sync(({force: false}))

module.exports = Cliente