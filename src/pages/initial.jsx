import React, { useState } from 'react';
import './Initial.css';

function Initial({ onJoinRoom, onCreateRoom }) {
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [selectedCharacterIndex, setSelectedCharacterIndex] = useState(0); // Índice do personagem selecionado
  const [activeTab, setActiveTab] = useState('join'); // 'join' ou 'create'

  // Personagens disponíveis para seleção
  const availableCharacters = [
    { 
      id: 'knight', 
      name: 'Cavaleiro',
      frontImage: '/ilha-projetos-perdidos/assets/characters/persona-1-front.png',
      backImage: '/ilha-projetos-perdidos/assets/characters/persona-1-back.png',
      color: 'transparent'
    },
    { 
      id: 'wizard', 
      name: 'Mago',
      frontImage: '/ilha-projetos-perdidos/assets/characters/persona-2-front.png',
      backImage: '/ilha-projetos-perdidos/assets/characters/persona-2-back.png',
      color: 'transparent'
    },
    { 
    id: 'belo', 
    name: 'Belo',
    frontImage: '/ilha-projetos-perdidos/assets/characters/persona-3-front.png',
    backImage: '/ilha-projetos-perdidos/assets/characters/persona-3-back.png',
    color: 'transparent'
  },
  { 
    id: 'show', 
    name: 'Show',
    frontImage: '/ilha-projetos-perdidos/assets/characters/persona-4-front.png',
    backImage: '/ilha-projetos-perdidos/assets/characters/persona-4-back.png',
    color: 'transparent'
  },
    // { 
    //   id: 'archer', 
    //   name: 'Arqueiro',
    //   frontImage: '/src/assets/characters/archer-front.png',
    //   backImage: '/src/assets/characters/archer-back.png',
    //   color: '#22c55e'
    // },
    // { 
    //   id: 'rogue', 
    //   name: 'Ladino',
    //   frontImage: '/src/assets/characters/rogue-front.png',
    //   backImage: '/src/assets/characters/rogue-back.png',
    //   color: '#ef4444'
    // },
    // { 
    //   id: 'paladin', 
    //   name: 'Paladino',
    //   frontImage: '/src/assets/characters/paladin-front.png',
    //   backImage: '/src/assets/characters/paladin-back.png',
    //   color: '#f59e0b'
    // },
    // { 
    //   id: 'ninja', 
    //   name: 'Ninja',
    //   frontImage: '/src/assets/characters/ninja-front.png',
    //   backImage: '/src/assets/characters/ninja-back.png',
    //   color: '#1f2937'
    // }
  ];

  // Funções para navegar no carrossel
  const nextCharacter = () => {
    setSelectedCharacterIndex((prev) => (prev + 1) % availableCharacters.length);
  };

  const prevCharacter = () => {
    setSelectedCharacterIndex((prev) => (prev - 1 + availableCharacters.length) % availableCharacters.length);
  };

  // Navegação por teclado
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight') {
      nextCharacter();
    } else if (e.key === 'ArrowLeft') {
      prevCharacter();
    }
  };

  const selectedCharacter = availableCharacters[selectedCharacterIndex];

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (roomCode.trim() && playerName.trim()) {
      onJoinRoom(roomCode.trim().toUpperCase(), playerName.trim(), selectedCharacter.color);
    }
  };

  const handleCreateRoom = (e) => {
    e.preventDefault();
    if (playerName.trim()) {
      // Gerar código da sala (6 caracteres aleatórios)
      const newRoomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      onCreateRoom(newRoomCode, playerName.trim(), selectedCharacter.color);
    }
  };

  return (
    <div className="initial-container">
      <div className="initial-card">
        <h1 className="title">🏝️ Ilha dos Projetos Perdidos</h1>
        <p className="subtitle">Conecte-se com outros exploradores!</p>

        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'join' ? 'active' : ''}`}
            onClick={() => setActiveTab('join')}
          >
            Entrar em Sala
          </button>
          <button 
            className={`tab ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => setActiveTab('create')}
          >
            Criar Nova Sala
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'join' ? (
            <form onSubmit={handleJoinRoom} className="form">
              {/* Seleção de Personagem - Carrossel */}
              <div className="input-group">
                <label className="label-character">Escolha seu personagem:</label>
                <div className="character-carousel" onKeyDown={handleKeyDown} tabIndex="0">
                  <button 
                    type="button" 
                    className="carousel-btn prev"
                    onClick={prevCharacter}
                    title="Personagem anterior"
                  >
                    ‹
                  </button>
                  
                  <div className="character-display">
                    <div 
                      className="player-preview large character-preview"
                    >
                      <img 
                        src={selectedCharacter.frontImage}
                        alt={`${selectedCharacter.name} - Frente`}
                        onError={(e) => {
                          // Fallback para cor sólida se a imagem não carregar
                          e.target.style.display = 'none';
                          e.target.parentElement.style.backgroundColor = selectedCharacter.color;
                        }}
                      />
                      <span className="preview-label">{selectedCharacter.name}</span>
                    </div>
                    <span className="character-name">{selectedCharacter.name}</span>
                    <div className="character-indicators">
                      {availableCharacters.map((_, index) => (
                        <div
                          key={index}
                          className={`indicator ${index === selectedCharacterIndex ? 'active' : ''}`}
                          onClick={() => setSelectedCharacterIndex(index)}
                          title={`Personagem ${availableCharacters[index].name}`}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <button 
                    type="button" 
                    className="carousel-btn next"
                    onClick={nextCharacter}
                    title="Próximo personagem"
                  >
                    ›
                  </button>
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="playerName">Seu Nome:</label>
                <input
                  type="text"
                  id="playerName"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Digite seu nome"
                  maxLength={20}
                  required
                />
              </div>
              <div className="input-group">
                <label htmlFor="roomCode">Código da Sala:</label>
                <input
                  type="text"
                  id="roomCode"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="Ex: ABC123"
                  maxLength={6}
                  style={{ textTransform: 'uppercase' }}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary">
                🚪 Entrar na Sala
              </button>
            </form>
          ) : (
            <form onSubmit={handleCreateRoom} className="form">
              {/* Seleção de Personagem - Carrossel */}
              <div className="input-group">
                <label>Escolha seu personagem:</label>
                <div className="character-carousel" onKeyDown={handleKeyDown} tabIndex="0">
                  <button 
                    type="button" 
                    className="carousel-btn prev"
                    onClick={prevCharacter}
                    title="Personagem anterior"
                  >
                    ‹
                  </button>
                  
                  <div className="character-display">
                    <div 
                      className="player-preview large character-preview"
                    >
                      <img 
                        src={selectedCharacter.frontImage}
                        alt={`${selectedCharacter.name} - Frente`}
                        onError={(e) => {
                          // Fallback para cor sólida se a imagem não carregar
                          e.target.style.display = 'none';
                          e.target.parentElement.style.backgroundColor = selectedCharacter.color;
                        }}
                      />
                      <span className="preview-label">{selectedCharacter.name}</span>
                    </div>
                    <span className="character-name">{selectedCharacter.name}</span>
                    <div className="character-indicators">
                      {availableCharacters.map((_, index) => (
                        <div
                          key={index}
                          className={`indicator ${index === selectedCharacterIndex ? 'active' : ''}`}
                          onClick={() => setSelectedCharacterIndex(index)}
                          title={`Personagem ${availableCharacters[index].name}`}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <button 
                    type="button" 
                    className="carousel-btn next"
                    onClick={nextCharacter}
                    title="Próximo personagem"
                  >
                    ›
                  </button>
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="playerNameCreate">Seu Nome:</label>
                <input
                  type="text"
                  id="playerNameCreate"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Digite seu nome"
                  maxLength={20}
                  required
                />
              </div>
              <div className="info-box">
                <p>🎯 Um código único será gerado automaticamente para sua sala!</p>
              </div>
              <button type="submit" className="btn btn-success">
                ✨ Criar Sala
              </button>
            </form>
          )}
        </div>

        <div className="footer">
          <p>Todos os direitos reservados</p>
        </div>
      </div>
    </div>
  );
}

export default Initial;
