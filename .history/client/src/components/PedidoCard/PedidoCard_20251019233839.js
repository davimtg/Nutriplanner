import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import styles from './PedidoCard.module.css';
import { concluirPedido } from '../../redux/pedidosSlice'; 
import { aceitarPedido } from '../../redux/pedidosSlice'; 

const PedidoCard = ({ pedido }) => {
  const dispatch = useDispatch();

  const handleAceitar = () => {
    dispatch(aceitarPedido(pedido.id));
  };

  const handleConcluir = () => {
    dispatch(concluirPedido(pedido.id));
  };

  const statusName = pedido.status?.name?.toLowerCase() || '';

  return (
    <div className={styles.card}>
      <h3 className={styles['card-title']}>Pedido #{pedido.id}</h3>

      <p><strong>Status:</strong> {pedido.status?.name || 'Sem status'}</p>

      <p><strong>Itens:</strong></p>
      <ul className={styles['card-itens']}>
        {pedido.itens && pedido.itens.length > 0 ? (
          pedido.itens.map((item, i) => (
            <li key={i}>
              {item.name} — {item.quantidade}
              {item.marca ? ` (${item.marca})` : ''}
            </li>
          ))
        ) : (
          <li>Nenhum item</li>
        )}
      </ul>

      <div className={styles['card-buttons']}>
        <Link to={`/mediador-pedido/${pedido.id}`} className={styles['btn-detalhes']}>
          Ver detalhes
        </Link>

        {statusName === 'pendente' && (
          <button
            className={styles['btn-aceitar']}
            onClick={handleAceitar}
          >
            Aceitar pedido
          </button>
        )}

        {statusName === 'em execucao' && (
          <button
            className={styles['btn-concluir']}
            onClick={handleConcluir}
          >
            Concluir pedido
          </button>
        )}
      </div>
    </div>
  );
};

export default PedidoCard;
