function autorizacao(req, res, next){
    if(req.session.admin != undefined) {
        next()
    } else {
        res.redirect('/')
    }
}

module.exports = autorizacao