import React, { useState, useEffect } from 'react';
import './ResultsModal.css';
import { generateActionPlanSummary, isOpenAIConfigured } from '../services/deepaiService';

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
  gameCode,
  startIslandVoting,
  finishIslandVoting,
  voteIslandCard,
  savePlan,
  islandVotingPhase,
  islandUserVotes,
  islandVoteCounts,
  planningPhase,
  cardPlans,
  sessionSummary,
  finalizePlanning,
  otherPlayers,
  userId,
  rawVotingData,
  votingDataTimestamp
}) => {
  const [currentPhase, setCurrentPhase] = useState('results'); // 'results', 'island-voting', 'planning', 'summary'
  const [planningForms, setPlanningForms] = useState({});
  
  // Estados para resumo da IA
  const [aiSummary, setAiSummary] = useState('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiError, setAiError] = useState(null);

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

  // Limpar resumo da IA quando os planos mudarem
  useEffect(() => {
    setAiSummary('');
    setAiError(null);
  }, [planningForms, cardPlans]);

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

  // Calcular limite de votos para votação da ilha
  const calculateVoteLimit = () => {
    const islandCardCount = categories.deixarNaIlha.length;
    if (islandCardCount > 5) {
      return Math.ceil(islandCardCount * 0.2); // 20% dos cards
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
                    {category === 'manter' && '✅ Manter'}
                    {category === 'melhorar' && '🔧 Melhorar'}
                    {category === 'deixarNaIlha' && '🏝️ Deixar na Ilha'}
                    <span className="card-count">({cards.length} cards)</span>
                  </h3>
                  
                  <div className="cards-grid">
                    {cards.map(card => (
                      <div key={card.id} className="result-card">
                        <p className="card-text">{card.text}</p>
                        <div className="vote-summary">
                          <span className="vote-item manter">Manter: {card.voteCount.manter}</span>
                          <span className="vote-item melhorar">Melhorar: {card.voteCount.melhorar}</span>
                          <span className="vote-item deixar">Ilha: {card.voteCount.deixarNaIlha}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ))}
          </>
        )}

        {isOwner && categories.deixarNaIlha.length > 0 && (
          <div className="island-voting-info">
            <h3>Próxima Fase: Votação da Ilha</h3>
            <p>Os cards que foram para a ilha passarão por uma nova votação.</p>
            <p>Cada participante terá direito a <strong>{voteLimit} votos</strong>.</p>
            <button 
              className="btn btn-primary"
              onClick={handleStartIslandVoting}
            >
              Iniciar Votação da Ilha
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
              <span className="legend-icon">✅</span>
              <span className="legend-text">Manter - Este card está bom como está</span>
            </div>
            <div className="legend-item island">
              <span className="legend-icon">🔧</span>
              <span className="legend-text">Melhorar - Este card precisa ser melhorado</span>
            </div>
            <div className="legend-item shipwreck">
              <span className="legend-icon">🏝️</span>
              <span className="legend-text">Deixar na Ilha - Este card não é prioritário agora</span>
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
                        title="Manter - Este card está bom como está"
                      >
                        ✅
                      </button>
                      <button
                        className={`vote-btn island ${userVote === 'melhorar' ? 'voted' : ''}`}
                        onClick={() => onVote(card.id, 'melhorar')}
                        title="Melhorar - Este card precisa ser melhorado"
                      >
                        🔧
                      </button>
                      <button
                        className={`vote-btn shipwreck ${userVote === 'deixarNaIlha' ? 'voted' : ''}`}
                        onClick={() => onVote(card.id, 'deixarNaIlha')}
                        title="Deixar na Ilha - Este card não é prioritário agora"
                      >
                        🏝️
                      </button>
                    </div>

                    {/* Indicador do voto do usuário */}
                    {userVote && (
                      <div className="user-vote-indicator">
                        Seu voto: {
                          userVote === 'manter' ? '✅ Manter' :
                          userVote === 'melhorar' ? '🔧 Melhorar' :
                          '🏝️ Deixar na Ilha'
                        }
                      </div>
                    )}

                    {/* Contagem de votos - apenas para o dono ou quando votação finalizada */}
                    {(isOwner || votingFinished) && (
                      <div className="vote-results">
                        <span className="vote-count raft">✅ {votes.manter || 0}</span>
                        <span className="vote-count island">🔧 {votes.melhorar || 0}</span>
                        <span className="vote-count shipwreck">🏝️ {votes.deixarNaIlha || 0}</span>
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
    // Pegar os cards que foram categorizados como "deixarNaIlha"
    const islandCards = categories.deixarNaIlha;
    const currentUserVotes = Object.keys(islandUserVotes).filter(id => islandUserVotes[id]);
    
    return (
      <div className="island-voting-content">
        <h2>🏝️ Votação da Ilha</h2>
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

        {isOwner && (
          <div className="phase-controls">
            <button 
              className="btn btn-success"
              onClick={handleFinishIslandVoting}
            >
              Finalizar Votação da Ilha
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderPlanning = () => {
    // Pegar os cards que foram categorizados como "deixarNaIlha"
    const islandCards = categories.deixarNaIlha;
    
    // Cards que receberam mais votos na votação da ilha
    const topIslandCards = islandCards
      .map(card => ({
        ...card,
        voteCount: islandVoteCounts[card.id] || 0
      }))
      .sort((a, b) => b.voteCount - a.voteCount)
      .slice(0, Math.min(3, islandCards.length)); // Top 3 ou menos

    return (
      <div className="planning-content">
        <h2>📋 Planejamento</h2>
        <p>Agora vamos planejar as ações para os cards mais votados:</p>

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

        {isOwner && (
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

  // Função para gerar resumo da IA
  const generateAISummary = async (topCards) => {
    if (!isOpenAIConfigured()) {
      setAiError('API key do DeepAI não configurada. Verifique o arquivo .env');
      return;
    }

    setIsLoadingAI(true);
    setAiError(null);

    try {
      // Preparar dados dos planos para a IA
      const plansData = topCards.map(card => ({
        text: card.text,
        voteCount: card.voteCount,
        action: planningForms[card.id]?.action || null,
        responsible: planningForms[card.id]?.responsible || null,
        deadline: planningForms[card.id]?.deadline || null
      }));

      const summary = await generateActionPlanSummary(plansData);
      setAiSummary(summary);
    } catch (error) {
      setAiError(error.message);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const renderSummary = () => {
    // Pegar os cards que foram categorizados como "deixarNaIlha"
    const islandCards = categories.deixarNaIlha;
    
    // Cards que receberam mais votos na votação da ilha
    const topIslandCards = islandCards
      .map(card => ({
        ...card,
        voteCount: islandVoteCounts[card.id] || 0
      }))
      .sort((a, b) => b.voteCount - a.voteCount)
      .slice(0, Math.min(3, islandCards.length)); // Top 3 ou menos

    return (
      <div className="summary-content">
        <h2>📋 Resumo da Sessão</h2>
        <p>Aqui está o resumo completo da sua retrospectiva:</p>

        {/* Resumo dos Planos de Ação - MOVIDO PARA O TOPO */}
        {topIslandCards.length > 0 && (
          <div className="action-plans-summary-card">
            <h3>🎯 Resumo dos Planos de Ação</h3>
            <p>Principais pontos identificados e suas ações planejadas:</p>
            
            <div className="unified-planning-card">
              {/* Resumo Inteligente - MOVIDO PARA O TOPO */}
              <div className="ai-summary-section">
                <div className="ai-header">
                  <h4>🤖 Resumo Inteligente</h4>
                  {!aiSummary && !isLoadingAI && !aiError && (
                    <button 
                      className="generate-ai-button"
                      onClick={() => generateAISummary(topIslandCards)}
                      disabled={!isOpenAIConfigured()}
                    >
                      {!isOpenAIConfigured() ? 'Configurar API' : 'Gerar Resumo IA'}
                    </button>
                  )}
                </div>
                
                <div className="ai-summary-content">
                  {isLoadingAI && (
                    <div className="ai-loading">
                      <div className="loading-spinner"></div>
                      <p>Gerando resumo inteligente...</p>
                    </div>
                  )}
                  
                  {aiError && (
                    <div className="ai-error">
                      <p>❌ {aiError}</p>
                      <button 
                        className="retry-button"
                        onClick={() => generateAISummary(topIslandCards)}
                      >
                        Tentar Novamente
                      </button>
                    </div>
                  )}
                  
                  {aiSummary && (
                    <div className="ai-result">
                      <p>{aiSummary}</p>
                      <button 
                        className="regenerate-button"
                        onClick={() => generateAISummary(topIslandCards)}
                        disabled={isLoadingAI}
                      >
                        🔄 Gerar Novo Resumo
                      </button>
                    </div>
                  )}
                  
                  {!aiSummary && !isLoadingAI && !aiError && (
                    <div className="ai-summary-placeholder">
                      <p>
                        {!isOpenAIConfigured() 
                          ? 'Configure sua API key do DeepAI no arquivo .env para gerar resumos inteligentes. 500 resumos gratuitos por dia!'
                          : 'Clique no botão acima para gerar um resumo inteligente dos seus planos de ação. API gratuita com 500 chamadas/dia.'
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
        )}

        {/* Resumo das categorias */}
        <div className="categories-summary">
          <h3>Classificação dos Cards</h3>
          
          {Object.entries(categories).map(([category, cards]) => (
            cards.length > 0 && (
              <div key={category} className={`category-section ${category}`}>
                <h4>
                  {category === 'manter' && '✅ Manter'}
                  {category === 'melhorar' && '🔧 Melhorar'}
                  {category === 'deixarNaIlha' && '🏝️ Deixar na Ilha'}
                  <span className="card-count">({cards.length} cards)</span>
                </h4>
                
                <div className="cards-grid">
                  {cards.map(card => (
                    <div key={card.id} className="result-card">
                      <p className="card-text">{card.text}</p>
                      <div className="vote-summary">
                        <span className="vote-item manter">Manter: {card.voteCount.manter}</span>
                        <span className="vote-item melhorar">Melhorar: {card.voteCount.melhorar}</span>
                        <span className="vote-item deixar">Ilha: {card.voteCount.deixarNaIlha}</span>
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
            {currentPhase === 'island-voting' && '🏝️ Votação da Ilha'}
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
