import { useState } from 'react';
import type { PlayerConfig } from '../engine/game';
import type { PlayerId } from '../engine/types';
import { PLAYER_COLORS } from '../scene/Piece3D';
import { useGameStore } from '../store/gameStore';
import { PRESET_CHARACTERS, type PresetCharacter } from './presetCharacters';

interface CustomizationPanelProps {
  open: boolean;
  onComplete: () => void;
}

interface DraftPlayer {
  nickname: string;
  photoDataUrl: string | null;
  /** Set while the draft still exactly matches a picked preset; cleared the moment the player customizes anything. */
  presetId: PresetCharacter['id'] | null;
}

const MAX_PHOTO_BYTES = 2 * 1024 * 1024;
const EMPTY_DRAFT: DraftPlayer = { nickname: '', photoDataUrl: null, presetId: null };

function PresetPicker({
  selectedId,
  disabledId,
  onSelect,
}: {
  selectedId: PresetCharacter['id'] | null;
  disabledId: PresetCharacter['id'] | null;
  onSelect: (preset: PresetCharacter | null) => void;
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
            onClick={() => onSelect(isSelected ? null : preset)}
            title={isDisabled ? `${preset.name} is already picked` : preset.name}
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

function PhotoUpload({ playerId, photoDataUrl, onChange }: { playerId: PlayerId; photoDataUrl: string | null; onChange: (url: string | null) => void }) {
  const [error, setError] = useState<string | null>(null);

  function handleFile(file: File | undefined) {
    setError(null);
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setError('Image is too large (max 2MB).');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onChange(typeof reader.result === 'string' ? reader.result : null);
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
        {photoDataUrl ? 'Change photo' : 'Add photo (optional)'}
        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFile(e.target.files?.[0])} />
      </label>
      {photoDataUrl && (
        <button className="btn btn-ghost" style={{ fontSize: '0.7rem', padding: '3px 8px' }} onClick={() => onChange(null)}>
          Remove
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

export function CustomizationPanel({ open, onComplete }: CustomizationPanelProps) {
  const restart = useGameStore((s) => s.restart);
  const piecesPerPlayer = useGameStore((s) => s.game.piecesPerPlayer);
  const [drafts, setDrafts] = useState<Record<PlayerId, DraftPlayer>>({
    p1: { ...EMPTY_DRAFT },
    p2: { ...EMPTY_DRAFT },
  });

  if (!open) return null;

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
        resolved[id] = { nickname: draft.nickname.trim() || (id === 'p1' ? 'Player 1' : 'Player 2'), photoDataUrl: draft.photoDataUrl };
      } else {
        blankPlayerIds.push(id);
      }
    }

    if (blankPlayerIds.length > 0) {
      const available = shuffled(PRESET_CHARACTERS.filter((p) => !takenPresetIds.has(p.id)));
      for (const id of blankPlayerIds) {
        const preset = available.pop();
        resolved[id] = preset
          ? { nickname: preset.name, photoDataUrl: preset.photoUrl }
          : { nickname: id === 'p1' ? 'Player 1' : 'Player 2', photoDataUrl: null };
      }
    }

    return resolved;
  }

  function handleStart() {
    restart({ piecesPerPlayer, players: resolvePlayers() });
    onComplete();
  }

  return (
    <div className="modal-backdrop">
      <div className="panel" style={{ padding: 28, maxWidth: 520, width: '100%' }}>
        <p className="panel-title" style={{ fontSize: '1.4rem' }}>
          Who's playing?
        </p>
        <div className="taegeuk-divider" />
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', margin: '16px 0' }}>
          {(['p1', 'p2'] as const).map((id) => {
            const otherId = id === 'p1' ? 'p2' : 'p1';
            return (
              <div key={id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, flex: 1 }}>
                <PresetPicker
                  selectedId={drafts[id].presetId}
                  disabledId={drafts[otherId].presetId}
                  onSelect={(preset) => selectPreset(id, preset)}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', opacity: 0.5 }}>
                  <div style={{ flex: 1, height: 1, background: 'currentColor' }} />
                  <span style={{ fontSize: '0.7rem' }}>or</span>
                  <div style={{ flex: 1, height: 1, background: 'currentColor' }} />
                </div>
                <PhotoUpload
                  playerId={id}
                  photoDataUrl={drafts[id].photoDataUrl}
                  onChange={(url) => updateDraft(id, { photoDataUrl: url, presetId: null })}
                />
                <input
                  type="text"
                  placeholder={id === 'p1' ? 'Player 1' : 'Player 2'}
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
        <button className="btn" style={{ width: '100%' }} onClick={handleStart}>
          Start game
        </button>
      </div>
    </div>
  );
}
