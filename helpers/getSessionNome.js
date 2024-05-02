
// RETORNA SOMENTE AS INICIAS DO NOME
function clienteNome(req, res){
    if(req.session.cliente && req.session.cliente.nome){
        let a = req.session.cliente.nome
        let b = req.session.cliente.sobrenome
        return a[0] + b[0]
    } else {
        return ""
    }
}
function adminNome(req, res){
    if(req.session.admin && req.session.admin.nome){
        let nome = req.session.admin.nome
        return nome
    } else {
        return ""
    }
}
module.exports = {
    clienteNome,
    adminNome
}