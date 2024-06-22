const Sequelize = require('sequelize')
const conexao = require('../database/conexao.js')

const Pagamento = conexao.define('pagamento', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    codigoPagamento: {
        type:  Sequelize.STRING,
        unique: true,
    },
    valor: Sequelize.DOUBLE,
    descricao: Sequelize.STRING,
    aprovado: Sequelize.BOOLEAN,
    dataExpiracao: Sequelize.DATE
},
{
    timestamps: false,
})

module.exports = Pagamento