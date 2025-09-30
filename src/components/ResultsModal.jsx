import React, { useState, useEffect } from 'react';
import './ResultsModal.css';

const ResultsModal = ({ 
  isOpen, 
  onClose, 
  allCards, 
  onNewRound, 
  isOwner, 
  onVote, 
  cardVotes, 
  userVotes, 
  isVotingPhase, 
  votingFinished, 
  onStartVoting, 
  onFinishVoting,
  onRestartVoting,
  startIslandVoting,
  finishIslandVoting,
  voteIslandCard,
  savePlan,
  islandVotingPhase,
  islandUserVotes,
  islandVoteCounts,
  rawIslandVotingData,
  islandVoteLimit,
  setIslandVotingLimit,
  planningPhase,
  cardPlans,
  sessionSummary,
  finalizePlanning,
  generateSharedAISummary,
  otherPlayers,
  userId,
  rawVotingData,
  votingDataTimestamp
}) => {
  // Fecha o modal com a tecla Escape quando aberto
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        onClose && onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const [currentPhase, setCurrentPhase] = useState('results'); // 'results', 'island-voting', 'planning', 'summary'
  const [planningForms, setPlanningForms] = useState({});

  // Calcular status de votação dos jogadores
  const calculatePlayersStatus = () => {
    const playersStatus = {};
    
    // Converter allCards para array para contar total de cards
    const cardsArray = [];
    Object.keys(allCards || {}).forEach(ownerId => {
      const ownerCards = allCards[ownerId] || {};
      Object.keys(ownerCards).forEach(cardId => {
        cardsArray.push(ownerCards[cardId].id);
      });
    });
    
    const totalCards = cardsArray.length;
    
    // Para o jogador atual, usar userVotes que já funciona perfeitamente
    const currentPlayerVotes = Object.keys(userVotes || {}).length;
    playersStatus[userId] = {
      name: 'Você',
      votesCount: currentPlayerVotes,
      totalCards: totalCards,
      isReady: currentPlayerVotes === totalCards && totalCards > 0
    };
    
    // Para outros jogadores, tentar múltiplas abordagens para garantir sincronização
    Object.keys(otherPlayers || {}).forEach(playerId => {
      const player = otherPlayers[playerId];
      let playerVotes = 0;
      
      // Abordagem 1: Usar rawVotingData se disponível
      if (rawVotingData && Object.keys(rawVotingData).length > 0) {
        cardsArray.forEach(cardId => {
          const cardVotingData = rawVotingData[cardId];
          if (cardVotingData) {
            const categories = ['manter', 'melhorar', 'deixarNaIlha'];
            const hasVotedThisCard = categories.some(category => {
              const categoryVotes = cardVotingData[category] || {};
              return categoryVotes[playerId] !== undefined;
            });
            
            if (hasVotedThisCard) {
              playerVotes++;
            }
          }
        });
      } else {
        // Abordagem 2: Estimar baseado nos dados de cardVotes (menos preciso mas funcional)
        // Esta é uma estimativa baseada na atividade geral de votação
        const totalVotesInSystem = Object.values(cardVotes || {}).reduce((total, votes) => {
          return total + (votes.manter || 0) + (votes.melhorar || 0) + (votes.deixarNaIlha || 0);
        }, 0);
        
        // Se há atividade de votação e o jogador está online, estimar que pode ter votado
        if (totalVotesInSystem > 0 && totalCards > 0) {
          // Esta é uma estimativa muito básica - seria ideal ter dados mais precisos
          playerVotes = Math.min(Math.floor(totalVotesInSystem / Object.keys(otherPlayers).length), totalCards);
        }
      }
      
      playersStatus[playerId] = {
        name: player.name || 'Jogador',
        votesCount: playerVotes,
        totalCards: totalCards,
        isReady: playerVotes === totalCards && totalCards > 0
      };
    });
    
    return playersStatus;
  };

  // Calcular status de votação dos jogadores na votação da ilha
  const calculateIslandPlayersStatus = () => {
    if (!islandVotingPhase) return {};
    
    const playersStatus = {};
    
    // Obter cards disponíveis para votação na ilha (cards categorizados como 'melhorar' - Abrigo com goteira)
    const categories = categorizeCards();
    const islandCards = categories.melhorar || [];
    
    // Usar limite configurável ou padrão de 3
    const voteLimit = Math.min(islandVoteLimit || 3, islandCards.length);
    
    // Debug: logar dados para verificação
    if (isOwner) {
      console.log('🔍 Island Voting Debug:', {
        rawIslandVotingData,
        islandVoteCounts,
        islandUserVotes,
        otherPlayers: Object.keys(otherPlayers || {}),
        voteLimit
      });
    }
    
    // Para o jogador atual
    const currentUserVotes = Object.keys(islandUserVotes).filter(id => islandUserVotes[id]);
    playersStatus[userId] = {
      name: 'Você',
      votesCount: currentUserVotes.length,
      voteLimit: voteLimit,
      isReady: currentUserVotes.length >= voteLimit
    };
    
    // Para outros jogadores - usar dados reais do Firebase
    Object.keys(otherPlayers || {}).forEach(playerId => {
      const player = otherPlayers[playerId];
      
      // Contar quantos votos reais este jogador fez usando rawIslandVotingData
      let playerVotesCount = 0;
      
      // Percorrer todos os cards e verificar se este jogador votou em cada um
      Object.keys(rawIslandVotingData || {}).forEach(cardId => {
        const cardVotes = rawIslandVotingData[cardId] || {};
        if (cardVotes[playerId]) {
          playerVotesCount++;
        }
      });
      
      playersStatus[playerId] = {
        name: player.name || 'Jogador',
        votesCount: playerVotesCount,
        voteLimit: voteLimit,
        isReady: playerVotesCount >= voteLimit
      };
    });
    
    return playersStatus;
  };

  // Renderizar status dos jogadores
  const renderPlayersStatus = () => {
    if (!isVotingPhase || votingFinished) return null;
    
    const playersStatus = calculatePlayersStatus();
    const players = Object.entries(playersStatus);
    
    if (players.length === 0) return null;
    
    // Forçar re-render quando rawVotingData muda usando timestamp
    const dataKey = `${votingDataTimestamp}-${Object.keys(rawVotingData).length}`;

    return (
      <div className="players-status-section" key={dataKey}>
        <h3>Status dos Jogadores</h3>
        <div className="players-status-list">
          {players.map(([playerId, status]) => (
            <div 
              key={`${playerId}-${dataKey}`}
              className={`player-status-item ${status.isReady ? 'ready' : 'voting'}`}
            >
              <div className="player-name">
                {status.name}
                {playerId === userId && <span className="you-indicator"> (você)</span>}
              </div>
              <div className="player-progress">
                <span className="vote-progress">
                  {status.votesCount}/{status.totalCards} votos
                </span>
                <div className="status-indicator">
                  {status.isReady ? (
                    <span className="ready-badge">✅ Pronto</span>
                  ) : (
                    <span className="voting-badge">🗳️ Votando</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Renderizar status dos jogadores na votação da ilha
  const renderIslandPlayersStatus = () => {
    if (!islandVotingPhase) return null;
    
    const playersStatus = calculateIslandPlayersStatus();
    const players = Object.entries(playersStatus);
    
    if (players.length === 0) return null;

    // Criar uma chave única para forçar re-render quando os dados mudarem
    const dataKey = `island-${Object.keys(rawIslandVotingData).length}-${JSON.stringify(islandVoteCounts)}`;

    return (
      <div className="players-status-section island-voting-status" key={dataKey}>
        <h3>Status dos Jogadores - Votação dos Cards do Abrigo com Goteira</h3>
        <div className="players-status-list">
          {players.map(([playerId, status]) => (
            <div 
              key={`${playerId}-${dataKey}`}
              className={`player-status-item ${status.isReady ? 'ready' : 'voting'}`}
            >
              <div className="player-name">
                {status.name}
                {playerId === userId && <span className="you-indicator"> (você)</span>}
              </div>
              <div className="player-progress">
                <span className="vote-progress">
                  {status.votesCount}/{status.voteLimit} votos
                </span>
                <div className="status-indicator">
                  {status.isReady ? (
                    <span className="ready-badge">✅ Pronto</span>
                  ) : (
                    <span className="voting-badge">🗳️ Votando</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Indicador se todos terminaram */}
        {players.length > 0 && players.every(([, status]) => status.isReady) && (
          <div className="all-ready-indicator">
            <p>🎉 <strong>Todos os jogadores terminaram de votar!</strong></p>
            {isOwner &&   <p>Você pode finalizar a votação quando quiser.</p>}
          </div>
        )}
      </div>
    );
  };

  // Sincronizar fase atual com os estados do Firebase
  React.useEffect(() => {
    if (sessionSummary && sessionSummary.finalized) {
      setCurrentPhase('summary');
    } else if (planningPhase) {
      setCurrentPhase('planning');
    } else if (islandVotingPhase) {
      setCurrentPhase('island-voting');
    } else {
      setCurrentPhase('results');
    }
  }, [sessionSummary, planningPhase, islandVotingPhase]);

  // Sincronizar formulários de planejamento com o Firebase
  React.useEffect(() => {
    if (cardPlans) {
      setPlanningForms(cardPlans);
    }
  }, [cardPlans]);

  // Categorizar cards por resultado da votação
  const categorizeCards = () => {
    const categories = {
      manter: [],
      melhorar: [],
      deixarNaIlha: []
    };

    if (!allCards || typeof allCards !== 'object') {
      return categories;
    }

    // Converter a estrutura de allCards (object de objects) em array de cards
    const cardsArray = [];
    Object.keys(allCards).forEach(ownerId => {
      const ownerCards = allCards[ownerId] || {};
      Object.keys(ownerCards).forEach(cardId => {
        const card = ownerCards[cardId];
        cardsArray.push({
          id: cardId,
          text: card.text || card.content || '',
          owner: ownerId,
          ...card
        });
      });
    });

    cardsArray.forEach(card => {
      const votes = cardVotes[card.id] || {};
      const voteCount = {
        manter: votes.manter || 0,
        melhorar: votes.melhorar || 0,
        deixarNaIlha: votes.deixarNaIlha || 0
      };

      // Se não há votos, não categorizar o card ainda
      const totalVotes = voteCount.manter + voteCount.melhorar + voteCount.deixarNaIlha;
      if (totalVotes === 0) {
        // Cards sem votos ficam em uma categoria especial ou não aparecem nos resultados
        return; // Pula este card
      }

      const winningOption = Object.keys(voteCount).reduce((a, b) => 
        voteCount[a] > voteCount[b] ? a : b
      );

      categories[winningOption].push({
        ...card,
        voteCount,
        winningOption
      });
    });

    return categories;
  };

  const categories = categorizeCards();

  // Calcular limite de votos para votação dos cards do abrigo com goteira
  const calculateVoteLimit = () => {
    const improveCardCount = categories.melhorar.length;
    // Usar limite configurável ou cálculo automático como fallback
    if (islandVoteLimit && islandVoteLimit > 0) {
      return Math.min(islandVoteLimit, improveCardCount);
    }
    // Fallback para lógica anterior se não houver limite configurado
    if (improveCardCount > 5) {
      return Math.ceil(improveCardCount * 0.2); // 20% dos cards
    }
    return 3; // 3 votos para 5 ou menos cards
  };

  const voteLimit = calculateVoteLimit();

  const handleStartIslandVoting = () => {
    if (startIslandVoting) {
      startIslandVoting();
    }
  };

  const handleVoteIslandCard = (cardId) => {
    const currentUserVotes = Object.keys(islandUserVotes).filter(id => islandUserVotes[id]);
    
    if (currentUserVotes.length >= voteLimit) {
      alert(`Você pode votar em no máximo ${voteLimit} cards!`);
      return;
    }
    
    if (voteIslandCard) {
      voteIslandCard(cardId);
    }
  };

  const handleFinishIslandVoting = () => {
    if (finishIslandVoting) {
      finishIslandVoting();
    }
  };

  const handlePlanningChange = (cardId, field, value) => {
    setPlanningForms(prev => ({
      ...prev,
      [cardId]: {
        ...prev[cardId],
        [field]: value
      }
    }));

    if (savePlan) {
      savePlan(cardId, field, value);
    }
  };

  const renderResults = () => {
    // Se está na fase de votação, mostrar interface de votação
    if (isVotingPhase && !votingFinished) {
      return renderVotingInterface();
    }

    // Verificar se há cards para mostrar
    const totalCards = categories.manter.length + categories.melhorar.length + categories.deixarNaIlha.length;
    
    // Contar cards sem votos
    const cardsArray = [];
    Object.keys(allCards).forEach(ownerId => {
      const ownerCards = allCards[ownerId] || {};
      Object.keys(ownerCards).forEach(cardId => {
        const card = ownerCards[cardId];
        cardsArray.push({
          id: cardId,
          text: card.text || card.content || '',
          owner: ownerId,
          ...card
        });
      });
    });
    
    const cardsWithoutVotes = cardsArray.filter(card => {
      const votes = cardVotes[card.id] || {};
      const totalVotes = (votes.manter || 0) + (votes.melhorar || 0) + (votes.deixarNaIlha || 0);
      return totalVotes === 0;
    });
    
    return (
      <div className="results-content">
        <h2>Resultados da Votação</h2>
        
        {totalCards === 0 && cardsWithoutVotes.length === 0 ? (
          <div className="no-data">
            <p>Nenhum card encontrado para exibir resultados.</p>
            <p>Verifique se há cards cadastrados e se a votação foi finalizada.</p>
          </div>
        ) : (
          <>
            {cardsWithoutVotes.length > 0 && (
              <div className="category-section pending-votes">
                <h3>
                  ⏳ Aguardando Votação
                  <span className="card-count">({cardsWithoutVotes.length} cards)</span>
                </h3>
                <p>Estes cards ainda não receberam votos:</p>
                <div className="cards-grid">
                  {cardsWithoutVotes.map(card => (
                    <div key={card.id} className="result-card pending-card">
                      <p className="card-text">{card.text}</p>
                      <div className="vote-summary">
                        <span className="pending-text">Ainda não votado</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {Object.entries(categories).map(([category, cards]) => (
              cards.length > 0 && (
                <div key={category} className={`category-section ${category}`}>
                  <h3>
                    {category === 'manter' && '💎 Tesouros da ilha'}
                    {category === 'melhorar' && '🏠 Abrigo com goteira'}
                    {category === 'deixarNaIlha' && '🌊 Devolver pro mar'}
                    <span className="card-count">({cards.length} cards)</span>
                  </h3>
                  
                  <div className="cards-grid">
                    {cards.map(card => (
                      <div key={card.id} className="result-card">
                        <p className="card-text">{card.text}</p>
                        <div className="vote-summary">
                          <span className="vote-item manter">Tesouro: {card.voteCount.manter}</span>
                          <span className="vote-item melhorar">Abrigo: {card.voteCount.melhorar}</span>
                          <span className="vote-item deixar">Mar: {card.voteCount.deixarNaIlha}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ))}
          </>
        )}

        {isOwner && categories.melhorar.length > 0 && (
          <div className="island-voting-info">
            <h3>Próxima Fase: Votação dos Cards do Abrigo com Goteira</h3>
            <p>Os cards que precisam de reparo no abrigo passarão por uma nova votação.</p>
            
            {/* Configuração do limite de votos */}
            <div className="vote-limit-config">
              <label htmlFor="voteLimit">
                <strong>Quantos votos cada jogador pode dar?</strong>
              </label>
              <div className="vote-limit-controls">
                <input
                  id="voteLimit"
                  type="number"
                  min="1"
                  max={Math.min(10, categories.melhorar.length)}
                  value={islandVoteLimit || 3}
                  onChange={(e) => setIslandVotingLimit(parseInt(e.target.value) || 3)}
                  className="vote-limit-input"
                />
                <span className="vote-limit-help">
                  (máximo {Math.min(10, categories.melhorar.length)} votos)
                </span>
              </div>
            </div>
            
            <p>Cada participante terá direito a <strong>{voteLimit} votos</strong>.</p>
            <button 
              className="btn btn-primary"
              onClick={handleStartIslandVoting}
            >
              Iniciar Votação dos Cards do Abrigo com Goteira
            </button>
          </div>
        )}

        {/* Controles de votação para o dono da sala */}
        {isOwner && !isVotingPhase && !votingFinished && (
          <div className="results-actions voting-actions">
            <h3>Iniciar Nova Votação</h3>
            <p className="player-info">Inicie uma votação para que todos possam classificar os cards</p>
            <button 
              className="start-voting-button"
              onClick={onStartVoting}
            >
              Iniciar Votação
            </button>
          </div>
        )}

        {/* Ação para nova rodada */}
        {isOwner && votingFinished && (
          <div className="results-actions">
            <div className="voting-control-buttons">
              <button 
                className="restart-voting-button"
                onClick={onRestartVoting}
              >
                Reiniciar Votação
              </button>
              <button 
                className="new-round-button-large"
                onClick={onNewRound}
              >
                Nova Rodada
              </button>
            </div>
            <p className="action-hint">Reinicie a votação ou inicie uma nova sessão</p>
          </div>
        )}
      </div>
    );
  };

  const renderVotingInterface = () => {
    // Converter allCards para array de cards
    const cardsArray = [];
    Object.keys(allCards).forEach(ownerId => {
      const ownerCards = allCards[ownerId] || {};
      Object.keys(ownerCards).forEach(cardId => {
        const card = ownerCards[cardId];
        cardsArray.push({
          id: cardId,
          text: card.text || card.content || '',
          owner: ownerId,
          ...card
        });
      });
    });

    return (
      <div className="results-content">
        <h2>🗳️ Votação em Andamento</h2>
        
        {/* Legenda da votação */}
        <div className="voting-legend">
          <h3>Como votar nos cards:</h3>
          <div className="vote-options-legend">
            <div className="legend-item raft">
              <span className="legend-icon">💎</span>
              <span className="legend-text">Tesouros da ilha - Este card está bom como está</span>
            </div>
            <div className="legend-item island">
              <span className="legend-icon">🏠</span>
              <span className="legend-text">Abrigo com goteira - Este card precisa de reparo</span>
            </div>
            <div className="legend-item shipwreck">
              <span className="legend-icon">🌊</span>
              <span className="legend-text">Devolver pro mar - Este card não é prioritário agora</span>
            </div>
          </div>
        </div>

        {/* Ações para o dono da sala */}
        {isOwner && (
          <div className="results-actions voting-actions">
            <h3>Controles da Votação</h3>
            <p className="player-info">Você pode finalizar ou reiniciar a votação</p>
            <div className="voting-control-buttons">
              <button 
                className="finish-voting-button"
                onClick={onFinishVoting}
              >
                Finalizar Votação
              </button>
              <button 
                className="restart-voting-button"
                onClick={onRestartVoting}
              >
                Reiniciar Votação
              </button>
            </div>
          </div>
        )}

        {/* Status dos jogadores */}
        {renderPlayersStatus()}

        {/* Cards para votação */}
        {cardsArray.length === 0 ? (
          <div className="no-cards">
            <p>Nenhum card encontrado para votação.</p>
            <p>Adicione cards aos baús antes de iniciar a votação.</p>
          </div>
        ) : (
          <div className="anonymous-cards">
            <h3>Vote em cada card ({cardsArray.length} cards total)</h3>
            <div className="cards-grid">
              {cardsArray.map(card => {
                const userVote = userVotes[card.id];
                const votes = cardVotes[card.id] || {};
                
                return (
                  <div key={card.id} className="anonymous-card">
                    <p className="card-text">{card.text}</p>
                    
                    {/* Botões de votação */}
                    <div className="voting-buttons">
                      <button
                        className={`vote-btn raft ${userVote === 'manter' ? 'voted' : ''}`}
                        onClick={() => onVote(card.id, 'manter')}
                        title="Tesouros da ilha - Este card está bom como está"
                      >
                        💎
                      </button>
                      <button
                        className={`vote-btn island ${userVote === 'melhorar' ? 'voted' : ''}`}
                        onClick={() => onVote(card.id, 'melhorar')}
                        title="Abrigo com goteira - Este card precisa de reparo"
                      >
                        🏠
                      </button>
                      <button
                        className={`vote-btn shipwreck ${userVote === 'deixarNaIlha' ? 'voted' : ''}`}
                        onClick={() => onVote(card.id, 'deixarNaIlha')}
                        title="Devolver pro mar - Este card não é prioritário agora"
                      >
                        🌊
                      </button>
                    </div>

                    {/* Indicador do voto do usuário */}
                    {userVote && (
                      <div className="user-vote-indicator">
                        Seu voto: {
                          userVote === 'manter' ? '💎 Tesouros da ilha' :
                          userVote === 'melhorar' ? '🏠 Abrigo com goteira' :
                          '🌊 Devolver pro mar'
                        }
                      </div>
                    )}

                    {/* Contagem de votos - apenas para o dono ou quando votação finalizada */}
                    {(isOwner || votingFinished) && (
                      <div className="vote-results">
                        <span className="vote-count raft">💎 {votes.manter || 0}</span>
                        <span className="vote-count island">🏠 {votes.melhorar || 0}</span>
                        <span className="vote-count shipwreck">🌊 {votes.deixarNaIlha || 0}</span>
                      </div>
                    )}

                    {/* Indicador de voto secreto para participantes */}
                    {!isOwner && !votingFinished && (
                      <div className="secret-voting-indicator">
                        <span>🤫 Votação secreta em andamento</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Informações para participantes */}
        {!isOwner && (
          <div className="results-info voting-info">
            <p className="player-info">
              O dono da sala controlará quando finalizar a votação
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderIslandVoting = () => {
    // Pegar os cards que foram categorizados como "melhorar" (ao invés de "deixarNaIlha")
    const islandCards = categories.melhorar;
    const currentUserVotes = Object.keys(islandUserVotes).filter(id => islandUserVotes[id]);
    
    return (
      <div className="island-voting-content">
        <h2>🔧 Votação dos Cards a Melhorar</h2>
        <div className="voting-info">
          <p>Vote nos cards que você considera mais importantes para serem trabalhados.</p>
          <p>Você tem <strong>{voteLimit - currentUserVotes.length} votos restantes</strong> de {voteLimit}.</p>
          {!isOwner && islandVotingPhase && (
            <div className="secret-vote-notice">
              🔒 <strong>Votação secreta:</strong> Os votos serão revelados apenas no final
            </div>
          )}
        </div>

        <div className="island-cards-grid">
          {islandCards.map(card => (
            <div 
              key={card.id} 
              className={`island-card ${islandUserVotes[card.id] ? 'voted' : ''}`}
            >
              <p className="card-text">{card.text}</p>
              <div className="card-actions">
                {/* Contagem de votos - apenas para o dono ou quando votação finalizada */}
                {(isOwner || !islandVotingPhase) && (
                  <span className="vote-count">
                    {islandVoteCounts[card.id] || 0} votos
                  </span>
                )}

                {/* Indicador de voto secreto para participantes durante votação */}
                {!isOwner && islandVotingPhase && (
                  <span className="secret-vote-indicator">
                    🔒 Votos secretos
                  </span>
                )}

                <button
                  className={`vote-btn ${islandUserVotes[card.id] ? 'voted' : ''}`}
                  onClick={() => handleVoteIslandCard(card.id)}
                  // disabled={islandUserVotes[card.id] || currentUserVotes.length >= voteLimit}
                >
                  {islandUserVotes[card.id] ? '✓ Votado' : 'Votar'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Status dos jogadores para o dono da sala */}
        {renderIslandPlayersStatus()}

        {isOwner && (
          <div className="phase-controls">
            <button 
              className="btn btn-success"
              onClick={handleFinishIslandVoting}
            >
              Finalizar Votação dos Cards a Melhorar
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderPlanning = () => {
    // Pegar os cards que foram categorizados como "melhorar"
    const islandCards = categories.melhorar;
    
    // Cards que receberam mais votos na votação dos cards a melhorar
    const topIslandCards = islandCards
      .map(card => ({
        ...card,
        voteCount: islandVoteCounts[card.id] || 0
      }))
      .filter(card => card.voteCount > 0) // Filtrar apenas cards com pelo menos 1 voto
      .sort((a, b) => b.voteCount - a.voteCount)
      .slice(0, Math.min(3, islandCards.length)); // Top 3 ou menos

    return (
      <div className="planning-content">
        <h2>📋 Planejamento</h2>
        <p>Agora vamos planejar as ações para os cards mais votados:</p>

        {topIslandCards.length === 0 ? (
          <div className="no-voted-cards">
            <p>🤔 Nenhum card recebeu votos na votação dos cards a melhorar.</p>
            <p>Não há planos de ação para criar nesta sessão.</p>
          </div>
        ) : (
          <div className="planning-cards">
            {topIslandCards.map((card, index) => (
            <div key={card.id} className="planning-card">
              <div className="card-header">
                <h3>#{index + 1} - {card.voteCount} votos</h3>
                <p className="card-text">{card.text}</p>
              </div>

              {isOwner ? (
                <div className="planning-form">
                  <div className="form-group">
                    <label>O que vamos fazer?</label>
                    <textarea
                      value={planningForms[card.id]?.action || ''}
                      onChange={(e) => handlePlanningChange(card.id, 'action', e.target.value)}
                      placeholder="Descreva a ação que será tomada..."
                    />
                  </div>

                  <div className="form-group">
                    <label>Quem será o responsável?</label>
                    <input
                      type="text"
                      value={planningForms[card.id]?.responsible || ''}
                      onChange={(e) => handlePlanningChange(card.id, 'responsible', e.target.value)}
                      placeholder="Nome do responsável..."
                    />
                  </div>

                  <div className="form-group">
                    <label>Qual é o prazo para a primeira etapa?</label>
                    <input
                      type="date"
                      value={planningForms[card.id]?.deadline || ''}
                      onChange={(e) => handlePlanningChange(card.id, 'deadline', e.target.value)}
                    />
                  </div>
                </div>
              ) : (
                <div className="planning-view">
                  {planningForms[card.id] ? (
                    <>
                      <div className="plan-item">
                        <strong>O que vamos fazer:</strong>
                        <p>{planningForms[card.id].action || 'Aguardando preenchimento...'}</p>
                      </div>
                      <div className="plan-item">
                        <strong>Responsável:</strong>
                        <p>{planningForms[card.id].responsible || 'Aguardando preenchimento...'}</p>
                      </div>
                      <div className="plan-item">
                        <strong>Prazo:</strong>
                        <p>{planningForms[card.id].deadline || 'Aguardando preenchimento...'}</p>
                      </div>
                    </>
                  ) : (
                    <p>O dono da sala está preenchendo as informações de planejamento...</p>
                  )}
                </div>
              )}
            </div>
          ))}
          </div>
        )}

        {isOwner && topIslandCards.length > 0 && (
          <div className="planning-actions">
            <button 
              className="btn btn-success"
              onClick={finalizePlanning}
            >
              Finalizar Planejamento
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderSummary = () => {
    // Pegar os cards que foram categorizados como "melhorar"
    const islandCards = categories.melhorar;
    
    // Cards que receberam mais votos na votação dos cards a melhorar
    const topIslandCards = islandCards
      .map(card => ({
        ...card,
        voteCount: islandVoteCounts[card.id] || 0
      }))
      .filter(card => card.voteCount > 0) // Filtrar apenas cards com pelo menos 1 voto
      .sort((a, b) => b.voteCount - a.voteCount)
      .slice(0, Math.min(3, islandCards.length)); // Top 3 ou menos

    return (
      <div className="summary-content">
        <h2>📋 Resumo da Sessão</h2>
        <p>Aqui está o resumo completo da sua retrospectiva:</p>

        {topIslandCards.length === 0 ? (
          <div className="no-voted-cards">
            <p>🤔 Nenhum card recebeu votos na votação dos cards a melhorar.</p>
            <p>Esta retrospectiva não gerou planos de ação específicos.</p>
          </div>
        ) : (
          <>
            {/* Resumo dos Planos de Ação - MOVIDO PARA O TOPO */}
            <div className="action-plans-summary-card">
              <h3>🎯 Resumo dos Planos de Ação</h3>
              <p>Principais pontos identificados e suas ações planejadas:</p>
            
              <div className="unified-planning-card">
                {/* Resumo Inteligente - MOVIDO PARA O TOPO */}
                <div className="ai-summary-section">
                  <div className="ai-header">
                    <h4>🤖 Resumo Inteligente</h4>
                    {isOwner && !sessionSummary?.aiSummary?.content && !sessionSummary?.aiSummary?.isLoading && !sessionSummary?.aiSummary?.error && (
                      <button 
                        className="generate-ai-button"
                        onClick={() => generateSharedAISummary(topIslandCards, planningForms)}
                      >
                        🤖 Gerar Resumo ChatGPT
                      </button>
                    )}
                  </div>
                  
                  <div className="ai-summary-content">
                    {sessionSummary?.aiSummary?.isLoading && (
                      <div className="ai-loading">
                        <div className="loading-spinner"></div>
                        <p>Gerando resumo inteligente...</p>
                      </div>
                    )}
                    
                    {sessionSummary?.aiSummary?.error && (
                      <div className="ai-error">
                        <p>❌ {sessionSummary.aiSummary.error}</p>
                        {isOwner && (
                          <button 
                            className="retry-button"
                            onClick={() => generateSharedAISummary(topIslandCards, planningForms)}
                          >
                            Tentar Novamente
                          </button>
                        )}
                      </div>
                    )}
                    
                    {sessionSummary?.aiSummary?.content && (
                      <div className="ai-result">
                        <p>{sessionSummary.aiSummary.content}</p>
                        {isOwner && (
                          <button 
                            className="regenerate-button"
                            onClick={() => generateSharedAISummary(topIslandCards, planningForms)}
                            disabled={sessionSummary?.aiSummary?.isLoading}
                          >
                            🔄 Gerar Novo Resumo
                          </button>
                        )}
                      </div>
                    )}
                    
                    {!sessionSummary?.aiSummary?.content && !sessionSummary?.aiSummary?.isLoading && !sessionSummary?.aiSummary?.error && (
                      <div className="ai-summary-placeholder">
                        <p>
                          {isOwner 
                            ? 'Clique no botão acima para gerar um resumo inteligente dos seus planos de ação usando ChatGPT.'
                            : 'Aguardando o dono da sala gerar o resumo inteligente...'
                          }
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Detalhamento dos planos */}
                <div className="planning-items-list">
                  {topIslandCards.map((card, index) => (
                    <div key={card.id} className="planning-item-summary">
                      <div className="item-header">
                        <span className="item-number">#{index + 1}</span>
                        <span className="item-votes">{card.voteCount} votos</span>
                      </div>
                      <div className="item-content">
                        <p className="item-text"><strong>Questão:</strong> {card.text}</p>
                        {planningForms[card.id] ? (
                          <div className="item-plan">
                            <p><strong>Ação:</strong> {planningForms[card.id].action || 'Não definido'}</p>
                            <p><strong>Responsável:</strong> {planningForms[card.id].responsible || 'Não definido'}</p>
                            <p><strong>Prazo:</strong> {planningForms[card.id].deadline || 'Não definido'}</p>
                          </div>
                        ) : (
                          <p className="no-plan">Plano não foi definido para este item.</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Resumo das categorias */}
        <div className="categories-summary">
          <h3>Classificação dos Cards</h3>
          
          {Object.entries(categories).map(([category, cards]) => (
            cards.length > 0 && (
              <div key={category} className={`category-section ${category}`}>
                <h4>
                  {category === 'manter' && '💎 Tesouros da ilha'}
                  {category === 'melhorar' && '🏠 Abrigo com goteira'}
                  {category === 'deixarNaIlha' && '🌊 Devolver pro mar'}
                  <span className="card-count">({cards.length} cards)</span>
                </h4>
                
                <div className="cards-grid">
                  {cards.map(card => (
                    <div key={card.id} className="result-card">
                      <p className="card-text">{card.text}</p>
                      <div className="vote-summary">
                        <span className="vote-item manter">Tesouro: {card.voteCount.manter}</span>
                        <span className="vote-item melhorar">Abrigo: {card.voteCount.melhorar}</span>
                        <span className="vote-item deixar">Mar: {card.voteCount.deixarNaIlha}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>

        <div className="summary-actions">
          <button 
            className="new-round-button-large"
            onClick={onNewRound}
          >
            Nova Retrospectiva
          </button>
          <p className="action-hint">Obrigado por usar a Ilha dos Projetos Perdidos!</p>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (currentPhase) {
      case 'summary':
        return renderSummary();
      case 'island-voting':
        return renderIslandVoting();
      case 'planning':
        return renderPlanning();
      default:
        return renderResults();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="results-modal-overlay" onClick={onClose}>
      <div className="results-modal" onClick={(e) => e.stopPropagation()}>
        <div className="results-header">
          <h1>
            {currentPhase === 'summary' && '📋 Resumo da Sessão'}
            {currentPhase === 'island-voting' && '🔧 Votação dos Cards a Melhorar'}
            {currentPhase === 'planning' && '📋 Planejamento'}
            {currentPhase === 'results' && '📊 Resultados'}
          </h1>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="results-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default ResultsModal;
