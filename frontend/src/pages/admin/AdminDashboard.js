import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Button, Alert, Tabs, Tab } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faUserPlus, faTrophy, faChartBar } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
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
        
        // Buscar usuários, times e torneios
        const [usersRes, teamsRes, tournamentsRes] = await Promise.all([
          axios.get('/api/users', config),
          axios.get('/api/teams', config),
          axios.get('/api/tournaments', config)
        ]);
        
        setUsers(usersRes.data);
        setTeams(teamsRes.data);
        setTournaments(tournamentsRes.data);
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
      <h1 className="mb-4 gradient-text">Painel de Administração</h1>
      
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
                  <Card.Title>Total de Usuários</Card.Title>
                  <h2>{users.length}</h2>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-3">
              <Card className="text-center h-100">
                <Card.Body>
                  <FontAwesomeIcon icon={faUserPlus} size="3x" className="mb-3 gradient-text" />
                  <Card.Title>Times Registrados</Card.Title>
                  <h2>{teams.length}</h2>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-3">
              <Card className="text-center h-100">
                <Card.Body>
                  <FontAwesomeIcon icon={faTrophy} size="3x" className="mb-3 gradient-text" />
                  <Card.Title>Campeonatos</Card.Title>
                  <h2>{tournaments.length}</h2>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          {/* Main Content */}
          <Tabs defaultActiveKey="users" className="mb-4">
            <Tab eventKey="users" title="Usuários">
              <Card>
                <Card.Header className="gradient-bg text-white">
                  <h5 className="mb-0">Lista de Usuários</h5>
                </Card.Header>
                <Card.Body>
                  <div className="table-responsive">
                    <Table striped hover>
                      <thead>
                        <tr>
                          <th>Nome</th>
                          <th>Email</th>
                          <th>Função</th>
                          <th>Telefone</th>
                          <th>Data de Cadastro</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user._id}>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>
                              {user.role === 'admin' && 'Administrador'}
                              {user.role === 'captain' && 'Capitão'}
                              {user.role === 'player' && 'Jogador'}
                            </td>
                            <td>{user.phone || '-'}</td>
                            <td>{new Date(user.createdAt).toLocaleDateString('pt-BR')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            </Tab>
            
            <Tab eventKey="teams" title="Times">
              <Card>
                <Card.Header className="gradient-bg text-white">
                  <h5 className="mb-0">Lista de Times</h5>
                </Card.Header>
                <Card.Body>
                  <div className="table-responsive">
                    <Table striped hover>
                      <thead>
                        <tr>
                          <th>Nome do Time</th>
                          <th>Jogo</th>
                          <th>Capitão</th>
                          <th>Jogadores</th>
                          <th>Data de Cadastro</th>
                        </tr>
                      </thead>
                      <tbody>
                        {teams.map((team) => (
                          <tr key={team._id}>
                            <td>{team.name}</td>
                            <td>{team.game}</td>
                            <td>{team.captain?.name || '-'}</td>
                            <td>{team.players?.length || 0}</td>
                            <td>{new Date(team.createdAt).toLocaleDateString('pt-BR')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            </Tab>
            
            <Tab eventKey="tournaments" title="Campeonatos">
              <Card>
                <Card.Header className="gradient-bg text-white">
                  <h5 className="mb-0">Lista de Campeonatos</h5>
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
                          <th>Data de Término</th>
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
                            <td>{new Date(tournament.endDate).toLocaleDateString('pt-BR')}</td>
                            <td>
                              <Button 
                                variant="outline-primary" 
                                size="sm"
                                href={`/tournaments/${tournament._id}`}
                              >
                                Ver
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                  <div className="d-flex justify-content-end mt-3">
                    <Button className="btn-gradient" href="/admin/tournaments/create">
                      Criar Novo Campeonato
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Tab>
            
            <Tab eventKey="reports" title="Relatórios">
              <Card>
                <Card.Header className="gradient-bg text-white">
                  <h5 className="mb-0">Relatórios</h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6} className="mb-4">
                      <Card>
                        <Card.Body className="text-center">
                          <FontAwesomeIcon icon={faChartBar} size="3x" className="mb-3 gradient-text" />
                          <Card.Title>Relatório de Times</Card.Title>
                          <Card.Text>
                            Gerar relatório detalhado de todos os times cadastrados.
                          </Card.Text>
                          <Button className="btn-gradient">Gerar Relatório</Button>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={6} className="mb-4">
                      <Card>
                        <Card.Body className="text-center">
                          <FontAwesomeIcon icon={faUsers} size="3x" className="mb-3 gradient-text" />
                          <Card.Title>Relatório de Jogadores</Card.Title>
                          <Card.Text>
                            Gerar relatório detalhado de todos os jogadores cadastrados.
                          </Card.Text>
                          <Button className="btn-gradient">Gerar Relatório</Button>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Tab>
          </Tabs>
        </>
      )}
    </>
  );
};

export default AdminDashboard;
