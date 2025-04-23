import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Button, Alert, Tabs, Tab, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faUserPlus, faTrophy } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const CaptainDashboard = () => {
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Obter token do localStorage
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        
        // Buscar times, jogadores e torneios
        const [teamsRes, tournamentsRes] = await Promise.all([
          axios.get('/api/teams', config),
          axios.get('/api/tournaments')
        ]);
        
        setTeams(teamsRes.data);
        setTournaments(tournamentsRes.data);
        
        // Buscar jogadores para cada time
        if (teamsRes.data.length > 0) {
          const playersPromises = teamsRes.data.map(team => 
            axios.get(`/api/players?teamId=${team._id}`, config)
          );
          
          const playersResponses = await Promise.all(playersPromises);
          const allPlayers = playersResponses.flatMap(res => res.data);
          
          setPlayers(allPlayers);
        }
      } catch (error) {
        setError(
          error.response && error.response.data.message
            ? error.response.data.message
            : 'Erro ao carregar dados. Tente novamente.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <h1 className="mb-4 gradient-text">Painel do Capitão</h1>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {loading ? (
        <div className="text-center py-5 loading">Carregando dados...</div>
      ) : (
        <>
          {/* Dashboard Summary */}
          <Row className="mb-4">
            <Col md={4} className="mb-3">
              <Card className="text-center h-100">
                <Card.Body>
                  <FontAwesomeIcon icon={faUsers} size="3x" className="mb-3 gradient-text" />
                  <Card.Title>Meus Times</Card.Title>
                  <h2>{teams.length}</h2>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-3">
              <Card className="text-center h-100">
                <Card.Body>
                  <FontAwesomeIcon icon={faUserPlus} size="3x" className="mb-3 gradient-text" />
                  <Card.Title>Jogadores</Card.Title>
                  <h2>{players.length}</h2>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-3">
              <Card className="text-center h-100">
                <Card.Body>
                  <FontAwesomeIcon icon={faTrophy} size="3x" className="mb-3 gradient-text" />
                  <Card.Title>Campeonatos Disponíveis</Card.Title>
                  <h2>{tournaments.filter(t => t.status === 'registration').length}</h2>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          {/* Main Content */}
          <Tabs defaultActiveKey="teams" className="mb-4">
            <Tab eventKey="teams" title="Meus Times">
              {teams.length > 0 ? (
                <Card>
                  <Card.Header className="gradient-bg text-white">
                    <h5 className="mb-0">Times Cadastrados</h5>
                  </Card.Header>
                  <Card.Body>
                    <div className="table-responsive">
                      <Table striped hover>
                        <thead>
                          <tr>
                            <th>Nome do Time</th>
                            <th>Jogo</th>
                            <th>Jogadores</th>
                            <th>Data de Cadastro</th>
                            <th>Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {teams.map((team) => (
                            <tr key={team._id}>
                              <td>{team.name}</td>
                              <td>{team.game}</td>
                              <td>{team.players?.length || 0} / 5</td>
                              <td>{new Date(team.createdAt).toLocaleDateString('pt-BR')}</td>
                              <td>
                                <Button 
                                  variant="outline-primary" 
                                  size="sm"
                                  className="me-2"
                                  href={`/captain/team/${team._id}`}
                                >
                                  Detalhes
                                </Button>
                                <Button 
                                  variant="outline-success" 
                                  size="sm"
                                  href={`/captain/player/register?teamId=${team._id}`}
                                >
                                  Adicionar Jogador
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                    <div className="d-flex justify-content-end mt-3">
                      <Button className="btn-gradient" href="/captain/team/register">
                        Cadastrar Novo Time
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              ) : (
                <Card>
                  <Card.Body className="text-center py-5">
                    <h4>Você ainda não possui times cadastrados</h4>
                    <p>Cadastre seu primeiro time para participar dos campeonatos</p>
                    <Button className="btn-gradient mt-3" href="/captain/team/register">
                      Cadastrar Time
                    </Button>
                  </Card.Body>
                </Card>
              )}
            </Tab>
            
            <Tab eventKey="players" title="Jogadores">
              {players.length > 0 ? (
                <Card>
                  <Card.Header className="gradient-bg text-white">
                    <h5 className="mb-0">Jogadores Cadastrados</h5>
                  </Card.Header>
                  <Card.Body>
                    <div className="table-responsive">
                      <Table striped hover>
                        <thead>
                          <tr>
                            <th>Nome</th>
                            <th>Nickname</th>
                            <th>Time</th>
                            <th>Jogo</th>
                            <th>Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {players.map((player) => (
                            <tr key={player._id}>
                              <td>{player.name}</td>
                              <td>{player.nickname}</td>
                              <td>{teams.find(t => t._id === player.team)?.name || '-'}</td>
                              <td>{player.game}</td>
                              <td>
                                <Button 
                                  variant="outline-primary" 
                                  size="sm"
                                  href={`/captain/player/${player._id}`}
                                >
                                  Editar
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </Card.Body>
                </Card>
              ) : (
                <Card>
                  <Card.Body className="text-center py-5">
                    <h4>Você ainda não possui jogadores cadastrados</h4>
                    <p>Adicione jogadores aos seus times para participar dos campeonatos</p>
                    {teams.length > 0 ? (
                      <Button className="btn-gradient mt-3" href="/captain/player/register">
                        Cadastrar Jogador
                      </Button>
                    ) : (
                      <Button className="btn-gradient mt-3" href="/captain/team/register">
                        Cadastrar Time Primeiro
                      </Button>
                    )}
                  </Card.Body>
                </Card>
              )}
            </Tab>
            
            <Tab eventKey="tournaments" title="Campeonatos">
              <Card>
                <Card.Header className="gradient-bg text-white">
                  <h5 className="mb-0">Campeonatos Disponíveis</h5>
                </Card.Header>
                <Card.Body>
                  <div className="table-responsive">
                    <Table striped hover>
                      <thead>
                        <tr>
                          <th>Nome</th>
                          <th>Jogos</th>
                          <th>Status</th>
                          <th>Data de Início</th>
                          <th>Inscrições até</th>
                          <th>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tournaments.map((tournament) => (
                          <tr key={tournament._id}>
                            <td>{tournament.name}</td>
                            <td>{tournament.games.join(', ')}</td>
                            <td>
                              {tournament.status === 'draft' && 'Em preparação'}
                              {tournament.status === 'registration' && 'Inscrições abertas'}
                              {tournament.status === 'ongoing' && 'Em andamento'}
                              {tournament.status === 'completed' && 'Finalizado'}
                            </td>
                            <td>{new Date(tournament.startDate).toLocaleDateString('pt-BR')}</td>
                            <td>{new Date(tournament.registrationDeadline).toLocaleDateString('pt-BR')}</td>
                            <td>
                              <Button 
                                variant="outline-primary" 
                                size="sm"
                                className="me-2"
                                href={`/tournaments/${tournament._id}`}
                              >
                                Ver
                              </Button>
                              {tournament.status === 'registration' && (
                                <Button 
                                  variant="outline-success" 
                                  size="sm"
                                  href={`/captain/tournament/${tournament._id}/register`}
                                >
                                  Inscrever
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            </Tab>
          </Tabs>
        </>
      )}
    </>
  );
};

export default CaptainDashboard;
