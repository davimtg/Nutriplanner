import React from 'react';
import { Link } from 'react-router-dom';
import styles from './PedidoCard.module.css';

const PedidoCard = ({ pedido }) => {
  return (
    <div className={styles.card}>
      <h3 className={styles['card-title']}>Pedido #{pedido.id}</h3>

      <p><strong>Status:</strong> {pedido.status?.name || 'Sem status'}</p>

      <p><strong>Itens:</strong></p>
      <ul className={styles['card-itens']}>
        {pedido.itens && pedido.itens.length > 0 ? (
          pedido.itens.map((item, i) => (
            <li key={i}>
              {item.nome || item.name} — {item.quantidade}
              {item.marca ? ` (${item.marca})` : ''}
            </li>
          ))
        ) : (
          <li>Nenhum item</li>
        )}
      </ul>


      <Link to={`/mediador-pedido/${pedido.id}`} className={styles['btn-detalhes']}>
        Ver detalhes
      </Link>
    </div>
  );
};

export default PedidoCard;
