const nodemailer = require('nodemailer')

async function emailPagamentoAprovado(destino){

    if(destino == undefined){
        return
    }
    
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
        }
    });

    try{
        await transporter.sendMail({
            from: process.env.MAIL_USER, // sender address
            to: destino, // list of receivers
            subject: "Reserva do Reboque", // Subject line
            text: "Reserva realizada com sucesso!", // plain text body
            html: "<b>Hello world?</b>", // html body
        });
        console.log("E-mail enviado para %s", destino);
        return
    }catch(erro){
        console.error(erro.toString());
    } finally {
        return
    }

}


module.exports = emailPagamentoAprovado
