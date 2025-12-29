
class Caledario {

    static dataAtual = new Date();

    static primeiroDiaDoMesAtual() {
        const primeiroDia = new Date(
            this.dataAtual.getFullYear(), 
            this.dataAtual.getMonth(), 
            1
        )
        return primeiroDia.toISOString().slice(0, 10);
    } 

    static ultimoDiaDoMesAtual() {
        const ultimoDia = new Date(
            this.dataAtual.getFullYear(),
            this.dataAtual.getMonth() + 1,
            0
        );

        return ultimoDia.toISOString().slice(0, 10);
    } 

}

module.exports = Caledario