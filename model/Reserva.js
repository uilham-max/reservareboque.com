const Sequelize = require('sequelize')
const conexao = require('../database/conexao.js')

const Cliente = require('./Cliente.js')
const Reboque = require('./Reboque.js')

const Reserva = conexao.define('reserva', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    dataSaida: Sequelize.DATE,
    dataChegada: Sequelize.DATE,
    valorDiaria: Sequelize.INTEGER,
    valorTotal: Sequelize.INTEGER
})

// um cliente tem muitas reservas
Cliente.hasMany(Reserva, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
})
// locação pertence a apenas um cliente
Reserva.belongsTo(Cliente)

// um reboque tem muitas reservas
Reboque.hasMany(Reserva, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
})
// uma locação pertence a apenas um reboque
Reserva.belongsTo(Reboque)

// Reserva.sync(({force: false}))

module.exports = Reserva


