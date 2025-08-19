import React, { useState } from 'react';
import './Initial.css';

function Initial({ onJoinRoom, onCreateRoom }) {
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#3b82f6'); // Azul como padrão
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

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (roomCode.trim() && playerName.trim()) {
      onJoinRoom(roomCode.trim().toUpperCase(), playerName.trim(), selectedColor);
    }
  };

  const handleCreateRoom = (e) => {
    e.preventDefault();
    if (playerName.trim()) {
      // Gerar código da sala (6 caracteres aleatórios)
      const newRoomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      onCreateRoom(newRoomCode, playerName.trim(), selectedColor);
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
              
              {/* Seleção de Cor */}
              <div className="input-group">
                <label>Escolha sua cor:</label>
                <div className="color-selector">
                  {availableColors.map((colorOption) => (
                    <button
                      key={colorOption.color}
                      type="button"
                      className={`color-option ${selectedColor === colorOption.color ? 'selected' : ''}`}
                      style={{ backgroundColor: colorOption.color }}
                      onClick={() => setSelectedColor(colorOption.color)}
                      title={colorOption.name}
                    >
                      {selectedColor === colorOption.color && '✓'}
                    </button>
                  ))}
                </div>
                <div className="color-preview">
                  <div 
                    className="player-preview"
                    style={{ backgroundColor: selectedColor }}
                  >
                    <span className="preview-label">Você</span>
                  </div>
                  <span className="preview-text">Assim você aparecerá no jogo</span>
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
              
              {/* Seleção de Cor */}
              <div className="input-group">
                <label>Escolha sua cor:</label>
                <div className="color-selector">
                  {availableColors.map((colorOption) => (
                    <button
                      key={colorOption.color}
                      type="button"
                      className={`color-option ${selectedColor === colorOption.color ? 'selected' : ''}`}
                      style={{ backgroundColor: colorOption.color }}
                      onClick={() => setSelectedColor(colorOption.color)}
                      title={colorOption.name}
                    >
                      {selectedColor === colorOption.color && '✓'}
                    </button>
                  ))}
                </div>
                <div className="color-preview">
                  <div 
                    className="player-preview"
                    style={{ backgroundColor: selectedColor }}
                  >
                    <span className="preview-label">Você</span>
                  </div>
                  <span className="preview-text">Assim você aparecerá no jogo</span>
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
        </div>
      </div>
    </div>
  );
}

export default Initial;
