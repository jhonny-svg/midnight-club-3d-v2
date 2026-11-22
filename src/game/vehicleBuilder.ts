import * as THREE from 'three';
import { createLicensePlateTexture, ProceduralTextureSet } from './textures';
import {
  CarUpgrades,
  DiffuserOption,
  FrontBumperOption,
  PaintFinish,
  RimDesign,
  SpoilerOption,
  TireProfile,
  VehicleBodyStyle,
  WindowTintOption,
} from './types';

export interface BuiltVehicle {
  root: THREE.Group;
  chassisGroup: THREE.Group;
  wheels: THREE.Group[];
  paintMat: THREE.MeshPhysicalMaterial;
  rimMat: THREE.MeshStandardMaterial;
  rotorMat: THREE.MeshStandardMaterial;
  glassMat: THREE.MeshPhysicalMaterial;
  headLedMat: THREE.MeshStandardMaterial;
  tailLedMat: THREE.MeshStandardMaterial;
  underglowMat: THREE.MeshBasicMaterial;
  underglowMesh: THREE.Mesh;
  underglowLight: THREE.PointLight | null;
  spawnRingMesh: THREE.Mesh | null;
  activeWingGroup: THREE.Group | null;
  activeWingBaseY: number;
  activeWingBaseRotX: number;
  flameLeft: THREE.Mesh;
  flameRight: THREE.Mesh;
  backfireLeft: THREE.Mesh;
  backfireRight: THREE.Mesh;
  backfireOuterMat: THREE.MeshBasicMaterial;
  backfireCoreMat: THREE.MeshBasicMaterial;
  backfireSparks: THREE.Mesh[];
  backfireLight: THREE.PointLight | null;
  cockpitGroup: THREE.Group | null;
  cockpitEyeOffset: { x: number; y: number; z: number };
  kingCrownGroup: THREE.Group | null;
  updatePlateText: (text: string) => void;
  applyPaintFinish: (finish: PaintFinish) => void;
  applyWindowTint: (tint: WindowTintOption) => void;
  setHeadlightsOn: (on: boolean) => void;
  flashHighBeams: (on: boolean) => void;
  setBrakeHeat: (heat01: number) => void;
  setInteriorCockpitMode: (enabled: boolean) => void;
  updateCockpit: (
    steerAngle: number,
    rpm: number,
    maxRpm: number,
    speedKmh: number,
    gear: number,
    nitro: number
  ) => void;
  setKingCrown: (active: boolean) => void;
  updateVisualPulse: (time: number, isChameleon: boolean, isPulseNeon: boolean) => void;
  dispose: () => void;
}

interface StyleDims {
  frontAxleZ: number; // negative Z in car space
  rearAxleZ: number;  // positive Z in car space
  noseZ: number;      // negative Z tip
  tailZ: number;      // positive Z tip
  tireRadius: number;
  tireWidth: number;
  bodyWidth: number;
  cabinWidth: number;
  headlightY: number;
  taillightY: number;
  spoilerType: 'gt_swan' | 'r34_wing' | 'ducktail' | 'black_gt' | 'evo_wing' | 'hyper_wing' | 'none';
  quadExhaust: boolean;
  centerExhaust?: boolean;
  sideIntakes?: boolean;
  hoodScoop?: boolean;
  carbonRoof?: boolean;
}

const STYLE_DIMS: Record<VehicleBodyStyle, StyleDims> = {
  kuruma_sedan: {
    frontAxleZ: -1.32,
    rearAxleZ: 1.32,
    noseZ: -2.14,
    tailZ: 2.10,
    tireRadius: 0.31,
    tireWidth: 0.22,
    bodyWidth: 1.78,
    cabinWidth: 1.42,
    headlightY: 0.54,
    taillightY: 0.72,
    spoilerType: 'none',
    quadExhaust: false,
  },
  porsche_gt3: {
    frontAxleZ: -1.34,
    rearAxleZ: 1.32,
    noseZ: -2.18,
    tailZ: 2.12,
    tireRadius: 0.33,
    tireWidth: 0.28,
    bodyWidth: 1.88,
    cabinWidth: 1.38,
    headlightY: 0.54,
    taillightY: 0.68,
    spoilerType: 'gt_swan',
    quadExhaust: false,
    centerExhaust: true,
  },
  skyline_r34: {
    frontAxleZ: -1.36,
    rearAxleZ: 1.36,
    noseZ: -2.22,
    tailZ: 2.18,
    tireRadius: 0.33,
    tireWidth: 0.27,
    bodyWidth: 1.86,
    cabinWidth: 1.42,
    headlightY: 0.56,
    taillightY: 0.72,
    spoilerType: 'r34_wing',
    quadExhaust: false,
  },
  m4_csl: {
    frontAxleZ: -1.38,
    rearAxleZ: 1.35,
    noseZ: -2.24,
    tailZ: 2.18,
    tireRadius: 0.33,
    tireWidth: 0.28,
    bodyWidth: 1.9,
    cabinWidth: 1.42,
    headlightY: 0.55,
    taillightY: 0.72,
    spoilerType: 'ducktail',
    quadExhaust: true,
    carbonRoof: true,
  },
  supra_mk5: {
    frontAxleZ: -1.32,
    rearAxleZ: 1.30,
    noseZ: -2.18,
    tailZ: 2.08,
    tireRadius: 0.33,
    tireWidth: 0.28,
    bodyWidth: 1.9,
    cabinWidth: 1.36,
    headlightY: 0.52,
    taillightY: 0.70,
    spoilerType: 'ducktail',
    quadExhaust: false,
  },
  muscle_srt: {
    frontAxleZ: -1.42,
    rearAxleZ: 1.38,
    noseZ: -2.30,
    tailZ: 2.24,
    tireRadius: 0.35,
    tireWidth: 0.30,
    bodyWidth: 1.96,
    cabinWidth: 1.48,
    headlightY: 0.62,
    taillightY: 0.78,
    spoilerType: 'ducktail',
    quadExhaust: true,
    hoodScoop: true,
  },
  amg_black: {
    frontAxleZ: -1.42,
    rearAxleZ: 1.34,
    noseZ: -2.28,
    tailZ: 2.16,
    tireRadius: 0.33,
    tireWidth: 0.29,
    bodyWidth: 1.94,
    cabinWidth: 1.38,
    headlightY: 0.53,
    taillightY: 0.69,
    spoilerType: 'black_gt',
    quadExhaust: true,
    carbonRoof: true,
  },
  huracan_evo: {
    frontAxleZ: -1.36,
    rearAxleZ: 1.36,
    noseZ: -2.26,
    tailZ: 2.18,
    tireRadius: 0.33,
    tireWidth: 0.29,
    bodyWidth: 1.96,
    cabinWidth: 1.36,
    headlightY: 0.45,
    taillightY: 0.68,
    spoilerType: 'evo_wing',
    quadExhaust: false,
    centerExhaust: true,
    sideIntakes: true,
  },
  lafuria_v12: {
    frontAxleZ: -1.40,
    rearAxleZ: 1.40,
    noseZ: -2.32,
    tailZ: 2.22,
    tireRadius: 0.33,
    tireWidth: 0.30,
    bodyWidth: 1.98,
    cabinWidth: 1.34,
    headlightY: 0.46,
    taillightY: 0.68,
    spoilerType: 'hyper_wing',
    quadExhaust: true,
    sideIntakes: true,
    carbonRoof: true,
  },
  npc_sedan: {
    frontAxleZ: -1.38,
    rearAxleZ: 1.38,
    noseZ: -2.22,
    tailZ: 2.20,
    tireRadius: 0.33,
    tireWidth: 0.24,
    bodyWidth: 1.84,
    cabinWidth: 1.46,
    headlightY: 0.56,
    taillightY: 0.74,
    spoilerType: 'none',
    quadExhaust: false,
  },
  npc_suv: {
    frontAxleZ: -1.42,
    rearAxleZ: 1.42,
    noseZ: -2.28,
    tailZ: 2.24,
    tireRadius: 0.38,
    tireWidth: 0.27,
    bodyWidth: 1.94,
    cabinWidth: 1.56,
    headlightY: 0.72,
    taillightY: 0.92,
    spoilerType: 'none',
    quadExhaust: false,
  },
  npc_sport: {
    frontAxleZ: -1.34,
    rearAxleZ: 1.34,
    noseZ: -2.18,
    tailZ: 2.14,
    tireRadius: 0.33,
    tireWidth: 0.26,
    bodyWidth: 1.86,
    cabinWidth: 1.38,
    headlightY: 0.52,
    taillightY: 0.69,
    spoilerType: 'ducktail',
    quadExhaust: false,
  },
};

function traceWheelArch(
  s: THREE.Shape,
  axleX: number,
  axleY: number,
  archShapeR: number,
  sillShapeY: number
) {
  const ratio = THREE.MathUtils.clamp((sillShapeY - axleY) / archShapeR, -0.94, 0.94);
  const a = Math.asin(ratio); // negative when sillShapeY < axleY
  const startX = axleX - archShapeR * Math.cos(a);
  s.lineTo(startX, sillShapeY);
  s.absarc(axleX, axleY, archShapeR, Math.PI - a, a, true);
}

/**
 * Builds the lower sculpted chassis + bumpers with real circular wheel-arch cutouts
 * and the tapered upper greenhouse/cabin separately so the car has realistic tumblehome
 * and curved aerodynamic proportions instead of a flat-walled block.
 */
