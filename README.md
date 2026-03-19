# ⚜️ ERP - Grupo Escoteiro 107º Padre Roma

![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.2-blue?style=for-the-badge&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)
![Prisma ORM](https://img.shields.io/badge/Prisma-7.4-2D3748?style=for-the-badge&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql)

Sistema de Gestão Integrada (ERP) desenvolvido exclusivamente para a Diretoria e Tesouraria do Grupo Escoteiro 107º Padre Roma. O sistema centraliza o controle financeiro, gestão do efetivo (jovens e responsáveis) e logística (almoxarifado) com segurança de nível bancário.

---

## 🚀 Principais Funcionalidades

### 👥 Módulo de Efetivo (Jovens)
* Cadastro completo de jovens com cálculo automático do Ramo (Lobinho, Escoteiro, Sênior, Pioneiro) baseado na idade.
* Registro de dados de contato dos responsáveis.
* Visualização rápida de distribuição do efetivo por seção no Dashboard.

### 💰 Módulo Financeiro (Tesouraria)
* **Mensalidades:** Geração de lote de mensalidades, controle de status (Aberto, Pago, Atrasado), "baixa" rápida de pagamentos.
* **Cobrança Inteligente:** Geração de mensagem automática de cobrança via WhatsApp para responsáveis inadimplentes.
* **Carnê Virtual:** Emissão de "Carnê Virtual" com QR Code PIX na tela.
* **Despesas:** Lançamento de saídas e gastos operacionais do grupo.
* **Caixa Individual:** Controle de fundos individuais de cada jovem (créditos e débitos para acampamentos e atividades).

### 📦 Módulo de Logística (Almoxarifado)
* Cadastro de materiais de patrulha e sede (barracas, lampiões, ferramentas).
* Controle de condição (Novo, Bom, Manutenção) e localização.
* Rastreio de itens físicos totais vs. emprestados.

### 📊 Relatórios Avançados (ExcelJS)
* **Histórico de Mensalidades:** Exportação em Excel separada automaticamente por abas mensais (ex: 03-2026), com formatação contábil e cores de status.
* **Relatório Geral (Diretoria):** O Dashboard gera um super-relatório com 6 abas simultâneas (Efetivo, Contatos, Caixa Individual, Mensalidades, Despesas, Almoxarifado), com colunas ajustadas, tipografia profissional e tabelas coloridas.

---

## 🔐 Arquitetura de Segurança (Nível Bancário)

Sendo uma aplicação que lida com dados de menores e finanças, a segurança foi priorizada em todas as camadas:

1. **Proxy/Middleware (Next.js 16):** Blindagem total que impede acesso a qualquer página interna sem autenticação, redirecionando invasores para o `/login`.
2. **Proteção de APIs:** Todas as rotas da pasta `/api` possuem verificação de sessão (`getServerSession`).
3. **Zod Validation (Anti-Injeção):** Todos os dados recebidos do cliente passam por uma "alfândega" rígida de validação de schemas (Zod) antes de tocarem no banco de dados, impedindo XSS e SQL Injection.
4. **Proteção contra Força Bruta (Rate Limiting):** Sistema de *Account Lockout* integrado no banco de dados. Após 5 tentativas de login com senha errada, a conta é bloqueada por 15 minutos.
5. **Auto-Logout por Inatividade:** Componente de segurança que encerra a sessão e limpa os tokens se o usuário ficar inativo por 15 minutos.
6. **Security Headers:** Configurações no `next.config.ts` contra Clickjacking e Sniffing (Strict-Transport-Security, X-Frame-Options, etc.).

---

## 🛠️ Tecnologias Utilizadas

* **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS v4, Framer Motion (Animações), Lucide React (Ícones).
* **Backend:** Next.js Server Actions & API Routes, NextAuth.js (Autenticação JWT com Bcrypt).
* **Banco de Dados:** PostgreSQL (via Supabase), Prisma ORM (Tipagem e Migrations).
* **Ferramentas:** Zod (Validação de Dados), ExcelJS & File-Saver (Geração avançada de relatórios em `.xlsx`).

---

## ⚙️ Como Executar o Projeto Localmente

### 1. Pré-requisitos
* Node.js (v18 ou superior)
* Um banco de dados PostgreSQL (pode usar o Supabase gratuitamente)

### 2. Instalação
Clone o repositório e instale as dependências:
```bash
git clone [https://github.com/luismour/erp107-app.git](https://github.com/luismour/erp107-app.git)
cd erp107-app
npm install