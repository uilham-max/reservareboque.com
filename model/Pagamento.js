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
    descricao: Sequelize.STRING,
    aprovado: Sequelize.BOOLEAN
},
{
    timestamps: false,
})

module.exports = Pagamento