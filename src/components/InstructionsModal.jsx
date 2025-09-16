import React from 'react';
import './InstructionsModal.css';

const InstructionsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="instructions-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📚 Como Jogar - Ilha dos Projetos Perdidos</h2>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>
        
        <div className="modal-content">
          <div className="instructions-section">
            <h3>🎯 Objetivo do Jogo</h3>
            <p>
              Realize uma retrospectiva ágil colaborativa onde a equipe identifica melhorias, 
              vota nas prioridades e cria planos de ação para implementação.
            </p>
          </div>

          <div className="instructions-section">
            <h3>🎮 Como Jogar</h3>
            <div className="step">
              <h4>1. 🏠 Criação da Sala</h4>
              <p>• Um facilitador cria uma sala e compartilha o código</p>
              <p>• Outros participantes entram com o código da sala</p>
              <p>• Escolha seu personagem e cor preferida</p>
            </div>

            <div className="step">
              <h4>2. 🎪 Exploração da Ilha</h4>
              <p>• Use as <strong>setas do teclado</strong> ou <strong>clique na tela</strong> para mover seu personagem</p>
              <p>• Explore a ilha e veja outros jogadores em tempo real</p>
              <p>• Clique no seu baú para adicionar cards de retrospectiva</p>
            </div>

            <div className="step">
              <h4>3. 📝 Adicionando Cards</h4>
              <p>• Clique no seu baú (caixa ao lado do personagem)</p>
              <p>• Escreva suas observações sobre o que funcionou bem, problemas ou sugestões</p>
              <p>• Adicione quantos cards quiser</p>
              <p>• Veja os cards dos outros participantes sendo adicionados</p>
            </div>

            <div className="step">
              <h4>4. ⏰ Timer da Sessão</h4>
              <p>• O facilitador pode iniciar um timer para a sessão</p>
              <p>• Todos veem o tempo restante na tela</p>
              <p>• Use o tempo para adicionar e revisar cards</p>
            </div>

            <div className="step">
              <h4>5. 🗳️ Votação</h4>
              <p>• Após o tempo, o facilitador inicia a votação</p>
              <p>• Vote nos cards mais importantes (1 voto por card)</p>
              <p>• Os cards mais votados passam para a próxima fase</p>
            </div>

            <div className="step">
              <h4>6. 🏝️ Votação da Ilha</h4>
              <p>• Decida quais itens "deixar na ilha" (não priorizar agora)</p>
              <p>• Vote nos cards que podem ser adiados</p>
              <p>• Os cards restantes viram planos de ação</p>
            </div>

            <div className="step">
              <h4>7. 📋 Planejamento</h4>
              <p>• Para cada card prioritário, defina:</p>
              <p>  - <strong>Ação concreta</strong> a ser tomada</p>
              <p>  - <strong>Responsável</strong> pela implementação</p>
              <p>  - <strong>Prazo</strong> para conclusão</p>
            </div>

            <div className="step">
              <h4>8. 🤖 Resumo Inteligente</h4>
              <p>• Gere um resumo automático com ChatGPT</p>
              <p>• Receba insights e recomendações sobre os planos</p>
              <p>• Compartilhe o resumo com a equipe</p>
            </div>
          </div>

          <div className="instructions-section">
            <h3>🎮 Controles do Personagem</h3>
            <div className="controls">
              <div className="control-item">
                <span className="key">↑ ↓ ← →</span>
                <span>Mover personagem com setas do teclado</span>
              </div>
              <div className="control-item">
                <span className="key">🖱️ Click</span>
                <span>Clicar na tela para mover para o local</span>
              </div>
              <div className="control-item">
                <span className="key">📦 Baú</span>
                <span>Clicar no baú para gerenciar cards</span>
              </div>
            </div>
          </div>

          <div className="instructions-section">
            <h3>👥 Papéis dos Participantes</h3>
            <div className="role">
              <h4>🔧 Facilitador (Criador da Sala)</h4>
              <p>• Controla timers e fases da retrospectiva</p>
              <p>• Inicia votações e planejamento</p>
              <p>• Pode finalizar a sessão</p>
            </div>
            <div className="role">
              <h4>👤 Participantes</h4>
              <p>• Adicionam cards e participam das votações</p>
              <p>• Contribuem no planejamento dos planos de ação</p>
              <p>• Veem progresso da sessão em tempo real</p>
            </div>
          </div>

          <div className="instructions-section tips">
            <h3>💡 Dicas para uma Boa Retrospectiva</h3>
            <ul>
              <li>Seja específico e construtivo nos cards</li>
              <li>Vote com base no impacto e importância</li>
              <li>Defina planos de ação claros e viáveis</li>
              <li>Mantenha o foco nos próximos passos</li>
              <li>Use o resumo da IA para insights adicionais</li>
            </ul>
          </div>
        </div>

        <div className="modal-footer">
          <button className="close-button-footer" onClick={onClose}>
            Entendi, vamos começar! 🚀
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstructionsModal;
