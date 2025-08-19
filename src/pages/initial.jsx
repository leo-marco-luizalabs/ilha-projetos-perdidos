import React, { useState } from 'react';
import './Initial.css';

function Initial({ onJoinRoom, onCreateRoom }) {
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [selectedColorIndex, setSelectedColorIndex] = useState(0); // Índice da cor selecionada
  const [activeTab, setActiveTab] = useState('join'); // 'join' ou 'create'

  // Cores disponíveis para seleção
  const availableColors = [
    { color: '#3b82f6', name: 'Azul' },
    { color: '#ef4444', name: 'Vermelho' },
    { color: '#22c55e', name: 'Verde' },
    { color: '#f59e0b', name: 'Amarelo' },
    { color: '#8b5cf6', name: 'Roxo' },
    { color: '#ec4899', name: 'Rosa' },
    { color: '#06b6d4', name: 'Ciano' },
    { color: '#f97316', name: 'Laranja' },
    { color: '#84cc16', name: 'Lima' },
    { color: '#6366f1', name: 'Índigo' },
    { color: '#14b8a6', name: 'Verde-água' },
    { color: '#f43f5e', name: 'Rosa-escuro' }
  ];

  // Funções para navegar no carrossel
  const nextColor = () => {
    setSelectedColorIndex((prev) => (prev + 1) % availableColors.length);
  };

  const prevColor = () => {
    setSelectedColorIndex((prev) => (prev - 1 + availableColors.length) % availableColors.length);
  };

  // Navegação por teclado
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight') {
      nextColor();
    } else if (e.key === 'ArrowLeft') {
      prevColor();
    }
  };

  const selectedColor = availableColors[selectedColorIndex];

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (roomCode.trim() && playerName.trim()) {
      onJoinRoom(roomCode.trim().toUpperCase(), playerName.trim(), selectedColor.color);
    }
  };

  const handleCreateRoom = (e) => {
    e.preventDefault();
    if (playerName.trim()) {
      // Gerar código da sala (6 caracteres aleatórios)
      const newRoomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      onCreateRoom(newRoomCode, playerName.trim(), selectedColor.color);
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
              <h2>Entrar em uma Sala</h2>
              
              {/* Seleção de Cor - Carrossel */}
              <div className="input-group">
                <label>Escolha sua cor:</label>
                <div className="color-carousel" onKeyDown={handleKeyDown} tabIndex="0">
                  <button 
                    type="button" 
                    className="carousel-btn prev"
                    onClick={prevColor}
                    title="Cor anterior"
                  >
                    ‹
                  </button>
                  
                  <div className="color-display">
                    <div 
                      className="player-preview large"
                      style={{ backgroundColor: selectedColor.color }}
                    >
                      <span className="preview-label">Você</span>
                    </div>
                    <span className="color-name">{selectedColor.name}</span>
                    <div className="color-indicators">
                      {availableColors.map((_, index) => (
                        <div
                          key={index}
                          className={`indicator ${index === selectedColorIndex ? 'active' : ''}`}
                          onClick={() => setSelectedColorIndex(index)}
                          title={`Cor ${availableColors[index].name}`}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <button 
                    type="button" 
                    className="carousel-btn next"
                    onClick={nextColor}
                    title="Próxima cor"
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
              <h2>Criar Nova Sala</h2>
              
              {/* Seleção de Cor - Carrossel */}
              <div className="input-group">
                <label>Escolha sua cor:</label>
                <div className="color-carousel" onKeyDown={handleKeyDown} tabIndex="0">
                  <button 
                    type="button" 
                    className="carousel-btn prev"
                    onClick={prevColor}
                    title="Cor anterior"
                  >
                    ‹
                  </button>
                  
                  <div className="color-display">
                    <div 
                      className="player-preview large"
                      style={{ backgroundColor: selectedColor.color }}
                    >
                      <span className="preview-label">Você</span>
                    </div>
                    <span className="color-name">{selectedColor.name}</span>
                    <div className="color-indicators">
                      {availableColors.map((_, index) => (
                        <div
                          key={index}
                          className={`indicator ${index === selectedColorIndex ? 'active' : ''}`}
                          onClick={() => setSelectedColorIndex(index)}
                          title={`Cor ${availableColors[index].name}`}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <button 
                    type="button" 
                    className="carousel-btn next"
                    onClick={nextColor}
                    title="Próxima cor"
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
                <p>📤 Compartilhe o código com seus amigos para que eles possam entrar.</p>
              </div>
              <button type="submit" className="btn btn-success">
                ✨ Criar Sala
              </button>
            </form>
          )}
        </div>

        <div className="footer">
          <p>💡 Dica: Você pode clicar em qualquer lugar da tela para se mover!</p>
          <p>🎨 Use as setas ← → para navegar pelas cores no carrossel</p>
        </div>
      </div>
    </div>
  );
}

export default Initial;
