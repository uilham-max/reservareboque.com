class Diaria {
	static calcularDiarias(dataInicial, dataFinal) {
		const diffInMs   = new Date(dataFinal) - new Date(dataInicial)
		const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
		return diffInDays
	}
}
module.exports = Diaria

