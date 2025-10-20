import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { concluirPedido } from '../../redux/pedidosSlice';
import styles from './MediadorPedidoDetalhes.module.css';

const MediadorPedidoDetalhes = () => {
  const { id } = useParams();
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

useEffect(() => {
  fetch("http://localhost:3001/pedidos")
    .then(res => res.json())
    .then(data => {
      console.log("Dados recebidos:", data);

      // Acessa direto o array
      const lista = data["lista-de-pedidos"] || [];

      const pedidoEncontrado = lista.find(p => String(p.id) === String(id));

      console.log("Pedido encontrado:", pedidoEncontrado);
      setPedido(pedidoEncontrado);
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
        setPedido(action.payload);
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

{pedido.status === "Pendente" && (
  <button onClick={handleConcluir} className={styles.details__button}>
    Concluir Pedido
  </button>
)}

<Link to="/mediador-dashboard" className={styles.details__back}>
  Voltar para Dashboard
</Link>

    </div>
  );
};

export default MediadorPedidoDetalhes;