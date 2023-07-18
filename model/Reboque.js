
// Uma model faz contato com o bd, importar conexão, importar Sequelize
const Sequelize = require('sequelize')
const conexao = require('../database/conexao.js')

const Reboque = conexao.define('reboque', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    placa: Sequelize.STRING,
    modelo: Sequelize.STRING,
    valorDiaria: Sequelize.INTEGER
})

// Reboque.sync(({force: false}))

module.exports = Reboque