


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
* Criar campo 'cancelada' na tabela 'reserva'. Reservas não devem ser excluídas, mas sim canceladas. (cancelamento  lógico, não físico)
* STATUS RESERVA, CONCLUIDA, CANCELADA, ANDAMENTO, AGUARDANDOPAGAMENTO
* Implementar taxa de cancelamento no estorno de pagamento.


# Versão 1
* Implementar alteração de data de retirada.
* Implementar o botão na área de amin para informar que o cliente ja entregou o reboque. Quando o cliente entregar o reboque, não deve permitir o cliente alterar a reserva na painel através do botão EDITAR. Inabilitar o botão editar e o botao cancelar. Permanecer ativo somente o botão voltar.
* Implementar botão na área admin para informar a entrega.
* Incluir coluna data retirada e data de entrega -  https://www.reboquesoliveira.com/cliente/minhas-reservas
* na tela https://www.reboquesoliveira.com/cliente/reserva-detalhe/2 - quando clica no botão cancelar, alterar a mensagem do dialog.

# Fluxo Dinheiro
* https://www.reboquesoliveira.com/reserva/dados-confirma - corrigir preenchimento dos dados do cliente quando perde a sessão de logado. (tentar entender o cenário)



# Versão 2
* Implementar hora de retirada e de entrega
* Implementar geração de crédito para ao cliente no estorno
