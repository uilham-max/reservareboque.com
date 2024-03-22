const Sequelize = require('sequelize')
const conexao = require('../database/conexao.js')

const Pagamento = conexao.define('pagamento', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    valor: Sequelize.DOUBLE
},
{
    timestamps: false,
})

// Pagamento.sync(({force: true}))

module.exports = Pagamento