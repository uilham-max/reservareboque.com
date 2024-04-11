const Sequelize = require('sequelize')

// const conexao = new Sequelize('reboquesmvc', 'reboquesmvc_user', 'CScOS7Jmyl7fz2NkQWynsGNFJrUBR0wm', {
//     host: 'postgres://dpg-cobjdm5jm4es739qo6gg-a/reboquesmvc',
//     dialect: 'postgres',
//     timezone: '-03:00',
//     logging: false
// })

const conexao = new Sequelize('postgres://reboquesmvc_user:CScOS7Jmyl7fz2NkQWynsGNFJrUBR0wm@dpg-cobjdm5jm4es739qo6gg-a/reboquesmvc')

module.exports = conexao

// postgres://reboquesmvc_user:CScOS7Jmyl7fz2NkQWynsGNFJrUBR0wm@dpg-cobjdm5jm4es739qo6gg-a/reboquesmvc

// postgres://reboquesmvc_user:CScOS7Jmyl7fz2NkQWynsGNFJrUBR0wm@dpg-cobjdm5jm4es739qo6gg-a.oregon-postgres.render.com/reboquesmvc
