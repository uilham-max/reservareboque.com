const Sequelize = require('sequelize')
require('dotenv').config()

RENDER_DB_NOME = process.env.RENDER_DB_NOME
RENDER_DB_USER = process.env.RENDER_DB_USER
RENDER_DB_PASSWORD = process.env.RENDER_DB_PASSWORD
RENDER_DB_HOST_EXTERNO = process.env.RENDER_DB_HOST_EXTERNO
RENDER_DB_DIALECT = process.env.RENDER_DB_DIALECT

/** Conectando (usando) ao BD remoto no Render.com */

const conexao = new Sequelize(RENDER_DB_NOME, RENDER_DB_USER, RENDER_DB_PASSWORD, {
    host: RENDER_DB_HOST_EXTERNO,
    dialect: RENDER_DB_DIALECT,
    dialectOptions: {
        ssl: {
            required: true,
            rejectUnauthorized: true
        }
    },
    timezone: '-03:00',
    logging: false
})

/** Conexão interna do Render.com */ 

// const conexao = new Sequelize(process.env.RENDER_DB_NOME, process.env.RENDER_DB_USER, process.env.RENDER_DB_PASSWORD, {
//     host: process.env.RENDER_DB_HOST,
//     dialect: process.env.RENDER_DB_DIALECT,
//     timezone: '-03:00',
//     logging: false
// })

// const conexao = new Sequelize("postgres://reboquesmvc_user:CScOS7Jmyl7fz2NkQWynsGNFJrUBR0wm@dpg-cobjdm5jm4es739qo6gg-a/reboquesmvc")

/**Conexão com banco de dados local */

// const conexao = new Sequelize(process.env.DB_NOME, process.env.DB_USER, process.env.DB_PASSWORD, {
//     host: process.env.DB_HOST,
//     dialect: process.env.DB_DIALECT,
//     timezone: '-03:00',
//     logging: false
// })


module.exports = conexao