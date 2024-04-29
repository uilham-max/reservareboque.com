const input_id_cobranca = document.getElementById('id_cobranca')
const enviarRequisicao = async () => {
    try {
        const resposta = await fetch(`https://www.reboquesoliveira.com/pagamento/aprovado/${input_id_cobranca.value}`);
        const resultado = await resposta.json();
        if (resultado.aprovado) {
            window.location.href = '/pagamento/realizado';
        }
    } catch (erro) {
        console.error('Erro ao enviar requisição:', erro);
    }
};
setInterval(enviarRequisicao, 2000);