import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Container, Row, Col, Card, Button, Spinner, Alert } from "react-bootstrap";

// Importações dos utilitários e componentes visuais
import { processarDadosRelatorio } from "../../components/Utils/nutricao";
import BotoesExportacao from "./BotoesExportacao";
import { DetalhesDia, GraficoSemanal } from "./PaineisVisuais";

export default function PaginaRelatorio() {
  // Estado dos dados
  const [usuario, setUsuario] = useState(null);
  const [dadosProcessados, setDadosProcessados] = useState([]);
  const [diaSelecionado, setDiaSelecionado] = useState(null);
  
  // NOVOS ESTADOS NECESSÁRIOS PARA A EXPORTAÇÃO
  const [listaAlimentos, setListaAlimentos] = useState([]);
  const [listaPlanos, setListaPlanos] = useState([]);

  // Estados de controle da requisição
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ID do usuário logado (Simulado)
  const USUARIO_ID = 1;

  useEffect(() => {
    setLoading(true);

    // Buscamos todas as tabelas necessárias em paralelo
    Promise.all([
      fetch("http://localhost:3001/usuarios").then(res => {
        if (!res.ok) throw new Error("Falha ao buscar usuários");
        return res.json();
      }),
      fetch("http://localhost:3001/alimentos").then(res => {
        if (!res.ok) throw new Error("Falha ao buscar alimentos");
        return res.json();
      }),
      fetch("http://localhost:3001/diario-alimentar").then(res => {
        if (!res.ok) throw new Error("Falha ao buscar diário alimentar");
        return res.json();
      }),
      // NOVO: Buscar os planos alimentares para passar ao PDF
      fetch("http://localhost:3001/planos-alimentares").then(res => {
        if (!res.ok) throw new Error("Falha ao buscar planos alimentares");
        return res.json();
      })
    ])
    .then(([usuariosData, alimentosData, diarioData, planosData]) => {
      
      // 1. Salvar dados crus que serão usados na exportação
      setListaAlimentos(alimentosData);
      // Extrair o array de planos (o json-server retorna { "planos-alimentares": [...] })
      const arrayPlanos = Array.isArray(planosData) ? planosData : (planosData["planos-alimentares"] || []);
      setListaPlanos(arrayPlanos);

      // 2. Montamos um objeto "db" simulado para o processamento interno
      const dbMontado = {
        usuarios: usuariosData,
        alimentos: alimentosData,
        diario_alimentar: diarioData
      };

      // 3. Encontrar usuário
      let listaUsuarios = usuariosData;
      if (usuariosData["lista-de-usuarios"]) {
        listaUsuarios = usuariosData["lista-de-usuarios"];
      }
      
      const userFound = Array.isArray(listaUsuarios)
        ? listaUsuarios.find(u => u.id === USUARIO_ID)
        : null;

      if (!userFound) {
        throw new Error("Usuário não encontrado no banco de dados.");
      }

      // 4. Definir Metas
      const metasUsuario = {
          calorias: 2000,
          proteinas: 150,
          carboidratos: 250,
          gorduras: 70,
          ...userFound
      };
      
      setUsuario({ ...userFound, metas: metasUsuario });

      // 5. Processar dados para os gráficos
      const dados = processarDadosRelatorio(USUARIO_ID, dbMontado);
      setDadosProcessados(dados);

      if (dados.length > 0) {
        setDiaSelecionado(dados[dados.length - 1]);
      }
    })
    .catch(err => {
      console.error("Erro ao carregar relatório:", err);
      setError(err.message);
    })
    .finally(() => {
      setLoading(false);
    });

  }, []);

  if (loading) {
    return (
        <Container className="py-5 text-center d-flex flex-column align-items-center justify-content-center" style={{ minHeight: "400px" }}>
            <Spinner animation="border" variant="success" role="status">
                <span className="visually-hidden">Carregando...</span>
            </Spinner>
            <p className="mt-3 text-muted">Sincronizando com o banco de dados...</p>
        </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>Ocorreu um erro ao carregar os dados</Alert.Heading>
          <p>{error}</p>
          <hr />
          <p className="mb-0">
            Verifique se o servidor (json-server) está rodando.<br/>
            Tente acessar manualmente no navegador: <a href="http://localhost:3001/diario-alimentar" target="_blank" rel="noreferrer">http://localhost:3001/diario-alimentar</a>
          </p>
        </Alert>
      </Container>
    );
  }

  if (!usuario || dadosProcessados.length === 0) {
    return (
        <Container className="py-5 text-center">
            <Alert variant="info">
              Nenhum registro de alimentação encontrado para este usuário.
            </Alert>
        </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col lg={10}>
          <Card className="shadow-sm rounded-4 border-0">
            <Card.Body className="p-4 p-md-5">
              
              <div className="text-center mb-5">
                <h2 className="text-success fw-bold">Seu Relatório Nutricional</h2>
                <p className="text-muted">
                  {usuario.nome} • Acompanhamento baseado no seu diário
                </p>
              </div>

              <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 p-3 bg-light rounded-3 mb-4 border">
                <span className="fw-semibold text-secondary">
                  <i className="bi bi-calendar-check me-2"></i>
                  {dadosProcessados.length} dias registrados
                </span>
                
                {/* CORREÇÃO AQUI:
                    Passamos as listas completas de Alimentos e Planos.
                    Isso permite que o BotoesExportacao cruze o ID do plano do usuário
                    com a lista de planos para achar o nome e detalhes.
                */}
                <BotoesExportacao
                    dados={dadosProcessados}
                    usuario={usuario}
                    metas={usuario.metas}
                    todosAlimentos={listaAlimentos}
                    todosPlanos={listaPlanos}
                />
              </div>

              <h6 className="text-success fw-bold">Selecione um dia:</h6>
              <div className="d-flex flex-wrap gap-2 mb-3">
                {dadosProcessados.map((dia) => (
                  <Button
                    key={dia.data}
                    variant={diaSelecionado?.data === dia.data ? "success" : "outline-success"}
                    size="sm"
                    onClick={() => setDiaSelecionado(dia)}
                  >
                    {dia.diaFormatado}
                  </Button>
                ))}
              </div>

              <DetalhesDia
                dadosDia={diaSelecionado}
                metas={usuario.metas}
              />

              <hr className="my-5" />

              <GraficoSemanal
                dados={dadosProcessados}
                metaCalorica={usuario.metas.calorias}
              />

              <div className="mt-4 text-center text-muted small">
                  Dados extraídos automaticamente do seu Diário Alimentar.
              </div>

            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}