# 🤖 Configuração do ChatGPT para Resumos Inteligentes

## 📋 Visão Geral

O sistema agora utiliza a API do **ChatGPT (OpenAI)** para gerar resumos inteligentes dos planos de ação da retrospectiva, substituindo a integração anterior com Hugging Face.

## ⚙️ Como Configurar

### 1. **Obter Chave da API OpenAI**

1. Acesse: https://platform.openai.com/api-keys
2. Faça login ou crie uma conta
3. Clique em "Create new secret key"
4. Copie a chave gerada (formato: `sk-...`)

### 2. **Configurar Localmente**

1. Abra o arquivo `.env` na raiz do projeto
2. Substitua a linha existente por:
```bash
VITE_OPENAI_API_KEY=sua_chave_aqui
```

### 3. **Configurar no GitHub Actions (Deploy)**

1. Vá para: Repositório → Settings → Secrets and variables → Actions
2. Clique em "New repository secret"
3. Nome: `VITE_OPENAI_API_KEY`
4. Valor: Sua chave da API OpenAI
5. Clique em "Add secret"

## 🎯 Funcionalidades

### **Resumo Inteligente**
- Análise automática dos planos de ação votados
- Identificação de temas principais
- Priorização baseada na votação da equipe
- Recomendações para implementação
- Próximos passos sugeridos

### **Características do Resumo**
- **Modelo**: GPT-3.5-turbo
- **Limite**: 200 palavras
- **Tom**: Profissional mas acessível
- **Idioma**: Português
- **Contexto**: Retrospectivas ágeis

## 🔧 Exemplo de Uso

1. Complete uma retrospectiva
2. Defina planos de ação para os cards votados
3. Na tela de resumo, clique em "🤖 Gerar Resumo ChatGPT"
4. Aguarde alguns segundos
5. Receba um resumo executivo inteligente

## 💰 Custos

- **Modelo**: GPT-3.5-turbo
- **Custo aproximado**: $0.002 por resumo
- **Tokens por resumo**: ~300-500 tokens
- **Custo mensal estimado**: Menos de $1 para uso moderado

## 🛠️ Solução de Problemas

### **Erro: "Chave da API não configurada"**
- Verifique se a variável `VITE_OPENAI_API_KEY` está no `.env`
- Confirme se a chave está no formato correto (`sk-...`)

### **Erro: "Limite atingido"**
- Sua conta OpenAI atingiu o limite de uso
- Adicione créditos em: https://platform.openai.com/usage

### **Erro: "Erro de conexão"**
- Verifique sua conexão com a internet
- A API da OpenAI pode estar temporariamente indisponível

## 🔄 Migração do Hugging Face

As seguintes mudanças foram feitas:

✅ **Removido**:
- Dependência `@huggingface/inference`
- Arquivo `huggingfaceService.js`
- Variáveis `VITE_HUGGINGFACE_API_KEY`

✅ **Adicionado**:
- Novo serviço `openaiService.js`
- Variável `VITE_OPENAI_API_KEY`
- Interface melhorada para ChatGPT

## 📝 Código de Exemplo

```javascript
// Gerar resumo
const summary = await generateActionPlanSummary(plansData);
console.log(summary);

// Verificar configuração
const isConfigured = isOpenAIConfigured();
```

## 🚀 Resultado

O resumo gerado inclui:
- **Cabeçalho**: "🤖 Resumo Inteligente da Retrospectiva (ChatGPT)"
- **Conteúdo**: Análise estruturada dos planos
- **Rodapé**: Informações sobre geração automática

Exemplo de saída:
```
🤖 **Resumo Inteligente da Retrospectiva** (ChatGPT)

A equipe identificou 3 áreas principais de melhoria: comunicação, 
processos e ferramentas. O plano com maior votação (5 votos) foca na 
implementação de reuniões diárias mais eficientes...

---
💡 *Resumo gerado automaticamente com base nos 5 planos de ação mais votados pela equipe.*
```
