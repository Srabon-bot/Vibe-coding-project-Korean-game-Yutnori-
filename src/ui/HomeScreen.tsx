import { useState } from 'react';
import type { AIDifficulty } from '../ai/aiPlayer';
import { playSound } from '../audio/sounds';
import type { PlayerConfig } from '../engine/game';
import type { PlayerId } from '../engine/types';
import type { TFunc } from '../i18n/translations';
import { LANGUAGE_META } from '../i18n/translations';
import { useT } from '../i18n/useT';
import { PLAYER_COLORS } from '../scene/Piece3D';
import { useGameStore } from '../store/gameStore';
import { AIDifficultyModal } from './AIDifficultyModal';
import { PRESET_CHARACTERS, type PresetCharacter } from './presetCharacters';

interface HomeScreenProps {
  onStart: () => void;
  onOpenTutorial: () => void;
}

interface DraftPlayer {
  nickname: string;
  photoDataUrl: string | null;
  /** Set while the draft still exactly matches a picked preset; cleared the moment the player customizes anything. */
  presetId: PresetCharacter['id'] | null;
}

const MAX_PHOTO_BYTES = 2 * 1024 * 1024;
const EMPTY_DRAFT: DraftPlayer = { nickname: '', photoDataUrl: null, presetId: null };

const utilityButtonStyle = {
  padding: '8px 12px',
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  fontSize: '0.78rem',
  whiteSpace: 'nowrap',
} as const;

