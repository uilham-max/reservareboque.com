const Sequelize = require('sequelize')
require('dotenv').config()

/** Conexão remota com banco de dados do Render.com */

// const conexao = new Sequelize(process.env.RENDER_DB_NOME, process.env.RENDER_DB_USER, process.env.RENDER_DB_PASSWORD, {
//     host: process.env.RENDER_DB_HOST_EXTERNO,
//     dialect: process.env.RENDER_DB_DIALECT,
//     dialectOptions: {
//         ssl: {
//             required: true,
//             rejectUnauthorized: true
//         }
//     },
//     timezone: '-03:00',
//     logging: false
// })

/** Esta conexão deve ser usada no GitHub */ 

const conexao = new Sequelize(process.env.RENDER_DB_NOME, process.env.RENDER_DB_USER, process.env.RENDER_DB_PASSWORD, {
    host: process.env.RENDER_DB_HOST,
    dialect: process.env.RENDER_DB_DIALECT,
    timezone: '-03:00',
    logging: false
})

/**Configuração de conexão com banco de dados local */

// const conexao = new Sequelize(process.env.DB_NOME, process.env.DB_USER, process.env.DB_PASSWORD, {
//     host: process.env.DB_HOST,
//     dialect: process.env.DB_DIALECT,
//     timezone: '-03:00',
//     logging: false
// })


module.exports = conexao