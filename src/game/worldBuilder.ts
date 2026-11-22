import * as THREE from 'three';
import { Sky } from 'three/examples/jsm/objects/Sky.js';
import { ProceduralTextureSet } from './textures';
import { CAR_CATALOG, GraphicsQuality, ViewDistance, WeatherMode } from './types';
import { buildCompositeVehicle, BuiltVehicle } from './vehicleBuilder';

export const HIGHWAY_Y = 4.5;
export const RAMP_BOTTOM_Z = 10.0;
export const RAMP_TOP_Z = -122.0;
export const RAMP_MERGE_END_Z = -195.0;
const COMPLEX_SHIFT_X = 12.0;

export const PARKING_PLAYER_CAR_POS = { x: 50.2, y: 0.015, z: 14.5, rotY: -2.36 };
export const TUNER_ENTRY_POS = { x: 42.0, y: 0, z: -1.8 };
export const TUNER_BAY_POS = { x: 42.0, y: 0, z: -7.6 };
export const TUNER_BAY_X_CENTERS = [36.8, 42.0, 47.2];
export const DEALERSHIP_ENTRY_POS = { x: 63.0, y: 0, z: 2.2 };
export const DEALERSHIP_COUNTER_POS = { x: 66.4, y: 0, z: -0.8 };
export const DEALERSHIP_FOCUS_POS = { x: 63.5, y: 1.0, z: -10.8 };
export const PARKING_BOUNDS = { minX: 34.3, maxX: 78.8, minZ: -1.6, maxZ: 28.8 };
export const DEALERSHIP_INTERIOR_BOUNDS = { minX: 50.4, maxX: 75.4, minZ: -17.4, maxZ: 1.8 };
export const INTERIOR_CONNECT_BOUNDS = { minX: 49.2, maxX: 51.2, minZ: -9.8, maxZ: -6.2 };
export const WALK_DOOR_BOUNDS = { minX: 60.0, maxX: 66.0, minZ: -1.8, maxZ: 3.0 };
export const CAR_MEET_BOUNDS = { minX: 38.5, maxX: 48.5, minZ: 18.5, maxZ: 26.5 };
export const CAR_MEET_CENTER = { x: 43.5, z: 22.5 };
export const CONTRACT_POS = { x: 37.0, y: 0, z: 6.2 };

export interface BoxObstacle2D {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export const PADDOCK_OBSTACLES: BoxObstacle2D[] = [
  // Car carrier truck (back-left)
  { minX: 64.0, maxX: 73.5, minZ: 5.5, maxZ: 12.8 },
  // Stacked shipping containers
  { minX: 69.0, maxX: 76.2, minZ: 14.4, maxZ: 19.0 },
  // Red paddock tent #1 + parked car
  { minX: 64.5, maxX: 70.2, minZ: 20.4, maxZ: 25.8 },
  // Red paddock tent #2 + parked car
  { minX: 57.2, maxX: 62.8, minZ: 23.0, maxZ: 28.4 },
  // Giant leaderboard billboard pylons
  { minX: 75.8, maxX: 79.6, minZ: 1.8, maxZ: 7.2 },
];

// Millimeter-aligned 2D AABB colliders (world coordinates) matching every visual wall, barrier, glass & pole
export const WALL_COLLIDERS_2D: BoxObstacle2D[] = [
  // Bottom ramp apron west concrete wall (world x=21.75)
  { minX: 21.45, maxX: 22.05, minZ: 7.75, maxZ: 30.35 },
  // South curb + chain-link fence
  { minX: 21.50, maxX: 80.10, minZ: 29.75, maxZ: 30.40 },
  // East chain-link fence
  { minX: 79.60, maxX: 80.15, minZ: 2.00, maxZ: 30.35 },
  // Ramp/Parking divider rail north + bollard (world x=34.0)
  { minX: 33.74, maxX: 34.26, minZ: -1.85, maxZ: 9.16 },
  // Ramp/Parking divider rail south + bollard (world x=34.0)
  { minX: 33.74, maxX: 34.26, minZ: 27.34, maxZ: 30.00 },
  // Ramp right-wall bottom corner abutment connecting to divider rail
  { minX: 33.00, maxX: 34.18, minZ: 8.85, maxZ: 10.15 },
  // Taller Ghost Garage 78 outer west wall
  { minX: 33.95, maxX: 34.35, minZ: -13.70, maxZ: -1.90 },
  // Taller back wall
  { minX: 33.95, maxX: 50.10, minZ: -13.70, maxZ: -13.30 },
  // Taller front matte-black structural columns (z=-2.0)
  { minX: 34.02, maxX: 34.38, minZ: -2.18, maxZ: -1.82 },
  { minX: 39.22, maxX: 39.58, minZ: -2.18, maxZ: -1.82 },
  { minX: 44.42, maxX: 44.78, minZ: -2.18, maxZ: -1.82 },
  { minX: 49.62, maxX: 49.98, minZ: -2.18, maxZ: -1.82 },
  // Taller/Concesionario divider wall segments (world x=50.0, doorway open z=-9.8..-6.2)
  { minX: 49.82, maxX: 50.18, minZ: -13.70, maxZ: -9.80 },
  { minX: 49.82, maxX: 50.18, minZ: -6.20, maxZ: -1.95 },
  // Concesionario west glass wall (z=-2.0..+2.0)
  { minX: 49.82, maxX: 50.18, minZ: -2.00, maxZ: 2.18 },
  // Concesionario front glass left (doorway open x=60.0..66.0)
  { minX: 50.00, maxX: 60.05, minZ: 1.82, maxZ: 2.22 },
  // Concesionario front glass right
  { minX: 65.95, maxX: 76.00, minZ: 1.82, maxZ: 2.22 },
  // Concesionario back wall
  { minX: 49.90, maxX: 76.10, minZ: -18.10, maxZ: -17.70 },
  // Concesionario east wall
  { minX: 75.65, maxX: 76.05, minZ: -18.10, maxZ: 2.18 },
  // Zona Car Meet sign post
  { minX: 43.30, maxX: 43.70, minZ: 26.65, maxZ: 27.05 },
  // Contrato Express kiosk
  { minX: 35.55, maxX: 36.25, minZ: 5.85, maxZ: 6.55 },
  // Parking streetlamp poles
  { minX: 36.32, maxX: 36.68, minZ: 28.02, maxZ: 28.38 },
  { minX: 51.82, maxX: 52.18, minZ: 28.02, maxZ: 28.38 },
  { minX: 67.32, maxX: 67.68, minZ: 28.02, maxZ: 28.38 },
  { minX: 77.32, maxX: 77.68, minZ: 13.82, maxZ: 14.18 },
];

// Additional barriers solid to vehicles only (walkable on foot)
export const CAR_ONLY_COLLIDERS_2D: BoxObstacle2D[] = [
  // Concesionario pedestrian front doorway (cars cannot drive inside glass showroom)
  { minX: 59.80, maxX: 66.20, minZ: 1.75, maxZ: 2.25 },
  // Interior workshop-to-showroom pedestrian doorway
  { minX: 49.80, maxX: 50.20, minZ: -9.85, maxZ: -6.15 },
];

export function getRampElevationAtZ(z: number): number {
  if (z >= RAMP_BOTTOM_Z) return 0;
  if (z <= RAMP_TOP_Z) return HIGHWAY_Y;
  const t = (RAMP_BOTTOM_Z - z) / (RAMP_BOTTOM_Z - RAMP_TOP_Z);
  return HIGHWAY_Y * (3 * t * t - 2 * t * t * t);
}

export function getRampSlopeAtZ(z: number): number {
  if (z >= RAMP_BOTTOM_Z || z <= RAMP_TOP_Z) return 0;
  const span = RAMP_BOTTOM_Z - RAMP_TOP_Z;
  const t = (RAMP_BOTTOM_Z - z) / span;
  // dy / d(-z) = HIGHWAY_Y * (6t - 6t^2) / span
  return (HIGHWAY_Y * (6 * t * (1 - t))) / span;
}

export function getRampBoundsAtZ(z: number): { leftX: number; rightX: number } {
  if (z >= RAMP_BOTTOM_Z) {
    return { leftX: 22.0, rightX: 33.0 };
  }
  if (z > RAMP_TOP_Z) {
    const t = (RAMP_BOTTOM_Z - z) / (RAMP_BOTTOM_Z - RAMP_TOP_Z);
    return {
      leftX: 22.0 - t * 1.2,
      rightX: 33.0 - t * 1.2,
    };
  }
  if (z > RAMP_MERGE_END_Z) {
    const t = (RAMP_TOP_Z - z) / (RAMP_TOP_Z - RAMP_MERGE_END_Z);
    return {
      leftX: 20.8,
      rightX: 31.8 - t * 10.6,
    };
  }
  return { leftX: 20.8, rightX: 21.2 };
}

export interface TrackSample {
  x: number;
  z: number;
  tx: number;
  tz: number;
  rx: number;
  rz: number;
  yaw: number;
  s: number;
}

export interface TrackProjection {
  s: number;
  laneOffset: number;
  cx: number;
  cz: number;
  tx: number;
  tz: number;
  rx: number;
  rz: number;
  yaw: number;
}

export interface MedianOpeningWindow {
  startS: number;
  endS: number;
  centerS: number;
}

export interface ClosedLoopTrack {
  totalLength: number;
  sampleCount: number;
  samples: TrackSample[];
  rampMergeStartS: number;
  rampMergeEndS: number;
  medianOpenings: MedianOpeningWindow[];
  wrapS: (s: number) => number;
  shortestSignedDeltaS: (fromS: number, toS: number) => number;
  isInRampMergeZone: (s: number) => boolean;
  isInMedianOpening: (s: number) => boolean;
  sampleAtS: (s: number, out: TrackSample) => TrackSample;
  projectToTrack: (
    wx: number,
    wz: number,
    hintS: number | null,
    out: TrackProjection
  ) => TrackProjection;
  minDistanceToTrack: (wx: number, wz: number) => number;
}

export interface ShowcaseEntry {
  carId: string;
  x: number;
  z: number;
  vehicle: BuiltVehicle;
}

export interface HighwayRadarNode {
  id: string;
  label: string;
  s: number;
  limitKmh: number;
  x: number;
  z: number;
  flashMesh: THREE.Mesh;
}

export interface ContractCheckpointNode {
  s: number;
  x: number;
  z: number;
  yaw: number;
  group: THREE.Group;
  ringMat: THREE.MeshBasicMaterial;
}

export interface MetropolisWorld {
  group: THREE.Group;
  parkingComplexGroup: THREE.Group;
  track: ClosedLoopTrack;
  showcaseEntries: ShowcaseEntry[];
  radarNodes: HighwayRadarNode[];
  contractCheckpoints: ContractCheckpointNode[];
  cullableGroups: THREE.Object3D[];
  asphaltMat: THREE.MeshPhysicalMaterial;
  roadMesh: THREE.Mesh;
  cityGround: THREE.Mesh;
  rainSystem: THREE.LineSegments;
  rainPositions: Float32Array;
  rainCount: number;
  hemiLight: THREE.HemisphereLight;
  keyLight: THREE.DirectionalLight;
  setAtmosphere: (weather: WeatherMode, scene: THREE.Scene) => void;
  setQuality: (quality: GraphicsQuality) => void;
  setViewDistance: (
    viewDist: ViewDistance,
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera
  ) => void;
  updateScroll: (
    anchorX: number,
    anchorZ: number,
    anchorY: number,
    speedMs: number,
    dt: number,
    isStorm: boolean,
    inParking: boolean
  ) => void;
  dispose: () => void;
}

function isSInWindow(ws: number, startS: number, endS: number): boolean {
  if (startS <= endS) {
    return ws >= startS && ws <= endS;
  }
  return ws >= startS || ws <= endS;
}

function createClosedLoopTrack(): ClosedLoopTrack {
  // Ruler-straight Northbound/Southbound Home Straight along x = 0 from z = +225 to z = -235
  // followed by a varied 3.5+ km closed elevated highway loop with sweeping curves & S-bends.
  const controlPoints = [
    new THREE.Vector3(0, 0, 225),
    new THREE.Vector3(0, 0, 150),
    new THREE.Vector3(0, 0, 75),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, -75),
    new THREE.Vector3(0, 0, -150),
    new THREE.Vector3(0, 0, -225),

    // North-West high-speed sweeper
    new THREE.Vector3(-28, 0, -315),
    new THREE.Vector3(-110, 0, -395),
    new THREE.Vector3(-235, 0, -455),

    // Northern Wangan S-curves
    new THREE.Vector3(-390, 0, -475),
    new THREE.Vector3(-540, 0, -415),
    new THREE.Vector3(-685, 0, -470),
    new THREE.Vector3(-820, 0, -395),

    // West panoramic hairpin curve
    new THREE.Vector3(-905, 0, -275),
    new THREE.Vector3(-925, 0, -130),
    new THREE.Vector3(-880, 0, 25),

    // South-West technical curves returning toward Home Straight
    new THREE.Vector3(-790, 0, 175),
    new THREE.Vector3(-655, 0, 275),
    new THREE.Vector3(-495, 0, 335),
    new THREE.Vector3(-335, 0, 355),
    new THREE.Vector3(-185, 0, 325),
    new THREE.Vector3(-75, 0, 280),
  ];

  const curve = new THREE.CatmullRomCurve3(controlPoints, true, 'catmullrom', 0.5);
  const totalLength = curve.getLength();
  const sampleCount = 2048;
  const spaced = curve.getSpacedPoints(sampleCount);

  const samples: TrackSample[] = new Array(sampleCount);
  for (let i = 0; i < sampleCount; i++) {
    const prev = spaced[(i - 1 + sampleCount) % sampleCount];
    const curr = spaced[i];
    const next = spaced[(i + 1) % sampleCount];
    let tx = next.x - prev.x;
    let tz = next.z - prev.z;
    const len = Math.hypot(tx, tz) || 1;
    tx /= len;
    tz /= len;
    const rx = -tz;
    const rz = tx;
    const yaw = Math.atan2(-tx, -tz);
    samples[i] = {
      x: curr.x,
      z: curr.z,
      tx,
      tz,
      rx,
      rz,
      yaw,
      s: (i / sampleCount) * totalLength,
    };
  }

  const wrapS = (s: number) => ((s % totalLength) + totalLength) % totalLength;

  const shortestSignedDeltaS = (fromS: number, toS: number) => {
    let d = wrapS(toS) - wrapS(fromS);
    if (d > totalLength * 0.5) d -= totalLength;
    if (d < -totalLength * 0.5) d += totalLength;
    return d;
  };

  const sampleAtS = (s: number, out: TrackSample): TrackSample => {
    const wrapped = wrapS(s);
    const fIdx = (wrapped / totalLength) * sampleCount;
    const i0 = Math.floor(fIdx) % sampleCount;
    const i1 = (i0 + 1) % sampleCount;
    const alpha = fIdx - Math.floor(fIdx);
    const a = samples[i0];
    const b = samples[i1];

    const x = a.x + (b.x - a.x) * alpha;
    const z = a.z + (b.z - a.z) * alpha;
    let tx = a.tx + (b.tx - a.tx) * alpha;
    let tz = a.tz + (b.tz - a.tz) * alpha;
    const tLen = Math.hypot(tx, tz) || 1;
    tx /= tLen;
    tz /= tLen;
    const rx = -tz;
    const rz = tx;
    const yaw = Math.atan2(-tx, -tz);

    out.x = x;
    out.z = z;
    out.tx = tx;
    out.tz = tz;
    out.rx = rx;
    out.rz = rz;
    out.yaw = yaw;
    out.s = wrapped;
    return out;
  };

  const projectToTrack = (
    wx: number,
    wz: number,
    hintS: number | null,
    out: TrackProjection
  ): TrackProjection => {
    let bestIdx = 0;
    let bestDistSq = Infinity;

    if (hintS !== null) {
      const centerIdx = Math.floor((wrapS(hintS) / totalLength) * sampleCount) % sampleCount;
      const windowRadius = 72;
      for (let off = -windowRadius; off <= windowRadius; off++) {
        const idx = (centerIdx + off + sampleCount) % sampleCount;
        const p = samples[idx];
        const dx = wx - p.x;
        const dz = wz - p.z;
        const dSq = dx * dx + dz * dz;
        if (dSq < bestDistSq) {
          bestDistSq = dSq;
          bestIdx = idx;
        }
      }
    }

    if (hintS === null || bestDistSq > 1100) {
      bestDistSq = Infinity;
      for (let i = 0; i < sampleCount; i++) {
        const p = samples[i];
        const dx = wx - p.x;
        const dz = wz - p.z;
        const dSq = dx * dx + dz * dz;
        if (dSq < bestDistSq) {
          bestDistSq = dSq;
          bestIdx = i;
        }
      }
    }

    const base = samples[bestIdx];
    const dx = wx - base.x;
    const dz = wz - base.z;
    const along = dx * base.tx + dz * base.tz;
    const refinedS = wrapS(base.s + along);

    const tmp: TrackSample = {
      x: 0,
      z: 0,
      tx: 0,
      tz: -1,
      rx: 1,
      rz: 0,
      yaw: 0,
      s: 0,
    };
    sampleAtS(refinedS, tmp);

    const rdx = wx - tmp.x;
    const rdz = wz - tmp.z;
    out.s = tmp.s;
    out.laneOffset = rdx * tmp.rx + rdz * tmp.rz;
    out.cx = tmp.x;
    out.cz = tmp.z;
    out.tx = tmp.tx;
    out.tz = tmp.tz;
    out.rx = tmp.rx;
    out.rz = tmp.rz;
    out.yaw = tmp.yaw;
    return out;
  };

  const minDistanceToTrack = (wx: number, wz: number): number => {
    let bestDistSq = Infinity;
    for (let i = 0; i < sampleCount; i += 2) {
      const p = samples[i];
      const dx = wx - p.x;
      const dz = wz - p.z;
      const dSq = dx * dx + dz * dz;
      if (dSq < bestDistSq) bestDistSq = dSq;
    }
    return Math.sqrt(bestDistSq);
  };

  const projTmp: TrackProjection = {
    s: 0,
    laneOffset: 0,
    cx: 0,
    cz: 0,
    tx: 0,
    tz: -1,
    rx: 1,
    rz: 0,
    yaw: 0,
  };

  // Merge opening on the right edge of the Elevated Highway: z in [-195, -122]
  const rampMergeStartS = projectToTrack(0, RAMP_TOP_Z, null, projTmp).s;
  const rampMergeEndS = projectToTrack(0, RAMP_MERGE_END_Z, rampMergeStartS, projTmp).s;

  // Openings in the Center Median placed every 100 meters along the entire closed loop
  const medianOpenings: MedianOpeningWindow[] = [];
  for (let ms = 100; ms < totalLength - 55; ms += 100) {
    const cs = wrapS(ms);
    medianOpenings.push({
      centerS: cs,
      startS: wrapS(cs - 11),
      endS: wrapS(cs + 11),
    });
  }

  const isInRampMergeZone = (s: number): boolean => {
    return isSInWindow(wrapS(s), rampMergeStartS, rampMergeEndS);
  };

  const isInMedianOpening = (s: number): boolean => {
    const ws = wrapS(s);
    for (let i = 0; i < medianOpenings.length; i++) {
      const w = medianOpenings[i];
      if (isSInWindow(ws, w.startS, w.endS)) return true;
    }
    return false;
  };

  return {
    totalLength,
    sampleCount,
    samples,
    rampMergeStartS,
    rampMergeEndS,
    medianOpenings,
    wrapS,
    shortestSignedDeltaS,
    isInRampMergeZone,
    isInMedianOpening,
    sampleAtS,
    projectToTrack,
    minDistanceToTrack,
  };
}

