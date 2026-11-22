import * as THREE from 'three';

export interface ProceduralTextureSet {
  carbon: THREE.CanvasTexture;
  carbonBump: THREE.CanvasTexture;
  carbonRoughness: THREE.CanvasTexture;
  asphalt: THREE.CanvasTexture;
  asphaltBump: THREE.CanvasTexture;
  asphaltRoughness: THREE.CanvasTexture;
  parkingAsphalt: THREE.CanvasTexture;
  crosswalkRoad: THREE.CanvasTexture;
  rampChevronRoad: THREE.CanvasTexture;
  goreChevronTex: THREE.CanvasTexture;
  tallerFloor: THREE.CanvasTexture;
  tallerFloorRoughness: THREE.CanvasTexture;
  woodFloor: THREE.CanvasTexture;
  woodFloorRoughness: THREE.CanvasTexture;
  showroomFloor: THREE.CanvasTexture;
  showroomFloorRoughness: THREE.CanvasTexture;
  underglowRadial: THREE.CanvasTexture;
  contactShadow: THREE.CanvasTexture;
  skyscraperFacade: THREE.CanvasTexture;
  skyscraperEmissive: THREE.CanvasTexture;
  skyscraperRoughness: THREE.CanvasTexture;
  concreteBarrier: THREE.CanvasTexture;
  chainLinkFence: THREE.CanvasTexture;
  highwaySign1: THREE.CanvasTexture;
  highwaySign2: THREE.CanvasTexture;
  medianSign: THREE.CanvasTexture;
  hangarSign: THREE.CanvasTexture;
  number78Sign: THREE.CanvasTexture;
  ghostGarageSign: THREE.CanvasTexture;
  tallerWallSign: THREE.CanvasTexture;
  dealershipSign: THREE.CanvasTexture;
  leaderboardSign: THREE.CanvasTexture;
  carPoster1: THREE.CanvasTexture;
  carPoster2: THREE.CanvasTexture;
  tireTread: THREE.CanvasTexture;
  tireTreadBump: THREE.CanvasTexture;
  tireSidewall: THREE.CanvasTexture;
  brakeRotor: THREE.CanvasTexture;
  radarSign: THREE.CanvasTexture;
  contractSign: THREE.CanvasTexture;
  carMeetSign: THREE.CanvasTexture;
  rampPortalSign: THREE.CanvasTexture;
  dispose: () => void;
}

