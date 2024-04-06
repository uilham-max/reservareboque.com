function cliente(req, res){
    if(req.session.cliente && req.session.cliente.nome){
        let a = req.session.cliente.nome
        let b = req.session.cliente.sobrenome
        return a[0] + b[0]
    } else {
        return ""
    }
}
function admin(req, res){
    if(req.session.admin && req.session.admin.nome){
        let nome = req.session.cliente.nome
        return nome
    } else {
        return ""
    }
}
module.exports = {
    cliente,
    admin
}