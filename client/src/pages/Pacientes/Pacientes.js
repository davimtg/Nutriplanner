import React, { useState, useMemo, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  ListGroup,
  Alert,
  Spinner,
} from "react-bootstrap";
import styles from "./Pacientes.module.css";

function Pacientes() {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [termoBusca, setTermoBusca] = useState("");

  useEffect(() => {
    fetch("http://localhost:3001/pacientes")
      .then((response) => response.json())
      .then((data) => {
        setPacientes(data);
      })
      .catch((error) => console.error("Erro ao buscar os pacientes:", error))
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const pacientesFiltrados = useMemo(
    () =>
      pacientes.filter((paciente) =>
        paciente.nome.toLowerCase().includes(termoBusca.toLowerCase())
      ),
    [termoBusca, pacientes]
  );

  if (loading) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "300px" }}
      >
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Carregando...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container className="bg-light border rounded-4 my-3">
      <Row className="align-items-center py-3 px-4 border-bottom">
        <Col xs={12} md={6} className="mb-3 mb-md-0">
          <h2>Lista de Pacientes</h2>
        </Col>

        <Col
          xs={12}
          md={6}
          className="d-flex align-items-center justify-content-between justify-content-md-end"
        >
          <Form className="flex-grow-1" style={{ maxWidth: "250px" }}>
            <Form.Control
              type="search"
              placeholder="Buscar paciente..."
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
            />
          </Form>
        </Col>
      </Row>
      <Row className="py-2">
        <Col xs={12}>
          {pacientesFiltrados.length > 0 ? (
            <ListGroup>
              {pacientesFiltrados.map((paciente) => (
                <ListGroup.Item
                  key={paciente.id}
                  className="d-block d-md-flex justify-content-md-between align-items-md-center"
                >
                  <div className="text-center text-md-start mb-3 mb-md-0">
                    <div className="fw-bold">{paciente.nome}</div>
                    <small className="text-muted">{paciente.objetivo}</small>
                  </div>
                  <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                    <Button variant="outline-secondary" size="sm">
                      Visualizar Relatório
                    </Button>
                    <Button size="sm" className={styles.btnCorPrincipal}>
                      Vincular Plano
                    </Button>
                    <Button size="sm" className={styles.btnCorPrincipal}>
                      Chat
                    </Button>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          ) : (
            <Alert variant="info" className="text-center">
              Nenhum paciente encontrado com o termo "{termoBusca}".
            </Alert>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default Pacientes;