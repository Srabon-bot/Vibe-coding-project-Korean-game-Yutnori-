# Yutnori (윷놀이)

A 3D, browser-based version of **Yutnori**, the traditional Korean board game, built with React Three Fiber. Play locally with a friend on one device, or against a computer opponent — throw the yut sticks, race your pieces around the board, catch your opponent, and cut through the center on a shortcut to get home first.

No installs, no accounts, no backend — just open it and play.

## Features

- **Full rules engine** — Do/Gae/Geol/Yut/Mo throws, the hidden Back-do rule, Yut/Mo bonus throws, catching (sends a piece back to start + bonus throw), stacking (same-team pieces move together), the two diagonal shortcuts through the center, and correct win detection.
- **3D board and pieces** — pieces animate step-by-step along the board path (including shortcuts) instead of teleporting; yut sticks toss and scatter across the board with a proper flip animation.
- **Hover-to-preview** — hover a move choice or a shortcut option to see exactly where that piece would land, with a highlighted path, before committing.
- **Home screen** — a landing menu (with the live board visible behind it) where you pick each player's character, choose 4 or 2 pieces per player, and start either mode below.
- **Local pass-and-play** — two players, one device.
- **VS AI** — pick **Easy** (random moves), **Medium** (sensible heuristic play), or **Hard** (plays to win — always takes a catch or a finish when one's available), and the computer plays its entire turn — throwing, choosing moves, resolving shortcut choices — on its own.
- **Character customization** — upload your own photo and nickname, or pick from three pre-made characters; if a player skips setup, the game randomly assigns one of the remaining characters.
- **Multi-language** — English, 한국어, and বাংলা, switchable anywhere via the 🌐 button, covering every screen including the tutorial and in-scene labels.
- **Korean-styled presentation** — taegeuk and obangsaek color palette, a hanji-paper panel texture, ornamental corner brackets on menus and modals, a Korean-lettered center emblem, synthesized sound effects (throws, catches, stacks, wins, and general UI feedback), and a confetti victory effect.
- **Responsive** — playable on both desktop and mobile.

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL in your browser.

Other scripts:

```bash
npm run build   # type-check + production build
npm run preview # preview the production build
npm test        # run the unit test suite
```

## Tech stack

- [Vite](https://vitejs.dev/) + [React](https://react.dev/) + TypeScript
- [react-three-fiber](https://docs.pmnd.rs/react-three-fiber) / [drei](https://github.com/pmndrs/drei) (Three.js) for the 3D board and scene
- [Zustand](https://github.com/pmndrs/zustand) for state management
- [Vitest](https://vitest.dev/) for the rules-engine test suite
- Web Audio (synthesized, no audio files) for sound effects

## Project structure

```
src/
  engine/   pure TypeScript rules engine (board graph, turn state machine, throws) — fully unit-tested
  ai/       VS AI: a pure heuristic move-picker plus the controller that drives it via the same
            store actions a human uses — the engine itself has no notion of "AI"
  scene/    the 3D board, pieces, yut sticks, and effects (react-three-fiber)
  ui/       2D overlay UI (home screen, turn indicator, move picker, modals, settings)
  store/    Zustand store wiring the engine to the UI/scene — also holds screen navigation,
            language, sound, and AI configuration
  audio/    synthesized sound effect playback
  i18n/     translation dictionaries (en/ko/bn) and the useT() hook
  styles/   global CSS and the shared Korean-themed visual style
```

The engine has no dependency on React or Three.js, so the rules can be tested and reasoned about in isolation from rendering.

## How to play

1. On the home screen, set up each player's character, choose 4 (traditional) or 2 (quick game) pieces per player, then pick **Local Play** or **VS AI** (choosing a difficulty first).
2. Throw the yut sticks each turn — the result moves a piece 1–5 spaces (or, rarely, 1 space backward via Back-do). Rolling Yut or Mo earns another throw before you have to move anything.
3. Land on your own piece to stack it; land on an opponent's to send it back to start and earn a bonus throw. Landing exactly on a corner or the center lets you choose a shortcut route home.
4. First player to bring all of their pieces home wins.

The **❓ How to Play** button (on the home screen or in-game) reopens the full tutorial at any time.