function createSculptedBodyParts(style: VehicleBodyStyle, dims: StyleDims): {
  lowerGeo: THREE.ExtrudeGeometry;
  cabinGeo: THREE.ExtrudeGeometry;
  glassGeo: THREE.ExtrudeGeometry;
} {
  // Shape X maps to -Z after rotateY(+PI/2): +X = nose, -X = rear
  const frontAxleX = -dims.frontAxleZ;
  const rearAxleX = -dims.rearAxleZ;
  const noseX = -dims.noseZ;
  const tailX = -dims.tailZ;

  const bevelSize = 0.065;
  const bevelThickness = 0.095;
  const desiredSillY = style === 'npc_suv' ? 0.29 : 0.21;
  const desiredArchR = dims.tireRadius + 0.055;

  // Compensate shape coordinates for outward bevel expansion
  const sillShapeY = desiredSillY + bevelSize;
  const archShapeR = desiredArchR + bevelSize;

  const lower = new THREE.Shape();
  const tailShapeX = tailX + bevelSize;
  const noseShapeX = noseX - bevelSize;

  lower.moveTo(tailShapeX, sillShapeY + 0.08);
  traceWheelArch(lower, rearAxleX, dims.tireRadius, archShapeR, sillShapeY);
  traceWheelArch(lower, frontAxleX, dims.tireRadius, archShapeR, sillShapeY);
  lower.lineTo(noseShapeX - 0.05, sillShapeY);

  // Sculpted upper lower-body curve (front bumper -> hood -> beltline -> rear haunch -> rear bumper)
  if (style === 'kuruma_sedan') {
    lower.quadraticCurveTo(noseShapeX + 0.04, 0.45, noseShapeX - 0.12, 0.61);
    lower.bezierCurveTo(frontAxleX + 0.25, 0.74, 0.90, 0.78, 0.50, 0.81);
    lower.lineTo(-1.38, 0.85);
    lower.quadraticCurveTo(tailShapeX + 0.10, 0.82, tailShapeX, 0.65);
    lower.lineTo(tailShapeX, sillShapeY + 0.08);
  } else if (style === 'porsche_gt3') {
    lower.quadraticCurveTo(noseShapeX + 0.05, 0.44, noseShapeX - 0.14, 0.57);
    lower.bezierCurveTo(frontAxleX + 0.25, 0.72, frontAxleX - 0.35, 0.76, 0.55, 0.79);
    lower.bezierCurveTo(0.0, 0.81, rearAxleX + 0.35, 0.86, rearAxleX - 0.2, 0.85);
    lower.quadraticCurveTo(tailShapeX + 0.12, 0.78, tailShapeX, 0.62);
    lower.quadraticCurveTo(tailShapeX - 0.03, 0.42, tailShapeX, sillShapeY + 0.08);
  } else if (style === 'skyline_r34') {
    lower.quadraticCurveTo(noseShapeX + 0.04, 0.45, noseShapeX - 0.06, 0.60);
    lower.bezierCurveTo(frontAxleX + 0.3, 0.73, 0.95, 0.78, 0.55, 0.82);
    lower.lineTo(-1.35, 0.86);
    lower.quadraticCurveTo(tailShapeX + 0.12, 0.84, tailShapeX, 0.70);
    lower.lineTo(tailShapeX, sillShapeY + 0.08);
  } else if (style === 'm4_csl') {
    lower.quadraticCurveTo(noseShapeX + 0.04, 0.44, noseShapeX - 0.08, 0.59);
    lower.bezierCurveTo(frontAxleX + 0.25, 0.74, 0.9, 0.78, 0.48, 0.83);
    lower.bezierCurveTo(-0.2, 0.85, rearAxleX + 0.2, 0.88, rearAxleX - 0.45, 0.90);
    lower.quadraticCurveTo(tailShapeX + 0.08, 0.84, tailShapeX, 0.65);
    lower.lineTo(tailShapeX, sillShapeY + 0.08);
  } else if (style === 'supra_mk5') {
    lower.bezierCurveTo(noseShapeX + 0.06, 0.38, noseShapeX - 0.04, 0.54, noseShapeX - 0.22, 0.63);
    lower.bezierCurveTo(frontAxleX + 0.15, 0.75, 0.8, 0.78, 0.35, 0.81);
    lower.bezierCurveTo(-0.3, 0.84, rearAxleX + 0.25, 0.90, rearAxleX - 0.4, 0.88);
    lower.quadraticCurveTo(tailShapeX + 0.08, 0.79, tailShapeX, 0.58);
    lower.lineTo(tailShapeX, sillShapeY + 0.08);
  } else if (style === 'muscle_srt') {
    lower.quadraticCurveTo(noseShapeX + 0.03, 0.52, noseShapeX - 0.04, 0.68);
    lower.bezierCurveTo(frontAxleX + 0.35, 0.79, 0.95, 0.84, 0.5, 0.87);
    lower.lineTo(-1.35, 0.92);
    lower.quadraticCurveTo(tailShapeX + 0.1, 0.91, tailShapeX, 0.74);
    lower.lineTo(tailShapeX, sillShapeY + 0.08);
  } else if (style === 'amg_black') {
    lower.quadraticCurveTo(noseShapeX + 0.05, 0.42, noseShapeX - 0.12, 0.58);
    lower.bezierCurveTo(frontAxleX + 0.2, 0.73, 0.8, 0.78, 0.18, 0.82);
    lower.bezierCurveTo(-0.4, 0.84, rearAxleX + 0.2, 0.85, tailShapeX + 0.15, 0.82);
    lower.quadraticCurveTo(tailShapeX + 0.04, 0.74, tailShapeX, 0.56);
    lower.lineTo(tailShapeX, sillShapeY + 0.08);
  } else if (style === 'huracan_evo') {
    lower.quadraticCurveTo(noseShapeX + 0.06, 0.36, noseShapeX - 0.2, 0.52);
    lower.bezierCurveTo(frontAxleX + 0.18, 0.68, 0.95, 0.74, 0.65, 0.77);
    lower.bezierCurveTo(0.0, 0.80, rearAxleX + 0.25, 0.84, tailShapeX + 0.15, 0.81);
    lower.quadraticCurveTo(tailShapeX + 0.03, 0.72, tailShapeX, 0.52);
    lower.lineTo(tailShapeX, sillShapeY + 0.08);
  } else if (style === 'lafuria_v12') {
    lower.bezierCurveTo(noseShapeX + 0.08, 0.35, noseShapeX - 0.1, 0.48, noseShapeX - 0.32, 0.58);
    lower.bezierCurveTo(frontAxleX + 0.15, 0.72, 0.85, 0.74, 0.55, 0.76);
    lower.bezierCurveTo(-0.1, 0.80, rearAxleX + 0.35, 0.86, tailShapeX + 0.18, 0.80);
    lower.quadraticCurveTo(tailShapeX + 0.02, 0.70, tailShapeX, 0.50);
    lower.lineTo(tailShapeX, sillShapeY + 0.08);
  } else if (style === 'npc_suv') {
    lower.quadraticCurveTo(noseShapeX + 0.03, 0.55, noseShapeX - 0.08, 0.78);
    lower.bezierCurveTo(frontAxleX + 0.35, 0.92, 0.95, 0.95, 0.55, 0.98);
    lower.lineTo(-1.65, 1.00);
    lower.quadraticCurveTo(tailShapeX + 0.08, 0.96, tailShapeX, 0.76);
    lower.lineTo(tailShapeX, sillShapeY + 0.08);
  } else {
    // npc_sedan / npc_sport
    lower.quadraticCurveTo(noseShapeX + 0.04, 0.45, noseShapeX - 0.1, 0.61);
    lower.bezierCurveTo(frontAxleX + 0.25, 0.75, 0.95, 0.79, 0.52, 0.83);
    lower.lineTo(-1.45, 0.86);
    lower.quadraticCurveTo(tailShapeX + 0.1, 0.82, tailShapeX, 0.64);
    lower.lineTo(tailShapeX, sillShapeY + 0.08);
  }
  lower.closePath();

  const lowerDepth = Math.max(0.6, dims.bodyWidth - bevelThickness * 2);
  const lowerGeo = new THREE.ExtrudeGeometry(lower, {
    depth: lowerDepth,
    curveSegments: 24,
    bevelEnabled: true,
    bevelSegments: 8,
    steps: 1,
    bevelSize,
    bevelThickness,
  });
  lowerGeo.translate(0, 0, -lowerDepth / 2);
  lowerGeo.rotateY(Math.PI / 2);
  lowerGeo.computeVertexNormals();

  // ==================== UPPER GREENHOUSE / ROOF CANOPY ====================
  const cabBevelSize = 0.045;
  const cabBevelThick = 0.08;
  const cabin = new THREE.Shape();

  if (style === 'porsche_gt3') {
    cabin.moveTo(-1.68, 0.74);
    cabin.lineTo(0.68, 0.74);
    cabin.bezierCurveTo(0.45, 0.95, 0.18, 1.15, -0.22, 1.15);
    cabin.bezierCurveTo(-0.78, 1.15, -1.25, 0.96, -1.68, 0.74);
  } else if (style === 'huracan_evo' || style === 'lafuria_v12') {
    cabin.moveTo(-1.35, 0.70);
    cabin.lineTo(0.88, 0.68);
    cabin.bezierCurveTo(0.55, 0.88, 0.18, 1.07, -0.24, 1.07);
    cabin.bezierCurveTo(-0.68, 1.07, -1.02, 0.90, -1.35, 0.70);
  } else if (style === 'amg_black') {
    cabin.moveTo(-1.65, 0.74);
    cabin.lineTo(0.28, 0.74);
    cabin.bezierCurveTo(0.02, 0.95, -0.26, 1.13, -0.62, 1.13);
    cabin.bezierCurveTo(-1.05, 1.13, -1.38, 0.94, -1.65, 0.74);
  } else if (style === 'supra_mk5') {
    cabin.moveTo(-1.55, 0.74);
    cabin.lineTo(0.46, 0.74);
    cabin.bezierCurveTo(0.18, 0.96, -0.10, 1.13, -0.45, 1.13);
    cabin.bezierCurveTo(-0.92, 1.13, -1.25, 0.95, -1.55, 0.74);
  } else if (style === 'npc_suv') {
    cabin.moveTo(-1.95, 0.90);
    cabin.lineTo(0.66, 0.90);
    cabin.quadraticCurveTo(0.32, 1.24, 0.08, 1.46);
    cabin.bezierCurveTo(-0.45, 1.50, -1.28, 1.48, -1.68, 1.38);
    cabin.quadraticCurveTo(-1.86, 1.18, -1.95, 0.90);
  } else if (style === 'npc_sedan' || style === 'kuruma_sedan') {
    cabin.moveTo(-1.62, 0.75);
    cabin.lineTo(0.64, 0.75);
    cabin.quadraticCurveTo(0.34, 1.01, 0.10, 1.21);
    cabin.bezierCurveTo(-0.32, 1.25, -0.80, 1.23, -1.10, 1.15);
    cabin.quadraticCurveTo(-1.40, 0.96, -1.62, 0.75);
  } else {
    // R34, M4 CSL, Muscle SRT, NPC Sport
    cabin.moveTo(-1.58, 0.75);
    cabin.lineTo(0.58, 0.75);
    cabin.quadraticCurveTo(0.28, 0.98, 0.04, 1.17);
    cabin.bezierCurveTo(-0.36, 1.19, -0.82, 1.18, -1.08, 1.10);
    cabin.quadraticCurveTo(-1.35, 0.94, -1.58, 0.75);
  }
  cabin.closePath();

  const cabinDepth = Math.max(0.5, dims.cabinWidth - cabBevelThick * 2);
  const cabinGeo = new THREE.ExtrudeGeometry(cabin, {
    depth: cabinDepth,
    curveSegments: 24,
    bevelEnabled: true,
    bevelSegments: 8,
    steps: 1,
    bevelSize: cabBevelSize,
    bevelThickness: cabBevelThick,
  });
  cabinGeo.translate(0, 0, -cabinDepth / 2);
  cabinGeo.rotateY(Math.PI / 2);
  cabinGeo.computeVertexNormals();

  // Slightly wider/thinner glass wrap shell around the middle of the cabin so windows read cleanly
  const glassDepth = cabinDepth + 0.035;
  const glassGeo = new THREE.ExtrudeGeometry(cabin, {
    depth: glassDepth,
    curveSegments: 24,
    bevelEnabled: true,
    bevelSegments: 6,
    steps: 1,
    bevelSize: cabBevelSize * 0.62,
    bevelThickness: cabBevelThick * 0.85,
  });
  glassGeo.translate(0, 0, -glassDepth / 2);
  glassGeo.rotateY(Math.PI / 2);
  glassGeo.scale(1.01, 0.95, 0.95);
  glassGeo.translate(0, 0.035, 0);
  glassGeo.computeVertexNormals();

  return { lowerGeo, cabinGeo, glassGeo };
}

/**
 * Builds a realistic rounded tire profile via LatheGeometry (sidewall bulge + curved crown)
 */
function createRoundedTireGeometry(outerR: number, rimR: number, width: number): THREE.LatheGeometry {
  const hw = width * 0.5;
  const midR = rimR + (outerR - rimR) * 0.55;
  const pts: THREE.Vector2[] = [
    new THREE.Vector2(rimR * 0.94, -hw * 0.82),
    new THREE.Vector2(midR, -hw * 0.97),
    new THREE.Vector2(outerR - 0.026, -hw * 0.89),
    new THREE.Vector2(outerR - 0.004, -hw * 0.50),
    new THREE.Vector2(outerR, 0),
    new THREE.Vector2(outerR - 0.004, hw * 0.50),
    new THREE.Vector2(outerR - 0.026, hw * 0.89),
    new THREE.Vector2(midR, hw * 0.97),
    new THREE.Vector2(rimR * 0.94, hw * 0.82),
  ];
  const geo = new THREE.LatheGeometry(pts, 28);
  geo.rotateZ(Math.PI / 2);
  geo.computeVertexNormals();
  return geo;
}

function createCurvedWingGeo(span: number, chord: number): THREE.ExtrudeGeometry {
  const s = new THREE.Shape();
  s.moveTo(-chord * 0.5, 0);
  s.quadraticCurveTo(0, 0.045, chord * 0.5, 0.018);
  s.quadraticCurveTo(0, 0.012, -chord * 0.5, -0.012);
  s.closePath();

  const geo = new THREE.ExtrudeGeometry(s, {
    depth: span,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: 0.012,
    bevelThickness: 0.015,
  });
  geo.translate(0, 0, -span / 2);
  geo.rotateY(Math.PI / 2);
  geo.computeVertexNormals();
  return geo;
}

function applyFinishParams(
  mat: THREE.MeshPhysicalMaterial,
  finish: PaintFinish,
  isTraffic?: boolean
) {
  if (isTraffic) {
    mat.metalness = 0.22;
    mat.roughness = 0.38;
    mat.clearcoat = 0.45;
    mat.clearcoatRoughness = 0.08;
    mat.iridescence = 0;
    mat.envMapIntensity = 0.72;
    mat.needsUpdate = true;
    return;
  }
  if (finish === 'matte') {
    mat.metalness = 0.14;
    mat.roughness = 0.74;
    mat.clearcoat = 0.04;
    mat.clearcoatRoughness = 0.55;
    mat.iridescence = 0;
    mat.specularIntensity = 0.28;
    mat.envMapIntensity = 0.42;
  } else if (finish === 'metallic') {
    mat.metalness = 0.74;
    mat.roughness = 0.24;
    mat.clearcoat = 0.82;
    mat.clearcoatRoughness = 0.08;
    mat.iridescence = 0;
    mat.specularIntensity = 0.65;
    mat.envMapIntensity = 0.96;
  } else if (finish === 'chrome') {
    mat.metalness = 0.96;
    mat.roughness = 0.08;
    mat.clearcoat = 0.9;
    mat.clearcoatRoughness = 0.04;
    mat.iridescence = 0;
    mat.specularIntensity = 0.82;
    mat.envMapIntensity = 1.15;
  } else if (finish === 'chameleon') {
    mat.metalness = 0.84;
    mat.roughness = 0.16;
    mat.clearcoat = 0.86;
    mat.clearcoatRoughness = 0.06;
    mat.iridescence = 1.0;
    mat.iridescenceIOR = 1.48;
    mat.iridescenceThicknessRange = [180, 620];
    mat.specularIntensity = 0.80;
    mat.envMapIntensity = 1.12;
  } else {
    // 'gloss'
    mat.metalness = 0.26;
    mat.roughness = 0.22;
    mat.clearcoat = 0.78;
    mat.clearcoatRoughness = 0.08;
    mat.iridescence = 0;
    mat.specularIntensity = 0.56;
    mat.envMapIntensity = 0.88;
  }
  mat.needsUpdate = true;
}

