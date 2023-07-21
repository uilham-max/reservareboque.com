
const Sequelize = require('sequelize')
const conexao = require('../database/conexao.js')

const Reboque = conexao.define('reboque', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    placa: {type: Sequelize.STRING, unique: true},
    modelo: Sequelize.STRING,
    cor: Sequelize.STRING,
    valorDiaria: Sequelize.INTEGER
},
{
    timestamps: false,
})

// Reboque.sync(({force: true}))

module.exports = Reboque