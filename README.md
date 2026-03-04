# 🗳️ VotaAki - Sistema de Enquetes e Votação Online

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)
![React](https://img.shields.io/badge/React-Front--end-blue?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Back--end-green?logo=node.js)
![TypeScript](https://img.shields.io/badge/TypeScript-Frontend-blue?logo=typescript)
![MySQL](https://img.shields.io/badge/MySQL-Database-orange?logo=mysql)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

---

## 📌 Sobre o Projeto
O **VotaAki** é uma plataforma moderna para criação e participação em enquetes online. O sistema foca em **segurança, performance e estética premium**, garantindo que cada utilizador tenha uma experiência fluida e cada voto seja contabilizado com integridade.

Ideal para:
- Instituições de ensino (Grêmios, votações de classe)
- Organizações e associações
- Decisões participativas em pequenas e médias empresas

---

## 🚀 Funcionalidades Principais

### 👤 Para Utilizadores
- 🔐 **Autenticação Segura** – Login e Registro com proteção JWT.
- 🗳️ **Participação em Enquetes** – Listagem moderna de enquetes ativas.
- 🚫 **Voto Único** – Proteção rigorosa contra votos duplicados (um por utilizador/enquete).
- 📊 **Visualização de Resultados** – Feedback imediato após a votação com gráficos e contadores.

### 🛡️ Para Administradores (Dashboard Admin)
- 📝 **Criação de Enquetes** – Interface intuitiva para definir títulos, descrições e períodos.
- 🕒 **Controle de Período** – Automação de abertura e encerramento de votações.
- 📈 **Gestão de Opções** – Controle total sobre as alternativas de cada enquete.

---

## 🧰 Tech Stack

| Camada | Tecnologias |
|------|-------------|
| 🎨 **Frontend** | React (Vite), TypeScript, CSS Modules, React Icons |
| ⚙️ **Backend** | Node.js, Express, ES Modules |
| 🗄️ **Banco de Dados** | MySQL (com Triggers e Views para performance) |
| 🔐 **Segurança** | JWT (JSON Web Tokens), Validação SQL |

---

## 🛠️ Configuração do Ambiente

### Pré-requisitos
- Node.js (v18+)
- MySQL

### Backend
1. Entre na pasta `backend`: `cd votaaki/backend`
2. Instale as dependências: `npm install`
3. Configure o arquivo `.env` com suas credenciais de banco de dados e `JWT_SECRET`.
4. Importe o script SQL em `docs/database/scripts/ModeloLogico.sql`.
5. Inicie o servidor: `npm start`

### Frontend
1. Entre na pasta `frontend`: `cd votaaki/frontend`
2. Instale as dependências: `npm install`
3. Inicie a aplicação: `npm run dev`

---

## 📄 Licença
Este projeto está sob a licença **MIT**.

---

## 👤 Autor
Desenvolvido por **Grupo 01** e **Antigravity AI**.
💻 Focado em criar soluções digitais que unem performance e design de alto nível.
