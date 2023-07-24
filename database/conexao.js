const Sequelize = require('sequelize')

const conexao = new Sequelize('reboquesmvc', 'postgres', 'postgres', {
    host: 'localhost',
    dialect: 'postgres',
    timezone: '-03:00',
    logging: false
})

module.exports = conexao

