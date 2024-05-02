class Diaria {
	static calcularDiarias(dataInicial, dataFinal) {
		if(dataInicial == dataFinal){
			return 1
		}
		const diffInMs   = new Date(dataFinal) - new Date(dataInicial)
		const diffInDays = diffInMs / (1000 * 60 * 60 * 24)
		return diffInDays
	}

	static calcularValorTotalDaReserva(quantidadeDeDias, valorDaDiaria){
		let valor = quantidadeDeDias*valorDaDiaria
		if(valor > 600){
			valor = 600
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
		if(valor > 500){
			valor = 500
		}
		return valor
	}
}
module.exports = Diaria