function PresetPicker({
  selectedId,
  disabledId,
  onSelect,
  t,
}: {
  selectedId: PresetCharacter['id'] | null;
  disabledId: PresetCharacter['id'] | null;
  onSelect: (preset: PresetCharacter | null) => void;
  t: TFunc;
}) {
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
      {PRESET_CHARACTERS.map((preset) => {
        const isSelected = selectedId === preset.id;
        const isDisabled = !isSelected && disabledId === preset.id;
        return (
          <button
            key={preset.id}
            type="button"
            disabled={isDisabled}
            onClick={() => {
              playSound('click');
              onSelect(isSelected ? null : preset);
            }}
            title={isDisabled ? t('customization.alreadyPicked', { name: preset.name }) : preset.name}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              background: 'transparent',
              border: 'none',
              padding: 0,
              cursor: isDisabled ? 'not-allowed' : 'pointer',
              opacity: isDisabled ? 0.35 : 1,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                backgroundImage: `url(${preset.photoUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                border: `2px solid ${isSelected ? preset.accentColor : 'rgba(244,227,193,0.3)'}`,
                boxShadow: isSelected ? `0 0 10px ${preset.accentColor}` : 'none',
              }}
            />
            <span style={{ fontSize: '0.65rem', opacity: 0.85 }}>{preset.name}</span>
          </button>
        );
      })}
    </div>
  );
}

function PhotoUpload({
  playerId,
  photoDataUrl,
  onChange,
  t,
}: {
  playerId: PlayerId;
  photoDataUrl: string | null;
  onChange: (url: string | null) => void;
  t: TFunc;
}) {
  const [error, setError] = useState<string | null>(null);

  function handleFile(file: File | undefined) {
    setError(null);
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError(t('customization.errorType'));
      playSound('error');
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setError(t('customization.errorSize'));
      playSound('error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      playSound('select');
      onChange(typeof reader.result === 'string' ? reader.result : null);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: photoDataUrl ? `url(${photoDataUrl}) center/cover` : 'rgba(244,227,193,0.12)',
          border: `2px solid ${PLAYER_COLORS[playerId]}`,
        }}
      />
      <label className="btn btn-ghost" style={{ fontSize: '0.75rem', padding: '5px 10px', cursor: 'pointer' }}>
        {photoDataUrl ? t('customization.changePhoto') : t('customization.addPhoto')}
        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFile(e.target.files?.[0])} />
      </label>
      {photoDataUrl && (
        <button
          className="btn btn-ghost"
          style={{ fontSize: '0.7rem', padding: '3px 8px' }}
          onClick={() => {
            playSound('click');
            onChange(null);
          }}
        >
          {t('customization.remove')}
        </button>
      )}
      {error && <span style={{ color: 'var(--color-red)', fontSize: '0.7rem' }}>{error}</span>}
    </div>
  );
}

/** Shuffles a copy of the array (Fisher-Yates). */
function shuffled<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function HomeScreen({ onStart, onOpenTutorial }: HomeScreenProps) {
  const restart = useGameStore((s) => s.restart);
  const configureAI = useGameStore((s) => s.configureAI);
  const soundMuted = useGameStore((s) => s.soundMuted);
  const toggleSound = useGameStore((s) => s.toggleSound);
  const language = useGameStore((s) => s.language);
  const cycleLanguage = useGameStore((s) => s.cycleLanguage);
  const [drafts, setDrafts] = useState<Record<PlayerId, DraftPlayer>>({
    p1: { ...EMPTY_DRAFT },
    p2: { ...EMPTY_DRAFT },
  });
  const [pieceCount, setPieceCount] = useState<4 | 2>(4);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const t = useT();

  const defaultNickname = (id: PlayerId) => t('customization.playerPlaceholder', { n: id === 'p1' ? 1 : 2 });

  function updateDraft(id: PlayerId, patch: Partial<DraftPlayer>) {
    setDrafts((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  }

  function selectPreset(id: PlayerId, preset: PresetCharacter | null) {
    if (preset) {
      updateDraft(id, { nickname: preset.name, photoDataUrl: preset.photoUrl, presetId: preset.id });
    } else {
      updateDraft(id, { ...EMPTY_DRAFT });
    }
  }

  /** Resolves each player's final nickname/photo: explicit preset > custom entry > a random not-yet-taken preset. */
  function resolvePlayers(): Record<PlayerId, PlayerConfig> {
    const resolved = {} as Record<PlayerId, PlayerConfig>;
    const takenPresetIds = new Set<PresetCharacter['id']>();
    const blankPlayerIds: PlayerId[] = [];

    for (const id of ['p1', 'p2'] as const) {
      const draft = drafts[id];
      if (draft.presetId) {
        const preset = PRESET_CHARACTERS.find((p) => p.id === draft.presetId)!;
        takenPresetIds.add(preset.id);
        resolved[id] = { nickname: preset.name, photoDataUrl: preset.photoUrl };
      } else if (draft.nickname.trim() || draft.photoDataUrl) {
        resolved[id] = { nickname: draft.nickname.trim() || defaultNickname(id), photoDataUrl: draft.photoDataUrl };
      } else {
        blankPlayerIds.push(id);
      }
    }

    if (blankPlayerIds.length > 0) {
      const available = shuffled(PRESET_CHARACTERS.filter((p) => !takenPresetIds.has(p.id)));
      for (const id of blankPlayerIds) {
        const preset = available.pop();
        resolved[id] = preset ? { nickname: preset.name, photoDataUrl: preset.photoUrl } : { nickname: defaultNickname(id), photoDataUrl: null };
      }
    }

    return resolved;
  }

  function handleLocalPlay() {
    playSound('click');
    configureAI(null, null);
    restart({ piecesPerPlayer: pieceCount, players: resolvePlayers() });
    onStart();
  }

  function handleOpenAiModal() {
    playSound('click');
    setAiModalOpen(true);
  }

  function handleSelectDifficulty(level: AIDifficulty) {
    playSound('click');
    setAiModalOpen(false);
    const { p1 } = resolvePlayers();
    configureAI('p2', level);
    restart({
      piecesPerPlayer: pieceCount,
      players: { p1, p2: { nickname: t('home.aiNickname', { level: t(`home.aiDifficulty.${level}`) }), photoDataUrl: null } },
    });
    onStart();
  }

  function handleToggleSound() {
    const turningOn = soundMuted;
    toggleSound();
    if (turningOn) playSound('toggle');
  }

  function handleCycleLanguage() {
    playSound('toggle');
    cycleLanguage();
  }

  function handleOpenTutorial() {
    playSound('open');
    onOpenTutorial();
  }

  return (
    <div className="home-backdrop">
      <div className="panel ornate-frame" style={{ padding: '32px 28px 24px', maxWidth: 640, width: '100%', margin: 'auto', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 14, right: 14, display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 6 }}>
          <button className="btn btn-ghost" style={utilityButtonStyle} onClick={handleToggleSound} title={soundMuted ? t('settings.soundOff') : t('settings.soundOn')}>
            <span aria-hidden="true">{soundMuted ? '🔇' : '🔊'}</span>
          </button>
          <button className="btn btn-ghost" style={utilityButtonStyle} onClick={handleOpenTutorial} title={t('settings.howToPlay')}>
            <span aria-hidden="true">❓</span>
            <span>{t('settings.howToPlay')}</span>
          </button>
          <button className="btn btn-ghost" style={utilityButtonStyle} onClick={handleCycleLanguage} title={t('settings.language')}>
            <span aria-hidden="true">🌐</span>
            <span>{LANGUAGE_META[language].nativeName}</span>
          </button>
        </div>

        <div style={{ textAlign: 'center', paddingTop: 6 }}>
          <span className="hero-emblem" aria-hidden="true">☯</span>
          <p className="panel-title" style={{ fontSize: '2rem', margin: '8px 0 2px' }}>
            {t('home.title')}
          </p>
          <p style={{ opacity: 0.75, fontSize: '0.85rem', margin: 0 }}>{t('home.subtitle')}</p>
        </div>
        <div className="taegeuk-divider" />

        <p className="panel-title" style={{ fontSize: '1rem', textAlign: 'center', marginTop: 16 }}>
          {t('home.chooseCharacters')}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, justifyContent: 'center', margin: '12px 0' }}>
          {(['p1', 'p2'] as const).map((id) => {
            const otherId = id === 'p1' ? 'p2' : 'p1';
            return (
              <div key={id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, flex: '1 1 200px', maxWidth: 240 }}>
                <PresetPicker
                  selectedId={drafts[id].presetId}
                  disabledId={drafts[otherId].presetId}
                  onSelect={(preset) => selectPreset(id, preset)}
                  t={t}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', opacity: 0.5 }}>
                  <div style={{ flex: 1, height: 1, background: 'currentColor' }} />
                  <span style={{ fontSize: '0.7rem' }}>{t('customization.or')}</span>
                  <div style={{ flex: 1, height: 1, background: 'currentColor' }} />
                </div>
                <PhotoUpload
                  playerId={id}
                  photoDataUrl={drafts[id].photoDataUrl}
                  onChange={(url) => updateDraft(id, { photoDataUrl: url, presetId: null })}
                  t={t}
                />
                <input
                  type="text"
                  placeholder={defaultNickname(id)}
                  value={drafts[id].nickname}
                  maxLength={20}
                  onChange={(e) => updateDraft(id, { nickname: e.target.value, presetId: null })}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 8,
                    border: `1px solid ${PLAYER_COLORS[id]}`,
                    background: 'rgba(0,0,0,0.25)',
                    color: 'var(--color-paper)',
                    textAlign: 'center',
                    fontFamily: 'var(--font-body)',
                  }}
                />
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, margin: '14px 0 4px' }}>
          <span style={{ fontSize: '0.7rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('home.pieceCount')}</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className={pieceCount === 4 ? 'btn btn-gold' : 'btn btn-ghost'}
              style={{ fontSize: '0.78rem', padding: '7px 14px' }}
              onClick={() => {
                playSound('toggle');
                setPieceCount(4);
              }}
            >
              {t('home.pieceCountTraditional')}
            </button>
            <button
              className={pieceCount === 2 ? 'btn btn-gold' : 'btn btn-ghost'}
              style={{ fontSize: '0.78rem', padding: '7px 14px' }}
              onClick={() => {
                playSound('toggle');
                setPieceCount(2);
              }}
            >
              {t('home.pieceCountQuick')}
            </button>
          </div>
        </div>

        <div className="taegeuk-divider" />

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 16 }}>
          <button className="btn mode-card" onClick={handleLocalPlay}>
            <span style={{ fontSize: '1.6rem' }} aria-hidden="true">🎲</span>
            <span className="mode-card-title">{t('home.localPlay')}</span>
            <span className="mode-card-desc">{t('home.localPlayDesc')}</span>
          </button>
          <button className="btn btn-secondary mode-card" onClick={handleOpenAiModal}>
            <span style={{ fontSize: '1.6rem' }} aria-hidden="true">🤖</span>
            <span className="mode-card-title">{t('home.vsAi')}</span>
            <span className="mode-card-desc">{t('home.vsAiDesc')}</span>
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.72rem', opacity: 0.6, margin: '18px 0 0' }}>{t('home.footer')}</p>
      </div>

      <AIDifficultyModal open={aiModalOpen} onCancel={() => setAiModalOpen(false)} onSelect={handleSelectDifficulty} />
    </div>
  );
}
