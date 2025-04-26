const axios = require('axios');
const { getAccessToken, getUrlBase } = require('./Env');


const ACCESS_TOKEN = getAccessToken()
const URL_BASE = getUrlBase()
const moment = require('moment-timezone')


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
async function notificacoesAtualizaBatch(notifications) {
    console.log("SPA - Atualizando notificações em batch do cliente...");
    // console.log("SPA - Notificações a serem atualizadas: \n",notifications);
    
    let url = `${URL_BASE}/notifications/batch`;

    let options = {
        headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            access_token: ACCESS_TOKEN
        }
    };

    // Verifica se o cliente possui email antes de ativar notificações por email
    const clientePossuiEmail = notifications.some(notification => notification.customerEmail); // Verificar se o campo de email do cliente está presente.

    // Construindo o objeto de dados com as configurações desejadas
    let data = {
        customer: notifications[0].customer, // Todos pertencem ao mesmo cliente
        notifications: notifications.map(notification => {
            if (notification.event === 'PAYMENT_RECEIVED') {
                return {
                    id: notification.id,
                    emailEnabledForProvider: true,
                    smsEnabledForProvider: true,
                    emailEnabledForCustomer: clientePossuiEmail,
                    smsEnabledForCustomer: false,
                    phoneCallEnabledForCustomer: false,
                    whatsappEnabledForCustomer: true, // Apenas aqui ativamos o WhatsApp
                    enabled: true
                };
            } else {
                return {
                    id: notification.id,
                    enabled: false // As outras notificações são desativadas
                };
            }
        })
    };

    // console.log('URL:', url);
    // console.log('Cabeçalhos:', options.headers);
    // console.log('Corpo da Requisição:', JSON.stringify(data, null, 2));

    try {
        let response = await axios.put(url, data, options);
        console.log('SPA - Notificações atualizadas com sucesso...');
        // console.log('Notificações atualizadas com sucesso:', response.data);
    } catch (err) {
        if (err.response) {
            console.error('Erro na API - Status:', err.response.status);
            console.error('Erro na API - Dados:', JSON.stringify(err.response.data, null, 2));
        } else {
            console.error('Erro:', err.message);
        }
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
        // console.log("SPA - Notificações recuperadas:\n",notificacoes.data);
        
        return notificacoes.data.data
    }catch(err){
        console.error('SPA - Erro ao recuperar notificações:\n' + err);
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
            console.log("SPA - Cliente encontrado: ",retorno.data[0].id);
            
            return retorno.data[0].id
        }else{
            console.log("SPA - Cliente NÃO encontrado!");
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
        console.log("SPA - ID criado:",response.data.id);
        return response.data;
    } catch (err) {
        console.error('error:' + err);
        throw err;
    }
}
async function criarPagamento(customerID, valor, data_vencimento, dataInicio, dataFim, placa, formaPagamento){
    console.log("SPA - Criando pagamento...");
    
    dataInicio = moment(dataInicio).format('DD/MM/YYYY')
    dataFim = moment(dataFim).format('DD/MM/YYYY')

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
        "\nData de Vencimento:----", moment(data_vencimento).format('DD/MM/YYYY'), 
        "\nInício da Reserva:-----", moment(dataInicio).format('DD/MM/YYYY'), 
        "\nFim da Reserva:--------", moment(dataFim).format('DD/MM/YYYY'), 
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
