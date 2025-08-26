# 🚀 GitHub Pages Deploy Setup

## ⚙️ Configuração dos Secrets

Para que o deploy funcione corretamente, você precisa configurar o secret no GitHub:

### 1. **Acesse as configurações do repositório:**
   - Vá para: `Settings` → `Secrets and variables` → `Actions`

### 2. **Crie um novo Repository Secret:**
   - Clique em `New repository secret`
   - **Name:** `VITE_HUGGINGFACE_TOKEN`
   - **Secret:** Cole seu token da Hugging Face aqui
   - Clique em `Add secret`

### 3. **Obter o token da Hugging Face:**
   1. Acesse [huggingface.co](https://huggingface.co)
   2. Faça login na sua conta
   3. Vá em `Settings` → `Access Tokens`
   4. Clique em `New token`
   5. Escolha `Read` permissions
   6. Copie o token gerado

### 4. **Habilitar GitHub Pages:**
   - Vá para: `Settings` → `Pages`
   - **Source:** `GitHub Actions`
   - Salve as configurações

## 🔄 Como funciona o Deploy

1. **Automático:** A cada push na branch `master`
2. **Manual:** Você pode executar manualmente na aba `Actions`
3. **Build:** O projeto é buildado com as variáveis de ambiente
4. **Deploy:** O resultado é publicado no GitHub Pages

## 🌐 URL do Deploy

Após o primeiro deploy bem-sucedido, seu projeto estará disponível em:
```
https://leo-marco-luizalabs.github.io/ilha-projetos-perdidos/
```

## 🐛 Troubleshooting

### ❌ **Se o deploy falhar:**
1. Verifique se o secret `VITE_HUGGINGFACE_TOKEN` está configurado
2. Confirme que o token da Hugging Face é válido
3. Verifique os logs na aba `Actions`

### ❌ **Se a página não carregar:**
1. Verifique se o GitHub Pages está habilitado
2. Confirme que a source é `GitHub Actions`
3. Aguarde alguns minutos para propagação

## 📋 Checklist

- [ ] Token da Hugging Face obtido
- [ ] Secret `VITE_HUGGINGFACE_TOKEN` configurado
- [ ] GitHub Pages habilitado com source `GitHub Actions`
- [ ] Push feito na branch `master`
- [ ] Action executada com sucesso
- [ ] Site acessível na URL do GitHub Pages

---

**🎉 Pronto! Seu projeto será deployado automaticamente a cada push!**
