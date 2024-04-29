document.addEventListener('DOMContentLoaded', () => {
    const input_id_cobranca = document.getElementById('id_cobranca');
   
    addEventListener('onLoad', async () => {
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            if (!response.ok) {
                throw new Error('Erro ao consultar o CEP.');
            }
            const data = await response.json();
            if(data.erro == true){
                throw new Error('CEP inválido.');
            }
            // console.log("Erro na resposta: "+data.erro);
            inputCidade.value = data.localidade;
            inputUf.value = data.uf;
            inputLogradouro.value = data.logradouro;
            inputBairro.value = data.bairro;
        } catch (error) {
            console.error(error);
            alert('Ocorreu um erro ao consultar o CEP.');
        }
    });
});