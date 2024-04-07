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
		return quantidadeDeDias*valorDaDiaria
	}

	static aplicarDescontoNaDiariaParaCliente(valor, dias){
		if(dias < 3){
			return valor * 0.90 
		} else if(dias < 5){
			return valor * 0.85 
		} else {
			return valor * 0.80
		} 
	}
}
module.exports = Diaria

