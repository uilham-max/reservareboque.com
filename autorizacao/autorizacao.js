function autorizacao(req, res, next){
    if(req.session.admin != undefined) {
        next()
    } else {
        res.render('erro', {mensagem: "Acesso negado!"})
    }
}

module.exports = autorizacao