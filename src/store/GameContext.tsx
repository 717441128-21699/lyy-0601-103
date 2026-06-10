import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Player, Room, Question, GamePhase } from '@/types/game';
import { currentUser, mockPlayers } from '@/data/mockPlayers';
import { generateRandomQuestion } from '@/data/mockQuestions';

interface GameState {
  player: Player;
  room: Room | null;
  currentQuestion: Question | null;
  gamePhase: GamePhase;
  timeLeft: number;
  questionIndex: number;
  combo: number;
  score: number;
  isSpectator: boolean;
}

type GameAction =
  | { type: 'SET_PLAYER'; payload: Player }
  | { type: 'SET_ROOM'; payload: Room | null }
  | { type: 'SET_QUESTION'; payload: Question | null }
  | { type: 'SET_GAME_PHASE'; payload: GamePhase }
  | { type: 'SET_TIME_LEFT'; payload: number }
  | { type: 'ADD_SCORE'; payload: number }
  | { type: 'INCREMENT_COMBO' }
  | { type: 'RESET_COMBO' }
  | { type: 'INCREMENT_QUESTION_INDEX' }
  | { type: 'SET_SPECTATOR'; payload: boolean }
  | { type: 'NEXT_QUESTION' }
  | { type: 'RESET_GAME' };

const initialState: GameState = {
  player: currentUser,
  room: null,
  currentQuestion: null,
  gamePhase: 'ready',
  timeLeft: 180,
  questionIndex: 0,
  combo: 0,
  score: 0,
  isSpectator: false
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_PLAYER':
      return { ...state, player: action.payload };
    case 'SET_ROOM':
      return { ...state, room: action.payload };
    case 'SET_QUESTION':
      return { ...state, currentQuestion: action.payload };
    case 'SET_GAME_PHASE':
      return { ...state, gamePhase: action.payload };
    case 'SET_TIME_LEFT':
      return { ...state, timeLeft: action.payload };
    case 'ADD_SCORE':
      return { ...state, score: state.score + action.payload };
    case 'INCREMENT_COMBO':
      return { ...state, combo: state.combo + 1 };
    case 'RESET_COMBO':
      return { ...state, combo: 0 };
    case 'INCREMENT_QUESTION_INDEX':
      return { ...state, questionIndex: state.questionIndex + 1 };
    case 'SET_SPECTATOR':
      return { ...state, isSpectator: action.payload };
    case 'NEXT_QUESTION':
      return {
        ...state,
        currentQuestion: generateRandomQuestion(),
        questionIndex: state.questionIndex + 1
      };
    case 'RESET_GAME':
      return {
        ...state,
        currentQuestion: null,
        gamePhase: 'ready',
        timeLeft: 180,
        questionIndex: 0,
        combo: 0,
        score: 0
      };
    default:
      return state;
  }
}

const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
} | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
