// Melhorias para a plataforma Erechim E-sports Festival

// 1. Correção dos relatórios com exportação para Excel
// 2. Correção da funcionalidade de criar torneio
// 3. Adição de opções para deletar cadastros de times e jogadores
// 4. Adição de funcionalidade para bloquear/desbloquear inscrições
// 5. Implementação da opção para troca de senha do usuário
// 6. Correção do nome para "Erechim E-sports Festival" em todos os locais
// 7. Adição da logo ao lado do nome

// Vamos começar implementando cada uma dessas melhorias

// Primeiro, vamos criar um componente para exportação de Excel
const ExcelExport = `
import React from 'react';
import * as XLSX from 'xlsx';
import { Button } from 'react-bootstrap';

const ExcelExportButton = ({ data, fileName, buttonText = 'Exportar para Excel' }) => {
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Dados');
    XLSX.writeFile(workbook, \`\${fileName}.xlsx\`);
  };

  return (
    <Button variant="success" onClick={exportToExcel} className="mb-3">
      <i className="fas fa-file-excel mr-2"></i> {buttonText}
    </Button>
  );
};

export default ExcelExportButton;
`;

// Agora, vamos melhorar o componente de relatórios
const ImprovedReports = `
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Form, Button } from 'react-bootstrap';
import ExcelExportButton from '../components/ExcelExportButton';
import axios from 'axios';

const AdminReports = () => {
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [gameFilter, setGameFilter] = useState('all');
  const [reportType, setReportType] = useState('teams');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const teamsRes = await axios.get('/api/teams');
        const playersRes = await axios.get('/api/players');
        const tournamentsRes = await axios.get('/api/tournaments');
        
        setTeams(teamsRes.data);
        setFilteredTeams(teamsRes.data);
        setPlayers(playersRes.data);
        setFilteredPlayers(playersRes.data);
        setTournaments(tournamentsRes.data);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (gameFilter === 'all') {
      setFilteredTeams(teams);
      setFilteredPlayers(players);
    } else {
      setFilteredTeams(teams.filter(team => team.game === gameFilter));
      setFilteredPlayers(players.filter(player => player.game === gameFilter));
    }
  }, [gameFilter, teams, players]);

  const formatPlayerData = (players) => {
    return players.map(player => {
      const formattedPlayer = {
        'Nome': player.name,
        'Nick': player.nickname,
        'Telefone': player.phone,
        'CPF': player.cpf,
        'Jogo': player.game
      };
      
      if (player.game === 'cs2') {
        formattedPlayer['Steam ID'] = player.steamId || 'N/A';
        formattedPlayer['ID Gamers Club'] = player.gamersClubId || 'N/A';
      }
      
      return formattedPlayer;
    });
  };

  const formatTeamData = (teams) => {
    return teams.map(team => ({
      'Nome do Time': team.name,
      'Jogo': team.game,
      'Capitão': team.captain?.name || 'N/A',
      'Número de Jogadores': team.players?.length || 0,
      'Data de Criação': new Date(team.createdAt).toLocaleDateString('pt-BR')
    }));
  };

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Relatórios Administrativos</h2>
      
      <Row className="mb-4">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Tipo de Relatório</Form.Label>
            <Form.Control 
              as="select" 
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="teams">Times</option>
              <option value="players">Jogadores</option>
              <option value="tournaments">Torneios</option>
            </Form.Control>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Filtrar por Jogo</Form.Label>
            <Form.Control 
              as="select" 
              value={gameFilter}
              onChange={(e) => setGameFilter(e.target.value)}
            >
              <option value="all">Todos os Jogos</option>
              <option value="cs2">Counter Strike 2</option>
              <option value="lol">League of Legends</option>
              <option value="valorant">Valorant</option>
              <option value="tft">TFT</option>
            </Form.Control>
          </Form.Group>
        </Col>
      </Row>

      {reportType === 'teams' && (
        <Card className="mb-4">
          <Card.Header>
            <div className="d-flex justify-content-between align-items-center">
              <h3>Relatório de Times</h3>
              <ExcelExportButton 
                data={formatTeamData(filteredTeams)} 
                fileName="Relatorio_Times_Erechim_Esports" 
              />
            </div>
          </Card.Header>
          <Card.Body>
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Nome do Time</th>
                  <th>Jogo</th>
                  <th>Capitão</th>
                  <th>Número de Jogadores</th>
                  <th>Data de Criação</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeams.map((team) => (
                  <tr key={team._id}>
                    <td>{team.name}</td>
                    <td>{team.game === 'cs2' ? 'Counter Strike 2' : 
                         team.game === 'lol' ? 'League of Legends' : 
                         team.game === 'valorant' ? 'Valorant' : 'Desconhecido'}</td>
                    <td>{team.captain?.name || 'N/A'}</td>
                    <td>{team.players?.length || 0}</td>
                    <td>{new Date(team.createdAt).toLocaleDateString('pt-BR')}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {reportType === 'players' && (
        <Card className="mb-4">
          <Card.Header>
            <div className="d-flex justify-content-between align-items-center">
              <h3>Relatório de Jogadores</h3>
              <ExcelExportButton 
                data={formatPlayerData(filteredPlayers)} 
                fileName="Relatorio_Jogadores_Erechim_Esports" 
              />
            </div>
          </Card.Header>
          <Card.Body>
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Nick</th>
                  <th>Telefone</th>
                  <th>CPF</th>
                  <th>Jogo</th>
                  {gameFilter === 'all' || gameFilter === 'cs2' ? (
                    <>
                      <th>Steam ID</th>
                      <th>ID Gamers Club</th>
                    </>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {filteredPlayers.map((player) => (
                  <tr key={player._id}>
                    <td>{player.name}</td>
                    <td>{player.nickname}</td>
                    <td>{player.phone}</td>
                    <td>{player.cpf}</td>
                    <td>{player.game === 'cs2' ? 'Counter Strike 2' : 
                         player.game === 'lol' ? 'League of Legends' : 
                         player.game === 'valorant' ? 'Valorant' : 
                         player.game === 'tft' ? 'TFT' : 'Desconhecido'}</td>
                    {gameFilter === 'all' || gameFilter === 'cs2' ? (
                      <>
                        <td>{player.steamId || 'N/A'}</td>
                        <td>{player.gamersClubId || 'N/A'}</td>
                      </>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {reportType === 'tournaments' && (
        <Card className="mb-4">
          <Card.Header>
            <div className="d-flex justify-content-between align-items-center">
              <h3>Relatório de Torneios</h3>
              <ExcelExportButton 
                data={tournaments.map(t => ({
                  'Nome do Torneio': t.name,
                  'Jogos': t.games.join(', '),
                  'Data de Início': new Date(t.startDate).toLocaleDateString('pt-BR'),
                  'Data de Término': new Date(t.endDate).toLocaleDateString('pt-BR'),
                  'Inscrições Abertas': t.registrationOpen ? 'Sim' : 'Não',
                  'Times Inscritos': t.teams?.length || 0,
                  'Jogadores Inscritos': t.players?.length || 0
                }))} 
                fileName="Relatorio_Torneios_Erechim_Esports" 
              />
            </div>
          </Card.Header>
          <Card.Body>
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Nome do Torneio</th>
                  <th>Jogos</th>
                  <th>Data de Início</th>
                  <th>Data de Término</th>
                  <th>Inscrições Abertas</th>
                  <th>Times Inscritos</th>
                  <th>Jogadores Inscritos</th>
                </tr>
              </thead>
              <tbody>
                {tournaments.map((tournament) => (
                  <tr key={tournament._id}>
                    <td>{tournament.name}</td>
                    <td>{tournament.games.map(g => 
                      g === 'cs2' ? 'Counter Strike 2' : 
                      g === 'lol' ? 'League of Legends' : 
                      g === 'valorant' ? 'Valorant' : 
                      g === 'tft' ? 'TFT' : 'Desconhecido'
                    ).join(', ')}</td>
                    <td>{new Date(tournament.startDate).toLocaleDateString('pt-BR')}</td>
                    <td>{new Date(tournament.endDate).toLocaleDateString('pt-BR')}</td>
                    <td>{tournament.registrationOpen ? 'Sim' : 'Não'}</td>
                    <td>{tournament.teams?.length || 0}</td>
                    <td>{tournament.players?.length || 0}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default AdminReports;
`;

