document.addEventListener('DOMContentLoaded', ()=>{
    const input_id_cobranca = document.getElementById('id_cobranca')
    const enviarRequisicao = async () => {
        try {
            console.log(document.getElementById('formaPagamento').value);
            const resposta = await fetch(`https://7bfb-179-105-28-196.ngrok-free.app/pagamento/aprovado/${input_id_cobranca.value}`);
            // const resposta = await fetch(`https://www.reboquesoliveira.com/pagamento/aprovado/${input_id_cobranca.value}`);
            const resultado = await resposta.json();
            if (resultado.aprovado) {
                window.location.href = `/cliente/reserva/realizado/${document.getElementById('formaPagamento').value}`;
            }
        } catch (erro) {
            console.error('Erro ao enviar requisição:', erro);
        }
    };
    setInterval(enviarRequisicao, 2000);
})