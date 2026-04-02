// Formas de pagamento disponíveis
const FormaPagamento = Object.freeze({
    PIX: 'PIX',
    DINHEIRO: 'DINHEIRO'
});

// Situações possíveis para uma reserva
const SituacaoReserva = Object.freeze({
    APROVADO: 'APROVADO',
    CONCLUIDO: 'CONCLUIDO',
    CANCELADO: 'CANCELADO',
    ANDAMENTO: 'ANDAMENTO',
    AGUARDANDO_PAGAMENTO: 'AGUARDANDO_PAGAMENTO',
    ADIADO: 'ADIADO',
    AGUARDANDO_ACEITACAO: 'AGUARDANDO_ACEITACAO',
    CANCELADO_COM_CREDITO: 'CANCELADO_COM_CREDITO',
    CREDITO: 'CREDITO'
});

// Motivos de cancelamento para uma reserva
const MotivoCancelamento = Object.freeze({
    CLIENTE: 'CLIENTE',
    ADMIN: 'ADMIN',
    NAO_PAGO: 'NAO_PAGO'
});

module.exports = {
    FormaPagamento,
    SituacaoReserva,
    MotivoCancelamento
};