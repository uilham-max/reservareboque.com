const FormaPagamento = Object.freeze({
    PIX: 'PIX',
    DINHEIRO: 'DINHEIRO'
});

const SituacaoReserva = Object.freeze({
    APROVADO: 'APROVADO',
    CONCLUIDO: 'CONCLUIDO',
    CANCELADO: 'CANCELADO',
    ANDAMENTO: 'ANDAMENTO',
    AGUARDANDO_PAGAMENTO: 'AGUARDANDO_PAGAMENTO',
    ADIADO: 'ADIADO',
    AGUARDANDO_ACEITACAO: 'AGUARDANDO_ACEITACAO'
});

module.exports = {
    FormaPagamento,
    SituacaoReserva
};