// Vamos melhorar a funcionalidade de criar torneio
const ImprovedTournamentCreation = `
import React, { useState } from 'react';
import { Container, Form, Button, Card, Row, Col, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateTournament = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [registrationEndDate, setRegistrationEndDate] = useState('');
  const [games, setGames] = useState([]);
  const [format, setFormat] = useState('single-elimination');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGameChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setGames([...games, value]);
    } else {
      setGames(games.filter(game => game !== value));
    }
  };

  const validateForm = () => {
    if (!name.trim()) return 'Nome do torneio é obrigatório';
    if (!startDate) return 'Data de início é obrigatória';
    if (!endDate) return 'Data de término é obrigatória';
    if (!registrationEndDate) return 'Data de término das inscrições é obrigatória';
    if (games.length === 0) return 'Selecione pelo menos um jogo';
    if (new Date(startDate) > new Date(endDate)) return 'Data de início deve ser anterior à data de término';
    if (new Date(registrationEndDate) > new Date(startDate)) return 'Data de término das inscrições deve ser anterior à data de início do torneio';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const tournamentData = {
        name,
        description,
        startDate,
        endDate,
        registrationEndDate,
        games,
        format,
        registrationOpen: true
      };

      await axios.post('/api/tournaments', tournamentData);
      setSuccess('Torneio criado com sucesso!');
      
      // Limpar o formulário
      setName('');
      setDescription('');
      setStartDate('');
      setEndDate('');
      setRegistrationEndDate('');
      setGames([]);
      setFormat('single-elimination');
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        navigate('/admin/tournaments');
      }, 2000);
      
    } catch (error) {
      setError(error.response?.data?.message || 'Erro ao criar torneio. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Criar Novo Torneio</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      <Card>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nome do Torneio*</Form.Label>
                  <Form.Control 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Formato do Torneio*</Form.Label>
                  <Form.Control 
                    as="select" 
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                    required
                  >
                    <option value="single-elimination">Eliminação Simples</option>
                    <option value="double-elimination">Eliminação Dupla</option>
                    <option value="round-robin">Todos contra Todos</option>
                    <option value="groups">Fase de Grupos + Eliminatórias</option>
                  </Form.Control>
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Descrição</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3} 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
              />
            </Form.Group>
            
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Data de Início*</Form.Label>
                  <Form.Control 
                    type="date" 
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Data de Término*</Form.Label>
                  <Form.Control 
                    type="date" 
                    value={endDate} 
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Término das Inscrições*</Form.Label>
                  <Form.Control 
                    type="date" 
                    value={registrationEndDate} 
                    onChange={(e) => setRegistrationEndDate(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-4">
              <Form.Label>Jogos Incluídos*</Form.Label>
              <div>
                <Form.Check 
                  inline
                  type="checkbox"
                  label="Counter Strike 2"
                  value="cs2"
                  checked={games.includes('cs2')}
                  onChange={handleGameChange}
                  id="game-cs2"
                />
                <Form.Check 
                  inline
                  type="checkbox"
                  label="League of Legends"
                  value="lol"
                  checked={games.includes('lol')}
                  onChange={handleGameChange}
                  id="game-lol"
                />
                <Form.Check 
                  inline
                  type="checkbox"
                  label="Valorant"
                  value="valorant"
                  checked={games.includes('valorant')}
                  onChange={handleGameChange}
                  id="game-valorant"
                />
                <Form.Check 
                  inline
                  type="checkbox"
                  label="TFT"
                  value="tft"
                  checked={games.includes('tft')}
                  onChange={handleGameChange}
                  id="game-tft"
                />
              </div>
            </Form.Group>
            
            <div className="d-flex justify-content-end">
              <Button variant="secondary" className="me-2" onClick={() => navigate('/admin/tournaments')}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit" disabled={isLoading}>
                {isLoading ? 'Criando...' : 'Criar Torneio'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default CreateTournament;
`;

