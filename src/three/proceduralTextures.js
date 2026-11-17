import * as THREE from 'three';

/**
 * Generates a realistic dark wet asphalt road texture with fine mineral aggregate and subtle seams.
 */
export function createWetRoadTextures(maxAnisotropy = 4) {
  const size = 512;
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = size;
  colorCanvas.height = size;
  const ctx = colorCanvas.getContext('2d');

  ctx.fillStyle = '#111622';
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 6500; i++) {
    const x = (i * 97) % size;
    const y = (i * 173) % size;
    const v = 14 + (i % 16);
    ctx.fillStyle = `rgb(${v}, ${v + 3}, ${v + 9})`;
    ctx.fillRect(x, y, 2, 2);
  }

  ctx.strokeStyle = 'rgba(130, 165, 210, 0.06)';
  ctx.lineWidth = 1.5;
  for (let p = 0; p < size; p += 64) {
    ctx.beginPath();
    ctx.moveTo(p, 0);
    ctx.lineTo(p, size);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, p);
    ctx.lineTo(size, p);
    ctx.stroke();
  }

  // Natural damp asphalt grain without radial banding rings
  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = size;
  roughCanvas.height = size;
  const rctx = roughCanvas.getContext('2d');
  rctx.fillStyle = '#dadada';
  rctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 3600; i++) {
    const x = (i * 131) % size;
    const y = (i * 211) % size;
    const v = 192 + (i % 48);
    rctx.fillStyle = `rgb(${v}, ${v}, ${v})`;
    rctx.fillRect(x, y, 4, 4);
  }

  const map = new THREE.CanvasTexture(colorCanvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(28, 28);
  map.anisotropy = maxAnisotropy;

  const roughnessMap = new THREE.CanvasTexture(roughCanvas);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.repeat.set(28, 28);
  roughnessMap.anisotropy = maxAnisotropy;

  return { map, roughnessMap };
}

/**
 * Generates a realistic 512x1024 architectural glass curtain-wall skyscraper texture
 * with metallic mullions, spandrel bands, vertical glass sheen, and subtle lit interiors.
 */
