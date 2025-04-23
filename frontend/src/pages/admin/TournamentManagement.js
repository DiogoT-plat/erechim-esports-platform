import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Alert, Badge, Form } from 'react-bootstrap';
import axios from 'axios';
import { Link } from 'react-router-dom';

const TournamentManagement = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [tournamentToDelete, setTournamentToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/tournaments');
      setTournaments(res.data);
      setError('');
    } catch (err) {
      setError('Erro ao carregar torneios. Por favor, tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (tournament) => {
    setTournamentToDelete(tournament);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`/api/tournaments/${tournamentToDelete._id}`);
      setTournaments(tournaments.filter(t => t._id !== tournamentToDelete._id));
      setSuccessMessage(`Torneio "${tournamentToDelete.name}" excluído com sucesso!`);
      setShowDeleteModal(false);
      setTournamentToDelete(null);
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      setError('Erro ao excluir torneio. Por favor, tente novamente.');
      console.error(err);
      setShowDeleteModal(false);
    }
  };

  const toggleRegistrationStatus = async (tournamentId, currentStatus) => {
    try {
      await axios.put(`/api/tournaments/${tournamentId}/registration`, {
        registrationOpen: !currentStatus
      });
      
      // Atualizar o estado local
      setTournaments(tournaments.map(tournament => 
        tournament._id === tournamentId 
          ? {...tournament, registrationOpen: !currentStatus} 
          : tournament
      ));
      
      setSuccessMessage(`Status de inscrição atualizado com sucesso!`);
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      setError('Erro ao atualizar status de inscrição. Por favor, tente novamente.');
      console.error(err);
    }
  };

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
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gerenciamento de Torneios</h2>
        <Link to="/admin/tournaments/create" className="btn btn-primary">
          <i className="fas fa-plus"></i> Criar Novo Torneio
        </Link>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      {loading ? (
        <p>Carregando torneios...</p>
      ) : tournaments.length === 0 ? (
        <Alert variant="info">Nenhum torneio encontrado. Crie um novo torneio para começar.</Alert>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Nome do Torneio</th>
              <th>Jogos</th>
              <th>Data de Início</th>
              <th>Data de Término</th>
              <th>Status de Inscrição</th>
              <th>Participantes</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {tournaments.map((tournament) => (
              <tr key={tournament._id}>
                <td>{tournament.name}</td>
                <td>{getGameNames(tournament.games)}</td>
                <td>{new Date(tournament.startDate).toLocaleDateString('pt-BR')}</td>
                <td>{new Date(tournament.endDate).toLocaleDateString('pt-BR')}</td>
                <td>
                  <Badge bg={tournament.registrationOpen ? 'success' : 'danger'}>
                    {tournament.registrationOpen ? 'Aberta' : 'Fechada'}
                  </Badge>
                </td>
                <td>
                  {tournament.teams?.length || 0} times, {tournament.players?.length || 0} jogadores
                </td>
                <td>
                  <div className="d-flex flex-wrap gap-1">
                    <Link to={`/admin/tournaments/${tournament._id}`} className="btn btn-sm btn-info">
                      <i className="fas fa-eye"></i> Ver
                    </Link>
                    <Button 
                      variant={tournament.registrationOpen ? "warning" : "success"} 
                      size="sm"
                      onClick={() => toggleRegistrationStatus(tournament._id, tournament.registrationOpen)}
                    >
                      {tournament.registrationOpen ? (
                        <><i className="fas fa-lock"></i> Fechar Inscrições</>
                      ) : (
                        <><i className="fas fa-lock-open"></i> Abrir Inscrições</>
                      )}
                    </Button>
                    <Button 
                      variant="danger" 
                      size="sm"
                      onClick={() => handleDeleteClick(tournament)}
                    >
                      <i className="fas fa-trash"></i> Excluir
                    </Button>
                  </div>
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
          Tem certeza que deseja excluir o torneio "{tournamentToDelete?.name}"? 
          <br /><br />
          <strong>Esta ação não pode ser desfeita e removerá todas as inscrições associadas.</strong>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            Excluir Torneio
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default TournamentManagement;
