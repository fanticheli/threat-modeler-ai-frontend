# Threat Modeler AI - Frontend

Interface web para o Threat Modeler AI, uma ferramenta de modelagem de ameaças automatizada usando metodologia STRIDE.

## Tech Stack

- **Vite** - Build Tool
- **React 18** - UI Library
- **TypeScript** - Type Safety
- **TailwindCSS** - Styling
- **shadcn/ui** - Component Library
- **React Dropzone** - File Upload
- **Framer Motion** - Animations
- **React Query** - Data Fetching
- **Recharts** - Charts

## Funcionalidades

- Upload de diagramas de arquitetura
- Validação de qualidade da imagem
- Seleção de idioma (Português/Inglês)
- Acompanhamento de progresso em tempo real (SSE)
- Visualização de componentes e ameaças (STRIDE)
- Score de risco geral com gauge visual
- Exportação de relatórios (PDF, JSON, Markdown)
- Histórico de análises

## Pré-requisitos

- Node.js 18+
- Backend rodando (threat-modeler-ai-backend)

## Instalação

```bash
# Clone o repositório
git clone https://github.com/fanticheli/threat-modeler-ai-frontend.git
cd threat-modeler-ai-frontend

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env.local

# Inicie em desenvolvimento
npm run dev
```

## Variáveis de Ambiente

```env
# Backend API URL
# Local: http://localhost:3001
# Prod: https://threat-modeler-api.onrender.com
VITE_API_URL=http://localhost:3001
```

> Sem `VITE_API_URL` configurado, a aplicação roda com dados mock.

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia em modo desenvolvimento (porta 8080) |
| `npm run build` | Build de produção |
| `npm run preview` | Preview do build de produção |
| `npm run lint` | Executa linter |
| `npm run test` | Executa testes |
| `npm run test:watch` | Executa testes em modo watch |

## Estrutura

```
src/
├── components/           # Componentes React
│   ├── ui/               # shadcn/ui components
│   ├── AnalysisProgress  # Progresso da análise (SSE)
│   ├── ComponentCard     # Card de componente detectado
│   ├── RiskScoreGauge    # Gauge de score de risco
│   ├── ThreatCard        # Card de ameaça STRIDE
│   └── UploadZone        # Zona de upload de imagem
├── pages/                # Páginas da aplicação
│   ├── Index             # Home - Upload
│   ├── Analysis          # Resultado da análise
│   ├── History           # Histórico de análises
│   └── NotFound          # 404
├── services/             # API client
├── types/                # TypeScript types
├── hooks/                # Custom hooks
└── lib/                  # Utilitários
```

## Repositórios Relacionados

- [threat-modeler-ai-backend](https://github.com/fanticheli/threat-modeler-ai-backend) - API Backend

## Licença

MIT
