# Usado quando build for executado
ARG NODE_VERSION=18.12

# Use a imagem base oficial do Node.js
# FROM node:${NODE_VERSION}-alpine
FROM node:${NODE_VERSION}-slim

# RUN apt-get update && apt-get install -y vim && rm -rf /var/lib/apt/lists/*

# Usado quando run for executado
ENV PORT=3000

# Defina o diretório de trabalho dentro do container
WORKDIR /app

# Copie o package.json e package-lock.json para o diretório de trabalho
COPY package*.json ./

# Instale as dependências da aplicação
RUN npm install --production

# Copie o restante do código da aplicação para o diretório de trabalho
COPY . .

# Exponha a porta em que a aplicação irá rodar
EXPOSE 3000

# Comando para rodar a aplicação
CMD ["node", "index.js"]

# Comando docker para rodar o projeto em modo de desenvolvimento
# docker run -v .:/app -p 3000:3000 reboquesoliveira

