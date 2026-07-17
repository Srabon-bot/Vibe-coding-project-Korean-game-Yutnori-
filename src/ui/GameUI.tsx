import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { BranchChoiceModal } from './BranchChoiceModal';
import { HintToast } from './HintToast';
import { HomeScreen } from './HomeScreen';
import { NewGameConfirmModal } from './NewGameConfirmModal';
import { PieceAssignmentPanel } from './PieceAssignmentPanel';
import { RulesReminder } from './RulesReminder';
import { ScoreOffBoard } from './ScoreOffBoard';
import { SettingsMenu } from './SettingsMenu';
import { ThrowButton } from './ThrowButton';
import { ThrowResultBanner } from './ThrowResultBanner';
import { ThrowResultOverlay } from './ThrowResultOverlay';
import { TurnIndicator } from './TurnIndicator';
import { TutorialModal } from './TutorialModal';
import { WinModal } from './WinModal';

export function GameUI() {
  const screen = useGameStore((s) => s.screen);
  const setScreen = useGameStore((s) => s.setScreen);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [newGameConfirmOpen, setNewGameConfirmOpen] = useState(false);
  const phase = useGameStore((s) => s.game.phase);

  function requestNewGame() {
    if (phase === 'game-over') {
      setScreen('home');
    } else {
      setNewGameConfirmOpen(true);
    }
  }

  if (screen === 'home') {
    return (
      <div style={{ position: 'absolute', inset: 0 }}>
        <HomeScreen
          onStart={() => {
            setScreen('game');
            setTutorialOpen(true);
          }}
          onOpenTutorial={() => setTutorialOpen(true)}
        />
        <TutorialModal open={tutorialOpen} onClose={() => setTutorialOpen(false)} />
      </div>
    );
  }

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          top: 12,
          left: 12,
          right: 12,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 10,
          pointerEvents: 'none',
        }}
      >
        <div style={{ pointerEvents: 'auto' }}>
          <TurnIndicator />
        </div>
        <div style={{ pointerEvents: 'auto' }}>
          <ScoreOffBoard />
        </div>
        <div style={{ pointerEvents: 'auto' }}>
          <SettingsMenu onOpenTutorial={() => setTutorialOpen(true)} onRequestNewGame={requestNewGame} />
        </div>
      </div>

      <ThrowResultOverlay />

      {/* Left dock: contextual hints/reminders, out of the board's way. */}
      <div className="side-dock side-dock-left">
        <RulesReminder />
        <HintToast />
      </div>

      {/* Right dock: decisions that pause the game — move choice and the shortcut junction choice. */}
      <div className="side-dock side-dock-right">
        <PieceAssignmentPanel />
        <BranchChoiceModal />
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10,
          pointerEvents: 'none',
          width: 'min(92vw, 480px)',
        }}
      >
        <div style={{ pointerEvents: 'auto' }}>
          <ThrowResultBanner />
        </div>
        <div style={{ pointerEvents: 'auto' }}>
          <ThrowButton />
        </div>
      </div>

      <div style={{ pointerEvents: 'auto' }}>
        <WinModal />
        <TutorialModal open={tutorialOpen} onClose={() => setTutorialOpen(false)} />
        <NewGameConfirmModal
          open={newGameConfirmOpen}
          onCancel={() => setNewGameConfirmOpen(false)}
          onConfirm={() => {
            setNewGameConfirmOpen(false);
            setScreen('home');
          }}
        />
      </div>
    </div>
  );
}
