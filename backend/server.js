// Atualizar o arquivo server.js para incluir as novas rotas
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const teamRoutes = require('./routes/teamRoutes');
const playerRoutes = require('./routes/playerRoutes');
const tournamentRoutes = require('./routes/tournamentRoutes');
const bracketRoutes = require('./routes/bracketRoutes');
const path = require('path');

// Conectar ao banco de dados
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Servir arquivos estáticos da pasta public
app.use(express.static(path.join(__dirname, '../public')));

// Rotas
app.use('/api/users', userRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/brackets', bracketRoutes);

// Rota inicial para verificar se o servidor está funcionando
app.get('/', (req, res) => {
  res.json({ message: 'API da Plataforma Erechim E-SPORTS Festival está funcionando!' });
});

// Inicializar o servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// Criar o usuário administrador se não existir
const User = require('./models/User');

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

createAdminUser();
