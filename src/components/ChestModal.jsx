import React, { useState } from 'react';
import './ChestModal.css';

function ChestModal({ isOpen, onClose, cards, onAddCard, onRemoveCard, ownerName, isOwner, canAddCards }) {
  const [newCardText, setNewCardText] = useState('');

  if (!isOpen) return null;

  const handleAddCard = (e) => {
    e.preventDefault();
    if (newCardText.trim() && canAddCards) {
      onAddCard(newCardText);
      setNewCardText('');
    } else if (!canAddCards) {
      alert('⏰ O tempo para adicionar cards não está ativo!');
    }
  };

  return (
    <div className="chest-modal-overlay" onClick={onClose}>
      <div className="chest-modal" onClick={(e) => e.stopPropagation()}>
        <div className="chest-header">
          <h2>📦 Baú de {ownerName}</h2>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="chest-content">
          {isOwner && (
            <div className="add-card-section">
              {canAddCards ? (
                <form onSubmit={handleAddCard} className="add-card-form">
                  <input
                    type="text"
                    value={newCardText}
                    onChange={(e) => setNewCardText(e.target.value)}
                    placeholder="Digite o texto do card..."
                    maxLength={200}
                    className="card-input"
                  />
                  <button type="submit" className="add-button">
                    ➕ Adicionar Card
                  </button>
                </form>
              ) : (
                <div className="time-inactive-message">
                  <p>⏰ O tempo para adicionar cards não está ativo.</p>
                  <p>Aguarde o dono da sala iniciar o timer.</p>
                </div>
              )}
            </div>
          )}

          <div className="cards-container">
            {cards.length === 0 ? (
              <p className="empty-message">
                {isOwner ? "Seu baú está vazio. Adicione alguns cards!" : "Este baú está vazio."}
              </p>
            ) : (
              cards.map((card) => (
                <div key={card.id} className="card">
                  <div className="card-text">{card.text}</div>
                  <div className="card-info">
                    <span className="card-author">Por: {card.createdBy}</span>
                    {isOwner && (
                      <button 
                        className="remove-button"
                        onClick={() => onRemoveCard(card.id)}
                        title="Remover card"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChestModal;
