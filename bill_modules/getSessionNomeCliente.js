function getSessionNome(req, res){
    if(req.session.cliente && req.session.cliente.nome){
        let a = req.session.cliente.nome
        let b = req.session.cliente.sobrenome
        return a[0] + b[0]
    } else {
        return ""
    }
}
module.exports = getSessionNome