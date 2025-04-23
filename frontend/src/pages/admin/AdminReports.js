import React, { useState, useEffect } from 'react';
import { Card, Button, Alert, Spinner, Table, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faUsers, faGamepad, faFileCsv, faFilePdf } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const generateCSV = (data, filename) => {
  // Função para gerar arquivo CSV
  if (data.length === 0) return;
  
  // Obter cabeçalhos das colunas
  const headers = Object.keys(data[0]).filter(key => 
    !key.startsWith('_') && key !== 'createdAt' && key !== 'updatedAt' && key !== '__v'
  );
  
  // Criar conteúdo CSV
  let csvContent = headers.join(',') + '\n';
  
  data.forEach(item => {
    const row = headers.map(header => {
      let value = item[header];
      
      // Tratar valores especiais
      if (value === null || value === undefined) {
        return '';
      } else if (typeof value === 'object') {
        return JSON.stringify(value).replace(/"/g, '""');
      } else {
        return String(value).replace(/"/g, '""');
      }
    });
    
    csvContent += row.join(',') + '\n';
  });
  
  // Criar e baixar o arquivo
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const AdminReports = () => {
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatingReport, setGeneratingReport] = useState(false);
  const [reportType, setReportType] = useState(null);
  const [reportData, setReportData] = useState(null);

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

  const generateTeamsReport = async () => {
    setGeneratingReport(true);
    setReportType('teams');
    
    try {
      // Obter token do localStorage
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      
      // Buscar dados detalhados dos times
      const { data } = await axios.get('/api/teams', config);
      
      // Processar dados para o relatório
      const reportData = await Promise.all(
        data.map(async (team) => {
          // Buscar jogadores do time
          const playersRes = await axios.get(`/api/players?teamId=${team._id}`, config);
          const teamPlayers = playersRes.data;
          
          return {
            id: team._id,
            nome: team.name,
            jogo: team.game,
            capitao: team.captain?.name || '-',
            email_capitao: team.captain?.email || '-',
            telefone_capitao: team.captain?.phone || '-',
            cpf_capitao: team.captain?.cpf || '-',
            qtd_jogadores: teamPlayers.length,
            jogadores: teamPlayers.map(p => p.name).join(', '),
            data_criacao: new Date(team.createdAt).toLocaleDateString('pt-BR')
          };
        })
      );
      
      setReportData(reportData);
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Erro ao gerar relatório. Tente novamente.'
      );
    } finally {
      setGeneratingReport(false);
    }
  };

  const generatePlayersReport = async () => {
    setGeneratingReport(true);
    setReportType('players');
    
    try {
      // Obter token do localStorage
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      
      // Buscar dados detalhados dos jogadores
      const { data } = await axios.get('/api/players', config);
      
      // Processar dados para o relatório
      const reportData = data.map(player => {
        const team = teams.find(t => t._id === player.team);
        
        return {
          id: player._id,
          nome: player.name,
          nickname: player.nickname,
          telefone: player.phone,
          cpf: player.cpf,
          jogo: player.game,
          time: team?.name || '-',
          steam_id: player.steamId || '-',
          gamers_club_id: player.gamersClubId || '-',
          data_criacao: new Date(player.createdAt).toLocaleDateString('pt-BR')
        };
      });
      
      setReportData(reportData);
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Erro ao gerar relatório. Tente novamente.'
      );
    } finally {
      setGeneratingReport(false);
    }
  };

  const exportCSV = () => {
    if (!reportData) return;
    
    const filename = reportType === 'teams' 
      ? 'relatorio_times_erechim_esports.csv' 
      : 'relatorio_jogadores_erechim_esports.csv';
    
    generateCSV(reportData, filename);
  };

  return (
    <>
      <h1 className="mb-4 gradient-text">Relatórios Administrativos</h1>
      
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
          
          {/* Visualização do relatório gerado */}
          {reportData && reportType === 'teams' && (
            <Card className="mb-4">
              <Card.Header className="gradient-bg text-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Relatório de Times</h5>
                <div>
                  <Button variant="light" size="sm" onClick={exportCSV} className="me-2">
                    <FontAwesomeIcon icon={faFileCsv} className="me-1" />
                    Exportar CSV
                  </Button>
                </div>
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
                        <th>Telefone</th>
                        <th>CPF</th>
                        <th>Jogadores</th>
                        <th>Data de Cadastro</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.map((team) => (
                        <tr key={team.id}>
                          <td>{team.nome}</td>
                          <td>{team.jogo}</td>
                          <td>{team.capitao}</td>
                          <td>{team.email_capitao}</td>
                          <td>{team.telefone_capitao}</td>
                          <td>{team.cpf_capitao}</td>
                          <td>{team.qtd_jogadores} ({team.jogadores})</td>
                          <td>{team.data_criacao}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          )}
          
          {reportData && reportType === 'players' && (
            <Card className="mb-4">
              <Card.Header className="gradient-bg text-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Relatório de Jogadores</h5>
                <div>
                  <Button variant="light" size="sm" onClick={exportCSV} className="me-2">
                    <FontAwesomeIcon icon={faFileCsv} className="me-1" />
                    Exportar CSV
                  </Button>
                </div>
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
                        <th>Steam ID</th>
                        <th>Gamers Club ID</th>
                        <th>Data de Cadastro</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.map((player) => (
                        <tr key={player.id}>
                          <td>{player.nome}</td>
                          <td>{player.nickname}</td>
                          <td>{player.telefone}</td>
                          <td>{player.cpf}</td>
                          <td>{player.jogo}</td>
                          <td>{player.time}</td>
                          <td>{player.steam_id}</td>
                          <td>{player.gamers_club_id}</td>
                          <td>{player.data_criacao}</td>
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

export default AdminReports;
