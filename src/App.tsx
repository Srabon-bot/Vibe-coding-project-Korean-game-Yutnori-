import { AudioController } from './audio/AudioController';
import { Scene } from './scene/Scene';
import { GameUI } from './ui/GameUI';

function App() {
  return (
    <div className="app-root" style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Scene />
      <GameUI />
      <AudioController />
    </div>
  );
}

export default App;
