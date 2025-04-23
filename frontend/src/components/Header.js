import React from 'react';
import { Navbar, Nav, Container, Button, Dropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faSignOutAlt, faTrophy, faUsers, faGamepad } from '@fortawesome/free-solid-svg-icons';

const Header = ({ user, setUser }) => {
  const navigate = useNavigate();

  const logoutHandler = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
    navigate('/login');
  };

  return (
    <header>
      <Navbar variant="dark" expand="lg" className="navbar-dark">
        <Container>
          <Navbar.Brand as={Link} to="/">
            <img
              src="/logo.png"
              width="40"
              height="40"
              className="d-inline-block align-top me-2"
              alt="Erechim E-SPORTS Festival Logo"
            />
            <span className="gradient-text fw-bold">Erechim E-SPORTS Festival</span>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link as={Link} to="/">
                <FontAwesomeIcon icon={faGamepad} className="me-1" /> Início
              </Nav.Link>
              <Nav.Link as={Link} to="/tournaments">
                <FontAwesomeIcon icon={faTrophy} className="me-1" /> Campeonatos
              </Nav.Link>
              
              {user ? (
                <Dropdown align="end">
                  <Dropdown.Toggle variant="dark" id="dropdown-user">
                    <FontAwesomeIcon icon={faUser} className="me-1" /> {user.name}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    {user.role === 'admin' && (
                      <Dropdown.Item as={Link} to="/admin">
                        Painel de Administração
                      </Dropdown.Item>
                    )}
                    {(user.role === 'captain' || user.role === 'admin') && (
                      <>
                        <Dropdown.Item as={Link} to="/captain">
                          Painel do Capitão
                        </Dropdown.Item>
                        <Dropdown.Item as={Link} to="/captain/team/register">
                          Registrar Time
                        </Dropdown.Item>
                        <Dropdown.Item as={Link} to="/captain/player/register">
                          Registrar Jogadores
                        </Dropdown.Item>
                      </>
                    )}
                    {(user.role === 'player' || user.role === 'admin') && (
                      <Dropdown.Item as={Link} to="/player/tft/register">
                        Registrar para TFT
                      </Dropdown.Item>
                    )}
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={logoutHandler}>
                      <FontAwesomeIcon icon={faSignOutAlt} className="me-1" /> Sair
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              ) : (
                <>
                  <Nav.Link as={Link} to="/login">
                    <Button variant="outline-light" size="sm">
                      Login
                    </Button>
                  </Nav.Link>
                  <Nav.Link as={Link} to="/register">
                    <Button className="btn-gradient" size="sm">
                      Cadastrar
                    </Button>
                  </Nav.Link>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;
