/**
 * Serviço de integração com Hugging Face Inference API
 * Completamente GRATUITO para uso pessoal e projetos pequenos
 * https://huggingface.co/docs/api-inference/quicktour
 */

import { HfInference } from "@huggingface/inference";

// Configuração da API da Hugging Face
const hf = new HfInference(import.meta.env.VITE_HUGGINGFACE_API_KEY);

/**
 * Gera um resumo inteligente dos planos de ação usando Hugging Face
 * @param {Array} plansData - Array com os dados dos planos de ação
 * @returns {Promise<string>} - Resumo gerado pela IA
 */
export const generateActionPlanSummary = async (plansData) => {
  try {
    // Preparar o texto com os dados dos planos para resumo
    const plansText = plansData.map((plan, index) => {
      const actionText = plan.action ? `Ação: ${plan.action}` : 'Ação não definida';
      const responsibleText = plan.responsible ? `Responsável: ${plan.responsible}` : 'Responsável não definido';
      const deadlineText = plan.deadline ? `Prazo: ${plan.deadline}` : 'Prazo não definido';
      
      return `Item ${index + 1} (${plan.voteCount} votos): ${plan.text}. ${actionText}. ${responsibleText}. ${deadlineText}.`;
    }).join(' ');

    const contextualText = `Retrospectiva ágil - Planos de ação da equipe: ${plansText}`;

    // Usar o modelo BART da Facebook para sumarização
    const result = await hf.summarization({
      model: "facebook/bart-large-cnn", // Modelo bem treinado para resumo
      inputs: contextualText,
      parameters: { 
        max_length: 150,  // Máximo 150 tokens para o resumo
        min_length: 50,   // Mínimo 50 tokens
        do_sample: false  // Usar greedy decoding para consistência
      }
    });

    if (!result || !result.summary_text) {
      throw new Error('Resposta inválida da API Hugging Face.');
    }

    // Adicionar contexto ao resumo gerado
    const summary = result.summary_text.trim();
    const contextualSummary = `📋 Resumo Inteligente dos Planos de Ação:\n\n${summary}\n\n💡 Resumo gerado automaticamente com base nos ${plansData.length} planos de ação mais votados da retrospectiva.`;

    return contextualSummary;

  } catch (error) {
    console.error('Erro ao gerar resumo com Hugging Face:', error);
    
    if (error.message.includes('401') || error.message.includes('unauthorized')) {
      throw new Error('Token da API do Hugging Face inválido. Verifique sua configuração.');
    } else if (error.message.includes('429') || error.message.includes('rate limit')) {
      throw new Error('Limite de requisições excedido. Tente novamente em alguns minutos.');
    } else if (error.message.includes('503') || error.message.includes('loading')) {
      throw new Error('Modelo está carregando. Tente novamente em 1-2 minutos.');
    } else if (error.message.includes('API')) {
      throw error; // Re-throw API specific errors
    } else {
      throw new Error('Erro ao conectar com a API do Hugging Face. Verifique sua conexão.');
    }
  }
};

/**
 * Verifica se o token do Hugging Face está configurado
 * @returns {boolean}
 */
export const isHuggingFaceConfigured = () => {
  return !!import.meta.env.VITE_HUGGINGFACE_API_KEY;
};

// Manter compatibilidade com código existente
export const isOpenAIConfigured = isHuggingFaceConfigured;
