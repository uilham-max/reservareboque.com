const Sequelize = require('sequelize')
require('dotenv').config()
const DATABASE = process.env.DATABASE
const USER = process.env.USER
const PASSWORD = process.env.PASSWORD
const URL = process.env.URL

const conexao = new Sequelize(DATABASE, USER, PASSWORD, {
    host: URL,
    dialect: DIALECT,
    timezone: '-30:00',
    logging: false
})


// const conexao = new Sequelize('reboquesmvc', 'postgres', 'postgres', {
//     host: 'localhost',
//     dialect: 'postgres',
//     timezone: '-03:00',
//     logging: false
// })

module.exports = conexao