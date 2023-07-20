
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
    cor: Sequelize.STRING,
    valorDiaria: Sequelize.INTEGER
},
{
    timestamps: false,
})

// Reboque.sync(({force: true}))

module.exports = Reboque