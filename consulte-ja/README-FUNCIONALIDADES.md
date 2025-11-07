# ConsulteJá - Guia Completo de Funcionalidades

## 📋 Visão Geral

O ConsulteJá é uma aplicação web desenvolvida em React que permite consultar informações de produtos através de códigos de barras. É uma ferramenta prática para consumidores que desejam conhecer detalhes de produtos antes de comprar.

## 🎯 Funcionalidades Principais

### 1. **Consulta por Código de Barras**

- **Como funciona:** Digite um código de barras (EAN/UPC) no campo de entrada
- **Resultado:** A aplicação busca informações do produto em múltiplas APIs
- **Informações retornadas:**
  - Nome do produto
  - Descrição completa
  - Preço (quando disponível)
  - Imagem do produto
  - Marca, modelo, categoria
  - Dimensões e peso (quando disponível)

### 2. **Leitura Automática de Código de Barras**

- **Como usar:** Clique no botão "📷 Escanear Código de Barras"
- **Tecnologia:** Usa a câmera do dispositivo para ler códigos
- **Compatibilidade:** Funciona em smartphones e tablets com câmera
- **Permissões:** Solicita acesso à câmera quando necessário

### 3. **Histórico de Consultas**

- **Como funciona:** Todas as consultas são salvas automaticamente
- **Limite:** Mantém as últimas 5 consultas
- **Navegação:** Clique em qualquer item do histórico para visualizar novamente
- **Limpeza:** Botão "🗑️ Limpar Histórico" remove todos os registros

### 4. **Modo Escuro/Claro**

- **Localização:** Botão ☀️/🌙 no canto superior esquerdo
- **Funcionalidade:** Alterna entre tema claro e escuro
- **Persistência:** Salva a preferência do usuário
- **Aplicação:** Afeta toda a interface da aplicação

### 5. **Modo Acessibilidade (Daltonismo)**

- **Localização:** Botão 👁️/👁️‍🗨️ ao lado do botão de tema
- **Funcionalidade:** Otimiza cores para pessoas com daltonismo
- **Contraste:** Cores de alto contraste (azul, verde, vermelho)
- **Persistência:** Salva a preferência do usuário

## 🔧 Tecnologias Utilizadas

### **Frontend:**

- **React:** Framework JavaScript para construção da interface
- **Bootstrap:** Framework CSS para layout responsivo
- **Axios:** Biblioteca para fazer requisições HTTP às APIs
- **QuaggaJS:** Biblioteca para leitura de códigos de barras

### **APIs Externas:**

- **Barcode Lookup:** API principal com vasto catálogo de produtos
- **UPC Item DB:** API secundária com preços e imagens
- **Open Food Facts:** API de produtos alimentícios
- **Cosmos:** API brasileira com produtos nacionais

## 📱 Como Usar a Aplicação

### **Passo 1: Acessar a Aplicação**

- Abra o navegador e acesse `http://localhost:3000` (desenvolvimento)
- Ou acesse o link de produção quando implantado

### **Passo 2: Fazer uma Consulta**

1. Digite o código de barras no campo de entrada
2. Clique em "Consultar" ou pressione Enter
3. Aguarde o carregamento dos dados
4. Visualize as informações do produto

### **Passo 3: Usar o Scanner (Opcional)**

1. Clique em "📷 Escanear Código de Barras"
2. Permita o acesso à câmera quando solicitado
3. Aponte a câmera para o código de barras
4. A leitura é feita automaticamente

### **Passo 4: Personalizar a Experiência**

- Use o botão ☀️/🌙 para alternar entre temas claro/escuro
- Use o botão 👁️/👁️‍🗨️ para ativar o modo de acessibilidade

## 🎨 Design e Interface

### **Estilo Visual:**

- **Neumorphism:** Design moderno com sombras suaves
- **Responsivo:** Adapta-se a diferentes tamanhos de tela
- **Minimalista:** Interface limpa e intuitiva
- **Acessível:** Cores e contrastes otimizados

### **Componentes da Interface:**

- **Header:** Título da aplicação e botões de configuração
- **Hero Section:** Mensagem de boas-vindas
- **Área de Busca:** Campo de entrada e botões de ação
- **Resultados:** Exibição detalhada do produto encontrado
- **Histórico:** Lista das consultas recentes
- **Footer:** Informações sobre a aplicação

## 🔄 Fluxo de Funcionamento

```
1. Usuário acessa a página
2. Sistema carrega preferências salvas (tema, modo acessibilidade)
3. Usuário digita código ou usa scanner
4. Sistema faz requisições às APIs (Barcode Lookup → UPC Item DB → Open Food Facts → Cosmos)
5. Sistema exibe resultado ou mensagem de erro
6. Consulta é adicionada ao histórico
7. Usuário pode navegar pelo histórico ou fazer nova consulta
```

## ⚠️ Tratamento de Erros

### **Cenários de Erro:**

- **Produto não encontrado:** Mensagem amigável explicando o problema
- **Erro de conexão:** Sugestão para verificar internet
- **Código inválido:** Orientação para verificar o código digitado
- **API indisponível:** Sistema tenta APIs alternativas automaticamente

### **Mensagens de Loading:**

- Spinner animado durante as consultas
- Texto "Consultando..." no botão
- Interface responsiva durante carregamento

## 🚀 Implantação e Produção

### **Desenvolvimento Local:**

```bash
npm install
npm start
```

### **Build para Produção:**

```bash
npm run build
```

### **Implantação:**

- **Vercel:** Plataforma recomendada para React
- **Netlify:** Alternativa gratuita e fácil
- **GitHub Pages:** Opção básica gratuita

## 📊 Limitações e Considerações

### **Limitações Técnicas:**

- Requer conexão com internet para consultas
- Scanner necessita câmera no dispositivo
- Algumas APIs têm limites de uso gratuito

### **Compatibilidade:**

- Navegadores modernos (Chrome, Firefox, Safari, Edge)
- Dispositivos móveis com câmera
- Resolução mínima de tela: 320px

### **Privacidade:**

- Não armazena dados pessoais do usuário
- Histórico salvo localmente no navegador
- Não compartilha dados com terceiros

## 🔮 Possíveis Melhorias Futuras

- **Busca por voz:** Comando de voz para códigos
- **Favoritos:** Salvar produtos favoritos
- **Comparação:** Comparar preços entre lojas
- **Offline:** Funcionalidade básica sem internet
- **Compartilhamento:** Compartilhar produtos encontrados
- **Avaliações:** Sistema de reviews de produtos

---

**Desenvolvido com ❤️ para facilitar a vida dos consumidores!**
