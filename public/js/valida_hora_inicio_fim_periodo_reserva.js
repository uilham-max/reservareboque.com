document.addEventListener('DOMContentLoaded', () => {

    var inputHoraInicio = document.getElementById('horaInicio')
    var inputHoraFim = document.getElementById('horaFim')

    invalidHoraInicio = document.getElementById('invalidHoraInicio');


    var data = new Date()

    var hora = data.getHours()

    inputHoraInicio.value = hora
    inputHoraFim.value = inputHoraInicio.value

    // Hora de entrega recebe a hora de inicio
    inputHoraInicio.addEventListener('change', () => {
        inputHoraFim.value = inputHoraInicio.value
    })



    inputHoraInicio.addEventListener('change', () => {
        // Verifica se tem onze dígitos
        if (inputDataInicio.value == dataAtual && inputHoraInicio.value < hora) {
            inputHoraInicio.classList.add('is-invalid')
            inputHoraInicio.setCustomValidity('mensagem')
            invalidHoraInicio.textContent = `A partir das ${hora}:00hs`;
            return;
        } else {
            inputHoraInicio.classList.remove('is-invalid')
            inputHoraInicio.setCustomValidity('')
            invalidHoraInicio.textContent = '';
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

