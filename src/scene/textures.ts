import * as THREE from 'three';

function makeCanvas(size: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  return { canvas, ctx };
}

function toTexture(canvas: HTMLCanvasElement): THREE.CanvasTexture {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

/** Classic two-tone taegeuk (Korean yin-yang) swirl, red over blue, on a cream disc. */
export function createTaegeukTexture(): THREE.CanvasTexture {
  const size = 256;
  const { canvas, ctx } = makeCanvas(size);
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.46;

  ctx.fillStyle = '#f4e3c1';
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.49, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(cx, cy);

  // Blue base half + swirl
  ctx.fillStyle = '#1e4fb3';
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();

  // Red swirl half (S-curve)
  ctx.fillStyle = '#b3261e';
  ctx.beginPath();
  ctx.arc(0, 0, r, Math.PI / 2, -Math.PI / 2, true);
  ctx.arc(0, -r / 2, r / 2, -Math.PI / 2, Math.PI / 2, false);
  ctx.arc(0, r / 2, r / 2, Math.PI / 2, -Math.PI / 2, false);
  ctx.fill();

  // Small opposite-color dots for the traditional decorative look
  ctx.fillStyle = '#1e4fb3';
  ctx.beginPath();
  ctx.arc(0, -r / 2, r * 0.14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#b3261e';
  ctx.beginPath();
  ctx.arc(0, r / 2, r * 0.14, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
  return toTexture(canvas);
}

/** Norigae-style decorative roundel: concentric rings in the given colors on a cream disc. */
export function createTasselTexture(outer: string, mid: string, inner: string): THREE.CanvasTexture {
  const size = 256;
  const { canvas, ctx } = makeCanvas(size);
  const cx = size / 2;
  const cy = size / 2;

  const rings: [number, string][] = [
    [size * 0.49, '#f4e3c1'],
    [size * 0.42, outer],
    [size * 0.3, '#f4e3c1'],
    [size * 0.24, mid],
    [size * 0.12, '#f4e3c1'],
    [size * 0.08, inner],
  ];
  for (const [radius, color] of rings) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  return toTexture(canvas);
}

/**
 * Center hub emblem: the Korean title "윷놀이" (Yutnori) in a brush-style serif, ringed by a thin
 * border with four small obangsaek accent dots at the compass points — echoing the taegeuk
 * corner's palette. Drawn once with a safe fallback font, then redrawn once the webfont
 * (loaded in index.html) finishes loading so it never gets stuck on a generic serif.
 */
export function createCenterEmblemTexture(): THREE.CanvasTexture {
  const size = 256;
  const { canvas, ctx } = makeCanvas(size);
  const cx = size / 2;
  const cy = size / 2;
  const ringRadius = size * 0.44;

  function paint(fontFamily: string) {
    ctx.clearRect(0, 0, size, size);

    ctx.strokeStyle = 'rgba(122,31,31,0.55)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
    ctx.stroke();

    const accentColors = ['#b3261e', '#1e4fb3', '#3a6b4f', '#7a1f1f'];
    accentColors.forEach((color, i) => {
      const angle = (Math.PI / 2) * i - Math.PI / 2;
      const ax = cx + Math.cos(angle) * ringRadius;
      const az = cy + Math.sin(angle) * ringRadius;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(ax, az, size * 0.026, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = '#7a1f1f';
    ctx.font = `700 50px "${fontFamily}"`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('윷놀이', cx, cy + 3);
  }

  paint('Gowun Batang, serif');
  const texture = toTexture(canvas);

  const fontSet = (document as unknown as { fonts?: { load: (spec: string) => Promise<unknown> } }).fonts;
  fontSet?.load('700 50px "Gowun Batang"').then(() => {
    paint('Gowun Batang');
    texture.needsUpdate = true;
  }).catch(() => {});

  return texture;
}

/** Subtle aged/hand-painted mottling for the board surface, tileable-ish low-contrast blotches. */
export function createGrainTexture(): THREE.CanvasTexture {
  const size = 512;
  const { canvas, ctx } = makeCanvas(size);
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, size, size);

  let seed = 42;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  for (let i = 0; i < 900; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const radius = 4 + rand() * 26;
    const alpha = 0.02 + rand() * 0.05;
    ctx.fillStyle = `rgba(${180 + rand() * 50}, ${150 + rand() * 40}, ${100 + rand() * 40}, ${alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = toTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

const STICK_TEX_WIDTH = 512;
const STICK_TEX_HEIGHT = 128;

function seededRand(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function paintWoodGrain(ctx: CanvasRenderingContext2D, width: number, height: number, seed: number): void {
  const rand = seededRand(seed);
  ctx.strokeStyle = 'rgba(150,120,70,0.14)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 12; i++) {
    const y = rand() * height;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y + (rand() - 0.5) * 16);
    ctx.stroke();
  }
}

/** A gentle vignette toward the long edges, suggesting a rounded log profile on a flat texture. */
function paintRoundedShading(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, 'rgba(50,32,16,0.16)');
  grad.addColorStop(0.5, 'rgba(50,32,16,0)');
  grad.addColorStop(1, 'rgba(50,32,16,0.16)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);
}

/**
 * Yut stick "cross" face: cream wood grain with 3 carved X marks. Per the reference rules
 * image, this is the majority/default face (shown on 3 of the 4 for Do/Gae/Geol, all 4 for
 * Mo) — the *other*, plain face is the one that gets counted for the throw's distance.
 */
export function createStickCrossMarkTexture(): THREE.CanvasTexture {
  const { canvas, ctx } = makeStickCanvas();
  ctx.fillStyle = '#f4e3c1';
  ctx.fillRect(0, 0, STICK_TEX_WIDTH, STICK_TEX_HEIGHT);
  paintWoodGrain(ctx, STICK_TEX_WIDTH, STICK_TEX_HEIGHT, 7);
  paintRoundedShading(ctx, STICK_TEX_WIDTH, STICK_TEX_HEIGHT);

  ctx.strokeStyle = 'rgba(10,8,6,0.92)';
  ctx.lineWidth = 16;
  ctx.lineCap = 'round';
  const r = STICK_TEX_HEIGHT * 0.3;
  const cy = STICK_TEX_HEIGHT / 2;
  for (const p of [0.26, 0.5, 0.74]) {
    const cx = STICK_TEX_WIDTH * p;
    ctx.beginPath();
    ctx.moveTo(cx - r, cy - r);
    ctx.lineTo(cx + r, cy + r);
    ctx.moveTo(cx + r, cy - r);
    ctx.lineTo(cx - r, cy + r);
    ctx.stroke();
  }

  return toTexture(canvas);
}

/**
 * Yut stick "blank" face: plain wood, no carving. Per the reference rules image, this is the
 * face that gets counted toward the throw's distance (1 blank up = Do, 2 = Gae, 3 = Geol, 4 =
 * Yut; 0 blank up, i.e. all four cross-side-up, = Mo).
 */
export function createStickBlankFaceTexture(): THREE.CanvasTexture {
  const { canvas, ctx } = makeStickCanvas();
  ctx.fillStyle = '#e8d4a8';
  ctx.fillRect(0, 0, STICK_TEX_WIDTH, STICK_TEX_HEIGHT);
  paintWoodGrain(ctx, STICK_TEX_WIDTH, STICK_TEX_HEIGHT, 19);
  paintRoundedShading(ctx, STICK_TEX_WIDTH, STICK_TEX_HEIGHT);
  return toTexture(canvas);
}

/**
 * "Blank" face for the one designated back-do stick: a blue return/U-turn arrow on tan instead
 * of plain wood. Shown on the counted (blank) face, not the cross face — Back-do only fires
 * when this specific stick is the lone one counted, so the mark must be visible exactly then.
 */
export function createStickBackdoFaceTexture(): THREE.CanvasTexture {
  const { canvas, ctx } = makeStickCanvas();
  ctx.fillStyle = '#e8c96b';
  ctx.fillRect(0, 0, STICK_TEX_WIDTH, STICK_TEX_HEIGHT);
  paintWoodGrain(ctx, STICK_TEX_WIDTH, STICK_TEX_HEIGHT, 31);
  paintRoundedShading(ctx, STICK_TEX_WIDTH, STICK_TEX_HEIGHT);

  ctx.save();
  ctx.translate(STICK_TEX_WIDTH / 2, STICK_TEX_HEIGHT / 2);
  ctx.strokeStyle = '#1e4fb3';
  ctx.fillStyle = '#1e4fb3';
  ctx.lineWidth = 9;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-16, -28);
  ctx.quadraticCurveTo(30, -30, 30, 2);
  ctx.quadraticCurveTo(30, 28, 2, 28);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(2, 28);
  ctx.lineTo(19, 17);
  ctx.lineTo(15, 36);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  return toTexture(canvas);
}

function makeStickCanvas(): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement('canvas');
  canvas.width = STICK_TEX_WIDTH;
  canvas.height = STICK_TEX_HEIGHT;
  const ctx = canvas.getContext('2d')!;
  return { canvas, ctx };
}
