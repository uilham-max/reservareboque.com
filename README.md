# Inplemntações Futuras

* Acima de 30 dias avisar o cliente sobre o valor da mensalidade.
* Criar recurso para tirar dúvidas.
* Criar recurso para informar como funciona uma reserva/locação.
* Criar sino na navbar para notificações ao cliente como: reserva aprovada, reserva removida por causa
    de pagamento pendente.
* Adicionar  se a reserva esta aprovada ou pendente na tela de listagem de reservas do cliente.

# Onde parei:

* Criar campo 'cancelada' na tabela 'reserva'. Reservas não devem ser excluídas, mas sim canceladas. (cancelamento  lógico, não físico)
* STATUS RESERVA, CONCLUIDA, CANCELADA, ANDAMENTO, AGUARDANDO_PAGAMENTO, ADIADA
* IMPLEMENTAR RECUPERAÇÃO DE SENHA
* Implementar taxa de cancelamento no estorno de pagamento.

# Versão 1

1. Implementar alteração de data de retirada pelo cliente.
2. Implementar botão na área admin para informar a SAÍDA e a CHEGADA do reboque.
    21. Implementar o botão na área de admin para informar que o cliente ja entregou o reboque. 
3. Criar recurso para INATIVAR um reboque (CASO DE MANUTENÇÃO). 
    31. Listar apenas reboques DISPONÍVEIS e ATIVOS. 
4. IMPLEMENTAR RECUPERAÇÃO DE SENHA
5. Uma reserva não pode ser alterada, caso o status esteja ANDAMENTO ou CONCLUÍDA
6. Quando o cliente entregar o reboque, não deve permitir o cliente alterar a reserva na painel através do botão EDITAR. 
7. Inabilitar o botão editar e o botao cancelar. Permanecer ativo somente o botão voltar.

# Versão 2

* Implementar hora de retirada e de entrega
* Implementar geração de crédito para ao cliente no estorno
* Criar sistema de créditos para os clientes, ou seja, os dias se tornam créditos

