import './nutriNavbar.css';
import logoVertical from '../../images/logo/gradient/nutriplanner-vertical-gradient.svg';
import logo from '../../images/logo/icon/nutriplanner-gradient.svg'
import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Button, Form, Container, Offcanvas, Row, Col, Image, Nav, Navbar} from 'react-bootstrap';



export default function NutriNavbar(props) {

  const [show, setShow] = useState(false);
  const handleToggle = () => setShow(true);
  const handleClose = () => setShow(false);

  return (
    <>
      <Navbar bg="light" expand="lg" sticky="top" className="p-3 border-bottom border-2">
        <Container fluid>
          {/* Navbar.Brand e Nav.Link funcionando como Link para manter a otimização do react*/}
          <Navbar.Brand as={Link} to="/" className="nav-item d-flex align-items-center gap-3">
            <Image src={logo} fluid alt="Logo Nutriplanner"
              width="32"
              height="32"
              className="d-inline-block align-top" />
            Nutriplanner</Navbar.Brand>
          {/* Botão que abre o Offcanvas disfarçado de Navbar.Toggle */}
          <Button as={Navbar.Toggle} onClick={handleToggle}>
          </Button>
          <Nav className="d-none d-lg-flex ms-auto">
            <Nav.Link as={Link} to="/login" className="nav-item mx-2">Login</Nav.Link>            
            <Nav.Link as={Link} to="/dashboard" className="nav-item mx-2">Dashboard</Nav.Link>
            <Nav.Link as={Link} to="/receitas" className="nav-item mx-2">Receitas</Nav.Link>
            <Nav.Link as={Link} to="/planejamento" className="nav-item mx-2">Planejamento</Nav.Link>
            <Nav.Link as={Link} to="/relatorio" className="nav-item mx-2">Relatório</Nav.Link>
            <Nav.Link as={Link} to="/compras" className="nav-item mx-2">Compras</Nav.Link>
            <Nav.Link as={Link} to="/nutricionista" className="nav-item mx-2">Nutricionista</Nav.Link>
            <Nav.Link as={Link} to="/perfil" className="nav-item mx-2">Perfil</Nav.Link>
          </Nav>
        </Container>
      </Navbar>

      {/* Offcanvas lateral para telas pequenas */}
      <Offcanvas show={show} onHide={handleClose} placement="start" className="border-bottom border-2">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title className="nav-item d-flex align-items-center gap-3">
            <Image src={logo} fluid alt="Logo Nutriplanner"
              width="32"
              height="32"
              className="d-inline-block align-top" />Nutriplanner</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="text-center">
          <Nav.Link as={Link} to="/login" className="nav-item mx-2">Login</Nav.Link>
          <Nav.Link as={Link} to="/dashboard" className="nav-item mx-2" onClick={handleClose}>Dashboard</Nav.Link>
          <Nav.Link as={Link} to="/receitas" className="nav-item mx-2" onClick={handleClose}>Receitas</Nav.Link>
          <Nav.Link as={Link} to="/planejamento" className="nav-item mx-2" onClick={handleClose}>Planejamento</Nav.Link>
          <Nav.Link as={Link} to="/relatorio" className="nav-item mx-2" onClick={handleClose}>Relatório</Nav.Link>
          <Nav.Link as={Link} to="/compras" className="nav-item mx-2" onClick={handleClose}>Compras</Nav.Link>
          <Nav.Link as={Link} to="/nutricionista" className="nav-item mx-2" onClick={handleClose}>Nutricionista</Nav.Link>
          <Nav.Link as={Link} to="/perfil" className="nav-item mx-2" onClick={handleClose}>Perfil</Nav.Link>

        </Offcanvas.Body>
      </Offcanvas>
    </>
  )

}