import React, { useState, useMemo, useEffect} from "react";
import { useNavigate } from 'react-router-dom';
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
import styles from "./Planos.module.css";

function Planos() {
  const navigate = useNavigate();
  const [planos, setPlanos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [termoBusca, setTermoBusca] = useState("");

  useEffect(() => {
    fetch("http://localhost:3001/planos")
      .then((response) => response.json())
      .then((data) => {
        setPlanos(data);
      })
      .catch((error) => console.error("Erro ao buscar os planos:", error))
      .finally(() => {
        setLoading(false);
      });
  }, []);
  const planosFiltrados = useMemo(
    () =>
      planos.filter((plano) =>
        plano.nome.toLowerCase().includes(termoBusca.toLowerCase())
      ),
    [termoBusca, planos]
  );
  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
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
                    <small className="text-muted">{plano.objetivo || "Objetivo não definido"}</small>
                  </div>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    className="text-nowrap"
                    onClick={() => navigate(`/planos/${plano.id}`)}
                  >
                    Visualizar Plano
                  </Button>
                </ListGroup.Item>
              ))}
            </ListGroup>
          ) : (
            <Alert variant="info" className="text-center">
              {termoBusca
                ? `Nenhum plano alimentar encontrado com o termo "${termoBusca}".`
                : "Nenhum plano alimentar cadastrado."
              }
            </Alert>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default Planos;
