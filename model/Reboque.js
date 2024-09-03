
const Sequelize = require('sequelize')
const conexao = require('../database/conexao.js')
const Cliente = require('./Cliente.js')

const Reboque = conexao.define('reboque', {
    id: {
        type: Sequelize.INTEGER,
        // primaryKey: true,
        autoIncrement: true
    },
    placa: {
        type: Sequelize.STRING, 
        primaryKey: true,
        unique: true
    },
    modelo: Sequelize.STRING,
    cor: Sequelize.STRING,
    valorDiaria: Sequelize.FLOAT,
    foto: Sequelize.STRING,
    pesoBruto: Sequelize.INTEGER,
    comprimento: Sequelize.INTEGER,
    largura: Sequelize.INTEGER,
    altura: Sequelize.INTEGER,
    quantidadeDeEixos: Sequelize.INTEGER,
    anoFabricacao: Sequelize.BIGINT,
    ativo: Sequelize.BOOLEAN,
    descricao: Sequelize.STRING
},
{
    timestamps: false,
})

module.exports = Reboque
