const Sequelize = require('sequelize')
const conexao = require('../database/conexao.js')

const Pagamento = conexao.define('pagamento', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    valor: Sequelize.DOUBLE,
    codigoPagamento: Sequelize.INTEGER,
    descricao: Sequelize.STRING
},
{
    timestamps: false,
})

module.exports = Pagamento