# Inplemntações Futuras

* Acima de 30 dias avisar o cliente sobre o valor da mensalidade.
* Criar recurso para tirar dúvidas.
* Criar recurso para informar como funciona uma reserva/locação.
* Criar sino na navbar para notificações ao cliente como: reserva aprovada, reserva removida por causa
    de pagamento pendente.
* Adicionar  se a reserva esta aprovada ou pendente na tela de listagem de reservas do cliente.

# Onde parei:

* Criar campo 'cancelada' na tabela 'reserva'. Reservas não devem ser excluídas, mas sim canceladas. (cancelamento  lógico, não físico)
* STATUS RESERVA, MANUTENCAO, APROVADO, CONCLUIDO, CANCELADO, ANDAMENTO, AGUARDANDO_PAGAMENTO, ADIADO (neste caso a data nao expira e o cliente pode escolher a nova data em qualquer momento)
* Implementar taxa de cancelamento no estorno de pagamento.

# Versão 1

5. Uma reserva não pode ser alterada, caso o status esteja ANDAMENTO ou CONCLUÍDA
2. Implementar botão na área admin para informar a SAÍDA e a CHEGADA do reboque.
3. Criar recurso para INATIVAR um reboque (CASO DE MANUTENÇÃO). 
    31. Listar apenas reboques DISPONÍVEIS e ATIVOS. 
4. IMPLEMENTAR RECUPERAÇÃO DE SENHA
8. Criar pasta routes
9. Padronizar nomes dos endpoints conforme convenção
10. Se uma reserva está com situação = 'AGUARDANDO_PAGAMENTO' alguém pode sobrescrever essa reserva?
11. Uma reserva que tem situação = 'AGUARDANDO_PAGAMENTO' deve ficar indisponivel para outros clientes
13. A quantidade de horas de uma reserva não pode ser menor que 3 horas
14. Testar datas com consultas diretas no BD para testar os ranges
15. IMPLEMENTAR RECUPERAÇÃO DE SENHA
16. Definir situação para CANCELADO reservas com o prazo para pagamento expirado
17. Mesmo que o cliente seja cadastrado, mas se ele não estiver logado a reserva não deve aparecer nos registros dele.


# Versão 2

* Implementar hora de retirada e de entrega
* Implementar geração de crédito para ao cliente no estorno
* Criar sistema de créditos para os clientes, ou seja, os dias se tornam créditos

