const moment = require('moment-timezone');

class Diaria {
    static calcularQuantidadeHoras(dataInicial, dataFinal) {
        // Validar e converter datas para formato válido
        dataInicial = moment.tz(new Date(dataInicial), 'America/Sao_Paulo');
        dataFinal = moment.tz(new Date(dataFinal), 'America/Sao_Paulo');

        // Retorna a diferença em horas
        return dataFinal.diff(dataInicial, 'hours');
    }

    static calcularDiarias(dataInicial, dataFinal) {
        // Validar e converter datas para formato válido
        dataInicial = moment.tz(new Date(dataInicial), 'America/Sao_Paulo');
        dataFinal = moment.tz(new Date(dataFinal), 'America/Sao_Paulo');

        /**
         * Calcula diárias considerando:
         * - Reservas de até 24 horas contam como 1 diária.
         * - Reservas de 27 horas ou mais contam como 2 diárias.
         * - Se o período total for maior que 2 dias, retorna a diferença em dias.
         */
        const horasTotais = dataFinal.diff(dataInicial, 'hours');

        if (horasTotais <= 24) {
            return 1;
        } else if (horasTotais <= 27) {
            return 2;
        }

        return Math.ceil(horasTotais / 24); // Arredondar para cima para incluir dias parciais
    }

    static calcularValorTotalDaReserva(quantidadeDeDias, valorDaDiaria) {
        // Calcula o valor total da reserva sem limitar o máximo
        let valor = quantidadeDeDias * valorDaDiaria;

        // Comentário mantido para referência: removido o limite de 600
        return valor;
    }

    static aplicarDescontoNaDiariaParaCliente(valor, dias) {
        /**
         * Aplica desconto na diária:
         * - < 3 dias: 10% de desconto.
         * - < 5 dias: 15% de desconto.
         * - >= 5 dias: 20% de desconto.
         */
        if (dias < 3) {
            valor *= 0.90; // Aplica desconto de 10%
        } else if (dias < 5) {
            valor *= 0.85; // Aplica desconto de 15%
        } else {
            valor *= 0.80; // Aplica desconto de 20%
        }

        return valor;
    }
}

module.exports = Diaria;
