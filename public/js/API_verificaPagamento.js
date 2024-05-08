document.addEventListener('DOMContentLoaded', ()=>{
    const input_id_cobranca = document.getElementById('id_cobranca')
    const enviarRequisicao = async () => {
        try {
            const resposta = await fetch(`https://febf-2804-14c-5582-963d-00-1007.ngrok-free.app/pagamento/aprovado/${input_id_cobranca.value}`);
            // const resposta = await fetch(`https://www.reboquesoliveira.com/pagamento/aprovado/${input_id_cobranca.value}`);
            const resultado = await resposta.json();
            if (resultado.aprovado) {
                window.location.href = '/pagamento/realizado';
            }
        } catch (erro) {
            console.error('Erro ao enviar requisição:', erro);
        }
    };
    setInterval(enviarRequisicao, 2000);
})