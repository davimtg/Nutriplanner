import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { concluirPedido, aceitarPedido, cancelarPedido } from '../../redux/pedidosSlice';
import api from '../../services/api';
import styles from './MediadorPedidoDetalhes.module.css';
import { Badge, Button, Table, Form } from 'react-bootstrap';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const MediadorPedidoDetalhes = () => {
  const { id } = useParams();
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);

  // state do checklist
  const [checklist, setChecklist] = useState({});
  // precos reais caso precise ajustar na hora
  const [prices, setPrices] = useState({});

  const dispatch = useDispatch();
  const normalize = (str) =>
    str ? str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() : '';

  const fetchPedido = () => {
    api.get(`/pedidos/${id}`)
      .then(response => {
        setPedido(response.data);
        setLoading(false);
      })
      .catch(erro => {
        console.error("Erro ao buscar pedido:", erro);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPedido();
  }, [id]);


  const handleConcluir = () => {
    dispatch(concluirPedido(pedido.id)).then((action) => {
      if (action.meta.requestStatus === 'fulfilled') {
        setPedido({ ...pedido, status: action.payload.status });
      }
    });
  };

  const handleAceitar = () => {
    dispatch(aceitarPedido(pedido.id)).then((action) => {
      if (action.meta.requestStatus === 'fulfilled') {
        setPedido({ ...pedido, status: action.payload.status });
      }
    });
  };

  const handleCancelar = () => {
    dispatch(cancelarPedido(pedido.id)).then((action) => {
      if (action.meta.requestStatus === 'fulfilled') {
        setPedido({ ...pedido, status: action.payload.status });
      }
    });
  };

  const handleCheckboxChange = (index) => {
    setChecklist(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const handlePriceChange = (index, newVal) => {
    // parser simples de moeda
    const val = newVal.replace(',', '.');
    setPrices(prev => ({ ...prev, [index]: val }));
  };

  const subtotalMarcados = useMemo(() => {
    if (!pedido || !pedido.itens) return 0;
    return pedido.itens.reduce((acc, _, idx) => {
      if (checklist[idx]) {
        return acc + (Number(prices[idx]) || 0);
      }
      return acc;
    }, 0);
  }, [pedido, checklist, prices]);

  const updateStatus = async (novoStatus) => {
    if (!pedido) return;
    try {
      // reutiliza a logica de concluirPedido se for pra concluir, ou update direto
      // se for via redux thunk 'concluirPedido', ele talvez sete fixo como 'Concluído'?
      // vamo faze update direto via API p flexibilidade, e update local.

      // pra simplificar: chamada direta
      const res = await api.put(`/pedidos/${pedido.id}`, { ...pedido, status: novoStatus });
      setPedido(res.data);

    } catch (err) {
      console.error("Erro ao atualizar status:", err);
      alert("Erro ao atualizar status do pedido.");
    }
  };

  if (loading) return <div className="p-5 text-center"><p>Carregando...</p></div>;
  if (!pedido) return <div className="p-5 text-center"><p>Pedido não encontrado</p><Link to="/dashboard">Voltar</Link></div>;

  // compatibilidade com campos antigos e novos
  const clienteNome = pedido.clienteNome || pedido.cliente;
  const clienteEndereco = pedido.clienteEndereco || pedido.endereco;

  const formatEndereco = (end) => {
    if (typeof end === 'object' && end !== null) {
      const complemento = end.complemento ? ` - ${end.complemento}` : '';
      const apelido = end.apelido ? `(${end.apelido}) ` : '';
      return `${apelido}${end.rua}, ${end.numero}${complemento} - ${end.bairro}, ${end.cidade}`;
    }
    return end;
  };
  const enderecoDisplay = formatEndereco(clienteEndereco);

  // badge color
  const getBadgeVariant = (s) => {
    const status = typeof s === 'string' ? s : s?.name;
    if (status === 'Pendente') return 'warning';
    if (status === 'Em Andamento') return 'primary';
    if (status === 'Concluído') return 'success';
    return 'secondary';
  };

  const statusStr = typeof pedido.status === 'string' ? pedido.status : pedido.status?.name;

  return (
    <div className={`${styles.details} container mt-4`}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className={styles.details__title}>Pedido #{pedido.id}</h2>
        <Badge bg={getBadgeVariant(pedido.status)} className="fs-6">
          {statusStr}
        </Badge>
      </div>

      <div className="card mb-4 p-3">
        <h5 className="card-title">Dados do Cliente</h5>
        <div className="card-body p-0">
          <p className="mb-1"><strong>Nome:</strong> {clienteNome}</p>
          <p className="mb-1"><strong>Telefone:</strong> {pedido.telefone || '(Não informado)'}</p>
          <p className="mb-1"><strong>Endereço de Entrega:</strong> {enderecoDisplay}</p>
        </div>
      </div>

      <h3 className="mb-3">Lista de Compras</h3>

      <div className="alert alert-info d-flex justify-content-between align-items-center">
        <span><strong>Total dos itens marcados:</strong></span>
        <span className="fs-4 fw-bold">{currencyFormatter.format(subtotalMarcados)}</span>
      </div>

      <div className="table-responsive">
        <Table hover>
          <thead>
            <tr>
              <th style={{ width: '50px' }}>✓</th>
              <th>Item</th>
              <th>Quantidade</th>
              <th style={{ width: '150px' }}>Valor (R$)</th>
            </tr>
          </thead>
          <tbody>
            {pedido.itens && pedido.itens.map((item, index) => (
              <tr key={index} className={checklist[index] ? 'table-success' : ''}>
                <td className="align-middle">
                  <Form.Check
                    checked={!!checklist[index]}
                    onChange={() => handleCheckboxChange(index)}
                    style={{ transform: 'scale(1.2)' }}
                  />
                </td>
                <td className="align-middle">
                  <span style={{ textDecoration: checklist[index] ? 'line-through' : 'none' }}>
                    {item.nome}
                  </span>
                  {item.marca && <div className="small text-muted">{item.marca}</div>}
                </td>
                <td className="align-middle">{item.quantidade}</td>
                <td className="align-middle">
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={prices[index]}
                    onChange={(e) => handlePriceChange(index, e.target.value)}
                    size="sm"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <div className="d-flex justify-content-between mt-4 mb-5">
        <Link to="/dashboard" className="btn btn-secondary">
          Voltar para Dashboard
        </Link>

        {statusStr === "Pendente" && (
          <Button variant="primary" size="lg" onClick={() => updateStatus("Em Andamento")}>
            Aceitar Pedido
          </Button>
        )}

        {statusStr === "Em Andamento" && (
          <Button variant="success" size="lg" onClick={() => updateStatus("Concluído")}>
            Concluir Pedido
          </Button>
        )}
      </div>
    </div >
  );
};

export default MediadorPedidoDetalhes;