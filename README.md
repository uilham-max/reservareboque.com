# Tarefas

* Preciso remover após 10 minutos uma reserva em que foi gerado um qr code e não foi pago.
* Criar "cancelar reserva".
* On cascade de reserva não deletou o pagamento associado.
* Iverter associação entre reserva e pagamento para funcionar ON CASCADE.
* Se um reboque foi reservado deve receber status de "aguardando pagamento" vou ter que criar 
um campo na tabela reboque como esse campo.
* Há um erro depois que um reboque é cadastrado. Porém o cadastro ocorre.
* Uma ideia é não remover os as reservas e os pagamentos com qrcode expirados, mas sim mante-los
com um status de "pagamento_expirado" = true

