document.addEventListener('DOMContentLoaded', () => {

    inputSenha = document.getElementById('senha')
    inputSenhaRepita = document.getElementById('senhaRepita')

    invalidSenha = document.getElementById('invalidSenha')
    invalidSenhaRepita = document.getElementById('invalidSenhaRepita')

    // VALIDA SENHA
    inputSenha.addEventListener('blur', () => {
        if (inputSenha.value.length < 8 || inputSenha.value.length > 200) {
            inputSenha.classList.add('is-invalid')
            inputSenha.setCustomValidity('mensagem')
            invalidSenha.textContent = 'Deve ter entre 8 e 200 dígitos.';
            return;
        } else {
            inputSenha.classList.remove('is-invalid')
            inputSenha.setCustomValidity('')
            invalidSenha.textContent = '';
        }
    });


    // VALIDA SENHA REPETIDA
    inputSenhaRepita.addEventListener('blur', () => {
        if (inputSenha.value !== inputSenhaRepita.value) {
            inputSenhaRepita.classList.add('is-invalid')
            inputSenhaRepita.setCustomValidity('mensagem')
            invalidSenhaRepita.textContent = 'Senhas diferentes.';
            return
        } else {
            inputSenhaRepita.classList.remove('is-invalid')
            inputSenhaRepita.setCustomValidity('')
            invalidSenhaRepita.textContent = '';
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
