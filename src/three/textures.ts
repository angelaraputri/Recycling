import * as THREE from 'three';
import { BIN_DEFINITIONS } from '../data/recyclingData';
import { Language, WasteCategory } from '../types/game';

function finalizeTexture(
  canvas: HTMLCanvasElement,
  maxAnisotropy: number,
  repeatX = 1,
  repeatY = 1
): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = Math.max(1, maxAnisotropy);
  if (repeatX !== 1 || repeatY !== 1) {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeatX, repeatY);
  }
  tex.needsUpdate = true;
  return tex;
}

export function createBinLabelTexture(
  category: WasteCategory,
  lang: Language,
  maxAnisotropy: number
): THREE.CanvasTexture {
  const def = BIN_DEFINITIONS[category];
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Clean off-white plaque background
  ctx.fillStyle = '#FFFDF9';
  ctx.fillRect(0, 0, 512, 512);

  // Colored header strip
  ctx.fillStyle = def.colorHex;
  ctx.fillRect(0, 0, 512, 118);

  // Subtle inner border
  ctx.strokeStyle = def.colorHex;
  ctx.lineWidth = 18;
  ctx.strokeRect(9, 9, 494, 494);

  // Header text
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 48px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(def.shortName[lang].toUpperCase(), 256, 62);

  // Soft tinted circle backdrop for emblem
  ctx.fillStyle = def.accentHex;
  ctx.beginPath();
  ctx.arc(256, 285, 118, 0, Math.PI * 2);
  ctx.fill();

  // Category emblem icon
  ctx.save();
  ctx.translate(256, 285);
  ctx.strokeStyle = def.colorHex;
  ctx.fillStyle = def.colorHex;
  ctx.lineWidth = 14;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (category === 'organic') {
    // Leaf emblem
    ctx.beginPath();
    ctx.moveTo(-48, 52);
    ctx.quadraticCurveTo(-56, -50, 54, -58);
    ctx.quadraticCurveTo(48, 52, -48, 52);
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(-36, 40);
    ctx.quadraticCurveTo(2, -4, 38, -42);
    ctx.stroke();
  } else if (category === 'paper') {
    // Folded paper sheet
    ctx.beginPath();
    ctx.moveTo(-52, -64);
    ctx.lineTo(22, -64);
    ctx.lineTo(56, -30);
    ctx.lineTo(56, 66);
    ctx.lineTo(-52, 66);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#BAE6FD';
    ctx.beginPath();
    ctx.moveTo(22, -64);
    ctx.lineTo(22, -30);
    ctx.lineTo(56, -30);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(-28, 0);
    ctx.lineTo(28, 0);
    ctx.moveTo(-28, 28);
    ctx.lineTo(20, 28);
    ctx.stroke();
  } else if (category === 'plastic') {
    // Bottle silhouette
    ctx.beginPath();
    ctx.roundRect(-18, -72, 36, 22, 6);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-24, -44);
    ctx.lineTo(24, -44);
    ctx.lineTo(36, -12);
    ctx.lineTo(36, 64);
    ctx.lineTo(-36, 64);
    ctx.lineTo(-36, -12);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#FEF08A';
    ctx.fillRect(-30, 8, 60, 26);
  } else {
    // Can & Bottle silhouette
    ctx.beginPath();
    ctx.roundRect(-58, -32, 52, 92, 10);
    ctx.fill();
    ctx.fillStyle = '#FECACA';
    ctx.fillRect(-52, -4, 40, 36);
    ctx.fillStyle = def.colorHex;
    ctx.beginPath();
    ctx.roundRect(18, -68, 24, 34, 5);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(8, -32, 44, 92, 12);
    ctx.fill();
  }
  ctx.restore();

  // Footer helper word
  ctx.fillStyle = '#334155';
  ctx.font = 'bold 30px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText(lang === 'id' ? 'DAUR ULANG' : 'RECYCLE', 256, 452);

  return finalizeTexture(canvas, maxAnisotropy);
}

export function createSignpostTexture(
  lang: Language,
  maxAnisotropy: number
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#FEF3C7';
  ctx.fillRect(0, 0, 768, 256);

  ctx.strokeStyle = '#92400E';
  ctx.lineWidth = 18;
  ctx.strokeRect(9, 9, 750, 238);

  ctx.fillStyle = '#15803D';
  ctx.font = 'bold 54px "Bricolage Grotesque", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(
    lang === 'id' ? 'TAMAN DAUR ULANG KURO' : "KURO'S ECO RECYCLING PARK",
    384,
    98
  );

  ctx.fillStyle = '#78350F';
  ctx.font = '600 30px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText(
    lang === 'id' ? 'Pilah Sampahmu, Sayangi Bumi!' : 'Sort Your Trash, Love Our Earth!',
    384,
    172
  );

  return finalizeTexture(canvas, maxAnisotropy);
}

