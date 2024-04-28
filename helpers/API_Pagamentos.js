const axios = require('axios');

const ACCESS_TOKEN = process.env.ACCESS_TOKEN
const URL_BASE = process.env.URL_BASE


async function listar_clientes(filtro_cpfCnpj) {
    if (filtro_cpfCnpj) {
        let url = URL_BASE + '/customers?cpfCnpj='+filtro_cpfCnpj;
        let options = {
            headers: {
                accept: 'application/json',
                access_token: ACCESS_TOKEN
            }
        };

        try {
            let response = await axios.get(url, options);
            return response.data;
        } catch (err) {
            console.error('error:' + err);
            throw err;
        }
        
    } else { // QUANDO NÃO É PASSADO NENHUM CPF OU CNPJ ENTRA NESSE ELSE
        let url = URL_BASE + '/customers';
        let options = {
            headers: {
                accept: 'application/json',
                access_token: ACCESS_TOKEN
            }
        };

        try {
            let response = await axios.get(url, options);
            return response.data;
        } catch (err) {
            console.error('error:' + err);
            throw err;
        }
    }
}

//Funcao verifica cliente recebe um cpf ou cnpj e retorna true ou false
async function verificaCadastro(cpfCnpj) {
    try{
        let retorno = await listar_clientes(cpfCnpj);
        if (retorno.totalCount == 1){
            return retorno.data[0].id
        }else{
            return false;
        }
    }catch (e){
        console.error('error:' + err);
        throw err;
    }
}

async function cadastrarCliente(cpfCnpj, nome){
    let url = URL_BASE + '/customers';
    let options = {
        headers: {
            accept: 'application/json',
            access_token: ACCESS_TOKEN
        }
    };
    let newCliente = {
        "name": nome,
        "cpfCnpj": cpfCnpj
    }

    try {
        let response = await axios.post(url, newCliente, options);
        console.log("id do cliente criado:",response.data.id);
        return response.data;
    } catch (err) {
        console.error('error:' + err);
        throw err;
    }
}

async function criarPagamento(customerID, valor, data_vencimento){
    let url = URL_BASE + '/payments';
    let options = {
        headers: {
            accept: 'application/json',
            access_token: ACCESS_TOKEN
        }
    };
    let newCobranca = {
        "customer": customerID,
        "billingType": 'PIX',
        "value": valor,
        "dueDate": data_vencimento,
        "callback": {
            successUrl: 'https://reboquesoliveira.com',
            autoRedirect: true
        }
    }

    try {
        let response = await axios.post(url, newCobranca, options);
        return response.data;
    } catch (err) {
        console.error('error:' + err);
        throw err;
    }

}

async function gerarQRCode(id_cobranca){
    let url = URL_BASE + '/payments/' + id_cobranca + '/pixQrCode';
    let options = {
        headers: {
                accept: 'application/json',
                access_token: ACCESS_TOKEN
            }
        };

        try {
            let response = await axios.get(url, options);
            return response.data;
        } catch (err) {
            console.error('error:' + err);
            throw err;
        }
}


async function criarCobrancaPIX(cpfCnpj, nome, valor, data_vencimento){
    let customerID;
    let retornoPag;

    try{
        customerID = await verificaCadastro(cpfCnpj)
        if(customerID == false){
            console.log("criar cliente >>> nome:",nome,"cpf:",cpfCnpj);
            let retornoCad = await cadastrarCliente(cpfCnpj, nome);
            console.log(retornoCad.id);
            customerID = retornoCad.id;
        }
        retornoPag = await criarPagamento(customerID, valor, data_vencimento);
        retornoQR = await gerarQRCode(retornoPag.id);
        return {
            "id_cobranca": retornoPag.id, // "pay_080225913252"
            "custumer": customerID, // "cus_G7Dvo4iphUNk"
            "encodedImage": retornoQR.encodedImage,
            "PIXCopiaECola": retornoQR.payload,
            "expirationDate": retornoQR.expirationDate,
            "netValue": retornoPag.netValue,
            "dateCreated": retornoPag.dateCreated,
            "billingType": retornoPag.billingType, // "PIX"
            "invoiceUrl": retornoPag.invoiceUrl, // URL de redirecionamento de pagamento do Assas
        }
    }catch(err){
        console.error(err);
        throw err;
    }
} 

module.exports = {listar_clientes, verificaCadastro, cadastrarCliente, criarCobrancaPIX, criarPagamento, gerarQRCode};