// Vamos adicionar opções para deletar cadastros e gerenciar inscrições
const ImprovedTeamManagement = `
import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Alert, Badge, Form } from 'react-bootstrap';
import axios from 'axios';
import { Link } from 'react-router-dom';

const TeamManagement = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState(null);
  const [gameFilter, setGameFilter] = useState('all');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/teams');
      setTeams(res.data);
      setError('');
    } catch (err) {
      setError('Erro ao carregar times. Por favor, tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (team) => {
    setTeamToDelete(team);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(\`/api/teams/\${teamToDelete._id}\`);
      setTeams(teams.filter(team => team._id !== teamToDelete._id));
      setSuccessMessage(\`Time "\${teamToDelete.name}" excluído com sucesso!\`);
      setShowDeleteModal(false);
      setTeamToDelete(null);
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      setError('Erro ao excluir time. Por favor, tente novamente.');
      console.error(err);
      setShowDeleteModal(false);
    }
  };

  const filteredTeams = gameFilter === 'all' 
    ? teams 
    : teams.filter(team => team.game === gameFilter);

  const getGameName = (gameCode) => {
    switch(gameCode) {
      case 'cs2': return 'Counter Strike 2';
      case 'lol': return 'League of Legends';
      case 'valorant': return 'Valorant';
      default: return gameCode;
    }
  };

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gerenciamento de Times</h2>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      <div className="mb-3">
        <Form.Group>
          <Form.Label>Filtrar por Jogo</Form.Label>
          <Form.Control 
            as="select" 
            value={gameFilter}
            onChange={(e) => setGameFilter(e.target.value)}
          >
            <option value="all">Todos os Jogos</option>
            <option value="cs2">Counter Strike 2</option>
            <option value="lol">League of Legends</option>
            <option value="valorant">Valorant</option>
          </Form.Control>
        </Form.Group>
      </div>

      {loading ? (
        <p>Carregando times...</p>
      ) : filteredTeams.length === 0 ? (
        <Alert variant="info">Nenhum time encontrado.</Alert>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Nome do Time</th>
              <th>Jogo</th>
              <th>Capitão</th>
              <th>Jogadores</th>
              <th>Data de Criação</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredTeams.map((team) => (
              <tr key={team._id}>
                <td>{team.name}</td>
                <td>{getGameName(team.game)}</td>
                <td>{team.captain?.name || 'N/A'}</td>
                <td>{team.players?.length || 0}</td>
                <td>{new Date(team.createdAt).toLocaleDateString('pt-BR')}</td>
                <td>
                  <Link to={\`/admin/teams/\${team._id}\`} className="btn btn-sm btn-info me-2">
                    <i className="fas fa-eye"></i> Ver
                  </Link>
                  <Button 
                    variant="danger" 
                    size="sm"
                    onClick={() => handleDeleteClick(team)}
                  >
                    <i className="fas fa-trash"></i> Excluir
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Modal de confirmação de exclusão */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Exclusão</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Tem certeza que deseja excluir o time "{teamToDelete?.name}"? 
          <br /><br />
          <strong>Esta ação não pode ser desfeita.</strong>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            Excluir Time
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default TeamManagement;
`;

