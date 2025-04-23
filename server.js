const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./backend/config/db');
const userRoutes = require('./backend/routes/userRoutes');
const teamRoutes = require('./backend/routes/teamRoutes');
const playerRoutes = require('./backend/routes/playerRoutes');
const tournamentRoutes = require('./backend/routes/tournamentRoutes');
const bracketRoutes = require('./backend/routes/bracketRoutes');

// Carregar variáveis de ambiente
dotenv.config();

// Conectar ao banco de dados
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Rotas da API
app.use('/api/users', userRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/brackets', bracketRoutes);

// Servir arquivos estáticos em produção
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '/frontend/build')));

  app.get('*', (req, res) =>
    res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'))
  );
} else {
  app.get('/', (req, res) => {
    res.send('API está rodando...');
  });
}

// Criar o usuário administrador se não existir
const User = require('./backend/models/User');

const createAdminUser = async () => {
  try {
    const adminExists = await User.findOne({ email: 'ddanieltodeschini@gmail.com' });
    
    if (!adminExists) {
      console.log('Criando usuário administrador padrão...');
      await User.create({
        name: 'Administrador',
        email: 'ddanieltodeschini@gmail.com',
        password: 'admin123', // Senha temporária para primeiro acesso
        role: 'admin'
      });
      console.log('Usuário administrador criado com sucesso!');
    }
  } catch (error) {
    console.error('Erro ao criar usuário administrador:', error);
  }
};

// Inicializar o servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT} em modo ${process.env.NODE_ENV}`);
  createAdminUser();
});
