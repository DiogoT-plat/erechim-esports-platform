const express = require('express');
const router = express.Router();
const Bracket = require('../models/Bracket');
const Tournament = require('../models/Tournament');
const Team = require('../models/Team');
const Player = require('../models/Player');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Criar um novo chaveamento
// @route   POST /api/brackets
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const { tournamentId, game, name, type } = req.body;
    
    if (!tournamentId || !game || !name || !type) {
      return res.status(400).json({ 
        message: 'Todos os campos são obrigatórios (tournamentId, game, name, type)' 
      });
    }
    
    const tournament = await Tournament.findById(tournamentId);
    
    if (!tournament) {
      return res.status(404).json({ message: 'Torneio não encontrado' });
    }
    
    // Verificar se o jogo está incluído no torneio
    if (!tournament.games.includes(game)) {
      return res.status(400).json({ 
        message: `Este torneio não inclui o jogo ${game}` 
      });
    }
    
    // Verificar se já existe um chaveamento para este jogo no torneio
    const existingBracket = await Bracket.findOne({ 
      tournament: tournamentId,
      game
    });
    
    if (existingBracket) {
      return res.status(400).json({ 
        message: `Já existe um chaveamento para ${game} neste torneio` 
      });
    }
    
    // Criar o chaveamento
    const bracket = await Bracket.create({
      tournament: tournamentId,
      game,
      name,
      type,
      status: 'pending',
      rounds: []
    });
    
    if (bracket) {
      // Adicionar o chaveamento ao torneio
      tournament.brackets.push(bracket._id);
      await tournament.save();
      
      res.status(201).json(bracket);
    } else {
      res.status(400).json({ message: 'Dados de chaveamento inválidos' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// @desc    Obter todos os chaveamentos
// @route   GET /api/brackets
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { tournamentId, game } = req.query;
    
    // Filtros para a consulta
    let filter = {};
    
    if (tournamentId) {
      filter.tournament = tournamentId;
    }
    
    if (game) {
      filter.game = game;
    }
    
    const brackets = await Bracket.find(filter)
      .populate('tournament', 'name')
      .sort({ createdAt: -1 });
    
    res.json(brackets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// @desc    Obter um chaveamento pelo ID
// @route   GET /api/brackets/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const bracket = await Bracket.findById(req.params.id)
      .populate('tournament', 'name status')
      .populate({
        path: 'rounds.matches.participant1.id',
        select: 'name nickname'
      })
      .populate({
        path: 'rounds.matches.participant2.id',
        select: 'name nickname'
      })
      .populate({
        path: 'rounds.matches.winner',
        select: 'name nickname'
      })
      .populate({
        path: 'rounds.matches.result.submittedBy',
        select: 'name email role'
      });
    
    if (bracket) {
      res.json(bracket);
    } else {
      res.status(404).json({ message: 'Chaveamento não encontrado' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// @desc    Gerar chaveamento automaticamente
// @route   POST /api/brackets/:id/generate
// @access  Private/Admin
router.post('/:id/generate', protect, admin, async (req, res) => {
  try {
    const bracket = await Bracket.findById(req.params.id)
      .populate('tournament');
    
    if (!bracket) {
      return res.status(404).json({ message: 'Chaveamento não encontrado' });
    }
    
    const tournament = bracket.tournament;
    
    // Verificar se o torneio está em andamento
    if (tournament.status !== 'ongoing') {
      return res.status(400).json({ 
        message: 'O torneio precisa estar em andamento para gerar o chaveamento' 
      });
    }
    
    // Obter participantes (times ou jogadores) para este jogo
    let participants = [];
    
    if (bracket.game === 'TFT') {
      // Para TFT, os participantes são jogadores individuais
      participants = await Player.find({
        _id: { $in: tournament.players },
        game: 'TFT'
      }).select('_id name nickname');
      
      // Mapear para o formato necessário
      participants = participants.map(player => ({
        type: 'player',
        id: player._id
      }));
    } else {
      // Para outros jogos, os participantes são times
      participants = await Team.find({
        _id: { $in: tournament.teams },
        game: bracket.game
      }).select('_id name');
      
      // Mapear para o formato necessário
      participants = participants.map(team => ({
        type: 'team',
        id: team._id
      }));
    }
    
    // Verificar se há participantes suficientes
    if (participants.length < 2) {
      return res.status(400).json({ 
        message: 'Não há participantes suficientes para gerar o chaveamento' 
      });
    }
    
    // Embaralhar os participantes
    for (let i = participants.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [participants[i], participants[j]] = [participants[j], participants[i]];
    }
    
    // Gerar o chaveamento de acordo com o tipo
    let rounds = [];
    
    if (bracket.type === 'single_elimination') {
      // Calcular o número de rounds necessários
      const numRounds = Math.ceil(Math.log2(participants.length));
      
      // Calcular o número de partidas no primeiro round
      const numFirstRoundMatches = Math.pow(2, numRounds - 1);
      
      // Criar o primeiro round
      const firstRound = {
        roundNumber: 1,
        matches: []
      };
      
      // Adicionar partidas ao primeiro round
      for (let i = 0; i < numFirstRoundMatches; i++) {
        if (i < participants.length / 2) {
          // Partida com dois participantes
          firstRound.matches.push({
            matchNumber: i + 1,
            participant1: participants[i * 2],
            participant2: participants[i * 2 + 1] || null,
            status: 'pending'
          });
        } else {
          // Partida vazia (bye)
          firstRound.matches.push({
            matchNumber: i + 1,
            participant1: null,
            participant2: null,
            status: 'pending'
          });
        }
      }
      
      rounds.push(firstRound);
      
      // Criar os rounds subsequentes
      for (let i = 2; i <= numRounds; i++) {
        const numMatches = Math.pow(2, numRounds - i);
        const round = {
          roundNumber: i,
          matches: []
        };
        
        for (let j = 0; j < numMatches; j++) {
          round.matches.push({
            matchNumber: j + 1,
            participant1: null,
            participant2: null,
            status: 'pending'
          });
        }
        
        rounds.push(round);
      }
    } else if (bracket.type === 'round_robin') {
      // Para round robin, cada participante joga contra todos os outros
      const round = {
        roundNumber: 1,
        matches: []
      };
      
      let matchNumber = 1;
      
      for (let i = 0; i < participants.length; i++) {
        for (let j = i + 1; j < participants.length; j++) {
          round.matches.push({
            matchNumber: matchNumber++,
            participant1: participants[i],
            participant2: participants[j],
            status: 'pending'
          });
        }
      }
      
      rounds.push(round);
    } else if (bracket.type === 'groups') {
      // Para fase de grupos, dividir os participantes em grupos de 4
      const numGroups = Math.ceil(participants.length / 4);
      
      for (let i = 0; i < numGroups; i++) {
        const groupParticipants = participants.slice(i * 4, (i + 1) * 4);
        const round = {
          roundNumber: i + 1,
          matches: []
        };
        
        let matchNumber = 1;
        
        for (let j = 0; j < groupParticipants.length; j++) {
          for (let k = j + 1; k < groupParticipants.length; k++) {
            round.matches.push({
              matchNumber: matchNumber++,
              participant1: groupParticipants[j],
              participant2: groupParticipants[k],
              status: 'pending'
            });
          }
        }
        
        rounds.push(round);
      }
    }
    
    // Atualizar o chaveamento
    bracket.rounds = rounds;
    bracket.status = 'active';
    
    await bracket.save();
    
    res.json({ message: 'Chaveamento gerado com sucesso', bracket });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// @desc    Atualizar resultado de uma partida
// @route   PUT /api/brackets/:id/match/:roundNumber/:matchNumber
// @access  Private/Admin ou Captain
router.put('/:id/match/:roundNumber/:matchNumber', protect, async (req, res) => {
  try {
    const { score1, score2 } = req.body;
    
    if (score1 === undefined || score2 === undefined) {
      return res.status(400).json({ message: 'Pontuações são obrigatórias' });
    }
    
    const bracket = await Bracket.findById(req.params.id);
    
    if (!bracket) {
      return res.status(404).json({ message: 'Chaveamento não encontrado' });
    }
    
    const roundNumber = parseInt(req.params.roundNumber);
    const matchNumber = parseInt(req.params.matchNumber);
    
    // Encontrar o round
    const roundIndex = bracket.rounds.findIndex(r => r.roundNumber === roundNumber);
    
    if (roundIndex === -1) {
      return res.status(404).json({ message: 'Round não encontrado' });
    }
    
    // Encontrar a partida
    const matchIndex = bracket.rounds[roundIndex].matches.findIndex(m => m.matchNumber === matchNumber);
    
    if (matchIndex === -1) {
      return res.status(404).json({ message: 'Partida não encontrada' });
    }
    
    const match = bracket.rounds[roundIndex].matches[matchIndex];
    
    // Verificar se a partida tem participantes
    if (!match.participant1 || !match.participant2) {
      return res.status(400).json({ message: 'Partida incompleta, sem participantes' });
    }
    
    // Verificar se o usuário é admin ou capitão de um dos times
    const isAdmin = req.user.role === 'admin';
    let isCaptain = false;
    
    if (match.participant1.type === 'team') {
      const team1 = await Team.findById(match.participant1.id);
      if (team1 && team1.captain.toString() === req.user._id.toString()) {
        isCaptain = true;
      }
    }
    
    if (match.participant2.type === 'team') {
      const team2 = await Team.findById(match.participant2.id);
      if (team2 && team2.captain.toString() === req.user._id.toString()) {
        isCaptain = true;
      }
    }
    
    if (!isAdmin && !isCaptain) {
      return res.status(401).json({ 
        message: 'Não autorizado, apenas administradores ou capitães podem atualizar resultados' 
      });
    }
    
    // Atualizar pontuações
    match.participant1.score = score1;
    match.participant2.score = score2;
    
    // Determinar o vencedor
    if (score1 > score2) {
      match.winner = match.participant1.id;
      match.winnerType = match.participant1.type === 'team' ? 'Team' : 'Player';
    } else if (score2 > score1) {
      match.winner = match.participant2.id;
      match.winnerType = match.participant2.type === 'team' ? 'Team' : 'Player';
    } else {
      match.winner = null;
      match.winnerType = null;
    }
    
    // Atualizar status da partida
    match.status = 'completed';
    
    // Registrar quem submeteu o resultado
    match.result = {
      submittedBy: req.user._id,
      submittedAt: Date.now(),
      notes: req.body.notes || ''
    };
    
    // Se for eliminação simples, atualizar a próxima partida
    if (bracket.type === 'single_elimination' && match.winner) {
      // Verificar se há próximo round
      if (roundNumber < bracket.rounds.length) {
        const nextRoundIndex = bracket.rounds.findIndex(r => r.roundNumber === roundNumber + 1);
        
        if (nextRoundIndex !== -1) {
          // Calcular o índice da próxima partida
          const nextMatchIndex = Math.floor((matchNumber - 1) / 2);
          
          // Verificar se a próxima partida existe
          if (nextMatchIndex < bracket.rounds[nextRoundIndex].matches.length) {
            const nextMatch = bracket.rounds[nextRoundIndex].matches[nextMatchIndex];
            
            // Determinar se o vencedor vai para participant1 ou participant2
            if (matchNumber % 2 === 1) {
              nextMatch.participant1 = {
                type: match.participant1.type,
                id: match.winner,
                score: 0
              };
            } else {
              nextMatch.participant2 = {
                type: match.participant2.type,
                id: match.winner,
                score: 0
              };
            }
          }
        }
      }
    }
    
    await bracket.save();
    
    res.json({ message: 'Resultado atualizado com sucesso', match });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

module.exports = router;
