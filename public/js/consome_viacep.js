document.addEventListener('DOMContentLoaded', () => {
    const inputCep = document.getElementById('cep');
    const inputCidade = document.getElementById('localidade');
    const inputUf = document.getElementById('uf');
    const inputLogradouro = document.getElementById('logradouro');
    const inputBairro = document.getElementById('bairro');

    inputCep.addEventListener('blur', async () => {
        const cep = inputCep.value.replace(/\D/g, ''); // Remove caracteres não numéricos do CEP
        if (cep.length !== 8) {
            alert('CEP inválido. Informe um CEP válido com 8 dígitos.');
            return;
        } 

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
