# Guia de Instalação e Uso - Plataforma Erechim E-SPORTS Festival

Este documento fornece instruções detalhadas para instalar, configurar e utilizar a plataforma Erechim E-SPORTS Festival.

## Índice
1. [Requisitos do Sistema](#requisitos-do-sistema)
2. [Instalação Local](#instalação-local)
3. [Configuração do Banco de Dados](#configuração-do-banco-de-dados)
4. [Implantação em Serviços de Hospedagem](#implantação-em-serviços-de-hospedagem)
5. [Guia de Administração](#guia-de-administração)
6. [Guia para Capitães](#guia-para-capitães)
7. [Guia para Jogadores](#guia-para-jogadores)
8. [Solução de Problemas](#solução-de-problemas)

## Requisitos do Sistema

Para executar a plataforma Erechim E-SPORTS Festival, você precisará de:

- Node.js (versão 14.x ou superior)
- MongoDB (versão 4.x ou superior)
- NPM (geralmente instalado com o Node.js)
- Navegador web moderno (Chrome, Firefox, Edge, Safari)

## Instalação Local

Siga estas etapas para instalar a plataforma em seu ambiente local:

1. **Extraia o arquivo zip** em um diretório de sua escolha

2. **Instale as dependências do backend**:
   ```bash
   cd erechim-esports-platform
   npm install
   ```

3. **Instale as dependências do frontend**:
   ```bash
   cd frontend
   npm install
   ```

4. **Configure as variáveis de ambiente**:
   - Crie um arquivo `.env` na raiz do projeto (ou edite o existente)
   - Adicione as seguintes variáveis:
     ```
     PORT=5000
     MONGO_URI=mongodb://localhost:27017/erechim-esports
     JWT_SECRET=erechim_esports_secret_key_2025
     NODE_ENV=development
     ```

5. **Inicie o servidor de desenvolvimento**:
   ```bash
   cd ..
   npm run dev
   ```

6. **Acesse a aplicação**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Configuração do Banco de Dados

### MongoDB Local

1. **Instale o MongoDB** seguindo as instruções em [mongodb.com](https://www.mongodb.com/try/download/community)

2. **Inicie o serviço MongoDB**:
   ```bash
   mongod --dbpath=/data/db
   ```

3. **A aplicação criará automaticamente** as coleções necessárias na primeira execução

### MongoDB Atlas (Nuvem)

1. **Crie uma conta** em [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

2. **Crie um cluster** (o plano gratuito é suficiente para começar)

3. **Configure o acesso ao banco de dados**:
   - Crie um usuário e senha
   - Configure o acesso de rede (IP Whitelist)

4. **Obtenha a string de conexão** e atualize o arquivo `.env`:
   ```
   MONGO_URI=mongodb+srv://seu_usuario:sua_senha@cluster0.mongodb.net/erechim-esports?retryWrites=true&w=majority
   ```

## Implantação em Serviços de Hospedagem

### Render

1. **Crie uma conta** no [Render](https://render.com)

2. **Crie um novo Web Service**:
   - Conecte ao repositório Git ou faça upload do código
   - Selecione "Node" como ambiente
   - Configure o comando de build: `npm install && npm run build`
   - Configure o comando de start: `npm start`
   - Adicione as variáveis de ambiente (PORT, MONGO_URI, JWT_SECRET, NODE_ENV)

3. **Implante o serviço** e aguarde a conclusão

### Railway

1. **Crie uma conta** no [Railway](https://railway.app)

2. **Crie um novo projeto**:
   - Faça upload do código ou conecte ao repositório Git
   - Adicione um serviço Node.js
   - Configure as variáveis de ambiente (PORT, MONGO_URI, JWT_SECRET, NODE_ENV)

3. **Implante o serviço** e aguarde a conclusão

### Heroku

1. **Crie uma conta** no [Heroku](https://heroku.com)

2. **Instale o Heroku CLI** e faça login:
   ```bash
   npm install -g heroku
   heroku login
   ```

3. **Crie um novo aplicativo**:
   ```bash
   heroku create erechim-esports-festival
   ```

4. **Configure as variáveis de ambiente**:
   ```bash
   heroku config:set MONGO_URI=sua_string_de_conexao
   heroku config:set JWT_SECRET=seu_segredo
   heroku config:set NODE_ENV=production
   ```

5. **Implante o código**:
   ```bash
   git push heroku main
   ```

## Guia de Administração

### Primeiro Acesso

1. **Acesse a plataforma** através do URL de implantação ou localhost

2. **Faça login como administrador**:
   - Email: ddanieltodeschini@gmail.com
   - Senha: admin123

3. **Altere a senha** imediatamente após o primeiro acesso

### Gerenciamento de Campeonatos

1. **Criar um novo campeonato**:
   - Acesse a aba "Campeonatos" no painel administrativo
   - Clique em "Novo Campeonato"
   - Preencha os detalhes (nome, datas, jogos incluídos)
   - Defina o período de inscrições
   - Salve o campeonato

2. **Gerenciar chaveamentos**:
   - Acesse um campeonato existente
   - Clique em "Gerenciar Chaveamentos"
   - Selecione o formato (eliminação simples, dupla, grupos)
   - Clique em "Gerar Chaveamento"
   - Revise e confirme

### Relatórios

1. **Gerar relatório de times**:
   - Acesse a aba "Relatórios" no painel administrativo
   - Selecione "Relatório de Times"
   - Clique em "Gerar Relatório"
   - Exporte para CSV se necessário

2. **Gerar relatório de jogadores**:
   - Acesse a aba "Relatórios" no painel administrativo
   - Selecione "Relatório de Jogadores"
   - Filtre por jogo se necessário
   - Clique em "Gerar Relatório"
   - Exporte para CSV se necessário

## Guia para Capitães

### Registro e Login

1. **Registre-se como capitão**:
   - Acesse a página inicial
   - Clique em "Registrar"
   - Selecione "Capitão de Equipe"
   - Preencha seus dados

2. **Faça login** com suas credenciais

### Gerenciamento de Times

1. **Criar um novo time**:
   - Acesse seu painel de capitão
   - Clique em "Novo Time"
   - Selecione o jogo (CS2, LOL ou Valorant)
   - Preencha o nome do time
   - Salve o time

2. **Adicionar jogadores**:
   - Acesse a página do time
   - Clique em "Adicionar Jogador"
   - Preencha os dados do jogador
   - Para CS2, inclua Steam ID e ID Gamers Club
   - Salve o jogador

### Inscrição em Campeonatos

1. **Inscrever time em campeonato**:
   - Acesse a aba "Campeonatos"
   - Selecione um campeonato com inscrições abertas
   - Clique em "Inscrever Time"
   - Selecione o time a ser inscrito
   - Confirme a inscrição

## Guia para Jogadores

### Registro para TFT

1. **Registre-se como jogador individual**:
   - Acesse a página inicial
   - Clique em "Registrar"
   - Selecione "Jogador Individual (TFT)"
   - Preencha seus dados (nome, nickname, telefone, CPF)
   - Conclua o registro

2. **Inscrição em campeonatos de TFT**:
   - Faça login com suas credenciais
   - Acesse a aba "Campeonatos"
   - Selecione um campeonato de TFT com inscrições abertas
   - Clique em "Inscrever-se"
   - Confirme a inscrição

## Solução de Problemas

### Problemas de Conexão com o Banco de Dados

- Verifique se a string de conexão está correta no arquivo `.env`
- Confirme se o MongoDB está em execução (se local)
- Verifique as configurações de rede e firewall

### Erros de Autenticação

- Verifique se o JWT_SECRET está configurado corretamente
- Limpe os cookies do navegador e tente novamente
- Verifique se o usuário existe no banco de dados

### Problemas com o Frontend

- Execute `npm run build` na pasta frontend para reconstruir os arquivos estáticos
- Verifique se o proxy está configurado corretamente em `setupProxy.js`
- Limpe o cache do navegador

### Suporte Adicional

Para suporte adicional ou dúvidas, entre em contato com o desenvolvedor.
