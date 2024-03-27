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
}
module.exports = Diaria

