const Sequelize = require('sequelize')
const conexao = require('../database/conexao.js')

const Usuario = conexao.define('usuario', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nome: Sequelize.STRING,
    email: Sequelize.STRING,
    senha: Sequelize.STRING
},{timestamps: false})

// Usuario.sync(({force: true}))

module.exports = Usuario