function buildClosedTrackRibbonGeometry(
  track: ClosedLoopTrack,
  segments: number,
  leftOffset: number,
  rightOffset: number,
  yHeight: number,
  uvRepeatLenMeters: number,
  flipNormalDown = false
): THREE.BufferGeometry {
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const uvLoops = Math.max(1, Math.round(track.totalLength / uvRepeatLenMeters));
  const aSample: TrackSample = { x: 0, z: 0, tx: 0, tz: -1, rx: 1, rz: 0, yaw: 0, s: 0 };
  const bSample: TrackSample = { x: 0, z: 0, tx: 0, tz: -1, rx: 1, rz: 0, yaw: 0, s: 0 };

  let vCursor = 0;
  const ny = flipNormalDown ? -1 : 1;
  for (let i = 0; i < segments; i++) {
    const s0 = (i / segments) * track.totalLength;
    const s1 = ((i + 1) / segments) * track.totalLength;

    track.sampleAtS(s0, aSample);
    track.sampleAtS(s1, bSample);

    const v0 = (s0 / track.totalLength) * uvLoops;
    const v1 = (s1 / track.totalLength) * uvLoops;

    const p0Lx = aSample.x + aSample.rx * leftOffset;
    const p0Lz = aSample.z + aSample.rz * leftOffset;
    const p0Rx = aSample.x + aSample.rx * rightOffset;
    const p0Rz = aSample.z + aSample.rz * rightOffset;

    const p1Lx = bSample.x + bSample.rx * leftOffset;
    const p1Lz = bSample.z + bSample.rz * leftOffset;
    const p1Rx = bSample.x + bSample.rx * rightOffset;
    const p1Rz = bSample.z + bSample.rz * rightOffset;

    positions.push(
      p0Lx, yHeight, p0Lz,
      p0Rx, yHeight, p0Rz,
      p1Lx, yHeight, p1Lz,
      p1Rx, yHeight, p1Rz
    );
    normals.push(0, ny, 0, 0, ny, 0, 0, ny, 0, 0, ny, 0);
    uvs.push(0, v0, 1, v0, 0, v1, 1, v1);

    if (flipNormalDown) {
      indices.push(vCursor, vCursor + 2, vCursor + 1, vCursor + 2, vCursor + 3, vCursor + 1);
    } else {
      indices.push(vCursor, vCursor + 1, vCursor + 2, vCursor + 2, vCursor + 1, vCursor + 3);
    }
    vCursor += 4;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeBoundingSphere();
  return geo;
}

function buildClosedTrackWallGeometry(
  track: ClosedLoopTrack,
  segments: number,
  centerOffset: number,
  width: number,
  bottomY: number,
  topY: number,
  uvRepeatLenMeters: number,
  skipRampMerge: boolean,
  skipMedianOpenings = false
): THREE.BufferGeometry {
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const halfW = width * 0.5;
  const innerOff = centerOffset - halfW;
  const outerOff = centerOffset + halfW;
  const uvLoops = Math.max(1, Math.round(track.totalLength / uvRepeatLenMeters));

  const sA: TrackSample = { x: 0, z: 0, tx: 0, tz: -1, rx: 1, rz: 0, yaw: 0, s: 0 };
  const sB: TrackSample = { x: 0, z: 0, tx: 0, tz: -1, rx: 1, rz: 0, yaw: 0, s: 0 };

  let vCursor = 0;

  const pushQuad = (
    x0: number, y0: number, z0: number,
    x1: number, y1: number, z1: number,
    x2: number, y2: number, z2: number,
    x3: number, y3: number, z3: number,
    u0: number, v0: number, u1: number, v1: number
  ) => {
    positions.push(x0, y0, z0, x1, y1, z1, x2, y2, z2, x3, y3, z3);
    uvs.push(u0, v0, u1, v0, u0, v1, u1, v1);
    indices.push(vCursor, vCursor + 1, vCursor + 2, vCursor + 2, vCursor + 1, vCursor + 3);
    vCursor += 4;
  };

  for (let i = 0; i < segments; i++) {
    const segStart = (i / segments) * track.totalLength;
    const segEnd = ((i + 1) / segments) * track.totalLength;
    const midS = 0.5 * (segStart + segEnd);
    if (skipRampMerge && track.isInRampMergeZone(midS)) continue;
    if (skipMedianOpenings && track.isInMedianOpening(midS)) continue;

    track.sampleAtS(segStart, sA);
    track.sampleAtS(segEnd, sB);

    const v0 = (segStart / track.totalLength) * uvLoops;
    const v1 = (segEnd / track.totalLength) * uvLoops;

    const aInX = sA.x + sA.rx * innerOff;
    const aInZ = sA.z + sA.rz * innerOff;
    const aOutX = sA.x + sA.rx * outerOff;
    const aOutZ = sA.z + sA.rz * outerOff;

    const bInX = sB.x + sB.rx * innerOff;
    const bInZ = sB.z + sB.rz * innerOff;
    const bOutX = sB.x + sB.rx * outerOff;
    const bOutZ = sB.z + sB.rz * outerOff;

    // Top face
    pushQuad(
      aInX, topY, aInZ,
      aOutX, topY, aOutZ,
      bInX, topY, bInZ,
      bOutX, topY, bOutZ,
      0, v0, 1, v1
    );
    // Inner face (facing -R)
    pushQuad(
      aInX, bottomY, aInZ,
      aInX, topY, aInZ,
      bInX, bottomY, bInZ,
      bInX, topY, bInZ,
      0, v0, 1, v1
    );
    // Outer face (facing +R)
    pushQuad(
      aOutX, topY, aOutZ,
      aOutX, bottomY, aOutZ,
      bOutX, topY, bOutZ,
      bOutX, bottomY, bOutZ,
      0, v0, 1, v1
    );
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  geo.computeBoundingSphere();
  return geo;
}

function buildSlopedEmbankmentGeometry(
  track: ClosedLoopTrack,
  segments: number,
  innerOff: number,
  outerOff: number,
  innerY: number,
  outerY: number
): THREE.BufferGeometry {
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const sA: TrackSample = { x: 0, z: 0, tx: 0, tz: -1, rx: 1, rz: 0, yaw: 0, s: 0 };
  const sB: TrackSample = { x: 0, z: 0, tx: 0, tz: -1, rx: 1, rz: 0, yaw: 0, s: 0 };
  let vCursor = 0;

  for (let i = 0; i < segments; i++) {
    const segStart = (i / segments) * track.totalLength;
    const segEnd = ((i + 1) / segments) * track.totalLength;
    const midS = 0.5 * (segStart + segEnd);
    track.sampleAtS(midS, sA);
    // Keep embankment clear of Parking / Complex / Ramp zone on +X
    if (innerOff > 0 && sA.x > -20 && sA.z > -208 && sA.z < 50) {
      continue;
    }

    track.sampleAtS(segStart, sA);
    track.sampleAtS(segEnd, sB);

    const aInX = sA.x + sA.rx * innerOff;
    const aInZ = sA.z + sA.rz * innerOff;
    const aOutX = sA.x + sA.rx * outerOff;
    const aOutZ = sA.z + sA.rz * outerOff;

    const bInX = sB.x + sB.rx * innerOff;
    const bInZ = sB.z + sB.rz * innerOff;
    const bOutX = sB.x + sB.rx * outerOff;
    const bOutZ = sB.z + sB.rz * outerOff;

    const swap = innerOff < 0;
    if (swap) {
      positions.push(
        aOutX, outerY, aOutZ,
        aInX, innerY, aInZ,
        bOutX, outerY, bOutZ,
        bInX, innerY, bInZ
      );
    } else {
      positions.push(
        aInX, innerY, aInZ,
        aOutX, outerY, aOutZ,
        bInX, innerY, bInZ,
        bOutX, outerY, bOutZ
      );
    }
    uvs.push(0, i * 0.25, 1, i * 0.25, 0, (i + 1) * 0.25, 1, (i + 1) * 0.25);
    indices.push(vCursor, vCursor + 1, vCursor + 2, vCursor + 2, vCursor + 1, vCursor + 3);
    vCursor += 4;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  geo.computeBoundingSphere();
  return geo;
}

function buildIncorporationRampGeometries(): {
  deckGeo: THREE.BufferGeometry;
  leftWallGeo: THREE.BufferGeometry;
  rightWallGeo: THREE.BufferGeometry;
  leftCurbGeo: THREE.BufferGeometry;
  rightCurbGeo: THREE.BufferGeometry;
  leftRailGeo: THREE.BufferGeometry;
  rightRailGeo: THREE.BufferGeometry;
  leftSlopeGeo: THREE.BufferGeometry;
  rightSlopeGeo: THREE.BufferGeometry;
  mergeDeckGeo: THREE.BufferGeometry;
  mergeChevronGeo: THREE.BufferGeometry;
  mergeOuterWallGeo: THREE.BufferGeometry;
} {
  // 1. Main climbing street deck from z = +10.0 (y = 0.014) up to z = -122.0 (y = 4.51)
  const steps = 64;
  const deckPos: number[] = [];
  const deckNorm: number[] = [];
  const deckUv: number[] = [];
  const deckIdx: number[] = [];

  const leftWallPos: number[] = [];
  const leftWallUv: number[] = [];
  const leftWallIdx: number[] = [];

  const rightWallPos: number[] = [];
  const rightWallUv: number[] = [];
  const rightWallIdx: number[] = [];

  const leftCurbPos: number[] = [];
  const leftCurbUv: number[] = [];
  const leftCurbIdx: number[] = [];

  const rightCurbPos: number[] = [];
  const rightCurbUv: number[] = [];
  const rightCurbIdx: number[] = [];

  const leftRailPos: number[] = [];
  const leftRailUv: number[] = [];
  const leftRailIdx: number[] = [];

  const rightRailPos: number[] = [];
  const rightRailUv: number[] = [];
  const rightRailIdx: number[] = [];

  const leftSlopePos: number[] = [];
  const leftSlopeUv: number[] = [];
  const leftSlopeIdx: number[] = [];

  const rightSlopePos: number[] = [];
  const rightSlopeUv: number[] = [];
  const rightSlopeIdx: number[] = [];

  let dCur = 0;
  const lwRef = { c: 0 };
  const rwRef = { c: 0 };
  const lcRef = { c: 0 };
  const rcRef = { c: 0 };
  const lrRef = { c: 0 };
  const rrRef = { c: 0 };
  let lsCur = 0;
  let rsCur = 0;

  const pushWallQuad = (
    posArr: number[],
    uvArr: number[],
    idxArr: number[],
    curRef: { c: number },
    x0: number, y0: number, z0: number,
    x1: number, y1: number, z1: number,
    x2: number, y2: number, z2: number,
    x3: number, y3: number, z3: number,
    v0: number, v1: number
  ) => {
    posArr.push(x0, y0, z0, x1, y1, z1, x2, y2, z2, x3, y3, z3);
    uvArr.push(0, v0, 1, v0, 0, v1, 1, v1);
    const c = curRef.c;
    idxArr.push(c, c + 1, c + 2, c + 2, c + 1, c + 3);
    curRef.c += 4;
  };

  for (let i = 0; i < steps; i++) {
    const t0 = i / steps;
    const t1 = (i + 1) / steps;
    const z0 = RAMP_BOTTOM_Z - t0 * (RAMP_BOTTOM_Z - RAMP_TOP_Z);
    const z1 = RAMP_BOTTOM_Z - t1 * (RAMP_BOTTOM_Z - RAMP_TOP_Z);

    const b0 = getRampBoundsAtZ(z0);
    const b1 = getRampBoundsAtZ(z1);
    const y0 = getRampElevationAtZ(z0) + 0.014;
    const y1 = getRampElevationAtZ(z1) + 0.014;

    const v0 = t0 * 5.0;
    const v1 = t1 * 5.0;

    deckPos.push(
      b0.leftX, y0, z0,
      b0.rightX, y0, z0,
      b1.leftX, y1, z1,
      b1.rightX, y1, z1
    );
    deckNorm.push(0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0);
    deckUv.push(0, v0, 1, v0, 0, v1, 1, v1);
    deckIdx.push(dCur, dCur + 1, dCur + 2, dCur + 2, dCur + 1, dCur + 3);
    dCur += 4;

    // Left retaining concrete wall (x = leftX - 0.50 .. leftX)
    const lw0In = b0.leftX;
    const lw0Out = b0.leftX - 0.50;
    const lw1In = b1.leftX;
    const lw1Out = b1.leftX - 0.50;
    const lTop0 = y0 + 1.15;
    const lTop1 = y1 + 1.15;
    pushWallQuad(
      leftWallPos, leftWallUv, leftWallIdx, lwRef,
      lw0Out, lTop0, z0, lw0In, lTop0, z0,
      lw1Out, lTop1, z1, lw1In, lTop1, z1, v0, v1
    );
    pushWallQuad(
      leftWallPos, leftWallUv, leftWallIdx, lwRef,
      lw0In, 0, z0, lw0In, lTop0, z0,
      lw1In, 0, z1, lw1In, lTop1, z1, v0, v1
    );
    pushWallQuad(
      leftWallPos, leftWallUv, leftWallIdx, lwRef,
      lw0Out, lTop0, z0, lw0Out, 0, z0,
      lw1Out, lTop1, z1, lw1Out, 0, z1, v0, v1
    );

    // Right retaining concrete wall (x = rightX .. rightX + 0.50)
    const rw0In = b0.rightX;
    const rw0Out = b0.rightX + 0.50;
    const rw1In = b1.rightX;
    const rw1Out = b1.rightX + 0.50;
    pushWallQuad(
      rightWallPos, rightWallUv, rightWallIdx, rwRef,
      rw0In, lTop0, z0, rw0Out, lTop0, z0,
      rw1In, lTop1, z1, rw1Out, lTop1, z1, v0, v1
    );
    pushWallQuad(
      rightWallPos, rightWallUv, rightWallIdx, rwRef,
      rw0In, 0, z0, rw0In, lTop0, z0,
      rw1In, 0, z1, rw1In, lTop1, z1, v0, v1
    );
    pushWallQuad(
      rightWallPos, rightWallUv, rightWallIdx, rwRef,
      rw0Out, lTop0, z0, rw0Out, 0, z0,
      rw1Out, lTop1, z1, rw1Out, 0, z1, v0, v1
    );

    // Concrete Sidewalk Curbs along inner base of ramp walls (0.48m wide, 0.14m high)
    const lcTop0 = y0 + 0.14;
    const lcTop1 = y1 + 0.14;
    pushWallQuad(
      leftCurbPos, leftCurbUv, leftCurbIdx, lcRef,
      b0.leftX, lcTop0, z0, b0.leftX + 0.48, lcTop0, z0,
      b1.leftX, lcTop1, z1, b1.leftX + 0.48, lcTop1, z1, v0, v1
    );
    pushWallQuad(
      leftCurbPos, leftCurbUv, leftCurbIdx, lcRef,
      b0.leftX + 0.48, lcTop0, z0, b0.leftX + 0.48, y0, z0,
      b1.leftX + 0.48, lcTop1, z1, b1.leftX + 0.48, y1, z1, v0, v1
    );
    pushWallQuad(
      rightCurbPos, rightCurbUv, rightCurbIdx, rcRef,
      b0.rightX - 0.48, lcTop0, z0, b0.rightX, lcTop0, z0,
      b1.rightX - 0.48, lcTop1, z1, b1.rightX, lcTop1, z1, v0, v1
    );
    pushWallQuad(
      rightCurbPos, rightCurbUv, rightCurbIdx, rcRef,
      b0.rightX - 0.48, y0, z0, b0.rightX - 0.48, lcTop0, z0,
      b1.rightX - 0.48, y1, z1, b1.rightX - 0.48, lcTop1, z1, v0, v1
    );

    // Metallic W-Beam Guardrails mounted cleanly along both ramp edges (y + 0.44..0.72)
    const rLow0 = y0 + 0.44;
    const rHigh0 = y0 + 0.72;
    const rLow1 = y1 + 0.44;
    const rHigh1 = y1 + 0.72;
    pushWallQuad(
      leftRailPos, leftRailUv, leftRailIdx, lrRef,
      b0.leftX + 0.08, rLow0, z0, b0.leftX + 0.08, rHigh0, z0,
      b1.leftX + 0.08, rLow1, z1, b1.leftX + 0.08, rHigh1, z1, v0, v1
    );
    pushWallQuad(
      rightRailPos, rightRailUv, rightRailIdx, rrRef,
      b0.rightX - 0.08, rHigh0, z0, b0.rightX - 0.08, rLow0, z0,
      b1.rightX - 0.08, rHigh1, z1, b1.rightX - 0.08, rLow1, z1, v0, v1
    );

    // Landscaped green embankment slopes ("ladera verde") flanking both sides of the ramp
    const lsY0 = Math.max(-0.05, y0 - 0.25);
    const lsY1 = Math.max(-0.05, y1 - 0.25);
    const lOutX0 = Math.max(21.1, lw0Out - 3.6 * t0);
    const lOutX1 = Math.max(21.1, lw1Out - 3.6 * t1);
    leftSlopePos.push(
      lOutX0, -0.05, z0,
      lw0Out, lsY0, z0,
      lOutX1, -0.05, z1,
      lw1Out, lsY1, z1
    );
    leftSlopeUv.push(0, v0, 1, v0, 0, v1, 1, v1);
    leftSlopeIdx.push(lsCur, lsCur + 1, lsCur + 2, lsCur + 2, lsCur + 1, lsCur + 3);
    lsCur += 4;

    const rOutX0 = rw0Out + 1.4 + 4.4 * t0;
    const rOutX1 = rw1Out + 1.4 + 4.4 * t1;
    rightSlopePos.push(
      rw0Out, lsY0, z0,
      rOutX0, -0.05, z0,
      rw1Out, lsY1, z1,
      rOutX1, -0.05, z1
    );
    rightSlopeUv.push(0, v0, 1, v0, 0, v1, 1, v1);
    rightSlopeIdx.push(rsCur, rsCur + 1, rsCur + 2, rsCur + 2, rsCur + 1, rsCur + 3);
    rsCur += 4;
  }

  const finalizeGeo = (
    pos: number[],
    uv: number[],
    idx: number[],
    norm?: number[]
  ): THREE.BufferGeometry => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    if (norm) {
      g.setAttribute('normal', new THREE.Float32BufferAttribute(norm, 3));
    }
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    if (!norm) g.computeVertexNormals();
    g.computeBoundingSphere();
    return g;
  };

  const deckGeo = finalizeGeo(deckPos, deckUv, deckIdx, deckNorm);
  const leftWallGeo = finalizeGeo(leftWallPos, leftWallUv, leftWallIdx);
  const rightWallGeo = finalizeGeo(rightWallPos, rightWallUv, rightWallIdx);
  const leftCurbGeo = finalizeGeo(leftCurbPos, leftCurbUv, leftCurbIdx);
  const rightCurbGeo = finalizeGeo(rightCurbPos, rightCurbUv, rightCurbIdx);
  const leftRailGeo = finalizeGeo(leftRailPos, leftRailUv, leftRailIdx);
  const rightRailGeo = finalizeGeo(rightRailPos, rightRailUv, rightRailIdx);
  const leftSlopeGeo = finalizeGeo(leftSlopePos, leftSlopeUv, leftSlopeIdx);
  const rightSlopeGeo = finalizeGeo(rightSlopePos, rightSlopeUv, rightSlopeIdx);

  // 2. Elevated Merge Taper Deck & Gore Chevron Markings (z = -122 .. -195 at y = 4.51)
  const mPos = [
    20.8, HIGHWAY_Y + 0.011, RAMP_TOP_Z,
    31.8, HIGHWAY_Y + 0.011, RAMP_TOP_Z,
    20.8, HIGHWAY_Y + 0.011, RAMP_MERGE_END_Z,
    21.1, HIGHWAY_Y + 0.011, RAMP_MERGE_END_Z,
  ];
  const mNorm = [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0];
  const mUv = [0, 0, 1, 0, 0, 2.2, 1, 2.2];
  const mergeDeckGeo = finalizeGeo(mPos, mUv, [0, 1, 2, 2, 1, 3], mNorm);

  // Right-side "Cebreado Blanco" gore strip tapering along outer merge edge
  const gPos = [
    28.2, HIGHWAY_Y + 0.020, RAMP_TOP_Z,
    31.8, HIGHWAY_Y + 0.020, RAMP_TOP_Z,
    20.85, HIGHWAY_Y + 0.020, RAMP_MERGE_END_Z + 18,
    23.6, HIGHWAY_Y + 0.020, RAMP_MERGE_END_Z + 18,
  ];
  const gUv = [0, 0, 1, 0, 0, 2.5, 1, 2.5];
  const mergeChevronGeo = finalizeGeo(gPos, gUv, [0, 1, 2, 2, 1, 3], mNorm);

  // Tapered outer concrete barrier closing the merge zone from x = 32.05 at z = -122 to x = 21.35 at z = -195
  const mwPos: number[] = [];
  const mwUv: number[] = [];
  const mwIdx: number[] = [];
  const mwRef = { c: 0 };
  const botY = HIGHWAY_Y - 0.72;
  const topY = HIGHWAY_Y + 1.30;
  pushWallQuad(
    mwPos, mwUv, mwIdx, mwRef,
    31.8, topY, RAMP_TOP_Z, 32.35, topY, RAMP_TOP_Z,
    21.05, topY, RAMP_MERGE_END_Z, 21.65, topY, RAMP_MERGE_END_Z, 0, 2
  );
  pushWallQuad(
    mwPos, mwUv, mwIdx, mwRef,
    31.8, botY, RAMP_TOP_Z, 31.8, topY, RAMP_TOP_Z,
    21.05, botY, RAMP_MERGE_END_Z, 21.05, topY, RAMP_MERGE_END_Z, 0, 2
  );
  pushWallQuad(
    mwPos, mwUv, mwIdx, mwRef,
    32.35, topY, RAMP_TOP_Z, 32.35, botY, RAMP_TOP_Z,
    21.65, topY, RAMP_MERGE_END_Z, 21.65, botY, RAMP_MERGE_END_Z, 0, 2
  );
  const mergeOuterWallGeo = finalizeGeo(mwPos, mwUv, mwIdx);

  return {
    deckGeo,
    leftWallGeo,
    rightWallGeo,
    leftCurbGeo,
    rightCurbGeo,
    leftRailGeo,
    rightRailGeo,
    leftSlopeGeo,
    rightSlopeGeo,
    mergeDeckGeo,
    mergeChevronGeo,
    mergeOuterWallGeo,
  };
}

export function buildMetropolisWorld(
  textures: ProceduralTextureSet,
  isSoftwareGl: boolean
): MetropolisWorld {
  const group = new THREE.Group();
  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];
  const showcaseEntries: ShowcaseEntry[] = [];

  const track = createClosedLoopTrack();

  // ==================== 1. METROPOLIS URBAN GROUND ====================
  const cityGroundGeo = new THREE.PlaneGeometry(3000, 3000);
  cityGroundGeo.rotateX(-Math.PI / 2);
  geometries.push(cityGroundGeo);
  const cityGroundMat = new THREE.MeshStandardMaterial({
    color: 0x090c12,
    roughness: 0.92,
    metalness: 0.08,
  });
  materials.push(cityGroundMat);
  const cityGround = new THREE.Mesh(cityGroundGeo, cityGroundMat);
  cityGround.position.set(-420, -0.05, -40);
  cityGround.receiveShadow = true;
  group.add(cityGround);

  // ==================== 2. ELEVATED CLOSED-LOOP HIGHWAY (5 LANES/SIDE = 42m WIDE, Y = 4.5m) ====================
  const roadSegments = 960;
  const roadGeo = buildClosedTrackRibbonGeometry(
    track,
    roadSegments,
    -21.0,
    21.0,
    HIGHWAY_Y + 0.01,
    36,
    false
  );
  const soffitGeo = buildClosedTrackRibbonGeometry(
    track,
    roadSegments,
    -21.4,
    21.4,
    HIGHWAY_Y - 0.72,
    36,
    true
  );
  geometries.push(roadGeo, soffitGeo);

  const asphaltMat = new THREE.MeshPhysicalMaterial({
    map: textures.asphalt,
    roughnessMap: textures.asphaltRoughness,
    bumpMap: textures.asphaltBump,
    bumpScale: 0.018,
    color: 0x2c3340,
    roughness: 0.72,
    metalness: 0.16,
    clearcoat: 0.18,
    clearcoatRoughness: 0.35,
    envMapIntensity: 0.85,
  });
  const concreteMat = new THREE.MeshStandardMaterial({
    map: textures.concreteBarrier,
    color: 0x64748b,
    roughness: 0.78,
    metalness: 0.12,
  });
  const barrierLedMat = new THREE.MeshStandardMaterial({
    color: 0xdbe4f0,
    emissive: new THREE.Color(0xfde68a),
    emissiveIntensity: 0.32,
    roughness: 0.35,
  });
  materials.push(asphaltMat, concreteMat, barrierLedMat);

  const roadMesh = new THREE.Mesh(roadGeo, asphaltMat);
  roadMesh.receiveShadow = true;
  const soffitMesh = new THREE.Mesh(soffitGeo, concreteMat);
  group.add(roadMesh, soffitMesh);

  // Outer Acoustic Walls + Viaduct Deck Facias + LED Strips
  const leftWallGeo = buildClosedTrackWallGeometry(
    track,
    roadSegments,
    -21.35,
    0.65,
    HIGHWAY_Y - 0.72,
    HIGHWAY_Y + 1.30,
    24,
    false
  );
  const leftLedGeo = buildClosedTrackWallGeometry(
    track,
    roadSegments,
    -21.0,
    0.09,
    HIGHWAY_Y + 0.96,
    HIGHWAY_Y + 1.05,
    24,
    false
  );
  const rightWallGeo = buildClosedTrackWallGeometry(
    track,
    roadSegments,
    21.35,
    0.65,
    HIGHWAY_Y - 0.72,
    HIGHWAY_Y + 1.30,
    24,
    true
  );
  const rightLedGeo = buildClosedTrackWallGeometry(
    track,
    roadSegments,
    21.0,
    0.09,
    HIGHWAY_Y + 0.96,
    HIGHWAY_Y + 1.05,
    24,
    true
  );
  // Center Median Barrier with 5 Open Crossover Gaps!
  const centerMedianGeo = buildClosedTrackWallGeometry(
    track,
    roadSegments,
    0,
    0.84,
    HIGHWAY_Y,
    HIGHWAY_Y + 0.68,
    24,
    false,
    true
  );
  geometries.push(leftWallGeo, leftLedGeo, rightWallGeo, rightLedGeo, centerMedianGeo);

  group.add(
    new THREE.Mesh(leftWallGeo, concreteMat),
    new THREE.Mesh(leftLedGeo, barrierLedMat),
    new THREE.Mesh(rightWallGeo, concreteMat),
    new THREE.Mesh(rightLedGeo, barrierLedMat),
    new THREE.Mesh(centerMedianGeo, concreteMat)
  );

  // Instanced Reflective Median Delineator Blocks along Center Divider
  const sample: TrackSample = { x: 0, z: 0, tx: 0, tz: -1, rx: 1, rz: 0, yaw: 0, s: 0 };
  const dummy = new THREE.Object3D();
  const reflectorSList: number[] = [];
  for (let s = 8; s < track.totalLength; s += 14) {
    if (!track.isInMedianOpening(s)) {
      reflectorSList.push(s);
    }
  }
  const reflectorGeo = new THREE.BoxGeometry(0.92, 0.14, 0.28);
  const reflectorMat = new THREE.MeshStandardMaterial({
    color: 0xfef3c7,
    emissive: new THREE.Color(0xf59e0b),
    emissiveIntensity: 0.45,
    roughness: 0.28,
  });
  geometries.push(reflectorGeo);
  materials.push(reflectorMat);
  const reflectorInst = new THREE.InstancedMesh(
    reflectorGeo,
    reflectorMat,
    reflectorSList.length
  );
  reflectorSList.forEach((rs, idx) => {
    track.sampleAtS(rs, sample);
    dummy.position.set(sample.x, HIGHWAY_Y + 0.74, sample.z);
    dummy.rotation.set(0, sample.yaw, 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    reflectorInst.setMatrixAt(idx, dummy.matrix);
  });
  reflectorInst.instanceMatrix.needsUpdate = true;
  reflectorInst.computeBoundingSphere();
  group.add(reflectorInst);

  // Instanced Arrow Signs at Both Ends of Every 100m Median Opening (Front & Back FrontSide so never mirrored)
  const medianPostGeo = new THREE.CylinderGeometry(0.08, 0.10, 3.1, 8);
  const medianSignGeo = new THREE.PlaneGeometry(2.1, 1.05);
  const medianSignMat = new THREE.MeshStandardMaterial({
    map: textures.medianSign,
    emissiveMap: textures.medianSign,
    emissive: new THREE.Color(0xffffff),
    emissiveIntensity: 0.25,
    side: THREE.FrontSide,
    roughness: 0.38,
  });
  const gantrySteelMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    metalness: 0.78,
    roughness: 0.32,
  });
  geometries.push(medianPostGeo, medianSignGeo);
  materials.push(medianSignMat, gantrySteelMat);

  const medEdges: number[] = [];
  for (const mo of track.medianOpenings) {
    medEdges.push(mo.startS, mo.endS);
  }
  const medPostInst = new THREE.InstancedMesh(medianPostGeo, gantrySteelMat, medEdges.length);
  const medSignInst = new THREE.InstancedMesh(medianSignGeo, medianSignMat, medEdges.length * 2);
  medEdges.forEach((edgeS, idx) => {
    track.sampleAtS(edgeS, sample);
    dummy.scale.set(1, 1, 1);
    dummy.rotation.set(0, 0, 0);
    dummy.position.set(sample.x, HIGHWAY_Y + 1.55, sample.z);
    dummy.updateMatrix();
    medPostInst.setMatrixAt(idx, dummy.matrix);

    // Front face (facing -tx, -tz toward Northbound/forward traffic)
    dummy.rotation.set(0, sample.yaw, 0);
    dummy.position.set(sample.x - sample.tx * 0.03, HIGHWAY_Y + 2.85, sample.z - sample.tz * 0.03);
    dummy.updateMatrix();
    medSignInst.setMatrixAt(idx * 2, dummy.matrix);

    // Back face (facing +tx, +tz toward Southbound traffic, rotated PI so never mirrored)
    dummy.rotation.set(0, sample.yaw + Math.PI, 0);
    dummy.position.set(sample.x + sample.tx * 0.03, HIGHWAY_Y + 2.85, sample.z + sample.tz * 0.03);
    dummy.updateMatrix();
    medSignInst.setMatrixAt(idx * 2 + 1, dummy.matrix);
  });
  medPostInst.instanceMatrix.needsUpdate = true;
  medSignInst.instanceMatrix.needsUpdate = true;
  medPostInst.computeBoundingSphere();
  medSignInst.computeBoundingSphere();
  group.add(medPostInst, medSignInst);

  // Instanced Twin-Column Concrete Viaduct T-Piers supporting the 42m Elevated Loop
  const pierSList: number[] = [];
  for (let s = 18; s < track.totalLength; s += 46) {
    pierSList.push(s);
  }
  const pierColGeo = new THREE.BoxGeometry(2.2, HIGHWAY_Y - 0.65, 1.7);
  const pierCapGeo = new THREE.BoxGeometry(41.0, 0.72, 1.9);
  geometries.push(pierColGeo, pierCapGeo);
  const pierColInst = new THREE.InstancedMesh(pierColGeo, concreteMat, pierSList.length * 2);
  const pierCapInst = new THREE.InstancedMesh(pierCapGeo, concreteMat, pierSList.length);
  pierSList.forEach((ps, i) => {
    track.sampleAtS(ps, sample);
    dummy.rotation.set(0, sample.yaw, 0);
    dummy.scale.set(1, 1, 1);

    dummy.position.set(sample.x - sample.rx * 10.5, (HIGHWAY_Y - 0.65) * 0.5, sample.z - sample.rz * 10.5);
    dummy.updateMatrix();
    pierColInst.setMatrixAt(i * 2, dummy.matrix);

    dummy.position.set(sample.x + sample.rx * 10.5, (HIGHWAY_Y - 0.65) * 0.5, sample.z + sample.rz * 10.5);
    dummy.updateMatrix();
    pierColInst.setMatrixAt(i * 2 + 1, dummy.matrix);

    dummy.position.set(sample.x, HIGHWAY_Y - 0.38, sample.z);
    dummy.updateMatrix();
    pierCapInst.setMatrixAt(i, dummy.matrix);
  });
  pierColInst.instanceMatrix.needsUpdate = true;
  pierCapInst.instanceMatrix.needsUpdate = true;
  pierColInst.computeBoundingSphere();
  pierCapInst.computeBoundingSphere();
  group.add(pierColInst, pierCapInst);

  // ==================== 3. TWO-LANE CONNECTED RAMP STREET, EMBANKMENT, GUARDRAILS & PORTAL ====================
  const rampGeos = buildIncorporationRampGeometries();
  geometries.push(
    rampGeos.deckGeo,
    rampGeos.leftWallGeo,
    rampGeos.rightWallGeo,
    rampGeos.leftCurbGeo,
    rampGeos.rightCurbGeo,
    rampGeos.leftRailGeo,
    rampGeos.rightRailGeo,
    rampGeos.leftSlopeGeo,
    rampGeos.rightSlopeGeo,
    rampGeos.mergeDeckGeo,
    rampGeos.mergeChevronGeo,
    rampGeos.mergeOuterWallGeo
  );

  const rampDeckMat = new THREE.MeshPhysicalMaterial({
    map: textures.rampChevronRoad,
    bumpMap: textures.asphaltBump,
    bumpScale: 0.015,
    color: 0x333c4d,
    roughness: 0.70,
    metalness: 0.14,
    clearcoat: 0.16,
  });
  const goreOverlayMat = new THREE.MeshBasicMaterial({
    map: textures.goreChevronTex,
    transparent: true,
    opacity: 0.92,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });
  const rampCurbMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.80,
    metalness: 0.08,
  });
  const rampRailMat = new THREE.MeshStandardMaterial({
    color: 0xcbd5e1,
    metalness: 0.82,
    roughness: 0.28,
    side: THREE.DoubleSide,
  });
  const rampPortalSignMat = new THREE.MeshStandardMaterial({
    map: textures.rampPortalSign,
    emissiveMap: textures.rampPortalSign,
    emissive: new THREE.Color(0xffffff),
    emissiveIntensity: 0.30,
    side: THREE.DoubleSide,
    roughness: 0.38,
  });
  materials.push(rampDeckMat, goreOverlayMat, rampCurbMat, rampRailMat, rampPortalSignMat);

  const rampDeckMesh = new THREE.Mesh(rampGeos.deckGeo, rampDeckMat);
  rampDeckMesh.receiveShadow = true;
  const rampMergeDeckMesh = new THREE.Mesh(rampGeos.mergeDeckGeo, asphaltMat);
  rampMergeDeckMesh.receiveShadow = true;
  const rampGoreChevronMesh = new THREE.Mesh(rampGeos.mergeChevronGeo, goreOverlayMat);

  // ==================== 4. LANDSCAPED EMBANKMENTS ("TALUDES") & URBAN VEGETATION ====================
  const taludLGeo = buildSlopedEmbankmentGeometry(track, 240, -21.7, -31.5, HIGHWAY_Y - 0.4, -0.05);
  const taludRGeo = buildSlopedEmbankmentGeometry(track, 240, 21.7, 31.5, HIGHWAY_Y - 0.4, -0.05);
  const taludMat = new THREE.MeshStandardMaterial({
    color: 0x16241b,
    roughness: 0.94,
    metalness: 0.04,
  });
  geometries.push(taludLGeo, taludRGeo);
  materials.push(taludMat);
  const taludLMesh = new THREE.Mesh(taludLGeo, taludMat);
  const taludRMesh = new THREE.Mesh(taludRGeo, taludMat);
  taludLMesh.receiveShadow = true;
  taludRMesh.receiveShadow = true;

  const rampSlopeLMesh = new THREE.Mesh(rampGeos.leftSlopeGeo, taludMat);
  const rampSlopeRMesh = new THREE.Mesh(rampGeos.rightSlopeGeo, taludMat);
  rampSlopeLMesh.receiveShadow = true;
  rampSlopeRMesh.receiveShadow = true;

  // Concrete corner abutment closing x=33.0..34.15 at z=8.9..10.1 where ramp meets divider rail
  const abutmentGeo = new THREE.BoxGeometry(1.18, 1.32, 1.25);
  const rampPortalPoleGeo = new THREE.CylinderGeometry(0.14, 0.16, 5.4, 8);
  const rampPortalBeamGeo = new THREE.BoxGeometry(12.2, 0.36, 0.32);
  const rampPortalBoardGeo = new THREE.PlaneGeometry(7.2, 1.35);
  const rampLampPostGeo = new THREE.CylinderGeometry(0.08, 0.11, 5.2, 8);
  const rampLampArmGeo = new THREE.BoxGeometry(1.15, 0.10, 0.24);
  const rampRailPostGeo = new THREE.BoxGeometry(0.10, 0.78, 0.10);
  const rampBulbGeo = new THREE.BoxGeometry(0.55, 0.08, 0.26);
  const rampBulbMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    emissive: new THREE.Color(0xfef3c7),
    emissiveIntensity: 0.36,
  });
  geometries.push(
    abutmentGeo,
    rampPortalPoleGeo,
    rampPortalBeamGeo,
    rampPortalBoardGeo,
    rampLampPostGeo,
    rampLampArmGeo,
    rampRailPostGeo,
    rampBulbGeo
  );
  materials.push(rampBulbMat);

  const rampAbutment = new THREE.Mesh(abutmentGeo, concreteMat);
  rampAbutment.position.set(33.58, 0.66, 9.5);

  const rampPortalGroup = new THREE.Group();
  rampPortalGroup.position.set(27.5, 0, 10.6);
  const rpL = new THREE.Mesh(rampPortalPoleGeo, gantrySteelMat);
  rpL.position.set(-5.7, 2.7, 0);
  const rpR = new THREE.Mesh(rampPortalPoleGeo, gantrySteelMat);
  rpR.position.set(5.7, 2.7, 0);
  const rpBeam = new THREE.Mesh(rampPortalBeamGeo, gantrySteelMat);
  rpBeam.position.set(0, 5.2, 0);
  const rpBoard = new THREE.Mesh(rampPortalBoardGeo, rampPortalSignMat);
  rpBoard.position.set(0, 4.65, 0.20);
  rampPortalGroup.add(rpL, rpR, rpBeam, rpBoard);

  // Instanced Ramp Streetlamps + Guardrail Posts along both sides of the inclined street
  const rampLampZs = [8, -14, -36, -58, -80, -102, -120];
  const rampLampPostInst = new THREE.InstancedMesh(rampLampPostGeo, gantrySteelMat, rampLampZs.length * 2);
  const rampLampArmInst = new THREE.InstancedMesh(rampLampArmGeo, gantrySteelMat, rampLampZs.length * 2);
  const rampBulbInst = new THREE.InstancedMesh(rampBulbGeo, rampBulbMat, rampLampZs.length * 2);
  rampLampZs.forEach((rz, idx) => {
    const rb = getRampBoundsAtZ(rz);
    const ry = getRampElevationAtZ(rz);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.set(1, 1, 1);

    // Left lamp
    dummy.position.set(rb.leftX - 0.25, ry + 2.6, rz);
    dummy.updateMatrix();
    rampLampPostInst.setMatrixAt(idx * 2, dummy.matrix);
    dummy.position.set(rb.leftX + 0.30, ry + 5.15, rz);
    dummy.updateMatrix();
    rampLampArmInst.setMatrixAt(idx * 2, dummy.matrix);
    dummy.position.set(rb.leftX + 0.65, ry + 5.06, rz);
    dummy.updateMatrix();
    rampBulbInst.setMatrixAt(idx * 2, dummy.matrix);

    // Right lamp
    dummy.position.set(rb.rightX + 0.25, ry + 2.6, rz);
    dummy.updateMatrix();
    rampLampPostInst.setMatrixAt(idx * 2 + 1, dummy.matrix);
    dummy.position.set(rb.rightX - 0.30, ry + 5.15, rz);
    dummy.updateMatrix();
    rampLampArmInst.setMatrixAt(idx * 2 + 1, dummy.matrix);
    dummy.position.set(rb.rightX - 0.65, ry + 5.06, rz);
    dummy.updateMatrix();
    rampBulbInst.setMatrixAt(idx * 2 + 1, dummy.matrix);
  });

  const railPostZs: number[] = [];
  for (let rz = 9; rz >= -121; rz -= 4) {
    railPostZs.push(rz);
  }
  const rampRailPostInst = new THREE.InstancedMesh(rampRailPostGeo, rampRailMat, railPostZs.length * 2);
  railPostZs.forEach((rz, idx) => {
    const rb = getRampBoundsAtZ(rz);
    const ry = getRampElevationAtZ(rz);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.set(1, 1, 1);
    dummy.position.set(rb.leftX + 0.04, ry + 0.39, rz);
    dummy.updateMatrix();
    rampRailPostInst.setMatrixAt(idx * 2, dummy.matrix);
    dummy.position.set(rb.rightX - 0.04, ry + 0.39, rz);
    dummy.updateMatrix();
    rampRailPostInst.setMatrixAt(idx * 2 + 1, dummy.matrix);
  });
  for (const inst of [rampLampPostInst, rampLampArmInst, rampBulbInst, rampRailPostInst]) {
    inst.instanceMatrix.needsUpdate = true;
    inst.computeBoundingSphere();
  }

  group.add(
    rampDeckMesh,
    new THREE.Mesh(rampGeos.leftWallGeo, concreteMat),
    new THREE.Mesh(rampGeos.rightWallGeo, concreteMat),
    new THREE.Mesh(rampGeos.leftCurbGeo, rampCurbMat),
    new THREE.Mesh(rampGeos.rightCurbGeo, rampCurbMat),
    new THREE.Mesh(rampGeos.leftRailGeo, rampRailMat),
    new THREE.Mesh(rampGeos.rightRailGeo, rampRailMat),
    rampSlopeLMesh,
    rampSlopeRMesh,
    rampAbutment,
    rampPortalGroup,
    rampLampPostInst,
    rampLampArmInst,
    rampBulbInst,
    rampRailPostInst,
    rampMergeDeckMesh,
    rampGoreChevronMesh,
    new THREE.Mesh(rampGeos.mergeOuterWallGeo, concreteMat),
    taludLMesh,
    taludRMesh
  );

  // Instanced Stylized Trees along Taludes & Roadside Parks
  const treeCoords: Array<{ x: number; z: number; y: number; s: number; tint: number }> = [];
  let tSeed = 0;
  for (let s = 20; s < track.totalLength; s += 26) {
    track.sampleAtS(s, sample);
    for (const side of [-1, 1] as const) {
      tSeed++;
      const dist = 26.5 + (tSeed % 5) * 1.1;
      const tx = sample.x + sample.rx * side * dist;
      const tz = sample.z + sample.rz * side * dist;
      // Exclude Parking, Paddock, Complex, Lush Backdrop Trees, and Ramp footprint
      if (tx > 14 && tx < 104 && tz > -210 && tz < 54) continue;
      if (track.minDistanceToTrack(tx, tz) < 23.5) continue;
      const slopeY = THREE.MathUtils.clamp((31.5 - dist) * 0.35, 0.1, 2.2);
      const scale = 0.85 + ((tSeed * 19) % 32) / 100;
      treeCoords.push({ x: tx, z: tz, y: slopeY, s: scale, tint: tSeed % 3 });
    }
  }

  const trunkGeo = new THREE.CylinderGeometry(0.16, 0.24, 1.8, 7);
  const canopyGeo = new THREE.ConeGeometry(1.55, 4.0, 9);
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3b2f27, roughness: 0.92 });
  const canopyMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.85 });
  geometries.push(trunkGeo, canopyGeo);
  materials.push(trunkMat, canopyMat);

  const trunkInst = new THREE.InstancedMesh(trunkGeo, trunkMat, treeCoords.length);
  const canopyInst = new THREE.InstancedMesh(canopyGeo, canopyMat, treeCoords.length);
  const canopyPalette = [
    new THREE.Color(0x163826),
    new THREE.Color(0x1e4a31),
    new THREE.Color(0x143022),
  ];

  treeCoords.forEach((tc, i) => {
    dummy.rotation.set(0, (i * 0.7) % Math.PI, 0);
    dummy.scale.set(tc.s, tc.s, tc.s);
    dummy.position.set(tc.x, tc.y + 0.9 * tc.s, tc.z);
    dummy.updateMatrix();
    trunkInst.setMatrixAt(i, dummy.matrix);

    dummy.position.set(tc.x, tc.y + 3.2 * tc.s, tc.z);
    dummy.updateMatrix();
    canopyInst.setMatrixAt(i, dummy.matrix);
    canopyInst.setColorAt(i, canopyPalette[tc.tint]);
  });
  trunkInst.instanceMatrix.needsUpdate = true;
  canopyInst.instanceMatrix.needsUpdate = true;
  if (canopyInst.instanceColor) canopyInst.instanceColor.needsUpdate = true;
  trunkInst.computeBoundingSphere();
  canopyInst.computeBoundingSphere();
  group.add(trunkInst, canopyInst);

  // ==================== 5. COMPLEX: GHOST GARAGE (78) + CONNECTED VIP CONCESIONARIO + PADDOCK LOBBY ====================
  const parkingComplexGroup = new THREE.Group();
  parkingComplexGroup.position.x = COMPLEX_SHIFT_X;
  group.add(parkingComplexGroup);

  const parkPadMat = new THREE.MeshPhysicalMaterial({
    map: textures.parkingAsphalt,
    bumpMap: textures.asphaltBump,
    bumpScale: 0.016,
    roughness: 0.66,
    metalness: 0.14,
    clearcoat: 0.22,
    clearcoatRoughness: 0.3,
  });
  materials.push(parkPadMat);

  // Expanded Worn Asphalt Paddock Forecourt (world x = 34 .. 80, z = -2 .. 30)
  const parkPadGeo = new THREE.PlaneGeometry(46.0, 32.0);
  parkPadGeo.rotateX(-Math.PI / 2);
  // Access Street Apron connecting Ramp bottom (z=+10, world x=22..33) to Parking Open Gate (world x=34, z=+9..+27.5)
  const accessApronGeo = new THREE.PlaneGeometry(12.0, 22.0);
  accessApronGeo.rotateX(-Math.PI / 2);
  const crosswalkApronGeo = new THREE.PlaneGeometry(3.2, 16.0);
  crosswalkApronGeo.rotateX(-Math.PI / 2);
  const accessApronMat = new THREE.MeshPhysicalMaterial({
    map: textures.crosswalkRoad,
    bumpMap: textures.asphaltBump,
    bumpScale: 0.014,
    roughness: 0.65,
    metalness: 0.14,
  });
  geometries.push(parkPadGeo, accessApronGeo, crosswalkApronGeo);
  materials.push(accessApronMat);

  const parkPad = new THREE.Mesh(parkPadGeo, parkPadMat);
  parkPad.position.set(45.0, 0.013, 14.0);
  parkPad.receiveShadow = true;

  const accessApron = new THREE.Mesh(accessApronGeo, parkPadMat);
  accessApron.position.set(16.0, 0.012, 19.0);
  accessApron.receiveShadow = true;

  const crosswalkApron = new THREE.Mesh(crosswalkApronGeo, accessApronMat);
  crosswalkApron.position.set(21.0, 0.015, 18.0);
  crosswalkApron.receiveShadow = true;
  parkingComplexGroup.add(parkPad, accessApron, crosswalkApron);

  // Concrete Retaining Wall on West edge of Bottom Apron (world x=21.75) & Curb
  const apronLeftWallGeo = new THREE.BoxGeometry(0.5, 1.25, 22.5);
  const southCurbGeo = new THREE.BoxGeometry(58.5, 0.28, 0.5);
  geometries.push(apronLeftWallGeo, southCurbGeo);
  const apronLeftWall = new THREE.Mesh(apronLeftWallGeo, concreteMat);
  apronLeftWall.position.set(9.75, 0.62, 19.0);
  const southCurb = new THREE.Mesh(southCurbGeo, concreteMat);
  southCurb.position.set(38.75, 0.14, 30.1);
  parkingComplexGroup.add(apronLeftWall, southCurb);

  // Low Metallic Barrier separating Parking (world x=34.0) from Access Ramp/Street, with WIDE 18.5m Open Gate (z = 9.0..27.5)
  const metalBarrierMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.80,
    roughness: 0.30,
  });
  const barrierPostGeo = new THREE.BoxGeometry(0.14, 0.85, 0.14);
  const northRailGeo = new THREE.BoxGeometry(0.14, 0.26, 10.6);
  const southRailGeo = new THREE.BoxGeometry(0.14, 0.26, 2.3);
  const bollardGeo = new THREE.CylinderGeometry(0.22, 0.26, 1.35, 12);
  const bollardMat = new THREE.MeshStandardMaterial({
    color: 0x2563eb,
    emissive: new THREE.Color(0x3b82f6),
    emissiveIntensity: 0.30,
    roughness: 0.40,
  });
  geometries.push(barrierPostGeo, northRailGeo, southRailGeo, bollardGeo);
  materials.push(metalBarrierMat, bollardMat);

  const northRail = new THREE.Mesh(northRailGeo, metalBarrierMat);
  northRail.position.set(22.0, 0.62, 3.5);
  const southRail = new THREE.Mesh(southRailGeo, metalBarrierMat);
  southRail.position.set(22.0, 0.62, 28.85);
  parkingComplexGroup.add(northRail, southRail);

  const barrierPostZs = [-1.5, 1.5, 4.5, 7.5, 8.8, 27.7, 29.8];
  const barrierPostInst = new THREE.InstancedMesh(
    barrierPostGeo,
    metalBarrierMat,
    barrierPostZs.length
  );
  barrierPostZs.forEach((pz, i) => {
    dummy.rotation.set(0, 0, 0);
    dummy.scale.set(1, 1, 1);
    dummy.position.set(22.0, 0.42, pz);
    dummy.updateMatrix();
    barrierPostInst.setMatrixAt(i, dummy.matrix);
  });
  barrierPostInst.instanceMatrix.needsUpdate = true;
  barrierPostInst.computeBoundingSphere();
  parkingComplexGroup.add(barrierPostInst);

  for (const bz of [8.9, 27.6]) {
    const bollard = new THREE.Mesh(bollardGeo, bollardMat);
    bollard.position.set(22.0, 0.68, bz);
    parkingComplexGroup.add(bollard);
  }

  // Shared Building Materials
  const steelBlackMat = new THREE.MeshStandardMaterial({
    color: 0x0d1016,
    roughness: 0.56,
    metalness: 0.58,
  });
  const darkWallMat = new THREE.MeshStandardMaterial({
    color: 0x090b10,
    roughness: 0.82,
    metalness: 0.22,
  });
  const liftRedMat = new THREE.MeshStandardMaterial({
    color: 0xdc2626,
    roughness: 0.34,
    metalness: 0.42,
  });
  const redAccentMat = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    emissive: new THREE.Color(0xdc2626),
    emissiveIntensity: 0.22,
    roughness: 0.35,
  });
  const whiteTrimMat = new THREE.MeshStandardMaterial({
    color: 0xcbd5e1,
    roughness: 0.54,
    metalness: 0.08,
  });
  const ledStripMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    emissive: new THREE.Color(0xdbeafe),
    emissiveIntensity: 0.36,
    roughness: 0.28,
  });
  const glassFacadeMat = new THREE.MeshPhysicalMaterial({
    color: 0x0f1d32,
    transparent: true,
    opacity: 0.22,
    roughness: 0.04,
    metalness: 0.16,
    clearcoat: 1.0,
    clearcoatRoughness: 0.03,
    depthWrite: false,
  });
  const tallerFloorMat = new THREE.MeshPhysicalMaterial({
    map: textures.tallerFloor,
    roughnessMap: textures.tallerFloorRoughness,
    color: 0xffffff,
    roughness: 0.28,
    metalness: 0.16,
    clearcoat: 0.80,
    clearcoatRoughness: 0.18,
  });
  const woodFloorMat = new THREE.MeshPhysicalMaterial({
    map: textures.woodFloor,
    roughnessMap: textures.woodFloorRoughness,
    color: 0xffffff,
    roughness: 0.34,
    metalness: 0.08,
    clearcoat: 0.65,
    clearcoatRoughness: 0.22,
  });
  const bayCyanRingMat = new THREE.MeshBasicMaterial({
    color: 0x22d3ee,
    transparent: true,
    opacity: 0.92,
    side: THREE.DoubleSide,
  });
  const bayCyanFillMat = new THREE.MeshBasicMaterial({
    map: textures.underglowRadial,
    color: 0x06b6d4,
    transparent: true,
    opacity: 0.24,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const greenBoxMat = new THREE.MeshBasicMaterial({
    color: 0x22c55e,
    transparent: true,
    opacity: 0.92,
    side: THREE.DoubleSide,
  });
  const greenFillMat = new THREE.MeshBasicMaterial({
    map: textures.underglowRadial,
    color: 0x16a34a,
    transparent: true,
    opacity: 0.32,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const plinthMat = new THREE.MeshPhysicalMaterial({
    color: 0x11151d,
    roughness: 0.22,
    metalness: 0.45,
    clearcoat: 0.85,
  });
  const plinthTrimMat = new THREE.MeshStandardMaterial({
    color: 0xcbd5e1,
    emissive: new THREE.Color(0x94a3b8),
    emissiveIntensity: 0.22,
  });
  materials.push(
    steelBlackMat,
    darkWallMat,
    liftRedMat,
    redAccentMat,
    whiteTrimMat,
    ledStripMat,
    glassFacadeMat,
    tallerFloorMat,
    woodFloorMat,
    bayCyanRingMat,
    bayCyanFillMat,
    greenBoxMat,
    greenFillMat,
    plinthMat,
    plinthTrimMat
  );

  // --- A) LEFT SIDE OF COMPLEX: TALLER "78 GHOST GARAGE" ---
  // Spans x = 22.0 .. 38.0 (width 16.0m), z = -13.6 .. -2.0 (depth 11.6m), facing +Z toward Parking
  const hangarFloorGeo = new THREE.PlaneGeometry(16.0, 11.6);
  hangarFloorGeo.rotateX(-Math.PI / 2);
  const hangarRoofGeo = new THREE.BoxGeometry(16.0, 0.42, 11.6);
  const hangarBackGeo = new THREE.BoxGeometry(16.0, 5.2, 0.34);
  const hangarSideGeo = new THREE.BoxGeometry(0.34, 5.2, 11.6);
  const columnGeo = new THREE.BoxGeometry(0.32, 5.1, 0.32);
  const colRedStripeGeo = new THREE.BoxGeometry(0.08, 4.3, 0.04);
  const fasciaGeo = new THREE.BoxGeometry(16.0, 1.25, 0.36);
  const shutterRollGeo = new THREE.BoxGeometry(4.5, 0.36, 0.38);
  const wheelStopGeo = new THREE.CapsuleGeometry(0.11, 0.56, 6, 10);
  wheelStopGeo.rotateZ(Math.PI / 2);
  const ledPanelGeo = new THREE.BoxGeometry(1.15, 0.06, 2.1);
  const liftPostGeo = new THREE.BoxGeometry(0.18, 2.75, 0.22);
  const liftArmGeo = new THREE.BoxGeometry(0.75, 0.08, 0.12);
  const cartGeo = new THREE.BoxGeometry(0.85, 0.92, 0.52);
  const stackTireGeo = new THREE.TorusGeometry(0.28, 0.11, 10, 18);
  stackTireGeo.rotateX(Math.PI / 2);
  const bayRingGeo = new THREE.RingGeometry(1.55, 1.72, 36);
  bayRingGeo.rotateX(-Math.PI / 2);
  const bayGlowDiskGeo = new THREE.PlaneGeometry(4.1, 4.1);
  bayGlowDiskGeo.rotateX(-Math.PI / 2);

  geometries.push(
    hangarFloorGeo,
    hangarRoofGeo,
    hangarBackGeo,
    hangarSideGeo,
    columnGeo,
    colRedStripeGeo,
    fasciaGeo,
    shutterRollGeo,
    wheelStopGeo,
    ledPanelGeo,
    liftPostGeo,
    liftArmGeo,
    cartGeo,
    stackTireGeo,
    bayRingGeo,
    bayGlowDiskGeo
  );

  const hangarGroup = new THREE.Group();
  parkingComplexGroup.add(hangarGroup);

  const hangarFloor = new THREE.Mesh(hangarFloorGeo, tallerFloorMat);
  hangarFloor.position.set(30.0, 0.015, -7.8);
  hangarFloor.receiveShadow = true;
  const hangarRoof = new THREE.Mesh(hangarRoofGeo, steelBlackMat);
  hangarRoof.position.set(30.0, 5.25, -7.8);
  const hangarBack = new THREE.Mesh(hangarBackGeo, darkWallMat);
  hangarBack.position.set(30.0, 2.6, -13.5);
  const hangarLeft = new THREE.Mesh(hangarSideGeo, darkWallMat);
  hangarLeft.position.set(22.15, 2.6, -7.8);
  const hangarFascia = new THREE.Mesh(fasciaGeo, darkWallMat);
  hangarFascia.position.set(30.0, 4.75, -2.0);
  hangarGroup.add(hangarFloor, hangarRoof, hangarBack, hangarLeft, hangarFascia);

  // Dividing Wall between Taller & Concesionario (x = 38.0) with OPEN INTERIOR DOORWAY (z = -9.8..-6.2)
  const divWallBackGeo = new THREE.BoxGeometry(0.32, 5.2, 3.8);
  const divWallFrontGeo = new THREE.BoxGeometry(0.32, 5.2, 4.2);
  const divDoorHeaderGeo = new THREE.BoxGeometry(0.32, 2.1, 3.6);
  const divGlassPartitionGeo = new THREE.PlaneGeometry(3.6, 3.0);
  divGlassPartitionGeo.rotateY(Math.PI / 2);
  geometries.push(divWallBackGeo, divWallFrontGeo, divDoorHeaderGeo, divGlassPartitionGeo);

  const divWallBack = new THREE.Mesh(divWallBackGeo, darkWallMat);
  divWallBack.position.set(38.0, 2.6, -11.7);
  const divWallFront = new THREE.Mesh(divWallFrontGeo, darkWallMat);
  divWallFront.position.set(38.0, 2.6, -4.1);
  const divDoorHeader = new THREE.Mesh(divDoorHeaderGeo, darkWallMat);
  divDoorHeader.position.set(38.0, 4.15, -8.0);
  const divGlassWin = new THREE.Mesh(divGlassPartitionGeo, glassFacadeMat);
  divGlassWin.position.set(38.0, 1.65, -4.1);
  hangarGroup.add(divWallBack, divWallFront, divDoorHeader, divGlassWin);

  // Exterior Matte-Black Columns with Vertical Red Stripes
  for (const cx of [22.2, 27.4, 32.6, 37.8]) {
    const col = new THREE.Mesh(columnGeo, steelBlackMat);
    col.position.set(cx, 2.55, -2.0);
    const stripe = new THREE.Mesh(colRedStripeGeo, redAccentMat);
    stripe.position.set(cx, 2.25, -1.83);
    hangarGroup.add(col, stripe);
  }

  // Left-side Steel Staircase + Mezzanine Loft ("Altillo") inside Taller
  const loftDeckGeo = new THREE.BoxGeometry(3.1, 0.16, 3.2);
  const loftRailGeo = new THREE.BoxGeometry(3.1, 0.06, 0.06);
  const railPostGeo = new THREE.BoxGeometry(0.05, 0.95, 0.05);
  const stepGeo = new THREE.BoxGeometry(0.82, 0.07, 0.34);
  const stringerGeo = new THREE.BoxGeometry(0.06, 0.14, 5.2);
  geometries.push(loftDeckGeo, loftRailGeo, railPostGeo, stepGeo, stringerGeo);

  const loftDeck = new THREE.Mesh(loftDeckGeo, steelBlackMat);
  loftDeck.position.set(23.85, 2.88, -11.8);
  const loftFrontRail = new THREE.Mesh(loftRailGeo, gantrySteelMat);
  loftFrontRail.position.set(23.85, 3.75, -10.22);
  const loftSideRail = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 3.2), gantrySteelMat);
  loftSideRail.position.set(25.38, 3.75, -11.8);
  geometries.push(loftSideRail.geometry);
  hangarGroup.add(loftDeck, loftFrontRail, loftSideRail);

  for (const rx of [22.4, 23.85, 25.38]) {
    const p = new THREE.Mesh(railPostGeo, gantrySteelMat);
    p.position.set(rx, 3.35, -10.22);
    hangarGroup.add(p);
  }
  const stringerL = new THREE.Mesh(stringerGeo, gantrySteelMat);
  stringerL.position.set(22.34, 1.48, -8.35);
  stringerL.rotation.x = 0.56;
  const stringerR = new THREE.Mesh(stringerGeo, gantrySteelMat);
  stringerR.position.set(23.12, 1.48, -8.35);
  stringerR.rotation.x = 0.56;
  hangarGroup.add(stringerL, stringerR);

  for (let st = 0; st < 10; st++) {
    const t = (st + 1) / 10;
    const step = new THREE.Mesh(stepGeo, gantrySteelMat);
    step.position.set(22.73, t * 2.82, -6.2 - t * 4.05);
    hangarGroup.add(step);
  }

  // Rooftop "78 GHOST GARAGE" Sign + Top-Right Luminous "78" Emblem + Interior Wall Signs
  const hangarSignGeo = new THREE.PlaneGeometry(6.8, 1.65);
  const hangarSignMat = new THREE.MeshStandardMaterial({
    map: textures.hangarSign,
    emissiveMap: textures.hangarSign,
    emissive: new THREE.Color(0xffffff),
    emissiveIntensity: 0.26,
    roughness: 0.38,
  });
  const emblem78Geo = new THREE.PlaneGeometry(1.75, 1.75);
  const emblem78Mat = new THREE.MeshStandardMaterial({
    map: textures.number78Sign,
    emissiveMap: textures.number78Sign,
    emissive: new THREE.Color(0xffffff),
    emissiveIntensity: 0.28,
    roughness: 0.35,
  });
  const tallerWallSignGeo = new THREE.PlaneGeometry(5.6, 1.3);
  const tallerWallSignMat = new THREE.MeshStandardMaterial({
    map: textures.tallerWallSign,
    emissiveMap: textures.tallerWallSign,
    emissive: new THREE.Color(0xffffff),
    emissiveIntensity: 0.24,
    roughness: 0.38,
  });
  const ghostGarageSignGeo = new THREE.PlaneGeometry(4.2, 1.0);
  const ghostGarageSignMat = new THREE.MeshStandardMaterial({
    map: textures.ghostGarageSign,
    emissiveMap: textures.ghostGarageSign,
    emissive: new THREE.Color(0xffffff),
    emissiveIntensity: 0.24,
    side: THREE.DoubleSide,
    roughness: 0.36,
  });
  geometries.push(hangarSignGeo, emblem78Geo, tallerWallSignGeo, ghostGarageSignGeo);
  materials.push(hangarSignMat, emblem78Mat, tallerWallSignMat, ghostGarageSignMat);

  const hangarSignBoard = new THREE.Mesh(
    new THREE.BoxGeometry(7.1, 1.85, 0.25),
    darkWallMat
  );
  hangarSignBoard.position.set(28.8, 6.2, -2.08);
  geometries.push(hangarSignBoard.geometry);

  const hangarSignMesh = new THREE.Mesh(hangarSignGeo, hangarSignMat);
  hangarSignMesh.position.set(28.8, 6.2, -1.94);

  const emblem78Back = new THREE.Mesh(new THREE.BoxGeometry(1.9, 1.9, 0.24), darkWallMat);
  emblem78Back.position.set(36.7, 6.0, -2.06);
  geometries.push(emblem78Back.geometry);
  const emblem78Mesh = new THREE.Mesh(emblem78Geo, emblem78Mat);
  emblem78Mesh.position.set(36.7, 6.0, -1.92);

  const wallBackSign = new THREE.Mesh(tallerWallSignGeo, tallerWallSignMat);
  wallBackSign.position.set(30.0, 3.45, -13.3);
  const wallLeftSign = new THREE.Mesh(tallerWallSignGeo, tallerWallSignMat);
  wallLeftSign.rotation.y = Math.PI / 2;
  wallLeftSign.position.set(22.35, 4.15, -7.2);

  // "GHOST GARAGE" Sign mounted right over the interior doorway linking to Concesionario
  const ghostDoorSign = new THREE.Mesh(ghostGarageSignGeo, ghostGarageSignMat);
  ghostDoorSign.rotation.y = -Math.PI / 2;
  ghostDoorSign.position.set(37.80, 3.72, -8.0);

  hangarGroup.add(
    hangarSignBoard,
    hangarSignMesh,
    emblem78Back,
    emblem78Mesh,
    wallBackSign,
    wallLeftSign,
    ghostDoorSign
  );

  // 3 Open Bays (Instanced stops, LED ceiling panels, 2-post lifts & tires for max FPS)
  const bayCount = TUNER_BAY_X_CENTERS.length;
  const stopInst = new THREE.InstancedMesh(wheelStopGeo, whiteTrimMat, bayCount * 2);
  const tallerLedInst = new THREE.InstancedMesh(ledPanelGeo, ledStripMat, bayCount * 6);
  const liftPostInst = new THREE.InstancedMesh(liftPostGeo, liftRedMat, bayCount * 2);
  const liftArmInst = new THREE.InstancedMesh(liftArmGeo, steelBlackMat, bayCount * 2);
  let stopIdx = 0;
  let tallerLedIdx = 0;
  let liftIdx = 0;

  for (const rawBayX of TUNER_BAY_X_CENTERS) {
    const bayX = rawBayX - COMPLEX_SHIFT_X;
    const shutter = new THREE.Mesh(shutterRollGeo, steelBlackMat);
    shutter.position.set(bayX, 3.95, -2.05);
    hangarGroup.add(shutter);

    dummy.rotation.set(0, 0, 0);
    dummy.scale.set(1, 1, 1);

    for (const sSide of [-1, 1]) {
      dummy.position.set(bayX + sSide * 1.92, 0.11, -1.78);
      dummy.updateMatrix();
      stopInst.setMatrixAt(stopIdx++, dummy.matrix);
    }

    for (const lx of [-1.05, 1.05]) {
      for (const lz of [-4.4, -7.8, -11.2]) {
        dummy.position.set(bayX + lx, 4.98, lz);
        dummy.updateMatrix();
        tallerLedInst.setMatrixAt(tallerLedIdx++, dummy.matrix);
      }
    }

    const ring = new THREE.Mesh(bayRingGeo, bayCyanRingMat);
    ring.position.set(bayX, 0.025, -7.6);
    const glowDisk = new THREE.Mesh(bayGlowDiskGeo, bayCyanFillMat);
    glowDisk.position.set(bayX, 0.022, -7.6);
    hangarGroup.add(ring, glowDisk);

    for (const side of [-1, 1]) {
      dummy.position.set(bayX + side * 2.02, 1.38, -7.8);
      dummy.updateMatrix();
      liftPostInst.setMatrixAt(liftIdx, dummy.matrix);

      dummy.position.set(bayX + side * 1.62, 0.28, -7.8);
      dummy.updateMatrix();
      liftArmInst.setMatrixAt(liftIdx, dummy.matrix);
      liftIdx++;
    }
    const cart = new THREE.Mesh(cartGeo, liftRedMat);
    cart.position.set(bayX - 1.1, 0.46, -12.7);
    hangarGroup.add(cart);
  }
  for (const inst of [stopInst, tallerLedInst, liftPostInst, liftArmInst]) {
    inst.instanceMatrix.needsUpdate = true;
    inst.computeBoundingSphere();
  }
  hangarGroup.add(stopInst, tallerLedInst, liftPostInst, liftArmInst);

  const tireStackInst = new THREE.InstancedMesh(stackTireGeo, darkWallMat, 4);
  for (let i = 0; i < 4; i++) {
    dummy.rotation.set(0, 0, 0);
    dummy.scale.set(1, 1, 1);
    dummy.position.set(26.4, 0.14 + i * 0.21, -12.6);
    dummy.updateMatrix();
    tireStackInst.setMatrixAt(i, dummy.matrix);
  }
  tireStackInst.instanceMatrix.needsUpdate = true;
  tireStackInst.computeBoundingSphere();
  hangarGroup.add(tireStackInst);

  // --- B) CONNECTED VIP CONCESIONARIO (WOOD FLOOR, LOUNGE SOFAS, CAR ARTWORKS, GREEN COUNTER BOX & ALL 9 CARS) ---
  // Spans x = 38.0 .. 64.0 (width 26.0m), z = -18.0 .. +2.0 (depth 20.0m), glass front + open door at z = +2.0
  const dealerGroup = new THREE.Group();
  parkingComplexGroup.add(dealerGroup);

  const dealerRoofGeo = new THREE.BoxGeometry(26.0, 0.42, 20.0);
  const dealerBackGeo = new THREE.BoxGeometry(26.0, 5.2, 0.34);
  const dealerSideGeo = new THREE.BoxGeometry(0.34, 5.2, 20.0);
  const dealerFasciaGeo = new THREE.BoxGeometry(26.0, 1.15, 0.36);
  const dealerGlassLeftGeo = new THREE.PlaneGeometry(9.6, 4.2);
  const dealerGlassRightGeo = new THREE.PlaneGeometry(9.6, 4.2);
  const dealerGlassSideGeo = new THREE.PlaneGeometry(4.0, 4.2);
  dealerGlassSideGeo.rotateY(-Math.PI / 2);
  const dealerPadGeo = new THREE.PlaneGeometry(25.6, 19.6);
  dealerPadGeo.rotateX(-Math.PI / 2);
  const dealerLedGeo = new THREE.BoxGeometry(1.45, 0.06, 3.6);
  const plinthGeo = new THREE.CylinderGeometry(2.3, 2.45, 0.1, 32);
  const plinthRingGeo = new THREE.RingGeometry(2.34, 2.45, 32);
  plinthRingGeo.rotateX(-Math.PI / 2);
  const entryStripGeo = new THREE.BoxGeometry(6.0, 0.04, 0.22);

  geometries.push(
    dealerRoofGeo,
    dealerBackGeo,
    dealerSideGeo,
    dealerFasciaGeo,
    dealerGlassLeftGeo,
    dealerGlassRightGeo,
    dealerGlassSideGeo,
    dealerPadGeo,
    dealerLedGeo,
    plinthGeo,
    plinthRingGeo,
    entryStripGeo
  );

  const dealerRoof = new THREE.Mesh(dealerRoofGeo, steelBlackMat);
  dealerRoof.position.set(51.0, 5.25, -8.0);
  const dealerBack = new THREE.Mesh(dealerBackGeo, darkWallMat);
  dealerBack.position.set(51.0, 2.6, -17.9);
  const dealerRight = new THREE.Mesh(dealerSideGeo, darkWallMat);
  dealerRight.position.set(63.85, 2.6, -8.0);

  const dealerFascia = new THREE.Mesh(dealerFasciaGeo, steelBlackMat);
  dealerFascia.position.set(51.0, 4.75, 2.0);
  const dealerPad = new THREE.Mesh(dealerPadGeo, woodFloorMat);
  dealerPad.position.set(51.0, 0.025, -8.0);
  dealerPad.receiveShadow = true;
  dealerGroup.add(dealerRoof, dealerBack, dealerRight, dealerFascia, dealerPad);

  for (const mx of [38.2, 47.9, 54.1, 63.8]) {
    const mullion = new THREE.Mesh(columnGeo, steelBlackMat);
    mullion.position.set(mx, 2.55, 2.0);
    dealerGroup.add(mullion);
  }
  const glassFrontLeft = new THREE.Mesh(dealerGlassLeftGeo, glassFacadeMat);
  glassFrontLeft.position.set(43.05, 2.1, 2.02);
  const glassFrontRight = new THREE.Mesh(dealerGlassRightGeo, glassFacadeMat);
  glassFrontRight.position.set(58.95, 2.1, 2.02);
  const glassCornerSide = new THREE.Mesh(dealerGlassSideGeo, glassFacadeMat);
  glassCornerSide.position.set(38.02, 2.1, 0.0);
  // Open Walkable Doorway between x = 48.0 .. 54.0 at z = 2.0!
  const entryThreshold = new THREE.Mesh(entryStripGeo, ledStripMat);
  entryThreshold.position.set(51.0, 0.04, 2.0);
  dealerGroup.add(glassFrontLeft, glassFrontRight, glassCornerSide, entryThreshold);

  const dealerSignGeo = new THREE.PlaneGeometry(7.2, 1.4);
  const dealerSignMat = new THREE.MeshStandardMaterial({
    map: textures.dealershipSign,
    emissiveMap: textures.dealershipSign,
    emissive: new THREE.Color(0xffffff),
    emissiveIntensity: 0.26,
    roughness: 0.36,
  });
  geometries.push(dealerSignGeo);
  materials.push(dealerSignMat);
  const dealerSignMesh = new THREE.Mesh(dealerSignGeo, dealerSignMat);
  dealerSignMesh.position.set(51.0, 4.75, 2.2);
  dealerGroup.add(dealerSignMesh);

  // Interior Framed Car Artworks ("Cuadros de coches") + Concesionario Interior Wall Banner
  const frameOuterGeo = new THREE.BoxGeometry(3.2, 1.85, 0.12);
  const frameArtGeo = new THREE.PlaneGeometry(2.96, 1.62);
  const poster1Mat = new THREE.MeshStandardMaterial({
    map: textures.carPoster1,
    emissiveMap: textures.carPoster1,
    emissive: new THREE.Color(0xffffff),
    emissiveIntensity: 0.35,
    roughness: 0.4,
  });
  const poster2Mat = new THREE.MeshStandardMaterial({
    map: textures.carPoster2,
    emissiveMap: textures.carPoster2,
    emissive: new THREE.Color(0xffffff),
    emissiveIntensity: 0.35,
    roughness: 0.4,
  });
  geometries.push(frameOuterGeo, frameArtGeo);
  materials.push(poster1Mat, poster2Mat);

  const addWallArt = (x: number, y: number, z: number, rotY: number, mat: THREE.Material) => {
    const f = new THREE.Group();
    f.position.set(x, y, z);
    f.rotation.y = rotY;
    const border = new THREE.Mesh(frameOuterGeo, steelBlackMat);
    const art = new THREE.Mesh(frameArtGeo, mat);
    art.position.z = 0.07;
    f.add(border, art);
    dealerGroup.add(f);
  };
  addWallArt(46.0, 2.75, -17.65, 0, poster1Mat);
  addWallArt(56.0, 2.75, -17.65, 0, poster2Mat);
  addWallArt(63.6, 2.65, -11.5, -Math.PI / 2, poster1Mat);
  addWallArt(63.6, 2.65, -5.2, -Math.PI / 2, poster2Mat);

  const interiorBanner = new THREE.Mesh(new THREE.PlaneGeometry(5.8, 1.15), dealerSignMat);
  interiorBanner.position.set(51.0, 4.15, -17.65);
  geometries.push(interiorBanner.geometry);
  dealerGroup.add(interiorBanner);

  // VIP Lounge Front-Left: Rug + Two Gray Sofas + Low Coffee Table
  const sofaFabricMat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    roughness: 0.88,
    metalness: 0.06,
  });
  const rugMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.96,
  });
  const rugGeo = new THREE.BoxGeometry(5.6, 0.03, 3.6);
  const sofaSeatGeo = new THREE.BoxGeometry(2.6, 0.36, 0.92);
  const sofaBackGeo = new THREE.BoxGeometry(2.6, 0.56, 0.24);
  const sofaArmGeo = new THREE.BoxGeometry(0.22, 0.50, 0.94);
  const coffeeTopGeo = new THREE.BoxGeometry(1.5, 0.06, 0.92);
  const coffeeLegGeo = new THREE.BoxGeometry(1.2, 0.32, 0.68);
  geometries.push(rugGeo, sofaSeatGeo, sofaBackGeo, sofaArmGeo, coffeeTopGeo, coffeeLegGeo);
  materials.push(sofaFabricMat, rugMat);

  const loungeRug = new THREE.Mesh(rugGeo, rugMat);
  loungeRug.position.set(43.2, 0.04, -1.1);
  dealerGroup.add(loungeRug);

  const addSofa = (sx: number, sz: number, rotY: number) => {
    const sg = new THREE.Group();
    sg.position.set(sx, 0.05, sz);
    sg.rotation.y = rotY;
    const seat = new THREE.Mesh(sofaSeatGeo, sofaFabricMat);
    seat.position.y = 0.24;
    const back = new THREE.Mesh(sofaBackGeo, sofaFabricMat);
    back.position.set(0, 0.54, -0.34);
    const armL = new THREE.Mesh(sofaArmGeo, sofaFabricMat);
    armL.position.set(-1.22, 0.36, 0);
    const armR = new THREE.Mesh(sofaArmGeo, sofaFabricMat);
    armR.position.set(1.22, 0.36, 0);
    sg.add(seat, back, armL, armR);
    dealerGroup.add(sg);
  };
  addSofa(43.2, -2.35, 0);
  addSofa(41.1, -0.65, Math.PI / 2);

  const tableBase = new THREE.Mesh(coffeeLegGeo, steelBlackMat);
  tableBase.position.set(43.4, 0.21, -0.75);
  const tableTop = new THREE.Mesh(coffeeTopGeo, glassFacadeMat);
  tableTop.position.set(43.4, 0.40, -0.75);
  dealerGroup.add(tableBase, tableTop);

  // Reception Counter (Front-Right) + Glowing Green Floor Trigger Box
  const counterBodyGeo = new THREE.BoxGeometry(1.1, 1.05, 3.8);
  const counterTopGeo = new THREE.BoxGeometry(1.24, 0.08, 3.96);
  const monitorGeo = new THREE.BoxGeometry(0.06, 0.36, 0.62);
  const greenBorderLongGeo = new THREE.PlaneGeometry(1.9, 0.09);
  greenBorderLongGeo.rotateX(-Math.PI / 2);
  const greenBorderSideGeo = new THREE.PlaneGeometry(0.09, 1.9);
  greenBorderSideGeo.rotateX(-Math.PI / 2);
  const greenPadGeo = new THREE.PlaneGeometry(1.85, 1.85);
  greenPadGeo.rotateX(-Math.PI / 2);
  geometries.push(
    counterBodyGeo,
    counterTopGeo,
    monitorGeo,
    greenBorderLongGeo,
    greenBorderSideGeo,
    greenPadGeo
  );

  const counterDesk = new THREE.Mesh(counterBodyGeo, darkWallMat);
  counterDesk.position.set(58.4, 0.54, -0.8);
  const counterTop = new THREE.Mesh(counterTopGeo, whiteTrimMat);
  counterTop.position.set(58.4, 1.09, -0.8);
  const monitorA = new THREE.Mesh(monitorGeo, bayCyanRingMat);
  monitorA.position.set(58.35, 1.32, -1.35);
  const monitorB = new THREE.Mesh(monitorGeo, bayCyanRingMat);
  monitorB.position.set(58.35, 1.32, -0.25);
  dealerGroup.add(counterDesk, counterTop, monitorA, monitorB);

  // Glowing Green Floor Box ("Recuadro verde luminoso") at DEALERSHIP_COUNTER_POS (converted to local complex coords)
  const counterLocalX = DEALERSHIP_COUNTER_POS.x - COMPLEX_SHIFT_X;
  const gPad = new THREE.Mesh(greenPadGeo, greenFillMat);
  gPad.position.set(counterLocalX, 0.032, DEALERSHIP_COUNTER_POS.z);
  const gTop = new THREE.Mesh(greenBorderLongGeo, greenBoxMat);
  gTop.position.set(counterLocalX, 0.035, DEALERSHIP_COUNTER_POS.z - 0.92);
  const gBot = new THREE.Mesh(greenBorderLongGeo, greenBoxMat);
  gBot.position.set(counterLocalX, 0.035, DEALERSHIP_COUNTER_POS.z + 0.92);
  const gLeft = new THREE.Mesh(greenBorderSideGeo, greenBoxMat);
  gLeft.position.set(counterLocalX - 0.92, 0.035, DEALERSHIP_COUNTER_POS.z);
  const gRight = new THREE.Mesh(greenBorderSideGeo, greenBoxMat);
  gRight.position.set(counterLocalX + 0.92, 0.035, DEALERSHIP_COUNTER_POS.z);
  dealerGroup.add(gPad, gTop, gBot, gLeft, gRight);

  // All 9 Showcase Cars on Instanced Dark Plinths + Ceiling LED Panels
  const allCatalogSpecs = Object.values(CAR_CATALOG);
  const colXs = [42.5, 51.5, 60.5];
  const rowZs = [-15.5, -10.8, -6.0];

  const plinthInst = new THREE.InstancedMesh(plinthGeo, plinthMat, allCatalogSpecs.length);
  const plinthRingInst = new THREE.InstancedMesh(plinthRingGeo, plinthTrimMat, allCatalogSpecs.length);
  const dealerLedInst = new THREE.InstancedMesh(dealerLedGeo, ledStripMat, allCatalogSpecs.length);

  allCatalogSpecs.forEach((spec, idx) => {
    const col = idx % 3;
    const row = Math.floor(idx / 3);
    const sx = colXs[col] ?? 51.5;
    const sz = rowZs[row] ?? -10.8;

    dummy.rotation.set(0, 0, 0);
    dummy.scale.set(1, 1, 1);
    dummy.position.set(sx, 0.05, sz);
    dummy.updateMatrix();
    plinthInst.setMatrixAt(idx, dummy.matrix);

    dummy.position.set(sx, 0.105, sz);
    dummy.updateMatrix();
    plinthRingInst.setMatrixAt(idx, dummy.matrix);

    dummy.position.set(sx, 4.98, sz);
    dummy.updateMatrix();
    dealerLedInst.setMatrixAt(idx, dummy.matrix);

    const car = buildCompositeVehicle({
      style: spec.bodyStyle,
      paintHex: spec.defaultPaint,
      rimHex: spec.defaultRim,
      underglowHex: 'none',
      textures,
      isSoftwareGl,
      isTraffic: true,
    });
    car.root.position.set(sx, 0.10, sz);
    car.root.rotation.y = Math.PI * 0.82;
    dealerGroup.add(car.root);
    showcaseEntries.push({ carId: spec.id, x: sx + COMPLEX_SHIFT_X, z: sz, vehicle: car });
  });
  for (const inst of [plinthInst, plinthRingInst, dealerLedInst]) {
    inst.instanceMatrix.needsUpdate = true;
    inst.computeBoundingSphere();
  }
  dealerGroup.add(plinthInst, plinthRingInst, dealerLedInst);

  // --- C) GIANT "MEJORES PILOTOS A NIVEL MUNDIAL" LEADERBOARD BILLBOARD (RIGHT OF CONCESIONARIO) ---
  const lbGroup = new THREE.Group();
  lbGroup.position.set(65.6, 0, 4.6);
  lbGroup.rotation.y = -0.52;
  parkingComplexGroup.add(lbGroup);

  const lbPoleGeo = new THREE.CylinderGeometry(0.16, 0.2, 6.4, 10);
  const lbFrameGeo = new THREE.BoxGeometry(5.5, 5.5, 0.28);
  const lbFaceGeo = new THREE.PlaneGeometry(5.2, 5.2);
  const lbFaceMat = new THREE.MeshStandardMaterial({
    map: textures.leaderboardSign,
    emissiveMap: textures.leaderboardSign,
    emissive: new THREE.Color(0xffffff),
    emissiveIntensity: 0.22,
    roughness: 0.36,
  });
  geometries.push(lbPoleGeo, lbFrameGeo, lbFaceGeo);
  materials.push(lbFaceMat);

  const lbPoleL = new THREE.Mesh(lbPoleGeo, steelBlackMat);
  lbPoleL.position.set(-1.7, 3.2, 0);
  const lbPoleR = new THREE.Mesh(lbPoleGeo, steelBlackMat);
  lbPoleR.position.set(1.7, 3.2, 0);
  const lbFrame = new THREE.Mesh(lbFrameGeo, steelBlackMat);
  lbFrame.position.set(0, 4.5, 0);
  const lbFace = new THREE.Mesh(lbFaceGeo, lbFaceMat);
  lbFace.position.set(0, 4.5, 0.155);
  lbGroup.add(lbPoleL, lbPoleR, lbFrame, lbFace);

  // --- D) NOCTURNAL LOBBY PADDOCK PROPS (CARRIER TRUCK, STACKED CONTAINERS, 2 RED TENTS + CARS, GREEN FENCE & TREES) ---
  // 1. Car Carrier Truck (Background-left from Lobby perspective: x = 56.5, z = 9.0)
  const carrierGroup = new THREE.Group();
  carrierGroup.position.set(56.8, 0, 9.2);
  carrierGroup.rotation.y = -0.45;
  parkingComplexGroup.add(carrierGroup);

  const cabMat = new THREE.MeshPhysicalMaterial({
    color: 0xe2e8f0,
    roughness: 0.28,
    metalness: 0.35,
    clearcoat: 0.7,
  });
  const trailerSteelMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    metalness: 0.72,
    roughness: 0.42,
  });
  const truckTireMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.88 });
  const containerRedMat = new THREE.MeshStandardMaterial({
    color: 0xb91c1c,
    roughness: 0.62,
    metalness: 0.28,
  });
  const containerBlueMat = new THREE.MeshStandardMaterial({
    color: 0x1d4ed8,
    roughness: 0.58,
    metalness: 0.3,
  });
  const tentRedMat = new THREE.MeshStandardMaterial({
    color: 0xdc2626,
    roughness: 0.68,
    metalness: 0.08,
    side: THREE.DoubleSide,
  });
  materials.push(cabMat, trailerSteelMat, truckTireMat, containerRedMat, containerBlueMat, tentRedMat);

  const cabBodyGeo = new THREE.BoxGeometry(2.55, 2.35, 2.65);
  const cabWindshieldGeo = new THREE.BoxGeometry(2.38, 0.92, 0.1);
  const trailerLowerGeo = new THREE.BoxGeometry(2.6, 0.28, 9.6);
  const trailerUpperGeo = new THREE.BoxGeometry(2.45, 0.18, 8.2);
  const trailerPostGeo = new THREE.BoxGeometry(0.14, 1.9, 0.14);
  const truckWheelGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.34, 14);
  truckWheelGeo.rotateZ(Math.PI / 2);
  geometries.push(
    cabBodyGeo,
    cabWindshieldGeo,
    trailerLowerGeo,
    trailerUpperGeo,
    trailerPostGeo,
    truckWheelGeo
  );

  const cabMesh = new THREE.Mesh(cabBodyGeo, cabMat);
  cabMesh.position.set(0, 1.65, -4.7);
  const cabGlass = new THREE.Mesh(cabWindshieldGeo, glassFacadeMat);
  cabGlass.position.set(0, 2.15, -6.02);
  const trailerLower = new THREE.Mesh(trailerLowerGeo, trailerSteelMat);
  trailerLower.position.set(0, 0.72, 1.5);
  const trailerUpper = new THREE.Mesh(trailerUpperGeo, trailerSteelMat);
  trailerUpper.position.set(0, 2.48, 1.2);
  carrierGroup.add(cabMesh, cabGlass, trailerLower, trailerUpper);

  for (const px of [-1.2, 1.2]) {
    for (const pz of [-2.4, 1.2, 4.8]) {
      const post = new THREE.Mesh(trailerPostGeo, trailerSteelMat);
      post.position.set(px, 1.6, pz);
      carrierGroup.add(post);
    }
  }
  for (const wx of [-1.18, 1.18]) {
    for (const wz of [-5.2, -3.7, 3.6, 5.1]) {
      const tw = new THREE.Mesh(truckWheelGeo, truckTireMat);
      tw.position.set(wx, 0.48, wz);
      carrierGroup.add(tw);
    }
  }

  // Loaded sports cars on the carrier decks
  const carrierSpecs = [CAR_CATALOG.elegy_r34, CAR_CATALOG.supra_mk5];
  carrierSpecs.forEach((spec, idx) => {
    const c = buildCompositeVehicle({
      style: spec.bodyStyle,
      paintHex: spec.defaultPaint,
      rimHex: spec.defaultRim,
      underglowHex: 'none',
      textures,
      isSoftwareGl,
      isTraffic: true,
    });
    c.root.position.set(0, idx === 0 ? 0.86 : 2.57, idx === 0 ? 3.2 : 0.6);
    c.root.rotation.y = 0;
    carrierGroup.add(c.root);
    showcaseEntries.push({ carId: `carrier_${idx}`, x: 56.8 + COMPLEX_SHIFT_X, z: 9.2, vehicle: c });
  });

  // 2. Two Stacked Shipping Containers (Red bottom, Blue top)
  const containerGeo = new THREE.BoxGeometry(6.1, 2.58, 2.45);
  const containerRibGeo = new THREE.BoxGeometry(0.10, 2.38, 2.50);
  geometries.push(containerGeo, containerRibGeo);

  const buildContainer = (x: number, y: number, z: number, rotY: number, mat: THREE.Material) => {
    const cg = new THREE.Group();
    cg.position.set(x, y, z);
    cg.rotation.y = rotY;
    const box = new THREE.Mesh(containerGeo, mat);
    cg.add(box);
    for (let rx = -2.7; rx <= 2.75; rx += 0.45) {
      const rib = new THREE.Mesh(containerRibGeo, mat);
      rib.position.x = rx;
      cg.add(rib);
    }
    parkingComplexGroup.add(cg);
  };
  buildContainer(60.6, 1.30, 16.6, -0.18, containerRedMat);
  buildContainer(60.5, 3.88, 16.6, -0.12, containerBlueMat);

  // 3. Two Red Paddock Canopy Tents with Sports Cars Parked Underneath
  const tentLegGeo = new THREE.CylinderGeometry(0.05, 0.05, 2.45, 8);
  const tentValanceGeo = new THREE.BoxGeometry(4.6, 0.44, 4.6);
  const tentRoofGeo = new THREE.ConeGeometry(3.3, 1.15, 4);
  tentRoofGeo.rotateY(Math.PI / 4);
  geometries.push(tentLegGeo, tentValanceGeo, tentRoofGeo);

  const tentConfigs = [
    { x: 55.2, z: 23.0, rotY: -0.35, spec: CAR_CATALOG.comet_gt3, carRot: -1.9 },
    { x: 48.0, z: 25.8, rotY: -0.22, spec: CAR_CATALOG.m4_csl, carRot: -1.8 },
  ];
  tentConfigs.forEach((tc, idx) => {
    const tg = new THREE.Group();
    tg.position.set(tc.x, 0, tc.z);
    tg.rotation.y = tc.rotY;
    for (const lx of [-2.2, 2.2]) {
      for (const lz of [-2.2, 2.2]) {
        const leg = new THREE.Mesh(tentLegGeo, gantrySteelMat);
        leg.position.set(lx, 1.22, lz);
        tg.add(leg);
      }
    }
    const roof = new THREE.Mesh(tentRoofGeo, tentRedMat);
    roof.position.set(0, 3.05, 0);
    const valance = new THREE.Mesh(tentValanceGeo, tentRedMat);
    valance.position.set(0, 2.38, 0);
    tg.add(roof, valance);
    parkingComplexGroup.add(tg);

    const parkedCar = buildCompositeVehicle({
      style: tc.spec.bodyStyle,
      paintHex: tc.spec.defaultPaint,
      rimHex: tc.spec.defaultRim,
      underglowHex: 'none',
      textures,
      isSoftwareGl,
      isTraffic: true,
    });
    parkedCar.root.position.set(tc.x, 0.015, tc.z);
    parkedCar.root.rotation.y = tc.carRot;
    parkingComplexGroup.add(parkedCar.root);
    showcaseEntries.push({ carId: `tent_${idx}`, x: tc.x + COMPLEX_SHIFT_X, z: tc.z, vehicle: parkedCar });
  });

  // 4. Dark-Green Metallic Chain-Link Fence enclosing South (z=30.0) & East (x=67.8) edges
  const fenceGreenMat = new THREE.MeshStandardMaterial({
    color: 0x114228,
    roughness: 0.45,
    metalness: 0.65,
  });
  const chainMeshMat = new THREE.MeshStandardMaterial({
    map: textures.chainLinkFence,
    transparent: true,
    alphaTest: 0.32,
    side: THREE.DoubleSide,
    roughness: 0.4,
    metalness: 0.72,
  });
  materials.push(fenceGreenMat, chainMeshMat);

  const fencePanelGeo = new THREE.PlaneGeometry(3.0, 2.35);
  const fencePostGeo = new THREE.CylinderGeometry(0.045, 0.05, 2.45, 8);
  const fenceTopRailGeo = new THREE.CylinderGeometry(0.03, 0.03, 3.0, 6);
  fenceTopRailGeo.rotateZ(Math.PI / 2);
  geometries.push(fencePanelGeo, fencePostGeo, fenceTopRailGeo);

  const fenceTransforms: Array<{ x: number; z: number; rotY: number }> = [];
  for (let fx = 23.9; fx <= 66.5; fx += 3.0) {
    fenceTransforms.push({ x: fx, z: 29.9, rotY: 0 });
  }
  for (let fz = 3.5; fz <= 28.5; fz += 3.0) {
    fenceTransforms.push({ x: 67.8, z: fz, rotY: Math.PI / 2 });
  }
  const fencePanelInst = new THREE.InstancedMesh(fencePanelGeo, chainMeshMat, fenceTransforms.length);
  const fenceRailInst = new THREE.InstancedMesh(fenceTopRailGeo, fenceGreenMat, fenceTransforms.length);
  const fencePostInst = new THREE.InstancedMesh(fencePostGeo, fenceGreenMat, fenceTransforms.length);
  fenceTransforms.forEach((ft, i) => {
    dummy.scale.set(1, 1, 1);
    dummy.rotation.set(0, ft.rotY, 0);
    dummy.position.set(ft.x, 1.22, ft.z);
    dummy.updateMatrix();
    fencePanelInst.setMatrixAt(i, dummy.matrix);

    dummy.position.set(ft.x, 2.40, ft.z);
    dummy.updateMatrix();
    fenceRailInst.setMatrixAt(i, dummy.matrix);

    dummy.rotation.set(0, 0, 0);
    if (ft.rotY === 0) {
      dummy.position.set(ft.x - 1.5, 1.22, ft.z);
    } else {
      dummy.position.set(ft.x, 1.22, ft.z - 1.5);
    }
    dummy.updateMatrix();
    fencePostInst.setMatrixAt(i, dummy.matrix);
  });
  for (const inst of [fencePanelInst, fenceRailInst, fencePostInst]) {
    inst.instanceMatrix.needsUpdate = true;
    inst.computeBoundingSphere();
  }
  parkingComplexGroup.add(fencePanelInst, fenceRailInst, fencePostInst);

  // 5. Lush Broadleaf Trees Behind Fence (visible in Lobby & Parking backdrop)
  const lushTrunkGeo = new THREE.CylinderGeometry(0.24, 0.34, 3.2, 8);
  const lushFoliageGeo = new THREE.DodecahedronGeometry(2.3, 1);
  const lushFoliageMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.86 });
  geometries.push(lushTrunkGeo, lushFoliageGeo);
  materials.push(lushFoliageMat);

  const lushPositions: Array<{ x: number; z: number; s: number }> = [];
  for (let lx = 26; lx <= 78; lx += 5.4) {
    lushPositions.push({ x: lx + ((lx * 7) % 3) * 0.4, z: 33.2 + (lx % 2) * 1.8, s: 1.0 + (lx % 3) * 0.18 });
    lushPositions.push({ x: lx + 2.4, z: 38.4, s: 1.25 + (lx % 2) * 0.22 });
  }
  for (let lz = 0; lz <= 34; lz += 5.2) {
    lushPositions.push({ x: 70.6 + (lz % 3) * 1.4, z: lz, s: 1.05 + (lz % 3) * 0.2 });
    lushPositions.push({ x: 75.8, z: lz + 2.2, s: 1.32 });
  }

  const lushTrunkInst = new THREE.InstancedMesh(lushTrunkGeo, trunkMat, lushPositions.length);
  const lushCrownInst = new THREE.InstancedMesh(lushFoliageGeo, lushFoliageMat, lushPositions.length * 2);
  const lushPalette = [
    new THREE.Color(0x164a2a),
    new THREE.Color(0x1e5c34),
    new THREE.Color(0x133d23),
  ];
  lushPositions.forEach((lp, i) => {
    dummy.rotation.set(0, i * 0.65, 0);
    dummy.scale.set(lp.s, lp.s, lp.s);
    dummy.position.set(lp.x, 1.6 * lp.s, lp.z);
    dummy.updateMatrix();
    lushTrunkInst.setMatrixAt(i, dummy.matrix);

    dummy.position.set(lp.x, 4.1 * lp.s, lp.z);
    dummy.updateMatrix();
    lushCrownInst.setMatrixAt(i * 2, dummy.matrix);
    lushCrownInst.setColorAt(i * 2, lushPalette[i % 3]);

    dummy.scale.set(lp.s * 0.78, lp.s * 0.78, lp.s * 0.78);
    dummy.position.set(lp.x + 1.1 * lp.s, 3.5 * lp.s, lp.z - 0.8 * lp.s);
    dummy.updateMatrix();
    lushCrownInst.setMatrixAt(i * 2 + 1, dummy.matrix);
    lushCrownInst.setColorAt(i * 2 + 1, lushPalette[(i + 1) % 3]);
  });
  lushTrunkInst.instanceMatrix.needsUpdate = true;
  lushCrownInst.instanceMatrix.needsUpdate = true;
  if (lushCrownInst.instanceColor) lushCrownInst.instanceColor.needsUpdate = true;
  lushTrunkInst.computeBoundingSphere();
  lushCrownInst.computeBoundingSphere();
  parkingComplexGroup.add(lushTrunkInst, lushCrownInst);

  // Instanced Parking streetlamps illuminating esplanade & paddock
  const lampPostGeo = new THREE.CylinderGeometry(0.09, 0.13, 6.4, 10);
  const lampHeadGeo = new THREE.BoxGeometry(0.75, 0.12, 0.36);
  const bulbGlowMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    emissive: new THREE.Color(0xfef3c7),
    emissiveIntensity: 0.30,
  });
  geometries.push(lampPostGeo, lampHeadGeo);
  materials.push(bulbGlowMat);

  const lampCoords: Array<[number, number]> = [
    [24.5, 28.2],
    [40.0, 28.2],
    [55.5, 28.2],
    [65.5, 14.0],
  ];
  const lampPostInst = new THREE.InstancedMesh(lampPostGeo, steelBlackMat, lampCoords.length);
  const lampHeadInst = new THREE.InstancedMesh(lampHeadGeo, bulbGlowMat, lampCoords.length);
  lampCoords.forEach(([lx, lz], i) => {
    dummy.rotation.set(0, 0, 0);
    dummy.scale.set(1, 1, 1);
    dummy.position.set(lx, 3.2, lz);
    dummy.updateMatrix();
    lampPostInst.setMatrixAt(i, dummy.matrix);

    dummy.position.set(lx, 6.38, lz);
    dummy.updateMatrix();
    lampHeadInst.setMatrixAt(i, dummy.matrix);
  });
  lampPostInst.instanceMatrix.needsUpdate = true;
  lampHeadInst.instanceMatrix.needsUpdate = true;
  lampPostInst.computeBoundingSphere();
  lampHeadInst.computeBoundingSphere();
  parkingComplexGroup.add(lampPostInst, lampHeadInst);

  const parkPointLights: Array<{ light: THREE.PointLight; nightIntensity: number }> = [];
  if (!isSoftwareGl) {
    const parkLight1 = new THREE.PointLight(0xf8fafc, 2.2, 28, 1.45);
    parkLight1.position.set(30.0, 4.2, -7.8);
    const parkLight2 = new THREE.PointLight(0xfffbeb, 2.5, 36, 1.35);
    parkLight2.position.set(51.0, 4.4, -8.0);
    const parkLight3 = new THREE.PointLight(0xfef3c7, 2.0, 38, 1.4);
    parkLight3.position.set(44.0, 6.2, 16.0);
    const paddockTentLight = new THREE.PointLight(0xfca5a5, 1.5, 16, 1.6);
    paddockTentLight.position.set(51.5, 2.8, 24.4);
    parkingComplexGroup.add(parkLight1, parkLight2, parkLight3, paddockTentLight);
    parkPointLights.push(
      { light: parkLight1, nightIntensity: 2.2 },
      { light: parkLight2, nightIntensity: 2.5 },
      { light: parkLight3, nightIntensity: 2.0 },
      { light: paddockTentLight, nightIntensity: 1.5 }
    );
  }

  // --- E) ZONA CAR MEET (43.5, 22.5) + CONTRATO EXPRESS TOTEM (37.0, 6.2) ---
  const cmCenterLocalX = CAR_MEET_CENTER.x - COMPLEX_SHIFT_X;
  const cmMinLocalX = CAR_MEET_BOUNDS.minX - COMPLEX_SHIFT_X;
  const cmMaxLocalX = CAR_MEET_BOUNDS.maxX - COMPLEX_SHIFT_X;
  const cmPadW = CAR_MEET_BOUNDS.maxX - CAR_MEET_BOUNDS.minX;
  const cmPadD = CAR_MEET_BOUNDS.maxZ - CAR_MEET_BOUNDS.minZ;
  const cmPadGeo = new THREE.PlaneGeometry(cmPadW, cmPadD);
  cmPadGeo.rotateX(-Math.PI / 2);
  const cmEdgeHGeo = new THREE.PlaneGeometry(cmPadW, 0.14);
  cmEdgeHGeo.rotateX(-Math.PI / 2);
  const cmEdgeVGeo = new THREE.PlaneGeometry(0.14, cmPadD);
  cmEdgeVGeo.rotateX(-Math.PI / 2);
  const cmFillMat = new THREE.MeshBasicMaterial({
    color: 0x06b6d4,
    transparent: true,
    opacity: 0.10,
    depthWrite: false,
  });
  const cmEdgeMat = new THREE.MeshBasicMaterial({
    color: 0x22d3ee,
    transparent: true,
    opacity: 0.72,
  });
  const cmSignBackGeo = new THREE.BoxGeometry(3.56, 0.96, 0.08);
  const cmSignGeo = new THREE.PlaneGeometry(3.4, 0.85);
  const cmSignMat = new THREE.MeshStandardMaterial({
    map: textures.carMeetSign,
    emissiveMap: textures.carMeetSign,
    emissive: new THREE.Color(0xffffff),
    emissiveIntensity: 0.26,
    side: THREE.FrontSide,
  });
  const cmPoleGeo = new THREE.CylinderGeometry(0.06, 0.08, 2.3, 8);
  geometries.push(cmPadGeo, cmEdgeHGeo, cmEdgeVGeo, cmSignBackGeo, cmSignGeo, cmPoleGeo);
  materials.push(cmFillMat, cmEdgeMat, cmSignMat);

  const cmPad = new THREE.Mesh(cmPadGeo, cmFillMat);
  cmPad.position.set(cmCenterLocalX, 0.022, CAR_MEET_CENTER.z);
  const cmEdgeN = new THREE.Mesh(cmEdgeHGeo, cmEdgeMat);
  cmEdgeN.position.set(cmCenterLocalX, 0.026, CAR_MEET_BOUNDS.minZ);
  const cmEdgeS = new THREE.Mesh(cmEdgeHGeo, cmEdgeMat);
  cmEdgeS.position.set(cmCenterLocalX, 0.026, CAR_MEET_BOUNDS.maxZ);
  const cmEdgeW = new THREE.Mesh(cmEdgeVGeo, cmEdgeMat);
  cmEdgeW.position.set(cmMinLocalX, 0.026, CAR_MEET_CENTER.z);
  const cmEdgeE = new THREE.Mesh(cmEdgeVGeo, cmEdgeMat);
  cmEdgeE.position.set(cmMaxLocalX, 0.026, CAR_MEET_CENTER.z);
  const cmPole = new THREE.Mesh(cmPoleGeo, steelBlackMat);
  cmPole.position.set(cmCenterLocalX, 1.15, CAR_MEET_BOUNDS.maxZ + 0.35);
  const cmSignBackBoard = new THREE.Mesh(cmSignBackGeo, steelBlackMat);
  cmSignBackBoard.position.set(cmCenterLocalX, 1.95, CAR_MEET_BOUNDS.maxZ + 0.35);
  // Front face rotated PI to face -Z (into the parking lot) so "ZONA CAR MEET" reads left-to-right!
  const cmSignFront = new THREE.Mesh(cmSignGeo, cmSignMat);
  cmSignFront.position.set(cmCenterLocalX, 1.95, CAR_MEET_BOUNDS.maxZ + 0.35 - 0.045);
  cmSignFront.rotation.y = Math.PI;
  // Back face rotated 0 to face +Z (outside) so it also reads left-to-right from outside
  const cmSignBack = new THREE.Mesh(cmSignGeo, cmSignMat);
  cmSignBack.position.set(cmCenterLocalX, 1.95, CAR_MEET_BOUNDS.maxZ + 0.35 + 0.045);
  parkingComplexGroup.add(
    cmPad,
    cmEdgeN,
    cmEdgeS,
    cmEdgeW,
    cmEdgeE,
    cmPole,
    cmSignBackBoard,
    cmSignFront,
    cmSignBack
  );

  // Contrato Express Interactive Totem at CONTRACT_POS (world x = 37.0, z = 6.2)
  const ctLocalX = CONTRACT_POS.x - COMPLEX_SHIFT_X;
  const ctRingGeo = new THREE.RingGeometry(1.15, 1.45, 32);
  ctRingGeo.rotateX(-Math.PI / 2);
  const ctFillGeo = new THREE.CircleGeometry(1.15, 32);
  ctFillGeo.rotateX(-Math.PI / 2);
  const ctKioskGeo = new THREE.BoxGeometry(0.48, 1.95, 0.32);
  const ctSignBoardGeo = new THREE.BoxGeometry(2.52, 0.74, 0.06);
  const ctSignGeo = new THREE.PlaneGeometry(2.4, 0.65);
  const ctSignMat = new THREE.MeshStandardMaterial({
    map: textures.contractSign,
    emissiveMap: textures.contractSign,
    emissive: new THREE.Color(0xffffff),
    emissiveIntensity: 0.26,
    side: THREE.FrontSide,
  });
  geometries.push(ctRingGeo, ctFillGeo, ctKioskGeo, ctSignBoardGeo, ctSignGeo);
  materials.push(ctSignMat);

  const ctRing = new THREE.Mesh(ctRingGeo, greenBoxMat);
  ctRing.position.set(ctLocalX, 0.028, CONTRACT_POS.z);
  const ctFill = new THREE.Mesh(ctFillGeo, greenFillMat);
  ctFill.position.set(ctLocalX, 0.024, CONTRACT_POS.z);
  const ctKiosk = new THREE.Mesh(ctKioskGeo, steelBlackMat);
  ctKiosk.position.set(ctLocalX - 1.1, 0.98, CONTRACT_POS.z);
  ctKiosk.rotation.y = 0.55;
  const ctSignGroup = new THREE.Group();
  ctSignGroup.position.set(ctLocalX - 1.1, 2.25, CONTRACT_POS.z);
  ctSignGroup.rotation.y = 0.55;
  const ctSignBoard = new THREE.Mesh(ctSignBoardGeo, steelBlackMat);
  const ctSignFront = new THREE.Mesh(ctSignGeo, ctSignMat);
  ctSignFront.position.z = 0.034;
  const ctSignBack = new THREE.Mesh(ctSignGeo, ctSignMat);
  ctSignBack.position.z = -0.034;
  ctSignBack.rotation.y = Math.PI;
  ctSignGroup.add(ctSignBoard, ctSignFront, ctSignBack);
  parkingComplexGroup.add(ctRing, ctFill, ctKiosk, ctSignGroup);

  // ==================== 6. INSTANCED HIGHWAY GANTRIES & OVERPASSES AROUND ELEVATED LOOP ====================
  const signMat1 = new THREE.MeshStandardMaterial({
    map: textures.highwaySign1,
    emissiveMap: textures.highwaySign1,
    emissive: new THREE.Color(0xffffff),
    emissiveIntensity: 0.20,
    roughness: 0.45,
  });
  const signMat2 = new THREE.MeshStandardMaterial({
    map: textures.highwaySign2,
    emissiveMap: textures.highwaySign2,
    emissive: new THREE.Color(0xffffff),
    emissiveIntensity: 0.20,
    roughness: 0.45,
  });
  materials.push(signMat1, signMat2);

  const poleGeo = new THREE.CylinderGeometry(0.15, 0.2, 8.2, 8);
  const trussGeo = new THREE.BoxGeometry(44.0, 0.45, 0.38);
  const lampArmGeo = new THREE.BoxGeometry(1.1, 0.1, 0.35);
  const signPanelGeo = new THREE.PlaneGeometry(8.6, 2.0);
  geometries.push(poleGeo, trussGeo, lampArmGeo, signPanelGeo);

  const gantrySList: number[] = [];
  const gantrySpacing = 78;
  for (let s = 32; s < track.totalLength - 32; s += gantrySpacing) {
    if (!track.isInRampMergeZone(s)) {
      gantrySList.push(s);
    }
  }

  const polesInst = new THREE.InstancedMesh(poleGeo, gantrySteelMat, gantrySList.length * 2);
  const trussInst = new THREE.InstancedMesh(trussGeo, gantrySteelMat, gantrySList.length);
  const lampsInst = new THREE.InstancedMesh(lampArmGeo, bulbGlowMat, gantrySList.length * 2);

  const sign1Indices: number[] = [];
  const sign2Indices: number[] = [];
  for (let i = 0; i < gantrySList.length; i++) {
    if (i % 2 === 0) {
      if (i % 4 === 0) sign1Indices.push(i);
      else sign2Indices.push(i);
    }
  }
  const signInst1 = new THREE.InstancedMesh(signPanelGeo, signMat1, Math.max(1, sign1Indices.length));
  const signInst2 = new THREE.InstancedMesh(signPanelGeo, signMat2, Math.max(1, sign2Indices.length));
  signInst1.count = sign1Indices.length;
  signInst2.count = sign2Indices.length;
  group.add(polesInst, trussInst, lampsInst, signInst1, signInst2);

  let s1Cursor = 0;
  let s2Cursor = 0;
  gantrySList.forEach((gs, i) => {
    track.sampleAtS(gs, sample);
    dummy.rotation.set(0, sample.yaw, 0);
    dummy.scale.set(1, 1, 1);

    dummy.position.set(sample.x - sample.rx * 21.7, HIGHWAY_Y + 4.1, sample.z - sample.rz * 21.7);
    dummy.updateMatrix();
    polesInst.setMatrixAt(i * 2, dummy.matrix);

    dummy.position.set(sample.x + sample.rx * 21.7, HIGHWAY_Y + 4.1, sample.z + sample.rz * 21.7);
    dummy.updateMatrix();
    polesInst.setMatrixAt(i * 2 + 1, dummy.matrix);

    dummy.position.set(sample.x, HIGHWAY_Y + 7.9, sample.z);
    dummy.updateMatrix();
    trussInst.setMatrixAt(i, dummy.matrix);

    dummy.position.set(sample.x - sample.rx * 10.2, HIGHWAY_Y + 7.6, sample.z - sample.rz * 10.2);
    dummy.updateMatrix();
    lampsInst.setMatrixAt(i * 2, dummy.matrix);

    dummy.position.set(sample.x + sample.rx * 10.2, HIGHWAY_Y + 7.6, sample.z + sample.rz * 10.2);
    dummy.updateMatrix();
    lampsInst.setMatrixAt(i * 2 + 1, dummy.matrix);

    if (i % 2 === 0) {
      dummy.position.set(
        sample.x + sample.rx * 10.5 - sample.tx * 0.24,
        HIGHWAY_Y + 7.45,
        sample.z + sample.rz * 10.5 - sample.tz * 0.24
      );
      dummy.updateMatrix();
      if (i % 4 === 0) {
        signInst1.setMatrixAt(s1Cursor++, dummy.matrix);
      } else {
        signInst2.setMatrixAt(s2Cursor++, dummy.matrix);
      }
    }
  });
  for (const inst of [polesInst, trussInst, lampsInst, signInst1, signInst2]) {
    inst.instanceMatrix.needsUpdate = true;
    inst.computeBoundingSphere();
  }

  // Overpasses & Pedestrian Bridges placed above the 42m elevated deck
  const bridgeDeckGeo = new THREE.BoxGeometry(92, 1.3, 7.5);
  const bridgePierGeo = new THREE.BoxGeometry(1.6, HIGHWAY_Y + 8.6, 2.2);
  const pedDeckGeo = new THREE.BoxGeometry(56, 0.75, 2.8);
  const pedGlassGeo = new THREE.BoxGeometry(56, 1.35, 0.08);
  geometries.push(bridgeDeckGeo, bridgePierGeo, pedDeckGeo, pedGlassGeo);

  const cullableGroups: THREE.Object3D[] = [];
  const overpassCount = 9;
  for (let i = 0; i < overpassCount; i++) {
    const os = track.wrapS(175 + i * (track.totalLength / overpassCount));
    track.sampleAtS(os, sample);
    if (sample.x > -45 && sample.z > -225 && sample.z < 55) continue;

    const ov = new THREE.Group();
    if (i % 2 === 1) {
      const deck = new THREE.Mesh(bridgeDeckGeo, concreteMat);
      deck.position.y = HIGHWAY_Y + 9.2;
      const pierL = new THREE.Mesh(bridgePierGeo, concreteMat);
      pierL.position.set(-26.0, (HIGHWAY_Y + 8.6) * 0.5, 0);
      const pierR = new THREE.Mesh(bridgePierGeo, concreteMat);
      pierR.position.set(26.0, (HIGHWAY_Y + 8.6) * 0.5, 0);
      ov.add(deck, pierL, pierR);
    } else {
      const pedDeck = new THREE.Mesh(pedDeckGeo, gantrySteelMat);
      pedDeck.position.y = HIGHWAY_Y + 6.4;
      const pedGlassF = new THREE.Mesh(pedGlassGeo, glassFacadeMat);
      pedGlassF.position.set(0, HIGHWAY_Y + 7.4, 1.36);
      const pedGlassB = new THREE.Mesh(pedGlassGeo, glassFacadeMat);
      pedGlassB.position.set(0, HIGHWAY_Y + 7.4, -1.36);
      const pierL = new THREE.Mesh(bridgePierGeo, concreteMat);
      pierL.scale.set(0.65, 0.78, 0.65);
      pierL.position.set(-24.8, (HIGHWAY_Y + 6.4) * 0.5, 0);
      const pierR = new THREE.Mesh(bridgePierGeo, concreteMat);
      pierR.scale.set(0.65, 0.78, 0.65);
      pierR.position.set(24.8, (HIGHWAY_Y + 6.4) * 0.5, 0);
      ov.add(pedDeck, pedGlassF, pedGlassB, pierL, pierR);
    }
    ov.position.set(sample.x, 0, sample.z);
    ov.rotation.y = sample.yaw;
    group.add(ov);
    cullableGroups.push(ov);
  }

  // ==================== 7. INSTANCED MODERN METROPOLIS SKYLINE AROUND LOOP ====================
  const towerGlassMat = new THREE.MeshPhysicalMaterial({
    map: textures.skyscraperFacade,
    roughnessMap: textures.skyscraperRoughness,
    emissiveMap: textures.skyscraperEmissive,
    emissive: new THREE.Color(0xffffff),
    emissiveIntensity: 0.06,
    color: 0x64748b,
    roughness: 0.30,
    metalness: 0.58,
    clearcoat: 0.55,
    clearcoatRoughness: 0.16,
  });

  const towerConcreteMat = new THREE.MeshPhysicalMaterial({
    map: textures.skyscraperFacade,
    emissiveMap: textures.skyscraperEmissive,
    emissive: new THREE.Color(0xffe8c2),
    emissiveIntensity: 0.04,
    color: 0x64748b,
    roughness: 0.62,
    metalness: 0.22,
  });

  const crownWarmMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    emissive: new THREE.Color(0xfbbf24),
    emissiveIntensity: 0.15,
  });
  const crownCoolMat = new THREE.MeshStandardMaterial({
    color: 0xcbd5e1,
    emissive: new THREE.Color(0x93c5fd),
    emissiveIntensity: 0.15,
  });
  materials.push(towerGlassMat, towerConcreteMat, crownWarmMat, crownCoolMat);

  interface TowerPlacement {
    x: number;
    z: number;
    w: number;
    h: number;
    d: number;
    yaw: number;
    tier: 'core' | 'dense';
    isGlass: boolean;
    isWarmCrown: boolean;
  }

  const placements: TowerPlacement[] = [];
  const buildingStepS = 38;
  let bIdx = 0;

  for (let s = 0; s < track.totalLength; s += buildingStepS) {
    track.sampleAtS(s, sample);
    for (const side of [-1, 1] as const) {
      bIdx++;
      const w = 13 + (bIdx % 4) * 3.8;
      const d = 13 + ((bIdx * 3) % 4) * 3.6;
      const h = 34 + ((bIdx * 23) % 76) + (bIdx % 3 === 0 ? 22 : 0);
      const layer = bIdx % 3;
      const offsetDist = 37 + (w + d) * 0.38 + layer * 22 + ((bIdx * 7) % 10);

      const tx = sample.x + sample.rx * side * offsetDist;
      const tz = sample.z + sample.rz * side * offsetDist;

      const minTrackDist = track.minDistanceToTrack(tx, tz);
      const radius = Math.hypot(w, d) * 0.55 + 27;
      if (minTrackDist < radius) continue;

      const inComplexOrRamp = tx > 10 && tx < 106 && tz > -215 && tz < 58;
      if (inComplexOrRamp) continue;

      placements.push({
        x: tx,
        z: tz,
        w,
        h,
        d,
        yaw: sample.yaw,
        tier: layer === 2 ? 'dense' : 'core',
        isGlass: bIdx % 3 !== 0,
        isWarmCrown: bIdx % 2 === 1,
      });
    }
  }

  placements.sort((a, b) => (a.tier === b.tier ? 0 : a.tier === 'core' ? -1 : 1));
  const coreTowerCount = placements.filter((p) => p.tier === 'core').length;
  const lowTowerCount = Math.max(24, Math.floor(coreTowerCount * 0.65));

  const unitBoxGeo = new THREE.BoxGeometry(1, 1, 1);
  geometries.push(unitBoxGeo);

  const glassPlacements = placements.filter((p) => p.isGlass);
  const concretePlacements = placements.filter((p) => !p.isGlass);
  const warmPlacements = placements.filter((p) => p.isWarmCrown);
  const coolPlacements = placements.filter((p) => !p.isWarmCrown);

  const podiumInst = new THREE.InstancedMesh(unitBoxGeo, darkWallMat, placements.length);
  const glassInst = new THREE.InstancedMesh(unitBoxGeo, towerGlassMat, glassPlacements.length);
  const concInst = new THREE.InstancedMesh(unitBoxGeo, towerConcreteMat, concretePlacements.length);
  const warmCrownInst = new THREE.InstancedMesh(unitBoxGeo, crownWarmMat, warmPlacements.length);
  const coolCrownInst = new THREE.InstancedMesh(unitBoxGeo, crownCoolMat, coolPlacements.length);

  group.add(podiumInst, glassInst, concInst, warmCrownInst, coolCrownInst);

  placements.forEach((p, idx) => {
    dummy.rotation.set(0, p.yaw, 0);
    dummy.scale.set(p.w + 2.4, 7.5, p.d + 2.4);
    dummy.position.set(p.x, 3.7, p.z);
    dummy.updateMatrix();
    podiumInst.setMatrixAt(idx, dummy.matrix);
  });

  glassPlacements.forEach((p, idx) => {
    dummy.rotation.set(0, p.yaw, 0);
    dummy.scale.set(p.w, p.h, p.d);
    dummy.position.set(p.x, p.h * 0.5 - 0.05, p.z);
    dummy.updateMatrix();
    glassInst.setMatrixAt(idx, dummy.matrix);
  });

  concretePlacements.forEach((p, idx) => {
    dummy.rotation.set(0, p.yaw, 0);
    dummy.scale.set(p.w, p.h, p.d);
    dummy.position.set(p.x, p.h * 0.5 - 0.05, p.z);
    dummy.updateMatrix();
    concInst.setMatrixAt(idx, dummy.matrix);
  });

  warmPlacements.forEach((p, idx) => {
    dummy.rotation.set(0, p.yaw, 0);
    dummy.scale.set(p.w + 0.3, 0.45, p.d + 0.3);
    dummy.position.set(p.x, p.h + 0.18, p.z);
    dummy.updateMatrix();
    warmCrownInst.setMatrixAt(idx, dummy.matrix);
  });

  coolPlacements.forEach((p, idx) => {
    dummy.rotation.set(0, p.yaw, 0);
    dummy.scale.set(p.w + 0.3, 0.45, p.d + 0.3);
    dummy.position.set(p.x, p.h + 0.18, p.z);
    dummy.updateMatrix();
    coolCrownInst.setMatrixAt(idx, dummy.matrix);
  });

  for (const inst of [podiumInst, glassInst, concInst, warmCrownInst, coolCrownInst]) {
    inst.instanceMatrix.needsUpdate = true;
    inst.computeBoundingSphere();
  }

  // ==================== 8. HIGH-SPEED 3D RAIN STREAKS ====================
  const rainCount = isSoftwareGl ? 320 : 800;
  const rainPositions = new Float32Array(rainCount * 6);
  for (let i = 0; i < rainCount; i++) {
    const x = (Math.random() - 0.5) * 32;
    const y = Math.random() * 14;
    const z = (Math.random() - 0.5) * 48;
    const idx = i * 6;
    rainPositions[idx] = x;
    rainPositions[idx + 1] = y;
    rainPositions[idx + 2] = z;
    rainPositions[idx + 3] = x - 0.08;
    rainPositions[idx + 4] = y + 0.75;
    rainPositions[idx + 5] = z + 0.55;
  }
  const rainGeo = new THREE.BufferGeometry();
  rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
  geometries.push(rainGeo);

  const rainMat = new THREE.LineBasicMaterial({
    color: 0xbae6fd,
    transparent: true,
    opacity: 0.42,
    depthWrite: false,
  });
  materials.push(rainMat);

  const rainSystem = new THREE.LineSegments(rainGeo, rainMat);
  rainSystem.frustumCulled = false;
  rainSystem.visible = false;
  group.add(rainSystem);

  // ==================== 8b. REALISTIC ATMOSPHERIC SKY, SUN, CLOUDS & URBAN NIGHT DOME + MOON ====================
  const sky = new Sky();
  sky.scale.setScalar(4500);
  sky.frustumCulled = false;
  group.add(sky);

  const nightDomeGeo = new THREE.SphereGeometry(2600, 24, 16);
  const nightDomeMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    uniforms: {
      uZenithColor: { value: new THREE.Color(0x0b172e) },
      uHorizonColor: { value: new THREE.Color(0x1b3258) },
      uGroundColor: { value: new THREE.Color(0x101c34) },
      uTime: { value: 0 },
    },
    vertexShader: /* glsl */ `
      varying vec3 vWorldDir;
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorldDir = normalize(position);
        gl_Position = projectionMatrix * viewMatrix * wp;
        gl_Position.z = gl_Position.w;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uZenithColor;
      uniform vec3 uHorizonColor;
      uniform vec3 uGroundColor;
      uniform float uTime;
      varying vec3 vWorldDir;

      float hash21(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }

      void main() {
        float h = clamp(vWorldDir.y, -1.0, 1.0);
        vec3 col = h >= 0.0
          ? mix(uHorizonColor, uZenithColor, pow(h, 0.55))
          : mix(uHorizonColor, uGroundColor, pow(-h, 0.45));

        if (h > 0.08) {
          vec2 starGrid = floor((vWorldDir.xz / (vWorldDir.y + 0.35)) * 110.0);
          float rnd = hash21(starGrid);
          if (rnd > 0.992) {
            float twinkle = 0.55 + 0.45 * sin(uTime * 1.4 + rnd * 90.0);
            col += vec3(0.45, 0.58, 0.78) * twinkle * smoothstep(0.08, 0.35, h);
          }
        }
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
  const nightDome = new THREE.Mesh(nightDomeGeo, nightDomeMat);
  nightDome.frustumCulled = false;
  nightDome.visible = false;
  group.add(nightDome);

  const moonGeo = new THREE.SphereGeometry(28, 16, 12);
  const moonMat = new THREE.MeshBasicMaterial({
    color: 0xd8e6f8,
    fog: false,
  });
  const moonMesh = new THREE.Mesh(moonGeo, moonMat);
  moonMesh.position.set(-420, 390, -820);
  moonMesh.frustumCulled = false;
  moonMesh.visible = false;
  group.add(moonMesh);

  geometries.push(nightDomeGeo, moonGeo);
  materials.push(nightDomeMat, moonMat, sky.material);

  // ==================== 9. LIGHTING ====================
  const hemiLight = new THREE.HemisphereLight(0x8ec5fc, 0x353c48, 1.0);
  group.add(hemiLight);

  const keyLight = new THREE.DirectionalLight(0xfff6e5, 1.32);
  keyLight.position.set(60, 78, 42);
  if (!isSoftwareGl) {
    keyLight.castShadow = false;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 2;
    keyLight.shadow.camera.far = 110;
    keyLight.shadow.camera.left = -36;
    keyLight.shadow.camera.right = 36;
    keyLight.shadow.camera.top = 36;
    keyLight.shadow.camera.bottom = -36;
    keyLight.shadow.bias = -0.0005;
  }
  group.add(keyLight);

  // ==================== 6b. 4 HIGHWAY SPEED RADAR GANTRIES & 10 CONTRACT CHECKPOINTS ====================
  const radarNodes: HighwayRadarNode[] = [];
  const radarDefs = [
    { id: 'radar_1', label: 'RADAR WANGAN NORTE', ratio: 0.14, limitKmh: 180 },
    { id: 'radar_2', label: 'RADAR GINZA CURVA', ratio: 0.38, limitKmh: 200 },
    { id: 'radar_3', label: 'RADAR SHIBAURA SUR', ratio: 0.64, limitKmh: 220 },
    { id: 'radar_4', label: 'RADAR RECTA FINAL', ratio: 0.87, limitKmh: 240 },
  ];
  const radarSignGeo = new THREE.PlaneGeometry(4.8, 1.2);
  const radarSignMat = new THREE.MeshStandardMaterial({
    map: textures.radarSign,
    emissiveMap: textures.radarSign,
    emissive: new THREE.Color(0xffffff),
    emissiveIntensity: 0.24,
    side: THREE.DoubleSide,
  });
  const radarCamBoxGeo = new THREE.BoxGeometry(0.95, 0.55, 0.55);
  const radarFlashGeo = new THREE.SphereGeometry(0.32, 10, 8);
  const radarFlashMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    toneMapped: false,
  });
  const radarPostGeo = new THREE.CylinderGeometry(0.14, 0.18, 6.2, 8);
  const radarArmGeo = new THREE.BoxGeometry(14.5, 0.24, 0.24);
  geometries.push(radarSignGeo, radarCamBoxGeo, radarFlashGeo, radarPostGeo, radarArmGeo);
  materials.push(radarSignMat, radarFlashMat);

  for (const rd of radarDefs) {
    const rs = track.wrapS(rd.ratio * track.totalLength);
    track.sampleAtS(rs, sample);
    const rg = new THREE.Group();
    rg.position.set(sample.x, HIGHWAY_Y, sample.z);
    rg.rotation.y = sample.yaw;

    const rPost = new THREE.Mesh(radarPostGeo, gantrySteelMat);
    rPost.position.set(21.3, 3.1, 0);
    const rArm = new THREE.Mesh(radarArmGeo, gantrySteelMat);
    rArm.position.set(14.3, 6.0, 0);
    const rBoard = new THREE.Mesh(radarSignGeo, radarSignMat);
    rBoard.position.set(12.2, 5.45, 0.22);
    const rCam = new THREE.Mesh(radarCamBoxGeo, steelBlackMat);
    rCam.position.set(8.8, 6.2, 0.15);
    const flashMesh = new THREE.Mesh(radarFlashGeo, radarFlashMat);
    flashMesh.position.set(8.8, 6.2, 0.45);
    rg.add(rPost, rArm, rBoard, rCam, flashMesh);
    group.add(rg);
    cullableGroups.push(rg);

    radarNodes.push({
      id: rd.id,
      label: rd.label,
      s: rs,
      limitKmh: rd.limitKmh,
      x: sample.x,
      z: sample.z,
      flashMesh,
    });
  }

  // 10 Glowing Emerald Contract Express Highway Checkpoints (hidden until Contract is active)
  const contractCheckpoints: ContractCheckpointNode[] = [];
  const cpArchGeo = new THREE.TorusGeometry(19.6, 0.32, 8, 32, Math.PI);
  const cpFloorStripGeo = new THREE.PlaneGeometry(40.0, 1.4);
  cpFloorStripGeo.rotateX(-Math.PI / 2);
  geometries.push(cpArchGeo, cpFloorStripGeo);

  for (let i = 0; i < 10; i++) {
    const cs = track.wrapS((0.09 + i * 0.088) * track.totalLength);
    track.sampleAtS(cs, sample);
    const cpMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.78,
      toneMapped: false,
      side: THREE.DoubleSide,
    });
    materials.push(cpMat);

    const cpGroup = new THREE.Group();
    cpGroup.position.set(sample.x, HIGHWAY_Y + 0.04, sample.z);
    cpGroup.rotation.y = sample.yaw;
    cpGroup.visible = false;

    const arch = new THREE.Mesh(cpArchGeo, cpMat);
    const strip = new THREE.Mesh(cpFloorStripGeo, cpMat);
    cpGroup.add(arch, strip);
    group.add(cpGroup);

    contractCheckpoints.push({
      s: cs,
      x: sample.x,
      z: sample.z,
      yaw: sample.yaw,
      group: cpGroup,
      ringMat: cpMat,
    });
  }

  let currentQuality: GraphicsQuality = 'MEDIUM';
  let currentViewDist: ViewDistance = 'MEDIUM';

  const applyTowerCounts = () => {
    const qRatio =
      currentQuality === 'LOW'
        ? lowTowerCount / placements.length
        : currentQuality === 'MEDIUM'
          ? coreTowerCount / placements.length
          : 1;
    const vdFactor = currentViewDist === 'SHORT' ? 0.65 : currentViewDist === 'MEDIUM' ? 0.85 : 1;
    const ratio = Math.min(1, qRatio * vdFactor);
    podiumInst.count = Math.max(1, Math.round(placements.length * ratio));
    glassInst.count = Math.max(1, Math.round(glassPlacements.length * ratio));
    concInst.count = Math.max(1, Math.round(concretePlacements.length * ratio));
    warmCrownInst.count = Math.max(1, Math.round(warmPlacements.length * ratio));
    coolCrownInst.count = Math.max(1, Math.round(coolPlacements.length * ratio));
  };

  const applyFogRange = (scene: THREE.Scene) => {
    const fog = scene.fog;
    if (fog instanceof THREE.Fog) {
      if (currentViewDist === 'SHORT') {
        fog.near = 400;
        fog.far = 780;
      } else if (currentViewDist === 'MEDIUM') {
        fog.near = 480;
        fog.far = 1080;
      } else {
        fog.near = 600;
        fog.far = 1480;
      }
    }
  };

  const sunVec = new THREE.Vector3();

  return {
    group,
    parkingComplexGroup,
    track,
    showcaseEntries,
    radarNodes,
    contractCheckpoints,
    cullableGroups,
    asphaltMat,
    roadMesh,
    cityGround,
    rainSystem,
    rainPositions,
    rainCount,
    hemiLight,
    keyLight,
    setAtmosphere: (weather: WeatherMode, scene: THREE.Scene) => {
      rainSystem.visible = false;
      const isSunset = weather === 'SUNSET';
      const isNight = weather === 'NIGHT';

      const skyUniforms = sky.material.uniforms;

      if (isNight) {
        sky.visible = false;
        nightDome.visible = true;
        moonMesh.visible = true;

        const fogHex = 0x0d182e;
        scene.background = new THREE.Color(fogHex);
        if (scene.fog instanceof THREE.Fog) {
          scene.fog.color.setHex(fogHex);
        } else if (scene.fog instanceof THREE.FogExp2) {
          scene.fog.color.setHex(fogHex);
          scene.fog.density = 0.0008;
        }
        applyFogRange(scene);

        hemiLight.color.setHex(0x6c8ec4);
        hemiLight.groundColor.setHex(0x101828);
        hemiLight.intensity = 0.62;
        keyLight.color.setHex(0xc4daf8);
        keyLight.intensity = 0.78;
        keyLight.position.set(-48, 68, -72);

        cityGroundMat.color.setHex(0x101622);
        taludMat.color.setHex(0x172b20);

        asphaltMat.roughness = 0.66;
        asphaltMat.metalness = 0.18;
        asphaltMat.clearcoat = 0.16;
        asphaltMat.clearcoatRoughness = 0.30;
        asphaltMat.envMapIntensity = 0.68;
        asphaltMat.color.setHex(0x28303d);

        rampDeckMat.roughness = 0.66;
        rampDeckMat.clearcoat = 0.14;
        parkPadMat.roughness = 0.68;
        parkPadMat.clearcoat = 0.14;

        towerGlassMat.emissiveIntensity = 0.56;
        towerConcreteMat.emissiveIntensity = 0.40;
        crownWarmMat.emissiveIntensity = 0.52;
        crownCoolMat.emissiveIntensity = 0.48;

        hangarSignMat.emissiveIntensity = 0.46;
        emblem78Mat.emissiveIntensity = 0.48;
        tallerWallSignMat.emissiveIntensity = 0.42;
        ghostGarageSignMat.emissiveIntensity = 0.42;
        dealerSignMat.emissiveIntensity = 0.44;
        lbFaceMat.emissiveIntensity = 0.40;
        cmSignMat.emissiveIntensity = 0.44;
        ctSignMat.emissiveIntensity = 0.44;
        radarSignMat.emissiveIntensity = 0.42;
        medianSignMat.emissiveIntensity = 0.42;
        rampPortalSignMat.emissiveIntensity = 0.46;
        signMat1.emissiveIntensity = 0.38;
        signMat2.emissiveIntensity = 0.38;
        ledStripMat.emissiveIntensity = 0.56;
        bulbGlowMat.emissiveIntensity = 0.62;
        rampBulbMat.emissiveIntensity = 0.65;
        bollardMat.emissiveIntensity = 0.48;
        barrierLedMat.emissiveIntensity = 0.52;
        redAccentMat.emissiveIntensity = 0.38;
        plinthTrimMat.emissiveIntensity = 0.35;
        reflectorMat.emissiveIntensity = 0.62;

        for (const pl of parkPointLights) {
          pl.light.intensity = pl.nightIntensity;
        }
      } else if (isSunset) {
        sky.visible = true;
        nightDome.visible = false;
        moonMesh.visible = false;

        const phi = THREE.MathUtils.degToRad(90 - 6.5);
        const theta = THREE.MathUtils.degToRad(-145);
        sunVec.setFromSphericalCoords(1, phi, theta);
        skyUniforms['sunPosition'].value.copy(sunVec);
        skyUniforms['turbidity'].value = 4.2;
        skyUniforms['rayleigh'].value = 1.9;
        skyUniforms['mieCoefficient'].value = 0.0032;
        skyUniforms['mieDirectionalG'].value = 0.78;
        skyUniforms['cloudCoverage'].value = 0.36;
        skyUniforms['cloudDensity'].value = 0.28;
        skyUniforms['cloudElevation'].value = 0.52;
        skyUniforms['showSunDisc'].value = 1;

        const fogHex = 0x7c4e4a;
        scene.background = new THREE.Color(fogHex);
        if (scene.fog instanceof THREE.Fog) {
          scene.fog.color.setHex(fogHex);
        } else if (scene.fog instanceof THREE.FogExp2) {
          scene.fog.color.setHex(fogHex);
          scene.fog.density = 0.0007;
        }
        applyFogRange(scene);

        hemiLight.color.setHex(0xffbe8a);
        hemiLight.groundColor.setHex(0x2d2438);
        hemiLight.intensity = 0.62;
        keyLight.color.setHex(0xffac6c);
        keyLight.intensity = 1.08;
        keyLight.position.set(sunVec.x * 95, Math.max(18, sunVec.y * 95), sunVec.z * 95);

        cityGroundMat.color.setHex(0x1f222c);
        taludMat.color.setHex(0x243b28);

        asphaltMat.roughness = 0.72;
        asphaltMat.metalness = 0.14;
        asphaltMat.clearcoat = 0.10;
        asphaltMat.clearcoatRoughness = 0.34;
        asphaltMat.envMapIntensity = 0.62;
        asphaltMat.color.setHex(0x363b47);

        rampDeckMat.roughness = 0.70;
        rampDeckMat.clearcoat = 0.10;
        parkPadMat.roughness = 0.72;
        parkPadMat.clearcoat = 0.08;

        towerGlassMat.emissiveIntensity = 0.24;
        towerConcreteMat.emissiveIntensity = 0.16;
        crownWarmMat.emissiveIntensity = 0.30;
        crownCoolMat.emissiveIntensity = 0.26;

        hangarSignMat.emissiveIntensity = 0.26;
        emblem78Mat.emissiveIntensity = 0.28;
        tallerWallSignMat.emissiveIntensity = 0.24;
        ghostGarageSignMat.emissiveIntensity = 0.24;
        dealerSignMat.emissiveIntensity = 0.26;
        lbFaceMat.emissiveIntensity = 0.22;
        cmSignMat.emissiveIntensity = 0.24;
        ctSignMat.emissiveIntensity = 0.24;
        radarSignMat.emissiveIntensity = 0.24;
        medianSignMat.emissiveIntensity = 0.24;
        rampPortalSignMat.emissiveIntensity = 0.26;
        signMat1.emissiveIntensity = 0.20;
        signMat2.emissiveIntensity = 0.20;
        ledStripMat.emissiveIntensity = 0.36;
        bulbGlowMat.emissiveIntensity = 0.36;
        rampBulbMat.emissiveIntensity = 0.38;
        bollardMat.emissiveIntensity = 0.30;
        barrierLedMat.emissiveIntensity = 0.35;
        redAccentMat.emissiveIntensity = 0.24;
        plinthTrimMat.emissiveIntensity = 0.24;
        reflectorMat.emissiveIntensity = 0.42;

        for (const pl of parkPointLights) {
          pl.light.intensity = pl.nightIntensity * 0.65;
        }
      } else {
        // 'DAY' (Default: Crisp Blue Sky, Zero Milky Fog Wash)
        sky.visible = true;
        nightDome.visible = false;
        moonMesh.visible = false;

        const phi = THREE.MathUtils.degToRad(90 - 34);
        const theta = THREE.MathUtils.degToRad(-125);
        sunVec.setFromSphericalCoords(1, phi, theta);
        skyUniforms['sunPosition'].value.copy(sunVec);
        skyUniforms['turbidity'].value = 1.6;
        skyUniforms['rayleigh'].value = 1.45;
        skyUniforms['mieCoefficient'].value = 0.0012;
        skyUniforms['mieDirectionalG'].value = 0.72;
        skyUniforms['cloudCoverage'].value = 0.30;
        skyUniforms['cloudDensity'].value = 0.24;
        skyUniforms['cloudElevation'].value = 0.56;
        skyUniforms['showSunDisc'].value = 1;

        const fogHex = 0x5c8fc2;
        scene.background = new THREE.Color(fogHex);
        if (scene.fog instanceof THREE.Fog) {
          scene.fog.color.setHex(fogHex);
        } else if (scene.fog instanceof THREE.FogExp2) {
          scene.fog.color.setHex(fogHex);
          scene.fog.density = 0.0005;
        }
        applyFogRange(scene);

        hemiLight.color.setHex(0x8ec5fc);
        hemiLight.groundColor.setHex(0x303744);
        hemiLight.intensity = 0.62;
        keyLight.color.setHex(0xfff4e0);
        keyLight.intensity = 1.08;
        keyLight.position.set(sunVec.x * 100, Math.max(38, sunVec.y * 100), sunVec.z * 100);

        cityGroundMat.color.setHex(0x212833);
        taludMat.color.setHex(0x284730);

        asphaltMat.roughness = 0.78;
        asphaltMat.metalness = 0.12;
        asphaltMat.clearcoat = 0.06;
        asphaltMat.clearcoatRoughness = 0.40;
        asphaltMat.envMapIntensity = 0.48;
        asphaltMat.color.setHex(0x3a414e);

        rampDeckMat.roughness = 0.76;
        rampDeckMat.clearcoat = 0.05;
        parkPadMat.roughness = 0.78;
        parkPadMat.clearcoat = 0.05;

        towerGlassMat.emissiveIntensity = 0.04;
        towerConcreteMat.emissiveIntensity = 0.02;
        crownWarmMat.emissiveIntensity = 0.12;
        crownCoolMat.emissiveIntensity = 0.12;

        hangarSignMat.emissiveIntensity = 0.16;
        emblem78Mat.emissiveIntensity = 0.18;
        tallerWallSignMat.emissiveIntensity = 0.14;
        ghostGarageSignMat.emissiveIntensity = 0.14;
        dealerSignMat.emissiveIntensity = 0.16;
        lbFaceMat.emissiveIntensity = 0.14;
        cmSignMat.emissiveIntensity = 0.16;
        ctSignMat.emissiveIntensity = 0.16;
        radarSignMat.emissiveIntensity = 0.16;
        medianSignMat.emissiveIntensity = 0.16;
        rampPortalSignMat.emissiveIntensity = 0.22;
        signMat1.emissiveIntensity = 0.14;
        signMat2.emissiveIntensity = 0.14;
        ledStripMat.emissiveIntensity = 0.28;
        bulbGlowMat.emissiveIntensity = 0.22;
        rampBulbMat.emissiveIntensity = 0.24;
        bollardMat.emissiveIntensity = 0.20;
        barrierLedMat.emissiveIntensity = 0.24;
        redAccentMat.emissiveIntensity = 0.16;
        plinthTrimMat.emissiveIntensity = 0.16;
        reflectorMat.emissiveIntensity = 0.30;

        for (const pl of parkPointLights) {
          pl.light.intensity = pl.nightIntensity * 0.42;
        }
      }
      asphaltMat.needsUpdate = true;
      rampDeckMat.needsUpdate = true;
      parkPadMat.needsUpdate = true;
    },
    setQuality: (quality: GraphicsQuality) => {
      currentQuality = quality;
      applyTowerCounts();

      const shadowsOn = !isSoftwareGl && quality === 'HIGH';
      keyLight.castShadow = shadowsOn;
      cityGround.receiveShadow = shadowsOn;
      roadMesh.receiveShadow = shadowsOn;
      rampDeckMesh.receiveShadow = shadowsOn;
      rampMergeDeckMesh.receiveShadow = shadowsOn;
      taludLMesh.receiveShadow = shadowsOn;
      taludRMesh.receiveShadow = shadowsOn;
      parkPad.receiveShadow = shadowsOn;
      accessApron.receiveShadow = shadowsOn;
      crosswalkApron.receiveShadow = shadowsOn;
      hangarFloor.receiveShadow = shadowsOn;
      dealerPad.receiveShadow = shadowsOn;

      if (shadowsOn) {
        const targetSize = 1024;
        if (keyLight.shadow.mapSize.x !== targetSize) {
          keyLight.shadow.mapSize.set(targetSize, targetSize);
          keyLight.shadow.map?.dispose();
          keyLight.shadow.map = null;
        }
      }
    },
    setViewDistance: (
      viewDist: ViewDistance,
      scene: THREE.Scene,
      camera: THREE.PerspectiveCamera
    ) => {
      currentViewDist = viewDist;
      camera.far = viewDist === 'SHORT' ? 840 : viewDist === 'MEDIUM' ? 1160 : 1620;
      camera.updateProjectionMatrix();
      applyFogRange(scene);
      applyTowerCounts();
    },
    updateScroll: (
      anchorX: number,
      anchorZ: number,
      _anchorY: number,
      _speedMs: number,
      dt: number,
      _isStorm: boolean,
      inParking: boolean
    ) => {
      // Drift clouds slowly & keep night sky dome centered around viewer
      const skyU = sky.material.uniforms;
      if (sky.visible && skyU['time']) {
        skyU['time'].value += dt;
      }
      if (nightDome.visible) {
        nightDomeMat.uniforms['uTime'].value += dt;
        const cx = inParking ? 50 : anchorX;
        const cz = inParking ? 10 : anchorZ;
        nightDome.position.set(cx, 0, cz);
        moonMesh.position.set(cx - 420, 390, cz - 820);
      }
    },
    dispose: () => {
      showcaseEntries.forEach((c) => c.vehicle.dispose());
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
    },
  };
}