function applyTintParams(
  mat: THREE.MeshPhysicalMaterial,
  tint: WindowTintOption,
  isTraffic?: boolean
) {
  if (isTraffic) {
    mat.transparent = false;
    mat.opacity = 1.0;
    mat.depthWrite = true;
  } else {
    mat.transparent = true;
    mat.depthWrite = false;
    mat.opacity = tint === 'clear' ? 0.34 : tint === 'limo' ? 0.93 : 0.66;
  }
  mat.needsUpdate = true;
}

export function buildCompositeVehicle(options: {
  style: VehicleBodyStyle;
  paintHex: string;
  paintFinish?: PaintFinish;
  rimHex: string;
  rimDesign?: RimDesign;
  tireProfile?: TireProfile;
  underglowHex: string;
  textures: ProceduralTextureSet;
  isSoftwareGl: boolean;
  isTraffic?: boolean;
  upgrades?: CarUpgrades;
  spoilerOverride?: SpoilerOption;
  frontBumper?: FrontBumperOption;
  diffuser?: DiffuserOption;
  sportSteering?: boolean;
  starlightRoof?: boolean;
  plateText?: string;
  windowTint?: WindowTintOption;
}): BuiltVehicle {
  const root = new THREE.Group();
  const chassisGroup = new THREE.Group();
  const suspLvl = !options.isTraffic ? Math.min(3, Math.max(0, options.upgrades?.suspension ?? 0)) : 0;
  chassisGroup.position.y = -suspLvl * 0.013;
  root.add(chassisGroup);

  const wheels: THREE.Group[] = [];
  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];
  const disposableTextures: THREE.Texture[] = [];

  const dims = STYLE_DIMS[options.style];

  const paintMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(options.paintHex),
    flatShading: false,
  });
  applyFinishParams(paintMat, options.paintFinish ?? 'gloss', options.isTraffic);
  materials.push(paintMat);

  const carbonMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: 0.46,
    metalness: 0.24,
    clearcoat: 0.92,
    clearcoatRoughness: 0.08,
    map: options.textures.carbon,
    bumpMap: options.textures.carbonBump,
    bumpScale: 0.014,
    roughnessMap: options.textures.carbonRoughness,
    flatShading: false,
  });
  materials.push(carbonMat);

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x05080f,
    roughness: 0.04,
    metalness: 0.16,
    clearcoat: 0.95,
    clearcoatRoughness: 0.03,
    envMapIntensity: 1.25,
    flatShading: false,
  });
  applyTintParams(glassMat, options.windowTint ?? 'smoke', options.isTraffic);
  materials.push(glassMat);

  const trimDarkMat = new THREE.MeshStandardMaterial({
    color: 0x0d0f14,
    roughness: 0.68,
    metalness: 0.26,
    flatShading: false,
  });
  const rimMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(options.rimHex),
    metalness: 0.88,
    roughness: 0.2,
    envMapIntensity: 1.1,
    flatShading: false,
  });
  const rotorMat = new THREE.MeshStandardMaterial({
    map: options.textures.brakeRotor,
    color: 0xcbd5e1,
    metalness: 0.88,
    roughness: 0.25,
    emissive: new THREE.Color(0xff4500),
    emissiveIntensity: 0,
    flatShading: false,
  });
  const tireMat = new THREE.MeshStandardMaterial({
    map: options.textures.tireTread,
    bumpMap: options.textures.tireTreadBump,
    bumpScale: 0.012,
    color: 0x161920,
    roughness: 0.84,
    metalness: 0.06,
    flatShading: false,
  });
  const brakeLvl = !options.isTraffic ? Math.min(3, Math.max(0, options.upgrades?.brakes ?? 0)) : 0;
  const caliperMat = new THREE.MeshStandardMaterial({
    color: brakeLvl >= 3 ? 0xf59e0b : brakeLvl >= 2 ? 0xe10600 : 0xb91c1c,
    roughness: 0.28,
    metalness: 0.45,
    flatShading: false,
  });
  materials.push(trimDarkMat, rimMat, rotorMat, tireMat, caliperMat);

  // 1. Multi-layer Curved Body (Lower Chassis + Tapered Cabin + Glass Greenhouse)
  const { lowerGeo, cabinGeo, glassGeo } = createSculptedBodyParts(options.style, dims);
  geometries.push(lowerGeo, cabinGeo, glassGeo);

  const lowerMesh = new THREE.Mesh(lowerGeo, paintMat);
  lowerMesh.castShadow = !options.isTraffic;
  lowerMesh.receiveShadow = true;
  chassisGroup.add(lowerMesh);

  const weightLvl = options.upgrades?.weight ?? 0;
  const hasCarbonRoof = (dims.carbonRoof || weightLvl >= 3) && !options.isTraffic;
  const cabinMesh = new THREE.Mesh(cabinGeo, hasCarbonRoof ? carbonMat : paintMat);
  cabinMesh.castShadow = !options.isTraffic;
  cabinMesh.receiveShadow = true;
  chassisGroup.add(cabinMesh);

  const glassMesh = new THREE.Mesh(glassGeo, glassMat);
  chassisGroup.add(glassMesh);

  // 1b. Exterior-visible Interior Accessories + Car-Specific First-Person Cockpit Rig
  type CockpitStyle = 'classic_sedan' | 'sport_coupe' | 'muscle_v8' | 'hypercar';
  const cockpitStyle: CockpitStyle =
    options.style === 'huracan_evo' || options.style === 'lafuria_v12'
      ? 'hypercar'
      : options.style === 'muscle_srt'
        ? 'muscle_v8'
        : options.style === 'kuruma_sedan' ||
            options.style === 'npc_sedan' ||
            options.style === 'npc_suv'
          ? 'classic_sedan'
          : 'sport_coupe';

  const cockpitEyeOffset =
    cockpitStyle === 'hypercar'
      ? { x: -0.29, y: 0.95, z: 0.12 }
      : cockpitStyle === 'muscle_v8'
        ? { x: -0.30, y: 1.06, z: 0.06 }
        : cockpitStyle === 'classic_sedan'
          ? { x: -0.30, y: 1.05, z: 0.06 }
          : {
              x: -0.30,
              y: 1.00,
              z: options.style === 'amg_black' ? 0.16 : 0.05,
            };

  let exteriorDash: THREE.Mesh | null = null;
  let exteriorWheelGroup: THREE.Group | null = null;
  let exteriorStarlightPoints: THREE.Points | null = null;
  let cockpitGroup: THREE.Group | null = null;
  let cockpitWheelGroup: THREE.Group | null = null;
  let cockpitGaugeCanvas: HTMLCanvasElement | null = null;
  let cockpitGaugeCtx: CanvasRenderingContext2D | null = null;
  let cockpitGaugeTex: THREE.CanvasTexture | null = null;
  let lastCockpitRedrawTime = 0;

  if (!options.isTraffic) {
    const dashZ = cockpitStyle === 'hypercar' ? -0.44 : options.style === 'amg_black' ? -0.34 : -0.42;
    const dashY = cockpitStyle === 'hypercar' ? 0.68 : 0.75;
    const dashGeo = new THREE.BoxGeometry(dims.cabinWidth * 0.72, 0.14, 0.24);
    const seatBackGeo = new THREE.BoxGeometry(0.34, 0.44, 0.1);
    const steerWheelGeo = new THREE.TorusGeometry(0.115, 0.017, 8, 20);
    const steerSpokeGeo = new THREE.BoxGeometry(0.20, 0.02, 0.018);
    geometries.push(dashGeo, seatBackGeo, steerWheelGeo, steerSpokeGeo);

    exteriorDash = new THREE.Mesh(dashGeo, trimDarkMat);
    exteriorDash.position.set(0, dashY, dashZ);
    chassisGroup.add(exteriorDash);

    for (const sx of [-0.30, 0.30]) {
      const seat = new THREE.Mesh(seatBackGeo, trimDarkMat);
      seat.position.set(sx, 0.78, 0.20);
      seat.rotation.x = 0.22;
      chassisGroup.add(seat);
    }

    exteriorWheelGroup = new THREE.Group();
    const swMat = options.sportSteering || cockpitStyle === 'hypercar' ? carbonMat : trimDarkMat;
    const sw = new THREE.Mesh(steerWheelGeo, swMat);
    const swSpoke = new THREE.Mesh(steerSpokeGeo, rimMat);
    exteriorWheelGroup.add(sw, swSpoke);
    if (options.sportSteering || cockpitStyle !== 'classic_sedan') {
      const markerGeo = new THREE.BoxGeometry(0.028, 0.028, 0.042);
      geometries.push(markerGeo);
      const marker = new THREE.Mesh(markerGeo, caliperMat);
      marker.position.set(0, 0.115, 0);
      exteriorWheelGroup.add(marker);
    }
    exteriorWheelGroup.position.set(cockpitEyeOffset.x, dashY + 0.09, dashZ + 0.14);
    exteriorWheelGroup.rotation.x = -0.35;
    chassisGroup.add(exteriorWheelGroup);

    // Car-Specific High-Detail 1st-Person Cockpit Group (Unobstructed Windshield View)
    cockpitGroup = new THREE.Group();
    cockpitGroup.visible = false;
    chassisGroup.add(cockpitGroup);

    const cpDashZ = cockpitEyeOffset.z - 0.44;
    const cpDashY = cockpitEyeOffset.y - 0.30;
    const cpWheelZ = cockpitEyeOffset.z - 0.25;
    const cpWheelY = cockpitEyeOffset.y - 0.17;
    const cpPillarH = cockpitStyle === 'hypercar' ? 0.42 : 0.48;
    const cpHeadY = cockpitEyeOffset.y + 0.16;

    const cpDashGeo = new THREE.BoxGeometry(dims.cabinWidth * 0.88, 0.20, 0.36);
    const cpConsoleGeo = new THREE.BoxGeometry(
      cockpitStyle === 'hypercar' ? 0.22 : 0.26,
      0.16,
      0.58
    );
    const cpHoodGeo = new THREE.BoxGeometry(
      cockpitStyle === 'classic_sedan' ? 0.34 : 0.38,
      0.105,
      0.16
    );
    const cpClusterScreenGeo = new THREE.PlaneGeometry(0.32, 0.095);
    const cpPillarGeo = new THREE.BoxGeometry(0.052, cpPillarH, 0.058);
    const cpSunstripGeo = new THREE.BoxGeometry(dims.cabinWidth * 0.94, 0.045, 0.10);
    const cpRoofPlateGeo = new THREE.BoxGeometry(dims.cabinWidth * 0.90, 0.025, 1.40);
    const cpWheelRimGeo = new THREE.TorusGeometry(0.128, 0.019, 10, 24);
    const cpWheelHubGeo = new THREE.CylinderGeometry(0.042, 0.042, 0.036, 14);
    cpWheelHubGeo.rotateX(Math.PI / 2);
    const cpWheelSpokeGeo = new THREE.BoxGeometry(0.225, 0.022, 0.016);
    const cpWheelBottomSpokeGeo = new THREE.BoxGeometry(0.024, 0.11, 0.016);
    const cpGloveGeo = new THREE.SphereGeometry(0.034, 10, 8);
    cpGloveGeo.scale(0.82, 1.24, 0.90);
    const cpArmGeo = new THREE.CylinderGeometry(0.026, 0.032, 0.22, 8);
    cpArmGeo.rotateX(Math.PI / 2);
    geometries.push(
      cpDashGeo,
      cpConsoleGeo,
      cpHoodGeo,
      cpClusterScreenGeo,
      cpPillarGeo,
      cpSunstripGeo,
      cpRoofPlateGeo,
      cpWheelRimGeo,
      cpWheelHubGeo,
      cpWheelSpokeGeo,
      cpWheelBottomSpokeGeo,
      cpGloveGeo,
      cpArmGeo
    );

    const dashMat =
      cockpitStyle === 'hypercar' || cockpitStyle === 'sport_coupe' ? carbonMat : trimDarkMat;
    const cpDash = new THREE.Mesh(cpDashGeo, trimDarkMat);
    cpDash.position.set(0, cpDashY, cpDashZ);
    const cpConsole = new THREE.Mesh(cpConsoleGeo, dashMat);
    cpConsole.position.set(0.02, cpDashY - 0.02, cpDashZ + 0.34);
    cockpitGroup.add(cpDash, cpConsole);

    // Classic Sedan double-DIN radio bezel or Coupe angled infotainment screen
    if (cockpitStyle === 'classic_sedan') {
      const radioGeo = new THREE.BoxGeometry(0.20, 0.08, 0.03);
      const radioMat = new THREE.MeshBasicMaterial({ color: 0x164e63 });
      geometries.push(radioGeo);
      materials.push(radioMat);
      const radio = new THREE.Mesh(radioGeo, radioMat);
      radio.position.set(0.02, cpDashY + 0.06, cpDashZ + 0.18);
      cockpitGroup.add(radio);
    } else {
      const tabletGeo = new THREE.BoxGeometry(0.22, 0.11, 0.02);
      const tabletScreenMat = new THREE.MeshBasicMaterial({
        color: cockpitStyle === 'hypercar' ? 0xf59e0b : 0x0ea5e9,
      });
      geometries.push(tabletGeo);
      materials.push(tabletScreenMat);
      const tablet = new THREE.Mesh(tabletGeo, tabletScreenMat);
      tablet.position.set(0.03, cpDashY + 0.125, cpDashZ + 0.15);
      tablet.rotation.y = -0.18;
      cockpitGroup.add(tablet);
    }

    const cpBinnacle = new THREE.Mesh(cpHoodGeo, dashMat);
    cpBinnacle.position.set(cockpitEyeOffset.x, cpDashY + 0.12, cpDashZ + 0.04);
    cockpitGroup.add(cpBinnacle);

    cockpitGaugeCanvas = document.createElement('canvas');
    cockpitGaugeCanvas.width = 512;
    cockpitGaugeCanvas.height = 192;
    cockpitGaugeCtx = cockpitGaugeCanvas.getContext('2d');
    cockpitGaugeTex = new THREE.CanvasTexture(cockpitGaugeCanvas);
    cockpitGaugeTex.colorSpace = THREE.SRGBColorSpace;
    disposableTextures.push(cockpitGaugeTex);

    const cpScreenMat = new THREE.MeshBasicMaterial({
      map: cockpitGaugeTex,
      toneMapped: false,
    });
    materials.push(cpScreenMat);
    const cpScreen = new THREE.Mesh(cpClusterScreenGeo, cpScreenMat);
    cpScreen.position.set(cockpitEyeOffset.x, cpDashY + 0.122, cpDashZ + 0.125);
    cpScreen.rotation.x = -0.16;
    cockpitGroup.add(cpScreen);

    // Slim wide-set A-Pillars + high headliner (keeps 100% windshield view clear)
    for (const side of [-1, 1]) {
      const pillar = new THREE.Mesh(cpPillarGeo, trimDarkMat);
      pillar.position.set(
        side * (dims.cabinWidth * 0.48),
        cockpitEyeOffset.y + 0.02,
        cpDashZ + 0.14
      );
      pillar.rotation.x = -0.78;
      pillar.rotation.z = side * 0.16;
      cockpitGroup.add(pillar);
    }
    const sunstrip = new THREE.Mesh(cpSunstripGeo, trimDarkMat);
    sunstrip.position.set(0, cpHeadY, cpDashZ + 0.34);
    const roofPlate = new THREE.Mesh(cpRoofPlateGeo, trimDarkMat);
    roofPlate.position.set(0, cpHeadY + 0.02, cpDashZ + 1.02);
    cockpitGroup.add(sunstrip, roofPlate);

    // Style-Specific Steering Wheel + Gloved Driver Hands
    cockpitWheelGroup = new THREE.Group();
    cockpitWheelGroup.position.set(cockpitEyeOffset.x, cpWheelY, cpWheelZ);
    cockpitWheelGroup.rotation.x = -0.26;

    const cpHub = new THREE.Mesh(cpWheelHubGeo, trimDarkMat);
    const cpSpoke = new THREE.Mesh(cpWheelSpokeGeo, rimMat);
    const cpBottomSpoke = new THREE.Mesh(cpWheelBottomSpokeGeo, rimMat);
    cpBottomSpoke.position.set(0, -0.06, 0);
    cockpitWheelGroup.add(cpHub, cpSpoke, cpBottomSpoke);

    if (cockpitStyle === 'hypercar') {
      // Carbon F1/GT Yoke grips + flat carbon top & shift LED bar
      const yokeSideGeo = new THREE.BoxGeometry(0.032, 0.15, 0.030);
      const yokeTopGeo = new THREE.BoxGeometry(0.21, 0.026, 0.026);
      const yokeLedGeo = new THREE.BoxGeometry(0.11, 0.012, 0.014);
      const yokeLedMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
      geometries.push(yokeSideGeo, yokeTopGeo, yokeLedGeo);
      materials.push(yokeLedMat);
      const gripL = new THREE.Mesh(yokeSideGeo, trimDarkMat);
      gripL.position.set(-0.115, 0, 0);
      const gripR = new THREE.Mesh(yokeSideGeo, trimDarkMat);
      gripR.position.set(0.115, 0, 0);
      const topBar = new THREE.Mesh(yokeTopGeo, carbonMat);
      topBar.position.set(0, 0.095, 0);
      const shiftBar = new THREE.Mesh(yokeLedGeo, yokeLedMat);
      shiftBar.position.set(0, 0.106, 0.01);
      cockpitWheelGroup.add(gripL, gripR, topBar, shiftBar);
    } else {
      const cpRim = new THREE.Mesh(cpWheelRimGeo, swMat);
      cockpitWheelGroup.add(cpRim);
      if (options.sportSteering || cockpitStyle === 'sport_coupe' || cockpitStyle === 'muscle_v8') {
        const cpMarkerGeo = new THREE.BoxGeometry(0.022, 0.024, 0.040);
        geometries.push(cpMarkerGeo);
        const cpMarker = new THREE.Mesh(cpMarkerGeo, caliperMat);
        cpMarker.position.set(0, 0.128, 0);
        cockpitWheelGroup.add(cpMarker);
      }
    }

    const gloveMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.55,
      metalness: 0.12,
    });
    const sleeveMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.72,
    });
    materials.push(gloveMat, sleeveMat);

    for (const side of [-1, 1]) {
      const hand = new THREE.Mesh(cpGloveGeo, gloveMat);
      hand.position.set(side * 0.122, 0.018, 0.012);
      const forearm = new THREE.Mesh(cpArmGeo, sleeveMat);
      forearm.position.set(side * 0.155, -0.045, 0.12);
      forearm.rotation.y = side * -0.22;
      forearm.rotation.x = 0.25;
      cockpitWheelGroup.add(hand, forearm);
    }
    cockpitGroup.add(cockpitWheelGroup);

    if (options.starlightRoof) {
      // Single instanced Points buffer for Starlight Headliner (replaces 50 individual sphere draw calls)
      const extPositions: number[] = [];
      const cpPositions: number[] = [];
      const colors: number[] = [];
      const extRoofY = cockpitStyle === 'hypercar' ? 0.99 : 1.09;
      for (let r = -3; r <= 3; r++) {
        for (let c = -3; c <= 3; c++) {
          const jx = Math.sin(r * 13.7 + c * 7.3) * 0.035;
          const jz = Math.cos(r * 5.1 - c * 11.9) * 0.04;
          extPositions.push(c * 0.15 + jx, extRoofY, -0.22 + r * 0.15 + jz);
          cpPositions.push(c * 0.16 + jx, cpHeadY + 0.004, cpDashZ + 0.96 + r * 0.17 + jz);
          const warm = (r + c) % 3 === 0;
          colors.push(warm ? 0.95 : 0.78, warm ? 0.96 : 0.90, 1.0);
        }
      }
      const extStarGeo = new THREE.BufferGeometry();
      extStarGeo.setAttribute('position', new THREE.Float32BufferAttribute(extPositions, 3));
      extStarGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

      const cpStarGeo = new THREE.BufferGeometry();
      cpStarGeo.setAttribute('position', new THREE.Float32BufferAttribute(cpPositions, 3));
      cpStarGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

      const starPtsMat = new THREE.PointsMaterial({
        size: 0.026,
        vertexColors: true,
        transparent: true,
        opacity: 0.95,
        sizeAttenuation: true,
      });
      geometries.push(extStarGeo, cpStarGeo);
      materials.push(starPtsMat);

      exteriorStarlightPoints = new THREE.Points(extStarGeo, starPtsMat);
      chassisGroup.add(exteriorStarlightPoints);

      const cpStars = new THREE.Points(cpStarGeo, starPtsMat);
      cockpitGroup.add(cpStars);
    }
  }

  // 2. Sculpted Fender Arch Lips & Inner Wheel Well Tubs (arching strictly UP over top half of tire)
  const archLipGeo = new THREE.TorusGeometry(dims.tireRadius + 0.055, 0.028, 10, 24, Math.PI + 0.36);
  archLipGeo.rotateY(Math.PI / 2);
  archLipGeo.rotateX(-0.18);
  const wheelTubGeo = new THREE.CylinderGeometry(
    dims.tireRadius + 0.048,
    dims.tireRadius + 0.048,
    0.34,
    20,
    1,
    true,
    -Math.PI / 2,
    Math.PI
  );
  wheelTubGeo.rotateZ(Math.PI / 2);
  geometries.push(archLipGeo, wheelTubGeo);

  const archLipMat = options.style === 'npc_suv' ? trimDarkMat : paintMat;
  const wheelHalfTrack = dims.bodyWidth * 0.5 - dims.tireWidth * 0.42;

  for (const axZ of [dims.frontAxleZ, dims.rearAxleZ]) {
    for (const side of [-1, 1]) {
      const lip = new THREE.Mesh(archLipGeo, archLipMat);
      lip.position.set(side * (dims.bodyWidth * 0.49), dims.tireRadius, axZ);
      chassisGroup.add(lip);

      const tub = new THREE.Mesh(wheelTubGeo, trimDarkMat);
      tub.position.set(side * (wheelHalfTrack - 0.05), dims.tireRadius, axZ);
      chassisGroup.add(tub);
    }
  }

  // 3. Curved Side Mirrors on Angled Stalks
  const mirrorHousingGeo = new THREE.SphereGeometry(0.085, 12, 10);
  mirrorHousingGeo.scale(1.15, 0.68, 1.45);
  const mirrorStalkGeo = new THREE.CylinderGeometry(0.018, 0.024, 0.14, 8);
  mirrorStalkGeo.rotateZ(Math.PI / 3);
  geometries.push(mirrorHousingGeo, mirrorStalkGeo);

  const mirrorMat = options.isTraffic ? paintMat : carbonMat;
  for (const side of [-1, 1]) {
    const mirrorGroup = new THREE.Group();
    const housing = new THREE.Mesh(mirrorHousingGeo, mirrorMat);
    housing.position.set(side * 0.09, 0.04, 0);
    const stalk = new THREE.Mesh(mirrorStalkGeo, trimDarkMat);
    stalk.rotation.z = side * -0.95;
    stalk.position.set(side * 0.03, 0, 0);
    mirrorGroup.add(housing, stalk);
    mirrorGroup.position.set(side * (dims.bodyWidth * 0.46), dims.headlightY + 0.30, dims.frontAxleZ + 0.72);
    chassisGroup.add(mirrorGroup);
  }

  // 4. Front Splitter / Bumper Kit, Recessed Grille & Side Skirts / Intakes
  const turboLvl = options.upgrades?.turbo ?? 0;
  const frontBumperOpt: FrontBumperOption = !options.isTraffic ? (options.frontBumper ?? 'stock') : 'stock';
  const splitterMat = !options.isTraffic ? carbonMat : trimDarkMat;

  const splitterScaleZ = frontBumperOpt === 'gt_splitter' ? 0.56 : frontBumperOpt === 'carbon_lip' ? 0.46 : 0.38;
  const splitterGeo = new THREE.CylinderGeometry(
    dims.bodyWidth * (frontBumperOpt === 'gt_splitter' ? 0.54 : 0.51),
    dims.bodyWidth * (frontBumperOpt === 'gt_splitter' ? 0.55 : 0.52),
    frontBumperOpt === 'gt_splitter' ? 0.06 : 0.05,
    18,
    1,
    false,
    -Math.PI * 0.48,
    Math.PI * 0.96
  );
  splitterGeo.scale(1, 1, splitterScaleZ);
  splitterGeo.rotateY(Math.PI);
  geometries.push(splitterGeo);

  const splitter = new THREE.Mesh(splitterGeo, splitterMat);
  splitter.position.set(
    0,
    frontBumperOpt === 'gt_splitter' ? 0.17 : 0.19,
    dims.noseZ + (frontBumperOpt === 'gt_splitter' ? 0.10 : 0.16)
  );
  chassisGroup.add(splitter);

  if (frontBumperOpt === 'carbon_lip' || frontBumperOpt === 'gt_splitter') {
    const canardGeo = new THREE.BoxGeometry(0.12, 0.08, 0.24);
    geometries.push(canardGeo);
    for (const side of [-1, 1]) {
      const canard = new THREE.Mesh(canardGeo, carbonMat);
      canard.position.set(side * (dims.bodyWidth * 0.48), 0.24, dims.noseZ + 0.14);
      canard.rotation.z = side * -0.25;
      chassisGroup.add(canard);
    }
    if (frontBumperOpt === 'gt_splitter') {
      const strutGeo = new THREE.CylinderGeometry(0.009, 0.009, 0.18, 6);
      geometries.push(strutGeo);
      for (const sx of [-0.36, 0.36]) {
        const strut = new THREE.Mesh(strutGeo, rimMat);
        strut.position.set(sx, 0.24, dims.noseZ - 0.01);
        strut.rotation.x = 0.22;
        chassisGroup.add(strut);
      }
    }
  }

  // Recessed front grille mesh
  const grilleGeo = new THREE.BoxGeometry(dims.bodyWidth * 0.58, 0.17, 0.08);
  geometries.push(grilleGeo);
  const grille = new THREE.Mesh(grilleGeo, trimDarkMat);
  grille.position.set(0, dims.headlightY - 0.16, dims.noseZ + 0.04);
  chassisGroup.add(grille);

  // Carbon hood overlay on Stage 2+ Turbo or Stage 2+ Weight Reduction player cars
  if (!options.isTraffic && (turboLvl >= 2 || weightLvl >= 2)) {
    const hoodGeo = new THREE.SphereGeometry(0.68, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.35);
    hoodGeo.scale(0.92, 0.18, 1.05);
    geometries.push(hoodGeo);
    const hoodOverlay = new THREE.Mesh(hoodGeo, carbonMat);
    hoodOverlay.position.set(0, dims.headlightY + 0.14, dims.frontAxleZ + 0.02);
    chassisGroup.add(hoodOverlay);
  }

  // Muscle hood blower scoop
  if (dims.hoodScoop) {
    const scoopGeo = new THREE.BoxGeometry(0.46, 0.11, 0.72);
    geometries.push(scoopGeo);
    const scoop = new THREE.Mesh(scoopGeo, carbonMat);
    scoop.position.set(0, 0.87, dims.frontAxleZ + 0.12);
    chassisGroup.add(scoop);
  }

  // Mid-engine side air intakes
  if (dims.sideIntakes) {
    const intakeGeo = new THREE.BoxGeometry(0.08, 0.24, 0.52);
    geometries.push(intakeGeo);
    for (const side of [-1, 1]) {
      const intake = new THREE.Mesh(intakeGeo, trimDarkMat);
      intake.position.set(side * (dims.bodyWidth * 0.495), 0.56, 0.52);
      chassisGroup.add(intake);
    }
  }

  // Sculpted side skirts connecting front and rear wheel arches
  const skirtLen = Math.abs(dims.rearAxleZ - dims.frontAxleZ) - (dims.tireRadius + 0.06) * 2;
  const skirtGeo = new THREE.BoxGeometry(0.09, 0.06, Math.max(0.8, skirtLen));
  geometries.push(skirtGeo);
  for (const side of [-1, 1]) {
    const skirt = new THREE.Mesh(skirtGeo, splitterMat);
    skirt.position.set(side * (dims.bodyWidth * 0.49), 0.20, 0);
    chassisGroup.add(skirt);
  }

  // 5. Rear Spoiler / GT Wing + Rear Diffuser + Dual/Quad Exhausts + Nitro Flames
  const effectiveSpoilerType: StyleDims['spoilerType'] =
    options.spoilerOverride === 'none'
      ? 'none'
      : options.spoilerOverride === 'ducktail'
        ? 'ducktail'
        : options.spoilerOverride === 'street_wing'
          ? 'r34_wing'
          : options.spoilerOverride === 'gt_wing'
            ? 'gt_swan'
            : dims.spoilerType;

  let activeWingGroup: THREE.Group | null = null;
  let activeWingBaseY = dims.taillightY + 0.14;
  let activeWingBaseRotX = 0.14;

  if (effectiveSpoilerType !== 'none') {
    const wingSpan =
      effectiveSpoilerType === 'gt_swan' ||
      effectiveSpoilerType === 'black_gt' ||
      effectiveSpoilerType === 'hyper_wing'
        ? dims.bodyWidth * 0.94
        : dims.bodyWidth * 0.84;
    const wingChord = effectiveSpoilerType === 'ducktail' ? 0.18 : 0.30;
    const wingGeo = createCurvedWingGeo(wingSpan, wingChord);
    geometries.push(wingGeo);

    const wingY =
      effectiveSpoilerType === 'ducktail'
        ? dims.taillightY + 0.16
        : effectiveSpoilerType === 'black_gt' || effectiveSpoilerType === 'gt_swan'
          ? dims.taillightY + 0.38
          : dims.taillightY + 0.28;
    const wingZ = dims.tailZ - 0.14;
    const wingTilt = effectiveSpoilerType === 'ducktail' ? 0.38 : 0.14;

    activeWingGroup = new THREE.Group();
    activeWingGroup.position.set(0, wingY, wingZ);
    activeWingBaseY = wingY;
    activeWingBaseRotX = wingTilt;

    const wingMesh = new THREE.Mesh(wingGeo, carbonMat);
    wingMesh.rotation.x = wingTilt;
    activeWingGroup.add(wingMesh);

    if (effectiveSpoilerType !== 'ducktail') {
      const pylonH = wingY - dims.taillightY - 0.04;
      const pylonGeo = new THREE.BoxGeometry(0.045, Math.max(0.14, pylonH), 0.14);
      const endplateGeo = new THREE.BoxGeometry(0.025, 0.16, 0.34);
      geometries.push(pylonGeo, endplateGeo);

      for (const sx of [-0.46, 0.46]) {
        const pylon = new THREE.Mesh(pylonGeo, trimDarkMat);
        pylon.position.set(sx, wingY - pylonH * 0.5, wingZ + 0.02);
        chassisGroup.add(pylon);
      }
      for (const sx of [-wingSpan * 0.5, wingSpan * 0.5]) {
        const ep = new THREE.Mesh(endplateGeo, carbonMat);
        ep.position.set(sx, -0.01, 0);
        activeWingGroup.add(ep);
      }
    }
    chassisGroup.add(activeWingGroup);
  } else if (!options.isTraffic) {
    // Deployable flush rear aero flap even on stock/clean tail cars
    const flapGeo = createCurvedWingGeo(dims.bodyWidth * 0.64, 0.15);
    geometries.push(flapGeo);
    activeWingBaseY = dims.taillightY + 0.10;
    activeWingBaseRotX = 0.06;
    activeWingGroup = new THREE.Group();
    activeWingGroup.position.set(0, activeWingBaseY, dims.tailZ - 0.18);
    const flapMesh = new THREE.Mesh(flapGeo, carbonMat);
    flapMesh.rotation.x = activeWingBaseRotX;
    activeWingGroup.add(flapMesh);
    chassisGroup.add(activeWingGroup);
  }

  // Rear diffuser + vertical fins + custom 3D License Plate
  const diffuserOpt: DiffuserOption = !options.isTraffic ? (options.diffuser ?? 'stock') : 'stock';
  const diffWidth = diffuserOpt === 'race_carbon' ? dims.bodyWidth * 0.88 : dims.bodyWidth * 0.78;
  const diffDepth = diffuserOpt === 'race_carbon' ? 0.30 : diffuserOpt === 'finned' ? 0.26 : 0.22;
  const diffGeo = new THREE.BoxGeometry(diffWidth, 0.13, diffDepth);
  const finGeo = new THREE.BoxGeometry(0.025, diffuserOpt === 'stock' ? 0.14 : 0.18, diffDepth + 0.04);
  geometries.push(diffGeo, finGeo);
  const diffMat = diffuserOpt === 'race_carbon' ? carbonMat : trimDarkMat;
  const diffuser = new THREE.Mesh(diffGeo, diffMat);
  diffuser.position.set(0, 0.25, dims.tailZ - 0.04);
  chassisGroup.add(diffuser);
  const finXs =
    diffuserOpt === 'stock'
      ? [-0.42, -0.14, 0.14, 0.42]
      : [-0.60, -0.36, -0.12, 0.12, 0.36, 0.60];
  for (const fx of finXs) {
    const fin = new THREE.Mesh(finGeo, diffMat);
    fin.position.set(fx, 0.24, dims.tailZ - 0.01);
    chassisGroup.add(fin);
  }

  // Custom 3D Rear License Plate (Player cars)
  let currentPlateTex: THREE.CanvasTexture | null = null;
  let plateMat: THREE.MeshStandardMaterial | null = null;
  if (!options.isTraffic) {
    currentPlateTex = createLicensePlateTexture(options.plateText ?? 'GSTDVR');
    disposableTextures.push(currentPlateTex);
    const plateGeo = new THREE.PlaneGeometry(0.50, 0.155);
    const plateBackGeo = new THREE.BoxGeometry(0.52, 0.175, 0.018);
    geometries.push(plateGeo, plateBackGeo);
    plateMat = new THREE.MeshStandardMaterial({
      map: currentPlateTex,
      roughness: 0.35,
      metalness: 0.12,
    });
    materials.push(plateMat);
    const plateBack = new THREE.Mesh(plateBackGeo, trimDarkMat);
    plateBack.position.set(0, 0.46, dims.tailZ - 0.005);
    const plateFace = new THREE.Mesh(plateGeo, plateMat);
    plateFace.position.set(0, 0.46, dims.tailZ + 0.006);
    chassisGroup.add(plateBack, plateFace);
  }

  // Dual / Quad / Center Exhausts & Nitro Flames (scaled by Exhaust upgrade)
  const exhStage = !options.isTraffic ? Math.min(3, Math.max(0, options.upgrades?.exhaust ?? 0)) : 0;
  const exhR = 0.056 + exhStage * 0.010;
  const exhGeo = new THREE.CylinderGeometry(exhR, exhR, 0.20, 14);
  exhGeo.rotateX(Math.PI / 2);
  const exhInnerGeo = new THREE.CylinderGeometry(exhR * 0.74, exhR * 0.74, 0.21, 12);
  exhInnerGeo.rotateX(Math.PI / 2);
  geometries.push(exhGeo, exhInnerGeo);

  const exhTipMat =
    exhStage >= 2
      ? new THREE.MeshStandardMaterial({
          color: exhStage >= 3 ? 0x60a5fa : 0xd4af37,
          metalness: 0.92,
          roughness: 0.16,
        })
      : rimMat;
  if (exhTipMat !== rimMat) materials.push(exhTipMat);

  const exhPositions = dims.centerExhaust
    ? [-0.09, 0.09]
    : dims.quadExhaust
      ? [-0.56, -0.42, 0.42, 0.56]
      : [-0.48, 0.48];

  for (const sx of exhPositions) {
    const exh = new THREE.Mesh(exhGeo, exhTipMat);
    exh.position.set(sx, 0.25, dims.tailZ + (exhStage > 0 ? 0.02 : -0.01));
    const hole = new THREE.Mesh(exhInnerGeo, trimDarkMat);
    hole.position.set(sx, 0.25, dims.tailZ + (exhStage > 0 ? 0.025 : -0.005));
    chassisGroup.add(exh, hole);
  }

  const flameGeo = new THREE.ConeGeometry(0.095, 0.85, 10);
  flameGeo.rotateX(Math.PI / 2);
  const backfireOuterGeo = new THREE.ConeGeometry(0.125, 0.76, 10);
  backfireOuterGeo.rotateX(Math.PI / 2);
  const backfireCoreGeo = new THREE.ConeGeometry(0.064, 0.48, 8);
  backfireCoreGeo.rotateX(Math.PI / 2);
  const sparkGeo = new THREE.SphereGeometry(0.032, 6, 6);
  geometries.push(flameGeo, backfireOuterGeo, backfireCoreGeo, sparkGeo);

  const flameMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const backfireOuterMat = new THREE.MeshBasicMaterial({
    color: 0xff6b00,
    transparent: true,
    opacity: 0.90,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const backfireCoreMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.96,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const sparkMat = new THREE.MeshBasicMaterial({
    color: 0xfbbf24,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  materials.push(flameMat, backfireOuterMat, backfireCoreMat, sparkMat);

  const flameX = dims.centerExhaust ? 0.09 : 0.48;
  const flameLeft = new THREE.Mesh(flameGeo, flameMat);
  flameLeft.position.set(-flameX, 0.25, dims.tailZ + 0.42);
  const flameRight = new THREE.Mesh(flameGeo, flameMat);
  flameRight.position.set(flameX, 0.25, dims.tailZ + 0.42);

  const backfireLeft = new THREE.Mesh(backfireOuterGeo, backfireOuterMat);
  backfireLeft.position.set(-flameX, 0.25, dims.tailZ + 0.36);
  backfireLeft.visible = false;
  const bfCoreL = new THREE.Mesh(backfireCoreGeo, backfireCoreMat);
  bfCoreL.position.set(0, 0, -0.08);
  backfireLeft.add(bfCoreL);

  const backfireRight = new THREE.Mesh(backfireOuterGeo, backfireOuterMat);
  backfireRight.position.set(flameX, 0.25, dims.tailZ + 0.36);
  backfireRight.visible = false;
  const bfCoreR = new THREE.Mesh(backfireCoreGeo, backfireCoreMat);
  bfCoreR.position.set(0, 0, -0.08);
  backfireRight.add(bfCoreR);

  const backfireSparks: THREE.Mesh[] = [];
  if (!options.isTraffic) {
    for (let i = 0; i < 6; i++) {
      const sp = new THREE.Mesh(sparkGeo, sparkMat);
      const sx = (i % 2 === 0 ? -1 : 1) * flameX;
      sp.position.set(sx, 0.25, dims.tailZ + 0.28);
      sp.visible = false;
      chassisGroup.add(sp);
      backfireSparks.push(sp);
    }
  }

  let backfireLight: THREE.PointLight | null = null;
  if (!options.isTraffic && !options.isSoftwareGl) {
    backfireLight = new THREE.PointLight(0xff7b00, 0, 6.2, 1.8);
    backfireLight.position.set(0, 0.30, dims.tailZ + 0.48);
    chassisGroup.add(backfireLight);
  }

  chassisGroup.add(flameLeft, flameRight, backfireLeft, backfireRight);

  // 6. Modern Glowing LED Headlight & Taillight Strips
  const headLedMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    emissive: new THREE.Color(0xc7dcf5),
    emissiveIntensity: 1.15,
    roughness: 0.18,
  });
  const tailLedMat = new THREE.MeshStandardMaterial({
    color: 0xe11d2a,
    emissive: new THREE.Color(0xdc2626),
    emissiveIntensity: 1.35,
    roughness: 0.16,
  });
  materials.push(headLedMat, tailLedMat);

  const drlGeo = new THREE.BoxGeometry(0.38, 0.045, 0.06);
  const headClusterGeo = new THREE.SphereGeometry(0.065, 12, 8);
  headClusterGeo.scale(1.6, 0.65, 0.6);
  geometries.push(drlGeo, headClusterGeo);

  for (const side of [-1, 1]) {
    const drl = new THREE.Mesh(drlGeo, headLedMat);
    drl.position.set(side * (dims.bodyWidth * 0.31), dims.headlightY, dims.noseZ + 0.04);
    drl.rotation.y = side * -0.22;
    drl.rotation.z = side * 0.08;
    chassisGroup.add(drl);

    const pod = new THREE.Mesh(headClusterGeo, headLedMat);
    pod.position.set(side * (dims.bodyWidth * 0.32), dims.headlightY + 0.035, dims.noseZ + 0.06);
    chassisGroup.add(pod);
  }

  // Real Headlight SpotLights + Projected Ground Light Cones (for Lobby & Night Driving)
  const headSpotLights: THREE.SpotLight[] = [];
  const headBeamMeshes: THREE.Mesh[] = [];
  if (!options.isTraffic) {
    const beamConeGeo = new THREE.PlaneGeometry(4.4, 15.5);
    beamConeGeo.rotateX(-Math.PI / 2);
    beamConeGeo.translate(0, 0, -8.2);
    const beamMat = new THREE.MeshBasicMaterial({
      map: options.textures.underglowRadial,
      color: 0xe0f2fe,
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    geometries.push(beamConeGeo);
    materials.push(beamMat);

    for (const side of [-1, 1]) {
      const poolMesh = new THREE.Mesh(beamConeGeo, beamMat);
      poolMesh.position.set(side * (dims.bodyWidth * 0.28), 0.03, dims.noseZ);
      poolMesh.rotation.y = side * -0.06;
      poolMesh.visible = false;
      root.add(poolMesh);
      headBeamMeshes.push(poolMesh);

      if (!options.isSoftwareGl) {
        const spot = new THREE.SpotLight(0xf0f9ff, 0, 34, Math.PI / 5.2, 0.52, 1.35);
        spot.position.set(side * (dims.bodyWidth * 0.31), dims.headlightY + 0.04, dims.noseZ + 0.02);
        spot.target.position.set(side * 1.1, 0.0, dims.noseZ - 13.0);
        spot.visible = false;
        chassisGroup.add(spot);
        chassisGroup.add(spot.target);
        headSpotLights.push(spot);
      }
    }
  }

  // Full-width / twin sleek LED taillight bar
  if (
    options.style === 'porsche_gt3' ||
    options.style === 'huracan_evo' ||
    options.style === 'lafuria_v12' ||
    options.style === 'muscle_srt'
  ) {
    const fullTailGeo = new THREE.BoxGeometry(dims.bodyWidth * 0.78, 0.042, 0.05);
    geometries.push(fullTailGeo);
    const fullTail = new THREE.Mesh(fullTailGeo, tailLedMat);
    fullTail.position.set(0, dims.taillightY, dims.tailZ - 0.02);
    chassisGroup.add(fullTail);
  } else {
    const tailBarGeo = new THREE.BoxGeometry(0.42, 0.052, 0.05);
    geometries.push(tailBarGeo);
    for (const side of [-1, 1]) {
      const tl = new THREE.Mesh(tailBarGeo, tailLedMat);
      tl.position.set(side * (dims.bodyWidth * 0.30), dims.taillightY, dims.tailZ - 0.02);
      tl.rotation.y = side * 0.14;
      chassisGroup.add(tl);
    }
  }

  // 7. 4 Rounded Tires (LatheGeometry) + Clean Symmetric Sport Rims + Disc Rotors + Calipers
  const perfStage = Math.max(options.upgrades?.ecu ?? 0, options.upgrades?.gearbox ?? 0, weightLvl);
  const tireProfile: TireProfile = !options.isTraffic ? (options.tireProfile ?? 'street') : 'street';
  const tireWidthBonus = tireProfile === 'racing_wide' ? 0.055 : tireProfile === 'semi_slick' ? 0.028 : 0;
  const tireWidth = dims.tireWidth + perfStage * 0.012 + tireWidthBonus;
  const rimR = dims.tireRadius * 0.65;

  const tireGeo = createRoundedTireGeometry(dims.tireRadius, rimR, tireWidth);
  // Open-ended hollow metallic outer barrel so spokes and brake rotor sit cleanly inside!
  const rimBarrelGeo = new THREE.CylinderGeometry(rimR * 0.96, rimR * 0.96, tireWidth * 0.80, 26, 1, true);
  rimBarrelGeo.rotateZ(Math.PI / 2);
  const innerDrumGeo = new THREE.CylinderGeometry(rimR * 0.94, rimR * 0.94, 0.02, 22);
  innerDrumGeo.rotateZ(Math.PI / 2);
  const rotorScale = 0.76 + brakeLvl * 0.032;
  const rotorGeo = new THREE.CylinderGeometry(rimR * rotorScale, rimR * rotorScale, 0.026, 22);
  rotorGeo.rotateZ(Math.PI / 2);

  const rimDesign: RimDesign = !options.isTraffic ? (options.rimDesign ?? 'five_spoke') : 'five_spoke';
  const spokeCount = rimDesign === 'multi_spoke' ? 10 : rimDesign === 'turbofan' ? 10 : 5;
  const spokeWidth = rimDesign === 'multi_spoke' ? 0.018 : rimDesign === 'turbofan' ? 0.014 : 0.032;
  const hubR = 0.044;
  const spokeLen = Math.max(0.06, rimR * 0.91 - hubR);
  const spokeMidR = hubR + spokeLen * 0.5;
  // Half-spoke geometry extending radially from center hub to outer barrel without crossing opposite side
  const spokeGeo = new THREE.BoxGeometry(0.022, spokeLen, spokeWidth);
  const centerCapGeo = new THREE.CylinderGeometry(0.048, 0.052, 0.036, 16);
  centerCapGeo.rotateZ(Math.PI / 2);
  const lugGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.018, 6);
  lugGeo.rotateZ(Math.PI / 2);
  const calGeo = new THREE.BoxGeometry(0.055, 0.11 + brakeLvl * 0.012, 0.075 + brakeLvl * 0.010);

  const lipTubeR = rimDesign === 'deep_dish' ? 0.022 : 0.015;
  const lipGeo = new THREE.TorusGeometry(rimR * 0.945, lipTubeR, 10, 28);
  lipGeo.rotateY(Math.PI / 2);

  const turbofanDiscGeo =
    rimDesign === 'turbofan'
      ? new THREE.CylinderGeometry(rimR * 0.92, rimR * 0.92, 0.018, 26)
      : null;
  if (turbofanDiscGeo) {
    turbofanDiscGeo.rotateZ(Math.PI / 2);
    geometries.push(turbofanDiscGeo);
  }
  geometries.push(
    tireGeo,
    rimBarrelGeo,
    innerDrumGeo,
    rotorGeo,
    spokeGeo,
    centerCapGeo,
    lugGeo,
    calGeo,
    lipGeo
  );

  const wheelTrackX = dims.bodyWidth * 0.5 - tireWidth * 0.37;
  const wheelCoords = [
    { x: -wheelTrackX, y: dims.tireRadius, z: dims.frontAxleZ },
    { x: wheelTrackX, y: dims.tireRadius, z: dims.frontAxleZ },
    { x: -wheelTrackX, y: dims.tireRadius, z: dims.rearAxleZ },
    { x: wheelTrackX, y: dims.tireRadius, z: dims.rearAxleZ },
  ];

  const sidewallPlaneGeo = !options.isTraffic
    ? new THREE.PlaneGeometry(dims.tireRadius * 1.96, dims.tireRadius * 1.96)
    : null;
  const sidewallMat = !options.isTraffic
    ? new THREE.MeshBasicMaterial({
        map: options.textures.tireSidewall,
        transparent: true,
        opacity: 0.92,
        depthWrite: false,
      })
    : null;
  if (sidewallPlaneGeo) geometries.push(sidewallPlaneGeo);
  if (sidewallMat) materials.push(sidewallMat);

  for (const wc of wheelCoords) {
    const wg = new THREE.Group();
    const outSign = wc.x > 0 ? 1 : -1;

    const tire = new THREE.Mesh(tireGeo, tireMat);
    // Keep shadow casting on chassis lower/cabin meshes only for crisp 60 FPS shadow maps
    tire.castShadow = false;
    wg.add(tire);

    if (sidewallPlaneGeo && sidewallMat) {
      const swDecal = new THREE.Mesh(sidewallPlaneGeo, sidewallMat);
      swDecal.rotation.y = outSign * (Math.PI / 2);
      swDecal.position.x = outSign * (tireWidth * 0.486);
      wg.add(swDecal);
    }

    const barrel = new THREE.Mesh(rimBarrelGeo, rimDesign === 'deep_dish' ? rimMat : trimDarkMat);
    wg.add(barrel);

    const innerDrum = new THREE.Mesh(innerDrumGeo, trimDarkMat);
    innerDrum.position.x = outSign * -0.038;
    wg.add(innerDrum);

    const outerLip = new THREE.Mesh(lipGeo, rimMat);
    outerLip.position.x = outSign * (tireWidth * 0.38);
    wg.add(outerLip);

    const rotor = new THREE.Mesh(rotorGeo, rotorMat);
    rotor.position.x = outSign * 0.008;
    wg.add(rotor);

    const spokePlaneX =
      outSign *
      (rimDesign === 'deep_dish'
        ? tireWidth * 0.16
        : rimDesign === 'turbofan'
          ? tireWidth * 0.345
          : tireWidth * 0.31);

    if (turbofanDiscGeo) {
      const disc = new THREE.Mesh(turbofanDiscGeo, rimMat);
      disc.position.x = outSign * (tireWidth * 0.33);
      wg.add(disc);
    }

    for (let s = 0; s < spokeCount; s++) {
      const theta = (s * Math.PI * 2) / spokeCount;
      const spoke = new THREE.Mesh(spokeGeo, rimDesign === 'turbofan' ? trimDarkMat : rimMat);
      spoke.position.set(spokePlaneX, Math.cos(theta) * spokeMidR, Math.sin(theta) * spokeMidR);
      spoke.rotation.x = theta;
      wg.add(spoke);
    }

    const cap = new THREE.Mesh(centerCapGeo, rimMat);
    cap.position.x = spokePlaneX + outSign * 0.008;
    wg.add(cap);

    if (!options.isTraffic) {
      for (let ln = 0; ln < 5; ln++) {
        const la = (ln * Math.PI * 2) / 5 + 0.31;
        const lug = new THREE.Mesh(lugGeo, trimDarkMat);
        lug.position.set(
          spokePlaneX + outSign * 0.018,
          Math.cos(la) * 0.032,
          Math.sin(la) * 0.032
        );
        wg.add(lug);
      }
    }

    const caliper = new THREE.Mesh(calGeo, caliperMat);
    caliper.position.set(outSign * 0.012, rimR * 0.38, rimR * 0.42);
    wg.add(caliper);

    wg.position.set(wc.x, wc.y, wc.z);
    wg.rotation.order = 'YXZ';
    root.add(wg);
    wheels.push(wg);
  }

  // 8. Soft Chassis + Per-Tire Contact Shadow Planes
  const shadowPlaneGeo = new THREE.PlaneGeometry(dims.bodyWidth + 0.9, 5.4);
  shadowPlaneGeo.rotateX(-Math.PI / 2);
  const wheelShadowGeo = new THREE.PlaneGeometry(0.76, 1.05);
  wheelShadowGeo.rotateX(-Math.PI / 2);
  geometries.push(shadowPlaneGeo, wheelShadowGeo);

  const shadowPlaneMat = new THREE.MeshBasicMaterial({
    map: options.textures.contactShadow,
    transparent: true,
    opacity: 0.86,
    depthWrite: false,
  });
  const wheelShadowMat = new THREE.MeshBasicMaterial({
    map: options.textures.contactShadow,
    transparent: true,
    opacity: 0.92,
    depthWrite: false,
  });
  materials.push(shadowPlaneMat, wheelShadowMat);

  const contactShadowMesh = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
  contactShadowMesh.position.y = 0.012;
  root.add(contactShadowMesh);

  for (const wc of wheelCoords) {
    const ws = new THREE.Mesh(wheelShadowGeo, wheelShadowMat);
    ws.position.set(wc.x, 0.014, wc.z);
    root.add(ws);
  }

  // 9. Customizable Underglow Neon Beneath Chassis + Spawn Pulse Ring + King Crown
  const ugGeo = new THREE.PlaneGeometry(dims.bodyWidth + 1.0, 5.4);
  ugGeo.rotateX(-Math.PI / 2);
  geometries.push(ugGeo);
  const hasUg = options.underglowHex !== 'none' && !options.isTraffic;
  const resolvedUgHex = options.underglowHex === 'pulse_neon' ? '#38bdf8' : options.underglowHex;
  const underglowMat = new THREE.MeshBasicMaterial({
    map: options.textures.underglowRadial,
    color: new THREE.Color(hasUg ? resolvedUgHex : '#000000'),
    transparent: true,
    opacity: hasUg ? 0.88 : 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  materials.push(underglowMat);
  const underglowMesh = new THREE.Mesh(ugGeo, underglowMat);
  underglowMesh.position.y = 0.026;
  underglowMesh.visible = hasUg;
  root.add(underglowMesh);

  let spawnRingMesh: THREE.Mesh | null = null;
  if (!options.isTraffic) {
    const ringGeo = new THREE.RingGeometry(1.7, 2.35, 36);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xe2e8f0,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    geometries.push(ringGeo);
    materials.push(ringMat);
    spawnRingMesh = new THREE.Mesh(ringGeo, ringMat);
    spawnRingMesh.position.y = 0.035;
    spawnRingMesh.visible = false;
    root.add(spawnRingMesh);
  }

  let underglowLight: THREE.PointLight | null = null;
  if (!options.isTraffic && !options.isSoftwareGl) {
    underglowLight = new THREE.PointLight(
      hasUg ? resolvedUgHex : '#0ea5e9',
      hasUg ? 2.4 : 0,
      7.8,
      1.8
    );
    underglowLight.position.set(0, 0.24, 0);
    root.add(underglowLight);
  }

  // Floating Golden 3D King Crown ("Rey de la Autopista")
  let kingCrownGroup: THREE.Group | null = null;
  if (!options.isTraffic) {
    kingCrownGroup = new THREE.Group();
    const crownBandGeo = new THREE.CylinderGeometry(0.24, 0.20, 0.11, 12, 1, true);
    const crownSpikeGeo = new THREE.ConeGeometry(0.055, 0.16, 6);
    const crownMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      emissive: new THREE.Color(0xf59e0b),
      emissiveIntensity: 1.4,
      metalness: 0.9,
      roughness: 0.16,
      side: THREE.DoubleSide,
    });
    geometries.push(crownBandGeo, crownSpikeGeo);
    materials.push(crownMat);
    const band = new THREE.Mesh(crownBandGeo, crownMat);
    kingCrownGroup.add(band);
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      const spike = new THREE.Mesh(crownSpikeGeo, crownMat);
      spike.position.set(Math.cos(a) * 0.21, 0.11, Math.sin(a) * 0.21);
      kingCrownGroup.add(spike);
    }
    kingCrownGroup.position.set(0, 1.62, -0.15);
    kingCrownGroup.visible = false;
    root.add(kingCrownGroup);
  }

  const tmpColor = new THREE.Color();
  const basePaintColor = new THREE.Color(options.paintHex);

  let headlightsActive = false;

  return {
    root,
    chassisGroup,
    wheels,
    paintMat,
    rimMat,
    rotorMat,
    glassMat,
    headLedMat,
    tailLedMat,
    underglowMat,
    underglowMesh,
    underglowLight,
    spawnRingMesh,
    activeWingGroup,
    activeWingBaseY,
    activeWingBaseRotX,
    flameLeft,
    flameRight,
    backfireLeft,
    backfireRight,
    backfireOuterMat,
    backfireCoreMat,
    backfireSparks,
    backfireLight,
    cockpitGroup,
    cockpitEyeOffset,
    kingCrownGroup,
    updatePlateText: (text: string) => {
      if (!plateMat) return;
      const nextTex = createLicensePlateTexture(text);
      if (currentPlateTex) {
        currentPlateTex.dispose();
        const idx = disposableTextures.indexOf(currentPlateTex);
        if (idx >= 0) disposableTextures.splice(idx, 1);
      }
      currentPlateTex = nextTex;
      disposableTextures.push(nextTex);
      plateMat.map = nextTex;
      plateMat.needsUpdate = true;
    },
    applyPaintFinish: (finish: PaintFinish) => {
      applyFinishParams(paintMat, finish, options.isTraffic);
      if (finish !== 'chameleon') {
        paintMat.color.copy(basePaintColor);
      }
    },
    applyWindowTint: (tint: WindowTintOption) => {
      applyTintParams(glassMat, tint, options.isTraffic);
    },
    setHeadlightsOn: (on: boolean) => {
      headlightsActive = on;
      headLedMat.emissiveIntensity = on ? 1.45 : 0.75;
      for (const spot of headSpotLights) {
        spot.visible = on;
        spot.intensity = on ? 12 : 0;
      }
      for (const pool of headBeamMeshes) {
        pool.visible = on;
        (pool.material as THREE.MeshBasicMaterial).opacity = on ? 0.14 : 0;
      }
    },
    flashHighBeams: (on: boolean) => {
      const showBeam = on || headlightsActive;
      headLedMat.emissiveIntensity = on ? 2.8 : headlightsActive ? 1.45 : 0.75;
      for (const spot of headSpotLights) {
        spot.visible = showBeam;
        spot.intensity = on ? 28 : headlightsActive ? 12 : 0;
      }
      for (const pool of headBeamMeshes) {
        pool.visible = showBeam;
        (pool.material as THREE.MeshBasicMaterial).opacity = on
          ? 0.32
          : headlightsActive
            ? 0.14
            : 0;
      }
    },
    setBrakeHeat: (heat01: number) => {
      const clamped = Math.min(1, Math.max(0, heat01));
      rotorMat.emissiveIntensity = clamped * 2.3;
    },
    setInteriorCockpitMode: (enabled: boolean) => {
      if (!cockpitGroup) return;
      cabinMesh.visible = !enabled;
      glassMesh.visible = !enabled;
      if (exteriorDash) exteriorDash.visible = !enabled;
      if (exteriorWheelGroup) exteriorWheelGroup.visible = !enabled;
      if (exteriorStarlightPoints) exteriorStarlightPoints.visible = !enabled;
      cockpitGroup.visible = enabled;
    },
    updateCockpit: (steerAngle, rpm, maxRpm, speedKmh, gear, nitro) => {
      if (!cockpitGroup || !cockpitGroup.visible) return;
      if (cockpitWheelGroup) {
        cockpitWheelGroup.rotation.z = steerAngle * 2.15;
      }
      const now = performance.now();
      if (!cockpitGaugeCtx || !cockpitGaugeTex || now - lastCockpitRedrawTime < 45) return;
      lastCockpitRedrawTime = now;

      const ctx = cockpitGaugeCtx;
      const rpmRatio = Math.min(1, Math.max(0, rpm / Math.max(6000, maxRpm)));
      const gearLbl = gear < 0 ? 'R' : gear === 0 ? 'N' : `${gear}`;

      if (cockpitStyle === 'classic_sedan') {
        // Classic JDM Twin Analog Dials (Tachometer + Speedometer) + Odometer Screen
        ctx.fillStyle = '#0b0f14';
        ctx.fillRect(0, 0, 512, 192);
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 4;
        ctx.strokeRect(4, 4, 504, 184);

        const drawAnalogDial = (cx: number, cy: number, r: number, val01: number, label: string, redZoneStart: number) => {
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.fillStyle = '#05080d';
          ctx.fill();
          ctx.lineWidth = 3;
          ctx.strokeStyle = '#475569';
          ctx.stroke();

          const startAng = Math.PI * 0.78;
          const sweepAng = Math.PI * 1.44;
          for (let t = 0; t <= 10; t++) {
            const frac = t / 10;
            const ang = startAng + frac * sweepAng;
            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(ang) * (r - 12), cy + Math.sin(ang) * (r - 12));
            ctx.lineTo(cx + Math.cos(ang) * (r - 4), cy + Math.sin(ang) * (r - 4));
            ctx.strokeStyle = frac >= redZoneStart ? '#ef4444' : '#cbd5e1';
            ctx.lineWidth = 2.5;
            ctx.stroke();
          }

          const needleAng = startAng + THREE.MathUtils.clamp(val01, 0, 1) * sweepAng;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(needleAng) * (r - 10), cy + Math.sin(needleAng) * (r - 10));
          ctx.strokeStyle = '#f97316';
          ctx.lineWidth = 3.5;
          ctx.stroke();

          ctx.fillStyle = '#94a3b8';
          ctx.font = '700 13px "Plus Jakarta Sans", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(label, cx, cy + 32);
        };

        drawAnalogDial(115, 98, 66, rpmRatio, 'x1000 RPM', 0.8);
        drawAnalogDial(397, 98, 66, Math.min(1, speedKmh / 280), 'KM/H', 1.1);

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(206, 44, 100, 104);
        ctx.strokeStyle = '#1e293b';
        ctx.strokeRect(206, 44, 100, 104);
        ctx.fillStyle = gear < 0 ? '#f87171' : '#f59e0b';
        ctx.font = '800 54px "Barlow Condensed", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(gearLbl, 256, 102);
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '700 22px "Barlow Condensed", sans-serif';
        ctx.fillText(`${Math.round(speedKmh)} KM/H`, 256, 134);
      } else {
        // Digital Motorsport / Hypercar Telemetry Cluster
        const accentHex =
          options.style === 'lafuria_v12'
            ? '#facc15'
            : cockpitStyle === 'hypercar'
              ? '#fb923c'
              : cockpitStyle === 'muscle_v8'
                ? '#ef4444'
                : '#22d3ee';
        ctx.fillStyle = '#060910';
        ctx.fillRect(0, 0, 512, 192);
        ctx.strokeStyle = accentHex;
        ctx.lineWidth = 3;
        ctx.strokeRect(4, 4, 504, 184);

        const bars = 20;
        const activeBars = Math.round(rpmRatio * bars);
        for (let i = 0; i < bars; i++) {
          ctx.fillStyle =
            i < activeBars
              ? i >= 16
                ? '#ef4444'
                : i >= 12
                  ? '#f59e0b'
                  : accentHex
              : '#1e293b';
          ctx.fillRect(22 + i * 23, 20, 18, 22);
        }

        ctx.fillStyle = '#f8fafc';
        ctx.font = '800 76px "Barlow Condensed", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`${Math.round(speedKmh)}`, 26, 128);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '700 22px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('KM/H', 155, 125);

        ctx.fillStyle = gear < 0 ? '#f87171' : gear === 0 ? '#94a3b8' : accentHex;
        ctx.font = '800 84px "Barlow Condensed", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(gearLbl, 340, 130);

        ctx.fillStyle = '#1e293b';
        ctx.fillRect(26, 152, 460, 14);
        ctx.fillStyle = accentHex;
        ctx.fillRect(26, 152, Math.round(4.6 * Math.min(100, Math.max(0, nitro))), 14);
      }

      cockpitGaugeTex.needsUpdate = true;
    },
    setKingCrown: (active: boolean) => {
      if (kingCrownGroup) kingCrownGroup.visible = active;
    },
    updateVisualPulse: (time: number, isChameleon: boolean, isPulseNeon: boolean) => {
      if (isChameleon) {
        const hue = (time * 0.09) % 1;
        tmpColor.setHSL(hue, 0.72, 0.42);
        paintMat.color.copy(tmpColor);
      }
      if (isPulseNeon && underglowMesh.visible) {
        const hue = (time * 0.22) % 1;
        tmpColor.setHSL(hue, 0.95, 0.56);
        underglowMat.color.copy(tmpColor);
        underglowMat.opacity = 0.72 + Math.sin(time * 5.5) * 0.22;
        if (underglowLight) {
          underglowLight.color.copy(tmpColor);
          underglowLight.intensity = 2.0 + Math.sin(time * 5.5) * 0.9;
        }
      }
      if (kingCrownGroup && kingCrownGroup.visible) {
        kingCrownGroup.rotation.y = time * 1.4;
        kingCrownGroup.position.y = 1.62 + Math.sin(time * 2.8) * 0.05;
      }
    },
    dispose: () => {
      disposableTextures.forEach((t) => t.dispose());
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
    },
  };
}

