const axios = require('axios');
const { getAccessToken, getUrlBase } = require('./Env');


const ACCESS_TOKEN = getAccessToken()
const URL_BASE = getUrlBase()


async function estornoPagamento(codigoPagamento, valor){
    console.log("SPA - Estornando pagamento do cliente...");
    let url = `${URL_BASE}/payments/${codigoPagamento}/refund`
    let options = {
        headers: {
            accept: 'application/json',
            access_token: ACCESS_TOKEN
        }
    }
    let data = {
        value: valor
    }
    try {
        let retorno = await axios.post(url, data, options)
        console.log(retorno);
        // return retorno
    } catch(err){
        // console.error(err.toString());
        // return undefined
    }
}
async function deleteCobranca(codigoPagamento){
    console.log("SPA - Deletando cobrança...");
    let url = `${URL_BASE}/payments/${codigoPagamento}`
    let options = {
        headers: {
            accept: 'application/json',
            access_token: ACCESS_TOKEN
        }
    }
    try{
        let resposta = await axios.delete(url, options)
        console.log(`${codigoPagamento} --> Pagamento removido do Sistema de Pagamentos!`);
    } catch (err){
        console.error(err.toString());
        throw err
    }
}
async function receiveInCash(idCobranca, value, paymentDate){
    console.log("SPA - Recebendo em dinheiro do cliente...");
    let url = `${URL_BASE}/payments/${idCobranca}/receiveInCash`
    
    let options = {
        headers: {
            accept: 'application/json',
            access_token: ACCESS_TOKEN
        }
    }

    let data = {
        paymentDate: paymentDate,
        value: value
    }
    
    try{
        let response = await axios.post(url, data, options)
        console.log("Efetuado pagamento em dinheiro!");
        return response
    } catch(err){
        console.error(err.toString());
        return undefined
    }
}
async function notificacoesAtualizaBatch(notifications){
    console.log("SPA - Atualizando notificações em batch do cliente...");
    let url = `${URL_BASE}/notifications/batch`
    
    let options = {
        headers: {
            accept: 'application/json',
            access_token: ACCESS_TOKEN
        }
    }
    
    // HABILITA SOMENTE O RECEBIMENTO DE EMAIL E WHATSAPP QUANDO O PAGAMENTO É RECEBIDO
    let data = {
        customer: notifications[0].customer, // Verifique se o ID do cliente está correto
        notifications: [
            {
                id: notifications[0].id, // Verifique se os IDs das notificações estão corretos
                emailEnabledForProvider: true,
                smsEnabledForProvider: false,
                emailEnabledForCustomer: true,
                smsEnabledForCustomer: true,
                phoneCallEnabledForCustomer: false,
                whatsappEnabledForCustomer: true,
                enabled: true
            },
            { id: notifications[1].id, enabled: false },
            { id: notifications[2].id, enabled: false },
            { id: notifications[3].id, enabled: false },
            { id: notifications[4].id, enabled: false },
            { id: notifications[5].id, enabled: false },
            { id: notifications[6].id, enabled: false },
            { id: notifications[7].id, enabled: false }
        ]
    };

    try{
        let response = await axios.put(url, data, options)
        console.log(`habilitar cliente a receber notificações por WhatsApp...`);
    }catch(err){
        console.error('error:' + err);
        throw err;
    }
}
async function recuperaNotificacao(customerID){
    console.log("SPA - Recuperando notificações do cliente...");
    let url = `${URL_BASE}/customers/${customerID}/notifications` 
    let options = {
        headers: {
            accept: 'application/json',
            access_token: ACCESS_TOKEN
        }
    }
    try{
        let notificacoes = await axios.get(url, options)
        return notificacoes.data.data
    }catch(err){
        console.error('error:' + err);
        throw err;
    }
}
async function listar_clientes(filtro_cpfCnpj, nome) {
    console.log("SPA - Listando clientes...");
    if (filtro_cpfCnpj) {
        let url = URL_BASE + '/customers?cpfCnpj=' + filtro_cpfCnpj;
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
async function verificaCadastro(cpfCnpj, nome) {
    console.log("SPA - Verificando cadastro do cliente...");
    try{
        let retorno = await listar_clientes(cpfCnpj, nome);
        if (retorno.totalCount == 1){
            return retorno.data[0].id
        }else{
            return false;
        }
    }catch (err){
        console.error('error:' + err);
        throw err;
    }
}
async function cadastrarCliente(cpfCnpj, nome, telefone, email){
    console.log("SPA - Cadastrando cliente...");
    let url = URL_BASE + '/customers';
    
    let options = {
        headers: {
            accept: 'application/json',
            access_token: ACCESS_TOKEN
        }
    };
    let data = {
        "name": nome,
        "cpfCnpj": cpfCnpj,
        "mobilePhone": telefone,
        "email": email,
    }

    try {
        let response = await axios.post(url, data, options);
        console.log("id do cliente criado:",response.data.id);
        return response.data;
    } catch (err) {
        console.error('error:' + err);
        throw err;
    }
}
async function criarPagamento(customerID, valor, data_vencimento, dataInicio, dataFim, placa, formaPagamento){
    console.log("SPA - Criando pagamento...");
    
    dataInicio = dataInicio.toString().slice(8,10)+'/'+dataInicio.toString().slice(5,7)+'/'+dataInicio.toString().slice(0,4)
    dataFim = dataFim.toString().slice(8,10)+'/'+dataFim.toString().slice(5,7)+'/'+dataFim.toString().slice(0,4)
    
    if(formaPagamento != 'PIX'){
        formaPagamento = 'UNDEFINED'
    }

    let url = URL_BASE + '/payments';
    let options = {
        headers: {
            accept: 'application/json',
            access_token: ACCESS_TOKEN
        }
    }; 

    let newCobranca = {
        "customer": customerID,
        "billingType": formaPagamento,
        "value": valor,
        "description": `Reserva de reboque com início de placa ${placa.slice(0,3)} do dia ${dataInicio} até o dia ${dataFim}`,
        "dueDate": data_vencimento,
        // "callback": {successUrl: 'https://reboquesoliveira.com',autoRedirect: true}
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
    console.log("SPA - Gerando QR Code...");

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
async function criarCobranca(cpfCnpj, nome, telefone, email, valor, data_vencimento, dataInicio, dataFim, placa, formaPagamento){
    console.log("SPA - Iniciando Sistema de Pagamentos Automático (SPA)...");
    
    console.log(
        "\nCriando cobrança...", 
        "\nCPF:-------------------", cpfCnpj, 
        "\nNome:------------------", nome, 
        "\nTelefone:--------------", telefone, 
        "\nEmail:-----------------", email, 
        "\nValor:-----------------", valor, 
        "\nData de Vencimento:----", data_vencimento, 
        "\nInício da Reserva:-----", dataInicio, 
        "\nFim da Reserva:--------", dataFim, 
        "\nPlaca do Reboque:------", placa, 
        "\nForma de Pagamento:----", formaPagamento, 
        "\n"
    
    );
    
    let customerID;
    let retornoPag;
    
    let retornoQR = {
        "encodedImage": '',
        "PIXCopiaECola": '',
        "expirationDate": '',
    }

    try{
        customerID = await verificaCadastro(cpfCnpj, nome)

        if(customerID == false){
            console.log("criar cliente >>> nome:",nome,"cpf:",cpfCnpj);
            let retornoCad = await cadastrarCliente(cpfCnpj, nome, telefone, email);
            let notifications = await recuperaNotificacao(retornoCad.id)
            await notificacoesAtualizaBatch(notifications)
            customerID = retornoCad.id;
        }

        retornoPag = await criarPagamento(customerID, valor, data_vencimento, dataInicio, dataFim, placa, formaPagamento);

        if(retornoPag.billingType == 'UNDEFINED'){
            retornoPag.billingType = 'DINHEIRO'
        }

        if(formaPagamento == 'PIX'){
            retornoQR = await gerarQRCode(retornoPag.id);
        }

        return {
            "id_cobranca": retornoPag.id, // "pay_080225913252"
            "custumer": customerID, // "cus_G7Dvo4iphUNk"
            "encodedImage": retornoQR.encodedImage,
            "PIXCopiaECola": retornoQR.payload,
            "expirationDate": retornoQR.expirationDate,
            "netValue": retornoPag.netValue,
            "dateCreated": retornoPag.dateCreated,
            "billingType": retornoPag.billingType,
            "invoiceUrl": retornoPag.invoiceUrl, // URL de redirecionamento de pagamento do Assas
        }

    }catch(err){
        console.error(err);
        throw err;
    }
} 


module.exports = {
    verificaCadastro, 
    listar_clientes, 
    cadastrarCliente, 
    recuperaNotificacao,
    notificacoesAtualizaBatch,
    criarCobranca, 
    gerarQRCode, 
    criarPagamento, 
    receiveInCash,
    deleteCobranca,
    estornoPagamento,
};
