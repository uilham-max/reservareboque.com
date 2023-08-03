
const dataAtual = new Date();

function preencheDataInicioVazia(dataInicio){
   
    const primeiroDiaMes = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), 1);
    const dataFormatadaInicio = primeiroDiaMes.toISOString().slice(0, 10);
    dataInicio = dataFormatadaInicio;
    return dataInicio
    
}

function preencheDataFimVazia(dataFim){
   
    const ultimoDiaMes = new Date(dataAtual.getFullYear(), dataAtual.getMonth() + 1, 0);
    const dataFormatadaFim = ultimoDiaMes.toISOString().slice(0, 10);
    dataFim = dataFormatadaFim;
    return dataFim
    
}

function preencheDatasVazias(datas){
   
    const primeiroDiaMes = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), 1);
    const dataFormatadaInicio = primeiroDiaMes.toISOString().slice(0, 10);
    datas.inicioDoPeriodo = dataFormatadaInicio;

    const ultimoDiaMes = new Date(dataAtual.getFullYear(), dataAtual.getMonth() + 1, 0);
    const dataFormatadaFim = ultimoDiaMes.toISOString().slice(0, 10);
    datas.fimDoPeriodo = dataFormatadaFim;
    return datas
    
}

module.exports = {preencheDataInicioVazia, preencheDataFimVazia, preencheDatasVazias}