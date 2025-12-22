export const processarDadosRelatorio = (usuarioId, db) => {
    // 1. Filtrar o diário para o usuário
    const diarioUsuario = (db.diario_alimentar || []).filter(item => item.usuarioId === usuarioId || item.usuarioId === Number(usuarioId));
    
    // 2. Mapeamento de alimentos para acesso rápido
    const alimentosMap = new Map();
    (db.alimentos || []).forEach(a => alimentosMap.set(a.id, a));
    
    // 3. Agrupar por data formatada para evitar duplicatas visuais
    const diasMap = new Map();

    diarioUsuario.forEach(registroDia => {
        // Formatar data em UTC
        const diaFormatado = new Date(registroDia.data).toLocaleDateString("pt-BR", { day: '2-digit', month: '2-digit', timeZone: 'UTC' });
        
        if (!diasMap.has(diaFormatado)) {
            diasMap.set(diaFormatado, {
                dataOriginal: registroDia.data, // Mantém a primeira data encontrada como referência
                diaFormatado: diaFormatado,
                calorias: 0,
                proteinas: 0,
                carboidratos: 0,
                gorduras: 0,
                refeicoes: []
            });
        }

        const diaAgregado = diasMap.get(diaFormatado);
        
        // Processar refeições deste registro
        if (registroDia.refeicoes) {
            Object.entries(registroDia.refeicoes).forEach(([tipo, listaItens]) => {
                const itensProcessados = listaItens.map(item => {
                    const alimento = alimentosMap.get(item.id);
                    if (!alimento) return null;
                    
                    const fator = item.gramas / 100; // Base 100g
                    
                    const calorias = (alimento.calorias || 0) * fator;
                    const proteinas = (alimento.proteina || 0) * fator;
                    const carboidratos = (alimento.carboidrato || 0) * fator;
                    const gorduras = (alimento.gordura || 0) * fator;

                    diaAgregado.calorias += calorias;
                    diaAgregado.proteinas += proteinas;
                    diaAgregado.carboidratos += carboidratos;
                    diaAgregado.gorduras += gorduras;

                    return { ...alimento, gramasConsumidas: item.gramas, tipoRefeicao: tipo };
                }).filter(Boolean);

                diaAgregado.refeicoes.push(...itensProcessados);
            });
        }
    });

    // 4. Converter Map de volta para Array e formatar saída final
    return Array.from(diasMap.values()).map(dia => ({
        data: dia.dataOriginal,
        diaFormatado: dia.diaFormatado,
        caloriasConsumidas: Math.round(dia.calorias),
        proteinas: Math.round(dia.proteinas),
        carboidratos: Math.round(dia.carboidratos),
        gorduras: Math.round(dia.gorduras),
        refeicoes: dia.refeicoes
    })).sort((a, b) => new Date(a.data) - new Date(b.data)); // Ordenar por data
};
