const Sequelize = require('sequelize')
const conexao = require('../database/conexao.js')

const Cliente = require('./Cliente.js')
const Reboque = require('./Reboque.js')
const Pagamento = require('./Pagamento.js')




const Reserva = conexao.define('reserva', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    dataSaida: Sequelize.DATEONLY,
    dataChegada: Sequelize.DATEONLY,
    valorDiaria: Sequelize.INTEGER,
    diarias: Sequelize.INTEGER,
    valorTotal: Sequelize.INTEGER
},{
    timestamps: false,
}
)

// um cliente tem muitas locações
Cliente.hasMany(Reserva, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
})
// uma locação pertence a apenas um cliente
Reserva.belongsTo(Cliente)

// um reboque tem muitas locações
Reboque.hasMany(Reserva, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
})
// uma locação pertence a apenas um reboque
Reserva.belongsTo(Reboque)


Pagamento.hasMany(Reserva, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
})

Reserva.belongsTo(Pagamento)


Cliente.sync(({force: false}))
Reboque.sync(({force: false}))
Pagamento.sync(({force: false}))
Reserva.sync(({force: false}))


module.exports = Reserva


