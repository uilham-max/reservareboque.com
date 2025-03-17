document.addEventListener('DOMContentLoaded', () => {

    var inputHoraInicio = document.getElementById('horaInicio')
    var inputHoraFim = document.getElementById('horaFim')
    var inputDataInicio = document.getElementById('dataInicio')
    var inputDataFim = document.getElementById('dataFim')

    invalidHoraInicio = document.getElementById('invalidHoraInicio');
    invalidHoraFim = document.getElementById('invalidHoraFim');

    var dataAtual = new Date()
    var horaAtual = dataAtual.getHours()

    // Hora de entrega recebe a horaAtual de inicio
    inputHoraInicio.value = horaAtual
    inputHoraFim.value = inputHoraInicio.value


    // Hora inicio
    inputHoraInicio.addEventListener('change', () => {
        if(inputDataInicio.value == inputDataFim.value && Number(inputHoraInicio.value) > Number(inputHoraFim.value)){
            inputHoraInicio.classList.add('is-invalid')
            inputHoraInicio.setCustomValidity('mensagem')
            invalidHoraInicio.textContent = `Hora inválida! 0102`;
        } else {
            inputHoraInicio.classList.remove('is-invalid')
            inputHoraInicio.setCustomValidity('')
            invalidHoraInicio.textContent = '';
        }
    })

    // Hora fim
    inputHoraFim.addEventListener('change', () => {
        if(inputDataInicio.value == inputDataFim.value && Number(inputHoraInicio.value) > Number(inputHoraFim.value)){
            inputHoraFim.classList.add('is-invalid')
            inputHoraFim.setCustomValidity('mensagem')
            invalidHoraFim.textContent = `Hora inválida! 0103`;
        } else {
            inputHoraFim.classList.remove('is-invalid')
            inputHoraFim.setCustomValidity('')
            invalidHoraFim.textContent = '';
        }
    })


    // Hora inicio
    inputHoraInicio.addEventListener('blur', () => {
        if(inputDataInicio.value == inputDataFim.value && Number(inputHoraInicio.value) > Number(inputHoraFim.value)){
            inputHoraInicio.classList.add('is-invalid')
            inputHoraInicio.setCustomValidity('mensagem')
            invalidHoraInicio.textContent = `Hora inválida! 0102`;
        } else {
            inputHoraInicio.classList.remove('is-invalid')
            inputHoraInicio.setCustomValidity('')
            invalidHoraInicio.textContent = '';
        }
    })

    // Hora fim
    inputHoraFim.addEventListener('blur', () => {
        if(inputDataInicio.value == inputDataFim.value && Number(inputHoraInicio.value) > Number(inputHoraFim.value)){
            inputHoraFim.classList.add('is-invalid')
            inputHoraFim.setCustomValidity('mensagem')
            invalidHoraFim.textContent = `Hora inválida! 0103`;
        } else {
            inputHoraFim.classList.remove('is-invalid')
            inputHoraFim.setCustomValidity('')
            invalidHoraFim.textContent = '';
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

