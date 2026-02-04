 # Projeto : Aplicativo de Votos

## Descrição
O **Aplicativo de Votos** é uma plataforma para criação e gerenciamento de **Enquetes online**, permitindo que utilizadores registrados possam votar em opções pré-definidas. O sistema garante a **integridade dos votos** e apresenta os resultados de forma clara e transparente.

---

## Domínio do Problema
- Administradores podem **criar enquetes**, definindo:
  - Título
  - Descrição
  - Opções de voto (mínimo de 2)
  - Período de votação (data de início e fim)
- Utilizadores registrados e logados podem:
  - Votar em enquetes ativas (apenas uma vez por enquete)
  - Visualizar resultados após votar ou quando a enquete estiver encerrada
- O sistema deve:
  - Garantir que cada utilizador vote apenas uma vez
  - Exibir resultados com **contagem de votos e percentuais**
  - Manter a contagem de votos **precisa e atualizada**

---

##  Funcionalidades
- **Autenticação de utilizadores** (login e registro)
- **Criação de enquetes** (somente administradores)
- **Gestão de opções de voto**
- **Controle de período de votação**
- **Registro único de voto por utilizador**
- **Exibição de resultados**:
  - Número de votos por opção
  - Percentual de cada opção

---

##  Regras de Negócio
- Apenas **administradores** podem criar enquetes.
- Cada enquete deve ter **mínimo de duas opções de voto**.
- Um utilizador pode votar **uma única vez por enquete**.
- Votos só podem ser realizados em **enquetes ativas**.
- Resultados só podem ser visualizados:
  - Após o utilizador ter votado
  - Ou quando a enquete estiver encerrada

---

##  Estrutura do Projeto 
votaaki/
├── manage.py
├── core/                  # Configurações do projeto (settings, wsgi, asgi)
│   ├── settings.py
│   └── urls.py            # Root URLconf
├── apps/                  # Pasta opcional para organizar seus apps
│   ├── authentication/
│   │   ├── models.py
│   │   ├── views.py
│   │   └── templates/
│   │       └── authentication/
│   │           ├── login.html
│   │           └── signup.html
│   ├── polls/             # Unificando votação e enquetes
│   │   ├── models.py
│   │   ├── views.py
│   │   └── templates/
│   │       └── polls/
│   │           ├── list.html
│   │           └── detail.html
│   └── users/             # Gerenciamento de perfis
│       ├── models.py
│       └── templates/
│           └── users/
│               └── profile.html
├── static/                # CSS, JS e Imagens globais
│   ├── css/
│   └── js/
├── templates/             # Templates globais (base.html, navbar, etc.)
│   ├── base.html
│   └── partials/
├── scripts/               # Scripts de automação ou manutenção
└── tests/                 # Testes integrados (opcional, se não estiverem nos apps)