export function createLicensePlateTexture(rawText: string): THREE.CanvasTexture {
  const clean = (rawText || 'GSTDVR')
    .toUpperCase()
    .replace(/[^A-Z0-9- ]/g, '')
    .slice(0, 8) || 'GSTDVR';
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 160;
  const ctx = canvas.getContext('2d')!;

  // White/brushed metal plate background
  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(0, 0, 512, 160);

  // Dark perimeter frame
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 10;
  ctx.strokeRect(5, 5, 502, 150);

  // Left blue motorsport/JDM-EU band
  ctx.fillStyle = '#1d4ed8';
  ctx.fillRect(10, 10, 56, 140);
  ctx.fillStyle = '#f8fafc';
  ctx.font = '700 22px "Barlow Condensed", "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('WG', 38, 62);
  ctx.font = '600 16px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('JP', 38, 104);

  // Top subtle red accent bar
  ctx.fillStyle = '#e10600';
  ctx.fillRect(74, 16, 422, 6);

  // Main embossed plate characters
  ctx.fillStyle = '#090d14';
  ctx.font = '800 84px "Barlow Condensed", "Consolas", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(clean, 286, 92);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createSignTexture(title: string, subtitle: string, accent: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#07090d';
  ctx.fillRect(0, 0, 1024, 256);

  ctx.strokeStyle = 'rgba(203,213,225,0.22)';
  ctx.lineWidth = 4;
  ctx.strokeRect(8, 8, 1008, 240);

  ctx.fillStyle = accent;
  ctx.fillRect(36, 48, 12, 160);

  ctx.fillStyle = '#dde4ee';
  ctx.font = '700 72px "Barlow Condensed", "Segoe UI", sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillText(title, 74, 108);

  ctx.fillStyle = 'rgba(203,213,225,0.75)';
  ctx.font = '500 28px "Plus Jakarta Sans", "Segoe UI", sans-serif';
  ctx.fillText(subtitle, 76, 180);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createExpresswaySignTexture(
  routeCode: string,
  routeColor: string,
  line1: string,
  line2: string
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#092e20';
  ctx.fillRect(0, 0, 1024, 256);

  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 8;
  ctx.strokeRect(10, 10, 1004, 236);

  ctx.fillStyle = routeColor;
  ctx.fillRect(34, 46, 130, 164);
  ctx.strokeStyle = '#dce2ea';
  ctx.lineWidth = 4;
  ctx.strokeRect(34, 46, 130, 164);

  ctx.fillStyle = '#e2e8f0';
  ctx.font = '700 74px "Barlow Condensed", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(routeCode, 99, 130);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#dde4ee';
  ctx.font = '700 62px "Barlow Condensed", sans-serif';
  ctx.fillText(line1, 198, 96);

  ctx.fillStyle = '#b8c4d4';
  ctx.font = '500 34px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(line2, 198, 174);

  ctx.fillStyle = '#dde4ee';
  for (const ax of [840, 935]) {
    ctx.beginPath();
    ctx.moveTo(ax, 196);
    ctx.lineTo(ax - 22, 152);
    ctx.lineTo(ax - 8, 152);
    ctx.lineTo(ax - 8, 70);
    ctx.lineTo(ax + 8, 70);
    ctx.lineTo(ax + 8, 152);
    ctx.lineTo(ax + 22, 152);
    ctx.closePath();
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createProceduralTextures(maxAnisotropy: number): ProceduralTextureSet {
  const aniso = Math.min(16, Math.max(1, maxAnisotropy));

  // 1. 1024x1024 Woven 2x2 Twill Carbon Fiber (Albedo + Bump + Roughness)
  const carbonCanvas = document.createElement('canvas');
  carbonCanvas.width = 1024;
  carbonCanvas.height = 1024;
  const cCtx = carbonCanvas.getContext('2d')!;

  const carbonBumpCanvas = document.createElement('canvas');
  carbonBumpCanvas.width = 1024;
  carbonBumpCanvas.height = 1024;
  const cbCtx = carbonBumpCanvas.getContext('2d')!;

  const carbonRoughCanvas = document.createElement('canvas');
  carbonRoughCanvas.width = 1024;
  carbonRoughCanvas.height = 1024;
  const crCtx = carbonRoughCanvas.getContext('2d')!;

  cCtx.fillStyle = '#0c0e13';
  cCtx.fillRect(0, 0, 1024, 1024);
  cbCtx.fillStyle = '#606060';
  cbCtx.fillRect(0, 0, 1024, 1024);
  crCtx.fillStyle = '#787878';
  crCtx.fillRect(0, 0, 1024, 1024);

  const cell = 16;
  for (let y = 0; y < 1024; y += cell) {
    for (let x = 0; x < 1024; x += cell) {
      const ix = (x / cell) | 0;
      const iy = (y / cell) | 0;
      const phase = (ix + iy) % 4;
      if (phase < 2) {
        // Horizontal fiber tow
        const g = cCtx.createLinearGradient(x, y, x + cell, y);
        g.addColorStop(0, '#141821');
        g.addColorStop(0.5, '#2b313f');
        g.addColorStop(1, '#141821');
        cCtx.fillStyle = g;
        cCtx.fillRect(x + 1, y + 1, cell - 2, cell - 2);

        cbCtx.fillStyle = '#c8c8c8';
        cbCtx.fillRect(x + 2, y + 2, cell - 4, cell - 4);
        crCtx.fillStyle = '#383838';
        crCtx.fillRect(x + 1, y + 1, cell - 2, cell - 2);
      } else {
        // Vertical fiber tow
        const g = cCtx.createLinearGradient(x, y, x, y + cell);
        g.addColorStop(0, '#0f1219');
        g.addColorStop(0.5, '#202633');
        g.addColorStop(1, '#0f1219');
        cCtx.fillStyle = g;
        cCtx.fillRect(x + 1, y + 1, cell - 2, cell - 2);

        cbCtx.fillStyle = '#9a9a9a';
        cbCtx.fillRect(x + 2, y + 2, cell - 4, cell - 4);
        crCtx.fillStyle = '#525252';
        crCtx.fillRect(x + 1, y + 1, cell - 2, cell - 2);
      }
    }
  }

  const carbon = new THREE.CanvasTexture(carbonCanvas);
  carbon.colorSpace = THREE.SRGBColorSpace;
  carbon.wrapS = THREE.RepeatWrapping;
  carbon.wrapT = THREE.RepeatWrapping;
  carbon.repeat.set(8, 8);
  carbon.anisotropy = aniso;

  const carbonBump = new THREE.CanvasTexture(carbonBumpCanvas);
  carbonBump.wrapS = THREE.RepeatWrapping;
  carbonBump.wrapT = THREE.RepeatWrapping;
  carbonBump.repeat.set(8, 8);
  carbonBump.anisotropy = aniso;

  const carbonRoughness = new THREE.CanvasTexture(carbonRoughCanvas);
  carbonRoughness.wrapS = THREE.RepeatWrapping;
  carbonRoughness.wrapT = THREE.RepeatWrapping;
  carbonRoughness.repeat.set(8, 8);
  carbonRoughness.anisotropy = aniso;

  // 2. 2048x2048 Ultra-HD Granular Expressway Asphalt + Tar Cracks + Glossy Puddles + Tire Tracks
  const ASP = 2048;
  const aspCanvas = document.createElement('canvas');
  aspCanvas.width = ASP;
  aspCanvas.height = ASP;
  const aCtx = aspCanvas.getContext('2d')!;

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = ASP;
  bumpCanvas.height = ASP;
  const bCtx = bumpCanvas.getContext('2d')!;

  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = ASP;
  roughCanvas.height = ASP;
  const rCtx = roughCanvas.getContext('2d')!;

  aCtx.fillStyle = '#12161e';
  aCtx.fillRect(0, 0, ASP, ASP);
  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, ASP, ASP);
  rCtx.fillStyle = '#d4d4d4';
  rCtx.fillRect(0, 0, ASP, ASP);

  // Polished tire tracks & rubber deposits along all 10 lanes (5 per side across 42m width)
  const laneMeters = [-18.4, -14.6, -10.8, -7.0, -3.2, 3.2, 7.0, 10.8, 14.6, 18.4];
  const pxPerMeter = ASP / 42.0;
  for (const lm of laneMeters) {
    const laneCenter = 1024 + lm * pxPerMeter;
    for (const wheelOffset of [-38, 38]) {
      const wx = laneCenter + wheelOffset;
      const grad = aCtx.createLinearGradient(wx - 34, 0, wx + 34, 0);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(0.5, 'rgba(5,7,11,0.58)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      aCtx.fillStyle = grad;
      aCtx.fillRect(wx - 34, 0, 68, ASP);

      const rGrad = rCtx.createLinearGradient(wx - 30, 0, wx + 30, 0);
      rGrad.addColorStop(0, 'rgba(190,190,190,0)');
      rGrad.addColorStop(0.5, 'rgba(66,66,66,0.74)');
      rGrad.addColorStop(1, 'rgba(190,190,190,0)');
      rCtx.fillStyle = rGrad;
      rCtx.fillRect(wx - 30, 0, 60, ASP);
    }
  }

  // Glossy wet asphalt puddles/sheen patches reacting to headlights & neons
  for (let p = 0; p < 18; p++) {
    const px = 140 + Math.random() * (ASP - 280);
    const py = 120 + Math.random() * (ASP - 240);
    const rx = 55 + Math.random() * 110;
    const ry = 85 + Math.random() * 175;
    const pDark = aCtx.createRadialGradient(px, py, 8, px, py, Math.max(rx, ry));
    pDark.addColorStop(0, 'rgba(4,6,10,0.42)');
    pDark.addColorStop(0.7, 'rgba(6,8,14,0.18)');
    pDark.addColorStop(1, 'rgba(6,8,14,0)');
    aCtx.fillStyle = pDark;
    aCtx.beginPath();
    aCtx.ellipse(px, py, rx, ry, (Math.random() - 0.5) * 0.6, 0, Math.PI * 2);
    aCtx.fill();

    const pRough = rCtx.createRadialGradient(px, py, 6, px, py, Math.max(rx, ry));
    pRough.addColorStop(0, 'rgba(18,18,18,0.88)');
    pRough.addColorStop(0.65, 'rgba(34,34,34,0.58)');
    pRough.addColorStop(1, 'rgba(180,180,180,0)');
    rCtx.fillStyle = pRough;
    rCtx.beginPath();
    rCtx.ellipse(px, py, rx, ry, 0, 0, Math.PI * 2);
    rCtx.fill();
  }

  // High-frequency mineral aggregate across 2048x2048
  for (let i = 0; i < 95000; i++) {
    const x = Math.random() * ASP;
    const y = Math.random() * ASP;
    const sz = i % 9 === 0 ? 4 : i % 3 === 0 ? 3 : 2;
    aCtx.fillStyle =
      i % 3 === 0
        ? 'rgba(255,255,255,0.045)'
        : i % 3 === 1
          ? 'rgba(0,0,0,0.30)'
          : 'rgba(148,163,184,0.055)';
    aCtx.fillRect(x, y, sz, sz);

    const bv = 74 + Math.floor(Math.random() * 116);
    bCtx.fillStyle = `rgb(${bv},${bv},${bv})`;
    bCtx.fillRect(x, y, sz, sz);
  }

  // Tar-sealed micro-cracks & longitudinal rubber skid streaks
  aCtx.strokeStyle = 'rgba(3,4,6,0.78)';
  bCtx.strokeStyle = '#383838';
  rCtx.strokeStyle = '#404040';
  for (let c = 0; c < 34; c++) {
    let cx = 90 + Math.random() * (ASP - 180);
    let cy = Math.random() * ASP;
    const segs = 5 + (c % 5);
    aCtx.lineWidth = 2 + (c % 2);
    bCtx.lineWidth = 3;
    rCtx.lineWidth = 3;
    aCtx.beginPath();
    bCtx.beginPath();
    rCtx.beginPath();
    aCtx.moveTo(cx, cy);
    bCtx.moveTo(cx, cy);
    rCtx.moveTo(cx, cy);
    for (let s = 0; s < segs; s++) {
      cx += (Math.random() - 0.5) * 72;
      cy += 34 + Math.random() * 78;
      aCtx.lineTo(cx, cy);
      bCtx.lineTo(cx, cy);
      rCtx.lineTo(cx, cy);
    }
    aCtx.stroke();
    bCtx.stroke();
    rCtx.stroke();
  }

  for (let i = 0; i < 72; i++) {
    const sx = 150 + Math.random() * (ASP - 300);
    const sy = Math.random() * ASP;
    const len = 70 + Math.random() * 280;
    aCtx.fillStyle = 'rgba(3,4,7,0.38)';
    aCtx.fillRect(sx, sy, 6 + Math.random() * 6, len);
  }

  // Subtle roughness streaks for realistic road sheen
  for (let i = 0; i < 12000; i++) {
    const v = 128 + Math.floor(Math.random() * 98);
    rCtx.fillStyle = `rgba(${v},${v},${v},0.34)`;
    rCtx.fillRect(Math.random() * ASP, Math.random() * ASP, 6, 22);
  }

  // Worn thermoplastic highway lines (outer edge lines, 4 dashed dividers per side = 5 lanes/side, double amber median)
  aCtx.fillStyle = '#bac4d2';
  aCtx.fillRect(36, 0, 18, ASP);
  aCtx.fillRect(1994, 0, 18, ASP);

  const dividerPositions = [219, 405, 590, 775, 1273, 1458, 1643, 1829];
  aCtx.fillStyle = '#c2cbd8';
  for (let y = 64; y < ASP; y += 512) {
    for (const dx of dividerPositions) {
      aCtx.fillRect(dx - 7, y, 14, 272);
    }
  }

  aCtx.fillStyle = '#d97706';
  aCtx.fillRect(994, 0, 16, ASP);
  aCtx.fillRect(1038, 0, 16, ASP);

  // Micro-wear flecks over thermoplastic paint
  for (let w = 0; w < 1100; w++) {
    aCtx.fillStyle = 'rgba(18,22,30,0.42)';
    const lx = dividerPositions[w % dividerPositions.length] - 6;
    aCtx.fillRect(lx + Math.random() * 14, Math.random() * ASP, 4, 6);
  }

  rCtx.fillStyle = '#7c7c7c';
  rCtx.fillRect(36, 0, 18, ASP);
  rCtx.fillRect(1994, 0, 18, ASP);

  const asphalt = new THREE.CanvasTexture(aspCanvas);
  asphalt.colorSpace = THREE.SRGBColorSpace;
  asphalt.wrapS = THREE.RepeatWrapping;
  asphalt.wrapT = THREE.RepeatWrapping;
  asphalt.anisotropy = aniso;

  const asphaltBump = new THREE.CanvasTexture(bumpCanvas);
  asphaltBump.wrapS = THREE.RepeatWrapping;
  asphaltBump.wrapT = THREE.RepeatWrapping;
  asphaltBump.anisotropy = aniso;

  const asphaltRoughness = new THREE.CanvasTexture(roughCanvas);
  asphaltRoughness.wrapS = THREE.RepeatWrapping;
  asphaltRoughness.wrapT = THREE.RepeatWrapping;
  asphaltRoughness.anisotropy = aniso;

  // 3. 2048x2048 Ultra-HD Paddock / Parking Asphalt with Crisp White Parking Lines & Micro-Cracks
  const PSIZE = 2048;
  const parkCanvas = document.createElement('canvas');
  parkCanvas.width = PSIZE;
  parkCanvas.height = PSIZE;
  const pCtx = parkCanvas.getContext('2d')!;
  pCtx.fillStyle = '#141820';
  pCtx.fillRect(0, 0, PSIZE, PSIZE);

  for (let i = 0; i < 68000; i++) {
    pCtx.fillStyle =
      i % 3 === 0
        ? 'rgba(255,255,255,0.038)'
        : i % 3 === 1
          ? 'rgba(0,0,0,0.28)'
          : 'rgba(148,163,184,0.028)';
    pCtx.fillRect(Math.random() * PSIZE, Math.random() * PSIZE, 2 + (i % 3), 2 + (i % 2));
  }
  for (let i = 0; i < 36; i++) {
    const px = 140 + Math.random() * (PSIZE - 280);
    const py = 140 + Math.random() * (PSIZE - 280);
    const rad = 52 + Math.random() * 135;
    const wg = pCtx.createRadialGradient(px, py, 4, px, py, rad);
    wg.addColorStop(0, 'rgba(5,7,11,0.36)');
    wg.addColorStop(1, 'rgba(5,7,11,0)');
    pCtx.fillStyle = wg;
    pCtx.fillRect(px - rad, py - rad, rad * 2, rad * 2);
  }
  // Tar-sealed cracks & expansion joints
  pCtx.strokeStyle = 'rgba(0,0,0,0.26)';
  pCtx.lineWidth = 4;
  for (let x = 0; x <= PSIZE; x += 512) {
    pCtx.beginPath();
    pCtx.moveTo(x, 0);
    pCtx.lineTo(x, PSIZE);
    pCtx.stroke();
  }
  pCtx.strokeStyle = 'rgba(4,5,8,0.68)';
  pCtx.lineWidth = 2.5;
  for (let c = 0; c < 22; c++) {
    let cx = 120 + Math.random() * (PSIZE - 240);
    let cy = 120 + Math.random() * (PSIZE - 240);
    pCtx.beginPath();
    pCtx.moveTo(cx, cy);
    for (let s = 0; s < 5; s++) {
      cx += (Math.random() - 0.5) * 90;
      cy += (Math.random() - 0.5) * 90;
      pCtx.lineTo(cx, cy);
    }
    pCtx.stroke();
  }
  // Crisp matte-thermoplastic parking stall lines ("líneas blancas de aparcamiento")
  pCtx.fillStyle = 'rgba(203,213,225,0.78)';
  for (let x = 180; x <= 1860; x += 280) {
    pCtx.fillRect(x, 84, 20, 430);
    pCtx.fillRect(x, 1520, 20, 430);
  }
  for (let x = 320; x <= 1680; x += 340) {
    pCtx.fillRect(x, 770, 20, 390);
  }
  pCtx.fillRect(320, 770, 1380, 18);

  pCtx.fillStyle = 'rgba(245,158,11,0.48)';
  pCtx.fillRect(48, 1244, 520, 12);

  const parkingAsphalt = new THREE.CanvasTexture(parkCanvas);
  parkingAsphalt.colorSpace = THREE.SRGBColorSpace;
  parkingAsphalt.anisotropy = aniso;

  // 3b. 1024x1024 Direct Access Street & Crosswalk (Paso de Cebra) Connector Texture
  const cwCanvas = document.createElement('canvas');
  cwCanvas.width = 1024;
  cwCanvas.height = 1024;
  const cwCtx = cwCanvas.getContext('2d')!;
  cwCtx.fillStyle = '#181c24';
  cwCtx.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 16000; i++) {
    cwCtx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.032)' : 'rgba(0,0,0,0.22)';
    cwCtx.fillRect(Math.random() * 1024, Math.random() * 1024, 2, 2);
  }
  // Yellow center divider line running east-west (along X)
  cwCtx.fillStyle = 'rgba(245,158,11,0.85)';
  cwCtx.fillRect(0, 502, 1024, 8);
  cwCtx.fillRect(0, 514, 1024, 8);
  // Wide white pedestrian crosswalk stripes ("Paso de Cebra") along x = 260..500
  cwCtx.fillStyle = 'rgba(203,213,225,0.80)';
  for (let y = 52; y < 980; y += 92) {
    cwCtx.fillRect(260, y, 220, 52);
  }
  // Stop bars & crisp exit arrows toward Highway
  cwCtx.fillStyle = 'rgba(203,213,225,0.70)';
  cwCtx.fillRect(540, 48, 22, 420);
  cwCtx.fillRect(190, 556, 22, 420);
  for (const [ay, dir] of [
    [260, -1],
    [760, 1],
  ] as const) {
    cwCtx.beginPath();
    if (dir < 0) {
      cwCtx.moveTo(640, ay);
      cwCtx.lineTo(720, ay - 38);
      cwCtx.lineTo(720, ay - 16);
      cwCtx.lineTo(880, ay - 16);
      cwCtx.lineTo(880, ay + 16);
      cwCtx.lineTo(720, ay + 16);
      cwCtx.lineTo(720, ay + 38);
    } else {
      cwCtx.moveTo(880, ay);
      cwCtx.lineTo(800, ay - 38);
      cwCtx.lineTo(800, ay - 16);
      cwCtx.lineTo(640, ay - 16);
      cwCtx.lineTo(640, ay + 16);
      cwCtx.lineTo(800, ay + 16);
      cwCtx.lineTo(800, ay + 38);
    }
    cwCtx.closePath();
    cwCtx.fill();
  }
  const crosswalkRoad = new THREE.CanvasTexture(cwCanvas);
  crosswalkRoad.colorSpace = THREE.SRGBColorSpace;
  crosswalkRoad.anisotropy = aniso;

  // 3c. 1024x1024 Two-Lane Paved Ramp Street connecting Highway & Parking
  const rampCanvas = document.createElement('canvas');
  rampCanvas.width = 1024;
  rampCanvas.height = 1024;
  const rmCtx = rampCanvas.getContext('2d')!;
  rmCtx.fillStyle = '#151922';
  rmCtx.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 24000; i++) {
    rmCtx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.036)' : 'rgba(0,0,0,0.24)';
    rmCtx.fillRect(Math.random() * 1024, Math.random() * 1024, 2, 2);
  }
  // Crisp white outer edge lines (left & right curb lines)
  rmCtx.fillStyle = '#e2e8f0';
  rmCtx.fillRect(26, 0, 16, 1024);
  rmCtx.fillRect(982, 0, 16, 1024);
  // Center dashed white lane divider separating Up (-Z) and Down (+Z) lanes
  rmCtx.fillStyle = 'rgba(241,245,249,0.86)';
  for (let y = 32; y < 1024; y += 256) {
    rmCtx.fillRect(458, y, 14, 136);
  }
  // Right-side "Cebreado Blanco" merge shoulder (x = 815 .. 982) bounded by solid white line
  rmCtx.fillStyle = '#cbd5e1';
  rmCtx.fillRect(800, 0, 14, 1024);
  rmCtx.save();
  rmCtx.beginPath();
  rmCtx.rect(814, 0, 168, 1024);
  rmCtx.clip();
  rmCtx.fillStyle = 'rgba(203,213,225,0.78)';
  for (let y = -320; y < 1340; y += 128) {
    rmCtx.beginPath();
    rmCtx.moveTo(810, y);
    rmCtx.lineTo(990, y + 145);
    rmCtx.lineTo(990, y + 195);
    rmCtx.lineTo(810, y + 50);
    rmCtx.closePath();
    rmCtx.fill();
  }
  rmCtx.restore();
  // Bidirectional lane arrows: left lane up (-Z to Highway), right lane down (+Z to Parking)
  rmCtx.fillStyle = 'rgba(241,245,249,0.82)';
  for (const ay of [260, 770]) {
    const axUp = 245;
    rmCtx.beginPath();
    rmCtx.moveTo(axUp, ay - 78);
    rmCtx.lineTo(axUp - 34, ay - 22);
    rmCtx.lineTo(axUp - 12, ay - 22);
    rmCtx.lineTo(axUp - 12, ay + 68);
    rmCtx.lineTo(axUp + 12, ay + 68);
    rmCtx.lineTo(axUp + 12, ay - 22);
    rmCtx.lineTo(axUp + 34, ay - 22);
    rmCtx.closePath();
    rmCtx.fill();

    const axDown = 635;
    rmCtx.beginPath();
    rmCtx.moveTo(axDown, ay + 78);
    rmCtx.lineTo(axDown - 34, ay + 22);
    rmCtx.lineTo(axDown - 12, ay + 22);
    rmCtx.lineTo(axDown - 12, ay - 68);
    rmCtx.lineTo(axDown + 12, ay - 68);
    rmCtx.lineTo(axDown + 12, ay + 22);
    rmCtx.lineTo(axDown + 34, ay + 22);
    rmCtx.closePath();
    rmCtx.fill();
  }
  const rampChevronRoad = new THREE.CanvasTexture(rampCanvas);
  rampChevronRoad.colorSpace = THREE.SRGBColorSpace;
  rampChevronRoad.wrapS = THREE.ClampToEdgeWrapping;
  rampChevronRoad.wrapT = THREE.RepeatWrapping;
  rampChevronRoad.anisotropy = aniso;

  // 3d. Gore Diagonal White Chevron Hatch Marking Texture (transparent overlay on asphalt)
  const goreCanvas = document.createElement('canvas');
  goreCanvas.width = 512;
  goreCanvas.height = 512;
  const gCtx = goreCanvas.getContext('2d')!;
  gCtx.clearRect(0, 0, 512, 512);
  gCtx.fillStyle = 'rgba(203,213,225,0.82)';
  gCtx.fillRect(0, 0, 16, 512);
  gCtx.fillRect(496, 0, 16, 512);
  for (let y = -256; y < 768; y += 96) {
    gCtx.beginPath();
    gCtx.moveTo(16, y);
    gCtx.lineTo(496, y + 220);
    gCtx.lineTo(496, y + 264);
    gCtx.lineTo(16, y + 44);
    gCtx.closePath();
    gCtx.fill();
  }
  const goreChevronTex = new THREE.CanvasTexture(goreCanvas);
  goreChevronTex.colorSpace = THREE.SRGBColorSpace;
  goreChevronTex.wrapS = THREE.ClampToEdgeWrapping;
  goreChevronTex.wrapT = THREE.RepeatWrapping;
  goreChevronTex.anisotropy = aniso;

  // 4. 1024x1024 Clean Light-Gray Industrial Epoxy Floor with Crisp Blue Lines (Taller de Personalización)
  const tallerCanvas = document.createElement('canvas');
  tallerCanvas.width = 1024;
  tallerCanvas.height = 1024;
  const tCtx = tallerCanvas.getContext('2d')!;

  const tallerRoughCanvas = document.createElement('canvas');
  tallerRoughCanvas.width = 1024;
  tallerRoughCanvas.height = 1024;
  const trCtx = tallerRoughCanvas.getContext('2d')!;

  tCtx.fillStyle = '#bcc6d4';
  tCtx.fillRect(0, 0, 1024, 1024);
  trCtx.fillStyle = '#363636'; // glossy polished epoxy resin base
  trCtx.fillRect(0, 0, 1024, 1024);

  // Fine mineral epoxy speckle
  for (let i = 0; i < 14000; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 1024;
    tCtx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.16)' : 'rgba(51,65,85,0.10)';
    tCtx.fillRect(x, y, 2, 2);
    const rv = 36 + Math.floor(Math.random() * 38);
    trCtx.fillStyle = `rgb(${rv},${rv},${rv})`;
    trCtx.fillRect(x, y, 3, 3);
  }
  // Expansion joint grid + matte seams
  tCtx.strokeStyle = 'rgba(71,85,105,0.28)';
  tCtx.lineWidth = 3;
  trCtx.strokeStyle = '#909090';
  trCtx.lineWidth = 4;
  for (let g = 0; g <= 1024; g += 256) {
    tCtx.beginPath();
    tCtx.moveTo(g, 0);
    tCtx.lineTo(g, 1024);
    tCtx.stroke();
    tCtx.beginPath();
    tCtx.moveTo(0, g);
    tCtx.lineTo(1024, g);
    tCtx.stroke();

    trCtx.beginPath();
    trCtx.moveTo(g, 0);
    trCtx.lineTo(g, 1024);
    trCtx.stroke();
    trCtx.beginPath();
    trCtx.moveTo(0, g);
    trCtx.lineTo(1024, g);
    trCtx.stroke();
  }
  // Crisp blue safety/bay guide stripes ("líneas azules")
  tCtx.fillStyle = '#2563eb';
  tCtx.fillRect(0, 38, 1024, 22);
  tCtx.fillRect(0, 964, 1024, 22);
  tCtx.fillRect(42, 0, 18, 1024);
  tCtx.fillRect(964, 0, 18, 1024);
  tCtx.fillStyle = 'rgba(37,99,235,0.32)';
  tCtx.fillRect(0, 504, 1024, 16);

  const tallerFloor = new THREE.CanvasTexture(tallerCanvas);
  tallerFloor.colorSpace = THREE.SRGBColorSpace;
  tallerFloor.wrapS = THREE.RepeatWrapping;
  tallerFloor.wrapT = THREE.RepeatWrapping;
  tallerFloor.repeat.set(3, 1);
  tallerFloor.anisotropy = aniso;

  const tallerFloorRoughness = new THREE.CanvasTexture(tallerRoughCanvas);
  tallerFloorRoughness.wrapS = THREE.RepeatWrapping;
  tallerFloorRoughness.wrapT = THREE.RepeatWrapping;
  tallerFloorRoughness.repeat.set(3, 1);
  tallerFloorRoughness.anisotropy = aniso;

  // 5. 1024x1024 Polished Architectural Porcelain Floor (Concesionario)
  const floorCanvas = document.createElement('canvas');
  floorCanvas.width = 1024;
  floorCanvas.height = 1024;
  const fCtx = floorCanvas.getContext('2d')!;

  const floorRoughCanvas = document.createElement('canvas');
  floorRoughCanvas.width = 1024;
  floorRoughCanvas.height = 1024;
  const frCtx = floorRoughCanvas.getContext('2d')!;

  fCtx.fillStyle = '#0c1017';
  fCtx.fillRect(0, 0, 1024, 1024);
  frCtx.fillStyle = '#202020'; // mirror-polished porcelain tiles
  frCtx.fillRect(0, 0, 1024, 1024);

  // Subtle natural stone/porcelain veining inside each 256x256 slab
  for (let ty = 0; ty < 1024; ty += 256) {
    for (let tx = 0; tx < 1024; tx += 256) {
      const shade = 14 + (((tx + ty) / 256) % 3) * 3;
      fCtx.fillStyle = `rgb(${shade},${shade + 4},${shade + 10})`;
      fCtx.fillRect(tx + 3, ty + 3, 250, 250);
      fCtx.strokeStyle = 'rgba(226,232,240,0.035)';
      fCtx.lineWidth = 2;
      fCtx.beginPath();
      fCtx.moveTo(tx + 24, ty + 210);
      fCtx.bezierCurveTo(tx + 96, ty + 140, tx + 160, ty + 180, tx + 230, ty + 60);
      fCtx.stroke();
    }
  }
  // Grout seams
  fCtx.strokeStyle = 'rgba(255,255,255,0.065)';
  fCtx.lineWidth = 3;
  frCtx.strokeStyle = '#909090';
  frCtx.lineWidth = 4;
  for (let g = 0; g <= 1024; g += 256) {
    fCtx.beginPath();
    fCtx.moveTo(g, 0);
    fCtx.lineTo(g, 1024);
    fCtx.stroke();
    fCtx.beginPath();
    fCtx.moveTo(0, g);
    fCtx.lineTo(1024, g);
    fCtx.stroke();

    frCtx.beginPath();
    frCtx.moveTo(g, 0);
    frCtx.lineTo(g, 1024);
    frCtx.stroke();
    frCtx.beginPath();
    frCtx.moveTo(0, g);
    frCtx.lineTo(1024, g);
    frCtx.stroke();
  }

  const showroomFloor = new THREE.CanvasTexture(floorCanvas);
  showroomFloor.colorSpace = THREE.SRGBColorSpace;
  showroomFloor.wrapS = THREE.RepeatWrapping;
  showroomFloor.wrapT = THREE.RepeatWrapping;
  showroomFloor.repeat.set(5, 6);
  showroomFloor.anisotropy = aniso;

  const showroomFloorRoughness = new THREE.CanvasTexture(floorRoughCanvas);
  showroomFloorRoughness.wrapS = THREE.RepeatWrapping;
  showroomFloorRoughness.wrapT = THREE.RepeatWrapping;
  showroomFloorRoughness.repeat.set(5, 6);
  showroomFloorRoughness.anisotropy = aniso;

  // 6. Radial Underglow & Contact Shadow
  const ugCanvas = document.createElement('canvas');
  ugCanvas.width = 256;
  ugCanvas.height = 256;
  const uCtx = ugCanvas.getContext('2d')!;
  const ugGrad = uCtx.createRadialGradient(128, 128, 14, 128, 128, 126);
  ugGrad.addColorStop(0, 'rgba(255,255,255,0.95)');
  ugGrad.addColorStop(0.45, 'rgba(255,255,255,0.55)');
  ugGrad.addColorStop(1, 'rgba(255,255,255,0)');
  uCtx.fillStyle = ugGrad;
  uCtx.fillRect(0, 0, 256, 256);
  const underglowRadial = new THREE.CanvasTexture(ugCanvas);
  underglowRadial.colorSpace = THREE.SRGBColorSpace;

  const csCanvas = document.createElement('canvas');
  csCanvas.width = 256;
  csCanvas.height = 256;
  const csCtx = csCanvas.getContext('2d')!;
  const csGrad = csCtx.createRadialGradient(128, 128, 20, 128, 128, 124);
  csGrad.addColorStop(0, 'rgba(0,0,0,0.85)');
  csGrad.addColorStop(0.55, 'rgba(0,0,0,0.48)');
  csGrad.addColorStop(1, 'rgba(0,0,0,0)');
  csCtx.fillStyle = csGrad;
  csCtx.fillRect(0, 0, 256, 256);
  const contactShadow = new THREE.CanvasTexture(csCanvas);

  // 7. 1024x1024 Modern Architectural Glass Curtain-Wall Skyscraper Maps
  const skyDiffCanvas = document.createElement('canvas');
  skyDiffCanvas.width = 1024;
  skyDiffCanvas.height = 1024;
  const sdCtx = skyDiffCanvas.getContext('2d')!;

  const skyEmisCanvas = document.createElement('canvas');
  skyEmisCanvas.width = 1024;
  skyEmisCanvas.height = 1024;
  const seCtx = skyEmisCanvas.getContext('2d')!;

  const skyRoughCanvas = document.createElement('canvas');
  skyRoughCanvas.width = 1024;
  skyRoughCanvas.height = 1024;
  const srCtx = skyRoughCanvas.getContext('2d')!;

  sdCtx.fillStyle = '#0c1118';
  sdCtx.fillRect(0, 0, 1024, 1024);
  seCtx.fillStyle = '#000000';
  seCtx.fillRect(0, 0, 1024, 1024);
  srCtx.fillStyle = '#999999';
  srCtx.fillRect(0, 0, 1024, 1024);

  const cols = 16;
  const rows = 32;
  const cellW = 1024 / cols;
  const cellH = 1024 / rows;

  for (let r = 0; r < rows; r++) {
    const floorLitRatio = 0.25 + ((r * 7) % 10) * 0.048;
    for (let c = 0; c < cols; c++) {
      const px = c * cellW + 5;
      const py = r * cellH + 5;
      const pw = cellW - 10;
      const ph = cellH - 10;

      sdCtx.fillStyle = '#141e2c';
      sdCtx.fillRect(px, py, pw, ph);

      srCtx.fillStyle = '#202020';
      srCtx.fillRect(px, py, pw, ph);

      const hash = Math.sin(r * 31.7 + c * 17.3) * 43758.5453;
      const rnd = hash - Math.floor(hash);
      if (rnd < floorLitRatio) {
        const tone =
          rnd < 0.14
            ? 'rgba(253, 230, 178, 0.86)'
            : rnd < 0.26
              ? 'rgba(226, 236, 248, 0.72)'
              : 'rgba(191, 219, 254, 0.45)';
        seCtx.fillStyle = tone;
        seCtx.fillRect(px, py, pw, ph);
        // Subtle window blind line
        seCtx.fillStyle = 'rgba(0,0,0,0.22)';
        seCtx.fillRect(px, py + ph * 0.55, pw, 2);
      }
    }
    sdCtx.fillStyle = '#080b10';
    sdCtx.fillRect(0, r * cellH, 1024, 4);
  }

  const skyscraperFacade = new THREE.CanvasTexture(skyDiffCanvas);
  skyscraperFacade.colorSpace = THREE.SRGBColorSpace;
  skyscraperFacade.wrapS = THREE.RepeatWrapping;
  skyscraperFacade.wrapT = THREE.RepeatWrapping;
  skyscraperFacade.anisotropy = aniso;

  const skyscraperEmissive = new THREE.CanvasTexture(skyEmisCanvas);
  skyscraperEmissive.colorSpace = THREE.SRGBColorSpace;
  skyscraperEmissive.wrapS = THREE.RepeatWrapping;
  skyscraperEmissive.wrapT = THREE.RepeatWrapping;
  skyscraperEmissive.anisotropy = aniso;

  const skyscraperRoughness = new THREE.CanvasTexture(skyRoughCanvas);
  skyscraperRoughness.wrapS = THREE.RepeatWrapping;
  skyscraperRoughness.wrapT = THREE.RepeatWrapping;
  skyscraperRoughness.anisotropy = aniso;

  // 8. Cast Concrete Acoustic Barrier Texture (1024x1024)
  const concCanvas = document.createElement('canvas');
  concCanvas.width = 1024;
  concCanvas.height = 1024;
  const ccCtx = concCanvas.getContext('2d')!;
  ccCtx.fillStyle = '#242933';
  ccCtx.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 18000; i++) {
    ccCtx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.16)';
    ccCtx.fillRect(Math.random() * 1024, Math.random() * 1024, 3, 3);
  }
  ccCtx.strokeStyle = 'rgba(10,12,16,0.7)';
  ccCtx.lineWidth = 6;
  for (let x = 0; x <= 1024; x += 256) {
    ccCtx.beginPath();
    ccCtx.moveTo(x, 0);
    ccCtx.lineTo(x, 1024);
    ccCtx.stroke();
  }
  const concreteBarrier = new THREE.CanvasTexture(concCanvas);
  concreteBarrier.colorSpace = THREE.SRGBColorSpace;
  concreteBarrier.wrapS = THREE.RepeatWrapping;
  concreteBarrier.wrapT = THREE.RepeatWrapping;
  concreteBarrier.anisotropy = aniso;

  // 9. Illuminated Expressway Gantry Signs & Complex Signs
  const highwaySign1 = createExpresswaySignTexture(
    'B',
    '#dc2626',
    'WANGAN LOOP',
    'CIRCUITO CERRADO · SHIBAURA · GINZA'
  );
  highwaySign1.anisotropy = aniso;

  const highwaySign2 = createExpresswaySignTexture(
    'C1',
    '#2563eb',
    'SALIDA PARKING / TALLER',
    'RAMPA DERECHA · CONCESIONARIO'
  );
  highwaySign2.anisotropy = aniso;

  // Illuminated Median Opening U-Turn / Crossover Arrow Sign
  const medCanvas = document.createElement('canvas');
  medCanvas.width = 512;
  medCanvas.height = 256;
  const mCtx = medCanvas.getContext('2d')!;
  mCtx.fillStyle = '#0b1220';
  mCtx.fillRect(0, 0, 512, 256);
  mCtx.strokeStyle = '#f59e0b';
  mCtx.lineWidth = 10;
  mCtx.strokeRect(8, 8, 496, 240);
  // Crisp double-headed crossover/U-turn arrows
  mCtx.fillStyle = '#f8fafc';
  mCtx.beginPath();
  mCtx.moveTo(72, 108);
  mCtx.lineTo(136, 58);
  mCtx.lineTo(136, 88);
  mCtx.lineTo(376, 88);
  mCtx.lineTo(376, 58);
  mCtx.lineTo(440, 108);
  mCtx.lineTo(376, 158);
  mCtx.lineTo(376, 128);
  mCtx.lineTo(136, 128);
  mCtx.lineTo(136, 158);
  mCtx.closePath();
  mCtx.fill();
  mCtx.fillStyle = '#fbbf24';
  mCtx.font = '700 42px "Barlow Condensed", sans-serif';
  mCtx.textAlign = 'center';
  mCtx.textBaseline = 'middle';
  mCtx.fillText('PASO MEDIANA · GIRO', 256, 204);
  const medianSign = new THREE.CanvasTexture(medCanvas);
  medianSign.colorSpace = THREE.SRGBColorSpace;
  medianSign.anisotropy = aniso;

  // 5b. 1024x1024 Light Oak Hardwood Plank Floor ("Suelo de madera clara") for VIP Concesionario
  const woodCanvas = document.createElement('canvas');
  woodCanvas.width = 1024;
  woodCanvas.height = 1024;
  const wCtx = woodCanvas.getContext('2d')!;

  const woodRoughCanvas = document.createElement('canvas');
  woodRoughCanvas.width = 1024;
  woodRoughCanvas.height = 1024;
  const wrCtx = woodRoughCanvas.getContext('2d')!;

  wCtx.fillStyle = '#b98b5b';
  wCtx.fillRect(0, 0, 1024, 1024);
  wrCtx.fillStyle = '#4e4e4e';
  wrCtx.fillRect(0, 0, 1024, 1024);

  const plankH = 64;
  const plankW = 256;
  for (let row = 0; row < 1024 / plankH; row++) {
    const offset = (row % 2) * (plankW * 0.5);
    for (let col = -1; col <= 1024 / plankW; col++) {
      const px = col * plankW + offset;
      const py = row * plankH;
      const toneShift = (((row * 7 + col * 13) % 5) - 2) * 7;
      const r = Math.min(235, Math.max(150, 192 + toneShift));
      const g = Math.min(200, Math.max(115, 148 + toneShift));
      const b = Math.min(160, Math.max(82, 102 + Math.round(toneShift * 0.7)));
      wCtx.fillStyle = `rgb(${r},${g},${b})`;
      wCtx.fillRect(px + 2, py + 2, plankW - 4, plankH - 4);

      const roughV = 64 + ((row * 5 + col * 9) % 28);
      wrCtx.fillStyle = `rgb(${roughV},${roughV},${roughV})`;
      wrCtx.fillRect(px + 2, py + 2, plankW - 4, plankH - 4);

      // Subtle wood grain fibers
      wCtx.fillStyle = 'rgba(82,52,26,0.12)';
      for (let gLine = 0; gLine < 6; gLine++) {
        const gy = py + 8 + gLine * 9 + ((col + gLine) % 3);
        wCtx.fillRect(px + 6, gy, plankW - 12, 2);
      }
    }
    wCtx.fillStyle = 'rgba(42,26,12,0.52)';
    wCtx.fillRect(0, row * plankH, 1024, 3);
  }
  const woodFloor = new THREE.CanvasTexture(woodCanvas);
  woodFloor.colorSpace = THREE.SRGBColorSpace;
  woodFloor.wrapS = THREE.RepeatWrapping;
  woodFloor.wrapT = THREE.RepeatWrapping;
  woodFloor.repeat.set(4, 4);
  woodFloor.anisotropy = aniso;

  const woodFloorRoughness = new THREE.CanvasTexture(woodRoughCanvas);
  woodFloorRoughness.wrapS = THREE.RepeatWrapping;
  woodFloorRoughness.wrapT = THREE.RepeatWrapping;
  woodFloorRoughness.repeat.set(4, 4);
  woodFloorRoughness.anisotropy = aniso;

  // 8b. 512x512 Dark-Green Metallic Wire-Mesh Fence Texture (with transparent diamond cutouts)
  const fenceCanvas = document.createElement('canvas');
  fenceCanvas.width = 512;
  fenceCanvas.height = 512;
  const fnCtx = fenceCanvas.getContext('2d')!;
  fnCtx.clearRect(0, 0, 512, 512);
  fnCtx.strokeStyle = '#14532d';
  fnCtx.lineWidth = 7;
  const step = 32;
  for (let i = -512; i <= 1024; i += step) {
    fnCtx.beginPath();
    fnCtx.moveTo(i, 0);
    fnCtx.lineTo(i + 512, 512);
    fnCtx.stroke();

    fnCtx.beginPath();
    fnCtx.moveTo(i, 512);
    fnCtx.lineTo(i + 512, 0);
    fnCtx.stroke();
  }
  // Top and bottom green steel rails
  fnCtx.fillStyle = '#0f3d21';
  fnCtx.fillRect(0, 0, 512, 18);
  fnCtx.fillRect(0, 494, 512, 18);
  const chainLinkFence = new THREE.CanvasTexture(fenceCanvas);
  chainLinkFence.colorSpace = THREE.SRGBColorSpace;
  chainLinkFence.wrapS = THREE.RepeatWrapping;
  chainLinkFence.wrapT = THREE.ClampToEdgeWrapping;
  chainLinkFence.repeat.set(16, 1);
  chainLinkFence.anisotropy = aniso;

  // Rooftop Matte-Black Industrial Sign: "78 · GHOST GARAGE"
  const tunerSignCanvas = document.createElement('canvas');
  tunerSignCanvas.width = 1024;
  tunerSignCanvas.height = 256;
  const tsCtx = tunerSignCanvas.getContext('2d')!;
  tsCtx.fillStyle = '#07090d';
  tsCtx.fillRect(0, 0, 1024, 256);
  tsCtx.strokeStyle = 'rgba(203,213,225,0.22)';
  tsCtx.lineWidth = 4;
  tsCtx.strokeRect(8, 8, 1008, 240);
  tsCtx.fillStyle = '#e10600';
  tsCtx.fillRect(36, 40, 178, 176);
  tsCtx.fillStyle = '#e2e8f0';
  tsCtx.font = '800 108px "Barlow Condensed", sans-serif';
  tsCtx.textAlign = 'center';
  tsCtx.textBaseline = 'middle';
  tsCtx.fillText('78', 125, 134);
  tsCtx.textAlign = 'left';
  tsCtx.fillStyle = '#dde4ee';
  tsCtx.font = '800 84px "Barlow Condensed", sans-serif';
  tsCtx.fillText('GHOST GARAGE', 248, 104);
  tsCtx.fillStyle = '#22d3ee';
  tsCtx.font = '600 28px "Plus Jakarta Sans", sans-serif';
  tsCtx.fillText('TALLER DE PERSONALIZACIÓN · CDI RACING · STAGE 1-3', 250, 184);
  const hangarSign = new THREE.CanvasTexture(tunerSignCanvas);
  hangarSign.colorSpace = THREE.SRGBColorSpace;
  hangarSign.anisotropy = aniso;

  // Dedicated Luminous "78" Emblem Sign
  const n78Canvas = document.createElement('canvas');
  n78Canvas.width = 512;
  n78Canvas.height = 384;
  const nCtx = n78Canvas.getContext('2d')!;
  nCtx.fillStyle = '#090b10';
  nCtx.fillRect(0, 0, 512, 384);
  nCtx.strokeStyle = '#ef4444';
  nCtx.lineWidth = 14;
  nCtx.strokeRect(10, 10, 492, 364);
  nCtx.fillStyle = '#dde4ee';
  nCtx.font = '900 245px "Barlow Condensed", sans-serif';
  nCtx.textAlign = 'center';
  nCtx.textBaseline = 'middle';
  nCtx.fillText('78', 256, 206);
  const number78Sign = new THREE.CanvasTexture(n78Canvas);
  number78Sign.colorSpace = THREE.SRGBColorSpace;
  number78Sign.anisotropy = aniso;

  const ghostGarageSign = createSignTexture(
    'GHOST GARAGE',
    'ACCESO VIP CONCESIONARIO · BAHÍAS 01 - 03',
    '#06b6d4'
  );
  ghostGarageSign.anisotropy = aniso;

  const tallerWallSign = createSignTexture(
    'PERSONALIZACIÓN',
    'RENDIMIENTO · COSMÉTICA · PINTURA Y TINTE',
    '#2563eb'
  );
  tallerWallSign.anisotropy = aniso;

  const dealershipSign = createSignTexture(
    'CONCESIONARIO',
    'SALA VIP · CATÁLOGO OFICIAL · 9 MODELOS',
    '#10b981'
  );
  dealershipSign.anisotropy = aniso;

  // Giant Esplanade Leaderboard Billboard ("Mejores pilotos a nivel mundial")
  const lbCanvas = document.createElement('canvas');
  lbCanvas.width = 1024;
  lbCanvas.height = 1024;
  const lbCtx = lbCanvas.getContext('2d')!;
  lbCtx.fillStyle = '#080b12';
  lbCtx.fillRect(0, 0, 1024, 1024);
  lbCtx.strokeStyle = '#06b6d4';
  lbCtx.lineWidth = 10;
  lbCtx.strokeRect(14, 14, 996, 996);

  // Header band
  lbCtx.fillStyle = '#0f172a';
  lbCtx.fillRect(20, 20, 984, 175);
  lbCtx.fillStyle = '#bef200';
  lbCtx.fillRect(20, 186, 984, 8);
  lbCtx.fillStyle = '#f8fafc';
  lbCtx.font = '800 58px "Barlow Condensed", sans-serif';
  lbCtx.textAlign = 'center';
  lbCtx.textBaseline = 'middle';
  lbCtx.fillText('MEJORES PILOTOS A NIVEL MUNDIAL', 512, 86);
  lbCtx.fillStyle = '#22d3ee';
  lbCtx.font = '600 28px "Plus Jakarta Sans", sans-serif';
  lbCtx.fillText('WANGAN LOOP · RÉCORD OFICIAL GHOST DRIVER', 512, 146);

  // Leaderboard rows
  const leaders = [
    { rank: '#1', name: 'AKIRA_R34', car: 'Annis Elegy R34 · 985 HP', speed: '348 km/h', pts: '482,900' },
    { rank: '#2', name: 'SMOKEY_V12', car: 'Grotti LaFuria · 1,180 HP', speed: '389 km/h', pts: '451,400' },
    { rank: '#3', name: 'KEISUKE_A90', car: 'Karin Supra MK5 · 740 HP', speed: '332 km/h', pts: '398,250' },
    { rank: '#4', name: 'NOCTURNE_GT3', car: 'Pfister Comet GT3 · 690 HP', speed: '326 km/h', pts: '364,800' },
    { rank: '#5', name: 'GHOST_078', car: 'Benefactor AMG-GT · 860 HP', speed: '341 km/h', pts: '342,100' },
    { rank: '#6', name: 'TAKUMI_K8', car: 'Karin Kuruma 08 · 310 HP', speed: '268 km/h', pts: '289,500' },
  ];
  leaders.forEach((row, i) => {
    const ry = 232 + i * 124;
    lbCtx.fillStyle = i === 0 ? 'rgba(190,242,0,0.12)' : i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'rgba(15,23,42,0.75)';
    lbCtx.fillRect(38, ry, 948, 106);
    lbCtx.strokeStyle = i === 0 ? '#bef200' : 'rgba(255,255,255,0.10)';
    lbCtx.lineWidth = 2;
    lbCtx.strokeRect(38, ry, 948, 106);

    lbCtx.textAlign = 'left';
    lbCtx.fillStyle = i === 0 ? '#bef200' : i === 1 ? '#22d3ee' : '#f8fafc';
    lbCtx.font = '800 46px "Barlow Condensed", sans-serif';
    lbCtx.fillText(row.rank, 66, ry + 54);

    lbCtx.fillStyle = '#ffffff';
    lbCtx.font = '700 42px "Barlow Condensed", sans-serif';
    lbCtx.fillText(row.name, 148, ry + 40);

    lbCtx.fillStyle = '#94a3b8';
    lbCtx.font = '500 24px "Plus Jakarta Sans", sans-serif';
    lbCtx.fillText(row.car, 148, ry + 78);

    lbCtx.textAlign = 'right';
    lbCtx.fillStyle = '#38bdf8';
    lbCtx.font = '700 32px "Barlow Condensed", sans-serif';
    lbCtx.fillText(row.speed, 750, ry + 54);

    lbCtx.fillStyle = '#bef200';
    lbCtx.font = '800 42px "Barlow Condensed", sans-serif';
    lbCtx.fillText(row.pts, 956, ry + 54);
  });
  const leaderboardSign = new THREE.CanvasTexture(lbCanvas);
  leaderboardSign.colorSpace = THREE.SRGBColorSpace;
  leaderboardSign.anisotropy = aniso;

  // Framed Automotive Artworks ("Cuadros de coches") for Dealership interior walls
  const makeCarPoster = (bg1: string, bg2: string, carColor: string, caption: string) => {
    const cv = document.createElement('canvas');
    cv.width = 512;
    cv.height = 384;
    const ctx = cv.getContext('2d')!;
    const grad = ctx.createLinearGradient(0, 0, 512, 384);
    grad.addColorStop(0, bg1);
    grad.addColorStop(1, bg2);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 384);

    // Stylized silhouette coupe profile
    ctx.fillStyle = carColor;
    ctx.beginPath();
    ctx.moveTo(64, 245);
    ctx.lineTo(95, 198);
    ctx.lineTo(178, 178);
    ctx.lineTo(252, 134);
    ctx.lineTo(356, 136);
    ctx.lineTo(426, 186);
    ctx.lineTo(454, 214);
    ctx.lineTo(446, 250);
    ctx.closePath();
    ctx.fill();

    // Wheels
    ctx.fillStyle = '#090b10';
    ctx.beginPath();
    ctx.arc(148, 250, 34, 0, Math.PI * 2);
    ctx.arc(368, 250, 34, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(148, 250, 20, 0, Math.PI * 2);
    ctx.arc(368, 250, 20, 0, Math.PI * 2);
    ctx.stroke();

    // Frame & caption
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 18;
    ctx.strokeRect(9, 9, 494, 366);
    ctx.fillStyle = '#f8fafc';
    ctx.font = '700 32px "Barlow Condensed", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(caption, 256, 332);

    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  };

  const carPoster1 = makeCarPoster('#0f172a', '#1e293b', '#ef4444', 'PFISTER GT3 · WANGAN EDITION');
  const carPoster2 = makeCarPoster('#111827', '#0c4a6e', '#38bdf8', 'ANNIS R34 · NIGHT RUNNER');

  // 10. Motorsport Tire Tread & Tread Bump (512x512 seamless directional V-groove)
  const treadCv = document.createElement('canvas');
  treadCv.width = 512;
  treadCv.height = 512;
  const tdCtx = treadCv.getContext('2d')!;
  const treadBumpCv = document.createElement('canvas');
  treadBumpCv.width = 512;
  treadBumpCv.height = 512;
  const tbCtx = treadBumpCv.getContext('2d')!;

  tdCtx.fillStyle = '#15171c';
  tdCtx.fillRect(0, 0, 512, 512);
  tbCtx.fillStyle = '#d4d4d4';
  tbCtx.fillRect(0, 0, 512, 512);

  // Circumferential drainage channels + V-sipes
  tdCtx.fillStyle = '#07080b';
  tbCtx.fillRect(164, 0, 18, 512);
  tdCtx.fillRect(248, 0, 16, 512);
  tdCtx.fillRect(330, 0, 18, 512);
  tbCtx.fillStyle = '#202020';
  tbCtx.fillRect(164, 0, 18, 512);
  tbCtx.fillRect(248, 0, 16, 512);
  tbCtx.fillRect(330, 0, 18, 512);

  tdCtx.strokeStyle = '#08090c';
  tbCtx.strokeStyle = '#242424';
  tdCtx.lineWidth = 10;
  tbCtx.lineWidth = 10;
  for (let y = -64; y < 576; y += 44) {
    tdCtx.beginPath();
    tdCtx.moveTo(40, y);
    tdCtx.lineTo(164, y + 32);
    tdCtx.moveTo(472, y);
    tdCtx.lineTo(348, y + 32);
    tdCtx.stroke();

    tbCtx.beginPath();
    tbCtx.moveTo(40, y);
    tbCtx.lineTo(164, y + 32);
    tbCtx.moveTo(472, y);
    tbCtx.lineTo(348, y + 32);
    tbCtx.stroke();
  }
  for (let i = 0; i < 6500; i++) {
    tdCtx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.22)';
    tdCtx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
  }

  const tireTread = new THREE.CanvasTexture(treadCv);
  tireTread.colorSpace = THREE.SRGBColorSpace;
  tireTread.wrapS = THREE.RepeatWrapping;
  tireTread.wrapT = THREE.RepeatWrapping;
  tireTread.repeat.set(1, 5);
  tireTread.anisotropy = aniso;

  const tireTreadBump = new THREE.CanvasTexture(treadBumpCv);
  tireTreadBump.wrapS = THREE.RepeatWrapping;
  tireTreadBump.wrapT = THREE.RepeatWrapping;
  tireTreadBump.repeat.set(1, 5);
  tireTreadBump.anisotropy = aniso;

  // 11. White Motorsport Tire Sidewall Decal Ring (512x512 transparent, cleanly outside rim lip)
  const swCv = document.createElement('canvas');
  swCv.width = 512;
  swCv.height = 512;
  const swCtx = swCv.getContext('2d')!;
  swCtx.clearRect(0, 0, 512, 512);
  swCtx.save();
  swCtx.translate(256, 256);
  swCtx.strokeStyle = 'rgba(255,255,255,0.14)';
  swCtx.lineWidth = 2.5;
  swCtx.beginPath();
  swCtx.arc(0, 0, 214, 0, Math.PI * 2);
  swCtx.stroke();

  const drawArcLabel = (text: string, startAngle: number, radius: number, color: string) => {
    swCtx.fillStyle = color;
    swCtx.font = '800 22px "Barlow Condensed", sans-serif';
    swCtx.textAlign = 'center';
    swCtx.textBaseline = 'middle';
    const step = 0.082;
    for (let i = 0; i < text.length; i++) {
      const ang = startAngle + i * step;
      swCtx.save();
      swCtx.rotate(ang);
      swCtx.translate(0, -radius);
      swCtx.fillText(text[i], 0, 0);
      swCtx.restore();
    }
  };
  drawArcLabel('WANGAN PRO', -0.40, 214, '#f8fafc');
  drawArcLabel('GHOST SPEC', Math.PI - 0.40, 214, '#ef4444');
  swCtx.restore();
  const tireSidewall = new THREE.CanvasTexture(swCv);
  tireSidewall.colorSpace = THREE.SRGBColorSpace;
  tireSidewall.anisotropy = aniso;

  // 12. Cross-Drilled & Slotted Carbon-Metallic Brake Rotor (512x512)
  const rotCv = document.createElement('canvas');
  rotCv.width = 512;
  rotCv.height = 512;
  const rtCtx = rotCv.getContext('2d')!;
  rtCtx.fillStyle = '#7b8594';
  rtCtx.fillRect(0, 0, 512, 512);
  const rotGrad = rtCtx.createRadialGradient(256, 256, 65, 256, 256, 250);
  rotGrad.addColorStop(0, '#1f2937');
  rotGrad.addColorStop(0.32, '#334155');
  rotGrad.addColorStop(0.36, '#94a3b8');
  rotGrad.addColorStop(0.75, '#cbd5e1');
  rotGrad.addColorStop(1, '#64748b');
  rtCtx.fillStyle = rotGrad;
  rtCtx.fillRect(0, 0, 512, 512);

  // Concentric brushed machining grooves
  rtCtx.strokeStyle = 'rgba(15,23,42,0.22)';
  rtCtx.lineWidth = 2;
  for (let r = 100; r < 245; r += 8) {
    rtCtx.beginPath();
    rtCtx.arc(256, 256, r, 0, Math.PI * 2);
    rtCtx.stroke();
  }
  // Cross-drilled ventilation holes & slots
  for (let spoke = 0; spoke < 12; spoke++) {
    const baseA = (spoke / 12) * Math.PI * 2;
    for (let d = 0; d < 4; d++) {
      const rr = 115 + d * 32;
      const aa = baseA + d * 0.08;
      rtCtx.fillStyle = '#0f172a';
      rtCtx.beginPath();
      rtCtx.arc(256 + Math.cos(aa) * rr, 256 + Math.sin(aa) * rr, 5.5, 0, Math.PI * 2);
      rtCtx.fill();
    }
  }
  const brakeRotor = new THREE.CanvasTexture(rotCv);
  brakeRotor.colorSpace = THREE.SRGBColorSpace;
  brakeRotor.anisotropy = aniso;

  // 13. World Event Signs (Speed Radar, Contrato Express, Car Meet Zone)
  const radarSign = createSignTexture(
    'RADAR CONTROL · WANGAN',
    'FOTO-DETECCIÓN DE ALTA VELOCIDAD · RÉCORD',
    '#f43f5e'
  );
  radarSign.anisotropy = aniso;

  const contractSign = createSignTexture(
    'CONTRATO EXPRESS',
    '10 CHECKPOINTS · CIRCUITO WANGAN · +$18,000',
    '#10b981'
  );
  contractSign.anisotropy = aniso;

  const carMeetSign = createSignTexture(
    'ZONA CAR MEET',
    'ESTACIONA EN PUNTO MUERTO · 2-STEP & VOTOS',
    '#06b6d4'
  );
  carMeetSign.anisotropy = aniso;

  const rampPortalSign = createExpresswaySignTexture(
    'W1',
    '#0ea5e9',
    'ACCESO HIGHWAY WANGAN',
    'BAJADA PARKING  ↔  SUBIDA AUTOPISTA'
  );
  rampPortalSign.anisotropy = aniso;

  return {
    carbon,
    carbonBump,
    carbonRoughness,
    asphalt,
    asphaltBump,
    asphaltRoughness,
    parkingAsphalt,
    crosswalkRoad,
    rampChevronRoad,
    goreChevronTex,
    tallerFloor,
    tallerFloorRoughness,
    woodFloor,
    woodFloorRoughness,
    showroomFloor,
    showroomFloorRoughness,
    underglowRadial,
    contactShadow,
    skyscraperFacade,
    skyscraperEmissive,
    skyscraperRoughness,
    concreteBarrier,
    chainLinkFence,
    highwaySign1,
    highwaySign2,
    medianSign,
    hangarSign,
    number78Sign,
    ghostGarageSign,
    tallerWallSign,
    dealershipSign,
    leaderboardSign,
    carPoster1,
    carPoster2,
    tireTread,
    tireTreadBump,
    tireSidewall,
    brakeRotor,
    radarSign,
    contractSign,
    carMeetSign,
    rampPortalSign,
    dispose: () => {
      carbon.dispose();
      carbonBump.dispose();
      carbonRoughness.dispose();
      asphalt.dispose();
      asphaltBump.dispose();
      asphaltRoughness.dispose();
      parkingAsphalt.dispose();
      crosswalkRoad.dispose();
      rampChevronRoad.dispose();
      goreChevronTex.dispose();
      tallerFloor.dispose();
      tallerFloorRoughness.dispose();
      woodFloor.dispose();
      woodFloorRoughness.dispose();
      showroomFloor.dispose();
      showroomFloorRoughness.dispose();
      underglowRadial.dispose();
      contactShadow.dispose();
      skyscraperFacade.dispose();
      skyscraperEmissive.dispose();
      skyscraperRoughness.dispose();
      concreteBarrier.dispose();
      chainLinkFence.dispose();
      highwaySign1.dispose();
      highwaySign2.dispose();
      medianSign.dispose();
      hangarSign.dispose();
      number78Sign.dispose();
      ghostGarageSign.dispose();
      tallerWallSign.dispose();
      dealershipSign.dispose();
      leaderboardSign.dispose();
      carPoster1.dispose();
      carPoster2.dispose();
      tireTread.dispose();
      tireTreadBump.dispose();
      tireSidewall.dispose();
      brakeRotor.dispose();
      radarSign.dispose();
      contractSign.dispose();
      carMeetSign.dispose();
      rampPortalSign.dispose();
    },
  };
}
