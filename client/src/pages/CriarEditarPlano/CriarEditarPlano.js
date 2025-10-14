import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Button,
  Spinner,
  Alert,
  Form,
  Modal,
  InputGroup,
  ListGroup,
  FormControl,
} from "react-bootstrap";

const planoInicialVazio = {
  nome: "",
  objetivo: "",
  detalhamento: {
    segunda: { cafe_da_manha: [], almoco: [], jantar: [] },
    terca: { cafe_da_manha: [], almoco: [], jantar: [] },
    quarta: { cafe_da_manha: [], almoco: [], jantar: [] },
    quinta: { cafe_da_manha: [], almoco: [], jantar: [] },
    sexta: { cafe_da_manha: [], almoco: [], jantar: [] },
    sabado: { cafe_da_manha: [], almoco: [], jantar: [] },
    domingo: { cafe_da_manha: [], almoco: [], jantar: [] },
  },
};

export default function CriarEditarPlano() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [plano, setPlano] = useState(null);
  const [todosAlimentos, setTodosAlimentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [diaAtivo, setDiaAtivo] = useState("segunda");
  const [showModal, setShowModal] = useState(false);
  const [modalContext, setModalContext] = useState({
    dia: null,
    refeicao: null,
  });
  const [termoBusca, setTermoBusca] = useState("");
  const [resultadosBusca, setResultadosBusca] = useState([]);
  const [alimentoSelecionado, setAlimentoSelecionado] = useState(null);
  const [quantidade, setQuantidade] = useState(100);

  useEffect(() => {
    const fetchDadosIniciais = async () => {
      try {
        // Fazendo as requisições para alimentos primeiro, e depois para o plano
        const [alimentosRes, planoRes] = await Promise.all([
          fetch("http://localhost:3001/alimentos"),
          isEditing
            ? fetch(`http://localhost:3001/planos-alimentares/${id}`)
            : Promise.resolve(null), // Não carrega o plano caso não esteja editando
        ]);

        if (!alimentosRes.ok) {
          throw new Error("Falha ao buscar alimentos.");
        }

        const alimentosData = await alimentosRes.json();
        setTodosAlimentos(alimentosData.alimentos || alimentosData); // Ajusta a estrutura conforme os dados

        if (isEditing) {
          if (!planoRes.ok) {
            throw new Error("Plano alimentar não encontrado.");
          }
          const planoData = await planoRes.json();
          setPlano(planoData);
        } else {
          setPlano(planoInicialVazio);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDadosIniciais();
  }, [id, isEditing]);

  useEffect(() => {
    if (termoBusca.trim() === "" || alimentoSelecionado) {
      setResultadosBusca([]);
      return;
    }
    const resultadosFiltrados = todosAlimentos.filter((alimento) =>
      alimento.nome.toLowerCase().includes(termoBusca.toLowerCase())
    );
    setResultadosBusca(resultadosFiltrados);
  }, [termoBusca, todosAlimentos, alimentoSelecionado]);

  const alimentosMap = useMemo(() => {
    const map = new Map();
    todosAlimentos.forEach((alimento) => map.set(alimento.id, alimento));
    return map;
  }, [todosAlimentos]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPlano((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenModal = (dia, refeicao) => {
    setModalContext({ dia, refeicao });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setTermoBusca("");
    setAlimentoSelecionado(null);
    setQuantidade(100);
  };

  const handleSelectAlimento = (alimento) => {
    setAlimentoSelecionado(alimento);
    setTermoBusca(alimento.nome);
  };

  const handleAddAlimento = () => {
    if (!alimentoSelecionado || !modalContext.dia || !modalContext.refeicao)
      return;
    const { dia, refeicao } = modalContext;
    const novoItem = { id: alimentoSelecionado.id, gramas: quantidade };
    setPlano((prevPlano) => {
      const planoAtualizado = JSON.parse(JSON.stringify(prevPlano));
      planoAtualizado.detalhamento[dia][refeicao].push(novoItem);
      return planoAtualizado;
    });
    handleCloseModal();
  };

  const handleRemoveAlimento = (dia, refeicao, indexAlimento) => {
    setPlano((prevPlano) => {
      const planoAtualizado = JSON.parse(JSON.stringify(prevPlano));
      planoAtualizado.detalhamento[dia][refeicao].splice(indexAlimento, 1);
      return planoAtualizado;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    const url = isEditing
      ? `http://localhost:3001/planos-alimentares/${id}`
      : "http://localhost:3001/planos-alimentares";
    const method = isEditing ? "PUT" : "POST";
    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(plano),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Falha ao salvar o plano.");
        return res.json();
      })
      .then(() => {
        navigate(`/planos`);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  if (loading) {
    return (
      <Container className="text-center p-5">
        <Spinner animation="border" variant="success" />
        <p className="mt-2">Carregando dados...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="my-3">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!plano) {
    return null;
  }

  const diasDaSemana = Object.keys(plano.detalhamento);
  const nomesRefeicoes = {
    cafe_da_manha: "Café da Manhã",
    almoco: "Almoço",
    jantar: "Jantar",
  };
  const refeicoesDoDiaAtivo = plano.detalhamento[diaAtivo]
    ? Object.entries(plano.detalhamento[diaAtivo])
    : [];

  return (
    <div className="min-vh-100 bg-light p-4">
      <Container>
        <Form onSubmit={handleSubmit}>
          <h3 className="text-success fw-bold mb-4 text-center">
            {isEditing ? "Editar Plano Alimentar" : "Criar Plano Alimentar"}
          </h3>
          <div className="bg-white p-4 rounded-3 shadow-sm mb-4">
            <Form.Group as={Row} className="mb-3 align-items-center">
              <Form.Label column sm={2} className="fw-bold">
                Nome do Plano
              </Form.Label>
              <Col sm={10}>
                <Form.Control
                  type="text"
                  name="nome"
                  value={plano.nome}
                  onChange={handleInputChange}
                  required
                />
              </Col>
            </Form.Group>
            <Form.Group as={Row} className="mb-0 align-items-center">
              <Form.Label column sm={2} className="fw-bold">
                Objetivo
              </Form.Label>
              <Col sm={10}>
                <Form.Control
                  type="text"
                  name="objetivo"
                  value={plano.objetivo}
                  onChange={handleInputChange}
                  required
                />
              </Col>
            </Form.Group>
          </div>
          <div className="d-flex flex-wrap justify-content-center mb-4">
            {diasDaSemana.map((dia) => (
              <Button
                key={dia}
                onClick={() => setDiaAtivo(dia)}
                variant={diaAtivo === dia ? "success" : "outline-success"}
                className="m-1 fw-semibold"
              >
                {dia.charAt(0).toUpperCase() + dia.slice(1)}
              </Button>
            ))}
          </div>
          {refeicoesDoDiaAtivo.map(([refeicao, itens]) => {
            const caloriasTotaisRefeicao = itens.reduce((total, item) => {
              const alimentoInfo = alimentosMap.get(item.id);
              if (!alimentoInfo) return total;
              const proporcao = item.gramas / 100;
              return total + (alimentoInfo.calorias || 0) * proporcao;
            }, 0);
            return (
              <div
                key={refeicao}
                className="bg-white border-start border-4 border-success p-3 mb-3 rounded-3 shadow-sm"
              >
                <h5 className="fw-bold text-success mb-3">
                  {nomesRefeicoes[refeicao]}
                </h5>
                {itens.length === 0 ? (
                  <p className="text-muted small border-bottom pb-2">
                    Nenhum alimento adicionado.
                  </p>
                ) : (
                  <ul className="list-unstyled mb-0">
                    {itens.map((item, index) => {
                      const alimentoInfo = alimentosMap.get(item.id);
                      if (!alimentoInfo) {
                        return (
                          <li key={index} className="text-danger">
                            Alimento ID: {item.id} não encontrado!
                          </li>
                        );
                      }
                      const proporcao = item.gramas / 100;
                      const caloriasItem =
                        (alimentoInfo.calorias || 0) * proporcao;
                      const proteinaItem =
                        (alimentoInfo.proteina || 0) * proporcao;
                      const gorduraItem =
                        (alimentoInfo.gordura || 0) * proporcao;
                      const carboidratoItem =
                        (alimentoInfo.carboidrato || 0) * proporcao;
                      return (
                        <li
                          key={index}
                          className="d-flex justify-content-between align-items-center py-2 border-bottom"
                        >
                          <div>
                            <span className="text-secondary">
                              {alimentoInfo.nome}
                            </span>
                            <small className="d-block text-muted">
                              {item.gramas} g &bull; P:{" "}
                              {proteinaItem.toFixed(1)}g | G:{" "}
                              {gorduraItem.toFixed(1)}g | C:{" "}
                              {carboidratoItem.toFixed(1)}g
                            </small>
                          </div>
                          <div className="text-end">
                            <span className="me-3 text-muted small">
                              {caloriasItem.toFixed(1)} kcal
                            </span>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() =>
                                handleRemoveAlimento(diaAtivo, refeicao, index)
                              }
                            >
                              X
                            </Button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
                <div className="d-flex justify-content-between align-items-center pt-2 mt-2">
                  <Button
                    variant="outline-success"
                    size="sm"
                    onClick={() => handleOpenModal(diaAtivo, refeicao)}
                  >
                    + Adicionar Alimento
                  </Button>
                  <strong className="text-success">
                    Total: {caloriasTotaisRefeicao.toFixed(1)} kcal
                  </strong>
                </div>
              </div>
            );
          })}
          <Row className="mt-4">
            <Col className="text-center">
              <Button
                type="submit"
                variant="success"
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <Spinner as="span" animation="border" size="sm" />
                ) : isEditing ? (
                  "Salvar Alterações"
                ) : (
                  "Criar Plano Completo"
                )}
              </Button>
            </Col>
          </Row>
        </Form>
        <Modal show={showModal} onHide={handleCloseModal} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>
              Adicionar Alimento em{" "}
              {modalContext.dia
                ? `${nomesRefeicoes[modalContext.refeicao]} de ${modalContext.dia.charAt(0).toUpperCase() + modalContext.dia.slice(1)}`
                : ""}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <InputGroup className="mb-3">
              <FormControl
                placeholder="Digite o nome do alimento..."
                value={termoBusca}
                onChange={(e) => {
                  setTermoBusca(e.target.value);
                  setAlimentoSelecionado(null);
                }}
                autoFocus
              />
            </InputGroup>
            {resultadosBusca.length > 0 && (
              <ListGroup style={{ maxHeight: "200px", overflowY: "auto" }}>
                {resultadosBusca.map((alimento) => (
                  <ListGroup.Item
                    action
                    key={alimento.id}
                    onClick={() => handleSelectAlimento(alimento)}
                  >
                    {alimento.nome}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
            {alimentoSelecionado && (
              <div className="mt-4 p-3 border rounded bg-light">
                <h5 className="text-success">{alimentoSelecionado.nome}</h5>
                <p className="mb-2">Defina a quantidade:</p>
                <InputGroup>
                  <FormControl
                    type="number"
                    value={quantidade}
                    onChange={(e) =>
                      setQuantidade(parseFloat(e.target.value) || 0)
                    }
                  />
                  <InputGroup.Text>g</InputGroup.Text>
                </InputGroup>
                <Button
                  className="mt-3 w-100"
                  variant="success"
                  onClick={handleAddAlimento}
                >
                  Adicionar ao Plano
                </Button>
              </div>
            )}
          </Modal.Body>
        </Modal>
      </Container>
    </div>
  );
}
