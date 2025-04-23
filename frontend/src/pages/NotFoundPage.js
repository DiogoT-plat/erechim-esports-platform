import React from 'react';
import { Card, Alert } from 'react-bootstrap';

const NotFoundPage = () => {
  return (
    <div className="text-center py-5">
      <h1 className="gradient-text mb-4">404 - Página Não Encontrada</h1>
      <Card>
        <Card.Body className="py-5">
          <Alert variant="warning">
            <p>A página que você está procurando não existe ou foi movida.</p>
            <p>Por favor, verifique o endereço ou retorne para a página inicial.</p>
          </Alert>
        </Card.Body>
      </Card>
    </div>
  );
};

export default NotFoundPage;