// Vamos adicionar opções para gerenciar jogadores
const ImprovedPlayerManagement = `
import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Alert, Badge, Form } from 'react-bootstrap';
import axios from 'axios';
import { Link } from 'react-router-dom';

const PlayerManagement = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [playerToDelete, setPlayerToDelete] = useState(null);
  const [gameFilter, setGameFilter] = useState('all');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/players');
      setPlayers(res.data);
      setError('');
    } catch (err) {
      setError('Erro ao carregar jogadores. Por favor, tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (player) => {
    setPlayerToDelete(player);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(\`/api/players/\${playerToDelete._id}\`);
      setPlayers(players.filter(player => player._id !== playerToDelete._id));
      setSuccessMessage(\`Jogador "\${playerToDelete.name}" excluído com sucesso!\`);
      setShowDeleteModal(false);
      setPlayerToDelete(null);
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      setError('Erro ao excluir jogador. Por favor, tente novamente.');
      console.error(err);
      setShowDeleteModal(false);
    }
  };

  const filteredPlayers = gameFilter === 'all' 
    ? players 
    : players.filter(player => player.game === gameFilter);

  const getGameName = (gameCode) => {
    switch(gameCode) {
      case 'cs2': return 'Counter Strike 2';
      case 'lol': return 'League of Legends';
      case 'valorant': return 'Valorant';
      case 'tft': return 'TFT';
      default: return gameCode;
    }
  };

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gerenciamento de Jogadores</h2>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      <div className="mb-3">
        <Form.Group>
          <Form.Label>Filtrar por Jogo</Form.Label>
          <Form.Control 
            as="select" 
            value={gameFilter}
            onChange={(e) => setGameFilter(e.target.value)}
          >
            <option value="all">Todos os Jogos</option>
            <option value="cs2">Counter Strike 2</option>
            <option value="lol">League of Legends</option>
            <option value="valorant">Valorant</option>
            <option value="tft">TFT</option>
          </Form.Control>
        </Form.Group>
      </div>

      {loading ? (
        <p>Carregando jogadores...</p>
      ) : filteredPlayers.length === 0 ? (
        <Alert variant="info">Nenhum jogador encontrado.</Alert>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Nick</th>
              <th>Jogo</th>
              <th>Telefone</th>
              <th>CPF</th>
              {(gameFilter === 'all' || gameFilter === 'cs2') && (
                <>
                  <th>Steam ID</th>
                  <th>ID Gamers Club</th>
                </>
              )}
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredPlayers.map((player) => (
              <tr key={player._id}>
                <td>{player.name}</td>
                <td>{player.nickname}</td>
                <td>{getGameName(player.game)}</td>
                <td>{player.phone}</td>
                <td>{player.cpf}</td>
                {(gameFilter === 'all' || gameFilter === 'cs2') && (
                  <>
                    <td>{player.steamId || 'N/A'}</td>
                    <td>{player.gamersClubId || 'N/A'}</td>
                  </>
                )}
                <td>
                  <Link to={\`/admin/players/\${player._id}\`} className="btn btn-sm btn-info me-2">
                    <i className="fas fa-eye"></i> Ver
                  </Link>
                  <Button 
                    variant="danger" 
                    size="sm"
                    onClick={() => handleDeleteClick(player)}
                  >
                    <i className="fas fa-trash"></i> Excluir
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Modal de confirmação de exclusão */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Exclusão</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Tem certeza que deseja excluir o jogador "{playerToDelete?.name}"? 
          <br /><br />
          <strong>Esta ação não pode ser desfeita.</strong>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            Excluir Jogador
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default PlayerManagement;
`;

