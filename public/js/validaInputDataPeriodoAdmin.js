document.addEventListener('DOMContentLoaded', () => {

    var inputDataInicio = document.getElementById('dataInicio')
    var inputDataFim = document.getElementById('dataFim')
    var inputHoraInicio = document.getElementById('horaInicio')
    var inputHoraFim = document.getElementById('horaFim')
    var dataInicioAntiga = document.getElementById('dataInicioAntiga')
    var dataFimAntiga = document.getElementById('dataFimAntiga')
    var valor = document.getElementById('valor')
    invalidHoraInicio = document.getElementById('invalidHoraInicio');

    function obterHora(date) {
        return String(date.getHours()).padStart(2, '0');
    }
    function formatarData(date) {
        if (!(date instanceof Date) || isNaN(date)) {
            throw new Error("Parâmetro inválido: deve ser um objeto Date válido.");
        }

        const ano = date.getFullYear();
        const mes = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() retorna de 0 a 11
        const dia = String(date.getDate()).padStart(2, '0');

        return `${ano}-${mes}-${dia}`;
    }

    inputDataInicio.value = formatarData(new Date(dataInicioAntiga.value))
    inputDataFim.value = formatarData(new Date(dataFimAntiga.value))
    inputHoraInicio.value = obterHora(new Date(dataInicioAntiga.value))
    inputHoraFim.value = obterHora(new Date(dataFimAntiga.value))

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
