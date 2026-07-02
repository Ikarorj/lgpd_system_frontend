# LGPD System - Frontend

Sistema web para conformidade com a **Lei Geral de Proteção de Dados (LGPD)** brasileira. Permite o upload de documentos e artefatos de código-fonte, extração automatizada de informações relevantes, análise de conformidade LGPD e geração de pareceres jurídicos detalhados.

> Este projeto foi extraído de um repositório monolítico (monorepo) para desacoplamento entre frontend e backend. Foi produzido utilizando o [Speckit](https://speckit.ai) com abordagem **SDD (Specification-Driven Development)**, onde as especificações guiaram toda a geração e evolução do código.

---

## Funcionalidades

- **Autenticação** — Login e cadastro via Supabase com tokens JWT
- **Upload de Artefatos** — Arraste e solte arquivos (PDF, DOCX, Markdown, TXT, Python, JavaScript, TypeScript, Java, C#, Go, Rust, JSON, YAML) com barra de progresso em tempo real
- **Extração de Dados** — Visualização de campos extraídos com nível de confiança, evidências e itens sinalizados
- **Análise de Conformidade** — Score de conformidade, violações agrupadas por gravidade (CRÍTICO, ALTO, MÉDIO, BAIXO) com ações corretivas
- **Parecer Jurídico** — Geração automatizada de parecer com sumário executivo, análise de dados pessoais, bases legais, riscos e recomendações
- **Dashboard** — Visão geral com extrações recentes e acesso rápido às funcionalidades

---

## Como funciona

1. O usuário faz login ou se cadastra no sistema
2. Na dashboard, inicia o upload de artefatos (documentos ou código-fonte)
3. O frontend envia os arquivos para a API, que processa e extrai dados estruturados
4. A página de análise exibe os campos extraídos, itens sinalizados e o score de conformidade LGPD
5. É possível revisar violações, atualizar status de remediação e gerar um parecer jurídico completo

---

## Tecnologias

| Ferramenta | Versão | Finalidade |
|---|---|---|
| React | ^18.2.0 | Biblioteca de interface |
| TypeScript | ^5.3.3 | Tipagem estática |
| Vite | ^5.0.11 | Bundler e dev server |
| React Router | ^6.21.0 | Roteamento SPA |
| TanStack React Query | ^5.17.0 | Gerenciamento de estado do servidor |
| Axios | ^1.6.5 | Cliente HTTP |
| Supabase JS | ^2.110.0 | Autenticação |
| Tailwind CSS | ^3.4.1 | Estilização utilitária |
| Lucide React | ^0.303.0 | Ícones |
| React Dropzone | ^14.2.3 | Upload drag-and-drop |
| Vitest | ^1.2.0 | Testes unitários |
| Testing Library | — | Testes de componentes |
| Cypress | ^13.6.0 | Testes E2E |
| Docker | — | Containerização |

---

## Estrutura do projeto

```
src/
├── components/       # Componentes reutilizáveis
│   ├── ComplianceViolations.tsx
│   ├── ExtractionResults.tsx
│   ├── FlaggedItemsReview.tsx
│   ├── OpinionView.tsx
│   ├── ProgressTracker.tsx
│   ├── UploadZone.tsx
│   └── ...
├── pages/            # Páginas da aplicação
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── DashboardPage.tsx
│   ├── UploadFlowPage.tsx
│   └── AnalysisResultsPage.tsx
├── services/         # Camada de API (Axios)
│   ├── apiService.ts
│   ├── extractionService.ts
│   └── uploadService.ts
├── hooks/            # Hooks customizados
│   ├── useUpload.ts
│   └── useExtraction.ts
├── contexts/         # Contextos React
│   └── AuthContext.tsx
├── lib/              # Inicializações
│   └── supabaseClient.ts
├── types/            # Tipos e interfaces
├── utils/            # Utilitários
└── styles/           # Estilos globais
shared/               # Código compartilhado (tipos e constantes)
tests/                # Testes unitários e de componentes
```

---

## Como executar

### Pré-requisitos

- Node.js >= 18
- npm

### Instalação

```bash
npm install
```

### Desenvolvimento

```bash
npm run dev
```

Acesse `http://localhost:5173`. O proxy do Vite redireciona chamadas `/api` para `http://localhost:3000`.

### Build

```bash
npm run build
```

### Testes

```bash
npm test              # Todos os testes
npm run test:unit     # Testes unitários
npm run test:coverage # Com cobertura
npm run test:e2e      # Testes E2E (Cypress)
```

### Type-check e Lint

```bash
npm run type-check
npm run lint
```

### Docker

```bash
docker build -t lgpd-system-frontend .
docker run -p 8080:80 lgpd-system-frontend
```

---

## Variáveis de ambiente (.env)

| Variável | Descrição |
|---|---|
| `VITE_API_BASE_URL` | Base URL da API (ex: `/api/v1`) |
| `VITE_API_TIMEOUT_MS` | Timeout das requisições (ex: `30000`) |
| `VITE_SUPABASE_URL` | URL do projeto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Chave anônima do Supabase |

---

## Rotas

| Caminho | Página | Acesso |
|---|---|---|
| `/login` | Login | Público |
| `/register` | Cadastro | Público |
| `/` | Dashboard | Protegido |
| `/upload` | Upload de artefatos | Protegido |
| `/analysis/:extractionId` | Resultados da análise | Protegido |

---

## API

O frontend consome uma API REST em `/api/v1` com os seguintes grupos de endpoints:

- **Auth** — `POST /auth/login`, `POST /auth/register`
- **Artifacts** — `POST /artifacts/upload`, `GET /artifacts/upload/:sessionId`
- **Extractions** — `GET /extractions`, `GET /extractions/:id`, `GET /extractions/:id/flagged`
- **Compliance** — `GET /extractions/:id/compliance`, `POST /extractions/:id/compliance/run`
- **Opinion** — `POST /extractions/:id/opinion`
- **Violations** — `PATCH /compliance/violations/:id`

A autenticação é feita via token JWT armazenado no `localStorage` e enviado no header `Authorization: Bearer <token>`.

---

## Limitações

- **Groq (LLM)** — O backend utiliza a API do Groq para processamento de linguagem natural. A versão gratuita impõe limites de taxa (rate limits) e de tokens por minuto, o que pode impactar a performance em análises com muitos arquivos ou documentos extensos.
- **Análise de PDFs** — A qualidade da extração depende diretamente da quantidade de texto presente no PDF. Documentos com pouco conteúdo textual, como contratos digitalizados (imagens) sem OCR, formulários preenchidos manualmente ou arquivos com baixa densidade de caracteres, podem resultar em extrações incompletas ou com baixo score de confiança.
