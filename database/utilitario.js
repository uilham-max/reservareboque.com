
function preencheDatasVazias(datas){
    
    const dataAtual = new Date();
    
    const primeiroDiaMes = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), 1);
    const dataFormatadaInicio = primeiroDiaMes.toISOString().slice(0, 10);
    datas.inicioDoPeriodo = dataFormatadaInicio;
    
    const ontem = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), dataAtual.getDate() -1);
    const dataFormatadaFim = ontem.toISOString().slice(0, 10);
    datas.fimDoPeriodo = dataFormatadaFim;
    
    return datas

}

module.exports = { preencheDatasVazias }