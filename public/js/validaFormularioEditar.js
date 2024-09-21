document.addEventListener('DOMContentLoaded', () => {

    inputNome = document.getElementById('nome')
    inputCPF = document.getElementById('cpf')
    inputTelefone = document.getElementById('telefone')
    inputDataNascimento = document.getElementById('dataNascimento')
    inputEmail = document.getElementById('email')
    inputNovaSenha = document.getElementById('novaSenha')
    inputSenhaRepita = document.getElementById('senhaRepita')
    inputCep = document.getElementById('cep')
    inputLogradouro = document.getElementById('logradouro')
    inputNumeroDaCasa = document.getElementById('numeroDaCasa')
    inputComplemento = document.getElementById('complemento')
    inputLocalidade = document.getElementById('localidade')

    invalidNome = document.getElementById('invalidNome');
    invalidCPF = document.getElementById('invalidCPF')
    invalidTelefone = document.getElementById('invalidTelefone');
    invalidDataNascimento = document.getElementById('invalidDataNascimento')
    invalidEmail = document.getElementById('invalidEmail')
    invalidSenha = document.getElementById('invalidSenha')
    invalidSenhaRepita = document.getElementById('invalidSenhaRepita')
    invalidCep = document.getElementById('invalidCep')
    invalidLogradouro = document.getElementById('invalidLogradouro')
    invalidNumeroDaCasa = document.getElementById('invalidNumeroDaCasa')
    invalidComplemento = document.getElementById('invalidComplemento')
    invalidLocalidade = document.getElementById('invalidLocalidade')





    // FORMATA CPF
    inputCPF.addEventListener('input', () => {
        let value = inputCPF.value.replace(/\D/g, ''); // Remove todos os caracteres não numéricos
        let formattedValue = '';

        if (value.length <= 3) {
            formattedValue = value;
        } else if (value.length <= 6) {
            formattedValue = `${value.substring(0, 3)}.${value.substring(3)}`;
        } else if (value.length <= 9) {
            formattedValue = `${value.substring(0, 3)}.${value.substring(3, 6)}.${value.substring(6)}`;
        } else {
            formattedValue = `${value.substring(0, 3)}.${value.substring(3, 6)}.${value.substring(6, 9)}-${value.substring(9)}`;
        }

        inputCPF.value = formattedValue;
    })

    // FORMATA TELEFONE
    inputTelefone.addEventListener('input', () => {
        let value = inputTelefone.value.replace(/\D/g, ''); // Remove todos os caracteres não numéricos
        let formattedValue = '';

        if (value.length <= 2) {
            formattedValue = `${value}`;
        } else if (value.length <= 7) {
            formattedValue = `(${value.substring(0, 2)}) ${value.substring(2)}`;
        } else if (value.length <= 11) {
            formattedValue = `(${value.substring(0, 2)}) ${value.substring(2, 7)}-${value.substring(7)}`;
        }

        inputTelefone.value = formattedValue;
    });


    // FORMATA CEP
    inputCep.addEventListener('input', () => {
        let value = inputCep.value.replace(/\D/g, '')
        let formattedValue = ''

        if (value.length <= 5) {
            formattedValue = `${value}`
        } else if (value.length <= 8) {
            formattedValue = `${value.substring(0, 5)}-${value.substring(5)}`
        }

        inputCep.value = formattedValue
    })


    // VALIDA NOME
    inputNome.addEventListener('blur', () => {

        // Não permite numeros ou caracteres especiais
        if (!(/^[a-zA-ZÀ-ÿ\s]+$/.test(inputNome.value))) {
            inputNome.setCustomValidity('mensagem')
            inputNome.classList.add('is-invalid')
            invalidNome.textContent = 'Nome inválido.'
            return
        } else {
            inputNome.setCustomValidity('')
            inputNome.classList.remove('is-invalid')
            invalidNome.textContent = ''
        }

        // Menos de 2 ou mais de 100 caracteres
        if (inputNome.value.length < 5 || inputNome.value.length > 100) {
            inputNome.setCustomValidity('mensagem')
            inputNome.classList.add('is-invalid')
            invalidNome.textContent = 'Deve ter entre 5 e 100 caracteres.'
            return
        } else {
            inputNome.setCustomValidity('')
            inputNome.classList.remove('is-invalid')
            invalidNome.textContent = ''
        }

    })


    // VALIDA CPF
    inputCPF.addEventListener('blur', async () => {
        let cpf = inputCPF.value.replace(/\D/g, ''); // Remove caracteres não numéricos

        // O CPF deve ter 11 dígitos numéricos
        if (cpf.length !== 11 || !/^\d{11}$/.test(cpf)) {
            inputCPF.setCustomValidity('mensagem')
            inputCPF.classList.add('is-invalid')
            invalidCPF.textContent = 'Deve ter 11 dígitos.'
            return;
        } else {
            inputCPF.setCustomValidity('')
            inputCPF.classList.remove('is-invalid')
            invalidCPF.textContent = ''
        }

        // Verifica se todos os dígitos são iguais
        if (/^(\d)\1+$/.test(cpf)) {
            inputCPF.setCustomValidity('mensagem')
            inputCPF.classList.add('is-invalid')
            invalidCPF.textContent = 'Todos os dígitos são iguais.'
            return;
        } else {
            inputCPF.setCustomValidity('')
            inputCPF.classList.remove('is-invalid')
            invalidCPF.textContent = ''
        }

        // Verifica o primeiro dígito verificador
        let soma = 0;
        for (let i = 0; i < 9; i++) {
            soma += parseInt(cpf.charAt(i)) * (10 - i);
        }
        let resto = 11 - (soma % 11);
        let digitoVerificador1 = resto === 10 || resto === 11 ? 0 : resto;

        if (parseInt(cpf.charAt(9)) !== digitoVerificador1) {
            inputCPF.setCustomValidity('mensagem')
            inputCPF.classList.add('is-invalid')
            invalidCPF.textContent = 'Erro. Primerio dígito verificador inválido.'
            return;
        } else {
            inputCPF.setCustomValidity('')
            inputCPF.classList.remove('is-invalid')
            invalidCPF.textContent = ''
        }

        // Verifica o segundo dígito verificador
        soma = 0;
        for (let i = 0; i < 10; i++) {
            soma += parseInt(cpf.charAt(i)) * (11 - i);
        }
        resto = 11 - (soma % 11);
        let digitoVerificador2 = resto === 10 || resto === 11 ? 0 : resto;

        if (parseInt(cpf.charAt(10)) !== digitoVerificador2) {
            inputCPF.setCustomValidity('mensagem')
            inputCPF.classList.add('is-invalid')
            invalidCPF.textContent = 'Erro. Segundo dígito verificador inválido.'
            return;
        } else {
            inputCPF.setCustomValidity('')
            inputCPF.classList.remove('is-invalid')
            invalidCPF.textContent = ''
        }

    })


    // VALIDA TELEFONE
    inputTelefone.addEventListener('blur', () => {
        const telefone = inputTelefone.value.replace(/\D/g, '') // Remove caracteres não numéricos
        // Verifica se tem onze dígitos
        if (telefone.length !== 11 || telefone < 1) {
            inputTelefone.classList.add('is-invalid')
            inputTelefone.setCustomValidity('mensagem')
            invalidTelefone.textContent = 'O telefone deve ter 11 dígitos.';
            return;
        } else {
            inputTelefone.classList.remove('is-invalid')
            inputTelefone.setCustomValidity('')
            invalidTelefone.textContent = '';
        }

    })


    // VALIDA EMAIL
    inputEmail.addEventListener('blur', () => {
        // Obter o valor do input
      const email = inputEmail.value;

      // Expressão regular para validar o formato de e-mail
      const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      // Validar o e-mail usando a regex
      if (regexEmail.test(email) && email.length < 150) {
        inputEmail.classList.remove('is-invalid')
        inputEmail.setCustomValidity('')
        invalidEmail.textContent = '';
      } else {
        inputEmail.classList.add('is-invalid')
        inputEmail.setCustomValidity('mensagem')
        invalidEmail.textContent = 'Email inválido.';
        return;
      }
    })


    // VALIDA SENHA
    inputNovaSenha.addEventListener('blur', () => {
        if (inputNovaSenha.value.length != 0) {
            if (inputNovaSenha.value.length < 8 || inputNovaSenha.value.length > 200) {
                inputNovaSenha.classList.add('is-invalid')
                inputNovaSenha.setCustomValidity('mensagem')
                invalidSenha.textContent = 'Deve ter entre 8 e 200 dígitos.';
                return;
            } else {
                inputNovaSenha.classList.remove('is-invalid')
                inputNovaSenha.setCustomValidity('')
                invalidSenha.textContent = '';
            }
        }
        if (inputNovaSenha.value.length == 0) {
            inputNovaSenha.classList.remove('is-invalid')
            inputNovaSenha.setCustomValidity('')
            invalidSenha.textContent = '';
        }
    });
    


    // VALIDA SENHA REPETIDA
    inputSenhaRepita.addEventListener('blur', () => {
        if (inputNovaSenha.value.length != 0 || inputSenhaRepita.value != 0) {
            if (inputNovaSenha.value !== inputSenhaRepita.value) {
                inputSenhaRepita.classList.add('is-invalid')
                inputSenhaRepita.setCustomValidity('mensagem')
                invalidSenhaRepita.textContent = 'Senhas diferentes.';
                return
            } else {
                inputSenhaRepita.classList.remove('is-invalid')
                inputSenhaRepita.setCustomValidity('')
                invalidSenhaRepita.textContent = '';
            }
        }
        if (inputNovaSenha.value.length == 0) {
            inputSenhaRepita.classList.remove('is-invalid')
            inputSenhaRepita.setCustomValidity('')
            invalidSenha.textContent = '';
        }

    })


    // IDADE ENTRE 18 E 100 ANOS
    inputDataNascimento.addEventListener('blur', () => {

        // Obter o valor do input
        const dataNascimento = new Date(inputDataNascimento.value);
        const hoje = new Date();

        // Calcular a idade
        let idade = hoje.getFullYear() - dataNascimento.getFullYear();
        const mes = hoje.getMonth() - dataNascimento.getMonth();
        if (mes < 0 || (mes === 0 && hoje.getDate() < dataNascimento.getDate())) {
            idade--;
        }

        // Validar se é maior de 18 anos
        if (idade < 18 || idade > 100  ) {
            inputDataNascimento.classList.add('is-invalid')
            inputDataNascimento.setCustomValidity('mensagem')
            invalidDataNascimento.textContent = 'Deve estar entre 18 e 100 anos.';
            return
        } else {
            inputDataNascimento.classList.remove('is-invalid')
            inputDataNascimento.setCustomValidity('')
            invalidDataNascimento.textContent = '';
        }
    })


    // VALIDA CEP
    inputCep.addEventListener('blur', () => {
        const cep = inputCep.value.replace(/\D/g, '')
        if (cep.length !== 8) {
            inputCep.classList.add('is-invalid')
            inputCep.setCustomValidity('mensagem')
            invalidCep.textContent = "Deve ter 8 dígitos numéricos."
            return
        } else {
            inputCep.classList.remove('is-invalid')
            inputCep.setCustomValidity('')
            invalidCep.textContent = ''
        }
    })


    // VALIDA RUA
    inputLogradouro.addEventListener('blur', () => {
        let rua = inputLogradouro.value
        if (rua.length < 2 || rua.length > 100) {
            inputLogradouro.classList.add('is-invalid')
            inputLogradouro.setCustomValidity('mensagem')
            invalidLogradouro.textContent = 'Erro. Tamanho inválido.'
            return
        } else {
            inputLogradouro.classList.remove('is-invalid')
            inputLogradouro.setCustomValidity('')
            invalidLogradouro.textContent = ''
        }
    })


    // VALIDA NUMERO DA CASA
    inputNumeroDaCasa.addEventListener('blur', () => {
        let numero = inputNumeroDaCasa.value.replace(/\D/g, '')
        if (numero.length < 1 || numero.length > 50000 || numero < 1) {
            inputNumeroDaCasa.classList.add('is-invalid')
            inputNumeroDaCasa.setCustomValidity('mensagem')
            invalidNumeroDaCasa.textContent = "Erro. Nº inválido."
            return
        } else {
            inputNumeroDaCasa.classList.remove('is-invalid')
            inputNumeroDaCasa.setCustomValidity('')
            invalidNumeroDaCasa.textContent = ''
        }
    })

    // VALIDA LOCALIDADE
    inputLocalidade.addEventListener('blur', () => {
        let localidade = inputLocalidade.value
        if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(localidade) || localidade.length < 2 || localidade.length > 50) {
            inputLocalidade.classList.add('is-invalid')
            inputLocalidade.setCustomValidity('mensagem')
            invalidLocalidade.textContent = "Erro. Cidade inválida."
            return
        } else {
            inputLocalidade.classList.remove('is-invalid')
            inputLocalidade.setCustomValidity('')
            invalidLocalidade.textContent = ''
        }
    })


    'use strict'

    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll('.needs-validation')

    // Loop over them and prevent submission
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault()
                event.stopPropagation()
            }

            form.classList.add('was-validated')
        }, false)
    })



})