export interface DriverCharacter {
  root: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  updateMotion: (moveSpeedNorm: number, dt: number) => void;
  dispose: () => void;
}

export function buildDriverCharacter(textures: ProceduralTextureSet): DriverCharacter {
  const root = new THREE.Group();
  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];

  const jacketMat = new THREE.MeshStandardMaterial({
    color: 0x161b24,
    roughness: 0.76,
    metalness: 0.08,
  });
  const stripeMat = new THREE.MeshStandardMaterial({
    color: 0xc81e1e,
    roughness: 0.56,
    metalness: 0.08,
  });
  const pantsMat = new THREE.MeshStandardMaterial({
    color: 0x11151d,
    roughness: 0.84,
    metalness: 0.04,
  });
  const shoeMat = new THREE.MeshStandardMaterial({
    color: 0xb4bec9,
    roughness: 0.78,
    metalness: 0.04,
  });
  const gloveMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.68,
    metalness: 0.08,
  });
  const helmetMat = new THREE.MeshPhysicalMaterial({
    color: 0xd0d7e0,
    roughness: 0.24,
    metalness: 0.18,
    clearcoat: 0.55,
    clearcoatRoughness: 0.12,
    envMapIntensity: 0.75,
  });
  const visorMat = new THREE.MeshPhysicalMaterial({
    color: 0x090d16,
    roughness: 0.08,
    metalness: 0.72,
    clearcoat: 0.75,
    envMapIntensity: 0.85,
  });
  materials.push(jacketMat, stripeMat, pantsMat, shoeMat, gloveMat, helmetMat, visorMat);

  // Ground contact shadow disc
  const shadowGeo = new THREE.PlaneGeometry(0.95, 0.95);
  shadowGeo.rotateX(-Math.PI / 2);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: textures.contactShadow,
    transparent: true,
    opacity: 0.72,
    depthWrite: false,
  });
  geometries.push(shadowGeo);
  materials.push(shadowMat);
  const shadow = new THREE.Mesh(shadowGeo, shadowMat);
  shadow.position.y = 0.015;
  root.add(shadow);

  // Pelvis / Body root for natural bounce & forward sprint lean
  const bodyRig = new THREE.Group();
  root.add(bodyRig);

  // Articulated 2-segment legs (Hip -> Thigh -> Knee -> Shin + Shoe)
  const thighGeo = new THREE.CapsuleGeometry(0.082, 0.26, 6, 10);
  const shinGeo = new THREE.CapsuleGeometry(0.068, 0.26, 6, 10);
  const shoeGeo = new THREE.BoxGeometry(0.14, 0.09, 0.24);
  geometries.push(thighGeo, shinGeo, shoeGeo);

  const makeLeg = (x: number) => {
    const hip = new THREE.Group();
    hip.position.set(x, 0.84, 0);
    const thigh = new THREE.Mesh(thighGeo, pantsMat);
    thigh.position.y = -0.18;
    thigh.castShadow = true;

    const knee = new THREE.Group();
    knee.position.set(0, -0.38, 0);
    const shin = new THREE.Mesh(shinGeo, pantsMat);
    shin.position.y = -0.18;
    shin.castShadow = true;
    const shoe = new THREE.Mesh(shoeGeo, shoeMat);
    shoe.position.set(0, -0.39, -0.045);

    knee.add(shin, shoe);
    hip.add(thigh, knee);
    bodyRig.add(hip);
    return { hip, knee };
  };

  const leftLegRig = makeLeg(-0.12);
  const rightLegRig = makeLeg(0.12);

  // Torso group for realistic upper-body counter-twist and breathing
  const torsoGroup = new THREE.Group();
  torsoGroup.position.set(0, 0.86, 0);
  bodyRig.add(torsoGroup);

  const torsoGeo = new THREE.CapsuleGeometry(0.19, 0.34, 8, 14);
  const collarGeo = new THREE.BoxGeometry(0.32, 0.07, 0.24);
  geometries.push(torsoGeo, collarGeo);
  const torso = new THREE.Mesh(torsoGeo, jacketMat);
  torso.scale.set(1.12, 1, 0.76);
  torso.position.y = 0.28;
  torso.castShadow = true;
  const stripe = new THREE.Mesh(collarGeo, stripeMat);
  stripe.position.set(0, 0.46, 0);
  torsoGroup.add(torso, stripe);

  // Articulated 2-segment arms (Shoulder -> UpperArm -> Elbow -> Forearm + Glove)
  const upperArmGeo = new THREE.CapsuleGeometry(0.058, 0.20, 6, 10);
  const forearmGeo = new THREE.CapsuleGeometry(0.048, 0.20, 6, 10);
  const handGeo = new THREE.SphereGeometry(0.052, 8, 8);
  geometries.push(upperArmGeo, forearmGeo, handGeo);

  const makeArm = (x: number) => {
    const shoulder = new THREE.Group();
    shoulder.position.set(x, 0.48, 0);
    const upperArm = new THREE.Mesh(upperArmGeo, jacketMat);
    upperArm.position.y = -0.13;
    upperArm.castShadow = true;

    const elbow = new THREE.Group();
    elbow.position.set(0, -0.26, 0);
    const forearm = new THREE.Mesh(forearmGeo, jacketMat);
    forearm.position.y = -0.12;
    forearm.castShadow = true;
    const hand = new THREE.Mesh(handGeo, gloveMat);
    hand.position.y = -0.25;

    elbow.add(forearm, hand);
    shoulder.add(upperArm, elbow);
    torsoGroup.add(shoulder);
    return { shoulder, elbow };
  };

  const leftArmRig = makeArm(-0.27);
  const rightArmRig = makeArm(0.27);

  // Track-Day Helmet + Visor
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.68, 0);
  const headGeo = new THREE.SphereGeometry(0.155, 16, 14);
  const visorGeo = new THREE.BoxGeometry(0.22, 0.085, 0.14);
  geometries.push(headGeo, visorGeo);
  const head = new THREE.Mesh(headGeo, helmetMat);
  head.position.set(0, 0.08, 0);
  head.castShadow = true;
  const visor = new THREE.Mesh(visorGeo, visorMat);
  visor.position.set(0, 0.09, -0.105);
  headGroup.add(head, visor);
  torsoGroup.add(headGroup);

  let phase = 0;

  return {
    root,
    leftLeg: leftLegRig.hip,
    rightLeg: rightLegRig.hip,
    leftArm: leftArmRig.shoulder,
    rightArm: rightArmRig.shoulder,
    updateMotion: (moveSpeedNorm: number, dt: number) => {
      if (moveSpeedNorm > 0.04) {
        const freq = 9.2 + moveSpeedNorm * 4.5;
        phase += dt * freq;
        const amp = 0.52 + moveSpeedNorm * 0.34;
        const s = Math.sin(phase);
        const c = Math.cos(phase);

        // Hip swing + realistic knee bend (bends backward during recovery/back-swing)
        leftLegRig.hip.rotation.x = s * amp;
        rightLegRig.hip.rotation.x = -s * amp;
        leftLegRig.knee.rotation.x = -Math.max(0, -s * 0.95 - 0.1) * (0.65 + moveSpeedNorm * 0.45);
        rightLegRig.knee.rotation.x = -Math.max(0, s * 0.95 - 0.1) * (0.65 + moveSpeedNorm * 0.45);

        // Shoulder swing + bent elbow flexion
        leftArmRig.shoulder.rotation.x = -s * amp * 0.85;
        rightArmRig.shoulder.rotation.x = s * amp * 0.85;
        leftArmRig.elbow.rotation.x = 0.45 + Math.max(0, -s) * 0.55;
        rightArmRig.elbow.rotation.x = 0.45 + Math.max(0, s) * 0.55;

        // Vertical stride bob, sprint forward lean, and shoulder counter-rotation
        bodyRig.position.y = Math.abs(c) * (0.032 + moveSpeedNorm * 0.025);
        torsoGroup.rotation.x = 0.06 + moveSpeedNorm * 0.14;
        torsoGroup.rotation.y = s * 0.11;
        headGroup.rotation.x = -torsoGroup.rotation.x * 0.55;
      } else {
        // Subtle idle breathing & smooth relaxation
        phase += dt * 2.1;
        const damp = 1 - Math.exp(-10 * dt);
        leftLegRig.hip.rotation.x = THREE.MathUtils.lerp(leftLegRig.hip.rotation.x, 0, damp);
        rightLegRig.hip.rotation.x = THREE.MathUtils.lerp(rightLegRig.hip.rotation.x, 0, damp);
        leftLegRig.knee.rotation.x = THREE.MathUtils.lerp(leftLegRig.knee.rotation.x, 0, damp);
        rightLegRig.knee.rotation.x = THREE.MathUtils.lerp(rightLegRig.knee.rotation.x, 0, damp);
        leftArmRig.shoulder.rotation.x = THREE.MathUtils.lerp(leftArmRig.shoulder.rotation.x, 0, damp);
        rightArmRig.shoulder.rotation.x = THREE.MathUtils.lerp(rightArmRig.shoulder.rotation.x, 0, damp);
        leftArmRig.elbow.rotation.x = THREE.MathUtils.lerp(leftArmRig.elbow.rotation.x, 0.14, damp);
        rightArmRig.elbow.rotation.x = THREE.MathUtils.lerp(rightArmRig.elbow.rotation.x, 0.14, damp);
        bodyRig.position.y = THREE.MathUtils.lerp(bodyRig.position.y, Math.sin(phase) * 0.006, damp);
        torsoGroup.rotation.x = THREE.MathUtils.lerp(torsoGroup.rotation.x, 0, damp);
        torsoGroup.rotation.y = THREE.MathUtils.lerp(torsoGroup.rotation.y, 0, damp);
        headGroup.rotation.x = THREE.MathUtils.lerp(headGroup.rotation.x, 0, damp);
      }
    },
    dispose: () => {
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
    },
  };
}
