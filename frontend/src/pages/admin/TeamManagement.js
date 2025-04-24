import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Alert, Badge, Form } from 'react-bootstrap';
import axios from 'axios';
import { Link } from 'react-router-dom';

const TeamManagement = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState(null);
  const [gameFilter, setGameFilter] = useState('all');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/teams');
      setTeams(res.data);
      setError('');
    } catch (err) {
      setError('Erro ao carregar times. Por favor, tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (team) => {
    setTeamToDelete(team);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`/api/teams/${teamToDelete._id}`);
      setTeams(teams.filter(team => team._id !== teamToDelete._id));
      setSuccessMessage(`Time "${teamToDelete.name}" excluído com sucesso!`);
      setShowDeleteModal(false);
      setTeamToDelete(null);
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      setError('Erro ao excluir time. Por favor, tente novamente.');
      console.error(err);
      setShowDeleteModal(false);
    }
  };

  const filteredTeams = gameFilter === 'all' 
    ? teams 
    : teams.filter(team => team.game === gameFilter);

  const getGameName = (gameCode) => {
    switch(gameCode) {
      case 'cs2': return 'Counter Strike 2';
      case 'lol': return 'League of Legends';
      case 'valorant': return 'Valorant';
      default: return gameCode;
    }
  };

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gerenciamento de Times</h2>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      <div className="mb-3">
        <Form.Group>
          <Form.Label>Filtrar por Jogo</Form.Label>
          <Form.Control 
            as="select" 
            value={gameFilter}
            onChange={(e) => setGameFilter(e.target.value)}
          >
            <option value="all">Todos os Jogos</option>
            <option value="cs2">Counter Strike 2</option>
            <option value="lol">League of Legends</option>
            <option value="valorant">Valorant</option>
          </Form.Control>
        </Form.Group>
      </div>

      {loading ? (
        <p>Carregando times...</p>
      ) : filteredTeams.length === 0 ? (
        <Alert variant="info">Nenhum time encontrado.</Alert>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Nome do Time</th>
              <th>Jogo</th>
              <th>Capitão</th>
              <th>Jogadores</th>
              <th>Data de Criação</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredTeams.map((team) => (
              <tr key={team._id}>
                <td>{team.name}</td>
                <td>{getGameName(team.game)}</td>
                <td>{team.captain?.name || 'N/A'}</td>
                <td>{team.players?.length || 0}</td>
                <td>{new Date(team.createdAt).toLocaleDateString('pt-BR')}</td>
                <td>
                  <Link to={`/admin/teams/${team._id}`} className="btn btn-sm btn-info me-2">
                    <i className="fas fa-eye"></i> Ver
                  </Link>
                  <Button 
                    variant="danger" 
                    size="sm"
                    onClick={() => handleDeleteClick(team)}
                  >
                    <i className="fas fa-trash"></i> Excluir
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Modal de confirmação de exclusão */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Exclusão</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Tem certeza que deseja excluir o time "{teamToDelete?.name}"? 
          <br /><br />
          <strong>Esta ação não pode ser desfeita.</strong>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            Excluir Time
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default TeamManagement;