export function createFacadeTexture(maxAnisotropy = 4, accent = 'cyan') {
  const w = 512;
  const h = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  // Anodized dark aluminum spandrel frame
  ctx.fillStyle = '#090e1a';
  ctx.fillRect(0, 0, w, h);

  const warmGlow = accent === 'yellow' ? '#f5dca4' : accent === 'magenta' ? '#eab4d0' : '#bae6fd';
  const accentStrip =
    accent === 'yellow' ? '#eab308' : accent === 'magenta' ? '#ec4899' : '#06b6d4';

  const cols = 12;
  const rows = 36;
  const cw = w / cols;
  const rh = h / rows;

  for (let r = 0; r < rows; r++) {
    const isMechFloor = r % 12 === 0;
    const y0 = r * rh;

    if (isMechFloor) {
      // Architectural mechanical louver floor
      ctx.fillStyle = '#0e1526';
      ctx.fillRect(0, y0, w, rh);
      ctx.fillStyle = '#1b2740';
      for (let lx = 4; lx < w; lx += 8) {
        ctx.fillRect(lx, y0 + 5, 3, rh - 10);
      }
      ctx.fillStyle = accentStrip;
      ctx.globalAlpha = 0.25;
      ctx.fillRect(0, y0 + rh - 3, w, 2);
      ctx.globalAlpha = 1.0;
      continue;
    }

    // Dark opaque structural slab spandrel at bottom 32% of each floor
    ctx.fillStyle = '#0d1424';
    ctx.fillRect(0, y0 + rh * 0.68, w, rh * 0.32);

    for (let c = 0; c < cols; c++) {
      const x0 = c * cw;
      const px = x0 + 2;
      const py = y0 + 2;
      const pw = cw - 4;
      const ph = rh * 0.66;

      const seed = (r * 43 + c * 29 + r * c * 7) % 31;
      const glassGrad = ctx.createLinearGradient(px, py, px, py + ph);

      if (seed < 16) {
        // Dark reflective twilight curtain glass
        glassGrad.addColorStop(0, '#162844');
        glassGrad.addColorStop(0.5, '#0e1b30');
        glassGrad.addColorStop(1, '#091221');
      } else if (seed < 24) {
        // Subtle softly lit office bay with recessed ceiling glow
        glassGrad.addColorStop(0, '#496e94');
        glassGrad.addColorStop(0.35, '#253f5e');
        glassGrad.addColorStop(1, '#132238');
      } else if (seed < 29) {
        // Warm / cool active interior suite
        glassGrad.addColorStop(0, warmGlow);
        glassGrad.addColorStop(0.28, '#537ea3');
        glassGrad.addColorStop(1, '#1a2f4d');
      } else {
        // Subtle accent architectural glass bay
        glassGrad.addColorStop(0, accentStrip);
        glassGrad.addColorStop(0.55, '#234a6e');
        glassGrad.addColorStop(1, '#112238');
      }

      ctx.fillStyle = glassGrad;
      ctx.fillRect(px, py, pw, ph);

      // Subtle vertical glass mullion highlight
      ctx.fillStyle = 'rgba(200, 230, 255, 0.08)';
      ctx.fillRect(px, py, 2, ph);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

/**
 * Generates a soft painterly atmospheric cloud billboard texture for Space-to-City descent.
 */
export function createCloudTexture() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, size, size);

  const puffs = [
    [128, 134, 72, 0.45],
    [82, 140, 52, 0.38],
    [174, 142, 54, 0.36],
    [108, 108, 48, 0.34],
    [152, 112, 46, 0.32],
    [128, 152, 68, 0.25],
  ];

  for (const [cx, cy, r, alpha] of puffs) {
    const grad = ctx.createRadialGradient(cx, cy - r * 0.12, r * 0.1, cx, cy, r);
    grad.addColorStop(0, `rgba(224, 236, 255, ${alpha})`);
    grad.addColorStop(0.5, `rgba(175, 200, 235, ${alpha * 0.55})`);
    grad.addColorStop(1, 'rgba(130, 160, 210, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Generates a seamless procedural wave normal map for realistic shimmering bay water.
 */
export function createWaterNormalTexture(maxAnisotropy = 4) {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(size, size);
  const d = img.data;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = (x / size) * Math.PI * 2;
      const v = (y / size) * Math.PI * 2;
      const dx =
        Math.cos(u * 4 + v * 2) * 0.35 +
        Math.cos(u * 9 - v * 5) * 0.2 +
        Math.sin(u * 13 + v * 7) * 0.1;
      const dy =
        Math.sin(v * 5 + u * 2) * 0.35 +
        Math.sin(v * 11 - u * 4) * 0.2 +
        Math.cos(v * 15 + u * 6) * 0.1;
      const idx = (y * size + x) * 4;
      d[idx] = Math.floor((dx * 0.5 + 0.5) * 255);
      d[idx + 1] = Math.floor((dy * 0.5 + 0.5) * 255);
      d[idx + 2] = 235;
      d[idx + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(16, 12);
  tex.anisotropy = maxAnisotropy;
  return tex;
}

/**
 * Clean architectural ceramic/slate tile texture for Hospital, Work Hub, and School floors.
 */
export function createCleanTileTexture(baseHex = '#323f52', lineHex = '#495a73', maxAnisotropy = 4) {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, size, size);

  // Subtle stone/ceramic micro-variation
  for (let i = 0; i < 600; i++) {
    const x = (i * 53) % size;
    const y = (i * 97) % size;
    ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.04)';
    ctx.fillRect(x, y, 6, 6);
  }

  ctx.strokeStyle = lineHex;
  ctx.lineWidth = 2;
  for (let p = 0; p <= size; p += 64) {
    ctx.beginPath();
    ctx.moveTo(p, 0);
    ctx.lineTo(p, size);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, p);
    ctx.lineTo(size, p);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(6, 6);
  tex.anisotropy = maxAnisotropy;
  return tex;
}

/**
 * Classroom holographic lesson display texture.
 */
export function createLessonScreenTexture() {
  const w = 512;
  const h = 256;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#091529';
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = 'rgba(0, 240, 255, 0.35)';
  ctx.lineWidth = 2;
  ctx.strokeRect(12, 12, w - 24, h - 24);

  ctx.fillStyle = '#00F0FF';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('AI ADAPTIVE LAB 2030', 30, 52);

  ctx.strokeStyle = '#FCEE0A';
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let x = 36; x <= 240; x += 6) {
    const y = 148 + Math.sin(x * 0.06) * 32;
    if (x === 36) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  const bars = [0.85, 0.72, 0.94];
  bars.forEach((v, i) => {
    const y = 96 + i * 40;
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(280, y, 190, 14);
    ctx.fillStyle = i === 1 ? '#FF2A6D' : '#00F0FF';
    ctx.fillRect(280, y, 190 * v, 14);
  });

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Work Hub factory telemetry & drone dispatch monitor texture.
 */
export function createLogisticsScreenTexture(variant = 0) {
  const w = 512;
  const h = 256;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#0b1220';
  ctx.fillRect(0, 0, w, h);

  // Subtle CAD grid
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)';
  ctx.lineWidth = 1;
  for (let gx = 24; gx < w; gx += 32) {
    ctx.beginPath();
    ctx.moveTo(gx, 16);
    ctx.lineTo(gx, h - 16);
    ctx.stroke();
  }
  for (let gy = 24; gy < h; gy += 32) {
    ctx.beginPath();
    ctx.moveTo(16, gy);
    ctx.lineTo(w - 16, gy);
    ctx.stroke();
  }

  ctx.strokeStyle = 'rgba(56, 189, 248, 0.38)';
  ctx.lineWidth = 2;
  ctx.strokeRect(10, 10, w - 20, h - 20);

  const titles = [
    'AUTONOMOUS DISPATCH · BAY 04',
    'ROBOTIC QA & TORQUE TELEMETRY',
    'DRONE FLEET CORRIDOR SYNC',
  ];
  ctx.fillStyle = '#e2e8f0';
  ctx.font = 'bold 19px sans-serif';
  ctx.fillText(titles[variant % 3], 26, 42);

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 13px monospace';
  ctx.fillText(variant === 0 ? 'STATUS: ACTIVE PICKUP' : variant === 1 ? 'QC PASS: 99.4%' : 'AIRSPACE: CLEAR', 26, 68);

  // Throughput bar chart on left
  const vals = [0.62, 0.84, 0.76, 0.92, 0.88, 0.95, 0.79];
  vals.forEach((v, i) => {
    const bx = 30 + i * 30;
    const bh = v * 110;
    ctx.fillStyle = 'rgba(148, 163, 184, 0.14)';
    ctx.fillRect(bx, 96, 18, 114);
    ctx.fillStyle = i === 5 ? '#f59e0b' : '#38bdf8';
    ctx.fillRect(bx, 210 - bh, 18, bh);
  });

  // Drone / Unit status list on right
  const rows = [
    ['UNIT-A1', 'EN ROUTE', '#22c55e', 0.91],
    ['UNIT-B2', 'CLAMPED', '#f59e0b', 0.78],
    ['UNIT-C3', 'QC PASS', '#38bdf8', 0.86],
  ];
  rows.forEach(([label, state, color, pct], idx) => {
    const ry = 104 + idx * 42;
    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'bold 13px monospace';
    ctx.fillText(`${label}  ${state}`, 270, ry);
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(270, ry + 8, 206, 10);
    ctx.fillStyle = color;
    ctx.fillRect(270, ry + 8, 206 * pct, 10);
  });

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * AI Hospital clinical telemetry cart display with ECG trace & MRI scan preview.
 */
export function createMedicalScreenTexture(variant = 0) {
  const w = 512;
  const h = 288;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#081524';
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = 'rgba(34, 211, 238, 0.42)';
  ctx.lineWidth = 3;
  ctx.strokeRect(10, 10, w - 20, h - 20);

  // Header bar
  ctx.fillStyle = '#0f253c';
  ctx.fillRect(14, 14, w - 28, 44);
  ctx.fillStyle = '#f1f5f9';
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText(variant === 0 ? 'MRI AI DIAGNOSTIC · 98% CONFIDENCE' : 'PATIENT VITALS · LIVE TELEMETRY', 26, 42);

  // MRI slice rings preview on left
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(105, 165, 66, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
  ctx.beginPath();
  ctx.ellipse(105, 165, 42, 54, 0.15, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = 'rgba(34, 211, 238, 0.25)';
  ctx.beginPath();
  ctx.arc(118, 152, 16, 0, Math.PI * 2);
  ctx.fill();

  // ECG waveform across right side
  ctx.strokeStyle = '#22c55e';
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let x = 200; x <= 480; x += 4) {
    const t = (x - 200) % 70;
    let spike = 0;
    if (t > 24 && t < 30) spike = -14;
    else if (t >= 30 && t < 36) spike = 36;
    else if (t >= 36 && t < 42) spike = -22;
    else if (t >= 48 && t < 56) spike = 8;
    const y = 134 - spike;
    if (x === 200) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Vitals metrics
  ctx.fillStyle = '#22c55e';
  ctx.font = 'bold 28px monospace';
  ctx.fillText('72 BPM', 202, 224);
  ctx.fillStyle = '#38bdf8';
  ctx.fillText('99% SpO2', 332, 224);
  ctx.fillStyle = '#94a3b8';
  ctx.font = '14px sans-serif';
  ctx.fillText('SCAN TIME: 3.0s · NO ANOMALIES', 202, 254);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}


/**
 * Creates a radial soft contact shadow disc texture.
 */
export function createContactShadowTexture() {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(64, 64, 8, 64, 64, 62);
  grad.addColorStop(0, 'rgba(0, 0, 0, 0.72)');
  grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.3)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Creates a glowing scanline grid texture for holograms.
 */
export function createHoloGridTexture(primaryHex = '#00F0FF') {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, size, size);

  ctx.strokeStyle = primaryHex;
  ctx.globalAlpha = 0.48;
  ctx.lineWidth = 2;
  for (let i = 0; i <= size; i += 16) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(size, i);
    ctx.stroke();
  }
  ctx.globalAlpha = 0.2;
  for (let i = 0; i <= size; i += 32) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, size);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}
