const express = require('express')
const routerAdmin = express.Router()
const DAOAdmin = require('../database/DAOAdmin')
const bcrypt = require('bcryptjs')
const autorizacao = require('../autorizacao/autorizacao')
const { adminNome } = require('../helpers/getSessionNome')
const DAOReserva = require('../database/DAOReserva')
const moment = require('moment-timezone')
const DAOReboque = require('../database/DAOReboque')
const useragent = require('express-useragent')
const Login = require('../bill_modules/Login')


routerAdmin.get('/admin/painel', async (req, res) => {

    Login.admin(process.env.ADMIN_EMAIL_TESTE, process.env.ADMIN_SENHA_TESTE, req)

    let useragent = req.useragent

    let dataAtual = moment.tz('America/Sao_Paulo');
    let dia = [];
    let datasets = [];

    // MONTAR ARRAY DE DIAS
    for (let i = 0; i < dataAtual.daysInMonth(); i++) {
        dia[i] = { x: (i + 1).toString(), y: "0" };
    }
    
    let reboques = await DAOReboque.getAll();

    // ITERA POR CADA REBOQUE
    for (let i = 0; i < reboques.length; i++) {
        // RETORNA RESERVAS DE CADA REBOQUE
        let reservas = await DAOReserva.getReservas(reboques[i].placa);

        if (reservas) {
            let datasArray = [];

            // ITERA PELAS RESERVAS DE CADA REBOQUE
            for (let j = 0; j < reservas.length; j++) {

                let dataInicio = parseInt(reservas[j].dataValues.dataSaida.getDate());
                let dataFim = parseInt(reservas[j].dataValues.dataChegada.getDate());
                let maxDay = dataAtual.daysInMonth();
                let valorDiaria = (reservas[j].pagamento.valor / reservas[j].dataValues.diarias).toFixed(2);

                if (dataFim < dataInicio) {
                    dataFim = maxDay;
                }

                let diasReservadosArray = [];                

                // GRAVAR DIAS NO ARRAY
                for (let k = dataInicio; k <= dataFim; k++) {
                    diasReservadosArray.push({ x: k.toString(), y: valorDiaria });
                }

                // JUNTAR DIAS DO REBOQUE NUM UNICO ARRAY
                datasArray.push(...diasReservadosArray);
            }

            // COPIA CADA DIA RESERVADO PARA O CALENDARIO DO REBOQUE
            for (let l = 0; l < datasArray.length; l++) {
                if (parseInt(datasArray[l].x) <= dia.length) {
                    dia[parseInt(datasArray[l].x) - 1].y = datasArray[l].y;
                }
            }

            // MONTA O ARRAY DE CALENDARIO DE CADA REBOQUE QUE SERÁ PASSADO PARA O CHART
            datasets.push({ type: "line", label: reboques[i].placa.slice(0, 3), data: [...dia] });

            // RESETA O CALENDARIO
            for (let m = 0; m < dataAtual.daysInMonth(); m++) {
                dia[m] = { x: (m + 1).toString(), y: "0" };
            }
        }
    }

    // console.log('Datasets:', datasets); // NESTE PONTO OS DADOS ESTÃO CORRETOS

    let dataMock = { datasets };
    let dataJSON = JSON.stringify(dataMock);
    // console.log('Data JSON:', dataJSON); // VERIFICAR AQUI SE OS DADOS ESTÃO CORRETOS


    const reservas = await DAOReserva.getAtivas();

    res.render('admin/painel', { user: adminNome(req, res), mensagem: '', dataJSON: dataJSON, reservas: reservas, useragent: useragent });
});



// ROTAS DO CADASTRO
routerAdmin.get('/admin/cadastro', autorizacao, (req, res) => {
    res.render('admin/cadastro', {user: adminNome(req, res), mensagem: ''})
})



routerAdmin.post('/admin/cadastro/salvar', autorizacao, (req, res) => {
    let {nome, email, senha, cpf} = req.body,
        salt = bcrypt.genSaltSync(10)
    senha = bcrypt.hashSync(senha, salt)
    if(DAOAdmin.insert(nome, email, senha, cpf)){
        res.redirect('/admin/painel')
    } else {
        res.render('erro', {mensagem: "Erro ao tentar incluir usuário."})
    }
})




//ROTAS DO LOGIN
routerAdmin.get('/admin/login', (req, res) => {
    res.render('admin/login', {user: adminNome(req, res), mensagem: ""})
})




routerAdmin.post('/admin/login/salvar', (req, res) => {
    let {email, senha} = req.body
    DAOAdmin.login(email, senha).then(admin => {
        if(admin){
            if(bcrypt.compareSync(req.body.senha, admin.senha)){
                req.session.admin = {id: admin.id, nome: admin.nome, email: admin.email}
                res.redirect('/admin/painel')
            } else {
                res.render('admin/login', {mensagem: "Usuário ou senha inválidos."})
            }
        } else {
            res.render('admin/login', {mensagem: "Usuário ou senha inválidos."})
        }
    })
})




routerAdmin.get("/admin/logout", function (req, res) {
    req.session.admin = undefined
    res.redirect("/")
});


module.exports = routerAdmin