import React from 'react';
import { Button } from 'react-bootstrap';
// 1. Importamos a função centralizada
import { gerarRelatorioPDF } from "../../components/Utils/gerarPdf"; 

const BotoesExportacao = ({ dados, usuario, metas, plano, todosAlimentos, todosPlanos }) => {

  // Mantemos apenas a lógica para descobrir QUAL plano usar
  const resolverPlanoAtivo = () => {
    // 1. Tenta achar na lista de todos os planos pelo ID do usuário
    if (todosPlanos && Array.isArray(todosPlanos)) {
      const idVinculado = usuario.PlanoId !== undefined ? usuario.PlanoId : usuario.planoId;
      
      if (idVinculado !== undefined && idVinculado !== null) {
        const planoEncontrado = todosPlanos.find(p => p.id === idVinculado);
        if (planoEncontrado) return planoEncontrado;
      }
    }

    // 2. Fallback para a prop 'plano' direta (legado)
    if (plano && plano.detalhamento) return plano;

    return null;
  };

  const planoAtivo = resolverPlanoAtivo();

  // Função simplificada que apenas prepara os dados e chama o gerador
  const handleExportPDF = () => {
    // Se não tiver plano ativo, usamos um objeto vazio ou nulo, 
    // a função gerarRelatorioPDF já sabe lidar com isso.
    
    gerarRelatorioPDF({
      dados: dados,
      usuario: usuario,
      metas: metas,
      plano: planoAtivo,
      todosAlimentos: todosAlimentos
    });
  };

  return (
    <div className="btn-group" role="group">
      <Button 
        variant="outline-danger" 
        onClick={handleExportPDF} 
        className="d-flex align-items-center gap-2"
      >
         <i className="bi bi-file-earmark-pdf-fill"></i> Baixar Relatório
      </Button>
    </div>
  );
};

export default BotoesExportacao;