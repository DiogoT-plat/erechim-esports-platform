import React, { useState, useEffect } from 'react';
import { Card, Button, Alert, Spinner, Table, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faUsers, faGamepad } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const ReportsPage = () => {
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatingReport, setGeneratingReport] = useState(false);
  const [reportType, setReportType] = useState(null);

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
        
        // Buscar times e jogadores
        const [teamsRes, playersRes] = await Promise.all([
          axios.get('/api/teams', config),
          axios.get('/api/players', config)
        ]);
        
        setTeams(teamsRes.data);
        setPlayers(playersRes.data);
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

  const generateTeamsReport = () => {
    setGeneratingReport(true);
    setReportType('teams');
    
    // Simulando tempo de geração do relatório
    setTimeout(() => {
      setGeneratingReport(false);
    }, 1500);
  };

  const generatePlayersReport = () => {
    setGeneratingReport(true);
    setReportType('players');
    
    // Simulando tempo de geração do relatório
    setTimeout(() => {
      setGeneratingReport(false);
    }, 1500);
  };

  return (
    <>
      <h1 className="mb-4 gradient-text">Relatórios</h1>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Carregando dados...</p>
        </div>
      ) : (
        <>
          <Row className="mb-4">
            <Col md={6} className="mb-3">
              <Card className="h-100">
                <Card.Header className="gradient-bg text-white">
                  <h5 className="mb-0">Relatório de Times</h5>
                </Card.Header>
                <Card.Body className="text-center">
                  <FontAwesomeIcon icon={faUsers} size="3x" className="mb-3 gradient-text" />
                  <Card.Title>Relatório Detalhado de Times</Card.Title>
                  <Card.Text>
                    Gerar relatório com todos os times cadastrados, incluindo informações sobre capitães e jogadores.
                  </Card.Text>
                  <Button 
                    className="btn-gradient" 
                    onClick={generateTeamsReport}
                    disabled={generatingReport}
                  >
                    {generatingReport && reportType === 'teams' ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Gerando...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faDownload} className="me-2" />
                        Gerar Relatório
                      </>
                    )}
                  </Button>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={6} className="mb-3">
              <Card className="h-100">
                <Card.Header className="gradient-bg text-white">
                  <h5 className="mb-0">Relatório de Jogadores</h5>
                </Card.Header>
                <Card.Body className="text-center">
                  <FontAwesomeIcon icon={faGamepad} size="3x" className="mb-3 gradient-text" />
                  <Card.Title>Relatório Detalhado de Jogadores</Card.Title>
                  <Card.Text>
                    Gerar relatório com todos os jogadores cadastrados, incluindo informações específicas para cada jogo.
                  </Card.Text>
                  <Button 
                    className="btn-gradient" 
                    onClick={generatePlayersReport}
                    disabled={generatingReport}
                  >
                    {generatingReport && reportType === 'players' ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Gerando...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faDownload} className="me-2" />
                        Gerar Relatório
                      </>
                    )}
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          {/* Visualização prévia do relatório de times */}
          {reportType === 'teams' && !generatingReport && (
            <Card className="mb-4">
              <Card.Header className="gradient-bg text-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Relatório de Times</h5>
                <Button variant="light" size="sm">
                  <FontAwesomeIcon icon={faDownload} className="me-1" />
                  Exportar CSV
                </Button>
              </Card.Header>
              <Card.Body>
                <div className="table-responsive">
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>Nome do Time</th>
                        <th>Jogo</th>
                        <th>Capitão</th>
                        <th>Email do Capitão</th>
                        <th>Telefone do Capitão</th>
                        <th>Jogadores</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teams.map((team) => (
                        <tr key={team._id}>
                          <td>{team.name}</td>
                          <td>{team.game}</td>
                          <td>{team.captain?.name || '-'}</td>
                          <td>{team.captain?.email || '-'}</td>
                          <td>{team.captain?.phone || '-'}</td>
                          <td>{team.players?.length || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          )}
          
          {/* Visualização prévia do relatório de jogadores */}
          {reportType === 'players' && !generatingReport && (
            <Card className="mb-4">
              <Card.Header className="gradient-bg text-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Relatório de Jogadores</h5>
                <Button variant="light" size="sm">
                  <FontAwesomeIcon icon={faDownload} className="me-1" />
                  Exportar CSV
                </Button>
              </Card.Header>
              <Card.Body>
                <div className="table-responsive">
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>Nome</th>
                        <th>Nickname</th>
                        <th>Telefone</th>
                        <th>CPF</th>
                        <th>Jogo</th>
                        <th>Time</th>
                        {/* Campos específicos para CS2 */}
                        <th>Steam ID</th>
                        <th>Gamers Club ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {players.map((player) => (
                        <tr key={player._id}>
                          <td>{player.name}</td>
                          <td>{player.nickname}</td>
                          <td>{player.phone}</td>
                          <td>{player.cpf}</td>
                          <td>{player.game}</td>
                          <td>{teams.find(t => t._id === player.team)?.name || '-'}</td>
                          <td>{player.steamId || '-'}</td>
                          <td>{player.gamersClubId || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          )}
        </>
      )}
    </>
  );
};

export default ReportsPage;
