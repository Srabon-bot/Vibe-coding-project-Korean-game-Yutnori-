# Running Yutnori from this folder

This project is a browser game with **no backend, no database, and no accounts** — everything
runs locally in your browser. You only need one thing installed: **Node.js**.

## 1. Install Node.js

Download and install the **LTS version** (20.x or newer) from:

**https://nodejs.org/**

This also installs `npm` (Node's package manager) automatically — you don't need to install
that separately.

To check it worked, open a terminal (Command Prompt / PowerShell on Windows, Terminal on
Mac/Linux) and run:

```bash
node -v
npm -v
```

Both should print a version number (Node should be `v20.x.x` or higher). If you get a
"command not found" error, Node either didn't install correctly or you need to restart your
terminal (or your PC) so it picks up the new install.

## 2. Unzip the project

Unzip the `yutnori` folder anywhere on your PC (Desktop, Documents, etc.). Then open a
terminal **inside that folder**:

- **Windows**: open the folder in File Explorer, click the address bar, type `cmd`, and press Enter.
- **Mac**: right-click the folder → "New Terminal at Folder" (or `cd` into it manually).
- **Linux**: right-click → "Open Terminal Here", or `cd` into it manually.

## 3. Install the project's dependencies

In that terminal, run:

```bash
npm install
```

This downloads all the libraries the project uses (React, Three.js, etc.) into a
`node_modules` folder. It only needs to be done once, and requires an internet connection.
This can take a minute or two.

## 4. Run it

```bash
npm run dev
```

This starts a local dev server and prints a URL, typically:

```
Local:   http://localhost:5173/
```

Open that URL in a browser (Chrome, Edge, or Firefox — anything reasonably modern with WebGL
support, which nearly all browsers from the last several years have). The game should load
immediately. Leave the terminal window open while you're using it; closing it stops the server.

To stop the server, go back to the terminal and press `Ctrl+C`.

## Other useful commands

```bash
npm run build    # builds an optimized, static production version into a dist/ folder
npm run preview  # serves that production build locally, to test it before sharing
npm test         # runs the automated test suite for the game's rules engine
```

## Troubleshooting

- **"npm install" fails or hangs** — check your internet connection; corporate/school networks
  sometimes block npm's registry. Try a different network if possible.
- **"Port 5173 is in use"** — Vite will automatically try the next port (5174, 5175, ...) and
  print whichever one it actually used. Just use the URL it prints.
- **Blank white page / WebGL errors in the browser console** — try a different browser, and make
  sure your graphics drivers are up to date. Very old/low-power hardware or virtual machines
  without GPU passthrough can sometimes struggle with WebGL.
- **`node -v` still not found after installing** — fully close and reopen your terminal (or
  restart your PC), since it needs to pick up the updated system PATH.

No other software, accounts, API keys, or internet access (beyond the one-time `npm install`)
is required.
