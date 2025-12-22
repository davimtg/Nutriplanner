import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import api from "../../services/api";

function Planos() {
  const navigate = useNavigate();
  const [planos, setPlanos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [termoBusca, setTermoBusca] = useState("");

  useEffect(() => {
    // --- CORREÇÃO PRINCIPAL AQUI ---
    // Ajustamos a URL para corresponder ao nome do seu arquivo no servidor.
    // CORREÇÃO PRINCIPAL AQUI
    // Ajustamos a URL para corresponder ao nome do seu arquivo no servidor.
    api.get("/planos-alimentares")
      .then((response) => {
        // A resposta do json-server já é o array, então 'data' está correto.
        setPlanos(response.data);
      })
      .catch((error) => {
        console.error("Erro ao buscar os planos:", error);
        setError(error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const planosFiltrados = useMemo(
    () =>
      planos.filter(
        (plano) =>
          plano.nome &&
          plano.nome.toLowerCase().includes(termoBusca.toLowerCase())
      ),
    [termoBusca, planos]
  );

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "300px" }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Carregando...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
      return <Container className="my-3"><Alert variant="danger">{error}</Alert></Container>;
  }

  return (
    <Container className="bg-light border rounded-4 my-3">
      <Row className="align-items-center py-3 px-4 border-bottom">
        <Col xs={12} md={6} className="mb-3 mb-md-0">
          <h2>Planos Alimentares</h2>
        </Col>
        <Col xs={12} md={6} className="d-flex align-items-center justify-content-between justify-content-md-end">
          <Button
            className="me-2 text-nowrap"
            onClick={() => navigate("/planos/criar")}
            variant= "success"
          >
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
        <Col xs={12} className="p-4">
          {planos.length > 0 ? (
            planosFiltrados.length > 0 ? (
              <ListGroup>
                {planosFiltrados.map((plano) => (
                  <ListGroup.Item
                    key={plano.id}
                    className="d-flex justify-content-between align-items-start align-items-center mb-2 border rounded"
                  >
                    <div>
                      <div className="fw-bold">{plano.nome || "Plano sem nome"}</div>
                      <small className="text-muted">
                        {plano.objetivo || "Objetivo não definido"}
                      </small>
                    </div>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      className="text-nowrap"
                      onClick={() => navigate(`/planos/${plano.id}`)}
                    >
                      Editar Plano
                    </Button>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            ) : (
              <Alert variant="info" className="text-center m-0">
                {termoBusca
                  ? `Nenhum plano alimentar encontrado com o termo "${termoBusca}".`
                  : "Nenhum plano com nome cadastrado."}
              </Alert>
            )
          ) : (
            <Alert variant="info" className="text-center m-0">
              Nenhum plano alimentar cadastrado. Clique em 'Criar Plano' para começar.
            </Alert>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default Planos;