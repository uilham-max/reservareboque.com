const Sequelize = require('sequelize')
const conexao = require('../database/conexao.js')

const Pagamento = conexao.define('pagamento', {
    id: {
        type: Sequelize.INTEGER,
        // primaryKey: true,
        autoIncrement: true
    },
    codigoPagamento: {
        type:  Sequelize.STRING,
        primaryKey: true,
        unique: true,
    },
    valor: Sequelize.DOUBLE,
    forma: Sequelize.STRING,
    aprovado: Sequelize.BOOLEAN,
    dataExpiracao: Sequelize.DATE,
    situacao: Sequelize.STRING,
},
{
    timestamps: false,
})

module.exports = Pagamento