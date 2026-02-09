

# Threat Modeler AI — Plano de Implementação

## Visão Geral
Ferramenta de modelagem de ameaças com IA. O usuário faz upload de um diagrama de arquitetura e recebe um relatório STRIDE completo. Frontend dark premium com estética de cybersecurity/SOC dashboard.

---

## Design System & Theme

- **100% Dark theme** com paleta cybersecurity (#0A0E1A, #111827, cyan #06B6D4, violet #8B5CF6)
- **Glassmorphism** sutil nos cards com backdrop-blur e bordas semi-transparentes
- **Tipografia**: JetBrains Mono (headings/código) + DM Sans (body text)
- **Grid pattern** animado no background (estilo blueprint/radar)
- **Glow effects** nos botões primários (box-shadow cyan)
- **Badges de severidade** coloridos: Critical (vermelho), High (laranja), Medium (amarelo), Low (verde)
- **Skeleton loaders** em vez de spinners para todos os estados de loading
- **Animações** staggered fade-in + slide-up nos cards e componentes

---

## Página 1: Home / Upload (`/`)

### Hero Section
- Título "Threat Modeler AI" com gradiente cyan→violet no texto
- Subtítulo explicativo sobre análise STRIDE
- Background com grid pattern animado (pulsing dots)

### Área de Upload
- Drop zone grande com borda tracejada cyan (react-dropzone)
- Ícone shield + upload, aceita PNG/JPG/WEBP até 10MB
- Preview da imagem após upload com overlay
- Barra de qualidade da imagem (verde/amarelo/vermelho) via API `/api/upload/validate`
- Seletor de idioma PT-BR | EN-US (toggle group)
- Botão "🔍 Iniciar Análise" com glow effect (desabilitado até score ≥ 50)
- Ao clicar, chama API e redireciona para `/analysis/{id}`

### Histórico Rápido (sidebar/seção inferior)
- Últimas 5 análises com thumbnail, data, contagem de componentes e ameaças
- Clicável para navegar à análise

---

## Página 2: Análise (`/analysis/:id`)

### Fase 1 — Progress (durante processamento)
- Conexão SSE para receber progresso em tempo real (com fallback polling)
- Stepper visual com 6 fases: Validando → Detectando Componentes → Mapeando Conexões → Análise STRIDE → Gerando Relatório → Completo
- Fase ativa com pulse/glow cyan, completadas com check verde
- Barra de progresso global no topo (0-100%)
- Imagem do diagrama visível como contexto

### Fase 2 — Dashboard de Resultados (3 seções)

**A) Header/Summary Bar**
- Risk Score circular (gauge/donut chart) com cor dinâmica
- Stat cards: componentes, conexões, ameaças totais
- Badges de severidade (Critical, High, Medium, Low)
- Badge do cloud provider (AWS/Azure/GCP)
- Botões de export: PDF | JSON | Markdown

**B) Painel Esquerdo — Componentes Detectados (30-40%)**
- Cards com ícone por tipo (Server, Database, Globe, Shield, etc.)
- Nome, tipo (badge), quantidade de ameaças com severidade máxima
- Clicável para filtrar ameaças no painel direito
- Search/filter e agrupamento por tipo

**C) Painel Direito — Relatório STRIDE (60-70%)**
- 6 tabs STRIDE (Spoofing, Tampering, Repudiation, Info Disclosure, DoS, Elevation of Privilege)
- Threat cards com borda lateral colorida por severidade
- Título, componente afetado, descrição colapsável, badge de severidade
- Lista de contramedidas como checklist
- Expandir/colapsar

**D) Visualização do Diagrama**
- Botão flutuante "Ver Diagrama Original"
- Modal fullscreen com zoom e pan

---

## Página 3: Histórico (`/history`)

- Tabela/grid com todas as análises
- Colunas: Thumbnail, Data, Provider, Componentes, Ameaças, Risk Score, Ações
- Filtros por data, provider, faixa de risk score
- Delete com confirmação via API
- Empty state elegante com ilustração

---

## Serviço de API & Dados Mock

- Serviço centralizado (`services/api.ts`) consumindo `VITE_API_URL`
- Endpoints: validate, upload, getAnalysis, streamProgress (SSE), exportReport, listAnalyses, deleteAnalysis
- **Dados mockados realistas** para demonstração (componentes AWS, ameaças reais como "SQL Injection via unvalidated input", "Missing TLS on internal cache connection")
- Error handling com toast notifications (sonner)
- Empty states elegantes em todas as seções

---

## Extras
- Favicon com ícone de shield
- Título da página "Threat Modeler AI"
- Desktop-first, funcional em tablet
- Acessibilidade: contraste adequado, focus indicators, aria-labels
- Framer Motion para animações de entrada e micro-interações

