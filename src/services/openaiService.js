import OpenAI from 'openai';

// Configuração da API do OpenAI
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Necessário para usar no frontend
});

/**
 * Gera um resumo inteligente dos planos de ação usando ChatGPT
 * @param {Array} plansData - Array com os dados dos planos de ação
 * @returns {Promise<string>} - Resumo gerado pela IA
 */
export const generateActionPlanSummary = async (plansData) => {
  try {
    // Preparar o prompt com os dados dos planos
    const plansText = plansData.map((plan, index) => {
      return `
        Plano #${index + 1} (${plan.voteCount} votos):
        - Questão: ${plan.text}
        - Ação: ${plan.action || 'Não definido'}
        - Responsável: ${plan.responsible || 'Não definido'}  
        - Prazo: ${plan.deadline || 'Não definido'}`;
          }).join('\n\n');

    const prompt = `
Você é um consultor especialista em retrospectivas ágeis e melhoria contínua. Analise os seguintes planos de ação de uma retrospectiva e gere um resumo executivo conciso e estratégico.

PLANOS DE AÇÃO:
${plansText}

Por favor, gere um resumo que:
1. Identifique os principais temas e padrões
2. Destaque as prioridades baseadas nos votos
3. Analise a viabilidade e coerência dos planos
4. Sugira insights ou melhorias se necessário
5. Mantenha um tom profissional e construtivo

O resumo deve ter entre 100-200 palavras e focar no valor estratégico dos planos definidos.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Você é um especialista em retrospectivas ágeis e análise de planos de ação. Forneça resumos concisos, estratégicos e construtivos."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error('Erro ao gerar resumo com ChatGPT:', error);
    
    if (error.status === 401) {
      throw new Error('Chave da API do OpenAI inválida. Verifique sua configuração.');
    } else if (error.status === 429) {
      throw new Error('Limite de requisições excedido. Tente novamente em alguns minutos.');
    } else if (error.status === 500) {
      throw new Error('Erro interno do servidor OpenAI. Tente novamente mais tarde.');
    } else {
      throw new Error('Erro ao conectar com a API do OpenAI. Verifique sua conexão.');
    }
  }
};

/**
 * Verifica se a API key está configurada
 * @returns {boolean}
 */
export const isOpenAIConfigured = () => {
  return !!import.meta.env.VITE_OPENAI_API_KEY;
};
