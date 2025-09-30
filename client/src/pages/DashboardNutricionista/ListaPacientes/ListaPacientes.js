import React, { useState, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  ListGroup,
  Alert,
} from "react-bootstrap";
import styles from "./ListaPacientes.module.css"

function ListaPacientes({ pacientes = [] }) {
  const [termoBusca, setTermoBusca] = useState("");

  const pacientesFiltrados = useMemo(
    () =>
      pacientes.filter((paciente) =>
        paciente.nome.toLowerCase().includes(termoBusca.toLowerCase())
      ),
    [termoBusca, pacientes]
  );

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
                  className="d-md-flex justify-content-md-between align-items-md-center"
                >
                  <div>
                    <div className="fw-bold">{paciente.nome}</div>
                    <small className="text-muted">{paciente.objetivo}</small>
                  </div>
                  <div className="d-flex gap-2 mt-2 mt-md-0 justify-content-end">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      className="text-nowrap"
                    >
                      Visualizar Relatório
                    </Button>
                    <Button className={styles.btnCorPrincipal}>
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

export default ListaPacientes;
