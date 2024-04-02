function clienteAutorizacao(req, res, next){
    if(req.session.cliente != undefined) {
        next()
    } else {
        res.render('erro', {mensagem: "Acesso negado!"})
    }
}

module.exports = clienteAutorizacao