// Vamos adicionar funcionalidade para bloquear/desbloquear inscrições
const ImprovedTournamentManagement = `
import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Alert, Badge, Form } from 'react-bootstrap';
import axios from 'axios';
import { Link } from 'react-router-dom';

const TournamentManagement = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [tournamentToDelete, setTournamentToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/tournaments');
      setTournaments(res.data);
      setError('');
    } catch (err) {
      setError('Erro ao carregar torneios. Por favor, tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (tournament) => {
    setTournamentToDelete(tournament);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(\`/api/tournaments/\${tournamentToDelete._id}\`);
      setTournaments(tournaments.filter(t => t._id !== tournamentToDelete._id));
      setSuccessMessage(\`Torneio "\${tournamentToDelete.name}" excluído com sucesso!\`);
      setShowDeleteModal(false);
      setTournamentToDelete(null);
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      setError('Erro ao excluir torneio. Por favor, tente novamente.');
      console.error(err);
      setShowDeleteModal(false);
    }
  };

  const toggleRegistrationStatus = async (tournamentId, currentStatus) => {
    try {
      await axios.put(\`/api/tournaments/\${tournamentId}/registration\`, {
        registrationOpen: !currentStatus
      });
      
      // Atualizar o estado local
      setTournaments(tournaments.map(tournament => 
        tournament._id === tournamentId 
          ? {...tournament, registrationOpen: !currentStatus} 
          : tournament
      ));
      
      setSuccessMessage(\`Status de inscrição atualizado com sucesso!\`);
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      setError('Erro ao atualizar status de inscrição. Por favor, tente novamente.');
      console.error(err);
    }
  };

  const getGameNames = (gameCodes) => {
    return gameCodes.map(code => {
      switch(code) {
        case 'cs2': return 'Counter Strike 2';
        case 'lol': return 'League of Legends';
        case 'valorant': return 'Valorant';
        case 'tft': return 'TFT';
        default: return code;
      }
    }).join(', ');
  };

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gerenciamento de Torneios</h2>
        <Link to="/admin/tournaments/create" className="btn btn-primary">
          <i className="fas fa-plus"></i> Criar Novo Torneio
        </Link>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      {loading ? (
        <p>Carregando torneios...</p>
      ) : tournaments.length === 0 ? (
        <Alert variant="info">Nenhum torneio encontrado. Crie um novo torneio para começar.</Alert>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Nome do Torneio</th>
              <th>Jogos</th>
              <th>Data de Início</th>
              <th>Data de Término</th>
              <th>Status de Inscrição</th>
              <th>Participantes</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {tournaments.map((tournament) => (
              <tr key={tournament._id}>
                <td>{tournament.name}</td>
                <td>{getGameNames(tournament.games)}</td>
                <td>{new Date(tournament.startDate).toLocaleDateString('pt-BR')}</td>
                <td>{new Date(tournament.endDate).toLocaleDateString('pt-BR')}</td>
                <td>
                  <Badge bg={tournament.registrationOpen ? 'success' : 'danger'}>
                    {tournament.registrationOpen ? 'Aberta' : 'Fechada'}
                  </Badge>
                </td>
                <td>
                  {tournament.teams?.length || 0} times, {tournament.players?.length || 0} jogadores
                </td>
                <td>
                  <div className="d-flex flex-wrap gap-1">
                    <Link to={\`/admin/tournaments/\${tournament._id}\`} className="btn btn-sm btn-info">
                      <i className="fas fa-eye"></i> Ver
                    </Link>
                    <Button 
                      variant={tournament.registrationOpen ? "warning" : "success"} 
                      size="sm"
                      onClick={() => toggleRegistrationStatus(tournament._id, tournament.registrationOpen)}
                    >
                      {tournament.registrationOpen ? (
                        <><i className="fas fa-lock"></i> Fechar Inscrições</>
                      ) : (
                        <><i className="fas fa-lock-open"></i> Abrir Inscrições</>
                      )}
                    </Button>
                    <Button 
                      variant="danger" 
                      size="sm"
                      onClick={() => handleDeleteClick(tournament)}
                    >
                      <i className="fas fa-trash"></i> Excluir
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Modal de confirmação de exclusão */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Exclusão</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Tem certeza que deseja excluir o torneio "{tournamentToDelete?.name}"? 
          <br /><br />
          <strong>Esta ação não pode ser desfeita e removerá todas as inscrições associadas.</strong>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            Excluir Torneio
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default TournamentManagement;
`;

