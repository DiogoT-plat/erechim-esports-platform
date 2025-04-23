import React, { useState } from 'react';
import { Form, Button, Row, Col, Card, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const TeamRegistration = () => {
  const [name, setName] = useState('');
  const [game, setGame] = useState('CS2');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      
      // Obter token do localStorage
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      
      const { data } = await axios.post(
        '/api/teams',
        { name, game },
        config
      );
      
      setSuccess('Time cadastrado com sucesso!');
      
      // Limpar o formulário
      setName('');
      setGame('CS2');
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        navigate('/captain');
      }, 2000);
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Erro ao cadastrar time. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="mb-4 gradient-text">Cadastrar Novo Time</h1>
      
      <Row className="justify-content-md-center">
        <Col md={8}>
          <Card className="p-4 shadow">
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}
              
              <Form onSubmit={submitHandler}>
                <Form.Group controlId="name" className="mb-3">
                  <Form.Label>Nome do Time</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Digite o nome do time"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group controlId="game" className="mb-4">
                  <Form.Label>Jogo</Form.Label>
                  <Form.Select
                    value={game}
                    onChange={(e) => setGame(e.target.value)}
                    required
                  >
                    <option value="CS2">Counter Strike 2</option>
                    <option value="LOL">League of Legends</option>
                    <option value="Valorant">Valorant</option>
                  </Form.Select>
                  <Form.Text className="text-muted">
                    Você só pode criar um time por jogo.
                  </Form.Text>
                </Form.Group>

                <div className="d-grid">
                  <Button 
                    type="submit" 
                    className="btn-gradient" 
                    disabled={loading}
                  >
                    {loading ? 'Cadastrando...' : 'Cadastrar Time'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default TeamRegistration;
