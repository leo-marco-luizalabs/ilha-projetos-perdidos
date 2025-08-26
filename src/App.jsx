import React, { useState, useEffect, useRef } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import Initial from './pages/initial';
import ChestModal from './components/ChestModal';
import TimerModal from './components/TimerModal';
import ResultsModal from './components/ResultsModal';
import './App.css';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCikzvMgOhpMdZeY5aClGj0UibhLASlPEk",
  authDomain: "retrospectiva-project.firebaseapp.com",
  databaseURL: "https://retrospectiva-project-default-rtdb.firebaseio.com",
  projectId: "retrospectiva-project",
  storageBucket: "retrospectiva-project.firebasestorage.app",
  messagingSenderId: "181592480596",
  appId: "1:181592480596:web:9ab0a3a7556588d64bc6c1"
};

// Inicializar Firebase apenas uma vez
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.database();

// Personagens disponíveis
const availableCharacters = [
  { 
    id: 'knight', 
    name: 'Cavaleiro',
    frontImage: '/assets/characters/persona-1-front.png',
    backImage: '/assets/characters/persona-1-back.png',
    color: 'transparent'
  },
  { 
    id: 'wizard', 
    name: 'Mago',
    frontImage: '/assets/characters/persona-2-front.png',
    backImage: '/assets/characters/persona-2-back.png',
    color: 'transparent'
  },
  { 
    id: 'belo', 
    name: 'Belo',
    frontImage: '/assets/characters/persona-3-front.png',
    backImage: '/assets/characters/persona-3-back.png',
    color: 'transparent'
  },
  { 
    id: 'show', 
    name: 'Show',
    frontImage: '/assets/characters/persona-4-front.png',
    backImage: '/assets/characters/persona-4-back.png',
    color: 'transparent'
  },
];

