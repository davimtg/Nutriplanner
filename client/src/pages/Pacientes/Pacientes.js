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
import api from '../../services/api';
import { processarDadosRelatorio } from '../../components/Utils/nutricao';
import { gerarRelatorioPDF } from '../../components/Utils/gerarPdf';


// ... (Mantenha o componente VincularPlanoModal exatamente como estava) ...
function VincularPlanoModal({ show, handleClose, paciente, onSave }) {
  // ... código do modal ... (sem alterações)
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

      api.get("/planos-alimentares")
        .then((response) => {
           // Backend returns array directly or inside key depending on implementation, 
           // but crudFactory returns array.
           const data = response.data;
           const lista = Array.isArray(data) ? data : data['planos-alimentares'] || [];
           setPlanos(lista);
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
    onSave(paciente.id, null); 
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
  const [planos, setPlanos] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [termoBusca, setTermoBusca] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [pacienteSelecionado, setPacienteSelecionado] = useState(null);
  const currentUser = useSelector(state => state.user.userData);
  const dispatch = useDispatch();


  const handleBaixarRelatorio = async (e, paciente) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Feedback imediato
    // alert(`Gerando relatório para ${paciente.nome}...`); // Opcional, ou usar um toast/state
    console.log("Iniciando processo para:", paciente.nome);

    try {
        /* const confirmacao = window.confirm(`Deseja baixar o relatório de ${paciente.nome}?`);
        if (!confirmacao) return; */
        
        // Vamos usar um indicador visual temporário no botão? 
        // Por enquanto, confiar que o processo é rápido. 
        // Se demorar, o browser vai mostrar loading.
        document.body.style.cursor = 'wait';

        console.log("Iniciando busca de dados...");
        // Precisamos: Diario do usuario, Todos Alimentos, Todos Planos
        const [diarioRes, alimentosRes, planosRes] = await Promise.all([
             api.get(`/diario-alimentar?usuarioId=${paciente.id}`),
             api.get('/alimentos'),
             api.get('/planos-alimentares')
        ]);
        console.log("Dados recebidos do servidor.");

        const diarioData = diarioRes.data;
        const alimentosData = alimentosRes.data;
        // Handle potential wrapper for plans
        const planosData = planosRes.data;
        const todosPlanos = Array.isArray(planosData) ? planosData : planosData['planos-alimentares'] || [];

        // 2. Montar estrutura para processamento
        const dbMontado = {
            alimentos: alimentosData,
            diario_alimentar: diarioData
        };

        const dadosProcessados = processarDadosRelatorio(paciente.id, dbMontado);

        if (dadosProcessados.length === 0) {
            alert("Este paciente não possui registros no diário alimentar.");
            return;
        }

        // 3. Montar objeto metas (necessário para o PDF)
        const metasUsuario = {
            calorias: 2000,
            proteinas: 150,
            carboidratos: 250,
            gorduras: 70,
            ...paciente // Spread com dados do paciente (nome, objetivo, etc)
        };
        
        // 4. Gerar PDF
        // Encontrar o plano ativo do paciente na lista de planos
        const planoAtivo = todosPlanos.find(p => p.id === paciente.planoId);
        
        gerarRelatorioPDF({
          dados: dadosProcessados,
          usuario: paciente,
          metas: metasUsuario,
          plano: planoAtivo
        });
        
    } catch (error) {
        console.error("Erro ao gerar relatório:", error);
        alert("Erro ao gerar o relatório:\n" + error.message);
    } finally {
        document.body.style.cursor = 'default';
    }
  };

  useEffect(() => {
    // Busca planos primeiro, depois pacientes do nutricionista
    // Poderia ser paralelo, mas vamos garantir o ID do nutricionista
    if (!currentUser || !currentUser.id) return;

    setLoading(true);

    Promise.all([
      // O filtro "Option B": buscar apenas do nutricionista logado
      api.get("/usuarios", { params: { nutricionistaId: currentUser.id } }),
      api.get("/planos-alimentares")
    ])
      .then(([usuariosRes, planosRes]) => {
        const usuariosData = usuariosRes.data;
        const planosData = planosRes.data;

        // Adaptação: Se a API retornar objeto com chave 'lista-de-usuarios' (legado) ou array direto
        const listaUsuarios = Array.isArray(usuariosData) ? usuariosData : usuariosData["lista-de-usuarios"] || [];
        
        // O backend já filtra, mas garantimos que são clientes (caso o filtro backend falhe ou traga outros tipos)
        const clientes = listaUsuarios.filter(
          (usuario) => usuario.tipo && (usuario.tipo.name === "cliente" || usuario.tipo.id === 1)
        );
        
        const listaPlanos = Array.isArray(planosData) ? planosData : planosData['planos-alimentares'] || [];

        setPacientes(clientes);
        setPlanos(listaPlanos);

      })
      .catch((err) => {
        console.error("Erro ao buscar dados:", err);
        setError("Não foi possível carregar os dados. Tente novamente mais tarde.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [currentUser]);

  const planosMap = useMemo(() => {
    return new Map(planos.map(plano => [plano.id, plano.nome]));
  }, [planos]);

  const pacientesFiltrados = useMemo(
    () =>
      pacientes.filter((paciente) =>
        paciente.nome && paciente.nome.toLowerCase().includes(termoBusca.toLowerCase())
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

  const handleSalvarPlano = async (pacienteId, planoId) => {
    // Atualiza otimisticamente a UI
    const pacientesAtualizados = pacientes.map(p => {
      if (p.id === pacienteId) {
        return { ...p, planoId: planoId };
      }
      return p;
    });
    setPacientes(pacientesAtualizados);

    try {
        await api.patch(`/usuarios/${pacienteId}`, { planoId: planoId });
        console.log(`Paciente ${pacienteId} atualizado com plano ${planoId}`);
    } catch (err) {
        console.error("Erro ao atualizar plano do paciente:", err);
        alert("Erro ao salvar alteração no servidor.");
        // Reverteria a alteração otimista aqui se fosse crítico
    }

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
                        <Button 
                          variant="outline-secondary" 
                          size="sm"
                          onClick={(e) => handleBaixarRelatorio(e, paciente)}
                        >
                          Baixar Relatório
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