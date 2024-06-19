# Tarefas

* Iverter associação entre reserva e pagamento para funcionar ON CASCADE.
* Se um reboque foi reservado deve receber status de "aguardando pagamento" vou ter que criar 
um campo na tabela reboque como esse campo.
* Há um erro depois que um reboque é cadastrado. Porém o cadastro ocorre.
* Uma ideia é não remover os as reservas e os pagamentos com qrcode expirados, mas sim mante-los
com um status de "pagamento_expirado" = true
* Há um problema quando é submetida uma data de indisponiblididade. A aplicação retorna as datas
de indesponibilidade de todos os reboques
* Ao remover uma reserva que não foi paga devo remover a cobrança do sistema de pagamento.
* Adicionar no footer as informções de contato e endereço. Devem ser links para mapa e WhatsApp

* Criar recurso para recuperar senha.
* Criar recurso para tirar dúvidas
* Criar recurso para informar como funciona uma reserva/locação

# Onde parei?

* Criando recurso para o cliente poder editar sua reserva ( tela de edição pronta ). 
* Criar DAO para atualizar 