import { useEffect } from 'react';
import { AIController } from './ai/AIController';
import { AudioController } from './audio/AudioController';
import { useT } from './i18n/useT';
import { Scene } from './scene/Scene';
import { useGameStore } from './store/gameStore';
import { GameUI } from './ui/GameUI';
import { ThemeFrame } from './ui/ThemeFrame';

function App() {
  const language = useGameStore((s) => s.language);
  const t = useT();

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = t('app.title');
  }, [language, t]);

  return (
    <div className="app-root" style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Scene />
      <ThemeFrame />
      <GameUI />
      <AudioController />
      <AIController />
    </div>
  );
}

export default App;