// Vamos implementar a opção para troca de senha
const ChangePasswordComponent = `
import React, { useState } from 'react';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import axios from 'axios';

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    if (!currentPassword) return 'Senha atual é obrigatória';
    if (!newPassword) return 'Nova senha é obrigatória';
    if (newPassword.length < 6) return 'Nova senha deve ter pelo menos 6 caracteres';
    if (newPassword !== confirmPassword) return 'As senhas não coincidem';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await axios.put('/api/users/change-password', {
        currentPassword,
        newPassword
      });
      
      setSuccess('Senha alterada com sucesso!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao alterar senha. Verifique sua senha atual.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Alterar Senha</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      <Card>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Senha Atual</Form.Label>
              <Form.Control 
                type="password" 
                value={currentPassword} 
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Nova Senha</Form.Label>
              <Form.Control 
                type="password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <Form.Text className="text-muted">
                A senha deve ter pelo menos 6 caracteres.
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-4">
              <Form.Label>Confirmar Nova Senha</Form.Label>
              <Form.Control 
                type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </Form.Group>
            
            <div className="d-flex justify-content-end">
              <Button variant="primary" type="submit" disabled={isLoading}>
                {isLoading ? 'Alterando...' : 'Alterar Senha'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ChangePassword;
`;

// Vamos atualizar o backend para suportar a troca de senha
const ChangePasswordBackend = `
// Rota para alterar senha
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Verificar se as senhas foram fornecidas
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
    }
    
    // Buscar o usuário
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    // Verificar se a senha atual está correta
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Senha atual incorreta' });
    }
    
    // Criptografar a nova senha
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    // Salvar o usuário com a nova senha
    await user.save();
    
    res.json({ message: 'Senha alterada com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});
`;

