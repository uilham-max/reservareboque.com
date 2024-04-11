const Sequelize = require('sequelize')
require('dotenv').config()
const DATABASE = process.env.DATABASE
const USER = process.env.USER
const PASSWORD = process.env.PASSWORD
const DIALECT = process.env.DIALECT

const conexao = new Sequelize(`${DIALECT}://${USER}:${PASSWORD}@${HOST}/${DATABASE}`)


// const conexao = new Sequelize('reboquesmvc', 'postgres', 'postgres', {
//     host: 'localhost',
//     dialect: 'postgres',
//     timezone: '-03:00',
//     logging: false
// })

module.exports = conexao