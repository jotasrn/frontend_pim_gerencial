# HortiFruti Management System - Frontend

Sistema de gerenciamento para hortifruti desenvolvido em React com integração ao back-end Java.

## 🚀 Tecnologias Utilizadas

- **React 18** - Biblioteca principal
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **React Router** - Roteamento
- **Axios** - Cliente HTTP
- **Lucide React** - Ícones

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
├── contexts/           # Contexts do React (Auth, API)
├── hooks/              # Custom hooks
├── pages/              # Páginas da aplicação
├── services/           # Serviços de API
├── utils/              # Utilitários
└── App.tsx             # Componente principal
```

## 🔧 Configuração



2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
.env
```

Edite o arquivo `.env` com a URL do seu back-end:
```
REACT_APP_API_URL=http://localhost:8080
```

4. **Execute o projeto**
```bash
npm run dev
```

## 🔐 Autenticação

O sistema utiliza JWT (JSON Web Token) para autenticação. O token é armazenado no localStorage e automaticamente incluído nas requisições através dos interceptors do Axios.

## 📡 Integração com API

### Configuração da API

O arquivo `src/services/api.js` contém a configuração base do Axios:

- **baseURL**: URL do back-end Java
- **Interceptors**: Adição automática do token JWT
- **Tratamento de erros**: Redirecionamento automático em caso de token expirado

### Serviços Disponíveis

- **produtoService**: CRUD de produtos
- **categoriaService**: CRUD de categorias
- **promocaoService**: Gerenciamento de promoções
- **fornecedorService**: Gerenciamento de fornecedores
- **perdaService**: Registro de perdas
- **estoqueService**: Controle de estoque
- **entregaService**: Gerenciamento de entregas
- **relatorioService**: Geração de relatórios

### Custom Hooks

- **useProdutos**: Gerenciamento de estado dos produtos
- **useCategorias**: Gerenciamento de estado das categorias
- **useEntregas**: Gerenciamento de estado das entregas

## 🛠️ Utilitários

O arquivo `src/utils/apiHelpers.js` contém funções úteis:

- Formatação de erros da API
- Validação de CNPJ
- Formatação de moeda e datas
- Debounce para pesquisas
- Helpers para autenticação

## 🔄 Tratamento de Erros

- **ApiErrorBoundary**: Captura erros não tratados
- **Interceptors**: Tratamento automático de erros HTTP
- **Loading states**: Estados de carregamento em todas as operações
- **Mensagens amigáveis**: Feedback claro para o usuário

## 📱 Responsividade

O sistema é totalmente responsivo, funcionando em:
- Desktop
- Tablet
- Mobile

## 🚀 Deploy

Para fazer o deploy da aplicação:

1. **Build de produção**
```bash
npm run build
```

2. **Configure a variável de ambiente de produção**
```
REACT_APP_API_URL=https://sua-api-producao.com
```

## 📋 Scripts Disponíveis

- `npm run dev` - Executa em modo de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run preview` - Visualiza o build de produção
- `npm run lint` - Executa o linter

