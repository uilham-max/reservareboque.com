const multer = require('multer')

const storage = multer.diskStorage({
    filename: function(req, file, cb){
        let nome = Date.now()+"-"+file.originalname
        cb(null, nome)
    },
    destination: function(req, file, cb){
        let path = "public/img"
        cb(null, path)
    }
})

const upload = multer({
    storage,
    fileFilter: function(req, file, cb){
        cb(null, true)
    }
})


module.exports={
    upload
}