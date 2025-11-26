import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Função auxiliar para calcular metas (extraída do seu componente anterior)
const calcularMetaDoPlano = (dataString, planoAtivo, todosAlimentos) => {
  if (!planoAtivo || !planoAtivo.detalhamento) return null;

  // Garante fuso horário correto adicionando meio-dia
  const dataSegura = dataString.includes('T') ? dataString : `${dataString}T12:00:00`;
  const diaSemanaIndex = new Date(dataSegura).getDay(); 
  
  const chavesDias = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
  const chaveDia = chavesDias[diaSemanaIndex]; 

  const refeicoesPlano = planoAtivo.detalhamento[chaveDia];
  
  if (!refeicoesPlano) return null;

  let total = { calorias: 0, proteina: 0, carboidrato: 0, gordura: 0 };
  
  // Calcula totais do plano para aquele dia
  Object.values(refeicoesPlano).flat().forEach(itemPlano => {
    const alimentoDb = todosAlimentos.find(a => a.id === itemPlano.id);
    if (alimentoDb) {
      const razao = itemPlano.gramas / alimentoDb['porção-gramas'];
      
      total.calorias += (alimentoDb.calorias * razao);
      total.proteina += (alimentoDb.proteina * razao);
      total.carboidrato += (alimentoDb.carboidrato * razao);
      total.gordura += (alimentoDb.gordura * razao);
    }
  });

  return { 
    calorias: Math.round(total.calorias), 
    proteina: Math.round(total.proteina),
    carboidrato: Math.round(total.carboidrato),
    gordura: Math.round(total.gordura),
    diaNome: chaveDia 
  };
};

export const gerarRelatorioPDF = ({ dados, usuario, metas, plano, todosAlimentos }) => {
  const doc = new jsPDF();
  const hoje = new Date().toLocaleDateString('pt-BR');

  // --- 1. CABEÇALHO ---
  doc.setFillColor(25, 135, 84); // Verde Bootstrap
  doc.rect(0, 0, 210, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text("NutriPlanner", 14, 18);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text("Relatório de Acompanhamento Nutricional", 14, 26);
  doc.text(`Gerado em: ${hoje}`, 14, 32);

  // --- 2. DADOS DO PACIENTE ---
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  let currentY = 50;

  doc.setFont('helvetica', 'bold');
  doc.text("Dados do Paciente:", 14, currentY);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Nome: ${usuario.nome}`, 14, currentY + 7);
  doc.text(`Idade: ${usuario.idade || '--'} anos`, 14, currentY + 12);
  
  // Coluna da direita (Dados do Plano)
  doc.setFont('helvetica', 'bold');
  doc.text("Plano Alimentar Base:", 110, currentY);
  doc.setFont('helvetica', 'normal');
  
  const nomePlano = plano ? plano.nome : "Personalizado (Sem plano vinculado)";
  doc.text(`Nome: ${nomePlano}`, 110, currentY + 7);
  
  const objetivoTexto = plano ? `Objetivo: ${plano.objetivo}` : `Objetivo: ${usuario.objetivo || "Manutenção"}`;
  const splitObjetivo = doc.splitTextToSize(objetivoTexto, 90);
  doc.text(splitObjetivo, 110, currentY + 12);

  currentY += 30;

  // --- 3. TABELA COMPARATIVA ---
  
  const bodyTabela = dados.map(d => {
    const metaPlano = calcularMetaDoPlano(d.data, plano, todosAlimentos);
    
    const metaCal = metaPlano ? metaPlano.calorias : (metas.calorias || 2000);
    const metaProt = metaPlano ? metaPlano.proteina : (metas.proteinas || 150);
    const metaCarb = metaPlano ? metaPlano.carboidrato : (metas.carboidratos || 250);
    const metaGord = metaPlano ? metaPlano.gordura : (metas.gorduras || 70);

    const diaSemana = metaPlano 
      ? metaPlano.diaNome.charAt(0).toUpperCase() + metaPlano.diaNome.slice(1) 
      : "-";

    return [
      d.diaFormatado,
      diaSemana,
      `${d.caloriasConsumidas} / ${metaCal}`,
      `${d.proteinas} / ${metaProt}`,
      `${d.carboidratos} / ${metaCarb}`,
      `${d.gorduras} / ${metaGord}`
    ];
  });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text("Comparativo Diário: Realizado vs. Planejado", 14, currentY);
  currentY += 5;

  autoTable(doc, {
    startY: currentY,
    head: [['Data', 'Dia', 'Kcal (Ing/Plan)', 'Prot (g)', 'Carb (g)', 'Gord (g)']],
    body: bodyTabela,
    theme: 'grid',
    headStyles: { 
      fillColor: [25, 135, 84], 
      halign: 'center',
      valign: 'middle',
      fontSize: 10
    },
    columnStyles: {
      0: { cellWidth: 15 },
      1: { cellWidth: 20 },
      2: { halign: 'center', fontStyle: 'bold' },
      3: { halign: 'center' },
      4: { halign: 'center' },
      5: { halign: 'center' }
    },
    styles: { fontSize: 9, cellPadding: 3, valign: 'middle' },
    didParseCell: function(data) {
      if (data.section === 'body' && data.column.index === 2) {
         const valores = data.cell.raw.split(' / ');
         const consumido = parseInt(valores[0]);
         const planejado = parseInt(valores[1]);
         
         if (planejado > 0 && consumido > planejado * 1.15) { 
           data.cell.styles.textColor = [220, 53, 69]; // Vermelho
         } else if (planejado > 0 && consumido < planejado * 0.85) { 
           data.cell.styles.textColor = [255, 193, 7]; // Amarelo
         }
      }
    }
  });

  // --- 4. LEGENDA E RODAPÉ ---
  let finalY = doc.lastAutoTable.finalY + 10;
  
  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.text("* Valores exibidos no formato: Ingerido / Planejado.", 14, finalY);
  if (!plano) {
      doc.text("* Usuário sem plano específico vinculado: comparando com metas gerais.", 14, finalY + 4);
      finalY += 4;
  }
  
  finalY += 10;
  
  // Evita divisão por zero se não houver dados
  const mediaCalorias = dados.length > 0 
    ? Math.round(dados.reduce((acc, curr) => acc + curr.caloriasConsumidas, 0) / dados.length)
    : 0;

  doc.setDrawColor(200);
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(14, finalY, 180, 20, 3, 3, 'FD');
  
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text("Resumo do Período:", 20, finalY + 8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Média Calórica Ingerida: ${mediaCalorias} kcal/dia`, 20, finalY + 14);

  const pageCount = doc.internal.getNumberOfPages();
  doc.setFontSize(8);
  doc.setTextColor(150);
  for(var i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text('NutriPlanner - Relatório Oficial', 14, 285);
      doc.text(`Página ${i} de ${pageCount}`, 190, 285, { align: 'right' });
  }

  doc.save(`relatorio_${usuario.nome.replace(/\s+/g, '_')}.pdf`);
};