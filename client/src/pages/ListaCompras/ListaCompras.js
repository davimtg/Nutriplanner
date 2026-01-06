import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Toast, ToastContainer, Modal, Button, Form } from 'react-bootstrap';
import api from '../../services/api';
import styles from './ListaCompras.module.css';


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
    valor: 0,         // valor numerico (reais)
    inputValue: '',   // string pro input (edicao s/ formatacao)
  }));
}

function parseCurrencyToNumber(input) {
  if (!input && input !== 0) return 0;
  if (typeof input === 'number') return input || 0;
  let s = String(input).trim();
  s = s.replace(/\s/g, '').replace(/R\$/i, '').replace(/\./g, ''); // tira R$ e pontos
  s = s.replace(',', '.'); // virgula -> ponto
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
  const { userData: user } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });
  const showToast = (message, variant = 'success') => setToast({ show: true, message, variant });

  // modal endereco
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);

  useEffect(() => {
    const fetchPlanAndGenerateList = async () => {
      if (!user || !user.id) return;

      try {
        // busca dados necessarios
        const [planosRes, alimentosRes, receitasRes, userRes] = await Promise.all([
          api.get('/planos-alimentares'),
          api.get('/alimentos'),
          api.get('/receitas'),
          api.get(`/usuarios/${user.id}`) // atualiza dados user (planoId)
        ]);

        const currentUser = userRes.data;
        const planoId = currentUser.planoId;

        if (!planoId) {
          // sem plano
          return;
        }

        const todosPlanos = Array.isArray(planosRes.data) ? planosRes.data : planosRes.data['planos-alimentares'] || [];
        const meuPlano = todosPlanos.find(p => String(p.id) === String(planoId));

        if (!meuPlano || !meuPlano.detalhamento) return;

        const todosAlimentos = Array.isArray(alimentosRes.data) ? alimentosRes.data : alimentosRes.data.alimentos || [];
        const todasReceitas = Array.isArray(receitasRes.data) ? receitasRes.data : receitasRes.data.receitas || [];

        // maps p busca rapida
        const alimentosMap = new Map(todosAlimentos.map(a => [String(a.id), a]));
        const receitasMap = new Map(todasReceitas.map(r => [String(r.id), r]));

        // agregador
        // chave: nome item -> valor: qtd total (g)
        const agregador = {};

        // percorre dias da semana
        const diasSemanas = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];

        diasSemanas.forEach(diaKey => {
          const refeicoesDia = meuPlano.detalhamento[diaKey];
          if (!refeicoesDia) return;

          // percorre refeicoes (cafe, almoco...)
          Object.values(refeicoesDia).forEach(itensRefeicao => {
            if (!Array.isArray(itensRefeicao)) return;

            itensRefeicao.forEach(item => { // { id, gramas }
              const idStr = String(item.id);

              // tenta em alimentos
              if (alimentosMap.has(idStr)) {
                const alim = alimentosMap.get(idStr);
                const nome = alim.nome;
                if (!agregador[nome]) agregador[nome] = 0;
                agregador[nome] += (item.gramas || 0);
              }
              // tenta em receitas (se n for alimento, assume receita)
              else if (receitasMap.has(idStr)) {
                const rec = receitasMap.get(idStr);
                // se for receita, add ingredientes
                // receitas json tem array strings ingredientes: ["Ovo 2un", "Farinha 200g"]
                // dificil somar. vamo tentar parse simples ou so listar.
                // update: olhando mocks, receitas tem "ingredientes": ["Frango", "Alface"] (sem qtd as vezes?)
                // ou "200g Frango".
                // se a estrutura for complexa, so adiciona o NOME da receita na lista p simplificar
                // ou tenta listar ingredientes sem somar.

                // decisao: p mvp e evitar erro de parse string complexa ("2 ovos", "1 xicara"),
                // vamo add ingredientes como itens separados mas sem tentar somar gramas perfeitamente se n for numerico.
                // mas se o user quer lista compras, ele quer "frango 500g".

                // simplificando: add so o nome da receita e a qtd total dela.
                // (ex: "salada de frango: 300g").
                // decompor receita requer base de ingredientes normalizada q n temos.

                const nomeReceita = `Ingredientes para ${rec.nome}`;
                if (!agregador[nomeReceita]) agregador[nomeReceita] = 0;
                agregador[nomeReceita] += (item.gramas || 0);

                // Opcional: Se quiser listar ingredientes brutos
                if (rec.ingredientes && Array.isArray(rec.ingredientes)) {
                  rec.ingredientes.forEach(ing => {
                    // ingrediente eh string ex: "2 ovos"
                    // add ao agregador key unica p n somar number com string
                    if (!agregador[ing]) agregador[ing] = 0;
                    // valor 0 pois eh qtd texto, n gramas. tratamos na exibicao.
                  });
                }
              }
            });
          });
        });

        // converte agregador p array
        const listaGerada = Object.entries(agregador).map(([nome, qtd]) => {
          let displayQtd = '';
          if (qtd > 0) {
            displayQtd = `${qtd}g`;
          } else {
            displayQtd = 'Qtd. na receita'; // p ingredientes texto
          }

          // se nome ja indica ingrediente, mantem gramas

          return {
            nome,
            quantidades: displayQtd,
            checked: false,
            valor: 0,
            inputValue: ''
          };
        });

        // ordena alfabetico
        listaGerada.sort((a, b) => a.nome.localeCompare(b.nome));

        setListaDeCompras(listaGerada);

      } catch (error) {
        console.error("Erro ao gerar lista de compras:", error);
        showToast("Erro ao carregar planejamento.", "danger");
      }
    };

    fetchPlanAndGenerateList();
  }, [user]);

  // func handlers mantidas...
  const handleCheckboxChange = (index) => {
    setListaDeCompras((prev) => {
      const nova = [...prev];
      nova[index] = { ...nova[index], checked: !nova[index].checked };
      return nova;
    });
  };

  // update apenas texto visivel enquanto digita
  const handleInputChange = (index, raw) => {
    setListaDeCompras((prev) => {
      const nova = [...prev];
      nova[index] = { ...nova[index], inputValue: raw };
      return nova;
    });
  };

  // ao perder foco: parseia e grava valor numerico; formata campo
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

  // ao focar: n mostra R$ p nao atrapalhar digitacao
  const handleInputFocus = (index) => {
    setListaDeCompras((prev) => {
      const nova = [...prev];
      const numero = nova[index].valor || 0;
      nova[index] = {
        ...nova[index],
        inputValue: numero ? String(numero).replace('.', ',') : '', // virgula facilita
      };
      return nova;
    });
  };

  // btn limpar: zera valores
  const handleClearValues = () => {
    setListaDeCompras((prev) => prev.map(it => ({ ...it, valor: 0, inputValue: '' })));
  };

  const subtotalTotal = listaDeCompras.reduce((acc, it) => acc + (Number(it.valor) || 0), 0);
  const subtotalChecked = listaDeCompras.reduce(
    (acc, it) => acc + (it.checked ? Number(it.valor || 0) : 0),
    0
  );


  const confirmSendOrder = async () => {
    setShowAddressModal(false);

    if (!user || !user.id) {
      showToast('Você precisa estar logado para enviar um pedido.', 'warning');
      return;
    }

    // identificar enderec selecionado
    const enderecos = user.enderecos || [];
    let enderecoFinal = null;

    if (enderecos.length > 0) {
      enderecoFinal = enderecos[selectedAddressIndex];
    } else {
      enderecoFinal = user.endereco; // Fallback para unico
    }

    // Se nao tiver nenhum
    if (!enderecoFinal || !enderecoFinal.rua) {
      showToast('Você precisa cadastrar um endereço no Perfil.', 'warning');
      return;
    }

    // formata endereco p string simples (schema espera String)
    const enderecoString = enderecoFinal
      ? `${enderecoFinal.rua}, ${enderecoFinal.numero || 'S/N'}${enderecoFinal.bairro ? ` - ${enderecoFinal.bairro}` : ''}${enderecoFinal.cidade ? `, ${enderecoFinal.cidade}` : ''}`
      : 'Endereço não informado';

    const pedidoPayload = {
      userId: user.id,
      cliente: user.nome, // schema: cliente
      telefone: user.telefone || '',
      endereco: enderecoString, // schema: endereco (String)
      data: new Date(),
      status: { id: 1, name: 'Pendente' }, // schema: status object
      total: subtotalTotal,
      itens: listaDeCompras.map(item => ({
        nome: item.nome,
        quantidade: item.quantidades,
        valor: item.valor,
        checked: item.checked
      }))
    };

    try {
      await api.post('/pedidos', pedidoPayload);
      showToast('Pedido sent to Mediator successfully!', 'success');
      // opcional: navega dashboard ou limpa lista
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (error) {
      console.error('Erro ao enviar pedido:', error);
      showToast('Erro ao enviar pedido.', 'danger');
    }
  };

  const handleOpenModal = () => {
    if (subtotalChecked === 0 && listaDeCompras.length === 0) {
      showToast('A lista está vazia.', 'warning');
      return;
    }
    // check se user tem address
    if (!user.enderecos?.length && !user.endereco?.rua) {
      showToast('Cadastre um endereço no seu Perfil antes de enviar.', 'warning');
      return;
    }
    setShowAddressModal(true);
  };

  // lista pro modal
  const addressList = user?.enderecos?.length > 0
    ? user.enderecos
    : (user?.endereco?.rua ? [{ ...user.endereco, apelido: 'Principal' }] : []);

  return (
    <>
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
            <button className={styles.sendButton} style={{ marginLeft: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }} onClick={handleOpenModal}>Enviar Pedido</button>
          </div>
        </div>

        <ul className={styles.list}>
          {listaDeCompras.map((item, index) => (
            <li
              key={item.nome}
              className={styles.item}
              onClick={(e) => {
                // evita q clicar no input dispare toggle checkbox
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

        {/* modal selecao endereco */}
        <Modal show={showAddressModal} onHide={() => setShowAddressModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Endereço de Entrega</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Selecione onde deseja receber suas compras:</p>
            <Form>
              {addressList.map((end, idx) => (
                <Form.Check
                  key={idx}
                  type="radio"
                  id={`addr-${idx}`}
                  label={`${end.apelido || 'Endereço'} - ${end.rua}, ${end.numero}`}
                  name="addressGroup"
                  checked={selectedAddressIndex === idx}
                  onChange={() => setSelectedAddressIndex(idx)}
                  className="mb-2"
                />
              ))}
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddressModal(false)}>
              Cancelar
            </Button>
            <Button variant="success" onClick={confirmSendOrder}>
              Confirmar Envio
            </Button>
          </Modal.Footer>
        </Modal>

      </div>
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
        <Toast onClose={() => setToast({ ...toast, show: false })} show={toast.show} delay={3000} autohide bg={toast.variant}>
          <Toast.Header>
            <strong className="me-auto">NutriPlanner</strong>
          </Toast.Header>
          <Toast.Body className={toast.variant === 'danger' ? 'text-white' : ''}>
            {toast.message}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
}