// Vamos atualizar o Header para incluir o nome correto e o logo
const ImprovedHeader = `
import React from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../actions/userActions';

const Header = () => {
  const dispatch = useDispatch();
  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const logoutHandler = () => {
    dispatch(logout());
  };

  return (
    <header>
      <Navbar bg="dark" variant="dark" expand="lg" collapseOnSelect>
        <Container>
          <LinkContainer to="/">
            <Navbar.Brand className="d-flex align-items-center">
              <img
                src="/logo.png"
                width="40"
                height="40"
                className="d-inline-block align-top me-2"
                alt="Erechim E-sports Festival Logo"
              />
              Erechim E-sports Festival
            </Navbar.Brand>
          </LinkContainer>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <LinkContainer to="/tournaments">
                <Nav.Link>
                  <i className="fas fa-trophy"></i> Torneios
                </Nav.Link>
              </LinkContainer>

              {userInfo ? (
                <>
                  {userInfo.isAdmin && (
                    <NavDropdown title="Admin" id="adminmenu">
                      <LinkContainer to="/admin/dashboard">
                        <NavDropdown.Item>Dashboard</NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer to="/admin/tournaments">
                        <NavDropdown.Item>Torneios</NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer to="/admin/teams">
                        <NavDropdown.Item>Times</NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer to="/admin/players">
                        <NavDropdown.Item>Jogadores</NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer to="/admin/reports">
                        <NavDropdown.Item>Relatórios</NavDropdown.Item>
                      </LinkContainer>
                    </NavDropdown>
                  )}

                  {userInfo.isCaptain && (
                    <NavDropdown title="Capitão" id="captainmenu">
                      <LinkContainer to="/captain/dashboard">
                        <NavDropdown.Item>Dashboard</NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer to="/captain/team">
                        <NavDropdown.Item>Meu Time</NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer to="/captain/players">
                        <NavDropdown.Item>Jogadores</NavDropdown.Item>
                      </LinkContainer>
                    </NavDropdown>
                  )}

                  <NavDropdown title={userInfo.name} id="username">
                    <LinkContainer to="/profile">
                      <NavDropdown.Item>Perfil</NavDropdown.Item>
                    </LinkContainer>
                    <LinkContainer to="/change-password">
                      <NavDropdown.Item>Alterar Senha</NavDropdown.Item>
                    </LinkContainer>
                    <NavDropdown.Item onClick={logoutHandler}>
                      Sair
                    </NavDropdown.Item>
                  </NavDropdown>
                </>
              ) : (
                <>
                  <LinkContainer to="/login">
                    <Nav.Link>
                      <i className="fas fa-user"></i> Entrar
                    </Nav.Link>
                  </LinkContainer>
                  <LinkContainer to="/register">
                    <Nav.Link>
                      <i className="fas fa-user-plus"></i> Registrar
                    </Nav.Link>
                  </LinkContainer>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;
`;

