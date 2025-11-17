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
  Modal,
} from "react-bootstrap";
import { useDispatch, useSelector } from 'react-redux';
import { abrirChat, fetchUserMessages } from '../../redux/chatSlice';

function VincularPlanoModal({ show, handleClose, paciente, onSave }) {
  const [planos, setPlanos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [termoBuscaPlano, setTermoBuscaPlano] = useState("");
  const [planoSelecionadoId, setPlanoSelecionadoId] = useState(paciente.planoId || null);

  useEffect(() => {
    if (show) {
      setLoading(true);
      setError(null);
      setTermoBuscaPlano("");
      setPlanoSelecionadoId(paciente.planoId || null);

      fetch("http://localhost:3001/planos-alimentares")
        .then((response) => {
          if (!response.ok) {
            throw new Error("Falha ao buscar planos alimentares.");
          }
          return response.json();
        })
        .then((data) => {
          setPlanos(data);
        })
        .catch((err) => {
          console.error("Erro ao buscar planos:", err);
          setError("Não foi possível carregar os planos alimentares.");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [show, paciente.planoId]);

  const planosFiltrados = useMemo(() =>
    planos.filter((plano) =>
      plano.nome && plano.nome.toLowerCase().includes(termoBuscaPlano.toLowerCase())
    ),
    [termoBuscaPlano, planos]
  );

  const handleSaveChanges = () => {
    if (planoSelecionadoId) {
      onSave(paciente.id, planoSelecionadoId);
    }
  };

  const handleDesvincular = () => {
    onSave(paciente.id, null); // Passa null para desvincular o plano
  };

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Vincular Plano para {paciente?.nome}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group className="mb-3">
          <Form.Control
            type="search"
            placeholder="Buscar pelo nome do plano..."
            value={termoBuscaPlano}
            onChange={(e) => setTermoBuscaPlano(e.target.value)}
          />
        </Form.Group>
        {loading ? (
          <div className="text-center">
            <Spinner animation="border" />
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : (
          <ListGroup className="planos-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {planosFiltrados.length > 0 ? (
              planosFiltrados.map((plano) => (
                <ListGroup.Item
                  key={plano.id}
                  action
                  active={planoSelecionadoId === plano.id}
                  onClick={() => setPlanoSelecionadoId(plano.id)}
                >
                  <div className="fw-bold">{plano.nome || "Plano sem nome"}</div>
                  <small className="text-muted">{plano.objetivo}</small>
                </ListGroup.Item>
              ))
            ) : (
              <ListGroup.Item disabled>Nenhum plano encontrado.</ListGroup.Item>
            )}
          </ListGroup>
        )}
      </Modal.Body>
      <Modal.Footer>
        {paciente.planoId && (
          <Button variant="danger" onClick={handleDesvincular} className="me-auto">
            Desvincular
          </Button>
        )}
        <Button variant="secondary" onClick={handleClose}>
          Cancelar
        </Button>
        <Button variant="success" onClick={handleSaveChanges} disabled={!planoSelecionadoId}>
          Salvar Alterações
        </Button>
      </Modal.Footer>
    </Modal>
  );
}


// --- Componente Principal da Página ---
function Pacientes() {
  const [pacientes, setPacientes] = useState([]);
  const [planos, setPlanos] = useState([]); // Estado para armazenar os planos
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [termoBusca, setTermoBusca] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [pacienteSelecionado, setPacienteSelecionado] = useState(null);
  const currentUser = useSelector(state => state.user.userData);
  const dispatch = useDispatch();

  useEffect(() => {
    // Busca pacientes e planos simultaneamente
    Promise.all([
      fetch("http://localhost:3001/usuarios").then(res => {
        if (!res.ok) throw new Error("Falha ao buscar usuários.");
        return res.json();
      }),
      fetch("http://localhost:3001/planos-alimentares").then(res => {
        if (!res.ok) throw new Error("Falha ao buscar planos.");
        return res.json();
      })
    ])
      .then(([usuariosData, planosData]) => {
        const clientes = usuariosData["lista-de-usuarios"].filter(
          (usuario) => usuario.tipo.name === "cliente"
        );
        setPacientes(clientes);
        setPlanos(planosData);
      })
      .catch((error) => {
        console.error("Erro ao buscar dados:", error);
        setError("Não foi possível carregar os dados. Verifique o json-server.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Cria um mapa de ID do plano para o nome do plano para busca rápida
  const planosMap = useMemo(() => {
    return new Map(planos.map(plano => [plano.id, plano.nome]));
  }, [planos]);

  const pacientesFiltrados = useMemo(
    () =>
      pacientes.filter((paciente) =>
        paciente.nome.toLowerCase().includes(termoBusca.toLowerCase())
      ),
    [termoBusca, pacientes]
  );

  const handleOpenModal = (paciente) => {
    setPacienteSelecionado(paciente);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setPacienteSelecionado(null);
  };

  const handleAbrirChat = (paciente) => {
    dispatch(abrirChat(paciente));
    dispatch(fetchUserMessages({
      remetenteId: currentUser.id,
      destinatarioId: paciente.id
    }))
  };

  const handleSalvarPlano = (pacienteId, planoId) => {
    const pacientesAtualizados = pacientes.map(p => {
      if (p.id === pacienteId) {
        return { ...p, planoId: planoId };
      }
      return p;
    });
    setPacientes(pacientesAtualizados);

    console.log(`Simulando PATCH para o paciente ${pacienteId}:`, { planoId: planoId });
    // AQUI VOCÊ FARIA A CHAMADA REAL PARA A API (PATCH/PUT)
    // fetch(`http://localhost:3001/usuarios/lista-de-usuarios/${pacienteId}`, {
    //   method: 'PATCH',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ planoId: planoId })
    // }).then(res => res.json()).then(data => console.log('Paciente atualizado:', data));

    handleCloseModal();
  };

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

  if (error) {
    return (
      <Container className="text-center my-3">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <>
      <style type="text/css">
        {`
          .planos-list .list-group-item.active {
            background-color: #198754 !important;
            border-color: #198754 !important;
            color: white !important;
          }
          /* Estilo para o texto do item ativo, para garantir que o texto secundário não fique branco */
          .planos-list .list-group-item.active small {
            color: rgba(255, 255, 255, 0.75) !important;
          }
        `}
      </style>
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
        <Row className="p-3">
          <Col xs={12}>
            {pacientesFiltrados.length > 0 ? (
              <ListGroup>
                {pacientesFiltrados.map((paciente) => {
                  const nomeDoPlano = planosMap.get(paciente.planoId) || "Nenhum";
                  return (
                    <ListGroup.Item
                      key={paciente.id}
                      className="d-block d-md-flex justify-content-md-between align-items-md-center"
                    >
                      <div className="text-center text-md-start mb-3 mb-md-0">
                        <div className="fw-bold">{paciente.nome}</div>
                        {paciente.objetivo && (
                          <small className="d-block text-muted">
                            Objetivo: {paciente.objetivo}
                          </small>
                        )}
                        <small className="d-block text-muted">
                          Planejamento Atual: {nomeDoPlano}
                        </small>
                      </div>
                      <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                        <Button variant="outline-secondary" size="sm">
                          Visualizar Relatório
                        </Button>
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => handleOpenModal(paciente)}
                        >
                          Plano Alimentar
                        </Button>
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => handleAbrirChat(paciente)}
                        >
                          Chat
                        </Button>
                      </div>
                    </ListGroup.Item>
                  );
                })}
              </ListGroup>
            ) : (
              <Alert variant="info" className="text-center">
                Nenhum paciente encontrado com o termo "{termoBusca}".
              </Alert>
            )}
          </Col>
        </Row>
      </Container>

      {pacienteSelecionado && (
        <VincularPlanoModal
          show={showModal}
          handleClose={handleCloseModal}
          paciente={pacienteSelecionado}
          onSave={handleSalvarPlano}
        />
      )}
    </>
  );
}

export default Pacientes;