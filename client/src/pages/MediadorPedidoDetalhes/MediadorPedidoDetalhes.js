import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { concluirPedido, aceitarPedido, cancelarPedido } from '../../redux/pedidosSlice';
import api from '../../services/api';
import styles from './MediadorPedidoDetalhes.module.css';

const MediadorPedidoDetalhes = () => {
  const { id } = useParams();
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  const normalize = (str) =>
    str ? str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() : '';

  useEffect(() => {
    api.get(`/pedidos/${id}`)
      .then(response => {
        setPedido(response.data);
        setLoading(false);
      })
      .catch(erro => {
        console.error("Erro ao buscar pedido:", erro);
        setLoading(false);
      });
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

  if (loading) return <p>Carregando...</p>;
  if (!pedido) return <p>Pedido não encontrado</p>;

  return (
    <div className={styles.details}>
      <h2 className={styles.details__title}>Detalhes do Pedido #{pedido.id}</h2>
      <p><strong>Cliente:</strong> {pedido.cliente}</p>
      <p><strong>Telefone:</strong> {pedido.telefone}</p>
      <p><strong>Endereço:</strong> {pedido.endereco}</p>
      <p><strong>Status:</strong> {pedido.status?.name}</p>

      <h3 className={styles.details__subtitle}>Itens:</h3>
      <ul className={styles.details__list}>
        {pedido.itens.map((item, index) => (
          <li key={index} className={styles.details__item}>
            <span>{item.name}</span>
            <span>{item.quantidade} ({item.marca})</span>
          </li>
        ))}
      </ul>

      {normalize(pedido.status?.name) === "pendente" && (
        <button onClick={handleAceitar} className={styles.details__button}>
          Aceitar Pedido
        </button>
      )}

      {normalize(pedido.status?.name) === "em execucao" && (
        <div className={styles.details__actions}>
          <button onClick={handleConcluir} className={styles.details__button}>
            Concluir Pedido
          </button>
          <button onClick={handleCancelar} className={`${styles.details__button} ${styles['details__button--cancel']}`}>
            Cancelar Pedido
          </button>
        </div>
      )}

      <Link to="/dashboard" className={styles.details__back}>
        Voltar para Dashboard
      </Link>

    </div>
  );
};

export default MediadorPedidoDetalhes;