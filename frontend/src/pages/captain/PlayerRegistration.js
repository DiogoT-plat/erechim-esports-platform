import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Card, Alert } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const PlayerRegistration = () => {
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [cpf, setCpf] = useState('');
  const [game, setGame] = useState('CS2');
  const [teamId, setTeamId] = useState('');
  const [steamId, setSteamId] = useState('');
  const [gamersClubId, setGamersClubId] = useState('');
  const [teams, setTeams] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Verificar se há um teamId na query string
    const query = new URLSearchParams(location.search);
    const queryTeamId = query.get('teamId');
    
    if (queryTeamId) {
      setTeamId(queryTeamId);
      
      // Buscar informações do time para definir o jogo automaticamente
      const fetchTeam = async () => {
        try {
          const userInfo = JSON.parse(localStorage.getItem('userInfo'));
          const config = {
            headers: {
              Authorization: `Bearer ${userInfo.token}`,
            },
          };
          
          const { data } = await axios.get(`/api/teams/${queryTeamId}`, config);
          setGame(data.game);
        } catch (error) {
          console.error('Erro ao buscar informações do time:', error);
        }
      };
      
      fetchTeam();
    }
    
    // Buscar times do capitão
    const fetchTeams = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        
        const { data } = await axios.get('/api/teams', config);
        setTeams(data);
      } catch (error) {
        console.error('Erro ao buscar times:', error);
      }
    };
    
    fetchTeams();
  }, [location.search]);

  const submitHandler = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      
      // Verificar campos obrigatórios para CS2
      if (game === 'CS2' && (!steamId || !gamersClubId)) {
        setError('Para CS2, Steam ID e ID Gamers Club são obrigatórios');
        setLoading(false);
        return;
      }
      
      // Obter token do localStorage
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      
      const { data } = await axios.post(
        '/api/players',
        { 
          name, 
          nickname, 
          phone, 
          cpf, 
          game, 
          teamId: game !== 'TFT' ? teamId : undefined,
          steamId: game === 'CS2' ? steamId : undefined,
          gamersClubId: game === 'CS2' ? gamersClubId : undefined
        },
        config
      );
      
      setSuccess('Jogador cadastrado com sucesso!');
      
      // Limpar o formulário
      setName('');
      setNickname('');
      setPhone('');
      setCpf('');
      setSteamId('');
      setGamersClubId('');
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        navigate('/captain');
      }, 2000);
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Erro ao cadastrar jogador. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="mb-4 gradient-text">Cadastrar Jogador</h1>
      
      <Row className="justify-content-md-center">
        <Col md={8}>
          <Card className="p-4 shadow">
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}
              
              <Form onSubmit={submitHandler}>
                <Row>
                  <Col md={6}>
                    <Form.Group controlId="name" className="mb-3">
                      <Form.Label>Nome Completo</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Digite o nome completo"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group controlId="nickname" className="mb-3">
                      <Form.Label>Nickname</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Digite o nickname"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row>
                  <Col md={6}>
                    <Form.Group controlId="phone" className="mb-3">
                      <Form.Label>Telefone</Form.Label>
                      <Form.Control
                        type="tel"
                        placeholder="(XX) XXXXX-XXXX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group controlId="cpf" className="mb-3">
                      <Form.Label>CPF</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="XXX.XXX.XXX-XX"
                        value={cpf}
                        onChange={(e) => setCpf(e.target.value)}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row>
                  <Col md={6}>
                    <Form.Group controlId="game" className="mb-3">
                      <Form.Label>Jogo</Form.Label>
                      <Form.Select
                        value={game}
                        onChange={(e) => setGame(e.target.value)}
                        required
                        disabled={teamId !== ''}
                      >
                        <option value="CS2">Counter Strike 2</option>
                        <option value="LOL">League of Legends</option>
                        <option value="Valorant">Valorant</option>
                        <option value="TFT">TFT</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  
                  {game !== 'TFT' && (
                    <Col md={6}>
                      <Form.Group controlId="teamId" className="mb-3">
                        <Form.Label>Time</Form.Label>
                        <Form.Select
                          value={teamId}
                          onChange={(e) => {
                            setTeamId(e.target.value);
                            // Atualizar o jogo com base no time selecionado
                            const selectedTeam = teams.find(t => t._id === e.target.value);
                            if (selectedTeam) {
                              setGame(selectedTeam.game);
                            }
                          }}
                          required
                          disabled={teamId !== ''}
                        >
                          <option value="">Selecione um time</option>
                          {teams
                            .filter(team => game === 'TFT' || team.game === game)
                            .map((team) => (
                              <option key={team._id} value={team._id}>
                                {team.name} ({team.game})
                              </option>
                            ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  )}
                </Row>
                
                {game === 'CS2' && (
                  <Row>
                    <Col md={6}>
                      <Form.Group controlId="steamId" className="mb-3">
                        <Form.Label>Steam ID</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Digite o Steam ID"
                          value={steamId}
                          onChange={(e) => setSteamId(e.target.value)}
                          required
                        />
                      </Form.Group>
                    </Col>
                    
                    <Col md={6}>
                      <Form.Group controlId="gamersClubId" className="mb-3">
                        <Form.Label>ID Gamers Club</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Digite o ID Gamers Club"
                          value={gamersClubId}
                          onChange={(e) => setGamersClubId(e.target.value)}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                )}

                <div className="d-grid mt-4">
                  <Button 
                    type="submit" 
                    className="btn-gradient" 
                    disabled={loading}
                  >
                    {loading ? 'Cadastrando...' : 'Cadastrar Jogador'}
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

export default PlayerRegistration;
