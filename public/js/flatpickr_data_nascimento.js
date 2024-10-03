document.addEventListener('DOMContentLoaded', function () {
                                    
    let inputDataNascimento = document.getElementById('dataNascimento');
    let invalidDataNascimento = document.getElementById('invalidDataNascimento');

    flatpickr("#dataNascimento", {
        altInput: true,
        altFormat: "d/m/Y",
        locale: "pt",
        dateFormat: "Y-m-d",  // Defina um formato consistente para trabalhar com o valor
        onClose: function (selectedDates, dateStr, instance) {

            if (selectedDates.length === 0) return;

            // Capturar a data selecionada diretamente
            const dataNascimento = selectedDates[0];
            const hoje = new Date();

            // Calcular a idade
            let idade = hoje.getFullYear() - dataNascimento.getFullYear();
            const mes = hoje.getMonth() - dataNascimento.getMonth();
            if (mes < 0 || (mes === 0 && hoje.getDate() < dataNascimento.getDate())) {
                idade--;
            }

            // Validar se é maior de 18 anos e menor que 100 anos
            if (idade < 18 || idade > 100) {
                inputDataNascimento.classList.add('is-invalid');
                inputDataNascimento.setCustomValidity('Deve estar entre 18 e 100 anos.');
                invalidDataNascimento.textContent = 'Deve estar entre 18 e 100 anos.';
            } else {
                inputDataNascimento.classList.remove('is-invalid');
                inputDataNascimento.setCustomValidity('');
                invalidDataNascimento.textContent = '';
            }
        }
    });
    
});