


# Tarefas
* Se um reboque foi reservado deve receber status de "aguardando pagamento" vou ter que criar 
um campo na tabela reboque como esse campo.
* Uma ideia é não remover os as reservas e os pagamentos com qrcode expirados, mas sim mante-los
com um status de "pagamento_expirado" = true
* Há um problema quando é submetida uma data de indisponiblididade. A aplicação retorna as datas
de indesponibilidade de todos os reboques


# footer
* Adicionar no footer as informções de contato e endereço. Devem ser links para mapa e WhatsApp
* Adicionar CNPJ, endereço

# Inplemntações Futuras
* Acima de 30 dias avisar o cliente sobre o valor da mensalidade.
* Criar recurso para recuperar senha.
* Criar recurso para tirar dúvidas.
* Criar recurso para informar como funciona uma reserva/locação.
* Criar sino na navbar para notificações ao cliente como: reserva aprovada, reserva removida por causa
    de pagamento pendente.
* Adicionar  se a reserva esta aprovada ou pendente na tela de listagem de reservas do cliente.


# Onde parei?
* Criar campo 'cancelada' na tabela 'reserva'. Reservas não devem ser excluídas, mas sim canceladas

