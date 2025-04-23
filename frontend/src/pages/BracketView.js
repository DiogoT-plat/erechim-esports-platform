import React from 'react';
import { Card, Alert } from 'react-bootstrap';

const BracketView = () => {
  return (
    <>
      <h1 className="mb-4 gradient-text">Visualização de Chaveamento</h1>
      
      <Card>
        <Card.Header className="gradient-bg text-white">
          <h5 className="mb-0">Chaveamento</h5>
        </Card.Header>
        <Card.Body className="text-center py-5">
          <Alert variant="info">
            Esta página está em desenvolvimento. Em breve você poderá visualizar os chaveamentos dos campeonatos aqui.
          </Alert>
        </Card.Body>
      </Card>
    </>
  );
};

export default BracketView;
