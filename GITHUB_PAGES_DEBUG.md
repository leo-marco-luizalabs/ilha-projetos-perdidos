# ⚠️ Configuração do GitHub Pages

## Para resolver o erro 404, siga estes passos:

### 1. **Configurar GitHub Pages no repositório:**
   - Vá para: `Settings` → `Pages`
   - **Source:** Selecione `GitHub Actions` (não Branch!)
   - Salve as configurações

### 2. **Configurar o Secret da Hugging Face:**
   - Vá para: `Settings` → `Secrets and variables` → `Actions`
   - Clique em `New repository secret`
   - **Name:** `VITE_HUGGINGFACE_TOKEN`
   - **Secret:** Cole seu token da Hugging Face
   - Salve

### 3. **Verificar se a Action rodou:**
   - Vá para a aba `Actions` do repositório
   - Veja se o workflow "Deploy to GitHub Pages" executou
   - Se houver erro, verifique os logs

### 4. **Forçar novo deploy:**
   ```bash
   git commit --allow-empty -m "Trigger GitHub Pages deploy"
   git push origin master
   ```

### 5. **URL correta após o deploy:**
   ```
   https://leo-marco-luizalabs.github.io/ilha-projetos-perdidos/
   ```

## 🐛 **Debugging:**

Se ainda não funcionar:
1. Verifique se o source é `GitHub Actions` (não Branch)
2. Confirme que o token está configurado nos Secrets
3. Veja os logs da Action para erros
4. Aguarde até 10 minutos para propagação

## ✅ **Arquivo .nojekyll adicionado**
Este arquivo garante que o GitHub Pages não processe como Jekyll.
