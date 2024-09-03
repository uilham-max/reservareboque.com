document.addEventListener('DOMContentLoaded', () => {
    const inputCpf = document.getElementById('cpf')
    const inputNome = document.getElementById('nome')
    const inputEmail = document.getElementById('email')
    const inputTelefone = document.getElementById('telefone')
    const inputDataNascimento = document.getElementById('dataNascimento')
    const inputCep = document.getElementById('cep')
    const inputLogradouro = document.getElementById('logradouro')
    const inputComplemento = document.getElementById('complemento')
    const inputBairro = document.getElementById('bairro')
    const inputLocalidade = document.getElementById('localidade')
    const inputUf = document.getElementById('uf')
    const inputNumeroDaCasa = document.getElementById('numeroDaCasa')

    inputCpf.addEventListener('blur', async () => {
        const cpf = inputCpf.value.replace(/\D/g, ''); // Remove caracteres não numéricos do CPF
        if (cpf.length < 11) {
            alert('CPF inválido. Informe um CPF válido com 11 dígitos.');
            return;
        } 
        const response = await fetch(`/cliente/existe/${cpf}`);
        if (!response.ok) {
            throw new Error('Erro ao consultar o CPF.');
        }
        const cliente = await response.json();
        /**
        * Se o Cliente já for cadastrado, ou seja, ele já definiu os dados de login e senha, então ele não terá 
        * os campos preenchidos automaticamento 
        */
        if(!cliente.cadastrado){
            inputEmail.value = cliente.email;
            inputNome.value = cliente.nome;
            inputTelefone.value = cliente.telefone;
            inputDataNascimento.value = cliente.data_nascimento;
            inputCep.value = cliente.cep;
            inputLogradouro.value = cliente.logradouro;
            inputComplemento.value = cliente.complemento;
            inputBairro.value = cliente.bairro;
            inputLocalidade.value = cliente.localidade;
            inputUf.value = cliente.uf;
            inputNumeroDaCasa.value = cliente.numero_da_casa;
        }
    });
})