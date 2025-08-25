# 🏝️ Ilha dos Projetos Perdidos

Um jogo multiplayer em tempo real onde exploradores podem se conectar, se mover pelo mapa e gerenciar seus próprios baús de tesouro com cards personalizados.

## ✨ Funcionalidades

### 🎮 Sistema Multiplayer
- **Salas privadas**: Crie ou entre em salas usando códigos únicos
- **Movimento em tempo real**: Clique em qualquer lugar da tela para se mover
- **Sincronização instantânea**: Veja outros jogadores se movendo em tempo real
- **Desconexão automática**: Players são removidos automaticamente quando saem

### 🤖 Integração com Hugging Face (GRATUITO!)
- **Resumo Inteligente**: Gere resumos automáticos dos planos de ação usando IA
- **Modelo BART**: Facebook BART-Large-CNN para sumarização de alta qualidade
- **Sem custos**: API completamente gratuita para uso pessoal
- **Sem limites restritivos**: Para projetos pequenos e médios

## 🚀 Configuração

### Pré-requisitos
- Node.js (versão 18 ou superior)
- Conta no Firebase (para banco de dados)
- Token do Hugging Face (GRATUITO - para funcionalidades de IA)

### Instalação
1. Clone o repositório
```bash
git clone <repo-url>
cd ilha-projetos-perdidos
```

2. Instale as dependências
```bash
npm install
```

3. Configure as variáveis de ambiente
```bash
cp .env.example .env
```

4. Configure seu token do Hugging Face no arquivo `.env`:
```env
VITE_HUGGINGFACE_API_KEY=seu_token_aqui
```

5. Inicie o servidor de desenvolvimento
```bash
npm run dev
```

### 🔑 Obtendo seu Token do Hugging Face (GRATUITO!)
1. Acesse [huggingface.co](https://huggingface.co)
2. Clique em "Sign Up" e crie uma conta gratuita
3. Após o login, vá para [Settings > Access Tokens](https://huggingface.co/settings/tokens)
4. Clique em "New token" e escolha um nome
5. Selecione "Read" como permissão (suficiente para inference)
6. Copie o token e cole no arquivo `.env`

**Vantagens da Hugging Face:**
- ✅ **Completamente GRATUITA** para uso pessoal
- ✅ **Sem limites restritivos** para projetos pequenos/médios
- ✅ **Sem necessidade de cartão de crédito**
- ✅ **Modelos de alta qualidade** (Facebook BART)
- ✅ **Comunidade ativa** e bem documentada
- ✅ **API estável e confiável**

**Nota**: Mantenha seu token seguro e nunca o compartilhe publicamente!

## 📋 Funcionalidades de Retrospectiva

### 📦 Sistema de Baús
- **Baú pessoal**: Cada jogador tem seu próprio baú de tesouro
- **Cards personalizados**: Adicione notas/cards tipo post-it ao seu baú
- **Privacidade**: Apenas você pode abrir e editar seu próprio baú
- **Contador visual**: Veja quantos itens cada jogador tem em seu baú
- **Gestão de cards**: Adicione e remova cards facilmente

### ⏰ Sistema de Timer Controlado
- **Controle do dono**: Apenas o criador da sala pode iniciar/parar o timer
- **Tempos pré-definidos**: 1, 3, 5, 10, 15 ou 30 minutos
- **Tempo personalizado**: Configure qualquer tempo entre 1-180 minutos
- **Restrição temporal**: Cards só podem ser adicionados durante o timer ativo
- **Feedback visual**: Timer exibido em tempo real para todos os jogadores
- **Indicação de status**: Mostra claramente quando o tempo está ativo ou inativo

### 📊 Sistema de Resultados
- **Visualização completa**: Após o timer acabar, veja todos os cards de todos os jogadores
- **Organização por jogador**: Cards agrupados por quem os criou
- **Estatísticas da sessão**: Número total de cards e participantes
- **Controle de fluxo**: Dono pode ver resultados ou iniciar nova rodada
- **Transparência total**: Todos os cards ficam visíveis para toda a sala

### 🔧 Funcionalidades Técnicas
- **Firebase Realtime Database**: Sincronização em tempo real
- **Detecção de desconexão**: Múltiplas camadas de detecção quando jogadores saem
- **Interface responsiva**: Funciona em desktop e mobile
- **Animações fluidas**: Transições suaves e feedback visual

## 🚀 Como usar

1. **Acesse a aplicação**
2. **Digite seu nome**
3. **Escolha uma opção**:
   - **Criar Nova Sala**: Gera um código único automaticamente
   - **Entrar em Sala**: Use um código fornecido por outro jogador
4. **Compartilhe o código** da sala com outros jogadores
5. **Clique na tela** para se mover pelo mapa
6. **Clique no seu baú** (📦) para gerenciar seus cards
7. **Veja os contadores** nos baús de outros jogadores

## 🎯 Controles

### 👑 Para o Dono da Sala:
- **Iniciar Timer**: Clique em "⏰ Iniciar Timer" no header
- **Configurar Tempo**: Escolha entre tempos pré-definidos ou personalize
- **Parar Timer**: Use o botão "⏹️ Parar" durante a sessão ativa
- **Gerenciar Sala**: Controle total sobre as sessões de cards

### 👤 Para Jogadores:
- **Movimento**: Clique em qualquer lugar da tela
- **Abrir baú**: Clique no seu próprio baú (azul) - apenas quando timer ativo
- **Ver informações**: Passe o mouse sobre baús de outros jogadores
- **Acompanhar tempo**: Visualize o timer no header da sala

### ⏰ Estados do Timer:
- **🟢 Ativo**: Cards podem ser adicionados, timer contando regressivamente
- **� Inativo**: Aguardando o dono iniciar, cards bloqueados
- **⏱️ Aguardando**: Para jogadores quando não há timer configurado

## 🛠️ Tecnologias

- **React 18** com Hooks
- **Vite** para desenvolvimento rápido
- **Firebase Realtime Database** para sincronização
- **CSS3** com animações e grid layout
- **JavaScript ES6+**

## 🎨 Design

- Interface moderna com gradientes e animações
- Cards estilo post-it amarelos
- Baús com contadores visuais coloridos
- Responsive design para diferentes telas
- Tema tropical/aventura com emojis

---

*Explore, conecte-se e organize seus tesouros na Ilha dos Projetos Perdidos!* 🏴‍☠️
