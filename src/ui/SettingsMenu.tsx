import type { CSSProperties } from 'react';
import { playSound } from '../audio/sounds';
import { LANGUAGE_META } from '../i18n/translations';
import { useT } from '../i18n/useT';
import { useGameStore } from '../store/gameStore';

interface SettingsMenuProps {
  onOpenTutorial: () => void;
  onRequestNewGame: () => void;
}

const buttonStyle: CSSProperties = {
  padding: '10px 16px',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  fontSize: '0.9rem',
  whiteSpace: 'nowrap',
};

export function SettingsMenu({ onOpenTutorial, onRequestNewGame }: SettingsMenuProps) {
  const soundMuted = useGameStore((s) => s.soundMuted);
  const toggleSound = useGameStore((s) => s.toggleSound);
  const language = useGameStore((s) => s.language);
  const cycleLanguage = useGameStore((s) => s.cycleLanguage);
  const t = useT();

  function handleToggleSound() {
    // Flip first so the click itself is audible only when sound is being turned on.
    const turningOn = soundMuted;
    toggleSound();
    if (turningOn) playSound('toggle');
  }

  function handleOpenTutorial() {
    playSound('open');
    onOpenTutorial();
  }

  function handleRequestNewGame() {
    playSound('click');
    onRequestNewGame();
  }

  function handleCycleLanguage() {
    playSound('toggle');
    cycleLanguage();
  }

  return (
    <div className="panel" style={{ padding: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      <button className="btn btn-ghost" style={buttonStyle} onClick={handleToggleSound} title={soundMuted ? t('settings.soundOff') : t('settings.soundOn')}>
        <span aria-hidden="true">{soundMuted ? '🔇' : '🔊'}</span>
        <span>{soundMuted ? t('settings.soundOff') : t('settings.soundOn')}</span>
      </button>
      <button className="btn btn-ghost" style={buttonStyle} onClick={handleOpenTutorial} title={t('settings.howToPlay')}>
        <span aria-hidden="true">❓</span>
        <span>{t('settings.howToPlay')}</span>
      </button>
      <button className="btn btn-ghost" style={buttonStyle} onClick={handleRequestNewGame} title={t('settings.newGame')}>
        <span aria-hidden="true">🔄</span>
        <span>{t('settings.newGame')}</span>
      </button>
      <button className="btn btn-ghost" style={buttonStyle} onClick={handleCycleLanguage} title={t('settings.language')}>
        <span aria-hidden="true">🌐</span>
        <span>{LANGUAGE_META[language].nativeName}</span>
      </button>
    </div>
  );
}
