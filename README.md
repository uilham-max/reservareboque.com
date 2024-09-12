# Inplemntações Futuras

* Acima de 30 dias avisar o cliente sobre o valor da mensalidade.
* Criar recurso para tirar dúvidas.
* Criar recurso para informar como funciona uma reserva/locação.
* Criar sino na navbar para notificações ao cliente como: reserva aprovada, reserva removida por causa
    de pagamento pendente.
* Adicionar  se a reserva esta aprovada ou pendente na tela de listagem de reservas do cliente.

# Onde parei:

* Implementar taxa de cancelamento no estorno de pagamento.

# Versão 1

1. STATUS RESERVA, MANUTENCAO, APROVADO, CONCLUIDO, CANCELADO, ANDAMENTO, AGUARDANDO_PAGAMENTO, AGUARDANDO_ACEITACAO, ADIADO (neste caso a data nao expira e o cliente pode escolher a nova data em qualquer momento)
5. Uma reserva não pode ser alterada, caso o status esteja ANDAMENTO ou CONCLUÍDA
3. Criar recurso para INATIVAR um reboque (CASO DE MANUTENÇÃO). 
4. IMPLEMENTAR RECUPERAÇÃO DE SENHA
8. Criar pasta routes
10. Se uma reserva está com situação = 'AGUARDANDO_PAGAMENTO' alguém pode sobrescrever essa reserva?
11. Uma reserva que tem situação = 'AGUARDANDO_PAGAMENTO' deve ficar indisponivel para outros clientes
14. Testar datas com consultas diretas no BD para testar os ranges
16. Definir situação para CANCELADO reservas com o prazo para pagamento expirado
19. Na tela de periodo, manter o cliente informado sobre quantos dias tem o periodo que ele escolheu nas datas, ou seja, calcular a diferença em 
horas e em diarias.
22. Uma reserva que foi criada hoje, pode ser adiada hoje
23. Há uma duplicação ocasional em admin/painel dos botoes iniciar e recebido
24. O valor da diaria na tabela da reserva esta com numero extenso
25. Mostra a hora de inicio e fim na tela da lista das reservas do cliente
26. Realizar testes na alteração de data da reserva pelo cliente. verificar diarias e horas dos periodos
27. O cliente deseja alterar o reboque de sua reserva


# Versão 2

* Implementar hora de retirada e de entrega
* Implementar geração de crédito para ao cliente no estorno
* Criar sistema de créditos para os clientes, ou seja, os dias se tornam créditos

