/**
 * Serviço de integração com OpenAI ChatGPT API
 * Para gerar resumos inteligentes dos planos de ação da retrospectiva
 */

/**
 * Gera um resumo inteligente dos planos de ação usando ChatGPT
 * @param {Array} plansData - Array com os dados dos planos de ação
 * @returns {Promise<string>} - Resumo gerado pela IA
 */
export const generateActionPlanSummary = async (plansData) => {
  try {
    // Verificar se a API key está configurada
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('Chave da API OpenAI não configurada. Configure VITE_OPENAI_API_KEY no arquivo .env');
    }

    // Preparar o texto com os dados dos planos para resumo
    const plansText = plansData.map((plan, index) => {
      const actionText = plan.action ? `Ação: ${plan.action}` : 'Ação não definida';
      const responsibleText = plan.responsible ? `Responsável: ${plan.responsible}` : 'Responsável não definido';
      const deadlineText = plan.deadline ? `Prazo: ${plan.deadline}` : 'Prazo não definido';
      
      return `${index + 1}. ${plan.text} (${plan.voteCount} votos)
   - ${actionText}
   - ${responsibleText}
   - ${deadlineText}`;
    }).join('\n\n');

    // Prompt estruturado para gerar um resumo profissional
    const prompt = `Você é um facilitador experiente de retrospectivas ágeis. Analise os seguintes planos de ação votados pela equipe e gere um resumo executivo profissional.

PLANOS DE AÇÃO DA RETROSPECTIVA:
${plansText}

Gere um resumo que inclua:
1. Visão geral dos principais temas identificados
2. Prioridades baseadas na votação da equipe
3. Recomendações para implementação
4. Próximos passos sugeridos

Mantenha o tom profissional mas acessível, e limite a 200 palavras.`;

    // Fazer a requisição para a API do OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Você é um facilitador experiente de retrospectivas ágeis que cria resumos executivos concisos e acionáveis.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.7,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erro da API OpenAI: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Resposta inválida da API OpenAI.');
    }

    const summary = data.choices[0].message.content.trim();
    
    // Adicionar cabeçalho e rodapé ao resumo
    const contextualSummary = `🤖 **Resumo Inteligente da Retrospectiva** (ChatGPT)\n\n${summary}\n\n---\n💡 *Resumo gerado automaticamente com base nos ${plansData.length} planos de ação mais votados pela equipe.*`;

    return contextualSummary;

  } catch (error) {
    console.error('Erro ao gerar resumo com ChatGPT:', error);
    
    // Mensagens de erro mais específicas
    if (error.message.includes('API key')) {
      throw new Error('⚠️ API do ChatGPT não configurada. Entre em contato com o administrador.');
    } else if (error.message.includes('quota')) {
      throw new Error('⚠️ Limite de uso da API ChatGPT atingido. Tente novamente mais tarde.');
    } else if (error.message.includes('network') || error.message.includes('fetch')) {
      throw new Error('⚠️ Erro de conexão. Verifique sua internet e tente novamente.');
    } else {
      throw new Error(`⚠️ Erro ao gerar resumo: ${error.message}`);
    }
  }
};

/**
 * Verifica se a API do OpenAI está configurada
 * @returns {boolean} - True se a API key estiver configurada
 */
export const isOpenAIConfigured = () => {
  return !!import.meta.env.VITE_OPENAI_API_KEY;
};

/**
 * Gera insights adicionais sobre a retrospectiva (funcionalidade extra)
 * @param {Object} retroData - Dados completos da retrospectiva
 * @returns {Promise<string>} - Insights gerados pela IA
 */
export const generateRetroInsights = async (retroData) => {
  try {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('Chave da API OpenAI não configurada.');
    }

    const { allCards, teamSize } = retroData;
    
    // Contar cards por categoria
    const cardsByOwner = Object.keys(allCards || {}).length;
    const totalCards = Object.values(allCards || {}).reduce((sum, cards) => sum + Object.keys(cards).length, 0);
    
    const prompt = `Analise os dados desta retrospectiva ágil:

- Participantes: ${teamSize || cardsByOwner} pessoas
- Total de cards: ${totalCards}
- Categorias preenchidas: ${cardsByOwner}

Com base nesses números, forneça insights sobre:
1. Nível de engajamento da equipe
2. Diversidade de perspectivas
3. Sugestões para próximas retrospectivas

Limite a 100 palavras.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 150,
        temperature: 0.8
      })
    });

    const data = await response.json();
    return data.choices[0].message.content.trim();

  } catch (error) {
    console.error('Erro ao gerar insights:', error);
    return null;
  }
};