function App() {
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [otherPlayers, setOtherPlayers] = useState({});
  const [currentRoom, setCurrentRoom] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [playerColor, setPlayerColor] = useState('#3b82f6');
  const [playerCharacter, setPlayerCharacter] = useState({
    id: 'knight',
    name: 'Cavaleiro',
    frontImage: '/assets/characters/knight-front.svg',
    backImage: '/assets/characters/knight-back.svg',
    color: '#3b82f6'
  });
  const [playerView, setPlayerView] = useState('front'); // 'front' ou 'back'
  const [roomCode, setRoomCode] = useState('');
  const [showChest, setShowChest] = useState(false);
  const [chestCards, setChestCards] = useState([]);
  const [selectedChestOwner, setSelectedChestOwner] = useState(null);
  const [allChestCounts, setAllChestCounts] = useState({});
  const [isRoomOwner, setIsRoomOwner] = useState(false);
  const [roomTimer, setRoomTimer] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [allCards, setAllCards] = useState({});
  const [_, setSessionState] = useState(null);
  const [isVotingPhase, setIsVotingPhase] = useState(false);
  const [cardVotes, setCardVotes] = useState({});
  const [userVotes, setUserVotes] = useState({});
  const [rawVotingData, setRawVotingData] = useState({});
  const [votingDataTimestamp, setVotingDataTimestamp] = useState(0);
  const [votingFinished, setVotingFinished] = useState(false);
  const [islandVotingPhase, setIslandVotingPhase] = useState(false);
  const [islandUserVotes, setIslandUserVotes] = useState({});
  const [islandVoteCounts, setIslandVoteCounts] = useState({});
  const [planningPhase, setPlanningPhase] = useState(false);
  const [cardPlans, setCardPlans] = useState({});
  const [sessionSummary, setSessionSummary] = useState(null);
  const playerIdRef = useRef("player_" + Math.floor(Math.random() * 10000));
  const myRefRef = useRef(null);
  const playersRefRef = useRef(null);
  const chestRefRef = useRef(null);
  const allChestsRefRef = useRef(null);
  const roomTimerRefRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const sessionRefRef = useRef(null);
  const votingRefRef = useRef(null);
  const islandVotingRefRef = useRef(null);
  const planningRefRef = useRef(null);
  const sessionSummaryRefRef = useRef(null);

  // Funções para gerenciar salas
  const handleJoinRoom = (code, name, color) => {
    // Encontrar o personagem baseado na cor
    const character = availableCharacters.find(char => char.color === color) || availableCharacters[0];
    
    setRoomCode(code);
    setPlayerName(name);
    setPlayerColor(color);
    setPlayerCharacter(character);
    setCurrentRoom(code);
    setIsRoomOwner(false); // Quem entra não é dono
  };

  const handleCreateRoom = (code, name, color) => {
    // Encontrar o personagem baseado na cor
    const character = availableCharacters.find(char => char.color === color) || availableCharacters[0];
    
    setRoomCode(code);
    setPlayerName(name);
    setPlayerColor(color);
    setPlayerCharacter(character);
    setCurrentRoom(code);
    setIsRoomOwner(true); // Quem cria é dono
  };

  const handleLeaveRoom = () => {
    // Limpar dados da sala
    if (myRefRef.current) {
      myRefRef.current.remove();
    }
    if (playersRefRef.current) {
      playersRefRef.current.off();
    }
    if (chestRefRef.current) {
      chestRefRef.current.off();
    }
    if (allChestsRefRef.current) {
      allChestsRefRef.current.off();
    }
    if (roomTimerRefRef.current) {
      roomTimerRefRef.current.off();
    }
    if (sessionRefRef.current) {
      sessionRefRef.current.off();
    }
    if (votingRefRef.current) {
      votingRefRef.current.off();
    }
    if (islandVotingRefRef.current) {
      islandVotingRefRef.current.off();
    }
    if (planningRefRef.current) {
      planningRefRef.current.off();
    }
    if (sessionSummaryRefRef.current) {
      sessionSummaryRefRef.current.off();
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    
    setCurrentRoom(null);
    setRoomCode('');
    setPlayerName('');
    setPlayerColor('#3b82f6');
    setOtherPlayers({});
    setPosition({ x: 100, y: 100 });
    setShowChest(false);
    setChestCards([]);
    setSelectedChestOwner(null);
    setAllChestCounts({});
    setIsRoomOwner(false);
    setRoomTimer(null);
    setTimeRemaining(0);
    setShowTimerModal(false);
    setShowResultsModal(false);
    setAllCards({});
    setSessionState(null);
    setIsVotingPhase(false);
    setCardVotes({});
    setUserVotes({});
    setVotingFinished(false);
  };

  // Função para copiar código da sala
  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      // Feedback visual temporário
      const button = document.querySelector('.room-code');
      // alert(código)
      if (button) {
        const originalText = button.textContent;
        button.textContent = '✅ Código da sala copiado!';
        button.style.backgroundColor = '#667eea';
        setTimeout(() => {
          button.textContent = originalText;
          button.style.backgroundColor = '';
        }, 2000);
      }
    } catch {
      // Fallback para navegadores mais antigos
      const textArea = document.createElement('textarea');
      textArea.value = roomCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      // Feedback visual
      alert(`Código copiado: ${roomCode}`);
    }
  };

  // Funções para gerenciar timer
  const startTimer = (minutes) => {
    if (!isRoomOwner || !currentRoom) return;
    
    const endTime = Date.now() + (minutes * 60 * 1000);
    const timerData = {
      endTime,
      duration: minutes,
      isActive: true,
      startedBy: playerName,
      startedAt: firebase.database.ServerValue.TIMESTAMP
    };
    
    db.ref(`rooms/${currentRoom}/timer`).set(timerData);
    setShowTimerModal(false);
  };

  const stopTimer = () => {
    if (!isRoomOwner || !currentRoom) return;
    
    db.ref(`rooms/${currentRoom}/timer`).set({
      isActive: false,
      stoppedBy: playerName,
      stoppedAt: firebase.database.ServerValue.TIMESTAMP
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isTimeActive = () => {
    return roomTimer && roomTimer.isActive && timeRemaining > 0;
  };

  const showResults = () => {
    if (!isRoomOwner || !currentRoom) return;
    
    // Marcar sessão como finalizada no Firebase para todos verem
    db.ref(`rooms/${currentRoom}/session`).set({
      showResults: true,
      finishedAt: firebase.database.ServerValue.TIMESTAMP,
      finishedBy: playerName
    });
    
    setShowResultsModal(true);
  };

  const startNewRound = () => {
    if (!isRoomOwner || !currentRoom) return;
    
    // Remover flag de sessão finalizada e dados de votação
    db.ref(`rooms/${currentRoom}/session`).remove();
    db.ref(`rooms/${currentRoom}/voting`).remove();
    db.ref(`rooms/${currentRoom}/islandVoting`).remove();
    db.ref(`rooms/${currentRoom}/planning`).remove();
    
    setShowResultsModal(false);
    setIsVotingPhase(false);
    setCardVotes({});
    setUserVotes({});
    setVotingFinished(false);
    setIslandVotingPhase(false);
    setIslandUserVotes({});
    setIslandVoteCounts({});
    setPlanningPhase(false);
    setCardPlans({});
    setShowTimerModal(true);
  };

  // Funções para gerenciar votação da ilha
  const startIslandVoting = () => {
    if (!isRoomOwner || !currentRoom) return;
    
    db.ref(`rooms/${currentRoom}/islandVoting`).set({
      isActive: true,
      startedAt: firebase.database.ServerValue.TIMESTAMP,
      startedBy: playerName,
      votes: {}
    });
  };

  const finishIslandVoting = () => {
    if (!isRoomOwner || !currentRoom) return;
    
    db.ref(`rooms/${currentRoom}/islandVoting/isActive`).set(false);
    db.ref(`rooms/${currentRoom}/planning`).set({
      isActive: true,
      startedAt: firebase.database.ServerValue.TIMESTAMP,
      startedBy: playerName,
      plans: {}
    });
  };

  const voteIslandCard = (cardId) => {
    if (!currentRoom || !playerName || !islandVotingPhase) return;
    
    const voteRef = db.ref(`rooms/${currentRoom}/islandVoting/votes/${cardId}/${playerIdRef.current}`);
    
    // Verificar se já votou neste card
    if (islandUserVotes[cardId]) {
      // Remover voto
      voteRef.remove();
      setIslandUserVotes(prev => {
        const newVotes = { ...prev };
        delete newVotes[cardId];
        return newVotes;
      });
    } else {
      // Adicionar voto
      voteRef.set({
        playerName: playerName,
        votedAt: firebase.database.ServerValue.TIMESTAMP
      });
      setIslandUserVotes(prev => ({
        ...prev,
        [cardId]: true
      }));
    }
  };

  const savePlan = (cardId, field, value) => {
    if (!currentRoom || !planningPhase) return;
    
    db.ref(`rooms/${currentRoom}/planning/plans/${cardId}/${field}`).set(value);
    
    setCardPlans(prev => ({
      ...prev,
      [cardId]: {
        ...prev[cardId],
        [field]: value
      }
    }));
  };

  const finalizePlanning = () => {
    if (!isRoomOwner || !currentRoom) return;
    
    // Criar resumo da sessão
    db.ref(`rooms/${currentRoom}/sessionSummary`).set({
      finalized: true,
      finalizedAt: firebase.database.ServerValue.TIMESTAMP,
      finalizedBy: playerName,
      gameCode: roomCode
    });
  };

  // Funções para gerenciar votação
  const startVoting = () => {
    if (!isRoomOwner || !currentRoom) return;
    
    db.ref(`rooms/${currentRoom}/voting`).set({
      isActive: true,
      startedAt: firebase.database.ServerValue.TIMESTAMP,
      startedBy: playerName,
      votes: {}
    });
  };

  const finishVoting = () => {
    if (!isRoomOwner || !currentRoom) return;
    
    db.ref(`rooms/${currentRoom}/voting`).update({
      isActive: false,
      finished: true,
      finishedAt: firebase.database.ServerValue.TIMESTAMP
    });
  };

  const restartVoting = () => {
    if (!isRoomOwner || !currentRoom) return;
    
    // Confirmar com o dono antes de reiniciar
    if (confirm('Tem certeza que deseja reiniciar a votação? Todos os votos serão perdidos.')) {
      db.ref(`rooms/${currentRoom}/voting`).set({
        isActive: true,
        startedAt: firebase.database.ServerValue.TIMESTAMP,
        startedBy: playerName,
        votes: {},
        restarted: true,
        restartedAt: firebase.database.ServerValue.TIMESTAMP
      });
    }
  };

  const voteOnCard = (cardId, voteType) => {
    if (!currentRoom || !playerName || !isVotingPhase || votingFinished) return;
    
    // Atualizar voto local do usuário
    setUserVotes(prev => ({
      ...prev,
      [cardId]: voteType
    }));
    
    const voteRef = db.ref(`rooms/${currentRoom}/voting/votes/${cardId}/${voteType}/${playerIdRef.current}`);
    
    // Primeiro, remover voto anterior deste jogador neste card
    const cardVotesRef = db.ref(`rooms/${currentRoom}/voting/votes/${cardId}`);
    cardVotesRef.once('value', (snapshot) => {
      const cardVotes = snapshot.val() || {};
      
      // Remover voto anterior
      ['manter', 'melhorar', 'deixarNaIlha'].forEach(type => {
        if (cardVotes[type] && cardVotes[type][playerIdRef.current]) {
          db.ref(`rooms/${currentRoom}/voting/votes/${cardId}/${type}/${playerIdRef.current}`).remove();
        }
      });
      
      // Adicionar novo voto
      voteRef.set({
        playerName: playerName,
        votedAt: firebase.database.ServerValue.TIMESTAMP
      });
    });
  };

  // Funções para gerenciar baús
  const openChest = (ownerId) => {
    setSelectedChestOwner(ownerId);
    setShowChest(true);
    
    // Configurar referência para o baú específico
    chestRefRef.current = db.ref(`rooms/${currentRoom}/chests/${ownerId}`);
    
    // Escutar mudanças nos cards do baú
    chestRefRef.current.on('value', (snapshot) => {
      const cards = snapshot.val() || [];
      setChestCards(Array.isArray(cards) ? cards : Object.values(cards));
    });
  };

  const closeChest = () => {
    setShowChest(false);
    setSelectedChestOwner(null);
    if (chestRefRef.current) {
      chestRefRef.current.off();
      chestRefRef.current = null;
    }
  };

  const addCard = (text) => {
    if (!selectedChestOwner || !text.trim()) return;
    
    // Verificar se o tempo está ativo antes de permitir adicionar cards
    if (!isTimeActive()) {
      alert('⏰ O tempo para adicionar cards não está ativo ou já acabou!');
      return;
    }
    
    const newCard = {
      id: Date.now(),
      text: text.trim(),
      createdAt: firebase.database.ServerValue.TIMESTAMP,
      createdBy: playerName
    };

    const chestRef = db.ref(`rooms/${currentRoom}/chests/${selectedChestOwner}`);
    chestRef.push(newCard);
  };

  const removeCard = (cardId) => {
    if (!selectedChestOwner) return;
    
    // Encontrar a chave do Firebase do card
    const chestRef = db.ref(`rooms/${currentRoom}/chests/${selectedChestOwner}`);
    chestRef.once('value', (snapshot) => {
      const cards = snapshot.val() || {};
      
      // Encontrar a chave do card com o ID específico
      for (let key in cards) {
        if (cards[key].id === cardId) {
          db.ref(`rooms/${currentRoom}/chests/${selectedChestOwner}/${key}`).remove();
          break;
        }
      }
    });
  };

  const handlePlayerClick = (e, playerId) => {
    e.stopPropagation(); // Evitar que o clique se propague para o container
    
    // Apenas o próprio jogador pode abrir seu baú
    if (playerId === playerIdRef.current) {
      openChest(playerId);
    }
  };

  useEffect(() => {
    // Só conectar se estiver em uma sala
    if (!currentRoom || !playerName) return;

    const playerId = playerIdRef.current;
    // Usar o código da sala como namespace
    myRefRef.current = db.ref(`rooms/${currentRoom}/players/${playerId}`);
    playersRefRef.current = db.ref(`rooms/${currentRoom}/players`);
    
    // Escutar contagens de todos os baús
    allChestsRefRef.current = db.ref(`rooms/${currentRoom}/chests`);
    allChestsRefRef.current.on('value', (snapshot) => {
      const allChests = snapshot.val() || {};
      const counts = {};
      
      for (let ownerId in allChests) {
        const chestData = allChests[ownerId];
        counts[ownerId] = Object.keys(chestData || {}).length;
      }
      
      setAllChestCounts(counts);
      
      // Também armazenar todos os cards para possível visualização
      setAllCards(allChests);
    });

    // Escutar timer da sala
    roomTimerRefRef.current = db.ref(`rooms/${currentRoom}/timer`);
    roomTimerRefRef.current.on('value', (snapshot) => {
      const timer = snapshot.val();
      setRoomTimer(timer);
      
      if (timer && timer.isActive && timer.endTime) {
        // Calcular tempo restante
        const updateTimeRemaining = () => {
          const now = Date.now();
          const remaining = Math.max(0, Math.floor((timer.endTime - now) / 1000));
          setTimeRemaining(remaining);
          
          if (remaining === 0 && timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
          }
        };
        
        updateTimeRemaining();
        
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
        }
        
        timerIntervalRef.current = setInterval(updateTimeRemaining, 1000);
      } else {
        setTimeRemaining(0);
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }
      }
    });

    // Escutar estado da sessão (para mostrar resultados para todos)
    sessionRefRef.current = db.ref(`rooms/${currentRoom}/session`);
    sessionRefRef.current.on('value', (snapshot) => {
      const session = snapshot.val();
      setSessionState(session);
      
      if (session && session.showResults) {
        setShowResultsModal(true);
      } else {
        // Se não for o dono e a sessão não está mostrando resultados, fechar modal
        if (!isRoomOwner) {
          setShowResultsModal(false);
        }
      }
    });

    // Escutar estado da votação
    votingRefRef.current = db.ref(`rooms/${currentRoom}/voting`);
    votingRefRef.current.on('value', (snapshot) => {
      const voting = snapshot.val();
      
      if (voting) {
        setIsVotingPhase(voting.isActive || false);
        setVotingFinished(voting.finished || false);
        
        // Processar votos totais
        if (voting.votes) {
          // Armazenar dados raw para análise dos jogadores
          // Força atualização criando novo objeto para trigger re-render
          setRawVotingData({ ...voting.votes });
          setVotingDataTimestamp(Date.now());
          
          const processedVotes = {};
          
          Object.keys(voting.votes).forEach(cardId => {
            const cardVotes = voting.votes[cardId];
            processedVotes[cardId] = {
              manter: Object.keys(cardVotes.manter || {}).length,
              melhorar: Object.keys(cardVotes.melhorar || {}).length,
              deixarNaIlha: Object.keys(cardVotes.deixarNaIlha || {}).length
            };
          });
          
          setCardVotes(processedVotes);
          
          // Processar votos do usuário atual
          const currentUserVotes = {};
          Object.keys(voting.votes).forEach(cardId => {
            const cardVotes = voting.votes[cardId];
            ['manter', 'melhorar', 'deixarNaIlha'].forEach(type => {
              if (cardVotes[type] && cardVotes[type][playerIdRef.current]) {
                currentUserVotes[cardId] = type;
              }
            });
          });
          
          setUserVotes(currentUserVotes);
        }
      } else {
        setIsVotingPhase(false);
        setVotingFinished(false);
        setCardVotes({});
        setUserVotes({});
        setRawVotingData({});
        setVotingDataTimestamp(0);
      }
    });

    // Escutar estado da votação da ilha
    islandVotingRefRef.current = db.ref(`rooms/${currentRoom}/islandVoting`);
    islandVotingRefRef.current.on('value', (snapshot) => {
      const islandVoting = snapshot.val();
      
      if (islandVoting) {
        setIslandVotingPhase(islandVoting.isActive || false);
        
        // Processar votos da ilha
        if (islandVoting.votes) {
          const voteCounts = {};
          const userVotes = {};
          
          Object.keys(islandVoting.votes).forEach(cardId => {
            const cardVotes = islandVoting.votes[cardId];
            voteCounts[cardId] = Object.keys(cardVotes || {}).length;
            
            // Verificar se o usuário atual votou neste card
            if (cardVotes[playerIdRef.current]) {
              userVotes[cardId] = true;
            }
          });
          
          setIslandVoteCounts(voteCounts);
          setIslandUserVotes(userVotes);
        }
      } else {
        setIslandVotingPhase(false);
        setIslandVoteCounts({});
        setIslandUserVotes({});
      }
    });

    // Escutar estado do planejamento
    planningRefRef.current = db.ref(`rooms/${currentRoom}/planning`);
    planningRefRef.current.on('value', (snapshot) => {
      const planning = snapshot.val();
      
      if (planning) {
        setPlanningPhase(planning.isActive || false);
        
        if (planning.plans) {
          setCardPlans(planning.plans);
        }
      } else {
        setPlanningPhase(false);
        setCardPlans({});
      }
    });

    // Escutar resumo da sessão
    sessionSummaryRefRef.current = db.ref(`rooms/${currentRoom}/sessionSummary`);
    sessionSummaryRefRef.current.on('value', (snapshot) => {
      const summary = snapshot.val();
      setSessionSummary(summary);
    });

    // Função para atualizar posição no Firebase
    const updatePosition = (pos) => {
      if (myRefRef.current) {
        myRefRef.current.set({
          ...pos,
          name: playerName,
          color: playerColor,
          character: playerCharacter,
          view: playerView,
          lastSeen: firebase.database.ServerValue.TIMESTAMP
        });
      }
    };

    updatePosition({ x: 100, y: 100 });

    // Configurar remoção automática quando desconectar (Firebase feature)
    myRefRef.current.onDisconnect().remove();

    // Escutar outros jogadores
    const handlePlayersUpdate = (snapshot) => {
      const players = snapshot.val();
      const newOtherPlayers = {};

      if (players) {
        for (let id in players) {
          if (id === playerId) continue;

          const percentX = (players[id].x / players[id].innerWidth) * 100;
          const percentY = (players[id].y / players[id].innerHeight) * 100;

          newOtherPlayers[id] = {
            ...players[id],
            x: (window.innerWidth / 100) * percentX,  // Exemplo: adicionar 50px ao X
            y: (window.innerHeight / 100) * percentY,  // Exemplo: subtrair 30px do Y
          };
        }
      }

      setOtherPlayers(newOtherPlayers);
    };

    playersRefRef.current.on("value", handlePlayersUpdate);

    // Função para remover jogador quando sair da página
    const removePlayer = () => {
      if (myRefRef.current) {
        myRefRef.current.remove();
      }
    };

    // Eventos para detectar quando o usuário sai da página
    const handleBeforeUnload = () => {
      removePlayer();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        removePlayer();
      }
    };

    // Adicionar listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup ao desmontar componente
    return () => {
      // Remover listeners
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      // Cleanup do Firebase
      if (playersRefRef.current) {
        playersRefRef.current.off("value", handlePlayersUpdate);
      }
      if (allChestsRefRef.current) {
        allChestsRefRef.current.off();
      }
      if (roomTimerRefRef.current) {
        roomTimerRefRef.current.off();
      }
      if (sessionRefRef.current) {
        sessionRefRef.current.off();
      }
      if (votingRefRef.current) {
        votingRefRef.current.off();
      }
      if (islandVotingRefRef.current) {
        islandVotingRefRef.current.off();
      }
      if (planningRefRef.current) {
        planningRefRef.current.off();
      }
      if (sessionSummaryRefRef.current) {
        sessionSummaryRefRef.current.off();
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      removePlayer();
    };
  }, [currentRoom, playerName, playerColor, playerCharacter, playerView, isRoomOwner]);

  // Atualizar posição quando state mudar
  useEffect(() => {
    if (myRefRef.current && currentRoom) {
      myRefRef.current.set({
        ...position,
        name: playerName,
        color: playerColor,
        character: playerCharacter,
        view: playerView,
        lastSeen: firebase.database.ServerValue.TIMESTAMP,
        innerHeight: window.innerHeight,
        innerWidth: window.innerWidth,
      });
    }
  }, [position, playerName, playerColor, playerCharacter, playerView, currentRoom]);

  // Handler para clique na tela
  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickY = e.clientY - rect.top - 25;
    const currentY = position.y;

    const percentX = ((e.clientX - rect.left - 25 )/ window.innerWidth) * 100;
    const percentY = (clickY / window.innerHeight) * 100;

    const newPos = {
      x: (window.innerWidth / 100) * percentX,
      y: (window.innerHeight / 100) * percentY
    };

    // debugger
    
    // Determinar a direção do movimento e ajustar a visão
    if (clickY < currentY) {
      // Clicou acima = movendo para cima = mostrar costas
      setPlayerView('back');
    } else if (clickY > currentY) {
      // Clicou abaixo = movendo para baixo = mostrar frente
      setPlayerView('front');
    }
    // Se clicou na mesma altura (clickY === currentY), mantém a visão atual
    
    setPosition(newPos);
  };

  return (
    <>
      {!currentRoom ? (
        <Initial 
          onJoinRoom={handleJoinRoom}
          onCreateRoom={handleCreateRoom}
        />
      ) : (
        <div className="game-container" onClick={handleClick}>
          {/* Header da sala */}
          <div className="room-header">
            <div className="room-info">
              <span className="room-code" onClick={copyRoomCode}>Sala: {roomCode}</span>
              <span className="player-name">Jogador: {playerName}</span>
              {isRoomOwner && <span className="room-owner">👑 Dono</span>}
            </div>
            
            <div className="timer-info">
              {isTimeActive() ? (
                <div className="timer-active">
                  <span className="timer-display">⏰ {formatTime(timeRemaining)}</span>
                  {isRoomOwner && (
                    <button className="stop-timer-button" onClick={stopTimer}>
                      ⏹️ Parar
                    </button>
                  )}
                </div>
              ) : roomTimer && roomTimer.endTime && timeRemaining === 0 ? (
                // Timer acabou - mostrar opções
                <div className="timer-finished">
                  {isRoomOwner ? (
                    <div className="owner-options">
                      <button 
                        className="show-results-button" 
                        onClick={showResults}
                      >
                        👁️ Ver Resultados
                      </button>
                      <button 
                        className="new-round-button" 
                        onClick={startNewRound}
                      >
                        🔄 Nova Rodada
                      </button>
                    </div>
                  ) : (
                    <span className="timer-finished-msg">⏱️ Tempo acabou - Aguardando dono</span>
                  )}
                </div>
              ) : (
                <div className="timer-inactive">
                  {isRoomOwner ? (
                    <button 
                      className="start-timer-button" 
                      onClick={() => setShowTimerModal(true)}
                    >
                      ⏰ Iniciar Timer
                    </button>
                  ) : (
                    <span className="timer-waiting">⏱️ Aguardando timer</span>
                  )}
                </div>
              )}
              
              {/* Botão para participantes acessarem resultados/votação */}
              {!isRoomOwner && (isVotingPhase || votingFinished || islandVotingPhase || planningPhase || sessionSummary) && (
                <button 
                  className="participant-results-button"
                  onClick={() => setShowResultsModal(true)}
                  title="Abrir votação/resultados"
                >
                  {isVotingPhase ? '🗳️ Votar' : 
                   islandVotingPhase ? '🏝️ Votar Ilha' :
                   planningPhase ? '📋 Planejamento' :
                   sessionSummary ? '📊 Resumo' :
                   '📊 Resultados'}
                </button>
              )}
            </div>

            <button className="leave-button" onClick={handleLeaveRoom}>
              🚪 Sair da Sala
            </button>
          </div>

          {/* Mundo do jogo */}
          <div className="game-world">
            {/* Jogador atual */}
            <div className="player-container">
            <div 
              id="me" 
              className="player me character-player"
              style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                backgroundColor: playerCharacter.color
              }}
              onClick={(e) => handlePlayerClick(e, playerIdRef.current)}
            >
              <img 
                src={playerView === 'front' ? playerCharacter.frontImage : playerCharacter.backImage}
                alt={`${playerCharacter.name} - ${playerView === 'front' ? 'Frente' : 'Costas'}`}
                className="character-image"
                onError={(e) => {
                  // Fallback para cor sólida se a imagem não carregar
                  e.target.style.display = 'none';
                }}
              />
              <span className="player-label">Você</span>
            </div>
            
            {/* Baú do jogador atual */}
            <div 
              className="chest my-chest clickable"
              style={{
                left: `${position.x + 40}px`,
                top: `${position.y - 45}px`
              }}
              onClick={(e) => handlePlayerClick(e, playerIdRef.current)}
              title="Clique para abrir seu baú"
            >
              📦
              {(allChestCounts[playerIdRef.current] || 0) > 0 && (
                <span className="chest-counter my-counter">
                  {allChestCounts[playerIdRef.current]}
                </span>
              )}
            </div>
          </div>
          
          {/* Outros jogadores */}
          {Object.entries(otherPlayers).map(([id, playerData]) => (
            <div key={id} className="player-container">
              <div
                className="player other character-player"
                style={{
                  left: `${playerData.x}px`,
                  top: `${playerData.y}px`,
                  backgroundColor: (playerData.character?.color || playerData.color) || '#6b7280'
                }}
              >
                {playerData.character ? (
                  <img 
                    src={playerData.view === 'back' ? playerData.character.backImage : playerData.character.frontImage}
                    alt={`${playerData.character.name} - ${playerData.view === 'back' ? 'Costas' : 'Frente'}`}
                    className="character-image"
                    onError={(e) => {
                      // Fallback para cor sólida se a imagem não carregar
                      e.target.style.display = 'none';
                    }}
                  />
                ) : null}
                <span className="player-label">{playerData.name || id}</span>
              </div>
              
              {/* Baú do outro jogador */}
              <div 
                className="chest other-chest"
                style={{
                  left: `${playerData.x + 60}px`,
                  top: `${playerData.y}px`
                }}
                title={`Baú de ${playerData.name || id} - ${allChestCounts[id] || 0} itens`}
              >
                📦
                {(allChestCounts[id] || 0) > 0 && (
                  <span className="chest-counter other-counter">
                    {allChestCounts[id]}
                  </span>
                )}
              </div>
            </div>
          ))}
          </div> {/* Fim do game-world */}
        </div>
      )}

      {/* Modal do Baú */}
      {showChest && (
        <ChestModal
          isOpen={showChest}
          onClose={closeChest}
          cards={chestCards}
          onAddCard={addCard}
          onRemoveCard={removeCard}
          ownerName={selectedChestOwner === playerIdRef.current ? playerName : 
            (otherPlayers[selectedChestOwner]?.name || selectedChestOwner)}
          isOwner={selectedChestOwner === playerIdRef.current}
          canAddCards={isTimeActive()}
        />
      )}

      {/* Modal do Timer */}
      {showTimerModal && (
        <TimerModal
          isOpen={showTimerModal}
          onClose={() => setShowTimerModal(false)}
          onStartTimer={startTimer}
        />
      )}

      {/* Modal de Resultados */}
      {showResultsModal && (
        <ResultsModal
          isOpen={showResultsModal}
          onClose={() => setShowResultsModal(false)}
          allCards={allCards}
          onNewRound={startNewRound}
          isOwner={isRoomOwner}
          onVote={voteOnCard}
          cardVotes={cardVotes}
          userVotes={userVotes}
          isVotingPhase={isVotingPhase}
          votingFinished={votingFinished}
          onStartVoting={startVoting}
          onFinishVoting={finishVoting}
          onRestartVoting={restartVoting}
          gameCode={roomCode}
          startIslandVoting={startIslandVoting}
          finishIslandVoting={finishIslandVoting}
          voteIslandCard={voteIslandCard}
          savePlan={savePlan}
          islandVotingPhase={islandVotingPhase}
          islandUserVotes={islandUserVotes}
          islandVoteCounts={islandVoteCounts}
          planningPhase={planningPhase}
          cardPlans={cardPlans}
          sessionSummary={sessionSummary}
          finalizePlanning={finalizePlanning}
          otherPlayers={otherPlayers}
          userId={playerIdRef.current}
          rawVotingData={rawVotingData}
          votingDataTimestamp={votingDataTimestamp}
        />
      )}
    </>
  );
}

export default App;