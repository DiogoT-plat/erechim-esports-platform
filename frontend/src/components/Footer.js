import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer mt-auto py-3">
      <Container>
        <Row>
          <Col md={6} className="text-center text-md-start">
            <img
              src="/logo.png"
              width="30"
              height="30"
              className="d-inline-block align-top me-2"
              alt="Erechim E-SPORTS Festival Logo"
            />
            <span className="gradient-text fw-bold">Erechim E-SPORTS Festival</span>
          </Col>
          <Col md={6} className="text-center text-md-end">
            <p className="mb-0">
              &copy; {currentYear} Erechim E-SPORTS Festival. Todos os direitos reservados.
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
