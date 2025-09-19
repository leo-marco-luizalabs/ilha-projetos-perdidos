import React, { useState, useEffect } from 'react';
import './TimerModal.css';

function TimerModal({ isOpen, onClose, onStartTimer }) {
  const [selectedMinutes, setSelectedMinutes] = useState(5);
  const [customMinutes, setCustomMinutes] = useState('');
  const [useCustom, setUseCustom] = useState(false);

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

  if (!isOpen) return null;

  const presetTimes = [1, 3, 5, 10, 15, 30];

  const handleStartTimer = () => {
    const minutes = useCustom ? parseInt(customMinutes) : selectedMinutes;
    
    if (!minutes || minutes < 1 || minutes > 180) {
      alert('⚠️ Por favor, escolha um tempo entre 1 e 180 minutos');
      return;
    }
    
    onStartTimer(minutes);
  };

  return (
    <div className="timer-modal-overlay" onClick={onClose}>
      <div className="timer-modal" onClick={(e) => e.stopPropagation()}>
        <div className="timer-header">
          <h2>⏰ Configurar Timer da Sala</h2>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="timer-content">
          <p className="timer-description">
            Defina por quanto tempo os jogadores poderão adicionar cards aos seus baús.
            Quando o tempo acabar, ninguém poderá mais adicionar novos cards.
          </p>

          <div className="time-selection">
            <h3>Escolha o tempo:</h3>
            
            {/* Tempos pré-definidos */}
            <div className="preset-times">
              {presetTimes.map((minutes) => (
                <button
                  key={minutes}
                  className={`preset-button ${!useCustom && selectedMinutes === minutes ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedMinutes(minutes);
                    setUseCustom(false);
                  }}
                >
                  {minutes} min
                </button>
              ))}
            </div>

            {/* Tempo customizado */}
            <div className="custom-time">
              <label className="custom-checkbox">
                <input
                  type="checkbox"
                  checked={useCustom}
                  onChange={(e) => setUseCustom(e.target.checked)}
                />
                <span>Tempo personalizado:</span>
              </label>
              
              {useCustom && (
                <div className="custom-input-group">
                  <input
                    type="number"
                    value={customMinutes}
                    onChange={(e) => setCustomMinutes(e.target.value)}
                    placeholder="Ex: 20"
                    min="1"
                    max="180"
                    className="custom-input"
                  />
                  <span>minutos</span>
                </div>
              )}
            </div>
          </div>

          <div className="timer-actions">
            <button className="cancel-button" onClick={onClose}>
              Cancelar
            </button>
            <button className="start-button" onClick={handleStartTimer}>
              🚀 Iniciar Timer
            </button>
          </div>

          <div className="timer-info">
            <p>💡 <strong>Dica:</strong> Você poderá parar o timer a qualquer momento durante a sessão.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TimerModal;
