# Yutnori (윷놀이)

A 3D, browser-based version of **Yutnori**, the traditional Korean board game, built with React Three Fiber. Two players pass-and-play on one device — throw the yut sticks, race your pieces around the board, catch your opponent, and cut through the center on a shortcut to get home first.

No installs, no accounts, no backend — just open it and play.

## Features

- **Full rules engine** — Do/Gae/Geol/Yut/Mo throws, the hidden Back-do rule, Yut/Mo bonus throws, catching (sends a piece back to start + bonus throw), stacking (same-team pieces move together), the two diagonal shortcuts through the center, and correct win detection.
- **3D board and pieces** — pieces animate step-by-step along the board path (including shortcuts) instead of teleporting; yut sticks toss and scatter across the board with a proper flip animation.
- **Hover-to-preview** — hover a move choice or a shortcut option to see exactly where that piece would land, with a highlighted path, before committing.
- **Character customization** — upload your own photo and nickname, or pick from three pre-made characters; if a player skips setup, the game randomly assigns one of the remaining characters.
- **Korean-styled presentation** — taegeuk and obangsaek color palette, a Korean-lettered center emblem, tasteful sound effects, and a confetti victory effect.
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
npm test        # run the engine's unit tests
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
  scene/    the 3D board, pieces, yut sticks, and effects (react-three-fiber)
  ui/       2D overlay UI (turn indicator, move picker, modals, settings)
  store/    Zustand store wiring the engine to the UI/scene
  audio/    sound effect playback
```

The engine has no dependency on React or Three.js, so the rules can be tested and reasoned about in isolation from rendering.

## How to play

Throw the yut sticks each turn — the result moves a piece 1–5 spaces (or, rarely, 1 space backward via Back-do). Rolling Yut or Mo earns another throw before you have to move anything. Land on your own piece to stack it; land on an opponent's to send it back to start and earn a bonus throw. Landing exactly on a corner or the center lets you choose a shortcut route home. First player to bring all of their pieces home wins.
