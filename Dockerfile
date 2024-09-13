# Use a imagem oficial do Node.js 20 como base
FROM node:20

# Crie um diretório de trabalho
WORKDIR /app

# Copie o package.json e o package-lock.json
COPY package*.json ./

# Instale as dependências
RUN npm ci

# Copie o restante do código fonte
COPY . .

# Compile o TypeScript, se necessário
RUN npm run build

# Exponha a porta que a aplicação usará
EXPOSE 3333

# Defina o comando padrão para iniciar a aplicação
CMD [ "npm", "start" ]
