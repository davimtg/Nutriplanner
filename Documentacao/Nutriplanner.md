# Nutriplanner – Detalhamento do Site

## 1. Estrutura Geral
- **Responsivo**: desktop (layout em colunas, dashboards mais abertos) e mobile (menus colapsados, navegação por bottom tab).  
- **Navegação**:  
  - Barra superior (desktop) ou menu inferior (mobile).  
  - Seções: Dashboard | Receitas | Planejamento | Lista de Compras | Perfil.  
  - Para nutricionistas: + Pacientes.  

## 2. Telas e Funcionalidades

### Tela 1 – Login / Registro
**Funcionalidades**:  
- Login com email/senha.  
- Cadastro → escolher perfil (Paciente ou Nutricionista).  
- Recuperar senha via email.  

### Tela 2 – Dashboard
**Paciente**:  
- Resumo do dia: calorias consumidas vs meta, macros (carbo/proteína/gordura).  
- Gráfico circular ou barra de progresso.  
- Checklist das refeições planejadas (café, almoço, jantar, lanches).  
- Tracker de hidratação (copinhos clicáveis).  
- Botão rápido: Adicionar refeição extra.  

**Nutricionista**:  
- Lista de pacientes vinculados.  
- Botão Prescrever novo plano.  

### Tela 3 – Biblioteca de Receitas
**Funcionalidades**:  
- Busca por nome/ingrediente.  
- Filtros: calorias, tempo de preparo, tags (vegano, low-carb, fit).  
- Cards de receitas → foto, nome, kcal, macros.  
- Botão Favoritar e Adicionar ao plano.  
- Nutricionista pode marcar como Recomendada para pacientes.  

### Tela 4 – Criar Receita / Ingrediente
**Funcionalidades**:  
- Formulário com: nome, foto, descrição, ingredientes e quantidades.  
- Cálculo automático de macros por porção.  
- Marcar como privada (só eu) ou pública (feed).  
- Upload de imagem.  

### Tela 5 – Calculadoras Nutricionais
**Funcionalidades**:  
- BMR/TDEE → resultado automático com base nos dados do perfil.  
- Macros sugeridos → porcentagem ajustável (ex.: 40/30/30).  
- Atualizar metas nutricionais do usuário.  

### Tela 6 – Planejamento de Dieta
**Paciente**:  
- Planner semanal → refeições em colunas (seg, ter, qua...).  
- Arrastar e soltar receitas/ingredientes para cada refeição.  
- Salvar plano e vincular ao dia/semana.  
- Pode usar plano prescrito pelo nutricionista.  

**Nutricionista**:  
- Selecionar paciente → montar plano (semana/dia).  
- Prescrever (enviar notificação).  
- Editar planos já enviados.  

### Tela 7 – Lista de Compras
**Funcionalidades**:  
- Lista gerada automaticamente do plano alimentar.  
- Ingredientes agrupados (ex.: 1kg frango + 500g frango = 1.5kg).  
- Checkbox para marcar como comprado.  
- Botão Enviar para Delivery (hook para integração futura com iFood/Rappi).  

### Tela 8 – Perfil
**Paciente**:  
- Dados pessoais: peso, altura, idade, objetivo.  
- Histórico de peso → gráfico de evolução.  
- Prefe
