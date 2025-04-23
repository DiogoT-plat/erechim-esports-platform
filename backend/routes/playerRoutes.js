const express = require('express');
const router = express.Router();
const Player = require('../models/Player');
const Team = require('../models/Team');
const User = require('../models/User');
const { protect, captain, admin } = require('../middleware/authMiddleware');

// @desc    Criar um novo jogador
// @route   POST /api/players
// @access  Private/Captain ou Player (para TFT)
router.post('/', protect, async (req, res) => {
  try {
    const { name, nickname, phone, cpf, game, teamId, steamId, gamersClubId } = req.body;

    // Verificar se o jogo é válido
    if (!['CS2', 'LOL', 'Valorant', 'TFT'].includes(game)) {
      return res.status(400).json({ message: 'Jogo inválido' });
    }

    // Verificar campos obrigatórios específicos para cada jogo
    if (game === 'CS2' && (!steamId || !gamersClubId)) {
      return res.status(400).json({ 
        message: 'Para CS2, Steam ID e ID Gamers Club são obrigatórios' 
      });
    }

    // Para jogos em equipe, verificar se o usuário é capitão e se o time existe
    if (game !== 'TFT') {
      if (!teamId) {
        return res.status(400).json({ message: 'ID do time é obrigatório para jogos em equipe' });
      }

      const team = await Team.findById(teamId);
      if (!team) {
        return res.status(404).json({ message: 'Time não encontrado' });
      }

      // Verificar se o usuário é o capitão do time ou admin
      if (team.captain.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(401).json({ 
          message: 'Não autorizado, apenas o capitão pode adicionar jogadores ao time' 
        });
      }

      // Verificar se o jogo do time corresponde ao jogo do jogador
      if (team.game !== game) {
        return res.status(400).json({ 
          message: `Este time é de ${team.game}, não é possível adicionar jogadores de ${game}` 
        });
      }
    } else {
      // Para TFT, qualquer jogador pode se cadastrar
      if (req.user.role !== 'admin' && req.user.role !== 'player') {
        return res.status(401).json({ 
          message: 'Não autorizado para cadastrar jogador de TFT' 
        });
      }
    }

    // Criar o jogador
    const player = await Player.create({
      user: req.user._id,
      name,
      nickname,
      phone,
      cpf,
      game,
      team: game !== 'TFT' ? teamId : undefined,
      steamId: game === 'CS2' ? steamId : undefined,
      gamersClubId: game === 'CS2' ? gamersClubId : undefined
    });

    if (player) {
      // Se for um jogo em equipe, adicionar o jogador ao time
      if (game !== 'TFT') {
        await Team.findByIdAndUpdate(
          teamId,
          { $push: { players: player._id } }
        );
      }

      res.status(201).json(player);
    } else {
      res.status(400).json({ message: 'Dados de jogador inválidos' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// @desc    Obter todos os jogadores
// @route   GET /api/players
// @access  Private/Admin
router.get('/', protect, async (req, res) => {
  try {
    let players;
    const { game, teamId } = req.query;
    
    // Filtros para a consulta
    let filter = {};
    
    if (game) {
      filter.game = game;
    }
    
    if (teamId) {
      filter.team = teamId;
    }
    
    // Se for admin, retorna todos os jogadores com filtros
    if (req.user.role === 'admin') {
      players = await Player.find(filter)
        .populate('user', 'name email')
        .populate('team', 'name game');
    } else if (req.user.role === 'captain') {
      // Se for capitão, retorna apenas os jogadores dos times dele
      const teams = await Team.find({ captain: req.user._id });
      const teamIds = teams.map(team => team._id);
      
      players = await Player.find({ 
        ...filter,
        team: { $in: teamIds } 
      })
        .populate('user', 'name email')
        .populate('team', 'name game');
    } else {
      // Se for jogador normal, retorna apenas seus próprios dados
      players = await Player.find({ 
        ...filter,
        user: req.user._id 
      })
        .populate('user', 'name email')
        .populate('team', 'name game');
    }
    
    res.json(players);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// @desc    Obter um jogador pelo ID
// @route   GET /api/players/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const player = await Player.findById(req.params.id)
      .populate('user', 'name email')
      .populate('team', 'name game captain');
    
    if (player) {
      // Verificar se o usuário é admin, o próprio jogador, ou o capitão do time
      const isAdmin = req.user.role === 'admin';
      const isOwnPlayer = player.user._id.toString() === req.user._id.toString();
      const isCaptain = player.team && player.team.captain && 
                        player.team.captain.toString() === req.user._id.toString();
      
      if (isAdmin || isOwnPlayer || isCaptain) {
        res.json(player);
      } else {
        res.status(401).json({ message: 'Não autorizado' });
      }
    } else {
      res.status(404).json({ message: 'Jogador não encontrado' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// @desc    Atualizar um jogador
// @route   PUT /api/players/:id
// @access  Private/Captain ou Admin
router.put('/:id', protect, async (req, res) => {
  try {
    const player = await Player.findById(req.params.id)
      .populate('team', 'captain game');
    
    if (player) {
      // Verificar se o usuário é admin ou o capitão do time
      const isAdmin = req.user.role === 'admin';
      const isCaptain = player.team && 
                        player.team.captain.toString() === req.user._id.toString();
      
      if (!isAdmin && !isCaptain) {
        return res.status(401).json({ 
          message: 'Não autorizado, apenas o capitão ou administrador pode atualizar o jogador' 
        });
      }
      
      // Atualizar campos
      player.name = req.body.name || player.name;
      player.nickname = req.body.nickname || player.nickname;
      player.phone = req.body.phone || player.phone;
      
      // Campos específicos para CS2
      if (player.game === 'CS2') {
        player.steamId = req.body.steamId || player.steamId;
        player.gamersClubId = req.body.gamersClubId || player.gamersClubId;
      }
      
      const updatedPlayer = await player.save();
      res.json(updatedPlayer);
    } else {
      res.status(404).json({ message: 'Jogador não encontrado' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// @desc    Excluir um jogador
// @route   DELETE /api/players/:id
// @access  Private/Admin ou Captain
router.delete('/:id', protect, async (req, res) => {
  try {
    const player = await Player.findById(req.params.id)
      .populate('team', 'captain');
    
    if (player) {
      // Verificar se o usuário é admin ou o capitão do time
      const isAdmin = req.user.role === 'admin';
      const isCaptain = player.team && 
                        player.team.captain.toString() === req.user._id.toString();
      
      if (isAdmin || isCaptain) {
        // Se o jogador pertence a um time, remover a referência do time
        if (player.team) {
          await Team.findByIdAndUpdate(
            player.team._id,
            { $pull: { players: player._id } }
          );
        }
        
        await player.remove();
        res.json({ message: 'Jogador removido' });
      } else {
        res.status(401).json({ message: 'Não autorizado' });
      }
    } else {
      res.status(404).json({ message: 'Jogador não encontrado' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

module.exports = router;
