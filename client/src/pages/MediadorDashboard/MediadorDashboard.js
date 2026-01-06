import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PedidoCard from '../../components/PedidoCard/PedidoCard';
import styles from './MediadorDashboard.module.css';
import { fetchPedidos } from '../../redux/pedidosSlice';

const filtros = [
  { label: 'Todos', value: 'todos' },
  { label: 'Pendentes', value: 'pendente' },
  { label: 'Em Andamento', value: 'em andamento' },
  { label: 'Concluídos', value: 'concluido' },
];

const MediadorDashboard = () => {
  const dispatch = useDispatch();
  const { pedidos, status, error } = useSelector((state) => state.pedidos);
  const [filtro, setFiltro] = useState('todos');

  useEffect(() => {
    // Busca sempre que montar o componente para garantir dados frescos
    dispatch(fetchPedidos());
  }, [dispatch]);

  const normalize = (str) =>
    str ? str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() : '';

  const getStatusName = (status) => {
    if (!status) return '';
    return status.name ? status.name : status;
  };

  const pendentes = pedidos.filter(

    (pedido) => normalize(pedido.status?.name) === 'pendente'
  ).length;

  const emExecucao = pedidos.filter(
    (pedido) => normalize(pedido.status?.name) === 'em andamento'
  ).length;

  const concluidos = pedidos.filter(
    (pedido) => normalize(pedido.status?.name) === 'concluido'
  ).length;

  const total = pedidos.length;

  const stats = [
    { label: 'Pedidos Pendentes', value: pendentes },
    { label: 'Em Andamento', value: emExecucao },
    { label: 'Pedidos Concluídos', value: concluidos },
    { label: 'Pedidos Totais', value: total },
  ];

  const pedidosFiltrados =
    filtro === 'todos'
      ? pedidos
      : pedidos.filter((pedido) => normalize(pedido.status?.name) === filtro);
  return (
    <div className={styles.dashboard}>
      <div className={styles['top-section']}>
        <h2 className={styles['page-title']}>Pedidos Disponíveis</h2>
      </div>

      <div className={styles['stats-row']}>
        {stats.map((stat) => (
          <div className={styles['stat-box']} key={stat.label}>
            <span className={styles['stat-number']}>{stat.value}</span>
            <span className={styles['stat-label']}>{stat.label}</span>
          </div>
        ))}
      </div>

      <div className={styles['filters-section']}>
        <div className={styles['filters-title']}>Filtrar pedidos:</div>
        <div className={styles['filters-buttons']}>
          {filtros.map((f) => (
            <button
              key={f.value}
              className={`${styles['filter-btn']} ${filtro === f.value ? styles['active'] : ''
                }`}
              onClick={() => setFiltro(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles['pedidos-section']}>
        {status === 'loading' && (
          <div className={styles['loading']}>Carregando pedidos...</div>
        )}

        {status === 'failed' && (
          <div className={styles['failed']}>Erro: {error}</div>
        )}

        {(status === 'succeeded' && (!pedidos || pedidos.length === 0)) && (
          <div className={styles['no-pedidos']}>
            <p>Nenhum pedido encontrado.</p>
          </div>
        )}

        {status === 'succeeded' && pedidosFiltrados.length > 0 &&
          pedidosFiltrados.map((pedido) => (
            <PedidoCard key={pedido.id} pedido={pedido} />
          ))}
      </div>
    </div>
  );
};

export default MediadorDashboard;
