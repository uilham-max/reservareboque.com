const moment = require('moment-timezone')

class DiariaCalculo {

	static calcularQuantidadeHoras(dataInicial, dataFinal){
		// Validar e converter datas para formato válido
        dataInicial = moment.tz(new Date(dataInicial), 'America/Sao_Paulo');
        dataFinal = moment.tz(new Date(dataFinal), 'America/Sao_Paulo');
		return dataFinal.diff(dataInicial, 'hours')
	}

	static quantidadeDeDias(dataInicial, dataFinal) {
		
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

	static calcularValorTotalDaReserva(quantidadeDeDias, valorDaDiaria){
		let valor = quantidadeDeDias*valorDaDiaria
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

