/**
 * Serviço de integração com DeepAI Text Summarization API
 * Limite gratuito: 500 chamadas por dia
 * https://deepai.org/machine-learning-model/summarization
 */

const DEEPAI_API_URL = 'https://api.deepai.org/api/summarization';

/**
 * Gera um resumo inteligente dos planos de ação usando DeepAI
 * @param {Array} plansData - Array com os dados dos planos de ação
 * @returns {Promise<string>} - Resumo gerado pela IA
 */
export const generateActionPlanSummary = async (plansData) => {
  try {
    // Preparar o texto com os dados dos planos para resumo
    const plansText = plansData.map((plan, index) => {
      return `Plano ${index + 1} (${plan.voteCount} votos): ${plan.text}. Ação planejada: ${plan.action || 'Não definido'}. Responsável: ${plan.responsible || 'Não definido'}. Prazo: ${plan.deadline || 'Não definido'}.`;
    }).join(' ');

    const contextualText = `Resumo de retrospectiva ágil - Planos de ação prioritários da equipe: ${plansText}`;

    // Preparar o FormData para a API da DeepAI
    const formData = new FormData();
    formData.append('text', contextualText);

    const response = await fetch(DEEPAI_API_URL, {
      method: 'POST',
      headers: {
        'Api-Key': import.meta.env.VITE_DEEPAI_API_KEY,
      },
      body: formData
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Chave da API do DeepAI inválida. Verifique sua configuração.');
      } else if (response.status === 429) {
        throw new Error('Limite de requisições excedido (500/dia). Tente novamente amanhã.');
      } else if (response.status === 500) {
        throw new Error('Erro interno do servidor DeepAI. Tente novamente mais tarde.');
      } else {
        throw new Error(`Erro na API DeepAI: ${response.status}`);
      }
    }

    const data = await response.json();
    
    if (!data.output) {
      throw new Error('Resposta inválida da API DeepAI.');
    }

    // Adicionar contexto ao resumo gerado
    const summary = data.output.trim();
    const contextualSummary = `📋 Resumo dos Planos de Ação:\n\n${summary}\n\n💡 Este resumo foi gerado automaticamente com base nos ${plansData.length} planos de ação mais votados da retrospectiva.`;

    return contextualSummary;

  } catch (error) {
    console.error('Erro ao gerar resumo com DeepAI:', error);
    
    if (error.message.includes('API')) {
      throw error; // Re-throw API specific errors
    } else {
      throw new Error('Erro ao conectar com a API do DeepAI. Verifique sua conexão.');
    }
  }
};

/**
 * Verifica se a API key do DeepAI está configurada
 * @returns {boolean}
 */
export const isDeepAIConfigured = () => {
  return !!import.meta.env.VITE_DEEPAI_API_KEY;
};

// Manter compatibilidade com código existente
export const isOpenAIConfigured = isDeepAIConfigured;
