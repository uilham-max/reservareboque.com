const moment = require('moment-timezone');
const DAOReserva = require('../database/DAOReserva');
const DAOReboque = require('../database/DAOReboque');

class Grafico {

    static async reservas(competencia) {

        // competência no formato YYYY-MM
        const dataCompetencia = moment.tz(
            competencia,
            'YYYY-MM',
            'America/Sao_Paulo'
        );

        const datasets = [];

        const diasNoMes = dataCompetencia.daysInMonth();

        // LIMITES DO MÊS DA COMPETÊNCIA
        const inicioMes = dataCompetencia.clone().startOf('month');
        const fimMes    = dataCompetencia.clone().endOf('month');

        // BUSCA TODOS OS REBOQUES
        const reboques = await DAOReboque.getAll();

        // ITERA POR CADA REBOQUE
        for (const reboque of reboques) {

            // CALENDÁRIO DO MÊS PARA ESTE REBOQUE
            const dia = [];

            for (let i = 0; i < diasNoMes; i++) {
                dia.push({
                    x: (i + 1).toString(),
                    y: 0,
                    clientes: []
                });
            }

            // BUSCA AS RESERVAS DO REBOQUE NO PERÍODO
            const reservas = await DAOReserva.getAtivasDesteReboqueGrafico( reboque.placa, dataCompetencia );

            if (!reservas || reservas.length === 0) {
                continue;
            }

            // ITERA PELAS RESERVAS
            for (const reserva of reservas) {
                
                // EXCLUI DO GRÁFICO DIAS QUE INICIAM DEPOIS DAS 18H
                if (reserva.dataSaida.getHours() > 18) {
                    // cria uma nova data para não alterar o objeto original
                    const novaData = new Date(reserva.dataSaida);
                    
                    // soma 1 dia
                    novaData.setDate(novaData.getDate() + 1);
                    
                    // opcional: zera hora para evitar efeitos colaterais
                    novaData.setHours(0, 0, 0, 0);

                    reserva.dataSaida = novaData;
                }


                const inicioReserva = moment(reserva.dataSaida);
                const fimReserva    = moment(reserva.dataChegada);

                // INTERSEÇÃO COM O MÊS DA COMPETÊNCIA
                const inicioEfetivo = moment.max(inicioReserva, inicioMes);
                const fimEfetivo    = moment.min(fimReserva, fimMes);

                if (inicioEfetivo.isAfter(fimEfetivo)) {
                    continue;
                }

                const valorDiaria = reserva.pagamento.valor / reserva.diarias;
                const nomeCliente = reserva.cliente.nome;

                // DISTRIBUI A RESERVA PELOS DIAS
                for ( let diaIter = inicioEfetivo.clone(); diaIter.isSameOrBefore(fimEfetivo); diaIter.add(1, 'day') ) {
                    const index = diaIter.date() - 1;

                    dia[index].y += valorDiaria;

                    if (!dia[index].clientes.includes(nomeCliente)) {
                        dia[index].clientes.push(nomeCliente);
                    }
                }
            }

            // DATASET DO REBOQUE
            datasets.push({
                label: reboque.placa.slice(0, 3),
                data: dia
            });
        }

        return JSON.stringify({ datasets });
    }
}

module.exports = Grafico;
