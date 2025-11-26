// Função para calcular macros de um item específico
export const calcularMacrosItem = (alimentoDb, gramas) => {
  const razao = gramas / alimentoDb['porção-gramas'];
  return {
    calorias: alimentoDb.calorias * razao,
    proteina: alimentoDb.proteina * razao,
    carboidrato: alimentoDb.carboidrato * razao,
    gordura: alimentoDb.gordura * razao,
  };
};

// Função que processa o diário e retorna um array resumido por dia
export const processarDadosRelatorio = (usuarioId, db) => {
  // 1. Filtra registros do usuário
  const registros = db.diario_alimentar.filter(r => r.usuarioId === usuarioId);

  // 2. Mapeia para o formato que os gráficos e tabelas esperam
  const dadosProcessados = registros.map(registro => {

    const dataComFuso = registro.data + 'T12:00:00';

    let totaisDia = {
      data: registro.data, 
      // Usamos a variável dataComFuso aqui:
      diaFormatado: new Date(dataComFuso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      caloriasConsumidas: 0,
      proteinas: 0,
      carboidratos: 0,
      gorduras: 0,
      detalhes: [] 
    };

    Object.values(registro.refeicoes).flat().forEach(item => {
      const alimentoDb = db.alimentos.find(a => a.id === item.id);
      if (alimentoDb) {
        const macros = calcularMacrosItem(alimentoDb, item.gramas);
        
        totaisDia.caloriasConsumidas += macros.calorias;
        totaisDia.proteinas += macros.proteina;
        totaisDia.carboidratos += macros.carboidrato;
        totaisDia.gorduras += macros.gordura;
      }
    });

    // Arredondamento
    totaisDia.caloriasConsumidas = Math.round(totaisDia.caloriasConsumidas);
    totaisDia.proteinas = parseFloat(totaisDia.proteinas.toFixed(1));
    totaisDia.carboidratos = parseFloat(totaisDia.carboidratos.toFixed(1));
    totaisDia.gorduras = parseFloat(totaisDia.gorduras.toFixed(1));

    return totaisDia;
  });

  // Ordenar por data
  return dadosProcessados.sort((a, b) => a.data.localeCompare(b.data));
};