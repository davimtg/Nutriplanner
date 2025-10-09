import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Tabs,
  Tab,
  Button,
  Spinner,
  Alert,
} from "react-bootstrap";
import styles from "./PlanoDetalhes.module.css"; // Importando o CSS modular

export default function PlanoDetalhes({ plano: planoProp }) {
  const [plano, setPlano] = useState(planoProp);
  const [loading, setLoading] = useState(!planoProp);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!planoProp && id) {
      setLoading(true);

      fetch(`http://localhost:3001/planos/${id}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error("Plano não encontrado");
          }
          return res.json();
        })
        .then((data) => {
          setPlano(data);
        })
        .catch((error) => {
          console.error("Erro na busca:", error);
          setPlano(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else if (planoProp) {
      setPlano(planoProp);
      setLoading(false);
    }
  }, [id, planoProp]);

  if (loading) {
    return (
      <Container className="text-center p-5">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (!plano) {
    return (
      <Container className="my-3">
        <Alert variant="warning">
          <Alert.Heading>Plano não encontrado</Alert.Heading>
          <p>
            O plano que você está tentando acessar não foi encontrado no
            servidor.
          </p>
          <Button variant="outline-dark" onClick={() => navigate("/planos")}>
            Voltar para a Lista de Planos
          </Button>
        </Alert>
      </Container>
    );
  }

  const diasDaSemana = Object.keys(plano.detalhamento);

  const nomesRefeicoes = {
    cafe_da_manha: "Café da Manhã",
    lanche_da_manha: "Lanche da Manhã",
    almoco: "Almoço",
    lanche_da_tarde: "Lanche da Tarde",
    jantar: "Jantar",
    ceia: "Ceia",
  };

  return (
    <Container className="my-4">
      <Row className="mb-3 align-items-center">
        <Col>
          <h1 className={styles.titulo}>{plano.nome}</h1>
          <p className="lead">{plano.objetivo}</p>
          <p className="text-muted">
            Calorias Diárias (Aprox.):{" "}
            <strong>{plano.calorias_diarias_aprox} kcal</strong>
          </p>
        </Col>
        <Col xs="auto">
          {id && (
            <Button variant="primary" className={styles.botao}>
              Editar Plano
            </Button>
          )}
        </Col>
      </Row>

      <Tabs
        defaultActiveKey={diasDaSemana[0]}
        id="plano-semanal-tabs"
        className="mb-3"
        fill
      >
        {diasDaSemana.map((dia) => (
          <Tab
            eventKey={dia}
            title={dia.charAt(0).toUpperCase() + dia.slice(1)}
            key={dia}
          >
            <Row xs={1} md={2} lg={3} className="g-4 mt-2">
              {Object.entries(plano.detalhamento[dia]).map(
                ([refeicao, detalhes]) => (
                  <Col key={refeicao}>
                    <Card className={`h-100 ${styles.card}`}>
                      <Card.Header as="h6">
                        {nomesRefeicoes[refeicao] ||
                          refeicao.replace(/_/g, " ")}
                      </Card.Header>
                      <Card.Body>
                        <Card.Text>{detalhes.descricao}</Card.Text>
                      </Card.Body>
                      <Card.Footer className="text-muted text-end">
                        <strong>{detalhes.calorias} kcal</strong>
                      </Card.Footer>
                    </Card>
                  </Col>
                )
              )}
            </Row>
          </Tab>
        ))}
      </Tabs>
    </Container>
  );
}
