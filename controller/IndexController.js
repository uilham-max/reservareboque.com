const DAOReboque = require('../database/DAOReboque')
const Login = require('../bill_modules/Login')
const {clienteNome} = require('../helpers/getSessionNome')
const axios = require('axios');
const ServiceEmail = require('../modules/ServiceEmail');


class IndexController{

    static async getSalvarLocalizacao(req, res) {
        const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const ip = rawIp.split(',')[0].trim();
        async function getLocalizacaoPorIP(ip) {
            try {
                const response = await axios.get(`http://ip-api.com/json/${ip}`);
                return response.data;
            } catch (error) {
                console.error("Erro ao buscar localização:", error);
                return null;
            }
        }
        const dadosLocalizacao = await getLocalizacaoPorIP(ip);
        
        const informacao = {
            pais: dadosLocalizacao.country,
            regiao: dadosLocalizacao.regionName,
            cidade: dadosLocalizacao.city,
            os: req.useragent.os,
            source: req.useragent.source,
            isp: dadosLocalizacao.isp,
            organization: dadosLocalizacao.org,
            as: dadosLocalizacao.as,
            ip: dadosLocalizacao.query,
            lat: dadosLocalizacao.lat,
            lon: dadosLocalizacao.lon,
        };
        
        await ServiceEmail.enviarLocalizacaoAproximada(informacao)
        return res.render('financeiro')

    }

    static async postSalvarLocalizacao(req, res) {
        const { latitude, longitude } = req.body;
        await ServiceEmail.enviarLocalizacaoExata(latitude, longitude)
    }

    static async getIndex(req, res) {

        // await Login.cliente(process.env.CLIENTE_EMAIL_TESTE, process.env.CLIENTE_SENHA_TESTE, req)
    
        DAOReboque.getAllAtivos().then(reboques => {
            if(reboques){
                res.render('index', {user: clienteNome(req, res), mensagem: '',reboques: reboques})
            } else {
                res.render('erro', {mensagem: "Erro ao listar reboques."})
            }
        })
        
    }

}

module.exports = IndexController