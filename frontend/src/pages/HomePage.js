import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';

const HomePage = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const { data } = await axios.get('/api/tournaments');
        // Mostrar apenas torneios ativos com inscrições abertas
        const activeTournaments = data.filter(
          tournament => tournament.registrationOpen && new Date(tournament.endDate) >= new Date()
        );
        setTournaments(activeTournaments);
      } catch (error) {
        console.error('Erro ao buscar torneios:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTournaments();
  }, []);

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
    <Container className="py-5">
      <Row className="align-items-center mb-5">
        <Col md={6} className="text-center text-md-start">
          <h1 className="display-4 fw-bold mb-4">Erechim E-sports Festival</h1>
          <p className="lead mb-4">
            Bem-vindo à plataforma oficial do Erechim E-sports Festival! Participe dos campeonatos de Counter Strike 2, 
            League of Legends, Valorant e TFT.
          </p>
          <div className="d-flex flex-wrap gap-2 justify-content-center justify-content-md-start">
            <Link to="/tournaments" className="btn btn-primary btn-lg">
              Ver Torneios
            </Link>
            <Link to="/register" className="btn btn-outline-secondary btn-lg">
              Cadastre-se
            </Link>
          </div>
        </Col>
        <Col md={6} className="text-center mt-4 mt-md-0">
          <img 
            src="/logo.png" 
            alt="Erechim E-sports Festival" 
            className="img-fluid" 
            style={{ maxHeight: '300px' }}
          />
        </Col>
      </Row>

      <h2 className="text-center mb-4">Torneios em Destaque</h2>
      
      {loading ? (
        <p className="text-center">Carregando torneios...</p>
      ) : tournaments.length === 0 ? (
        <div className="text-center">
          <p>Não há torneios com inscrições abertas no momento.</p>
          <p>Fique atento para os próximos campeonatos!</p>
        </div>
      ) : (
        <Row>
          {tournaments.map(tournament => (
            <Col key={tournament._id} md={6} lg={4} className="mb-4">
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <Card.Title>{tournament.name}</Card.Title>
                  <Card.Text>
                    <strong>Jogos:</strong> {getGameNames(tournament.games)}
                    <br />
                    <strong>Início:</strong> {new Date(tournament.startDate).toLocaleDateString('pt-BR')}
                    <br />
                    <strong>Término:</strong> {new Date(tournament.endDate).toLocaleDateString('pt-BR')}
                    <br />
                    <strong>Inscrições até:</strong> {new Date(tournament.registrationEndDate).toLocaleDateString('pt-BR')}
                  </Card.Text>
                </Card.Body>
                <Card.Footer className="bg-white border-top-0">
                  <Link to={`/tournaments/${tournament._id}`} className="btn btn-primary w-100">
                    Ver Detalhes
                  </Link>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Row className="mt-5 py-4 bg-light rounded">
        <Col md={12} className="text-center mb-4">
          <h2>Jogos</h2>
        </Col>
        <Col md={3} className="text-center mb-4">
          <div className="game-icon mb-3">
            <i className="fas fa-crosshairs fa-3x"></i>
          </div>
          <h4>Counter Strike 2</h4>
        </Col>
        <Col md={3} className="text-center mb-4">
          <div className="game-icon mb-3">
            <i className="fas fa-gamepad fa-3x"></i>
          </div>
          <h4>League of Legends</h4>
        </Col>
        <Col md={3} className="text-center mb-4">
          <div className="game-icon mb-3">
            <i className="fas fa-shield-alt fa-3x"></i>
          </div>
          <h4>Valorant</h4>
        </Col>
        <Col md={3} className="text-center mb-4">
          <div className="game-icon mb-3">
            <i className="fas fa-chess fa-3x"></i>
          </div>
          <h4>TFT</h4>
        </Col>
      </Row>
    </Container>
  );
};

export default HomePage;
