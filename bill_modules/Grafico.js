const moment = require('moment-timezone');
const DAOReserva = require('../database/DAOReserva');
const DAOReboque = require('../database/DAOReboque');

class Grafico {

    static async reservas() {

        let dataAtual = moment.tz('America/Sao_Paulo');
        let dia = [];
        let datasets = [];

        // MONTAR ARRAY DE DIAS
        for (let i = 0; i < dataAtual.daysInMonth(); i++) {
            dia[i] = { x: (i + 1).toString(), y: "0" };
        }

        let reboques = await DAOReboque.getAll();

        // ITERA POR CADA REBOQUE
        for (let i = 0; i < reboques.length; i++) {
            // RETORNA RESERVAS DE CADA REBOQUE
            let reservas = await DAOReserva.getTodasDesteReboque(reboques[i].placa);

            if (reservas) {
                let datasArray = [];

                // ITERA PELAS RESERVAS DE CADA REBOQUE
                for (let j = 0; j < reservas.length; j++) {

                    let dataInicio = parseInt(reservas[j].dataValues.dataSaida.getDate());
                    let dataFim = parseInt(reservas[j].dataValues.dataChegada.getDate());
                    let maxDay = dataAtual.daysInMonth();
                    let valorDiaria = (reservas[j].pagamento.valor / reservas[j].dataValues.diarias).toFixed(2);

                    if (dataFim < dataInicio) {
                        dataFim = maxDay;
                    }

                    let diasReservadosArray = [];

                    // GRAVAR DIAS NO ARRAY
                    for (let k = dataInicio; k <= dataFim; k++) {
                        diasReservadosArray.push({ x: k.toString(), y: valorDiaria });
                    }

                    // JUNTAR DIAS DO REBOQUE NUM UNICO ARRAY
                    datasArray.push(...diasReservadosArray);
                }

                // COPIA CADA DIA RESERVADO PARA O CALENDARIO DO REBOQUE
                for (let l = 0; l < datasArray.length; l++) {
                    if (parseInt(datasArray[l].x) <= dia.length) {
                        dia[parseInt(datasArray[l].x) - 1].y = datasArray[l].y;
                    }
                }

                // MONTA O ARRAY DE CALENDARIO DE CADA REBOQUE QUE SERÁ PASSADO PARA O CHART
                datasets.push({ type: "line", label: reboques[i].placa.slice(0, 3), data: [...dia] });

                // RESETA O CALENDARIO
                for (let m = 0; m < dataAtual.daysInMonth(); m++) {
                    dia[m] = { x: (m + 1).toString(), y: "0" };
                }
            }
        }

        // console.log('Datasets:', datasets); // NESTE PONTO OS DADOS ESTÃO CORRETOS

        let dataMock = { datasets };
        let dataJSON = JSON.stringify(dataMock);
        // console.log('Data JSON:', dataJSON); // VERIFICAR AQUI SE OS DADOS ESTÃO CORRETOS

        return dataJSON

    }


}

module.exports = Grafico