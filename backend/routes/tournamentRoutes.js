const express = require('express');
const router = express.Router();
const Tournament = require('../models/Tournament');
const Bracket = require('../models/Bracket');
const Team = require('../models/Team');
const Player = require('../models/Player');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Criar um novo torneio
// @route   POST /api/tournaments
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const { name, description, games, startDate, endDate, registrationDeadline } = req.body;

    const tournament = await Tournament.create({
      name,
      description,
      games,
      startDate,
      endDate,
      registrationDeadline,
      status: 'draft',
      createdBy: req.user._id
    });

    if (tournament) {
      res.status(201).json(tournament);
    } else {
      res.status(400).json({ message: 'Dados de torneio inválidos' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// @desc    Obter todos os torneios
// @route   GET /api/tournaments
// @access  Public
router.get('/', async (req, res) => {
  try {
    const tournaments = await Tournament.find({})
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    
    res.json(tournaments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// @desc    Obter um torneio pelo ID
// @route   GET /api/tournaments/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate({
        path: 'teams',
        populate: {
          path: 'captain',
          select: 'name email'
        }
      })
      .populate('players', 'name nickname game')
      .populate('brackets');
    
    if (tournament) {
      res.json(tournament);
    } else {
      res.status(404).json({ message: 'Torneio não encontrado' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// @desc    Atualizar um torneio
// @route   PUT /api/tournaments/:id
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    
    if (tournament) {
      tournament.name = req.body.name || tournament.name;
      tournament.description = req.body.description || tournament.description;
      tournament.games = req.body.games || tournament.games;
      tournament.startDate = req.body.startDate || tournament.startDate;
      tournament.endDate = req.body.endDate || tournament.endDate;
      tournament.registrationDeadline = req.body.registrationDeadline || tournament.registrationDeadline;
      tournament.status = req.body.status || tournament.status;
      
      const updatedTournament = await tournament.save();
      res.json(updatedTournament);
    } else {
      res.status(404).json({ message: 'Torneio não encontrado' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// @desc    Excluir um torneio
// @route   DELETE /api/tournaments/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    
    if (tournament) {
      // Remover todos os brackets associados
      await Bracket.deleteMany({ tournament: tournament._id });
      
      await tournament.remove();
      res.json({ message: 'Torneio removido' });
    } else {
      res.status(404).json({ message: 'Torneio não encontrado' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// @desc    Inscrever um time em um torneio
// @route   POST /api/tournaments/:id/register-team
// @access  Private/Captain
router.post('/:id/register-team', protect, async (req, res) => {
  try {
    const { teamId } = req.body;
    
    if (!teamId) {
      return res.status(400).json({ message: 'ID do time é obrigatório' });
    }
    
    const tournament = await Tournament.findById(req.params.id);
    
    if (!tournament) {
      return res.status(404).json({ message: 'Torneio não encontrado' });
    }
    
    // Verificar se o torneio está em fase de inscrição
    if (tournament.status !== 'registration') {
      return res.status(400).json({ message: 'Inscrições não estão abertas para este torneio' });
    }
    
    const team = await Team.findById(teamId);
    
    if (!team) {
      return res.status(404).json({ message: 'Time não encontrado' });
    }
    
    // Verificar se o usuário é o capitão do time
    if (team.captain.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Não autorizado, apenas o capitão pode inscrever o time' });
    }
    
    // Verificar se o jogo do time está incluído no torneio
    if (!tournament.games.includes(team.game)) {
      return res.status(400).json({ 
        message: `Este torneio não inclui o jogo ${team.game}` 
      });
    }
    
    // Verificar se o time já está inscrito
    if (tournament.teams.includes(teamId)) {
      return res.status(400).json({ message: 'Time já inscrito neste torneio' });
    }
    
    // Adicionar o time ao torneio
    tournament.teams.push(teamId);
    await tournament.save();
    
    // Adicionar o torneio ao time
    team.tournaments.push(tournament._id);
    await team.save();
    
    res.json({ message: 'Time inscrito com sucesso', tournament });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// @desc    Inscrever um jogador individual (TFT) em um torneio
// @route   POST /api/tournaments/:id/register-player
// @access  Private
router.post('/:id/register-player', protect, async (req, res) => {
  try {
    const { playerId } = req.body;
    
    if (!playerId) {
      return res.status(400).json({ message: 'ID do jogador é obrigatório' });
    }
    
    const tournament = await Tournament.findById(req.params.id);
    
    if (!tournament) {
      return res.status(404).json({ message: 'Torneio não encontrado' });
    }
    
    // Verificar se o torneio está em fase de inscrição
    if (tournament.status !== 'registration') {
      return res.status(400).json({ message: 'Inscrições não estão abertas para este torneio' });
    }
    
    const player = await Player.findById(playerId);
    
    if (!player) {
      return res.status(404).json({ message: 'Jogador não encontrado' });
    }
    
    // Verificar se o usuário é o próprio jogador ou admin
    if (player.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Não autorizado' });
    }
    
    // Verificar se o jogo do jogador é TFT e está incluído no torneio
    if (player.game !== 'TFT' || !tournament.games.includes('TFT')) {
      return res.status(400).json({ 
        message: 'Este torneio não aceita inscrições individuais ou não inclui TFT' 
      });
    }
    
    // Verificar se o jogador já está inscrito
    if (tournament.players.includes(playerId)) {
      return res.status(400).json({ message: 'Jogador já inscrito neste torneio' });
    }
    
    // Adicionar o jogador ao torneio
    tournament.players.push(playerId);
    await tournament.save();
    
    res.json({ message: 'Jogador inscrito com sucesso', tournament });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

module.exports = router;
