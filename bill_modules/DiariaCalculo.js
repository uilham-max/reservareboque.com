const moment = require('moment-timezone')

class DiariaCalculo {

	static calculaTotal(dataInicial, dataFinal, valorDaDiaria){

		/**
		 * 		+-------------------------------------------------------------+
		 * 		| Como calcular o valor de uma reserva com mais de uma semana |
		 *  	+-------------------------------------------------------------+
		 * 		Aplicar desconto usando porcentagem, quanto maior o número de dias maior a porcentagem.
		 * 		Ex: 01 - 03 = 00% > min:  60 max: 180
		 * 			04 - 07 = 15% > min: 204 max: 357
		 * 			08 - 11 = 20% > min: 384 max: 528
		 * 			12 - 15 = 30% > min: 504 max: 630 -> 12 soma 1 dia = 13 min: 546
		 * 			16 - 21 = 40% > min: 576 max: 756 -> 16 soma 2 dias = 18 min: 648
		 * 			21+           > min: 735 max: 756
		*/
		
		let dias = this.calculaNumeroDeDias(dataInicial, dataFinal);

		// Calcula o valor total bruto
		let valorTotal = valorDaDiaria * dias

		// Aplica calculo proporcional ao número de dias no valot total bruto
		if(dias > 0 && dias < 4){
			valorTotal *= 1
		} else if (dias > 3 && dias < 8 ){
			valorTotal *= 0.85
		} else if (dias > 7 && dias < 12){
			valorTotal *= 0.80
		} else if (dias > 11 && dias < 16){
			if(dias = 12){
				// Acrescenta um dia
				valorTotal = (valorTotal + valorDaDiaria) * 0.70 
			} else {
				valorTotal *= 0.70
			}
		} else if (dias > 15 && dias < 22){
			if(dias = 15){
				// Acrescenta dois dias 
				valorTotal = (valorTotal + (valorDaDiaria * 2)) * 0.60
			} else {
				valorTotal *= 0.60
			}
		} else if (dias > 21){
			// Valor é fixo acima de 21 dias
			valorTotal = (valorDaDiaria * 21) * 0.60 
		}

		return valorTotal
	}

	static calcularQuantidadeHoras(dataInicial, dataFinal){
		// Validar e converter datas para formato válido
        dataInicial = moment.tz(new Date(dataInicial), 'America/Sao_Paulo');
        dataFinal = moment.tz(new Date(dataFinal), 'America/Sao_Paulo');
		return dataFinal.diff(dataInicial, 'hours')
	}

	static calculaNumeroDeDias(dataInicial, dataFinal) {
		
		// Validar e converter datas para formato válido
        dataInicial = moment.tz(new Date(dataInicial), 'America/Sao_Paulo');
        dataFinal = moment.tz(new Date(dataFinal), 'America/Sao_Paulo');

		/**
		 * Deve ser realizado um calculo em horas, pois reserva com 1 dia 1/2 devem ser contabilizadas como 2 dias.
		 * Neste caso se uma reserva for retirada as 13:00 e for entrege no outro dia as 18:00 deve ser contabilizado 2 diarias,
		 * ou seja, se o periodo em horas for maior que 29 horas, dever ser retornado 2 diarias
		*/
		// console.log('Horas da reserva: ',dataFinal.diff(dataInicial, 'hours'));
		// console.log('Diárias da reserva: ',dataFinal.diff(dataInicial, 'days'));


		if(dataFinal.diff(dataInicial, 'days') < 2){
			if(dataFinal.diff(dataInicial, 'hours') < 24){
				return 1
			}
			if(dataFinal.diff(dataInicial, 'hours') > 27){
				return 2
			}
		}
		
		return dataFinal.diff(dataInicial, 'days')
	}

	static calcularValorTotalDaReserva(dias, valorDaDiaria){
		let valor = dias*valorDaDiaria
		if(valor > 600){
			valor = valor // Nova
			// valor = 600 // Antiga
		}
		return valor
	}

	static aplicarDescontoNaDiariaParaCliente(valor, dias){
		if(dias < 3){
			valor =+ valor * 0.90 
		} else if(dias < 5){
			valor =+ valor * 0.85 
		} else {
			valor =+ valor * 0.80
		} 
		// if(valor > 500){
		// 	valor = 500
		// }
		return valor
	}
}
module.exports = DiariaCalculo

