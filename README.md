# Threat Modeler AI - Frontend

Interface web para o Threat Modeler AI, uma ferramenta de modelagem de ameaças automatizada usando metodologia STRIDE.

## Tech Stack

- **Next.js 14** - React Framework
- **TypeScript** - Type Safety
- **TailwindCSS** - Styling
- **React Dropzone** - File Upload

## Funcionalidades

- Upload de diagramas de arquitetura
- Seleção de idioma (Português/Inglês)
- Acompanhamento de progresso em tempo real (SSE)
- Visualização de componentes e ameaças
- Exportação de relatórios (PDF, JSON, Markdown)
- Histórico de análises

## Pré-requisitos

- Node.js 18+
- Backend rodando (threat-modeler-ai-backend)

## Instalação

```bash
# Clone o repositório
git clone https://github.com/SEU_USUARIO/threat-modeler-ai-frontend.git
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
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia em modo desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Inicia servidor de produção |
| `npm run lint` | Executa linter |

## Docker

```bash
# Build da imagem
docker build -t threat-modeler-frontend .

# Executar container
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=http://api:3001 threat-modeler-frontend
```

## Estrutura

```
src/
├── app/                  # App Router (Next.js 14)
│   ├── page.tsx          # Home - Upload
│   ├── analysis/[id]/    # Resultado da análise
│   └── history/          # Histórico
├── components/           # Componentes React
├── services/             # API client
└── types/                # TypeScript types
```

## Repositórios Relacionados

- [threat-modeler-ai-backend](https://github.com/SEU_USUARIO/threat-modeler-ai-backend) - API NestJS

## Licença

MIT
