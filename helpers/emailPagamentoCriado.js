const nodemailer = require('nodemailer')

async function emailPagamentoCriado(destino){

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
            subject: "Reserva criada.", // Subject line
            text: "Uma reserva criada está esperando a aprovação", // plain text body
            html: "<b>https://sandbox.asaas.com/payment/list</b> <p>Uma reserva criada está esperando a aprovação</p>", // html body
        });
        console.log("E-mail enviado para %s", destino);
        return
    }catch(erro){
        console.error(erro.toString());
    } finally {
        return
    }

}


module.exports = emailPagamentoCriado
