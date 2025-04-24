import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Alert, Badge, Form } from 'react-bootstrap';
import axios from 'axios';
import { Link } from 'react-router-dom';

const PlayerManagement = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [playerToDelete, setPlayerToDelete] = useState(null);
  const [gameFilter, setGameFilter] = useState('all');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/players');
      setPlayers(res.data);
      setError('');
    } catch (err) {
      setError('Erro ao carregar jogadores. Por favor, tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (player) => {
    setPlayerToDelete(player);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`/api/players/${playerToDelete._id}`);
      setPlayers(players.filter(player => player._id !== playerToDelete._id));
      setSuccessMessage(`Jogador "${playerToDelete.name}" excluído com sucesso!`);
      setShowDeleteModal(false);
      setPlayerToDelete(null);
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      setError('Erro ao excluir jogador. Por favor, tente novamente.');
      console.error(err);
      setShowDeleteModal(false);
    }
  };

  const filteredPlayers = gameFilter === 'all' 
    ? players 
    : players.filter(player => player.game === gameFilter);

  const getGameName = (gameCode) => {
    switch(gameCode) {
      case 'cs2': return 'Counter Strike 2';
      case 'lol': return 'League of Legends';
      case 'valorant': return 'Valorant';
      case 'tft': return 'TFT';
      default: return gameCode;
    }
  };

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gerenciamento de Jogadores</h2>
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
            <option value="tft">TFT</option>
          </Form.Control>
        </Form.Group>
      </div>

      {loading ? (
        <p>Carregando jogadores...</p>
      ) : filteredPlayers.length === 0 ? (
        <Alert variant="info">Nenhum jogador encontrado.</Alert>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Nick</th>
              <th>Jogo</th>
              <th>Telefone</th>
              <th>CPF</th>
              {(gameFilter === 'all' || gameFilter === 'cs2') && (
                <>
                  <th>Steam ID</th>
                  <th>ID Gamers Club</th>
                </>
              )}
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredPlayers.map((player) => (
              <tr key={player._id}>
                <td>{player.name}</td>
                <td>{player.nickname}</td>
                <td>{getGameName(player.game)}</td>
                <td>{player.phone}</td>
                <td>{player.cpf}</td>
                {(gameFilter === 'all' || gameFilter === 'cs2') && (
                  <>
                    <td>{player.steamId || 'N/A'}</td>
                    <td>{player.gamersClubId || 'N/A'}</td>
                  </>
                )}
                <td>
                  <Link to={`/admin/players/${player._id}`} className="btn btn-sm btn-info me-2">
                    <i className="fas fa-eye"></i> Ver
                  </Link>
                  <Button 
                    variant="danger" 
                    size="sm"
                    onClick={() => handleDeleteClick(player)}
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
          Tem certeza que deseja excluir o jogador "{playerToDelete?.name}"? 
          <br /><br />
          <strong>Esta ação não pode ser desfeita.</strong>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            Excluir Jogador
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default PlayerManagement;
