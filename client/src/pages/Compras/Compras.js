import React, { useState, useEffect } from 'react';
import styles from './Compras.module.css';
import Header from '../../components/Header/Header';

// Exemplo de dados simulados de um plano de dietas importado
const planoDeDietas = {
  receitas: [
    {
      nome: 'Salada de Frango',
      ingredientes: [
        { nome: 'Frango', quantidade: '200g' },
        { nome: 'Alface', quantidade: '100g' },
        { nome: 'Tomate', quantidade: '2 unidades' },
      ],
    },
    {
      nome: 'Omelete',
      ingredientes: [
        { nome: 'Ovo', quantidade: '3 unidades' },
        { nome: 'Queijo', quantidade: '50g' },
        { nome: 'Tomate', quantidade: '1 unidade' },
      ],
    },
    {
      nome: 'Vitamina de Banana',
      ingredientes: [
        { nome: 'Banana', quantidade: '2 unidades' },
        { nome: 'Leite', quantidade: '200ml' },
        { nome: 'Aveia', quantidade: '30g' },
      ],
    },
  ],
};

// Função para gerar lista de compras consolidada
function gerarListaDeCompras(receitas) {
  const lista = {};
  receitas.forEach((receita) => {
    receita.ingredientes.forEach(({ nome, quantidade }) => {
      if (!lista[nome]) lista[nome] = [];
      lista[nome].push(quantidade);
    });
  });

  return Object.entries(lista).map(([nome, quantidades]) => ({
    nome,
    quantidades: quantidades.join(' + '),
    checked: false, // Adiciona o estado inicial para o checkbox
  }));
}

export default function Compras() {
  const [listaDeCompras, setListaDeCompras] = useState([]);

  useEffect(() => {
    const lista = gerarListaDeCompras(planoDeDietas.receitas);
    setListaDeCompras(lista);
  }, []);

  // Função para lidar com a mudança no checkbox
  const handleCheckboxChange = (index) => {
    const novaLista = [...listaDeCompras];
    novaLista[index].checked = !novaLista[index].checked;
    setListaDeCompras(novaLista);
  };

  return (
    <>
      <Header />
    <div className={styles.container}>
      <h1 className={styles.title}>Lista de Compras</h1>
      <ul className={styles.list}>
        {listaDeCompras.map((item, index) => (
          <li key={item.nome} className={styles.item}>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={item.checked}
              onChange={() => handleCheckboxChange(index)}
            />
            <div className={`${styles.itemText} ${item.checked ? styles.checked : ''}`}>
              <strong className={styles.itemName}>{item.nome}</strong>:
              <span className={styles.itemQuantity}>{item.quantidades}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  </>
  );
}