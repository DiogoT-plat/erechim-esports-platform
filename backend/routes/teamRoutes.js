const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const User = require('../models/User');
const { protect, captain, admin } = require('../middleware/authMiddleware');

// @desc    Criar um novo time
// @route   POST /api/teams
// @access  Private/Captain
router.post('/', protect, captain, async (req, res) => {
  try {
    const { name, game } = req.body;

    // Verificar se o usuário já é capitão de um time para este jogo
    const existingTeam = await Team.findOne({ 
      captain: req.user._id,
      game
    });

    if (existingTeam) {
      return res.status(400).json({ 
        message: `Você já é capitão de um time de ${game}. Não é possível criar múltiplos times para o mesmo jogo.` 
      });
    }

    const team = await Team.create({
      name,
      game,
      captain: req.user._id
    });

    if (team) {
      res.status(201).json(team);
    } else {
      res.status(400).json({ message: 'Dados de time inválidos' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// @desc    Obter todos os times
// @route   GET /api/teams
// @access  Private/Admin
router.get('/', protect, async (req, res) => {
  try {
    let teams;
    
    // Se for admin, retorna todos os times
    if (req.user.role === 'admin') {
      teams = await Team.find({})
        .populate('captain', 'name email')
        .populate('players');
    } else {
      // Se for capitão, retorna apenas os times dele
      teams = await Team.find({ captain: req.user._id })
        .populate('captain', 'name email')
        .populate('players');
    }
    
    res.json(teams);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// @desc    Obter um time pelo ID
// @route   GET /api/teams/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('captain', 'name email')
      .populate('players');
    
    if (team) {
      // Verificar se o usuário é admin ou o capitão do time
      if (req.user.role === 'admin' || team.captain._id.toString() === req.user._id.toString()) {
        res.json(team);
      } else {
        res.status(401).json({ message: 'Não autorizado' });
      }
    } else {
      res.status(404).json({ message: 'Time não encontrado' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// @desc    Atualizar um time
// @route   PUT /api/teams/:id
// @access  Private/Captain
router.put('/:id', protect, captain, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    
    if (team) {
      // Verificar se o usuário é o capitão do time
      if (team.captain.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(401).json({ message: 'Não autorizado, apenas o capitão pode atualizar o time' });
      }
      
      team.name = req.body.name || team.name;
      
      const updatedTeam = await team.save();
      res.json(updatedTeam);
    } else {
      res.status(404).json({ message: 'Time não encontrado' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// @desc    Excluir um time
// @route   DELETE /api/teams/:id
// @access  Private/Admin ou Captain
router.delete('/:id', protect, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    
    if (team) {
      // Verificar se o usuário é admin ou o capitão do time
      if (req.user.role === 'admin' || team.captain.toString() === req.user._id.toString()) {
        await team.remove();
        res.json({ message: 'Time removido' });
      } else {
        res.status(401).json({ message: 'Não autorizado' });
      }
    } else {
      res.status(404).json({ message: 'Time não encontrado' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

module.exports = router;
