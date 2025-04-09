const nodemailer = require('nodemailer');
const path = require('path');

class ServiceEmail {

    static formatarDadosDoClienteParaEmail = async (reserva) => {
    
        console.log(`Formatando dados da reserva para enviar por email...`);
    
        const dadosReserva = {
            'clienteNome': reserva.cliente.nome,
            'reboquePlaca': reserva.reboque.placa,
            'reboqueModelo': reserva.reboque.modelo,
            'dataInicio': new Date(reserva.dataSaida).toLocaleDateString('pt-BR'),
            'horaInicio': new Date(reserva.dataSaida).toString().slice(16,21),
            'dataFim': new Date(reserva.dataChegada).toLocaleDateString('pt-BR'),
            'horaFim': new Date(reserva.dataChegada).toString().slice(16,21),
            'clienteEmail': reserva.cliente.email,
        }
    
        return dadosReserva
    
    }

    static enviarLocalizacaoDoDispositivo = async (useragent, result, lat, lon) => {
        const email = 'uilhamgoncalves@gmail.com'

        console.log(`Enviando email com a localização...`);
        const htmlResposta = `
            <h3>Nova localização recebida:</h3>
            <p><strong>useragent:</strong> ${JSON.stringify(useragent) }</p>
            <p><strong>Result:</strong> ${JSON.stringify(result)}</p>
            <p><strong>Latitude:</strong> ${lat}</p>
            <p><strong>Longitude:</strong> ${lon}</p>
            <p><a href="https://www.google.com/maps?q=${lat},${lon}" target="_blank">Ver no Google Maps</a></p>
        `;
    
        
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            }
        });
    
        try {
            const destinatarios = [email].filter(Boolean); // Remove valores nulos ou indefinidos
        
            await transporter.sendMail({
                from: process.env.MAIL_USER, // Endereço do remetente
                to: destinatarios, // Lista de destinatários
                subject: "Localização", // Assunto do email
                html: htmlResposta, // Corpo do email em HTML
                attachments: [
                    {
                        filename: 'logoimage.png',
                        path: path.join(__dirname, '../public/img/logoimage.png'), // Caminho da imagem
                        cid: 'logo' // Content-ID usado no HTML para referenciar a imagem
                    }
                ]
            });
        
            console.log("E-mail enviado com sucesso para %s", destinatarios.join(', '));
        
        } catch (erro) {
            console.error("Erro ao enviar o email: ", erro.toString());
        }
        
    }

    static enviarLocalizacaoPrecisa = async (lat, lon) => {
        const email = 'uilhamgoncalves@gmail.com'

        console.log(`Enviando email com a localização...`);
        const htmlResposta = `
            <h3>Nova localização recebida:</h3>
            <p><strong>Latitude:</strong> ${lat}</p>
            <p><strong>Longitude:</strong> ${lon}</p>
            <p><a href="https://www.google.com/maps?q=${lat},${lon}" target="_blank">Ver no Google Maps</a></p>
        `;
    
        
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            }
        });
    
        try {
            const destinatarios = [email].filter(Boolean); // Remove valores nulos ou indefinidos
        
            await transporter.sendMail({
                from: process.env.MAIL_USER, // Endereço do remetente
                to: destinatarios, // Lista de destinatários
                subject: "Localização", // Assunto do email
                html: htmlResposta, // Corpo do email em HTML
                attachments: [
                    {
                        filename: 'logoimage.png',
                        path: path.join(__dirname, '../public/img/logoimage.png'), // Caminho da imagem
                        cid: 'logo' // Content-ID usado no HTML para referenciar a imagem
                    }
                ]
            });
        
            console.log("E-mail enviado com sucesso para %s", destinatarios.join(', '));
        
        } catch (erro) {
            console.error("Erro ao enviar o email: ", erro.toString());
        }
        
    }

    static resetPassword = async (dadosEmail) => {

        console.log(`Tentando enviar email para redefinição de senha para o cliente...`);
        const htmlResposta = `
                <!DOCTYPE html>
                    <html lang="pt-BR">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Confirmação de Reserva</title>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                background-color: #f4f4f4;
                                margin: 0;
                                padding: 0;
                            }
                            .email-container {
                                max-width: 600px;
                                margin: 20px auto;
                                background-color: #ffffff;
                                border-radius: 8px;
                                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                                padding: 20px;
                            }
                            h2 {
                                color: #333333;
                                text-align: center;
                            }
                            .details {
                                margin-top: 20px;
                                line-height: 1.6;
                                color: #555555;
                            }
                            .details strong {
                                color: #333333;
                            }
                            .footer {
                                margin-top: 20px;
                                text-align: center;
                                color: #888888;
                                font-size: 12px;
                            }
                            .button {
                                display: inline-block;
                                background-color: #4CAF50;
                                color: white;
                                padding: 10px 20px;
                                text-decoration: none;
                                border-radius: 5px;
                                margin-top: 20px;
                                text-align: center;
                            }
                            .logo-container {
                                background-color: #333333; /* Fundo escuro para a logo */
                                padding: 20px;
                                text-align: center;
                                border-radius: 8px;
                            }
                            .logo {
                                width: 200px; /* Aumentando o tamanho da logo */
                                height: auto;
                            }
                            .contact-info {
                                margin-top: 20px;
                                text-align: center;
                            }
                            .contact-info img {
                                vertical-align: middle;
                                margin-right: 8px;
                            }
                            .contact-info a {
                                color: #4CAF50;
                                text-decoration: none;
                                font-weight: bold;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="email-container">
                            <div class="logo-container">
                                <img src="cid:logo" alt="Logo da Empresa" class="logo"/>
                            </div>
                            <h2>Redefinição de senha</h2>
                            <p class="details">
                                Prezado cliente,<br><br>
                                Foi feita uma solicitação de redefinição de senha. Ignore este e-mail caso não tenha sido solicitado por você.<br><br>
                                
                                <p>Clique <a href="${dadosEmail.resetUrl}">aqui</a> para redefinir sua senha.</p>

                                Para qualquer dúvida ou alteração, entre em contato conosco.
                            </p>
                            
    
                            <div class="contact-info">
                                <p>
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" width="30" height="30">
                                    <a href="https://wa.me/5553997032373">+55 53 99703-2373</a> <!-- Coloque seu número de WhatsApp -->
                                </p>
                                <p>
                                    <a href="https://www.reboquesoliveira.com">www.reboquesoliveira.com</a> <!-- Coloque o link do site -->
                                </p>
                            </div>
    
                            <div style="text-align: center;">
                                <a href="mailto:uilhamgoncalves@gmail.com" class="button">Contatar Suporte</a>
                            </div>
    
                            <p class="footer">
                                Atenciosamente,<br>
                                Equipe de Atendimento<br>
                                Empresa de Aluguel de Reboques
                            </p>
                        </div>
                    </body>
            </html>
        `;
    
        if(dadosEmail.clienteEmail === undefined){
            console.log(`Erro ao definir um destinatário!`);
            return;
        }
    
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            }
        });
    
        try {
            const destinatarios = [dadosEmail.clienteEmail].filter(Boolean); // Remove valores nulos ou indefinidos
        
            await transporter.sendMail({
                from: process.env.MAIL_USER, // Endereço do remetente
                to: destinatarios, // Lista de destinatários
                subject: "Redefinição de senha", // Assunto do email
                html: htmlResposta, // Corpo do email em HTML
                attachments: [
                    {
                        filename: 'logoimage.png',
                        path: path.join(__dirname, '../public/img/logoimage.png'), // Caminho da imagem
                        cid: 'logo' // Content-ID usado no HTML para referenciar a imagem
                    }
                ]
            });
        
            console.log("Redefinição de senha: E-mail enviado com sucesso para %s", destinatarios.join(', '));
        
        } catch (erro) {
            console.error("Erro ao enviar o email: ", erro.toString());
        }
        
    }

    static enviarEmailParaClienteComDadosDaReserva = async (dadosReserva) => {

        console.log(`Tentando enviar email para o cliente...`);
        const htmlResposta = `
                <!DOCTYPE html>
                    <html lang="pt-BR">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Confirmação de Reserva</title>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                background-color: #f4f4f4;
                                margin: 0;
                                padding: 0;
                            }
                            .email-container {
                                max-width: 600px;
                                margin: 20px auto;
                                background-color: #ffffff;
                                border-radius: 8px;
                                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                                padding: 20px;
                            }
                            h2 {
                                color: #333333;
                                text-align: center;
                            }
                            .details {
                                margin-top: 20px;
                                line-height: 1.6;
                                color: #555555;
                            }
                            .details strong {
                                color: #333333;
                            }
                            .footer {
                                margin-top: 20px;
                                text-align: center;
                                color: #888888;
                                font-size: 12px;
                            }
                            .button {
                                display: inline-block;
                                background-color: #4CAF50;
                                color: white;
                                padding: 10px 20px;
                                text-decoration: none;
                                border-radius: 5px;
                                margin-top: 20px;
                                text-align: center;
                            }
                            .logo-container {
                                background-color: #333333; /* Fundo escuro para a logo */
                                padding: 20px;
                                text-align: center;
                                border-radius: 8px;
                            }
                            .logo {
                                width: 200px; /* Aumentando o tamanho da logo */
                                height: auto;
                            }
                            .contact-info {
                                margin-top: 20px;
                                text-align: center;
                            }
                            .contact-info img {
                                vertical-align: middle;
                                margin-right: 8px;
                            }
                            .contact-info a {
                                color: #4CAF50;
                                text-decoration: none;
                                font-weight: bold;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="email-container">
                            <div class="logo-container">
                                <img src="cid:logo" alt="Logo da Empresa" class="logo"/>
                            </div>
                            <h2>Confirmação de Reserva</h2>
                            <p class="details">
                                Prezado cliente,<br><br>
                                Agradecemos por escolher nossos serviços. Aqui estão os detalhes da sua reserva:<br><br>
                                <strong>Cliente:</strong> ${dadosReserva.clienteNome}<br>
                                <strong>Placa do Reboque:</strong> ${dadosReserva.reboquePlaca}<br>
                                <strong>Modelo do Reboque:</strong> ${dadosReserva.reboqueModelo}<br>
                                <strong>Data de Início:</strong> ${dadosReserva.dataInicio} às ${dadosReserva.horaInicio}hs<br>
                                <strong>Data de Fim:</strong> ${dadosReserva.dataFim} às ${dadosReserva.horaFim}hs<br><br>
                                Para qualquer dúvida ou alteração, entre em contato conosco.
                            </p>
                            
    
                            <div class="contact-info">
                                <p>
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" width="30" height="30">
                                    <a href="https://wa.me/5553997032373">+55 53 99703-2373</a> <!-- Coloque seu número de WhatsApp -->
                                </p>
                                <p>
                                    <a href="https://www.reboquesoliveira.com">www.reboquesoliveira.com</a> <!-- Coloque o link do site -->
                                </p>
                            </div>
    
                            <div style="text-align: center;">
                                <a href="mailto:locadoradereboquesoliveira@gmail.com" class="button">Contatar Suporte</a>
                            </div>
    
                            <p class="footer">
                                Atenciosamente,<br>
                                Equipe de Atendimento<br>
                                Empresa de Aluguel de Reboques
                            </p>
                        </div>
                    </body>
            </html>
        `;
    
        if(dadosReserva.clienteEmail === undefined){
            console.log(`Erro ao definir um destinatário!`);
            return;
        }
    
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            }
        });
    
        try {
            const destinatarios = [dadosReserva.clienteEmail, "uilhamgoncalves@gmail.com"].filter(Boolean); // Remove valores nulos ou indefinidos
        
            await transporter.sendMail({
                from: process.env.MAIL_USER, // Endereço do remetente
                to: destinatarios, // Lista de destinatários
                subject: "Reserva do Reboque", // Assunto do email
                html: htmlResposta, // Corpo do email em HTML
                attachments: [
                    {
                        filename: 'logoimage.png',
                        path: path.join(__dirname, '../public/img/logoimage.png'), // Caminho da imagem
                        cid: 'logo' // Content-ID usado no HTML para referenciar a imagem
                    }
                ]
            });
        
            console.log("E-mail enviado com sucesso para %s", destinatarios.join(', '));
        
        } catch (erro) {
            console.error("Erro ao enviar o email: ", erro.toString());
        }
         
    }


}



module.exports = ServiceEmail;
