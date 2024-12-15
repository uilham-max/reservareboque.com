
document.addEventListener('DOMContentLoaded', function() {

    // Obtendo o valor do elemento oculto e convertendo de JSON para objeto
    const reservasJson = document.getElementById('reservas').value;
    const reservas = JSON.parse(reservasJson); // Converte para objeto

    // Função para criar um array com os dia indisponíveis
    const disabledDates = [];
    reservas.forEach(function(reserva) { 
        const startDate = new Date(new Date(reserva.dataSaida).getFullYear(), new Date(reserva.dataSaida).getMonth(), new Date(reserva.dataSaida).getDate());
        const endDate = new Date(new Date(reserva.dataChegada).getFullYear(), new Date(reserva.dataChegada).getMonth(), new Date(reserva.dataChegada).getDate());
        disabledDates.push({
            from: startDate,
            to: endDate
        });
    }); 


    // Função para marcar com circulo vermelho os dias indisponíveis
    function isDateDisabled(date, disabledDates) {
        // Itera sobre as datas desabilitadas
        for (let i = 0; i < disabledDates.length; i++) {
            const disabled = disabledDates[i];

            // Verifica se a data é um intervalo
            if (disabled.from && disabled.to) {
                if (date >= disabled.from && date <= disabled.to) {
                    return true; // Data está no intervalo desabilitado
                }
            } else if (disabled instanceof Date) {
                // Verifica se a data é uma única data
                if (date.toDateString() === disabled.toDateString()) {
                    return true; // Data está desabilitada
                }
            }
        }
        return false; // Data não está desabilitada
    }

    let hoje = new Date()
    let amanha = new Date()
    amanha.setDate(hoje.getDate() +1)

    flatpickr("#dataIntervalo", {
        mode: "range",
        altInput: true,
        altFormat: "d/m",
        // dateFormat: "Y-m-d", // Formato da data
        minDate: "today", // Bloqueia dias anteriores à data atual
        defaultDate: [hoje, amanha],
        // showMonths: 1, // Exibe todos os 12 meses do ano
        // inline: true, // Faz o calendário ficar fixo
        disable: disabledDates,
        locale: "pt",
        onReady: function(selectedDates, dateStr, instance) {
            // instance.open(); // Abre o calendário automaticamente
        },
        onDayCreate: function(dObj, dStr, fp, dayElem){
            // Utilize dayElem.dateObj, which is the corresponding Date

            // dummy logic - Marca com um circulo vermelho os dias indisponíveis
            if (isDateDisabled(dayElem.dateObj, disabledDates))
                dayElem.innerHTML += "<span class='event'></span>";
        },
        onChange: function(selectedDates, dateStr, instance) {
            if (selectedDates.length === 2) {
                // Quando o intervalo estiver completo (2 datas selecionadas)
                document.getElementById('dataInicio').value = selectedDates[0];
                document.getElementById('dataFim').value = selectedDates[1];
            }
        },
        
    });
    
    
})
