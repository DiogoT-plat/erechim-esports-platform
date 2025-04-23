import React from 'react';
import { Container, Row, Col, Image } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="bg-dark text-white py-4 mt-5">
      <Container>
        <Row className="align-items-center">
          <Col md={4} className="text-center text-md-start mb-3 mb-md-0">
            <div className="d-flex align-items-center justify-content-center justify-content-md-start">
              <Image 
                src="/logo.png" 
                alt="Erechim E-sports Festival" 
                width="40" 
                height="40" 
                className="me-2" 
              />
              <span>Erechim E-sports Festival</span>
            </div>
          </Col>
          <Col md={4} className="text-center mb-3 mb-md-0">
            <p className="mb-0">© {new Date().getFullYear()} Todos os direitos reservados</p>
          </Col>
          <Col md={4} className="text-center text-md-end">
            <div>
              <a href="#" className="text-white me-3">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="text-white me-3">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-white me-3">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-white">
                <i className="fab fa-discord"></i>
              </a>
            </div>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
