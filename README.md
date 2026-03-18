# 🚀 Sistema de Reservas de Reboques

Aplicação web para gerenciamento de reservas de reboques.

## Tecnologias utilizadas

* Node.js
* Express
* PostgreSQL
* Sequelize
* JavaScript
* HTML / CSS
* Docker
* Ngrok


# 🎯 Requisitos

Antes de iniciar, certifique-se de ter instalado:

* Node.js (versão 18 ou superior)
* npm
* PostgreSQL
* Git
* Docker
* Ngrok


# 1. Clonar o repositório

```bash
git clone https://github.com/uilham-max/reservareboque.com
```


# 2. Instalar dependências

```bash
npm install
```


# 3. 📝 Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto.

Exemplo:


Variáveis de ambiente para o serviço de email
```
MAIL_PASS="chave-de-aplicação"
MAIL_USER="locadoradereboquesoliveira@gmail.com"
```
Variáveis de ambiente para o banco de dados no Render (Produção)
```
RENDER_DB_DIALECT=""
RENDER_DB_HOST=""
RENDER_DB_HOST_EXTERNO=""
RENDER_DB_NOME=""
RENDER_DB_PASSWORD=""
RENDER_DB_USER=""
```
```
TZ="America/Sao_Paulo"
```
Variáveis de ambiente para a API de pagamentos Asaas (Produção)
```
URL_BASE="https://api.asaas.com/v3"
ACCESS_TOKEN="pegar token no asaas"
```
Variáveis de ambiente para o banco de dados local
```
LOCAL_DB_DIALECT="postgres"
LOCAL_DB_HOST="localhost"
LOCAL_DB_NOME="locadora_local_db"
LOCAL_DB_PASSWORD="postgres"
LOCAL_DB_USER="postgres"
```
Variáveis de ambiente para a API de pagamentos Asaas (Sandbox)
```
URL_BASE="https://api-sandbox.asaas.com/v3"
ACCESS_TOKEN="$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6
OjcxNDdmMjAxLTcwMDMtNDU4Yy04ZGExLTI1Y2UwOTUwZTE0Yzo6JGFhY2hfNGRmNTVmNTgt
NGZmYy00NjQ0LWJmMjMtNDM3ZGFiNmY0YjZm"

```



# 4. 🎯 Criar banco de dados

* No PostgreSQL criar o banco. A aplicação criará as tabelas automaticamente quando iniciar.


# 5. 🎯 Rodar a aplicação

Instalar nodemon:

```bash
npm install -g nodemon
```

Modo desenvolvimento:

```bash
nodemon index.js
```

ou

```bash
node index.js
```


# 6. 🐳 Docker

* Fazer build da imagem:

```
docker build -t locadoraApp .
```

* Rodar o container:
```
docker run -v .:/app -p 3000:3000 locadoraApp
```


# Acessar aplicação

Abra no navegador:

```
http://localhost:3000
```

# 🎯 Fluxo de uma reserva

1. O cliente cria a reserva.
2. As tabelas `PAGAMENTO` e `RESERVA` ficam o valor do campo `status` igual à `AGUADANDO_PAGAMENTO`.
3. Uma cobrança é criada no Asaas.
4. Quando o cliente efetua o pagamento por `PIX` ou o admin aprova pagamentos em ``DINHEIRO``, o Webhook configurado no Asaas dispara uma requisição para a ``API`` da locadora de reboques.
5. A API da locadora atualiza o valor do campo `status` das tabelas `PAGAMENTO` e `RESERVA` para `APROVADO`.




# Usando o Ngrok para desenvolvimento

A principal função do Ngrok aqui é publicar a aplicação na Web para modo de desenvolvimento.
* Siga as instruções do site do ``Ngrok`` para configurar um ``token``.
* Esse comando vai criar uma URL para ser acessada por clientes na internet.

```bash
ngrok http 3000
```


A URL será parecida com:

```
 https://4906-187-62-98-219.ngrok-free.app
```


# Configurar webhook de pagamento Asaas para DSV ou PRD

* Acessar o Asaas e ativar o webhook de desenvolvimento
```
https://sandbox.asaas.com/customerConfigIntegrations/webhooks
```
DSV
```
TEST_PAYMENT_RECEIVED
```
PRD
```
PRODUÇAO PAYMENT_RECEIVED
```
* Você precisa editar as configurações do Webhook TEST_PAYMENT_RECEIVED. Cole o valor da URL externa da aplicação criada pelo ngrok no campo "URL do Webhook" no Asaas.


Valor do campo URL do Webhook:
```
https://4906-187-62-98-219.ngrok-free.app/pagamento/webhook/pix
```


# Configurar tela de sucesso para o cliente


* Quando o cliente clica no botão `Criar Reserva`O arquivo `API_verificaPagamento.js` ficará disparando requisições em busca do ``status`` do ``pagamento``. Quando o status for igual `APROVADO`, o cliente revebera uma tela de `Sucesso`.

* Para isso será necessar definir a URL criada pelo ngrok na variavel "resposta" do arquivo `API_verificaPagamento.js`.

DSV
```
const resposta = await fetch(`https://4906-187-62-98-219.ngrok-free.app/pagamento/aprovado/${input_id_cobranca.value}`);
```
PRD
```
const resposta = await fetch(`https://www.reboquesoliveira.com/pagamento/aprovado/${input_id_cobranca.value}`);
```




# 🎯 Observações

* Certifique-se de que o PostgreSQL está em execução.
* Verifique se as variáveis do `.env` estão corretas.
* Usar o ``Ngrok`` para gerar uma URL externa.
* Definir a URL na configuração do Webhook do Asaas


# Autor

Desenvolvido por Uilham Gonçalves.


