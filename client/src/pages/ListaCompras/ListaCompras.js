import React, { useState, useEffect } from 'react';
import styles from './ListaCompras.module.css';
import Header from '../../components/Header/Header';

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
    checked: false,
    valor: 0,         // valor numérico (em reais)
    inputValue: '',   // string mostrada no input (para edição sem formatação constante)
  }));
}

function parseCurrencyToNumber(input) {
  if (!input && input !== 0) return 0;
  if (typeof input === 'number') return input || 0;
  let s = String(input).trim();
  s = s.replace(/\s/g, '').replace(/R\$/i, '').replace(/\./g, ''); // tira R$ e pontos de milhar
  s = s.replace(',', '.'); // vírgula -> ponto
  const match = s.match(/-?[\d.]+/);
  if (!match) return 0;
  const n = parseFloat(match[0]);
  return Number.isFinite(n) ? n : 0;
}

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export default function ListaCompras() {
  const [listaDeCompras, setListaDeCompras] = useState([]);

  useEffect(() => {
    const lista = gerarListaDeCompras(planoDeDietas.receitas);
    setListaDeCompras(lista);
  }, []);

  const handleCheckboxChange = (index) => {
    setListaDeCompras((prev) => {
      const nova = [...prev];
      nova[index] = { ...nova[index], checked: !nova[index].checked };
      return nova;
    });
  };

  // Atualiza apenas o texto visível enquanto o usuário digita
  const handleInputChange = (index, raw) => {
    setListaDeCompras((prev) => {
      const nova = [...prev];
      nova[index] = { ...nova[index], inputValue: raw };
      return nova;
    });
  };

  // Ao perder o foco: parseia e grava valor numérico; formata o campo
  const handleInputBlur = (index) => {
    setListaDeCompras((prev) => {
      const nova = [...prev];
      const raw = nova[index].inputValue;
      const numero = parseCurrencyToNumber(raw);
      nova[index] = {
        ...nova[index],
        valor: numero,
        inputValue: numero ? currencyFormatter.format(numero) : '',
      };
      return nova;
    });
  };

  // Ao focar: mostra forma editável (sem R$) para não atrapalhar digitação
  const handleInputFocus = (index) => {
    setListaDeCompras((prev) => {
      const nova = [...prev];
      const numero = nova[index].valor || 0;
      nova[index] = {
        ...nova[index],
        inputValue: numero ? String(numero).replace('.', ',') : '', // usa vírgula para facilitar
      };
      return nova;
    });
  };

  // Botão limpar: zera valores e limpa inputValue
  const handleClearValues = () => {
    setListaDeCompras((prev) => prev.map(it => ({ ...it, valor: 0, inputValue: '' })));
  };

  const subtotalTotal = listaDeCompras.reduce((acc, it) => acc + (Number(it.valor) || 0), 0);
  const subtotalChecked = listaDeCompras.reduce(
    (acc, it) => acc + (it.checked ? Number(it.valor || 0) : 0),
    0
  );

  return (
    <>
      <Header />
      <div className={styles.container}>
        <h1 className={styles.title}>Lista de Compras</h1>

        <div className={styles.subtotalBar}>
          <div>
            <small>Total (todos):</small>
            <div className={styles.subtotalValue}>{currencyFormatter.format(subtotalTotal)}</div>
          </div>

          <div>
            <small>Total (marcados):</small>
            <div className={styles.subtotalValueChecked}>{currencyFormatter.format(subtotalChecked)}</div>
          </div>

          <div>
            <button className={styles.clearButton} onClick={handleClearValues}>Limpar valores</button>
          </div>
        </div>

        <ul className={styles.list}>
          {listaDeCompras.map((item, index) => (
            <li
              key={item.nome}
              className={styles.item}
              onClick={(e) => {
                // evita que clicar no input de valor dispare o toggle do checkbox
                if (e.target.tagName.toLowerCase() !== 'input' && e.target.tagName.toLowerCase() !== 'button') {
                  handleCheckboxChange(index);
                }
              }}
            >
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

              <div className={styles.valorWrapper}>
                <input
                  className={styles.valor}
                  type="text"
                  placeholder="R$0,00"
                  value={item.inputValue}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onBlur={() => handleInputBlur(index)}
                  onFocus={() => handleInputFocus(index)}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
