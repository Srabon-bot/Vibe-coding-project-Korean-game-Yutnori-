export interface PresetCharacter {
  id: 'srabon' | 'lubna' | 'asif';
  name: string;
  accentColor: string;
  photoUrl: string;
}

/** Hardcoded pre-made characters players can pick instead of customizing their own. */
export const PRESET_CHARACTERS: PresetCharacter[] = [
  { id: 'srabon', name: 'Srabon', accentColor: '#b3261e', photoUrl: '/characters/srabon.jpg' },
  { id: 'lubna', name: 'Lubna', accentColor: '#1e4fb3', photoUrl: '/characters/lubna.jpg' },
  { id: 'asif', name: 'Asif', accentColor: '#c9a227', photoUrl: '/characters/asif.jpg' },
];
