import React, { useState } from 'react';
import { Form, Button, Row, Col, Card, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const TFTRegistration = () => {
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [cpf, setCpf] = useState('');
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
        '/api/players',
        { 
          name, 
          nickname, 
          phone, 
          cpf, 
          game: 'TFT'
        },
        config
      );
      
      setSuccess('Jogador de TFT cadastrado com sucesso!');
      
      // Limpar o formulário
      setName('');
      setNickname('');
      setPhone('');
      setCpf('');
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        navigate('/');
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
      <h1 className="mb-4 gradient-text">Cadastrar para TFT</h1>
      
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

                <div className="d-grid mt-4">
                  <Button 
                    type="submit" 
                    className="btn-gradient" 
                    disabled={loading}
                  >
                    {loading ? 'Cadastrando...' : 'Cadastrar para TFT'}
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

export default TFTRegistration;