export function createPlazaStoneTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#F3EFE6';
  ctx.fillRect(0, 0, 1024, 1024);

  const cx = 512;
  const cy = 512;

  // Concentric warm paving rings
  const rings = [490, 410, 320, 220, 120];
  rings.forEach((r, idx) => {
    ctx.strokeStyle = idx % 2 === 0 ? '#DDD6C7' : '#E5DFD3';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  });

  // Radial tile joints
  ctx.strokeStyle = '#E2DBCC';
  ctx.lineWidth = 4;
  for (let i = 0; i < 24; i++) {
    const angle = (i / 24) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * 120, cy + Math.sin(angle) * 120);
    ctx.lineTo(cx + Math.cos(angle) * 490, cy + Math.sin(angle) * 490);
    ctx.stroke();
  }

  // Subtle green eco leaf medallion at center
  ctx.fillStyle = '#DCFCE7';
  ctx.beginPath();
  ctx.arc(cx, cy, 114, 0, Math.PI * 2);
  ctx.fill();

  return finalizeTexture(canvas, maxAnisotropy);
}

export function createGrassTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#7ED957';
  ctx.fillRect(0, 0, 512, 512);

  // Playful meadow blades & sun-dappled patches
  for (let i = 0; i < 220; i++) {
    const x = ((i * 73) % 512);
    const y = ((i * 137) % 512);
    ctx.fillStyle = i % 3 === 0 ? '#8BE464' : i % 3 === 1 ? '#6EC948' : '#96EA71';
    ctx.beginPath();
    ctx.ellipse(x, y, 16 + (i % 14), 8 + (i % 8), (i % 5) * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }

  return finalizeTexture(canvas, maxAnisotropy, 16, 16);
}

export function createConveyorTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#334155';
  ctx.fillRect(0, 0, 512, 256);

  // Moving chevron arrows pointing right (+X)
  ctx.strokeStyle = '#38BDF8';
  ctx.lineWidth = 22;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  for (let x = -64; x <= 576; x += 128) {
    ctx.beginPath();
    ctx.moveTo(x - 30, 56);
    ctx.lineTo(x + 26, 128);
    ctx.lineTo(x - 30, 200);
    ctx.stroke();
  }

  // Yellow safety edge stripes
  ctx.fillStyle = '#FACC15';
  ctx.fillRect(0, 0, 512, 18);
  ctx.fillRect(0, 238, 512, 18);

  return finalizeTexture(canvas, maxAnisotropy, 3, 1);
}

export function createNewspaperTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#F1F5F9';
  ctx.fillRect(0, 0, 256, 256);

  ctx.fillStyle = '#1E293B';
  ctx.fillRect(18, 18, 220, 34);
  ctx.fillStyle = '#94A3B8';
  for (let y = 70; y < 230; y += 22) {
    ctx.fillRect(18, y, 98, 10);
    ctx.fillRect(134, y, 104, 10);
  }
  ctx.fillStyle = '#38BDF8';
  ctx.fillRect(134, 70, 104, 62);

  return finalizeTexture(canvas, maxAnisotropy);
}

export function createSodaCanTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#EF4444';
  ctx.fillRect(0, 0, 256, 256);
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.ellipse(128, 128, 92, 48, -0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#DC2626';
  ctx.font = 'bold 40px "Bricolage Grotesque", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('SODA', 128, 128);

  return finalizeTexture(canvas, maxAnisotropy);
}

export function createMilkCartonTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, 256, 256);
  ctx.fillStyle = '#0EA5E9';
  ctx.fillRect(0, 0, 256, 68);
  ctx.fillRect(0, 198, 256, 58);
  ctx.fillStyle = '#0284C7';
  ctx.font = 'bold 42px "Bricolage Grotesque", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('SUSU', 128, 132);

  return finalizeTexture(canvas, maxAnisotropy);
}

export function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(64, 64, 8, 64, 64, 62);
  grad.addColorStop(0, 'rgba(15, 23, 42, 0.42)');
  grad.addColorStop(0.55, 'rgba(15, 23, 42, 0.16)');
  grad.addColorStop(1, 'rgba(15, 23, 42, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
