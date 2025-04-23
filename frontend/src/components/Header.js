import React from 'react';
import { Navbar, Nav, Container, NavDropdown, Image } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../actions/userActions';

const Header = () => {
  const dispatch = useDispatch();
  const userLogin = useSelector(state => state.userLogin);
  const { userInfo } = userLogin;

  const logoutHandler = () => {
    dispatch(logout());
  };

  return (
    <header>
      <Navbar bg="dark" variant="dark" expand="lg" collapseOnSelect>
        <Container>
          <LinkContainer to="/">
            <Navbar.Brand className="d-flex align-items-center">
              <Image 
                src="/logo.png" 
                alt="Erechim E-sports Festival" 
                width="40" 
                height="40" 
                className="me-2" 
              />
              Erechim E-sports Festival
            </Navbar.Brand>
          </LinkContainer>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <LinkContainer to="/tournaments">
                <Nav.Link>Torneios</Nav.Link>
              </LinkContainer>

              {userInfo ? (
                <>
                  {userInfo.isAdmin ? (
                    <NavDropdown title="Admin" id="adminmenu">
                      <LinkContainer to="/admin/dashboard">
                        <NavDropdown.Item>Dashboard</NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer to="/admin/tournaments">
                        <NavDropdown.Item>Torneios</NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer to="/admin/teams">
                        <NavDropdown.Item>Times</NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer to="/admin/players">
                        <NavDropdown.Item>Jogadores</NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer to="/admin/reports">
                        <NavDropdown.Item>Relatórios</NavDropdown.Item>
                      </LinkContainer>
                    </NavDropdown>
                  ) : (
                    <NavDropdown title="Capitão" id="captainmenu">
                      <LinkContainer to="/captain/dashboard">
                        <NavDropdown.Item>Dashboard</NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer to="/captain/team">
                        <NavDropdown.Item>Meu Time</NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer to="/captain/players">
                        <NavDropdown.Item>Jogadores</NavDropdown.Item>
                      </LinkContainer>
                    </NavDropdown>
                  )}
                  <NavDropdown title={userInfo.name} id="username">
                    <LinkContainer to="/profile">
                      <NavDropdown.Item>Perfil</NavDropdown.Item>
                    </LinkContainer>
                    <LinkContainer to="/change-password">
                      <NavDropdown.Item>Alterar Senha</NavDropdown.Item>
                    </LinkContainer>
                    <NavDropdown.Item onClick={logoutHandler}>
                      Sair
                    </NavDropdown.Item>
                  </NavDropdown>
                </>
              ) : (
                <>
                  <LinkContainer to="/login">
                    <Nav.Link>
                      <i className="fas fa-user"></i> Login
                    </Nav.Link>
                  </LinkContainer>
                  <LinkContainer to="/register">
                    <Nav.Link>
                      <i className="fas fa-user-plus"></i> Cadastro
                    </Nav.Link>
                  </LinkContainer>
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
