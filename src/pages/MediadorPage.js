import React, { useState, useEffect } from 'react';
import './MediadorPage.css';

function MediadorPage() {
  const [pedidos, setPedidos] = useState([]);
  const [filtro, setFiltro] = useState('todos');

  useEffect(() => {
    const pedidosExemplo = [
      {
        id: 1,
        cliente: "João Silva",
        endereco: "Rua das Flores, 123 - Centro, São Paulo/SP",
        telefone: "(11) 99999-9999",
        data: "20/11/2023",
        itens: [
          { nome: "Arroz integral", quantidade: "1kg" },
          { nome: "Feijão preto", quantidade: "500g" },
          { nome: "Peito de frango", quantidade: "1kg" }
        ],
        status: "pendente",
        total: "R$ 45,90"
      },
      {
        id: 2,
        cliente: "Maria Santos",
        endereco: "Av. Paulista, 1000 - Bela Vista, São Paulo/SP",
        telefone: "(11) 88888-8888",
        data: "19/11/2023", 
        itens: [
          { nome: "Aveia", quantidade: "500g" },
          { nome: "Banana", quantidade: "6 unidades" },
          { nome: "Leite integral", quantidade: "1L" }
        ],
        status: "pendente",
        total: "R$ 32,50"
      },
      {
        id: 3,
        cliente: "Pedro Costa",
        endereco: "Rua Augusta, 500 - Consolação, São Paulo/SP",
        telefone: "(11) 77777-7777",
        data: "18/11/2023",
        itens: [
          { nome: "Salada mista", quantidade: "1 pacote" },
          { nome: "Salmão", quantidade: "2 filés" },
          { nome: "Quinoa", quantidade: "500g" }
        ],
        status: "concluido",
        total: "R$ 67,50"
      },
      {
        id: 4,
        cliente: "Ana Oliveira",
        endereco: "Alameda Santos, 200 - Jardins, São Paulo/SP",
        telefone: "(11) 66666-6666",
        data: "17/11/2023",
        itens: [
          { nome: "Pão integral", quantidade: "2 unidades" },
          { nome: "Queijo branco", quantidade: "200g" },
          { nome: "Iogurte natural", quantidade: "4 potes" }
        ],
        status: "pendente",
        total: "R$ 28,90"
      }
    ];
    setPedidos(pedidosExemplo);
  }, []);

  const pedidosFiltrados = filtro === 'todos' ? pedidos : pedidos.filter(p => p.status === filtro);

  // Função para alterar o status do pedido
  const alterarStatus = (pedidoId, novoStatus) => {
    setPedidos(pedidos.map(pedido => 
      pedido.id === pedidoId ? { ...pedido, status: novoStatus } : pedido
    ));
  };

  // Função para contar pedidos por status
  const contarPedidos = (status) => {
    return pedidos.filter(p => p.status === status).length;
  };

  return (
    <div className="mediador-container">
      {/* SEÇÃO SUPERIOR - TUDO NO TOPO */}
      <div className="top-section">
        <h1 className="page-title">Painel de Pedidos</h1>
        <p className="page-subtitle">Gerencie os pedidos de compras</p>
        
        {/* Estatísticas */}
        <div className="stats-row">
          <div className="stat-box">
            <span className="stat-number">{pedidos.length}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-box">
            <span className="stat-number">{contarPedidos('pendente')}</span>
            <span className="stat-label">Pendentes</span>
          </div>
          <div className="stat-box">
            <span className="stat-number">{contarPedidos('concluido')}</span>
            <span className="stat-label">Concluídos</span>
          </div>
        </div>

        {/* Filtros */}
        <div className="filters-section">
          <div className="filters-title">Filtrar pedidos:</div>
          <div className="filters-buttons">
            <button 
              className={filtro === 'todos' ? 'filter-btn active' : 'filter-btn'}
              onClick={() => setFiltro('todos')}
            >
              Todos ({pedidos.length})
            </button>
            <button 
              className={filtro === 'pendente' ? 'filter-btn active' : 'filter-btn'}
              onClick={() => setFiltro('pendente')}
            >
              Pendentes ({contarPedidos('pendente')})
            </button>
            <button 
              className={filtro === 'concluido' ? 'filter-btn active' : 'filter-btn'}
              onClick={() => setFiltro('concluido')}
            >
              Concluídos ({contarPedidos('concluido')})
            </button>
          </div>
        </div>
      </div>

      {/* SEÇÃO DE PEDIDOS - CENTRALIZADA */}
      <div className="pedidos-section">
        {pedidosFiltrados.length === 0 ? (
          <div className="no-pedidos">
            <p>Nenhum pedido encontrado para o filtro selecionado</p>
          </div>
        ) : (
          pedidosFiltrados.map(pedido => (
            <div key={pedido.id} className="pedido-card" data-status={pedido.status}>
              <div className="pedido-header">
                <div className="pedido-info">
                  <h3>Pedido #{pedido.id} - {pedido.cliente}</h3>
                  <div className="pedido-meta">
                    <span>📅 {pedido.data}</span>
                    <span>🏠 {pedido.endereco}</span>
                    <span>📞 {pedido.telefone}</span>
                  </div>
                </div>
                <span className={`status ${pedido.status}`}>
                  {pedido.status === 'pendente' ? '⏳ Pendente' : ' Concluído'}
                </span>
              </div>

              <div className="pedido-itens">
                <h4>🛒 Itens do pedido:</h4>
                <div className="itens-list">
                  {pedido.itens.map((item, index) => (
                    <div key={index} className="item-row">
                      <span className="item-name">{item.nome}</span>
                      <span className="item-quantity">{item.quantidade}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pedido-total">
                <strong> Total: {pedido.total}</strong>
              </div>

              {/* Ações - Apenas Pendente/Concluído */}
              <div className="pedido-actions">
                {pedido.status === 'pendente' ? (
                  <>
                    <button 
                      className="action-btn btn-concluido"
                      onClick={() => alterarStatus(pedido.id, 'concluido')}
                    >
                       Concluir Pedido
                    </button>
                    <button 
                      className="action-btn btn-detalhes"
                      onClick={() => alert(`Detalhes do pedido #${pedido.id}\nCliente: ${pedido.cliente}\nEndereço: ${pedido.endereco}\nItens: ${pedido.itens.length}`)}
                    >
                       Ver Detalhes
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      className="action-btn btn-recibo"
                      onClick={() => alert(`Pedido #${pedido.id} concluído!\nCliente: ${pedido.cliente}\nEndereço: ${pedido.endereco}\nTotal: ${pedido.total}`)}
                    >
                       Ver Recibo
                    </button>
                  </>
                )}
              </div>

              {/* Indicador do status */}
              <div className="status-info">
                <small>
                  {pedido.status === 'pendente' 
                    ? ' Aguardando conclusão' 
                    : ' Pedido finalizado ✓'
                  }
                </small>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default MediadorPage;