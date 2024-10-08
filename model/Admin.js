const Sequelize = require('sequelize')
const conexao = require('../database/conexao.js')

const Admin = conexao.define('admin', {
    id: {
        type: Sequelize.INTEGER,
        // primaryKey: true,
        autoIncrement: true
    },
    nome: Sequelize.STRING,
    cpf: {
        type: Sequelize.STRING,
        primaryKey: true,
        unique: true,
    },
    email: {
        type: Sequelize.STRING,
        unique: true
    },
    senha: Sequelize.STRING
},{timestamps: false})

Admin.sync(({force: false}))

module.exports = Admin