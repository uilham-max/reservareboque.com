
const formatarDadosDoClienteParaEmail = async (reserva) => {
    
    console.log(`Formatando dados da reserva para enviar por email...`);

    const dadosReserva = {
        'clienteNome': reserva.cliente.nome,
        'reboquePlaca': reserva.reboque.placa,
        'reboqueModelo': reserva.reboque.modelo,
        'dataInicio': new Date(reserva.dataSaida).toLocaleDateString('pt-BR'),
        'horaInicio': new Date(reserva.dataSaida).toString().slice(16,21),
        'dataFim': new Date(reserva.dataChegada).toLocaleDateString('pt-BR'),
        'horaFim': new Date(reserva.dataChegada).toString().slice(16,21),
        'clienteEmail': reserva.cliente.email,
    }

    return dadosReserva

}

module.exports = formatarDadosDoClienteParaEmail