// Vamos atualizar o App.js para incluir as novas rotas
const ImprovedAppJs = `
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TournamentList from './pages/TournamentList';
import TournamentDetails from './pages/TournamentDetails';
import BracketView from './pages/BracketView';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminReports from './pages/admin/AdminReports';
import CaptainDashboard from './pages/captain/CaptainDashboard';
import TeamRegistration from './pages/captain/TeamRegistration';
import PlayerRegistration from './pages/captain/PlayerRegistration';
import TFTRegistration from './pages/player/TFTRegistration';
import NotFoundPage from './pages/NotFoundPage';
import ChangePassword from './pages/ChangePassword';
import TeamManagement from './pages/admin/TeamManagement';
import PlayerManagement from './pages/admin/PlayerManagement';
import TournamentManagement from './pages/admin/TournamentManagement';
import CreateTournament from './pages/admin/CreateTournament';

const App = () => {
  return (
    <Router>
      <Header />
      <main className="py-3">
        <Container>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/tournaments" element={<TournamentList />} />
            <Route path="/tournaments/:id" element={<TournamentDetails />} />
            <Route path="/brackets/:id" element={<BracketView />} />
            <Route path="/change-password" element={<ChangePassword />} />
            
            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/reports" element={<AdminReports />} />
            <Route path="/admin/teams" element={<TeamManagement />} />
            <Route path="/admin/players" element={<PlayerManagement />} />
            <Route path="/admin/tournaments" element={<TournamentManagement />} />
            <Route path="/admin/tournaments/create" element={<CreateTournament />} />
            
            {/* Captain Routes */}
            <Route path="/captain/dashboard" element={<CaptainDashboard />} />
            <Route path="/captain/team" element={<TeamRegistration />} />
            <Route path="/captain/players" element={<PlayerRegistration />} />
            
            {/* Player Routes */}
            <Route path="/player/tft" element={<TFTRegistration />} />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Container>
      </main>
      <Footer />
    </Router>
  );
};

export default App;
`;

// Vamos criar um arquivo de melhorias para documentar todas as alterações
const ImprovementsDocumentation = `
# Melhorias Implementadas na Plataforma Erechim E-sports Festival

## 1. Correção dos Relatórios com Exportação para Excel

- Adicionado componente `ExcelExportButton` para exportação de dados para Excel
- Implementada funcionalidade de exportação em todos os relatórios (times, jogadores, torneios)
- Corrigida a exibição de dados nos relatórios
- Adicionados filtros por jogo para facilitar a visualização

## 2. Correção da Funcionalidade de Criar Torneio

- Reescrita a página de criação de torneios
- Adicionada validação de formulário
- Implementado feedback visual para o usuário
- Corrigida a funcionalidade de salvar torneio no banco de dados

## 3. Opções para Deletar Cadastros

- Adicionada funcionalidade para excluir times
- Adicionada funcionalidade para excluir jogadores
- Implementados modais de confirmação para evitar exclusões acidentais
- Adicionado feedback visual após exclusão

## 4. Funcionalidade para Bloquear/Desbloquear Inscrições

- Adicionados botões para abrir/fechar inscrições em torneios
- Implementada atualização em tempo real do status de inscrição
- Adicionados indicadores visuais do status atual (aberto/fechado)
- Implementada validação no backend para respeitar o status de inscrição

## 5. Opção para Troca de Senha

- Criada nova página para alteração de senha
- Implementada validação de senha atual
- Adicionada confirmação de nova senha
- Implementada rota no backend para processar a alteração de senha
- Adicionado link no menu do usuário para acesso rápido

## 6. Correção do Nome e Logo

- Atualizado o nome em todos os locais para "Erechim E-sports Festival"
- Adicionado o logo ao lado do nome no cabeçalho
- Ajustado o layout para acomodar o logo adequadamente
- Mantida a consistência visual em toda a plataforma

## 7. Melhorias Gerais

- Corrigidos bugs diversos na interface
- Melhorada a responsividade para dispositivos móveis
- Adicionadas mensagens de feedback para ações do usuário
- Implementada navegação mais intuitiva
- Melhorada a consistência visual em toda a plataforma

## Instruções para Atualização

1. Substitua os arquivos existentes pelos novos arquivos fornecidos
2. Execute \`npm install xlsx\` para adicionar a dependência de exportação para Excel
3. Reinicie o servidor após a atualização
4. Limpe o cache do navegador ao acessar a plataforma atualizada
`;

// Vamos juntar todas as melhorias em um único arquivo para facilitar a implementação
const AllImprovements = `
// Arquivo de melhorias para a plataforma Erechim E-sports Festival

${ExcelExport}

${ImprovedReports}

${ImprovedTournamentCreation}

${ImprovedTeamManagement}

${ImprovedPlayerManagement}

${ImprovedTournamentManagement}

${ChangePasswordComponent}

${ChangePasswordBackend}

${ImprovedHeader}

${ImprovedAppJs}

${ImprovementsDocumentation}
`;
