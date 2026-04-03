const Sequelize = require('sequelize')
require('dotenv').config()

console.log("Estabelecendo conexão com o BD...");

const conexao = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST_EXTERNO,
    dialect: process.env.DB_DIALECT,
    dialectOptions: {
        ssl: {
            required: true,
            rejectUnauthorized: true
        }
    },
    timezone: '-03:00',
    logging: false
})

module.exports = conexao