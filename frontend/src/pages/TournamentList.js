import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const TournamentList = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get('/api/tournaments');
        setTournaments(data);
      } catch (error) {
        setError(
          error.response && error.response.data.message
            ? error.response.data.message
            : 'Erro ao carregar torneios. Tente novamente.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTournaments();
  }, []);

  return (
    <>
      <h1 className="mb-4 gradient-text">Campeonatos</h1>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {loading ? (
        <div className="text-center py-5 loading">Carregando campeonatos...</div>
      ) : tournaments.length > 0 ? (
        <Row>
          {tournaments.map((tournament) => (
            <Col md={4} key={tournament._id} className="mb-4">
              <Card className="h-100">
                <Card.Header className="gradient-bg text-white">
                  <h5 className="mb-0">{tournament.name}</h5>
                </Card.Header>
                <Card.Body>
                  <Card.Text>
                    <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                    {new Date(tournament.startDate).toLocaleDateString('pt-BR')} até{' '}
                    {new Date(tournament.endDate).toLocaleDateString('pt-BR')}
                  </Card.Text>
                  <Card.Text>
                    <strong>Jogos:</strong>{' '}
                    {tournament.games.join(', ')}
                  </Card.Text>
                  <Card.Text>
                    <strong>Status:</strong>{' '}
                    {tournament.status === 'draft' && 'Em preparação'}
                    {tournament.status === 'registration' && 'Inscrições abertas'}
                    {tournament.status === 'ongoing' && 'Em andamento'}
                    {tournament.status === 'completed' && 'Finalizado'}
                  </Card.Text>
                  <div className="d-grid">
                    <Link to={`/tournaments/${tournament._id}`}>
                      <Button className="btn-gradient">
                        <FontAwesomeIcon icon={faTrophy} className="me-2" />
                        Ver Detalhes
                      </Button>
                    </Link>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <div className="text-center py-5">
          <p>Nenhum campeonato disponível no momento.</p>
          <p>Fique atento para os próximos eventos!</p>
        </div>
      )}
    </>
  );
};

export default TournamentList;
