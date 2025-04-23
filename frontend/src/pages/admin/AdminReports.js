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
