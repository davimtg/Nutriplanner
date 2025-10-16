import React from 'react';
import { Link } from 'react-router-dom';
import styles from './PedidoCard.module.css';

const PedidoCard = ({ pedido }) => {
  return (
    <div className={styles.card}>
      <h3 className={styles.card__title}>Pedido #{pedido.id}</h3>
      <p className={styles.card__text}><strong>Cliente:</strong> {pedido.cliente}</p>
      <p className={styles.card__text}><strong>Status:</strong> {pedido.status}</p>
      <Link to={`/mediador-pedido-detalhes/${pedido.id}`} className={styles.card__button}>
        Ver Detalhes
      </Link>
    </div>
  );
};

export default PedidoCard;