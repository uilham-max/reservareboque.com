const Sequelize = require('sequelize')
require('dotenv').config()

console.log("Estabelecendo conexão com o BD...");

const isProduction = process.env.NODE_ENV === 'production';

const conexao = new Sequelize(
    process.env.DB_NAME, 
    process.env.DB_USER, 
    process.env.DB_PASSWORD, 
    {
        host: process.env.DB_HOST_EXTERNO,
        dialect: process.env.DB_DIALECT,
        dialectOptions: isProduction ? {
            ssl: {
                required: true,
                rejectUnauthorized: true
            }
        } : {},
        timezone: '-03:00',
        logging: false
    }
)

module.exports = conexao