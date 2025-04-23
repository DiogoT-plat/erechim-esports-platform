import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Row, Col, Card, Button, Alert, Tabs, Tab, Table } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy, faCalendarAlt, faUsers, faGamepad } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const TournamentDetails = () => {
  const { id } = useParams();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(localStorage.getItem('userInfo') 
    ? JSON.parse(localStorage.getItem('userInfo')) 
    : null);

  useEffect(() => {
    const fetchTournament = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/api/tournaments/${id}`);
        setTournament(data);
      } catch (error) {
        setError(
          error.response && error.response.data.message
            ? error.response.data.message
            : 'Erro ao carregar detalhes do torneio. Tente novamente.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTournament();
  }, [id]);

  return (
    <>
      {loading ? (
        <div className="text-center py-5 loading">Carregando detalhes do campeonato...</div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : tournament ? (
        <>
          <Row className="mb-4">
            <Col>
              <h1 className="gradient-text">{tournament.name}</h1>
              <p className="lead">
                <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                {new Date(tournament.startDate).toLocaleDateString('pt-BR')} até{' '}
                {new Date(tournament.endDate).toLocaleDateString('pt-BR')}
              </p>
            </Col>
          </Row>
          
          <Card className="mb-4">
            <Card.Header className="gradient-bg text-white">
              <h5 className="mb-0">Informações do Campeonato</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <p><strong>Jogos:</strong> {tournament.games.join(', ')}</p>
                  <p>
                    <strong>Status:</strong>{' '}
                    {tournament.status === 'draft' && 'Em preparação'}
                    {tournament.status === 'registration' && 'Inscrições abertas'}
                    {tournament.status === 'ongoing' && 'Em andamento'}
                    {tournament.status === 'completed' && 'Finalizado'}
                  </p>
                </Col>
                <Col md={6}>
                  <p>
                    <strong>Inscrições até:</strong>{' '}
                    {new Date(tournament.registrationDeadline).toLocaleDateString('pt-BR')}
                  </p>
                  <p><strong>Criado por:</strong> {tournament.createdBy?.name || 'Administrador'}</p>
                </Col>
              </Row>
              
              {tournament.description && (
                <Row className="mt-3">
                  <Col>
                    <h6>Descrição:</h6>
                    <p>{tournament.description}</p>
                  </Col>
                </Row>
              )}
              
              {tournament.status === 'registration' && user && (user.role === 'captain' || user.role === 'player') && (
                <div className="d-grid gap-2 d-md-flex justify-content-md-end mt-3">
                  <Button className="btn-gradient">
                    <FontAwesomeIcon icon={faTrophy} className="me-2" />
                    Inscrever-se neste Campeonato
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
          
          <Tabs defaultActiveKey="brackets" className="mb-4">
            <Tab eventKey="brackets" title="Chaveamentos">
              {tournament.brackets && tournament.brackets.length > 0 ? (
                <Row>
                  {tournament.brackets.map((bracket) => (
                    <Col md={6} key={bracket._id} className="mb-4">
                      <Card>
                        <Card.Header className="gradient-bg text-white">
                          <h5 className="mb-0">{bracket.name} - {bracket.game}</h5>
                        </Card.Header>
                        <Card.Body>
                          <p>
                            <strong>Tipo:</strong>{' '}
                            {bracket.type === 'single_elimination' && 'Eliminação Simples'}
                            {bracket.type === 'double_elimination' && 'Eliminação Dupla'}
                            {bracket.type === 'round_robin' && 'Todos contra Todos'}
                            {bracket.type === 'groups' && 'Fase de Grupos'}
                          </p>
                          <p>
                            <strong>Status:</strong>{' '}
                            {bracket.status === 'pending' && 'Pendente'}
                            {bracket.status === 'active' && 'Ativo'}
                            {bracket.status === 'completed' && 'Concluído'}
                          </p>
                          <div className="d-grid">
                            <Button variant="outline-primary" href={`/brackets/${bracket._id}`}>
                              Ver Chaveamento
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              ) : (
                <div className="text-center py-5">
                  <p>Nenhum chaveamento disponível para este campeonato.</p>
                  {tournament.status === 'draft' && (
                    <p>Os chaveamentos serão criados quando o campeonato iniciar.</p>
                  )}
                </div>
              )}
            </Tab>
            
            <Tab eventKey="teams" title="Times Inscritos">
              {tournament.teams && tournament.teams.length > 0 ? (
                <Table striped hover responsive>
                  <thead>
                    <tr>
                      <th>Nome do Time</th>
                      <th>Jogo</th>
                      <th>Capitão</th>
                      <th>Jogadores</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tournament.teams.map((team) => (
                      <tr key={team._id}>
                        <td>{team.name}</td>
                        <td>{team.game}</td>
                        <td>{team.captain?.name || '-'}</td>
                        <td>{team.players?.length || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center py-5">
                  <p>Nenhum time inscrito neste campeonato.</p>
                  {tournament.status === 'registration' && (
                    <p>As inscrições estão abertas! Inscreva seu time agora.</p>
                  )}
                </div>
              )}
            </Tab>
            
            <Tab eventKey="players" title="Jogadores Individuais">
              {tournament.players && tournament.players.length > 0 ? (
                <Table striped hover responsive>
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Nickname</th>
                      <th>Jogo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tournament.players.map((player) => (
                      <tr key={player._id}>
                        <td>{player.name}</td>
                        <td>{player.nickname}</td>
                        <td>{player.game}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center py-5">
                  <p>Nenhum jogador individual inscrito neste campeonato.</p>
                  {tournament.status === 'registration' && tournament.games.includes('TFT') && (
                    <p>As inscrições estão abertas! Inscreva-se agora para TFT.</p>
                  )}
                </div>
              )}
            </Tab>
          </Tabs>
        </>
      ) : (
        <Alert variant="warning">Campeonato não encontrado.</Alert>
      )}
    </>
  );
};

export default TournamentDetails;
