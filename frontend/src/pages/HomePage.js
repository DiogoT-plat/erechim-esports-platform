import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Carousel } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy, faUsers, faGamepad, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const HomePage = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const { data } = await axios.get('/api/tournaments');
        // Pegar apenas os 3 torneios mais recentes
        setTournaments(data.slice(0, 3));
      } catch (error) {
        console.error('Erro ao buscar torneios:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTournaments();
  }, []);

  return (
    <>
      {/* Hero Section */}
      <div className="gradient-bg text-white p-5 rounded-3 mb-5">
        <Row className="align-items-center">
          <Col md={7}>
            <h1 className="display-4 fw-bold">Erechim E-SPORTS Festival</h1>
            <p className="lead">
              Participe dos campeonatos de Counter Strike 2, League of Legends, Valorant e TFT.
              Registre seu time ou inscreva-se individualmente para TFT.
            </p>
            <div className="d-grid gap-2 d-md-flex justify-content-md-start">
              <Link to="/tournaments">
                <Button size="lg" className="btn-gradient px-4 me-md-2">
                  <FontAwesomeIcon icon={faTrophy} className="me-2" />
                  Ver Campeonatos
                </Button>
              </Link>
              <Link to="/register">
                <Button size="lg" variant="outline-light" className="px-4">
                  <FontAwesomeIcon icon={faUsers} className="me-2" />
                  Cadastrar Time
                </Button>
              </Link>
            </div>
          </Col>
          <Col md={5} className="text-center">
            <img
              src="/logo.png"
              alt="Erechim E-SPORTS Festival Logo"
              className="img-fluid"
              style={{ maxHeight: '300px' }}
            />
          </Col>
        </Row>
      </div>

      {/* Games Section */}
      <h2 className="text-center mb-4">Jogos</h2>
      <Row className="mb-5">
        <Col md={3} sm={6} className="mb-4">
          <Card className="h-100 text-center">
            <Card.Header className="gradient-bg">
              <h5 className="mb-0">Counter Strike 2</h5>
            </Card.Header>
            <Card.Body>
              <FontAwesomeIcon icon={faGamepad} size="3x" className="mb-3 cs2-color" />
              <Card.Text>
                Forme sua equipe de 5 jogadores e participe dos campeonatos de CS2.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-4">
          <Card className="h-100 text-center">
            <Card.Header className="gradient-bg">
              <h5 className="mb-0">League of Legends</h5>
            </Card.Header>
            <Card.Body>
              <FontAwesomeIcon icon={faGamepad} size="3x" className="mb-3 lol-color" />
              <Card.Text>
                Reúna sua equipe de 5 jogadores e participe dos campeonatos de LoL.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-4">
          <Card className="h-100 text-center">
            <Card.Header className="gradient-bg">
              <h5 className="mb-0">Valorant</h5>
            </Card.Header>
            <Card.Body>
              <FontAwesomeIcon icon={faGamepad} size="3x" className="mb-3 valorant-color" />
              <Card.Text>
                Monte sua equipe de 5 jogadores e participe dos campeonatos de Valorant.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-4">
          <Card className="h-100 text-center">
            <Card.Header className="gradient-bg">
              <h5 className="mb-0">TFT</h5>
            </Card.Header>
            <Card.Body>
              <FontAwesomeIcon icon={faGamepad} size="3x" className="mb-3 tft-color" />
              <Card.Text>
                Inscreva-se individualmente e participe dos campeonatos de TFT.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tournaments Section */}
      <h2 className="text-center mb-4">Próximos Campeonatos</h2>
      {loading ? (
        <div className="text-center py-5 loading">Carregando campeonatos...</div>
      ) : tournaments.length > 0 ? (
        <Row>
          {tournaments.map((tournament) => (
            <Col md={4} key={tournament._id} className="mb-4">
              <Card className="h-100">
                <Card.Header className="gradient-bg">
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
                      <Button className="btn-gradient">Ver Detalhes</Button>
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

      {/* Call to Action */}
      <div className="text-center py-5 mt-4">
        <h3>Pronto para participar?</h3>
        <p className="lead">Cadastre-se agora e faça parte do Erechim E-SPORTS Festival!</p>
        <Link to="/register">
          <Button size="lg" className="btn-gradient px-5 mt-3">
            Cadastrar
          </Button>
        </Link>
      </div>
    </>
  );
};

export default HomePage;
