import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable';

export const gerarRelatorioPDF = ({ dados, usuario, metas, plano }) => {
  const doc = new jsPDF();

  // Cabeçalho
  doc.setFontSize(18);
  doc.setTextColor(40, 167, 69); // Verde
  doc.text("Relatório Nutricional", 14, 22);

  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0); // Preto
  doc.text(`Paciente: ${usuario.nome}`, 14, 32);
  doc.text(`Data de Emissão: ${new Date().toLocaleDateString("pt-BR")}`, 14, 38);
  
  // Resumo de Metas
  doc.text(`Metas Diárias: ${metas.calorias} kcal`, 14, 48);
  doc.setFontSize(10);
  doc.text(`(Proteínas: ${metas.proteinas}g | Carbs: ${metas.carboidratos}g | Gorduras: ${metas.gorduras}g)`, 14, 54);

  // Tabela Resumo
  const tableColumn = ["Data", "Calorias (kcal)", "Proteínas (g)", "Carbs (g)", "Gorduras (g)"];
  const tableRows = [];

  dados.forEach(dia => {
    const diaData = [
      dia.diaFormatado,
      dia.caloriasConsumidas,
      dia.proteinas,
      dia.carboidratos,
      dia.gorduras
    ];
    tableRows.push(diaData);
  });

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 60,
    theme: 'grid',
    headStyles: { fillColor: [40, 167, 69] },
  });

  // Se houver plano, adicionar
  if (plano && plano.nome) {
      const finalY = doc.lastAutoTable.finalY || 150;
      doc.setFontSize(14);
      doc.text(`Plano Ativo: ${plano.nome}`, 14, finalY + 15);
      doc.setFontSize(10);
      doc.text(`Objetivo: ${plano.objetivo || 'Não especificado'}`, 14, finalY + 22);
  }

  // Rodapé
  const pageCount = doc.internal.getNumberOfPages();
  for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text('NutriPlanner - Seu gerenciador de saúde', 105, 290, { align: 'center' });
  }

  const normalizedName = usuario.nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, "-");
  doc.save(`relatorio-${normalizedName}.pdf`);
};
