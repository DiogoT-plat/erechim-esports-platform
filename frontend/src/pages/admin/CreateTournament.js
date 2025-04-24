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
