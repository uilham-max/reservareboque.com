class Diaria {
	static calcularDiarias(dataInicial, dataFinal) {

		// const d1  = dataInicial;
		// const d2    = dataFinal;
		const diffInMs   = new Date(dataInicial) - new Date(dataFinal)
		const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
		return diffInDays
	}

}

module.exports = Diaria

