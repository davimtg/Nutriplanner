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
import styles from "./ListaPlanos.module.css";

function ListaPlanos({ planos }) {
  const [termoBusca, setTermoBusca] = useState("");

  const planosFiltrados = useMemo(
    () =>
      planos.filter((plano) =>
        plano.nome.toLowerCase().includes(termoBusca.toLowerCase())
      ),
    [termoBusca, planos]
  );

  return (
    <Container className="bg-light border rounded-4 my-3">
      <Row className="align-items-center py-3 px-4 border-bottom">
        <Col xs={12} md={6} className="mb-3 mb-md-0">
          <h2>Planos Alimentares</h2>
        </Col>
        <Col
          xs={12}
          md={6}
          className="d-flex align-items-center justify-content-between justify-content-md-end"
        >
          <Button className={`${styles.btnCorPrincipal} me-2 text-nowrap`}>
            Criar Plano
          </Button>
          <Form className="flex-grow-1" style={{ maxWidth: "250px" }}>
            <Form.Control
              type="search"
              placeholder="Buscar plano..."
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
            />
          </Form>
        </Col>
      </Row>

      <Row>
        <Col xs={12}>
          {planosFiltrados.length > 0 ? (
            <ListGroup className="my-2">
              {planosFiltrados.map((plano) => (
                <ListGroup.Item
                  key={plano.id}
                  className="d-flex justify-content-between align-items-start align-items-center"
                >
                  <div>
                    <div className="fw-bold">{plano.nome}</div>
                    {plano.objetivo}
                  </div>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    className="text-nowrap"
                  >
                    Visualizar Plano
                  </Button>
                </ListGroup.Item>
              ))}
            </ListGroup>
          ) : (
            <Alert variant="info" className="text-center">
              Nenhum plano alimentar encontrado com o termo "{termoBusca}".
            </Alert>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default ListaPlanos;