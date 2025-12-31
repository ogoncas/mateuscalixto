# 📰 Portal de Notícias Mateus Calixto

Um portal de notícias e artigos minimalista e funcional, desenvolvido com tecnologias web modernas e integração em tempo real com o **Firebase**. O projeto permite a leitura de notícias, sistema de comentários dinâmicos, busca inteligente e um painel administrativo completo para gestão de conteúdo.

---

## 🚀 Funcionalidades

### **Para Leitores:**

* **Página Inicial Dinâmica:** Exibição de notícias recentes com sistema de paginação automática.
* **Busca em Tempo Real:** Filtro de notícias por título ou resumo diretamente na barra de pesquisa.
* **Sistema de Comentários:** Leitores logados podem comentar, editar e excluir suas próprias participações nas notícias.
* **Autenticação:** Sistema de login e cadastro de usuários via Firebase Auth.
* **Design Responsivo:** Interface otimizada para dispositivos móveis e desktops.

### **Para Administradores:**

* **Painel Administrativo:** Área restrita para publicação de novas notícias.
* **Gestão de Conteúdo (CRUD):** Criar, editar e excluir postagens existentes através de uma interface intuitiva.
* **Segurança de Rota:** Verificação de nível de acesso (role) para garantir que apenas administradores acessem o painel.

---

## 🛠️ Tecnologias Utilizadas

* **Frontend:** HTML5, CSS3 (Variáveis CSS, Flexbox, Grid) e JavaScript (ES6+ Modules).
* **Backend as a Service (BaaS):** [Firebase](https://firebase.google.com/)
* **Firestore:** Banco de dados NoSQL para notícias, usuários e comentários.
* **Authentication:** Gestão de usuários e segurança.
* **Hosting:** (Opcional) Recomendado para deploy do projeto.


* **Fontes:** Inter e Playfair Display (via Google Fonts).

---

## 📂 Estrutura do Projeto

```text
├── index.html          # Página principal com grid de notícias e busca
├── post.html           # Template para leitura da notícia completa
├── admin.html          # Painel de controle do administrador
├── style.css           # Estilização global e componentes
├── script.js           # Lógica da home, busca e autenticação
├── post.js             # Lógica de carregamento do post e comentários
└── post.js             # Lógica administrativa (CRUD)

```

---

## 🎨 Design

O projeto segue uma linha **minimalista e editorial**, utilizando a fonte *Playfair Display* para títulos, evocando a estética de jornais clássicos, enquanto a fonte *Inter* garante legibilidade para o corpo do texto.

---

## 👨‍💻 Desenvolvedor

Projeto desenvolvido por **Mateus Calixto**.
