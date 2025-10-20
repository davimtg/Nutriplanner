import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import dadosRelatorio from '../../data/dadosRelatorio.json';

const getTodayIndex = () => new Date().getDay();

export default function Relatorio() {
  const [view, setView] = useState("semanal");
  const [usuario] = useState(dadosRelatorio.usuario);
  const [dadosSemanais] = useState(dadosRelatorio.semanal);
  const [dadosMensais] = useState(dadosRelatorio.mensal);
  const [selectedDayData, setSelectedDayData] = useState(dadosSemanais[getTodayIndex()]);

  const handleExport = (format) => {
    // Para CSV, a exportação é um resumo simples da semana.
    if (format === 'csv') {
      const head = ['Dia', 'Calorias Consumidas', 'Proteínas (g)', 'Carboidratos (g)', 'Gorduras (g)'];
      const body = dadosSemanais.map(d => [d.dia, d.caloriasConsumidas, d.proteinas, d.carboidratos, d.gorduras]);
      let csvContent = "data:text/csv;charset=utf-8," + head.join(',') + '\r\n';
      csvContent += body.map(row => row.join(',')).join('\r\n');
      const link = document.createElement('a');
      link.setAttribute('href', encodeURI(csvContent));
      link.setAttribute('download', `relatorio_semanal_${usuario.nome.replace(' ', '_')}.csv`);
      link.click();
      return;
    }

    // Geração do PDF customizado
    const doc = new jsPDF();
    const hoje = new Date().toLocaleDateString('pt-BR');
    const diaSelecionado = selectedDayData;
    const metas = usuario.metas;

    doc.setFontSize(20);
    doc.text(`Relatório Nutricional - ${usuario.nome}`, 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(150);
    doc.text(`Gerado em: ${hoje}`, 14, 30);

    // Tabela 1: Dados do dia selecionado na tela.
    const progresso = ((diaSelecionado.caloriasConsumidas / metas.calorias) * 100).toFixed(1);
    const bodyMetricaDiaria = [
      ['Meta Calórica', `${metas.calorias} kcal`],
      ['Calorias Consumidas', `${diaSelecionado.caloriasConsumidas} kcal`],
      ['Progresso', `${progresso}%`],
      ['Proteínas', `${diaSelecionado.proteinas}g`],
      ['Carboidratos', `${diaSelecionado.carboidratos}g`],
      ['Gorduras', `${diaSelecionado.gorduras}g`],
    ];

    autoTable(doc, {
      startY: 40,
      head: [['Métrica Diária', 'Valor']],
      body: bodyMetricaDiaria,
      theme: 'striped',
      headStyles: { fillColor: '#0d6efd' },
    });

    // Tabela 2: Resumo de consumo calórico semanal.
    const bodySemanal = dadosSemanais.map(d => [
      d.dia,
      `${d.caloriasConsumidas} kcal`,
      `${metas.calorias} kcal`
    ]);

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10, // Posiciona abaixo da tabela anterior
      head: [['Dia', 'Calorias Consumidas', 'Meta']],
      body: bodySemanal,
      theme: 'striped',
      headStyles: { fillColor: '#198754' },
    });

    doc.save(`relatorio_${usuario.nome.replace(' ', '_')}.pdf`);
  };

  const DetalhesDoDia = ({ data, metas }) => {
    if (!data) return null;
    const progressoCalorias = Math.min((data.caloriasConsumidas / metas.calorias) * 100, 100);

    const macros = [
      { nome: "Proteínas",    consumidas: data.proteinas,    meta: metas.proteinas,    corBase: 'primary' },
      { nome: "Carboidratos", consumidas: data.carboidratos, meta: metas.carboidratos, corBase: 'success' },
      { nome: "Gorduras",     consumidas: data.gorduras,     meta: metas.gorduras,     corBase: 'info' },
    ];

    return (
      <div className="mt-4">
        <h4 className="text-success mb-3">Resumo de {data.dia}</h4>
        <div className="mb-4">
            <h6 className="fw-bold">Calorias</h6>
            <div className="progress" style={{ height: "24px", fontSize: "0.9rem" }}>
              <div className="progress-bar bg-success progress-bar-striped fw-bold" role="progressbar" style={{ width: `${progressoCalorias}%` }}>
                {data.caloriasConsumidas} / {metas.calorias} kcal
              </div>
            </div>
        </div>
        <h6 className="fw-bold">Macronutrientes</h6>
        <div className="row">
          {macros.map(macro => {
            const progressoMacro = Math.min((macro.consumidas / macro.meta) * 100, 100);
            const corBarra = macro.consumidas > macro.meta ? 'bg-warning text-dark' : `bg-${macro.corBase}`;
            return (
              <div key={macro.nome} className="col-md-4 mb-3">
                <div className="card border-0 shadow-sm p-3 h-100">
                    <p className="fw-semibold mb-2">{macro.nome}</p>
                    <div className="progress" style={{ height: "20px", fontSize: '0.8rem' }}>
                        <div className={`progress-bar fw-bold ${corBarra}`} role="progressbar" style={{ width: `${progressoMacro}%` }}>
                           {macro.consumidas}g / {macro.meta}g
                        </div>
                    </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="card shadow-sm rounded-4 p-4 p-md-5">
            <div className="text-center mb-4">
              <h2 className="text-success mb-1">Seu Relatório Nutricional</h2>
              <p className="lead text-muted">{usuario.nome}, {usuario.idade} anos</p>
            </div>
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 p-3 bg-light rounded-3 mb-4 border">
               <div className="btn-group" role="group">
                <button type="button" className={`btn ${view === 'semanal' ? 'btn-success' : 'btn-outline-success'}`} onClick={() => setView('semanal')}>
                  <i className="bi bi-calendar-week-fill me-2"></i>Resumo Semanal
                </button>
                <button type="button" className={`btn ${view === 'mensal' ? 'btn-success' : 'btn-outline-success'}`} onClick={() => setView('mensal')}>
                  <i className="bi bi-calendar-month-fill me-2"></i>Histórico Mensal
                </button>
              </div>
              <div className="btn-group" role="group">
                <button onClick={() => handleExport('pdf')} className="btn btn-outline-danger d-flex align-items-center gap-2">
                  <i className="bi bi-file-earmark-pdf-fill"></i> <span className="d-none d-sm-inline">Exportar PDF</span>
                </button>
                <button onClick={() => handleExport('csv')} className="btn btn-outline-primary d-flex align-items-center gap-2">
                  <i className="bi bi-filetype-csv"></i> <span className="d-none d-sm-inline">Exportar CSV</span>
                </button>
              </div>
            </div>
            
            <div>
              {view === 'semanal' && (
                <>
                  <h5 className="text-success mt-4">Selecione um dia para ver os detalhes:</h5>
                  <div className="d-flex justify-content-center flex-wrap gap-2 my-3">
                    {dadosSemanais.map(diaData => (
                      <button key={diaData.dia} className={`btn btn-sm ${selectedDayData?.dia === diaData.dia ? 'btn-success' : 'btn-outline-success'}`} onClick={() => setSelectedDayData(diaData)}>
                        {diaData.dia}
                      </button>
                    ))}
                  </div>
                  <hr/>
                  <DetalhesDoDia data={selectedDayData} metas={usuario.metas} />
                  <hr/>
                  <div className="mt-5">
                    <h5 className="text-success mb-3">Balanço Calórico da Semana</h5>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={dadosSemanais} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="dia" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="caloriasConsumidas" fill="#198754" name="Consumidas" />
                            {/* O gráfico usa a meta estática do usuário para a barra de "Meta". */}
                            <Bar dataKey={() => usuario.metas.calorias} fill="#a3d9a5" name="Meta" />
                        </BarChart>
                    </ResponsiveContainer>
                  </div>
                </>
              )}

              {view === 'mensal' && (
                <div className="mt-4">
                  <h5 className="text-success mb-3">Consumo Calórico no Mês</h5>
                  <div className="card border-0 bg-light p-3 rounded-3 shadow-sm">
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={dadosMensais} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="dia" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="consumidas" stroke="#198754" strokeWidth={2} name="Calorias Consumidas" />
                        {/* O gráfico usa a meta estática do usuário para a linha de "Meta". */}
                        <Line type="monotone" dataKey={() => usuario.metas.calorias} stroke="#a3d9a5" strokeDasharray="5 5" name="Meta de Calorias" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-5 text-center text-muted">
              <small>Última atualização: {new Date().toLocaleString('pt-BR')}</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
