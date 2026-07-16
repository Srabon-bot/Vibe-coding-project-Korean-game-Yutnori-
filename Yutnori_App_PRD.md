# Product Requirements Document: Yutnori (윷놀이) Web App

## 1. Overview

Yutnori is a traditional Korean board game played by throwing four wooden sticks (yut) and moving pieces around a board based on the throw result. This PRD defines the requirements for a browser-based, two-player Yutnori app that lets friends play together casually, without any installation.

## 2. Background / Why

The requester learned Yutnori and found it fun, and wants to be able to play it anytime with a friend rather than needing physical sticks and a board. The goal is to make the game instantly accessible and enjoyable to replay.

## 3. Target Users (Who)

- **Primary users:** Two players — the requester and a friend — playing turns together.
- **Audience skill level:** Includes first-time players, so the app must be approachable without prior Yutnori knowledge.

## 4. Use Cases (When / Where)

- Casual play sessions when friends want to connect remotely or in person.
- Quick games during short breaks (e.g., between classes or work).
- Accessed entirely through a web browser — no downloads or installation required, so a game can start on a whim from any device with a browser.

## 5. Core Features (What)

### 5.1 Yut Stick Throw
- Player throws 4 yut sticks (simulated via animation/randomization).
- Result maps to one of five outcomes: **Do (1), Gae (2), Geol (3), Yut (4), Mo (5)**.
- **Back-do (hidden rule):** a specific stick combination results in a piece moving backward one space instead of forward; this must be implemented even though it's not one of the five main named results.
- Yut and Mo results grant an extra throw, per traditional rules.
- **Throw-then-move sequencing:** if a throw results in Yut or Mo, the player must resolve all of their extra throws first, and only then move pieces using the accumulated results — pieces are not moved in between individual throws within the same turn.

### 5.2 Board and Piece Movement
- Traditional Yutnori board (typically a square/diamond path with shortcut points).
- Each player controls a set of pieces (traditionally 4) that move around the board based on throw results.
- Pieces move the correct number of spaces for each result (Do=1, Gae=2, Geol=3, Yut=4, Mo=5, Back-do=1 space backward).
- Players choose which piece to move when multiple are in play.

### 5.3 Catching
- If a player's piece lands on a spot occupied by an opponent's piece, the opponent's piece is sent back to start, and the catching player gets an additional throw.

### 5.4 Stacking
- When pieces from the same team land on the same space, they combine and move together as a group for the rest of the game.

### 5.5 Shortcuts
- Board includes the traditional diagonal shortcut paths through the center, allowing pieces to reach the finish faster.

### 5.6 Turn-Based Two-Player Flow
- Clear turn indicator showing whose turn it is at all times.
- Game enforces turn order and valid moves automatically.
- Player can choose which piece to move when multiple pieces are available.
- When a piece reaches the finish point, it is correctly marked as completed/off the board.
- Win condition: first player to move all pieces off the board wins, and is implemented correctly.
- The game can be restarted after it ends, without needing to reload the page.

## 6. Design Requirements (How)

- **Visual style:** Fun, colorful, and inviting — not plain or overly minimal.
- **Korean atmosphere:** The game's visuals should evoke a Korean-style atmosphere or the feeling of traditional Yutnori (board texture, colors, motifs).
- **Board clarity:** The game board must be clear and easy to see at a glance.
- **Intuitive controls:** Buttons, pieces, scores, and turn indicators should be self-explanatory.
- **Usability:** Simple enough for first-time players to understand without instructions, though a brief how-to-play guide should be available.
- **Platform:** Fully functional in a standard web browser, requiring no installation or account creation to start playing.
- **Responsiveness:** Playable on both desktop and mobile browsers, since games may happen during short breaks.
- **Presentation format:** Either 2D or 3D board rendering is acceptable — the style is a free choice and doesn't affect correctness.
- **Customization (stretch within core scope):** Game pieces customized with players' own faces/photos; optional language settings, nickname settings, or character selection.
- **Polish:** Sound effects, animations, or a victory effect on game completion add to the experience.

## 7. Bonus / Stretch Features (optional, not required for core completion)

- Difficulty settings, an AI opponent, or an online multiplayer mode.
- Any additional original ideas the player wants to add on top of the core game.

## 8. Out of Scope (for initial version)

- More than 2 players / team play
- User accounts, saved game history, or matchmaking with strangers beyond a single shared session
- Voice chat

## 9. Success Criteria

- Two friends can start and complete a full game entirely in-browser with no setup friction.
- A first-time player can understand how to play within the first game, aided by clear visual feedback (throw results, valid moves, catches, stacks).
- Game correctly implements all core Yutnori rules: throwing (including back-do), movement, catching, stacking, and shortcuts.
- Turn flow, win condition, and restart all work correctly.

## 10. Acceptance Criteria Reference

The following checklist reflects how the finished game will be evaluated, and should be treated as the definition of "done" for each area:

**Yutnori Rules (45 pts)**
- Do/Gae/Geol/Yut/Mo results implemented; pieces move the correct number of spaces
- Yut/Mo grants an extra turn; extra throws are fully resolved before pieces are moved
- Catching implemented; catching grants an extra turn
- Same-team pieces stack and move together
- Pieces are marked completed when they reach the finish point
- Back-do (hidden rule) is implemented

**Game Flow & Logic (25 pts)**
- Turns switch correctly between players; whose turn it is is always clear
- Player can choose which piece to move among multiple pieces
- Win condition implemented correctly
- Game can be restarted after it ends

**UI/UX Design & Customization (30 pts)**
- Clear, easy-to-see board
- Intuitive buttons, pieces, scores, and turn indicators
- Korean-style atmosphere/feeling of Yutnori
- Pieces customized with players' own faces
- Extra features such as language settings, nickname settings, or character selection
- Sound effects, animations, or a victory effect

**Bonus (15 pts)**
- Expanded features: difficulty settings, AI opponent, or multiplayer mode
- Game reflects the student's own original ideas
- Submitted on time

## 11. Open Questions

- Should players be on the same device (pass-and-play) or connect remotely (e.g., via a shared link/room code)?
- Is a rules/tutorial screen needed before the first game, or just contextual hints during play?
- 2D or 3D board — which direction to take for this build?
