// App state and UI wiring for DispGen (Web)
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js?module';

// --------------------------- DOM ---------------------------
const el = {
  heightmapInput: document.getElementById('heightmapInput'),
  tilesX: document.getElementById('tilesX'),
  tilesY: document.getElementById('tilesY'),
  tileSize: document.getElementById('tileSize'),
  maxHeight: document.getElementById('maxHeight'),
  materialPath: document.getElementById('materialPath'),
  dispPower: document.getElementById('dispPower'),
  showGrid: document.getElementById('showGrid'),
  // Skybox elements
  enableSkybox: document.getElementById('enableSkybox'),
  skyboxTopOffset: document.getElementById('skyboxTopOffset'),
  showMaxBounds: document.getElementById('showMaxBounds'),
  skyboxDimensions: document.getElementById('skyboxDimensions'),
  // Mask editor
  maskMode: null, // Removed checkbox, always enabled in Material tab
  showMask: null, // Removed checkbox, always enabled in Material tab
  genSlopeMask: document.getElementById('genSlopeMask'),
  genNoiseMask: document.getElementById('genNoiseMask'),
  genErosionMask: document.getElementById('genErosionMask'),
  maskInput: document.getElementById('maskInput'),
  brushSize: document.getElementById('brushSize'),
  brushStrength: document.getElementById('brushStrength'),
  brushPaintMode: document.getElementById('brushPaintMode'),
  brushEraseMode: document.getElementById('brushEraseMode'),
  clearMask: document.getElementById('clearMask'),
  previewBtn: document.getElementById('previewBtn'),
  generateBtn: document.querySelector('.generate-vmf-btn'),
  dimensions: document.getElementById('dimensions'),
  canvas: document.getElementById('threeCanvas'),
  viewer: document.getElementById('viewer'),
  // Mask generator panel
  maskGeneratorPanel: document.getElementById('maskGeneratorPanel'),
  maskGeneratorTitle: document.getElementById('maskGeneratorTitle'),
  closeMaskGenerator: document.getElementById('closeMaskGenerator'),
  slopeMaskPanel: document.getElementById('slopeMaskPanel'),
  noiseMaskPanel: document.getElementById('noiseMaskPanel'),
  erosionMaskPanel: document.getElementById('erosionMaskPanel'),
  maskLivePreview: document.getElementById('maskLivePreview'),
  maskBlendModal: document.getElementById('maskBlendModal'),
  maskBlendOverlay: document.getElementById('maskBlendOverlay'),
  maskBlendFilename: document.getElementById('maskBlendFilename'),
  maskBlendRotation: document.getElementById('maskBlendRotation'),
  maskBlendRotationValue: document.getElementById('maskBlendRotationValue'),
  maskBlendAdd: document.getElementById('maskBlendAdd'),
  maskBlendSubtract: document.getElementById('maskBlendSubtract'),
  maskBlendOverride: document.getElementById('maskBlendOverride'),
  maskBlendCancel: document.getElementById('maskBlendCancel')
};

// ---------------------------------------------------------------------------
// Cookies helpers for persisting custom material path/name
// ---------------------------------------------------------------------------
function setCookie(name, value, days) {
  try {
    const expires = days
      ? '; expires=' + new Date(Date.now() + days * 864e5).toUTCString()
      : '';
    document.cookie = name + '=' + (value || '') + expires + '; path=/';
  } catch (e) {
    // If cookies are blocked, fail silently
  }
}

function getCookie(name) {
  const nameEq = name + '=';
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i].trim();
    if (c.indexOf(nameEq) === 0) return c.substring(nameEq.length, c.length);
  }
  return null;
}

function saveMaterialPathToCookie() {
  if (!el.materialPath) return;
  const pathValue = el.materialPath.value;
  if (typeof pathValue === 'string') {
    setCookie('dispgen_material_path', encodeURIComponent(pathValue), 365);
  }
}

function loadMaterialPathFromCookie() {
  if (!el.materialPath) return;
  const raw = getCookie('dispgen_material_path');
  if (raw) {
    try {
      el.materialPath.value = decodeURIComponent(raw);
    } catch {
      // Ignore decoding errors
    }
  }
}

// Initialize cookie-driven persistence on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  loadMaterialPathFromCookie();
  if (el.materialPath) {
    // Persist on user changes (commit/blur)
    el.materialPath.addEventListener('change', saveMaterialPathToCookie);
    el.materialPath.addEventListener('blur', saveMaterialPathToCookie);
  }
});

// --------------------------- State ---------------------------
const state = {
  originalImage: null,           // HTMLImageElement
  resizedWidth: 0,
  resizedHeight: 0,
  heightmap: null,               // Float32Array of grayscale [h*w]
  mask: null,                    // Float32Array [h*w], values 0..255
  previewMask: null,             // Float32Array [h*w], temporary preview mask
  isPainting: false,
  brushMode: 'paint',           // 'paint' or 'erase'
  three: null,                   // Three.js bundle { renderer, scene, camera, controls, mesh, gridLines: [], brushCircle: null }
  lastPreviewSignature: null,
  maskHistory: [],                // Array of Float32Array snapshots for undo
  maskHistoryIndex: -1,          // Current position in history (-1 = no history)
  maxHistorySize: 50,            // Maximum number of undo states
  pendingMaskImport: null,        // { data: Float32Array, previousSnapshot: Float32Array }
  // Skybox state
  skybox: {
    enabled: false,
    topOffset: 2048,
    maxMapSize: 32766,           // 32768 - 2 (1 unit buffer each side)
    maxSkyboxSize: 32768,
    maxBoundsVisible: false,
    skyboxBoundsVisible: false
  }
};

// ------------------------ Helpers ---------------------------
function unitsToMeters(units) {
  return Math.round((units / 39.37) * 100) / 100;
}

function updateDimensionsLabel() {
  const numTilesX = parseInt(el.tilesX.value, 10);
  const numTilesY = parseInt(el.tilesY.value, 10);
  const tileSize = parseInt(el.tileSize.value, 10);
  const maxHeight = parseInt(el.maxHeight.value, 10);

  const totalWidth = numTilesX * tileSize;
  const totalDepth = numTilesY * tileSize;
  const totalHeight = maxHeight;

  const metersWidth = unitsToMeters(totalWidth);
  const metersDepth = unitsToMeters(totalDepth);
  const metersHeight = unitsToMeters(totalHeight);

  el.dimensions.textContent = `Final Area:\n` +
    `x = ${totalWidth} units (${metersWidth}m)\n` +
    `y = ${totalDepth} units (${metersDepth}m)\n` +
    `z = ${totalHeight} units (${metersHeight}m)`;
}

// ----------------------- Mask Helpers ------------------------
function clamp01(v){ return Math.max(0, Math.min(1, v)); }

// Save current mask state to history
function saveMaskState() {
  if (!state.mask) return;
  pushMaskHistorySnapshot(new Float32Array(state.mask));
  updateUndoRedoButtons();
}

// Clamp dimensional inputs to the inner max (32766 units) to leave 1-unit skybox margins
function clampMapDimensionsIfNeeded() {
  let tileSize = parseInt(el.tileSize.value, 10);
  if (isNaN(tileSize) || tileSize <= 0) return false;
  const maxInner = state.skybox?.maxMapSize ?? 32766;
  let changed = false;
  if (tileSize > maxInner) {
    tileSize = maxInner;
    el.tileSize.value = maxInner;
    changed = true;
  }
  const tilesX = parseInt(el.tilesX.value, 10);
  const tilesY = parseInt(el.tilesY.value, 10);
  const maxTiles = Math.max(1, Math.floor(maxInner / tileSize));

  if (!isNaN(tilesX) && tilesX > maxTiles) {
    el.tilesX.value = maxTiles;
    changed = true;
  }
  if (!isNaN(tilesY) && tilesY > maxTiles) {
    el.tilesY.value = maxTiles;
    changed = true;
  }
  const maxHeight = parseInt(el.maxHeight.value, 10);
  if (!isNaN(maxHeight) && maxHeight > maxInner) {
    el.maxHeight.value = maxInner;
    changed = true;
  }
  return changed;
}

function pushMaskHistorySnapshot(snapshot) {
  if (!snapshot) return;
  if (state.maskHistoryIndex < state.maskHistory.length - 1) {
    state.maskHistory = state.maskHistory.slice(0, state.maskHistoryIndex + 1);
  }
  state.maskHistory.push(snapshot);
  state.maskHistoryIndex = state.maskHistory.length - 1;
  if (state.maskHistory.length > state.maxHistorySize) {
    state.maskHistory.shift();
    state.maskHistoryIndex--;
  }
}

// Restore mask from history
function restoreMaskState(index) {
  if (index < 0 || index >= state.maskHistory.length) return;
  const W = state.resizedWidth, H = state.resizedHeight;
  if (!state.mask || state.mask.length !== W * H) {
    state.mask = new Float32Array(W * H);
  }
  state.mask.set(state.maskHistory[index]);
  state.maskHistoryIndex = index;
  updateUndoRedoButtons();
  render3DPreview();
}

function undoMask() {
  if (state.maskHistoryIndex > 0) {
    restoreMaskState(state.maskHistoryIndex - 1);
  }
}

function redoMask() {
  if (state.maskHistoryIndex < state.maskHistory.length - 1) {
    restoreMaskState(state.maskHistoryIndex + 1);
  }
}

function updateUndoRedoButtons() {
  const undoBtn = document.getElementById('undoMask');
  const redoBtn = document.getElementById('redoMask');
  if (undoBtn) {
    undoBtn.disabled = state.maskHistoryIndex <= 0;
  }
  if (redoBtn) {
    redoBtn.disabled = state.maskHistoryIndex >= state.maskHistory.length - 1;
  }
}

let paintingStarted = false; // Track if we've started a painting stroke

function paintAtWorld(wx, wy){
  if (!state.mask) return;
  
  // Mark that we've started painting (state was saved in onPointerDown)
  if (!paintingStarted && state.isPainting) {
    paintingStarted = true;
  }
  
  const tilesX = parseInt(el.tilesX.value, 10);
  const tilesY = parseInt(el.tilesY.value, 10);
  const tileSize = parseInt(el.tileSize.value, 10);
  const W = state.resizedWidth, H = state.resizedHeight;
  const nx = clamp01((wx + (tilesX * tileSize) / 2) / (tilesX * tileSize));
  const ny = clamp01((wy + (tilesY * tileSize) / 2) / (tilesY * tileSize));
  const cx = nx * (W - 1);
  const cy = ny * (H - 1);
  const radius = (parseInt(el.brushSize.value, 10) || 16);
  const strength = (parseInt(el.brushStrength.value, 10) || 40) / 100;
  const erase = state.brushMode === 'erase';
  applyBrush(cx, cy, radius, strength, erase);
  if (el.autoUpdate.checked) render3DPreview();
}

function applyBrush(cx, cy, radius, strength, erase){
  const W = state.resizedWidth, H = state.resizedHeight;
  const r2 = radius * radius;
  const minY = Math.max(0, Math.floor(cy - radius));
  const maxY = Math.min(H - 1, Math.ceil(cy + radius));
  const minX = Math.max(0, Math.floor(cx - radius));
  const maxX = Math.min(W - 1, Math.ceil(cx + radius));
  for (let y = minY; y <= maxY; y++){
    for (let x = minX; x <= maxX; x++){
      const dx = x - cx, dy = y - cy; const d2 = dx*dx + dy*dy;
      if (d2 > r2) continue;
      // soft falloff
      const t = 1 - Math.sqrt(d2) / radius;
      const k = strength * (t * t * (3 - 2 * t)); // smoothstep
      const idx = y * W + x;
      if (erase) state.mask[idx] = Math.max(0, state.mask[idx] - k * 255);
      else state.mask[idx] = Math.min(255, state.mask[idx] + k * 255);
    }
  }
}

function generateSlopeMask(minSlope = 60, maxSlope = 255, falloff = -50, outputMask = null){
  if (!state.heightmap) return;
  const W = state.resizedWidth, H = state.resizedHeight;
  const src = state.heightmap;
  
  // Use provided output mask, or state.mask, or create new one
  let out = outputMask;
  if (!out) {
    if (!state.mask || state.mask.length !== W * H) {
      state.mask = new Float32Array(W * H);
    }
    out = state.mask;
  } else {
    // Ensure preview mask is correct size
    if (out.length !== W * H) {
      out = new Float32Array(W * H);
      if (outputMask === state.previewMask) {
        state.previewMask = out;
      }
    }
  }
  
  let maxMag = 1e-6;
  // Sobel kernels
  const gxk = [-1,0,1,-2,0,2,-1,0,1];
  const gyk = [-1,-2,-1,0,0,0,1,2,1];
  for (let y = 1; y < H-1; y++){
    for (let x = 1; x < W-1; x++){
      let gx = 0, gy = 0; let k = 0;
      for (let j = -1; j <= 1; j++){
        const yy = (y + j) * W;
        for (let i = -1; i <= 1; i++){
          const v = src[yy + x + i];
          gx += v * gxk[k];
          gy += v * gyk[k];
          k++;
        }
      }
      const mag = Math.sqrt(gx*gx + gy*gy);
      out[y * W + x] = mag; // temporary
      if (mag > maxMag) maxMag = mag;
    }
  }
  // Normalize 0..255 and apply range/falloff
  const absFalloff = Math.abs(falloff);
  const isInward = falloff < 0;
  
  for (let y = 0; y < H; y++){
    for (let x = 0; x < W; x++){
      const idx = y*W + x;
      const normalized = (out[idx] / maxMag) * 255;
      let value = 0;
      
      if (isInward) {
        // Inward falloff: smooth from edges toward center
        if (normalized >= minSlope && normalized <= maxSlope) {
          // Calculate distance from nearest edge
          const distFromMin = normalized - minSlope;
          const distFromMax = maxSlope - normalized;
          const minDist = Math.min(distFromMin, distFromMax);
          
          if (minDist < absFalloff) {
            // Fade from edge toward center
            const t = minDist / absFalloff; // 0 at edge, 1 at center
            value = t * 255; // Smooth fade from edge (0) to center (255)
          } else {
            // Full value in center region
            value = 255;
          }
        }
      } else {
        // Outward falloff: smooth from boundaries outward (original behavior)
        if (normalized >= minSlope && normalized <= maxSlope) {
          value = 255;
        }
        // Falloff below minSlope - smooth outward
        else if (normalized < minSlope && normalized >= minSlope - absFalloff) {
          const distance = minSlope - normalized;
          const t = distance / absFalloff; // 0 at boundary, 1 at falloff edge
          value = (1 - t) * 255; // Smooth fade from boundary outward
        }
        // Falloff above maxSlope - smooth outward
        else if (normalized > maxSlope && normalized <= maxSlope + absFalloff) {
          const distance = normalized - maxSlope;
          const t = distance / absFalloff; // 0 at boundary, 1 at falloff edge
          value = (1 - t) * 255; // Smooth fade from boundary outward
        }
      }
      
      out[idx] = Math.max(0, Math.min(255, value));
    }
  }
}

function createSeededRandom(seed) {
  if (!seed) {
    return Math.random;
  }
  let s = seed >>> 0;
  if (s === 0) {
    s = 1;
  }
  return function(){
    s += 0x6D2B79F5;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function sampleHeightAndGradient(hm, w, h, fx, fy) {
  const x0 = Math.max(0, Math.min(w - 1, Math.floor(fx)));
  const y0 = Math.max(0, Math.min(h - 1, Math.floor(fy)));
  const x1 = Math.min(x0 + 1, w - 1);
  const y1 = Math.min(y0 + 1, h - 1);
  const dx = Math.min(1, Math.max(0, fx - x0));
  const dy = Math.min(1, Math.max(0, fy - y0));
  const i00 = y0 * w + x0;
  const i10 = y0 * w + x1;
  const i01 = y1 * w + x0;
  const i11 = y1 * w + x1;
  const h00 = hm[i00];
  const h10 = hm[i10];
  const h01 = hm[i01];
  const h11 = hm[i11];
  const height =
    h00 * (1 - dx) * (1 - dy) +
    h10 * dx * (1 - dy) +
    h01 * (1 - dx) * dy +
    h11 * dx * dy;
  const gradientX = (h10 - h00) * (1 - dy) + (h11 - h01) * dy;
  const gradientY = (h01 - h00) * (1 - dx) + (h11 - h10) * dx;
  return { height, gradientX, gradientY };
}

function depositSedimentAt(hm, w, h, fx, fy, amount) {
  if (amount <= 0) return;
  const x0 = Math.max(0, Math.min(w - 1, Math.floor(fx)));
  const y0 = Math.max(0, Math.min(h - 1, Math.floor(fy)));
  const x1 = Math.min(x0 + 1, w - 1);
  const y1 = Math.min(y0 + 1, h - 1);
  const dx = Math.min(1, Math.max(0, fx - x0));
  const dy = Math.min(1, Math.max(0, fy - y0));
  const i00 = y0 * w + x0;
  const i10 = y0 * w + x1;
  const i01 = y1 * w + x0;
  const i11 = y1 * w + x1;
  const w00 = (1 - dx) * (1 - dy);
  const w10 = dx * (1 - dy);
  const w01 = (1 - dx) * dy;
  const w11 = dx * dy;
  hm[i00] += amount * w00;
  hm[i10] += amount * w10;
  hm[i01] += amount * w01;
  hm[i11] += amount * w11;
}

function erodeSedimentAt(hm, erosionOut, w, h, fx, fy, amount, radius) {
  if (amount <= 0) return 0;
  const radiusInt = Math.max(1, Math.ceil(radius));
  const cx = Math.floor(fx);
  const cy = Math.floor(fy);
  const indices = [];
  let totalWeight = 0;
  for (let yy = cy - radiusInt; yy <= cy + radiusInt; yy++) {
    if (yy < 0 || yy >= h) continue;
    for (let xx = cx - radiusInt; xx <= cx + radiusInt; xx++) {
      if (xx < 0 || xx >= w) continue;
      const dx = (xx + 0.5) - fx;
      const dy = (yy + 0.5) - fy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > radius) continue;
      const weight = 1 - dist / radius;
      if (weight <= 0) continue;
      indices.push({ idx: yy * w + xx, weight });
      totalWeight += weight;
    }
  }
  if (totalWeight <= 1e-6) return 0;
  let removedTotal = 0;
  const invTotal = 1 / totalWeight;
  for (let i = 0; i < indices.length; i++) {
    const { idx, weight } = indices[i];
    const portion = amount * weight * invTotal;
    const available = Math.min(portion, hm[idx]);
    if (available <= 0) continue;
    hm[idx] -= available;
    erosionOut[idx] += available;
    removedTotal += available;
  }
  return removedTotal;
}

function generateErosionMask(options = {}, outputMask = null) {
  if (!state.heightmap) return null;
  const W = state.resizedWidth;
  const H = state.resizedHeight;
  if (!W || !H) return null;

  const settings = {
    droplets: Math.max(1, Math.floor(options.droplets ?? 2500)),
    maxSteps: Math.max(1, Math.floor(options.maxSteps ?? 120)),
    radius: Math.max(0.5, options.radius ?? 1.5),
    inertia: Math.max(0, Math.min(0.99, options.inertia ?? 0.1)),
    capacity: Math.max(0.0001, options.capacity ?? 10),
    depositionRate: Math.max(0, Math.min(1, options.depositionRate ?? 0.02)),
    erosionRate: Math.max(0, Math.min(1, options.erosionRate ?? 0.9)),
    evaporationRate: Math.max(0, Math.min(0.99, options.evaporationRate ?? 0.02)),
    gravity: Math.max(0.0001, options.gravity ?? 20),
    minSlope: Math.max(0, options.minSlope ?? 0.05),
    seed: options.seed ?? 0
  };

  const heights = new Float32Array(state.heightmap);
  const erosionAccum = new Float32Array(W * H);
  const rand = createSeededRandom(settings.seed);

  const minWater = 0.01;
  const tau = Math.PI * 2;

  for (let iter = 0; iter < settings.droplets; iter++) {
    let x = rand() * (W - 1);
    let y = rand() * (H - 1);
    let dirX = 0;
    let dirY = 0;
    let speed = 1;
    let water = 1;
    let sediment = 0;

    let sample = sampleHeightAndGradient(heights, W, H, x, y);
    let currentHeight = sample.height;

    for (let step = 0; step < settings.maxSteps; step++) {
      dirX = dirX * settings.inertia - sample.gradientX * (1 - settings.inertia);
      dirY = dirY * settings.inertia - sample.gradientY * (1 - settings.inertia);

      const len = Math.hypot(dirX, dirY);
      if (len === 0) {
        const angle = rand() * tau;
        dirX = Math.cos(angle);
        dirY = Math.sin(angle);
      } else {
        dirX /= len;
        dirY /= len;
      }

      const nx = x + dirX;
      const ny = y + dirY;

      if (nx < 0 || nx >= W - 1 || ny < 0 || ny >= H - 1) {
        break;
      }

      const nextSample = sampleHeightAndGradient(heights, W, H, nx, ny);
      const nextHeight = nextSample.height;
      let deltaHeight = nextHeight - currentHeight;

      if (deltaHeight > 0) {
        const depositAmount = Math.min(deltaHeight, sediment);
        if (depositAmount > 0) {
          depositSedimentAt(heights, W, H, x, y, depositAmount);
          sediment -= depositAmount;
          deltaHeight -= depositAmount;
        }
        if (deltaHeight > 0.001) {
          break;
        }
      }

      const slope = Math.max(-deltaHeight, settings.minSlope);
      const capacity = slope * speed * water * settings.capacity;

      if (sediment > capacity) {
        const depositAmount = (sediment - capacity) * settings.depositionRate;
        if (depositAmount > 0) {
          depositSedimentAt(heights, W, H, x, y, depositAmount);
          sediment -= depositAmount;
        }
      } else {
        const desiredErode = (capacity - sediment) * settings.erosionRate;
        const erodeAmount = Math.min(desiredErode, -deltaHeight + 1e-3);
        if (erodeAmount > 0) {
          const removed = erodeSedimentAt(heights, erosionAccum, W, H, nx, ny, erodeAmount, settings.radius);
          sediment += removed;
        }
      }

      const dh = currentHeight - nextHeight;
      speed = Math.sqrt(Math.max(0.0001, speed * speed + dh * settings.gravity));
      water *= 1 - settings.evaporationRate;
      if (water <= minWater) {
        break;
      }

      x = nx;
      y = ny;
      sample = nextSample;
      currentHeight = nextHeight;
    }
  }

  let out = outputMask;
  if (!out) {
    if (!state.mask || state.mask.length !== W * H) {
      state.mask = new Float32Array(W * H);
    }
    out = state.mask;
  } else if (out.length !== W * H) {
    out = new Float32Array(W * H);
    if (outputMask === state.previewMask) {
      state.previewMask = out;
    }
  }

  let maxErosion = 0;
  for (let i = 0; i < erosionAccum.length; i++) {
    if (erosionAccum[i] > maxErosion) {
      maxErosion = erosionAccum[i];
    }
  }

  if (maxErosion <= 1e-6) {
    out.fill(0);
    return out;
  }

  const norm = 1 / maxErosion;
  for (let i = 0; i < erosionAccum.length; i++) {
    const value = Math.sqrt(erosionAccum[i] * norm);
    out[i] = Math.max(0, Math.min(255, value * 255));
  }
  return out;
}

// Noise library - Perlin and Simplex noise implementation
(function(global){
  var module = global.noise = {};

  function Grad(x, y, z) {
    this.x = x; this.y = y; this.z = z;
  }
  
  Grad.prototype.dot2 = function(x, y) {
    return this.x*x + this.y*y;
  };

  Grad.prototype.dot3 = function(x, y, z) {
    return this.x*x + this.y*y + this.z*z;
  };

  var grad3 = [new Grad(1,1,0),new Grad(-1,1,0),new Grad(1,-1,0),new Grad(-1,-1,0),
               new Grad(1,0,1),new Grad(-1,0,1),new Grad(1,0,-1),new Grad(-1,0,-1),
               new Grad(0,1,1),new Grad(0,-1,1),new Grad(0,1,-1),new Grad(0,-1,-1)];

  var p = [151,160,137,91,90,15,
  131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,
  190, 6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,
  88,237,149,56,87,174,20,125,136,171,168, 68,175,74,165,71,134,139,48,27,166,
  77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,
  102,143,54, 65,25,63,161, 1,216,80,73,209,76,132,187,208, 89,18,169,200,196,
  135,130,116,188,159,86,164,100,109,198,173,186, 3,64,52,217,226,250,124,123,
  5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,
  223,183,170,213,119,248,152, 2,44,154,163, 70,221,153,101,155,167, 43,172,9,
  129,22,39,253, 19,98,108,110,79,113,224,232,178,185, 112,104,218,246,97,228,
  251,34,242,193,238,210,144,12,191,179,162,241, 81,51,145,235,249,14,239,107,
  49,192,214, 31,181,199,106,157,184, 84,204,176,115,121,50,45,127, 4,150,254,
  138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];
  // To remove the need for index wrapping, double the permutation table length
  var perm = new Array(512);
  var gradP = new Array(512);

  // This isn't a very good seeding function, but it works ok. It supports 2^16
  // different seed values. Write something better if you need more seeds.
  module.seed = function(seed) {
    if(seed > 0 && seed < 1) {
      // Scale the seed out
      seed *= 65536;
    }

    seed = Math.floor(seed);
    if(seed < 256) {
      seed |= seed << 8;
    }

    for(var i = 0; i < 256; i++) {
      var v;
      if (i & 1) {
        v = p[i] ^ (seed & 255);
      } else {
        v = p[i] ^ ((seed>>8) & 255);
      }

      perm[i] = perm[i + 256] = v;
      gradP[i] = gradP[i + 256] = grad3[v % 12];
    }
  };

  module.seed(0);

  // Skewing and unskewing factors for 2, 3, and 4 dimensions
  var F2 = 0.5*(Math.sqrt(3)-1);
  var G2 = (3-Math.sqrt(3))/6;

  var F3 = 1/3;
  var G3 = 1/6;

  // 2D simplex noise
  module.simplex2 = function(xin, yin) {
    var n0, n1, n2; // Noise contributions from the three corners
    // Skew the input space to determine which simplex cell we're in
    var s = (xin+yin)*F2; // Hairy factor for 2D
    var i = Math.floor(xin+s);
    var j = Math.floor(yin+s);
    var t = (i+j)*G2;
    var x0 = xin-i+t; // The x,y distances from the cell origin, unskewed.
    var y0 = yin-j+t;
    // For the 2D case, the simplex shape is an equilateral triangle.
    // Determine which simplex we are in.
    var i1, j1; // Offsets for second (middle) corner of simplex in (i,j) coords
    if(x0>y0) { // lower triangle, XY order: (0,0)->(1,0)->(1,1)
      i1=1; j1=0;
    } else {    // upper triangle, YX order: (0,0)->(0,1)->(1,1)
      i1=0; j1=1;
    }
    // A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and
    // a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where
    // c = (3-sqrt(3))/6
    var x1 = x0 - i1 + G2; // Offsets for middle corner in (x,y) unskewed coords
    var y1 = y0 - j1 + G2;
    var x2 = x0 - 1 + 2 * G2; // Offsets for last corner in (x,y) unskewed coords
    var y2 = y0 - 1 + 2 * G2;
    // Work out the hashed gradient indices of the three simplex corners
    i &= 255;
    j &= 255;
    var gi0 = gradP[i+perm[j]];
    var gi1 = gradP[i+i1+perm[j+j1]];
    var gi2 = gradP[i+1+perm[j+1]];
    // Calculate the contribution from the three corners
    var t0 = 0.5 - x0*x0-y0*y0;
    if(t0<0) {
      n0 = 0;
    } else {
      t0 *= t0;
      n0 = t0 * t0 * gi0.dot2(x0, y0);  // (x,y) of grad3 used for 2D gradient
    }
    var t1 = 0.5 - x1*x1-y1*y1;
    if(t1<0) {
      n1 = 0;
    } else {
      t1 *= t1;
      n1 = t1 * t1 * gi1.dot2(x1, y1);
    }
    var t2 = 0.5 - x2*x2-y2*y2;
    if(t2<0) {
      n2 = 0;
    } else {
      t2 *= t2;
      n2 = t2 * t2 * gi2.dot2(x2, y2);
    }
    // Add contributions from each corner to get the final noise value.
    // The result is scaled to return values in the interval [-1,1].
    return 70 * (n0 + n1 + n2);
  };

  // 3D simplex noise
  module.simplex3 = function(xin, yin, zin) {
    var n0, n1, n2, n3; // Noise contributions from the four corners

    // Skew the input space to determine which simplex cell we're in
    var s = (xin+yin+zin)*F3; // Hairy factor for 2D
    var i = Math.floor(xin+s);
    var j = Math.floor(yin+s);
    var k = Math.floor(zin+s);

    var t = (i+j+k)*G3;
    var x0 = xin-i+t; // The x,y distances from the cell origin, unskewed.
    var y0 = yin-j+t;
    var z0 = zin-k+t;

    // For the 3D case, the simplex shape is a slightly irregular tetrahedron.
    // Determine which simplex we are in.
    var i1, j1, k1; // Offsets for second corner of simplex in (i,j,k) coords
    var i2, j2, k2; // Offsets for third corner of simplex in (i,j,k) coords
    if(x0 >= y0) {
      if(y0 >= z0)      { i1=1; j1=0; k1=0; i2=1; j2=1; k2=0; }
      else if(x0 >= z0) { i1=1; j1=0; k1=0; i2=1; j2=0; k2=1; }
      else              { i1=0; j1=0; k1=1; i2=1; j2=0; k2=1; }
    } else {
      if(y0 < z0)      { i1=0; j1=0; k1=1; i2=0; j2=1; k2=1; }
      else if(x0 < z0) { i1=0; j1=1; k1=0; i2=0; j2=1; k2=1; }
      else             { i1=0; j1=1; k1=0; i2=1; j2=1; k2=0; }
    }
    // A step of (1,0,0) in (i,j,k) means a step of (1-c,-c,-c) in (x,y,z),
    // a step of (0,1,0) in (i,j,k) means a step of (-c,1-c,-c) in (x,y,z), and
    // a step of (0,0,1) in (i,j,k) means a step of (-c,-c,1-c) in (x,y,z), where
    // c = 1/6.
    var x1 = x0 - i1 + G3; // Offsets for second corner
    var y1 = y0 - j1 + G3;
    var z1 = z0 - k1 + G3;

    var x2 = x0 - i2 + 2 * G3; // Offsets for third corner
    var y2 = y0 - j2 + 2 * G3;
    var z2 = z0 - k2 + 2 * G3;

    var x3 = x0 - 1 + 3 * G3; // Offsets for fourth corner
    var y3 = y0 - 1 + 3 * G3;
    var z3 = z0 - 1 + 3 * G3;

    // Work out the hashed gradient indices of the four simplex corners
    i &= 255;
    j &= 255;
    k &= 255;
    var gi0 = gradP[i+   perm[j+   perm[k   ]]];
    var gi1 = gradP[i+i1+perm[j+j1+perm[k+k1]]];
    var gi2 = gradP[i+i2+perm[j+j2+perm[k+k2]]];
    var gi3 = gradP[i+ 1+perm[j+ 1+perm[k+ 1]]];

    // Calculate the contribution from the four corners
    var t0 = 0.6 - x0*x0 - y0*y0 - z0*z0;
    if(t0<0) {
      n0 = 0;
    } else {
      t0 *= t0;
      n0 = t0 * t0 * gi0.dot3(x0, y0, z0);  // (x,y) of grad3 used for 2D gradient
    }
    var t1 = 0.6 - x1*x1 - y1*y1 - z1*z1;
    if(t1<0) {
      n1 = 0;
    } else {
      t1 *= t1;
      n1 = t1 * t1 * gi1.dot3(x1, y1, z1);
    }
    var t2 = 0.6 - x2*x2 - y2*y2 - z2*z2;
    if(t2<0) {
      n2 = 0;
    } else {
      t2 *= t2;
      n2 = t2 * t2 * gi2.dot3(x2, y2, z2);
    }
    var t3 = 0.6 - x3*x3 - y3*y3 - z3*z3;
    if(t3<0) {
      n3 = 0;
    } else {
      t3 *= t3;
      n3 = t3 * t3 * gi3.dot3(x3, y3, z3);
    }
    // Add contributions from each corner to get the final noise value.
    // The result is scaled to return values in the interval [-1,1].
    return 32 * (n0 + n1 + n2 + n3);

  };

  // ##### Perlin noise stuff

  function fade(t) {
    return t*t*t*(t*(t*6-15)+10);
  }

  function lerp(a, b, t) {
    return (1-t)*a + t*b;
  }

  // 2D Perlin Noise
  module.perlin2 = function(x, y) {
    // Find unit grid cell containing point
    var X = Math.floor(x), Y = Math.floor(y);
    // Get relative xy coordinates of point within that cell
    x = x - X; y = y - Y;
    // Wrap the integer cells at 255 (smaller integer period can be introduced here)
    X = X & 255; Y = Y & 255;

    // Calculate noise contributions from each of the four corners
    var n00 = gradP[X+perm[Y]].dot2(x, y);
    var n01 = gradP[X+perm[Y+1]].dot2(x, y-1);
    var n10 = gradP[X+1+perm[Y]].dot2(x-1, y);
    var n11 = gradP[X+1+perm[Y+1]].dot2(x-1, y-1);

    // Compute the fade curve value for x
    var u = fade(x);

    // Interpolate the four results
    return lerp(
        lerp(n00, n10, u),
        lerp(n01, n11, u),
       fade(y));
  };

  // 3D Perlin Noise
  module.perlin3 = function(x, y, z) {
    // Find unit grid cell containing point
    var X = Math.floor(x), Y = Math.floor(y), Z = Math.floor(z);
    // Get relative xyz coordinates of point within that cell
    x = x - X; y = y - Y; z = z - Z;
    // Wrap the integer cells at 255 (smaller integer period can be introduced here)
    X = X & 255; Y = Y & 255; Z = Z & 255;

    // Calculate noise contributions from each of the eight corners
    var n000 = gradP[X+  perm[Y+  perm[Z  ]]].dot3(x,   y,     z);
    var n001 = gradP[X+  perm[Y+  perm[Z+1]]].dot3(x,   y,   z-1);
    var n010 = gradP[X+  perm[Y+1+perm[Z  ]]].dot3(x,   y-1,   z);
    var n011 = gradP[X+  perm[Y+1+perm[Z+1]]].dot3(x,   y-1, z-1);
    var n100 = gradP[X+1+perm[Y+  perm[Z  ]]].dot3(x-1,   y,   z);
    var n101 = gradP[X+1+perm[Y+  perm[Z+1]]].dot3(x-1,   y, z-1);
    var n110 = gradP[X+1+perm[Y+1+perm[Z  ]]].dot3(x-1, y-1,   z);
    var n111 = gradP[X+1+perm[Y+1+perm[Z+1]]].dot3(x-1, y-1, z-1);

    // Compute the fade curve value for x, y, z
    var u = fade(x);
    var v = fade(y);
    var w = fade(z);

    // Interpolate
    return lerp(
        lerp(
          lerp(n000, n100, u),
          lerp(n001, n101, u), w),
        lerp(
          lerp(n010, n110, u),
          lerp(n011, n111, u), w),
       v);
  };

})(window);

function generateNoiseMask(type = 'perlin', seed = 0, scale = 32, offsetX = 0, offsetY = 0, typeParams = {}, outputMask = null){
  const W = state.resizedWidth, H = state.resizedHeight;
  
  // Seed the noise library
  noise.seed(seed);
  
  // Use provided output mask, or state.mask, or create new one
  let out = outputMask;
  if (!out) {
    if (!state.mask || state.mask.length !== W * H) {
      state.mask = new Float32Array(W * H);
    }
    out = state.mask;
  } else {
    // Ensure preview mask is correct size
    if (out.length !== W * H) {
      out = new Float32Array(W * H);
      if (outputMask === state.previewMask) {
        state.previewMask = out;
      }
    }
  }
  
  // Hash function for grid coordinates (for value and cellular noise)
  function hash(x, y) {
    return ((x * 73856093) ^ (y * 19349663) ^ (seed * 83492791)) >>> 0;
  }
  
  // Get random value for a grid point
  function gridRandom(x, y) {
    const h = hash(x, y);
    return (h % 1000000) / 1000000; // Normalize to 0-1
  }
  
  // Value noise - simple interpolation of random values
  function valueNoise(x, y) {
    const fx = Math.floor(x);
    const fy = Math.floor(y);
    const dx = x - fx;
    const dy = y - fy;
    
    // Get random values for grid corners
    const n00 = gridRandom(fx, fy) * 2 - 1;
    const n10 = gridRandom(fx + 1, fy) * 2 - 1;
    const n01 = gridRandom(fx, fy + 1) * 2 - 1;
    const n11 = gridRandom(fx + 1, fy + 1) * 2 - 1;
    
    // Smooth interpolation
    const sx = dx * dx * (3 - 2 * dx);
    const sy = dy * dy * (3 - 2 * dy);
    
    const a = n00 + sx * (n10 - n00);
    const b = n01 + sx * (n11 - n01);
    return a + sy * (b - a);
  }
  
  // Voronoi noise - based on Ronja's tutorial
  // Returns: { distance: distance to closest cell, cellId: random identifier, borderDistance: distance to border }
  function voronoiNoise(x, y, params = {}) {
    const returnType = params.return_type || params.returnType || 'distance';
    const baseCellX = Math.floor(x);
    const baseCellY = Math.floor(y);
    
    // First pass: find the closest cell
    let minDistToCell = 10;
    let toClosestCellX = 0;
    let toClosestCellY = 0;
    let closestCellX = 0;
    let closestCellY = 0;
    
    for (let j = -1; j <= 1; j++) {
      for (let i = -1; i <= 1; i++) {
        const cellX = baseCellX + i;
        const cellY = baseCellY + j;
        
        // Get random position within this cell
        const h = hash(cellX, cellY);
        const cellPosX = cellX + ((h % 1000) / 1000);
        const cellPosY = cellY + (((h >> 10) % 1000) / 1000);
        
        const toCellX = cellPosX - x;
        const toCellY = cellPosY - y;
        const distToCell = Math.sqrt(toCellX * toCellX + toCellY * toCellY);
        
        if (distToCell < minDistToCell) {
          minDistToCell = distToCell;
          closestCellX = cellX;
          closestCellY = cellY;
          toClosestCellX = toCellX;
          toClosestCellY = toCellY;
        }
      }
    }
    
    // Second pass: find distance to closest edge/border
    let minEdgeDistance = 10;
    
    for (let j2 = -1; j2 <= 1; j2++) {
      for (let i2 = -1; i2 <= 1; i2++) {
        const cellX = baseCellX + i2;
        const cellY = baseCellY + j2;
        
        // Get random position within this cell
        const h = hash(cellX, cellY);
        const cellPosX = cellX + ((h % 1000) / 1000);
        const cellPosY = cellY + (((h >> 10) % 1000) / 1000);
        
        const toCellX = cellPosX - x;
        const toCellY = cellPosY - y;
        
        // Check if this is the closest cell
        const diffToClosestX = Math.abs(closestCellX - cellX);
        const diffToClosestY = Math.abs(closestCellY - cellY);
        const isClosestCell = (diffToClosestX + diffToClosestY) < 0.1;
        
        if (!isClosestCell) {
          // Calculate distance to border between this cell and closest cell
          const toCenterX = (toClosestCellX + toCellX) * 0.5;
          const toCenterY = (toClosestCellY + toCellY) * 0.5;
          
          const cellDiffX = toCellX - toClosestCellX;
          const cellDiffY = toCellY - toClosestCellY;
          const cellDiffLen = Math.sqrt(cellDiffX * cellDiffX + cellDiffY * cellDiffY);
          
          if (cellDiffLen > 0.0001) {
            const cellDiffNormX = cellDiffX / cellDiffLen;
            const cellDiffNormY = cellDiffY / cellDiffLen;
            
            const edgeDistance = toCenterX * cellDiffNormX + toCenterY * cellDiffNormY;
            minEdgeDistance = Math.min(minEdgeDistance, edgeDistance);
          }
        }
      }
    }
    
    // Get random identifier for the closest cell
    const cellId = gridRandom(closestCellX, closestCellY);
    
    // Return based on return type
    switch(returnType) {
      case 'cellId':
        return cellId * 2 - 1; // Convert 0-1 to -1 to 1
      case 'border':
        return Math.min(1, minEdgeDistance * 0.5) * 2 - 1; // Convert 0-1 to -1 to 1
      case 'distance':
      default:
        return Math.min(1, minDistToCell * 0.5) * 2 - 1; // Convert 0-1 to -1 to 1
    }
  }
  
  // Cellular/Worley noise - distance to nearest feature point
  function cellularNoise(x, y, params = {}) {
    const fx = Math.floor(x);
    const fy = Math.floor(y);
    
    const distanceFunction = params.distance_function || params.distanceFunction || 'euclidean';
    const returnType = params.return_type || params.returnType || 'distance';
    
    let minDist = Infinity;
    
    // Check 3x3 grid of cells around the point
    for (let j = -1; j <= 1; j++) {
      for (let i = -1; i <= 1; i++) {
        const cellX = fx + i;
        const cellY = fy + j;
        
        // Get random point within this cell
        const h = hash(cellX, cellY);
        const px = cellX + ((h % 1000) / 1000);
        const py = cellY + (((h >> 10) % 1000) / 1000);
        
        // Distance to this feature point
        const dx = x - px;
        const dy = y - py;
        let dist;
        
        switch(distanceFunction) {
          case 'manhattan':
            dist = Math.abs(dx) + Math.abs(dy);
            break;
          case 'chebyshev':
            dist = Math.max(Math.abs(dx), Math.abs(dy));
            break;
          case 'euclidean':
          default:
            dist = Math.sqrt(dx * dx + dy * dy);
            break;
        }
        
        if (dist < minDist) {
          minDist = dist;
        }
      }
    }
    
    // Apply return type
    switch(returnType) {
      case 'distance2':
        minDist = minDist * minDist;
        break;
      case 'distanceInv':
        minDist = minDist > 0 ? 1 / (1 + minDist) : 1;
        break;
      case 'distance':
      default:
        break;
    }
    
    // Return distance (scaled to reasonable range)
    return Math.min(1, minDist * 0.5);
  }
  
  // Generate noise based on type
  const octaves = typeParams.octaves || 1;
  const persistence = octaves > 1 ? ((typeParams.persistence || 50) / 100) : 1; // Only use if octaves > 1
  const lacunarity = octaves > 1 ? ((typeParams.lacunarity || 200) / 100) : 1; // Only use if octaves > 1
  
  for (let y = 0; y < H; y++){
    for (let x = 0; x < W; x++){
      const nx = (x / scale) + offsetX;
      const ny = (y / scale) + offsetY;
      let value = 0;
      let amplitude = 1;
      let frequency = 1;
      let maxValue = 0;
      
      // Fractal noise (octaves)
      for (let o = 0; o < octaves; o++) {
        let noiseValue;
        const sampleX = nx * frequency;
        const sampleY = ny * frequency;
        
        switch(type) {
          case 'simplex':
            noiseValue = noise.simplex2(sampleX, sampleY);
            break;
          case 'value':
            noiseValue = valueNoise(sampleX, sampleY);
            break;
          case 'cellular':
            noiseValue = cellularNoise(sampleX, sampleY, typeParams);
            // Cellular returns 0-1, convert to -1 to 1 for consistency
            noiseValue = noiseValue * 2 - 1;
            break;
          case 'voronoi':
            noiseValue = voronoiNoise(sampleX, sampleY, typeParams);
            break;
          case 'perlin':
          default:
            noiseValue = noise.perlin2(sampleX, sampleY);
            break;
        }
        
        value += noiseValue * amplitude;
        maxValue += amplitude;
        amplitude *= persistence;
        frequency *= lacunarity;
      }
      
      // Normalize by maxValue to keep range consistent
      value = value / maxValue;
      
      // Normalize to 0..255 (all noise types now return -1 to 1)
      value = ((value + 1) / 2) * 255;
      
      // Apply balance remapping (shifts midpoint)
      const balance = typeParams.balance || 0;
      value = value + (balance / 100) * 255;
      
      // Apply contrast remapping (scales around midpoint 127.5)
      const contrast = (typeParams.contrast || 100) / 100; // Convert 0-200 to 0-2
      value = (value - 127.5) * contrast + 127.5;
      
      out[y*W + x] = Math.max(0, Math.min(255, value));
    }
  }
}

async function loadMaskFromFile(file){
  const url = URL.createObjectURL(file);
  const W = state.resizedWidth;
  const H = state.resizedHeight;
  let importedMask = null;
  try {
    const img = new Image();
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url; });
    const cvs = document.createElement('canvas'); cvs.width = W; cvs.height = H;
    const ctx = cvs.getContext('2d');
    ctx.drawImage(img, 0, 0, W, H);
    const data = ctx.getImageData(0, 0, W, H).data;
    importedMask = new Float32Array(W * H);
    for (let i = 0, p = 0; i < importedMask.length; i++, p += 4){
      importedMask[i] = data[p];
    }
  } finally {
    URL.revokeObjectURL(url);
  }
  return importedMask;
}

function openMaskBlendModal() {
  if (!el.maskBlendModal) return;
  el.maskBlendModal.classList.remove('hidden');
  el.maskBlendModal.classList.add('flex');
  if (el.maskBlendRotation && el.maskBlendRotationValue) {
    const value = parseInt(el.maskBlendRotation.value || '0', 10);
    const degrees = value * 90;
    el.maskBlendRotationValue.textContent = `${degrees}°`;
  }
}

function closeMaskBlendModal() {
  if (!el.maskBlendModal) return;
  el.maskBlendModal.classList.add('hidden');
  el.maskBlendModal.classList.remove('flex');
}

function cancelPendingMaskImport() {
  state.pendingMaskImport = null;
  closeMaskBlendModal();
  if (el.maskInput) el.maskInput.value = '';
  if (el.maskBlendFilename) {
    el.maskBlendFilename.textContent = 'this mask';
  }
  if (el.maskBlendRotation) {
    el.maskBlendRotation.value = '0';
  }
  if (el.maskBlendRotationValue) {
    el.maskBlendRotationValue.textContent = '0°';
  }
}

function rotateMaskData(maskData, W, H, rotationSteps) {
  if (!maskData || rotationSteps === 0) return maskData;
  
  const rotated = new Float32Array(maskData.length);
  const steps = rotationSteps % 4;
  
  if (steps === 0) {
    rotated.set(maskData);
  } else if (steps === 1) { // 90° clockwise
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const srcIdx = y * W + x;
        // 90° clockwise: (x, y) -> (H-1-y, x)
        const newY = H - 1 - y;
        const newX = x;
        const dstIdx = newY * W + newX;
        rotated[dstIdx] = maskData[srcIdx];
      }
    }
  } else if (steps === 2) { // 180°
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const srcIdx = y * W + x;
        // 180°: (x, y) -> (W-1-x, H-1-y)
        const newY = H - 1 - y;
        const newX = W - 1 - x;
        const dstIdx = newY * W + newX;
        rotated[dstIdx] = maskData[srcIdx];
      }
    }
  } else if (steps === 3) { // 270° clockwise (90° counter-clockwise)
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const srcIdx = y * W + x;
        // 270° clockwise: (x, y) -> (y, W-1-x)
        const newY = y;
        const newX = W - 1 - x;
        const dstIdx = newY * W + newX;
        rotated[dstIdx] = maskData[srcIdx];
      }
    }
  }
  
  return rotated;
}

function applyPendingMaskImport(blendMode) {
  if (!blendMode) return;
  const pending = state.pendingMaskImport;
  if (!pending || !pending.data) return;

  const rotationSteps = parseInt(el.maskBlendRotation?.value || '0', 10);
  const W = state.resizedWidth;
  const H = state.resizedHeight;
  
  let maskData = pending.data;
  if (rotationSteps !== 0) {
    maskData = rotateMaskData(maskData, W, H, rotationSteps);
  }

  if (!state.mask || state.mask.length !== maskData.length) {
    state.mask = new Float32Array(maskData.length);
  }

  const len = maskData.length;
  if (blendMode === 'override') {
    state.mask.set(maskData);
  } else if (blendMode === 'add') {
    for (let i = 0; i < len; i++) {
      state.mask[i] = Math.min(255, state.mask[i] + maskData[i]);
    }
  } else if (blendMode === 'subtract') {
    for (let i = 0; i < len; i++) {
      state.mask[i] = Math.max(0, state.mask[i] - maskData[i]);
    }
  }

  if (pending.previousSnapshot && state.maskHistory.length === 0) {
    pushMaskHistorySnapshot(pending.previousSnapshot);
  }

  saveMaskState();
  render3DPreview();
  cancelPendingMaskImport();
}

function ensureThree() {
  if (state.three) return state.three;
  const renderer = new THREE.WebGLRenderer({
    canvas: el.canvas,
    antialias: true,
    alpha: true,
    logarithmicDepthBuffer: true
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap pixel ratio to reduce jittering
  const initW = el.viewer?.clientWidth || el.canvas.parentElement.clientWidth || 1000;
  const initH = el.viewer?.clientHeight || el.canvas.parentElement.clientHeight || 700;
  renderer.setSize(initW, initH, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  const background = new THREE.Color(0x020617);
  renderer.setClearColor(background, 0.8);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(background.getHex(), 2000, 128000);

  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100000); // Reduced far plane for better precision
  camera.position.set(0, -1000, 800);
  camera.up.set(0, 0, 1);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.1; // Increased damping for smoother movement
  controls.mouseButtons.LEFT = null;
  controls.mouseButtons.MIDDLE = THREE.MOUSE.PAN;
  controls.mouseButtons.RIGHT = THREE.MOUSE.ROTATE;

  const ambient = new THREE.AmbientLight(0x94a3b8, 0.9);
  scene.add(ambient);

  const keyLight = new THREE.DirectionalLight(0x60a5fa, 1.25);
  keyLight.position.set(-1200, -1800, 2400);
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0xf97316, 0.55);
  rimLight.position.set(1800, 900, 1600);
  scene.add(rimLight);

  const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x111827, 0.6);
  scene.add(hemiLight);

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  // Brush radius indicator circle - projected onto terrain
  const brushCirclePoints = 32; // Reduced from 64 for better performance
  const brushCirclePositions = new Float32Array(brushCirclePoints * 3);
  const brushCircleGeometry = new THREE.BufferGeometry();
  brushCircleGeometry.setAttribute('position', new THREE.BufferAttribute(brushCirclePositions, 3));
  const brushCircleMaterial = new THREE.LineBasicMaterial({ 
    color: 0x60a5fa, 
    transparent: true, 
    opacity: 0.8,
    linewidth: 2,
    depthTest: false, // Render through terrain
    depthWrite: false
  });
  const brushCircle = new THREE.LineLoop(brushCircleGeometry, brushCircleMaterial);
  brushCircle.visible = false;
  brushCircle.renderOrder = 2; // Render after terrain mesh and grid lines
  scene.add(brushCircle);
  
  // Cache for brush indicator updates
  let brushIndicatorUpdatePending = false;

  state.three = {
    renderer,
    scene,
    camera,
    controls,
    mesh: null,
    gridLines: [],
    renderLoopActive: false,
    raycaster,
    mouse,
    brushCircle,
    maxBoundsLines: null,
    skyboxLines: null
  };

  // Optional: create a max-bounds visualization (wireframe cube) around the displacement area
  if (!state.three.maxBoundsLines) {
    const boundSize = state.skybox?.maxMapSize ?? 32766;
    const maxBoundsGeometry = new THREE.EdgesGeometry(new THREE.BoxGeometry(boundSize, boundSize, boundSize));
    const maxBoundsMaterial = new THREE.LineBasicMaterial({
      color: 0x4043A3,
      transparent: true,
      opacity: 0.9,
      depthTest: false,
      depthWrite: false,
      fog: false
    });
    const maxBoundsLines = new THREE.LineSegments(maxBoundsGeometry, maxBoundsMaterial);
    maxBoundsLines.visible = !!el.showMaxBounds?.checked;
    maxBoundsLines.renderOrder = 3;
    scene.add(maxBoundsLines);
    state.three.maxBoundsLines = maxBoundsLines;
    state.skybox.maxBoundsVisible = maxBoundsLines.visible;
  }

  if (!state.three.skyboxLines) {
    const initialGeometry = new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1));
    const skyboxMaterial = new THREE.LineBasicMaterial({
      color: 0x4043A3,
      transparent: true,
      opacity: 0.9,
      depthTest: false,
      depthWrite: false,
      fog: false
    });
    const skyboxLines = new THREE.LineSegments(initialGeometry, skyboxMaterial);
    skyboxLines.visible = false;
    skyboxLines.renderOrder = 4;
    scene.add(skyboxLines);
    state.three.skyboxLines = skyboxLines;
  }

  // Resize handling
  function onResize() {
    const w = el.viewer?.clientWidth || el.canvas.parentElement.clientWidth || window.innerWidth - 360;
    const h = el.viewer?.clientHeight || el.canvas.parentElement.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', onResize);
  // initial size
  setTimeout(onResize, 0);

  // Painting interactions
  function updateBrushIndicator(e) {
    if (!isMaskModeEnabled() || !state.three?.mesh || !state.heightmap) {
      brushCircle.visible = false;
      return;
    }
    
    // Throttle updates using requestAnimationFrame
    if (brushIndicatorUpdatePending) return;
    brushIndicatorUpdatePending = true;
    requestAnimationFrame(() => {
      brushIndicatorUpdatePending = false;
      
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const hit = raycaster.intersectObject(state.three.mesh, true)[0];
      if (hit) {
        const radius = (parseInt(el.brushSize.value, 10) || 16);
        const tilesX = parseInt(el.tilesX.value, 10);
        const tilesY = parseInt(el.tilesY.value, 10);
        const tileSize = parseInt(el.tileSize.value, 10);
        const maxHeight = parseInt(el.maxHeight.value, 10);
        const W = state.resizedWidth, H = state.resizedHeight;
        const worldRadius = (radius / (W - 1)) * (tilesX * tileSize);
        
        // Generate circle points and project them onto terrain using heightmap data
        const positions = brushCircleGeometry.attributes.position.array;
        const centerX = hit.point.x;
        const centerY = hit.point.y;
        
        // Convert center to normalized coordinates
        const centerNX = clamp01((centerX + (tilesX * tileSize) / 2) / (tilesX * tileSize));
        const centerNY = clamp01((centerY + (tilesY * tileSize) / 2) / (tilesY * tileSize));
        const centerFX = centerNX * (W - 1);
        const centerFY = centerNY * (H - 1);
        
        // Sample heightmap directly instead of raycasting
        for (let i = 0; i < brushCirclePoints; i++) {
          const angle = (i / brushCirclePoints) * Math.PI * 2;
          const offsetX = Math.cos(angle) * worldRadius;
          const offsetY = Math.sin(angle) * worldRadius;
          
          const x = centerX + offsetX;
          const y = centerY + offsetY;
          
          // Convert to normalized coordinates and sample heightmap
          const nx = clamp01((x + (tilesX * tileSize) / 2) / (tilesX * tileSize));
          const ny = clamp01((y + (tilesY * tileSize) / 2) / (tilesY * tileSize));
          const fx = nx * (W - 1);
          const fy = ny * (H - 1);
          
          // Sample height using bilinear interpolation
          const heightValue = bilinearSample(state.heightmap, W, H, fx, fy);
          const z = (heightValue / 255.0) * maxHeight;
          
          positions[i * 3] = x;
          positions[i * 3 + 1] = y;
          positions[i * 3 + 2] = z;
        }
        
        brushCircleGeometry.attributes.position.needsUpdate = true;
        brushCircleMaterial.color.setHex(state.brushMode === 'erase' ? 0xf87171 : 0x60a5fa);
        brushCircle.visible = true;
      } else {
        brushCircle.visible = false;
      }
    });
  }
  function onPointerMove(e){
    updateBrushIndicator(e);
    if (!isMaskModeEnabled() || !state.isPainting || !state.three?.mesh || !(e.buttons & 1)) return;
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const hit = raycaster.intersectObject(state.three.mesh, true)[0];
    if (!hit) return;
    paintAtWorld(hit.point.x, hit.point.y, e.shiftKey);
  }
  function onPointerDown(e){
    if (!isMaskModeEnabled() || e.button !== 0) return;
    state.isPainting = true;
    paintingStarted = false; // Reset for new stroke
    onPointerMove(e);
  }
  function onPointerUp(){ 
    if (state.isPainting && paintingStarted) {
      // Save state when stroke ends so the complete stroke can be undone in one step
      saveMaskState();
    }
    state.isPainting = false;
    paintingStarted = false; // Stroke ended
  }
  function onPointerCancel(){ 
    if (state.isPainting && paintingStarted) {
      // Save state when stroke is cancelled
      saveMaskState();
    }
    state.isPainting = false;
    paintingStarted = false; // Stroke cancelled
  }
  renderer.domElement.addEventListener('pointermove', onPointerMove);
  renderer.domElement.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('pointercancel', onPointerCancel);

  startRenderLoop();

  return state.three;
}

function startRenderLoop() {
  if (!state.three || state.three.renderLoopActive) return;
  state.three.renderLoopActive = true;
  state.three.renderer.setAnimationLoop(() => {
    state.three.controls.update();
    state.three.renderer.render(state.three.scene, state.three.camera);
  });
}

// Visualization helpers for Skybox/max-bounds
function updateMaxBoundsVisualization() {
  const show = !!el.showMaxBounds?.checked;
  if (show) ensureThree();
  const maxBoundsLines = state.three?.maxBoundsLines;
  if (maxBoundsLines) {
    maxBoundsLines.visible = show;
    state.skybox.maxBoundsVisible = show;
  }
}

function updateSkyboxInfoDisplay() {
  const maxInner = state.skybox?.maxMapSize ?? 32766;
  const tilesX = parseInt(el.tilesX?.value, 10) || 0;
  const tilesY = parseInt(el.tilesY?.value, 10) || 0;
  const tileSize = parseInt(el.tileSize?.value, 10) || 0;
  const maxHeight = parseInt(el.maxHeight?.value, 10) || 0;
  const width = Math.min(maxInner, tilesX * tileSize);
  const depth = Math.min(maxInner, tilesY * tileSize);
  const topOffset = state.skybox.topOffset ?? 0;
  const skyboxHeight = maxHeight + topOffset;
  if (el.skyboxDimensions) {
    el.skyboxDimensions.textContent = `Current Map Size: ${width} x ${depth} units
Max Inner Limit: ${maxInner} x ${maxInner} units
Skybox Top Offset: ${topOffset} units
Skybox Height: ${skyboxHeight} units`;
  }
}

function updateSkyboxVisualization() {
  const enabled = !!el.enableSkybox?.checked;
  state.skybox.enabled = enabled;
  const three = ensureThree();
  if (!three || !three.skyboxLines) return;

  if (!enabled) {
    three.skyboxLines.visible = false;
    state.skybox.skyboxBoundsVisible = false;
    return;
  }

  const tilesX = parseInt(el.tilesX?.value, 10) || 0;
  const tilesY = parseInt(el.tilesY?.value, 10) || 0;
  const tileSize = parseInt(el.tileSize?.value, 10) || 0;
  const maxHeight = parseInt(el.maxHeight?.value, 10) || 0;
  const topOffset = state.skybox.topOffset ?? 0;

  const maxInner = state.skybox.maxMapSize ?? 32766;
  const innerWidth = Math.min(maxInner, tilesX * tileSize);
  const innerDepth = Math.min(maxInner, tilesY * tileSize);
  const innerHeight = Math.min(maxInner, maxHeight);

  const width = Math.max(2, Math.min(state.skybox.maxSkyboxSize ?? (maxInner + 2), innerWidth + 2));
  const depth = Math.max(2, Math.min(state.skybox.maxSkyboxSize ?? (maxInner + 2), innerDepth + 2));
  const height = Math.max(2, innerHeight + topOffset + 2);

  const boxGeometry = new THREE.BoxGeometry(width, depth, height);
  boxGeometry.translate(0, 0, height / 2);
  const edges = new THREE.EdgesGeometry(boxGeometry);

  if (three.skyboxLines.geometry) {
    three.skyboxLines.geometry.dispose();
  }
  three.skyboxLines.geometry = edges;
  three.skyboxLines.visible = true;
  state.skybox.skyboxBoundsVisible = true;
}

// Initialize skybox-related state and UI sync
if (el.showMaxBounds) el.showMaxBounds.addEventListener('change', updateMaxBoundsVisualization);
if (el.enableSkybox) el.enableSkybox.addEventListener('change', () => {
  updateSkyboxVisualization();
  updateSkyboxInfoDisplay();
});
if (el.skyboxTopOffset) el.skyboxTopOffset.addEventListener('input', () => {
  const top = parseInt(el.skyboxTopOffset.value, 10);
  if (!Number.isNaN(top)) {
    state.skybox.topOffset = top;
  }
  updateSkyboxInfoDisplay();
  updateSkyboxVisualization();
});

// Draw and mirror image horizontally, then resize to tiles*8 using canvas
async function loadAndPrepareImage(file) {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    await new Promise((res, rej) => {
      img.onload = () => res();
      img.onerror = rej;
      img.src = url;
    });
    state.originalImage = img;
  } finally {
    URL.revokeObjectURL(url);
  }
  await resizeHeightmapImage();
}

function resizeHeightmapImage() {
  if (!state.originalImage) return;
  clampMapDimensionsIfNeeded();
  const tilesX = parseInt(el.tilesX.value, 10);
  const tilesY = parseInt(el.tilesY.value, 10);
  const targetW = tilesX * 8;
  const targetH = tilesY * 8;

  // Draw original mirrored horizontally into a temp canvas as grayscale
  const srcCanvas = document.createElement('canvas');
  srcCanvas.width = state.originalImage.width;
  srcCanvas.height = state.originalImage.height;
  const sctx = srcCanvas.getContext('2d');
  sctx.save();
  sctx.translate(srcCanvas.width, 0);
  sctx.scale(-1, 1);
  sctx.drawImage(state.originalImage, 0, 0);
  sctx.restore();

  // Convert to grayscale in-place
  const srcData = sctx.getImageData(0, 0, srcCanvas.width, srcCanvas.height);
  const d = srcData.data;
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], g = d[i + 1], b = d[i + 2];
    const y = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    d[i] = d[i + 1] = d[i + 2] = y;
  }
  sctx.putImageData(srcData, 0, 0);

  // Resize to target dimensions (bilinear via canvas)
  const dstCanvas = document.createElement('canvas');
  dstCanvas.width = targetW;
  dstCanvas.height = targetH;
  const dctx = dstCanvas.getContext('2d');
  dctx.imageSmoothingEnabled = true;
  dctx.imageSmoothingQuality = 'high';
  dctx.drawImage(srcCanvas, 0, 0, srcCanvas.width, srcCanvas.height, 0, 0, targetW, targetH);

  const dstData = dctx.getImageData(0, 0, targetW, targetH);
  const out = new Float32Array(targetW * targetH);
  const p = dstData.data;
  for (let y = 0, idx = 0; y < targetH; y++) {
    for (let x = 0; x < targetW; x++, idx++) {
      out[idx] = p[idx * 4]; // red channel (grayscale)
    }
  }

  state.heightmap = out;
  state.resizedWidth = targetW;
  state.resizedHeight = targetH;
  // Reset mask when size changes
  if (!state.mask || state.mask.length !== targetW * targetH) {
    state.mask = new Float32Array(targetW * targetH);
  }
}

// Bilinear sample from heightmap given fractional coordinates (in pixel index space)
function bilinearSample(hm, w, h, fx, fy) {
  const x0 = Math.floor(fx);
  const y0 = Math.floor(fy);
  const x1 = Math.min(x0 + 1, w - 1);
  const y1 = Math.min(y0 + 1, h - 1);
  const dx = fx - x0;
  const dy = fy - y0;
  const i00 = y0 * w + x0;
  const i10 = y0 * w + x1;
  const i01 = y1 * w + x0;
  const i11 = y1 * w + x1;
  const h00 = hm[i00];
  const h10 = hm[i10];
  const h01 = hm[i01];
  const h11 = hm[i11];
  return h00 * (1 - dx) * (1 - dy) + h10 * dx * (1 - dy) + h01 * (1 - dx) * dy + h11 * dx * dy;
}

// Generate and render the Three.js mesh
function render3DPreview() {
  if (!state.heightmap) return;
  const { renderer, scene, camera, controls } = ensureThree();
  const tilesX = parseInt(el.tilesX.value, 10);
  const tilesY = parseInt(el.tilesY.value, 10);
  const tileSize = parseInt(el.tileSize.value, 10);
  const heightScale = parseInt(el.maxHeight.value, 10);
  const powerLevel = parseInt(el.dispPower.value, 10);
  const resolution = 2 ** powerLevel;

  const mapWidth = tilesX * tileSize;
  const mapDepth = tilesY * tileSize;
  const mapHeight = Math.max(1, heightScale);
  const maxDimension = Math.max(mapWidth, mapDepth, mapHeight, 1);
  const desiredFar = Math.max(5000, maxDimension * 6);
  const desiredNear = Math.max(1, desiredFar / 4000);
  if (Math.abs(camera.near - desiredNear) > 0.01 || Math.abs(camera.far - desiredFar) > 5) {
    camera.near = desiredNear;
    camera.far = desiredFar;
    camera.updateProjectionMatrix();
  }
  controls.maxDistance = desiredFar * 0.6;

  const previewSignature = `${tilesX}_${tilesY}_${tileSize}_${heightScale}_${powerLevel}`;
  const shouldPreserveCamera = !!state.three?.mesh;
  let savedPosition = null;
  let savedTarget = null;
  if (shouldPreserveCamera) {
    savedPosition = camera.position.clone();
    savedTarget = controls.target.clone();
  }

  // Remove previous mesh and grid lines
  if (state.three.mesh) {
    scene.remove(state.three.mesh);
    state.three.mesh.geometry.dispose();
    state.three.mesh.material.dispose();
    state.three.mesh = null;
  }
  for (const line of state.three.gridLines) {
    scene.remove(line);
  }
  state.three.gridLines = [];

  const verticesX = tilesX * resolution + 1;
  const verticesY = tilesY * resolution + 1;

  const imgW = state.resizedWidth;
  const imgH = state.resizedHeight;

  // Sample grid positions over pixel space
  const worldX = new Float32Array(verticesX);
  const worldY = new Float32Array(verticesY);
  for (let i = 0; i < verticesX; i++) worldX[i] = (i / (verticesX - 1)) * (tilesX * tileSize) - (tilesX * tileSize) / 2;
  for (let j = 0; j < verticesY; j++) worldY[j] = (j / (verticesY - 1)) * (tilesY * tileSize) - (tilesY * tileSize) / 2;

  // Build geometry buffers
  const numVerts = verticesX * verticesY;
  const positions = new Float32Array(numVerts * 3);
  const colors = new Float32Array(numVerts * 3);
  const heights = new Float32Array(numVerts);

  // Sample heights with bilinear interpolation
  let minH = Infinity, maxH = -Infinity;
  let ptr = 0, hptr = 0;
  const maskVals = isShowMaskEnabled() ? new Float32Array(numVerts) : null;
  const activeMask = state.previewMask || state.mask; // Use preview mask if available
  let mptr = 0;
  for (let j = 0; j < verticesY; j++) {
    const fy = (j / (verticesY - 1)) * (imgH - 1);
    for (let i = 0; i < verticesX; i++) {
      const fx = (i / (verticesX - 1)) * (imgW - 1);
      const hpx = bilinearSample(state.heightmap, imgW, imgH, fx, fy);
      const hz = (hpx / 255.0) * heightScale;
      heights[hptr++] = hz;
      if (hz < minH) minH = hz;
      if (hz > maxH) maxH = hz;
      if (maskVals && activeMask) {
        const mv = bilinearSample(activeMask, imgW, imgH, fx, fy);
        maskVals[mptr++] = mv;
      }
    }
  }

  // Fill positions and colors
  hptr = 0;
  for (let j = 0; j < verticesY; j++) {
    for (let i = 0; i < verticesX; i++) {
      const x = worldX[i];
      const y = worldY[j];
      const z = heights[hptr++];
      positions[ptr + 0] = x;
      positions[ptr + 1] = y;
      positions[ptr + 2] = z;
      ptr += 3;
    }
  }

  // Colors: grayscale normalized by min/max, optional mask overlay (red)
  const range = Math.max(1e-6, maxH - minH);
  if (maskVals) {
    for (let k = 0, vi = 0; k < numVerts; k++, vi += 3) {
      const base = (heights[k] - minH) / range;
      const overlay = Math.min(1, (maskVals[k] / 255) * 0.8);
      const mixedBase = base * (1 - overlay);
      colors[vi + 0] = mixedBase + overlay; // red boosted by mask
      colors[vi + 1] = mixedBase;
      colors[vi + 2] = mixedBase;
    }
  } else {
    for (let k = 0, vi = 0; k < numVerts; k++, vi += 3) {
      const norm = (heights[k] - minH) / range;
      colors[vi + 0] = norm;
      colors[vi + 1] = norm;
      colors[vi + 2] = norm;
    }
  }

  // Indices
  const indices = new (numVerts > 65535 ? Uint32Array : Uint16Array)((verticesX - 1) * (verticesY - 1) * 6);
  let iptr = 0;
  for (let j = 0; j < verticesY - 1; j++) {
    for (let i = 0; i < verticesX - 1; i++) {
      const idx = j * verticesX + i;
      indices[iptr++] = idx;
      indices[iptr++] = idx + 1;
      indices[iptr++] = idx + verticesX;
      indices[iptr++] = idx + 1;
      indices[iptr++] = idx + verticesX + 1;
      indices[iptr++] = idx + verticesX;
    }
  }

  const geom = new THREE.BufferGeometry();
  geom.setIndex(new THREE.BufferAttribute(indices, 1));
  geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geom.computeVertexNormals();

  const mat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    flatShading: false,
    metalness: 0.1,
    roughness: 0.7,
    envMapIntensity: 0.6,
    emissive: new THREE.Color(0x0f172a),
    emissiveIntensity: 0.1,
    transparent: false,
    opacity: 1,
    side: THREE.DoubleSide
  });
  const mesh = new THREE.Mesh(geom, mat);
  mesh.renderOrder = 0; // Render before lines
  state.three.mesh = mesh;
  scene.add(mesh);

  // Grid lines
  if (el.showGrid.checked) {
    const lineMat = new THREE.LineBasicMaterial({ 
      color: new THREE.Color(0x4043A3),
      depthTest: true,
      depthWrite: true
    });
    const lineOffset = 5.0; // Align with terrain (no offset)
    // vertical tile boundaries
    for (let t = 1; t < tilesX; t++) {
      const xCoordIdx = t * resolution;
      const linePositions = new Float32Array(verticesY * 3);
      for (let j = 0; j < verticesY; j++) {
        const idx = j * verticesX + xCoordIdx;
        const vi = j * 3;
        linePositions[vi + 0] = positions[idx * 3 + 0];
        linePositions[vi + 1] = positions[idx * 3 + 1];
        linePositions[vi + 2] = positions[idx * 3 + 2] + lineOffset;
      }
      const lineGeom = new THREE.BufferGeometry();
      lineGeom.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
      const line = new THREE.Line(lineGeom, lineMat);
      line.renderOrder = 1; // Render after mesh
      scene.add(line);
      state.three.gridLines.push(line);
    }
    // horizontal tile boundaries
    for (let t = 1; t < tilesY; t++) {
      const yCoordIdx = t * resolution;
      const linePositions = new Float32Array(verticesX * 3);
      for (let i = 0; i < verticesX; i++) {
        const idx = yCoordIdx * verticesX + i;
        const vi = i * 3;
        linePositions[vi + 0] = positions[idx * 3 + 0];
        linePositions[vi + 1] = positions[idx * 3 + 1];
        linePositions[vi + 2] = positions[idx * 3 + 2] + lineOffset;
      }
      const lineGeom = new THREE.BufferGeometry();
      lineGeom.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
      const line = new THREE.Line(lineGeom, lineMat);
      line.renderOrder = 1; // Render after mesh
      scene.add(line);
      state.three.gridLines.push(line);
    }
  }

  if (shouldPreserveCamera && savedPosition && savedTarget) {
    camera.position.copy(savedPosition);
    controls.target.copy(savedTarget);
    camera.updateProjectionMatrix();
    controls.update();
  } else {
    // Camera framing similar to desktop
    const centerX = 0;
    const centerY = 0;
    const centerZ = heightScale / 2;
    controls.target.set(centerX, centerY, centerZ);
    const distance = Math.max(tilesX * tileSize, tilesY * tileSize) * 1.5;
    camera.position.set(centerX - distance * 0.5, centerY - distance * 0.5, distance * 0.5);
    camera.updateProjectionMatrix();
    controls.update();
  }

  state.lastPreviewSignature = previewSignature;

}

// --------------------------- VMF Writer ---------------------------
class Vertex { constructor(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z; } toString() { return `(${this.x} ${this.y} ${this.z})`; } }
class Axis { constructor(x = 0, y = 0, z = 0, translate = 0, scale = 0.25) { this.x = x; this.y = y; this.z = z; this.translate = translate; this.scale = scale; } toString() { return `[${this.x} ${this.y} ${this.z} ${this.translate}] ${this.scale}`; } }
class Plane { constructor(v0 = new Vertex(), v1 = new Vertex(), v2 = new Vertex()) { this.v0 = v0; this.v1 = v1; this.v2 = v2; } toString() { return `${this.v0} ${this.v1} ${this.v2}`; } sensibleAxes() { const axes = [1,1,1]; if (this.v0.x === this.v1.x && this.v1.x === this.v2.x) axes[0] = 0; if (this.v0.y === this.v1.y && this.v1.y === this.v2.y) axes[1] = 0; if (this.v0.z === this.v1.z && this.v1.z === this.v2.z) axes[2] = 0; const u = [0,0,0]; for (let i=0;i<3;i++){ if (axes[i]===1){ u[i]=1; axes[i]=0; break; } } const v = [0,0,0]; for (let i=0;i<3;i++){ if (axes[i]===1){ v[i]=-1; break; } } return [new Axis(u[0],u[1],u[2]), new Axis(v[0],v[1],v[2])]; } }

class VmfClass { constructor(vmfClassName) { this.vmfClassName = vmfClassName; this.properties = {}; this.auto = []; this.children = []; }
  repr(tabLevel = -1) {
    let s = '';
    const tab = (n) => '\t'.repeat(Math.max(0, n));
    const tp = tab(tabLevel);
    const ti = tab(tabLevel + 1);
    if (this.vmfClassName) { s += tp + this.vmfClassName + '\n' + tp + '{\n'; }
    for (const key of this.auto) { const v = this[key]; if (v !== undefined && v !== null) s += `${ti}"${key}" "${v}"\n`; }
    for (const [k, v] of Object.entries(this.properties)) { s += `${ti}"${k}" "${v}"\n`; }
    for (const child of this.children) { s += child.repr(tabLevel + 1); }
    if (this.vmfClassName) { s += tp + '}\n'; }
    return s;
  }
}

let globalIds = { solid: 0, side: 0, entity: 0, world: 0 };

class World extends VmfClass { constructor() { super('world'); this.classname = 'worldspawn'; this.skyname = 'sky_day01_01'; this.auto = ['classname', 'spawnflags', 'origin', 'targetname', 'skyname']; this.properties['id'] = globalIds.world++; this.properties['mapversion'] = 0; } }
class Cameras extends VmfClass { constructor(){ super('cameras'); } }
class Cordon extends VmfClass { constructor(){ super('cordon'); this.auto = ['mins','maxs','active']; this.mins = new Vertex(99999,99999,99999); this.maxs = new Vertex(-99999,-99999,-99999); this.active = 0; } }
class ValveMap extends VmfClass { constructor(){ super(false); this.world = new World(); this.cameras = new Cameras(); this.cordon = new Cordon(); this.children.push(this.world); this.children.push(this.cameras); this.children.push(this.cordon); } writeString(){ return this.repr(); } }

class Solid extends VmfClass { constructor(){ super('solid'); this.properties['id'] = globalIds.solid++; } }
class Side extends VmfClass { constructor(plane = new Plane(), material = 'TOOLS/TOOLSNODRAW'){ super('side'); this.plane = plane; this.material = material; this.rotation = 0; this.lightmapscale = 16; this.smoothing_groups = 0; this.uaxis = new Axis(); this.vaxis = new Axis(); this.auto = ['plane','material','uaxis','vaxis','rotation','lightmapscale','smoothing_groups']; this.properties['id'] = globalIds.side++; } }

class Normals extends VmfClass { constructor(power, values){ super('normals'); for (let i=0;i<2**power+1;i++){ let row = ''; for (const v of values[i]) row += `${v.x} ${v.y} ${v.z} `; this.properties[`row${i}`] = row.trimEnd(); } } }
class Distances extends VmfClass { constructor(power, values){ super('distances'); for (let i=0;i<2**power+1;i++){ this.properties[`row${i}`] = values[i].join(' '); } } }
class Offsets extends VmfClass { constructor(power){ super('offsets'); } }
class OffsetNormals extends VmfClass { constructor(power){ super('offset_normals'); } }
class Alphas extends VmfClass { constructor(power, values){ super('alphas'); for (let i=0;i<2**power+1;i++){ this.properties[`row${i}`] = values[i].map(v => typeof v === 'number' ? v : 0).join(' '); } } }
class TriangleTags extends VmfClass { constructor(power){ super('triangle_tags'); } }
class AllowedVerts extends VmfClass { constructor(power){ super('allowed_verts'); } }
class DispInfo extends VmfClass { constructor(power, normals, distances, alphas){ super('dispinfo'); this.power = power; this.startposition = '[0 0 0]'; this.elevation = 0; this.subdiv = 0; this.auto = ['power','startposition','elevation','subdiv']; this.children.push(new Normals(power, normals)); this.children.push(new Distances(power, distances)); this.children.push(new Offsets(power)); this.children.push(new OffsetNormals(power)); this.children.push(new Alphas(power, alphas)); this.children.push(new TriangleTags(power)); this.children.push(new AllowedVerts(power)); } }

const SKYBOX_MATERIAL = 'TOOLS/TOOLSSKYBOX';
const NODRAW_MATERIAL = 'TOOLS/TOOLSNODRAW';

class Block {
  constructor(origin = new Vertex(), dimensions = [64,64,64], material = 'TOOLS/TOOLSNODRAW'){
    this.origin = origin; // center
    this.dimensions = dimensions; // [w,l,h]
    this.brush = new Solid();
    this.brush.children = [];
    for (let i = 0; i < 6; i++) this.brush.children.push(new Side(new Plane(), material));
    this.updateSides();
    this.setMaterial(material);
  }
  updateSides(){
    const x = this.origin.x, y = this.origin.y, z = this.origin.z;
    const [w, l, h] = this.dimensions; const a = w/2, b = l/2, c = h/2;
    const s = this.brush.children;
    s[0].plane = new Plane(new Vertex(x - a, y + b, z + c), new Vertex(x + a, y + b, z + c), new Vertex(x + a, y - b, z + c));
    s[1].plane = new Plane(new Vertex(x - a, y - b, z - c), new Vertex(x + a, y - b, z - c), new Vertex(x + a, y + b, z - c));
    s[2].plane = new Plane(new Vertex(x - a, y + b, z + c), new Vertex(x - a, y - b, z + c), new Vertex(x - a, y - b, z - c));
    s[3].plane = new Plane(new Vertex(x + a, y + b, z - c), new Vertex(x + a, y - b, z - c), new Vertex(x + a, y - b, z + c));
    s[4].plane = new Plane(new Vertex(x + a, y + b, z + c), new Vertex(x - a, y + b, z + c), new Vertex(x - a, y + b, z - c));
    s[5].plane = new Plane(new Vertex(x + a, y - b, z - c), new Vertex(x - a, y - b, z - c), new Vertex(x - a, y - b, z + c));
    for (const side of s){ const [uaxis, vaxis] = side.plane.sensibleAxes(); side.uaxis = uaxis; side.vaxis = vaxis; }
  }
  setMaterial(mat){ for (const side of this.brush.children) side.material = mat; }
  top(){ return this.brush.children[0]; }
  bottom(){ return this.brush.children[1]; }
  repr(tabLevel=-1){ return this.brush.repr(tabLevel); }
}

function setSkyboxSides(block, interiorIndices = []) {
  const interior = new Set(interiorIndices);
  for (let i = 0; i < block.brush.children.length; i++) {
    block.brush.children[i].material = interior.has(i) ? SKYBOX_MATERIAL : NODRAW_MATERIAL;
  }
}

function addSkyboxBrushes(map, width, depth, maxHeight, topOffset = 0) {
  const wallThickness = 1;
  const buffer = 0;

  const halfInnerWidth = width / 2 + buffer;
  const halfInnerDepth = depth / 2 + buffer;
  const innerWidth = halfInnerWidth * 2;
  const innerDepth = halfInnerDepth * 2;

  const wallWidth = innerWidth + wallThickness * 2;
  const wallDepth = innerDepth + wallThickness * 2;

  const floorThickness = wallThickness;
  const floorBottom = -(floorThickness + 1);
  const innerTop = maxHeight + topOffset;
  const ceilingThickness = wallThickness;
  const wallHeight = innerTop - floorBottom;
  const wallCenterZ = floorBottom + wallHeight / 2;

  const floorBlock = new Block(
    new Vertex(0, 0, floorBottom + floorThickness / 2),
    [wallWidth, wallDepth, floorThickness],
    NODRAW_MATERIAL
  );
  setSkyboxSides(floorBlock, [0]);
  map.world.children.push(floorBlock);

  const ceilingBlock = new Block(
    new Vertex(0, 0, innerTop + ceilingThickness / 2),
    [wallWidth, wallDepth, ceilingThickness],
    NODRAW_MATERIAL
  );
  setSkyboxSides(ceilingBlock, [1]);
  map.world.children.push(ceilingBlock);

  const northWall = new Block(
    new Vertex(0, halfInnerDepth + wallThickness / 2, wallCenterZ),
    [wallWidth, wallThickness, wallHeight],
    NODRAW_MATERIAL
  );
  setSkyboxSides(northWall, [5]);
  map.world.children.push(northWall);

  const southWall = new Block(
    new Vertex(0, -(halfInnerDepth + wallThickness / 2), wallCenterZ),
    [wallWidth, wallThickness, wallHeight],
    NODRAW_MATERIAL
  );
  setSkyboxSides(southWall, [4]);
  map.world.children.push(southWall);

  const eastWall = new Block(
    new Vertex(halfInnerWidth + wallThickness / 2, 0, wallCenterZ),
    [wallThickness, wallDepth, wallHeight],
    NODRAW_MATERIAL
  );
  setSkyboxSides(eastWall, [2]);
  map.world.children.push(eastWall);

  const westWall = new Block(
    new Vertex(-(halfInnerWidth + wallThickness / 2), 0, wallCenterZ),
    [wallThickness, wallDepth, wallHeight],
    NODRAW_MATERIAL
  );
  setSkyboxSides(westWall, [3]);
  map.world.children.push(westWall);
}

function generateVMF() {
  if (!state.heightmap) return '';
  // reset counters for deterministic IDs per export
  globalIds = { solid: 0, side: 0, entity: 0, world: 0 };
  const map = new ValveMap();

  const tilesX = parseInt(el.tilesX.value, 10);
  const tilesY = parseInt(el.tilesY.value, 10);
  const tileSize = parseInt(el.tileSize.value, 10);
  const heightScale = parseInt(el.maxHeight.value, 10);
  const powerLevel = parseInt(el.dispPower.value, 10);
  const resolution = 2 ** powerLevel;
  const sampleSize = resolution + 1;
  const material = (el.materialPath.value || 'dev/dev_blendmeasure').trim();

  const hm = state.heightmap; const W = state.resizedWidth; const H = state.resizedHeight;

  for (let row = 0; row < tilesY; row++) {
    for (let col = 0; col < tilesX; col++) {
      const offsetX = col * tileSize - (tilesX * tileSize) / 2 + tileSize / 2;
      const offsetY = row * tileSize - (tilesY * tileSize) / 2 + tileSize / 2;

      // Vertex normals all up
      const vertexNormals = Array.from({ length: sampleSize }, () => Array.from({ length: sampleSize }, () => new Vertex(0,0,1)));

      // Bilinear samples across this tile's 8x8 pixel span
      const xs = Array.from({ length: sampleSize }, (_, i) => (col * 8) + (i * (8 / resolution)));
      const ys = Array.from({ length: sampleSize }, (_, i) => (row * 8) + (i * (8 / resolution)));

      const distances = [];
      let dispAlphasRows = null;
      for (let j = 0; j < sampleSize; j++) {
        const fy = Math.min(H - 1, ys[j]);
        const rowVals = [];
    const alphaVals = [];
        for (let i = 0; i < sampleSize; i++) {
          const fx = Math.min(W - 1, xs[i]);
          const v = bilinearSample(hm, W, H, fx, fy);
          rowVals.push(Math.round((v / 255.0) * heightScale));
      const am = state.mask ? bilinearSample(state.mask, W, H, fx, fy) : 0;
      alphaVals.push(Number(am.toFixed(4))); // keep decimals like VMF examples
        }
    distances.push(rowVals);
    (dispAlphasRows || (dispAlphasRows = [])).push(alphaVals);
      }

      const block = new Block(new Vertex(offsetX, offsetY, -0.5), [tileSize, tileSize, 1], material);
      const disp = new DispInfo(powerLevel, vertexNormals, distances, dispAlphasRows || []);
      const halfTile = tileSize / 2;
      const baseZ = block.origin.z + (block.dimensions[2] / 2);
      disp.startposition = `[${offsetX - halfTile} ${offsetY - halfTile} ${baseZ}]`;
      block.top().lightmapscale = 32;
      block.top().children.push(disp);
      map.world.children.push(block);
    }
  }

  const skyboxEnabled = !!el.enableSkybox?.checked;
  if (skyboxEnabled) {
    const width = tilesX * tileSize;
    const depth = tilesY * tileSize;
    const topOffset = parseInt(el.skyboxTopOffset?.value, 10);
    const offsetValue = Number.isFinite(topOffset) ? topOffset : (state.skybox?.topOffset ?? 0);
    addSkyboxBrushes(map, width, depth, heightScale, offsetValue);
  }

  return map.writeString();
}

// --------------------------- Events ---------------------------
function maybeAutoPreview() {
  if (!state.heightmap) return;
  render3DPreview();
}

// Autoupdate toggle removed; previews update automatically

// No-op shim to satisfy existing call sites after removing the autoupdate UI
function syncPreviewButtonVisibility() {
  // Intentionally left blank
}

el.heightmapInput.addEventListener('change', async (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  try {
    await loadAndPrepareImage(file);
    el.previewBtn.disabled = false;
    const generateBtns = document.querySelectorAll('.generate-vmf-btn');
    generateBtns.forEach(btn => {
      if (btn) btn.disabled = false;
    });
    render3DPreview();
    updateSkyboxInfoDisplay();
    updateSkyboxVisualization();
  } catch (err) {
    alert('Failed to load heightmap: ' + err);
  }
});

for (const id of ['tilesX','tilesY','tileSize','maxHeight']) {
  el[id].addEventListener('input', () => {
    clampMapDimensionsIfNeeded();
    resizeHeightmapImage();
    updateDimensionsLabel();
    maybeAutoPreview();
    updateSkyboxInfoDisplay();
    updateSkyboxVisualization();
  });
}
el.materialPath.addEventListener('input', () => { /* no-op for preview */ });
el.dispPower.addEventListener('change', maybeAutoPreview);
el.showGrid.addEventListener('change', render3DPreview);

el.previewBtn.addEventListener('click', render3DPreview);

if (el.autoUpdate) {
  el.autoUpdate.addEventListener('change', () => {
    syncPreviewButtonVisibility();
    if (el.autoUpdate.checked) maybeAutoPreview();
  });
}

// Add event listeners to all Generate VMF buttons
const generateBtns = document.querySelectorAll('.generate-vmf-btn');
generateBtns.forEach(btn => {
  if (btn) {
    btn.addEventListener('click', () => {
      try {
        const vmf = generateVMF();
        if (!vmf) return;
        const blob = new Blob([vmf], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'dispgen_output.vmf';
        document.body.appendChild(a);
        a.click();
        a.remove();
      } catch (err) {
        alert('Error writing VMF: ' + err);
      }
    });
  }
});

// Initial label
updateDimensionsLabel();

// ------------------------ Tab Switching ------------------------
const tabTerrain = document.getElementById('tabTerrain');
const tabMaterial = document.getElementById('tabMaterial');
const tabSkybox = document.getElementById('tabSkybox');
const contentTerrain = document.getElementById('tabContentTerrain');
const contentMaterial = document.getElementById('tabContentMaterial');
const contentSkybox = document.getElementById('tabContentSkybox');

// Helper function to check if Material/Mask tab is active
function isMaterialTabActive() {
  const matContent = document.getElementById('tabContentMaterial');
  return !!(matContent && !matContent.classList.contains('hidden'));
}

// Helper function to check if mask mode is enabled (always true in Material tab)
function isMaskModeEnabled() {
  return isMaterialTabActive();
}

// Helper function to check if show mask is enabled (always true in Material tab)
function isShowMaskEnabled() {
  return isMaterialTabActive();
}

function switchTab(tabName) {
  if (tabName === 'terrain') {
    tabTerrain.classList.add('active', 'text-slate-300', 'border-indigo-500');
    tabTerrain.classList.remove('text-slate-400', 'border-transparent');
    tabMaterial.classList.remove('active', 'text-slate-300', 'border-indigo-500');
    tabMaterial.classList.add('text-slate-400', 'border-transparent');
    if (tabSkybox) {
      tabSkybox.classList.remove('active', 'text-slate-300', 'border-indigo-500');
      tabSkybox.classList.add('text-slate-400', 'border-transparent');
    }
    contentTerrain.classList.remove('hidden');
    contentMaterial.classList.add('hidden');
    if (contentSkybox) contentSkybox.classList.add('hidden');
    if (state.heightmap) render3DPreview();
  } else if (tabName === 'skybox') {
    tabSkybox.classList.add('active', 'text-slate-300', 'border-indigo-500');
    tabSkybox.classList.remove('text-slate-400', 'border-transparent');
    tabTerrain.classList.remove('active', 'text-slate-300', 'border-indigo-500');
    tabTerrain.classList.add('text-slate-400', 'border-transparent');
    tabMaterial.classList.remove('active', 'text-slate-300', 'border-indigo-500');
    tabMaterial.classList.add('text-slate-400', 'border-transparent');
    contentSkybox.classList.remove('hidden');
    contentTerrain.classList.add('hidden');
    contentMaterial.classList.add('hidden');
    if (state.heightmap) render3DPreview();
  } else {
    // material tab
    tabMaterial.classList.add('active', 'text-slate-300', 'border-indigo-500');
    tabMaterial.classList.remove('text-slate-400', 'border-transparent');
    tabTerrain.classList.remove('active', 'text-slate-300', 'border-indigo-500');
    tabTerrain.classList.add('text-slate-400', 'border-transparent');
    if (tabSkybox) {
      tabSkybox.classList.remove('active', 'text-slate-300', 'border-indigo-500');
      tabSkybox.classList.add('text-slate-400', 'border-transparent');
    }
    contentMaterial.classList.remove('hidden');
    contentTerrain.classList.add('hidden');
    if (contentSkybox) contentSkybox.classList.add('hidden');
    // Re-render to show mask overlay when switching to Material tab
    if (state.heightmap) {
      render3DPreview();
    }
  }
}

if (tabTerrain && tabMaterial) {
  tabTerrain.addEventListener('click', () => switchTab('terrain'));
  tabMaterial.addEventListener('click', () => switchTab('material'));
}
if (tabSkybox) {
  tabSkybox.addEventListener('click', () => switchTab('skybox'));
}

// ------------------------ Number Input Counter ------------------------
function setupInputCounter(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;
  
  const decrementBtn = document.querySelector(`[data-input-counter-decrement="${inputId}"]`);
  const incrementBtn = document.querySelector(`[data-input-counter-increment="${inputId}"]`);
  
  if (decrementBtn) {
    decrementBtn.addEventListener('click', () => {
      const min = parseInt(input.min) || 0;
      const current = parseInt(input.value) || min;
      const step = parseInt(input.step) || 1;
      const newValue = Math.max(min, current - step);
      input.value = newValue;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
  }
  
  if (incrementBtn) {
    incrementBtn.addEventListener('click', () => {
      const max = parseInt(input.max) || Infinity;
      const current = parseInt(input.value) || 0;
      const step = parseInt(input.step) || 1;
      const newValue = Math.min(max, current + step);
      input.value = newValue;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
  }
}

// Setup counters for all number inputs
setupInputCounter('tilesX');
setupInputCounter('tilesY');
setupInputCounter('tileSize');
setupInputCounter('maxHeight');
setupInputCounter('skyboxTopOffset');

// ------------------------ Mask Events ------------------------
function updateBrushModeButtons() {
  const isPaint = state.brushMode === 'paint';
  if (el.brushPaintMode) {
    if (isPaint) {
      el.brushPaintMode.classList.add('border-indigo-500', 'bg-indigo-500/20', 'text-indigo-200');
      el.brushPaintMode.classList.remove('border-slate-700', 'bg-slate-900/70', 'text-slate-300');
    } else {
      el.brushPaintMode.classList.remove('border-indigo-500', 'bg-indigo-500/20', 'text-indigo-200');
      el.brushPaintMode.classList.add('border-slate-700', 'bg-slate-900/70', 'text-slate-300');
    }
  }
  if (el.brushEraseMode) {
    if (!isPaint) {
      el.brushEraseMode.classList.add('border-indigo-500', 'bg-indigo-500/20', 'text-indigo-200');
      el.brushEraseMode.classList.remove('border-slate-700', 'bg-slate-900/70', 'text-slate-300');
    } else {
      el.brushEraseMode.classList.remove('border-indigo-500', 'bg-indigo-500/20', 'text-indigo-200');
      el.brushEraseMode.classList.add('border-slate-700', 'bg-slate-900/70', 'text-slate-300');
    }
  }
  // Update brush circle color
  if (state.three?.brushCircle) {
    state.three.brushCircle.material.color.setHex(state.brushMode === 'erase' ? 0xf87171 : 0x60a5fa);
  }
}

if (el.brushPaintMode) {
  el.brushPaintMode.addEventListener('click', () => {
    state.brushMode = 'paint';
    updateBrushModeButtons();
  });
}
if (el.brushEraseMode) {
  el.brushEraseMode.addEventListener('click', () => {
    state.brushMode = 'erase';
    updateBrushModeButtons();
  });
}
if (el.brushSize) {
  el.brushSize.addEventListener('input', (e) => {
    const brushSizeValue = document.getElementById('brushSizeValue');
    if (brushSizeValue) {
      brushSizeValue.textContent = e.target.value;
    }
    // Trigger brush indicator update on next mouse move
    if (state.three?.brushCircle && isMaskModeEnabled()) {
      // The indicator will update on next pointer move
    }
  });
}

if (el.brushStrength) {
  el.brushStrength.addEventListener('input', (e) => {
    const brushStrengthValue = document.getElementById('brushStrengthValue');
    if (brushStrengthValue) {
      brushStrengthValue.textContent = e.target.value;
    }
  });
}

// ------------------------ Mask Generator Panel ------------------------
function openMaskGeneratorPanel(type) {
  if (!el.maskGeneratorPanel) return;
  el.maskGeneratorPanel.classList.remove('translate-x-full');
  
  // Initialize preview mask
  if (state.heightmap) {
    const W = state.resizedWidth, H = state.resizedHeight;
    if (!state.previewMask || state.previewMask.length !== W * H) {
      state.previewMask = new Float32Array(W * H);
      // Copy current mask to preview
      if (state.mask && state.mask.length === W * H) {
        state.previewMask.set(state.mask);
      }
    }
  }
  
  if (type === 'slope') {
    el.maskGeneratorTitle.textContent = 'Generate Slope Mask';
    el.slopeMaskPanel.classList.remove('hidden');
    el.noiseMaskPanel.classList.add('hidden');
    if (el.erosionMaskPanel) el.erosionMaskPanel.classList.add('hidden');
    // Generate preview immediately with current/default values
    if (state.heightmap) {
      const min = parseInt(document.getElementById('slopeRangeMin')?.value || 60);
      const max = parseInt(document.getElementById('slopeRangeMax')?.value || 255);
      const falloff = parseInt(document.getElementById('slopeFalloff')?.value || -50);
      const mode = document.getElementById('slopeMaskMode')?.value || 'add';
      const invert = document.getElementById('slopeMaskInvert')?.checked || false;
      
      // Generate new mask pattern
      const W = state.resizedWidth, H = state.resizedHeight;
      const generatedMask = new Float32Array(W * H);
      generateSlopeMask(min, max, falloff, generatedMask);
      
      // Invert if needed
      if (invert) {
        for (let i = 0; i < W * H; i++) {
          generatedMask[i] = 255 - generatedMask[i];
        }
      }
      
      // Initialize preview with current mask
      if (!state.previewMask || state.previewMask.length !== W * H) {
        state.previewMask = new Float32Array(W * H);
        if (state.mask && state.mask.length === W * H) {
          state.previewMask.set(state.mask);
        }
      }
      
      // Apply mode to preview
      if (mode === 'add') {
        for (let i = 0; i < W * H; i++) {
          state.previewMask[i] = Math.min(255, (state.mask && state.mask[i] ? state.mask[i] : 0) + generatedMask[i]);
        }
      } else { // subtract
        for (let i = 0; i < W * H; i++) {
          state.previewMask[i] = Math.max(0, (state.mask && state.mask[i] ? state.mask[i] : 0) - generatedMask[i]);
        }
      }
      
      render3DPreview();
    }
  } else if (type === 'noise') {
    el.maskGeneratorTitle.textContent = 'Generate Noise Mask';
    el.slopeMaskPanel.classList.add('hidden');
    el.noiseMaskPanel.classList.remove('hidden');
    if (el.erosionMaskPanel) el.erosionMaskPanel.classList.add('hidden');
    // Update type-specific UI
    const noiseType = document.getElementById('noiseType')?.value || 'perlin';
    updateNoiseTypeSpecificUI(noiseType);
    // Generate preview immediately with current/default values (force update)
    if (state.heightmap) {
      updateNoisePreview(true);
    }
  } else if (type === 'erosion') {
    el.maskGeneratorTitle.textContent = 'Generate Erosion Mask';
    if (el.slopeMaskPanel) el.slopeMaskPanel.classList.add('hidden');
    if (el.noiseMaskPanel) el.noiseMaskPanel.classList.add('hidden');
    if (el.erosionMaskPanel) el.erosionMaskPanel.classList.remove('hidden');

    if (state.heightmap) {
      updateErosionPreview(true);
    }
  }
}

function closeMaskGeneratorPanel() {
  if (!el.maskGeneratorPanel) return;
  el.maskGeneratorPanel.classList.add('translate-x-full');
  // Clear preview mask when closing
  state.previewMask = null;
  render3DPreview();
}

// Dual range slider for slope
function setupSlopeRangeSlider() {
  const minInput = document.getElementById('slopeRangeMin');
  const maxInput = document.getElementById('slopeRangeMax');
  const track = document.getElementById('slopeRangeTrack');
  const minValue = document.getElementById('slopeRangeMinValue');
  const maxValue = document.getElementById('slopeRangeMaxValue');
  
  if (!minInput || !maxInput || !track) return;
  
  const min = parseInt(minInput.min) || 0;
  const max = parseInt(minInput.max) || 255;
  const range = max - min;
  
  function updateTrack() {
    const minVal = parseInt(minInput.value);
    const maxVal = parseInt(maxInput.value);
    
    // Calculate percentages
    const minPercent = ((minVal - min) / range) * 100;
    const maxPercent = ((maxVal - min) / range) * 100;
    
    // Update track position and width
    track.style.left = `${minPercent}%`;
    track.style.width = `${maxPercent - minPercent}%`;
    
    // Update value displays
    if (minValue) minValue.textContent = minVal;
    if (maxValue) maxValue.textContent = maxVal;
    
    // Update preview if panel is open (always show preview when panel is visible)
    if (state.previewMask) {
      const falloff = parseInt(document.getElementById('slopeFalloff')?.value || -50);
      const mode = document.getElementById('slopeMaskMode')?.value || 'add';
      const invert = document.getElementById('slopeMaskInvert')?.checked || false;
      const W = state.resizedWidth, H = state.resizedHeight;
      
      // Generate new mask pattern
      const generatedMask = new Float32Array(W * H);
      generateSlopeMask(minVal, maxVal, falloff, generatedMask);
      
      // Invert if needed
      if (invert) {
        for (let i = 0; i < W * H; i++) {
          generatedMask[i] = 255 - generatedMask[i];
        }
      }
      
      // Initialize preview with current mask
      if (!state.previewMask || state.previewMask.length !== W * H) {
        state.previewMask = new Float32Array(W * H);
        if (state.mask && state.mask.length === W * H) {
          state.previewMask.set(state.mask);
        }
      }
      
      // Apply mode to preview
      if (mode === 'add') {
        for (let i = 0; i < W * H; i++) {
          state.previewMask[i] = Math.min(255, (state.mask && state.mask[i] ? state.mask[i] : 0) + generatedMask[i]);
        }
      } else { // subtract
        for (let i = 0; i < W * H; i++) {
          state.previewMask[i] = Math.max(0, (state.mask && state.mask[i] ? state.mask[i] : 0) - generatedMask[i]);
        }
      }
      
      render3DPreview();
    }
  }
  
  // Handle min input
  minInput.addEventListener('input', () => {
    if (parseInt(minInput.value) > parseInt(maxInput.value)) {
      minInput.value = maxInput.value;
    }
    updateTrack();
  });
  
  // Handle max input
  maxInput.addEventListener('input', () => {
    if (parseInt(maxInput.value) < parseInt(minInput.value)) {
      maxInput.value = minInput.value;
    }
    updateTrack();
  });
  
  // Initial update
  updateTrack();
}

// Update value displays
function setupValueDisplays() {
  const slopeFalloff = document.getElementById('slopeFalloff');
  const slopeFalloffValue = document.getElementById('slopeFalloffValue');
  const noiseScale = document.getElementById('noiseScale');
  const noiseScaleValue = document.getElementById('noiseScaleValue');
  
  if (slopeFalloff && slopeFalloffValue) {
    slopeFalloff.addEventListener('input', (e) => {
      slopeFalloffValue.textContent = e.target.value;
      if (state.previewMask) {
        const min = parseInt(document.getElementById('slopeRangeMin').value);
        const max = parseInt(document.getElementById('slopeRangeMax').value);
        const falloff = parseInt(e.target.value);
        const mode = document.getElementById('slopeMaskMode')?.value || 'add';
        const invert = document.getElementById('slopeMaskInvert')?.checked || false;
        const W = state.resizedWidth, H = state.resizedHeight;
        
        // Generate new mask pattern
        const generatedMask = new Float32Array(W * H);
        generateSlopeMask(min, max, falloff, generatedMask);
        
        // Invert if needed
        if (invert) {
          for (let i = 0; i < W * H; i++) {
            generatedMask[i] = 255 - generatedMask[i];
          }
        }
        
        // Initialize preview with current mask
        if (!state.previewMask || state.previewMask.length !== W * H) {
          state.previewMask = new Float32Array(W * H);
          if (state.mask && state.mask.length === W * H) {
            state.previewMask.set(state.mask);
          }
        }
        
        // Apply mode to preview
        if (mode === 'add') {
          for (let i = 0; i < W * H; i++) {
            state.previewMask[i] = Math.min(255, (state.mask && state.mask[i] ? state.mask[i] : 0) + generatedMask[i]);
          }
        } else { // subtract
          for (let i = 0; i < W * H; i++) {
            state.previewMask[i] = Math.max(0, (state.mask && state.mask[i] ? state.mask[i] : 0) - generatedMask[i]);
          }
        }
        
        render3DPreview();
      }
    });
  }
  
  if (noiseScale && noiseScaleValue) {
    noiseScale.addEventListener('input', (e) => {
      noiseScaleValue.textContent = e.target.value;
      updateNoisePreview();
    });
  }
  
  // Setup balance and contrast sliders
  const noiseBalance = document.getElementById('noiseBalance');
  const noiseBalanceValue = document.getElementById('noiseBalanceValue');
  const noiseContrast = document.getElementById('noiseContrast');
  const noiseContrastValue = document.getElementById('noiseContrastValue');
  
  if (noiseBalance && noiseBalanceValue) {
    noiseBalance.addEventListener('input', (e) => {
      noiseBalanceValue.textContent = e.target.value;
      updateNoisePreview();
    });
  }
  
  if (noiseContrast && noiseContrastValue) {
    noiseContrast.addEventListener('input', (e) => {
      noiseContrastValue.textContent = e.target.value;
      updateNoisePreview();
    });
  }
}

function setupErosionValueDisplays() {
  const configs = [
    { id: 'erosionDroplets', valueId: 'erosionDropletsValue', decimals: 0 },
    { id: 'erosionMaxSteps', valueId: 'erosionMaxStepsValue', decimals: 0 },
    { id: 'erosionRadius', valueId: 'erosionRadiusValue', decimals: 2 },
    { id: 'erosionInertia', valueId: 'erosionInertiaValue', decimals: 2 },
    { id: 'erosionCapacity', valueId: 'erosionCapacityValue', decimals: 0 },
    { id: 'erosionDeposition', valueId: 'erosionDepositionValue', decimals: 2 },
    { id: 'erosionErosionRate', valueId: 'erosionErosionRateValue', decimals: 2 },
    { id: 'erosionEvaporation', valueId: 'erosionEvaporationValue', decimals: 2 },
    { id: 'erosionGravity', valueId: 'erosionGravityValue', decimals: 0 },
    { id: 'erosionMinSlope', valueId: 'erosionMinSlopeValue', decimals: 2 }
  ];

  configs.forEach(({ id, valueId, decimals }) => {
    const inputEl = document.getElementById(id);
    const valueEl = document.getElementById(valueId);
    if (!inputEl || !valueEl) return;

    const updateLabel = () => {
      const numericValue = parseFloat(inputEl.value);
      if (!Number.isFinite(numericValue)) return;
      valueEl.textContent = numericValue.toFixed(decimals);
    };

    updateLabel();
    inputEl.addEventListener('input', () => {
      updateLabel();
      updateErosionPreview();
    });
  });

  const seedInput = document.getElementById('erosionSeed');
  if (seedInput) {
    seedInput.addEventListener('change', () => updateErosionPreview());
  }

  const modeSelect = document.getElementById('erosionMaskMode');
  if (modeSelect) {
    modeSelect.addEventListener('change', () => updateErosionPreview());
  }

  const invertToggle = document.getElementById('erosionMaskInvert');
  if (invertToggle) {
    invertToggle.addEventListener('change', () => updateErosionPreview());
  }
}

function updateNoisePreview(force = false) {
  const livePreview = document.getElementById('maskLivePreview')?.checked;
  if (!force && (!livePreview || !state.previewMask)) return;
  
  const type = document.getElementById('noiseType')?.value || 'perlin';
  const seed = parseInt(document.getElementById('noiseSeed')?.value) || 0;
  const scale = parseInt(document.getElementById('noiseScale')?.value) || 32;
  const offsetX = parseFloat(document.getElementById('noiseOffsetX')?.value) || 0;
  const offsetY = parseFloat(document.getElementById('noiseOffsetY')?.value) || 0;
  const balance = parseFloat(document.getElementById('noiseBalance')?.value) || 0;
  const contrast = parseFloat(document.getElementById('noiseContrast')?.value) || 100;
  const mode = document.getElementById('noiseMaskMode')?.value || 'add';
  const invert = document.getElementById('noiseMaskInvert')?.checked || false;
  
  // Collect type-specific parameters
  const typeParams = {};
  const typeSpecificDiv = document.getElementById('noiseTypeSpecific');
  if (typeSpecificDiv) {
    const inputs = typeSpecificDiv.querySelectorAll('input, select');
    inputs.forEach(input => {
      // Convert ID like "noiseOctaves" to "octaves", "noiseDistanceFunction" to "distanceFunction"
      let key = input.id.replace(/^noise/, '');
      key = key.charAt(0).toLowerCase() + key.slice(1);
      if (input.type === 'number' || input.type === 'range') {
        typeParams[key] = parseFloat(input.value) || 0;
      } else {
        typeParams[key] = input.value;
      }
    });
  }
  
  // Add balance and contrast to typeParams
  typeParams.balance = balance;
  typeParams.contrast = contrast;
  
  // Generate new mask pattern
  const W = state.resizedWidth, H = state.resizedHeight;
  const generatedMask = new Float32Array(W * H);
  generateNoiseMask(type, seed, scale, offsetX, offsetY, typeParams, generatedMask);
  
  // Invert if needed
  if (invert) {
    for (let i = 0; i < W * H; i++) {
      generatedMask[i] = 255 - generatedMask[i];
    }
  }
  
  // Initialize preview with current mask
  if (!state.previewMask || state.previewMask.length !== W * H) {
    state.previewMask = new Float32Array(W * H);
    if (state.mask && state.mask.length === W * H) {
      state.previewMask.set(state.mask);
    }
  }
  
  // Apply mode to preview
  if (mode === 'add') {
    for (let i = 0; i < W * H; i++) {
      state.previewMask[i] = Math.min(255, (state.mask && state.mask[i] ? state.mask[i] : 0) + generatedMask[i]);
    }
  } else { // subtract
    for (let i = 0; i < W * H; i++) {
      state.previewMask[i] = Math.max(0, (state.mask && state.mask[i] ? state.mask[i] : 0) - generatedMask[i]);
    }
  }
  
  render3DPreview();
}

function readErosionControls() {
  const readInt = (id, fallback) => {
    const input = document.getElementById(id);
    if (!input) return fallback;
    const value = parseInt(input.value, 10);
    return Number.isFinite(value) ? value : fallback;
  };
  const readFloat = (id, fallback) => {
    const input = document.getElementById(id);
    if (!input) return fallback;
    const value = parseFloat(input.value);
    return Number.isFinite(value) ? value : fallback;
  };
  return {
    mode: document.getElementById('erosionMaskMode')?.value || 'add',
    invert: document.getElementById('erosionMaskInvert')?.checked || false,
    seed: readInt('erosionSeed', 0),
    droplets: readInt('erosionDroplets', 1500),
    maxSteps: readInt('erosionMaxSteps', 120),
    radius: readFloat('erosionRadius', 1.5),
    inertia: readFloat('erosionInertia', 0.1),
    capacity: readFloat('erosionCapacity', 10),
    depositionRate: readFloat('erosionDeposition', 0.02),
    erosionRate: readFloat('erosionErosionRate', 0.9),
    evaporationRate: readFloat('erosionEvaporation', 0.02),
    gravity: readFloat('erosionGravity', 20),
    minSlope: readFloat('erosionMinSlope', 0.05)
  };
}

function updateErosionPreview(force = false) {
  const livePreview = document.getElementById('maskLivePreview')?.checked;
  if (!force && (!livePreview || !state.previewMask)) return;
  if (!state.heightmap) return;

  const settings = readErosionControls();
  const { mode, invert, ...generatorOptions } = settings;
  const W = state.resizedWidth;
  const H = state.resizedHeight;
  if (!W || !H) return;

  let generatedMask = new Float32Array(W * H);
  const erosionMask = generateErosionMask(generatorOptions, generatedMask);
  if (!erosionMask) return;
  generatedMask = erosionMask;

  if (invert) {
    for (let i = 0; i < generatedMask.length; i++) {
      generatedMask[i] = 255 - generatedMask[i];
    }
  }

  if (!state.previewMask || state.previewMask.length !== W * H) {
    state.previewMask = new Float32Array(W * H);
  }

  const hasBaseMask = !!(state.mask && state.mask.length === W * H);
  for (let i = 0; i < W * H; i++) {
    const base = hasBaseMask ? state.mask[i] : 0;
    if (mode === 'add') {
      state.previewMask[i] = Math.min(255, base + generatedMask[i]);
    } else {
      state.previewMask[i] = Math.max(0, base - generatedMask[i]);
    }
  }

  render3DPreview();
}

// Create type-specific UI elements
function updateNoiseTypeSpecificUI(type) {
  const container = document.getElementById('noiseTypeSpecific');
  if (!container) return;
  
  // Save current values before clearing
  const currentValues = {};
  const inputs = container.querySelectorAll('input, select');
  inputs.forEach(input => {
    if (input.type === 'range' || input.type === 'number') {
      currentValues[input.id] = parseFloat(input.value) || 0;
    } else {
      currentValues[input.id] = input.value;
    }
  });
  
  container.innerHTML = '';
  
  const commonParams = {
    octaves: { type: 'range', label: 'Octaves', min: 1, max: 8, value: 1, step: 1 },
    persistence: { type: 'range', label: 'Persistence', min: 0, max: 100, value: 50, step: 1 },
    lacunarity: { type: 'range', label: 'Lacunarity', min: 100, max: 500, value: 200, step: 10 }
  };
  
  const cellularParams = {
    distanceFunction: { type: 'select', label: 'Distance Function', options: [
      { value: 'euclidean', text: 'Euclidean' },
      { value: 'manhattan', text: 'Manhattan' },
      { value: 'chebyshev', text: 'Chebyshev' }
    ], value: 'euclidean' },
    returnType: { type: 'select', label: 'Return Type', options: [
      { value: 'distance', text: 'Distance' },
      { value: 'distance2', text: 'Distance²' },
      { value: 'distanceInv', text: '1 / Distance' }
    ], value: 'distance' }
  };
  
  const voronoiParams = {
    returnType: { type: 'select', label: 'Return Type', options: [
      { value: 'distance', text: 'Distance to Cell' },
      { value: 'cellId', text: 'Cell ID' },
      { value: 'border', text: 'Distance to Border' }
    ], value: 'distance' }
  };
  
  // Helper function to get value, preserving current if available
  function getValue(paramKey, defaultValue) {
    const id = `noise${paramKey.charAt(0).toUpperCase() + paramKey.slice(1)}`;
    return currentValues[id] !== undefined ? currentValues[id] : defaultValue;
  }
  
  // Add common parameters for Perlin, Simplex, Value
  if (type === 'perlin' || type === 'simplex' || type === 'value') {
    Object.entries(commonParams).forEach(([key, param]) => {
      const div = document.createElement('div');
      const value = getValue(key, param.value);
      div.innerHTML = `
        <label class="text-xs uppercase tracking-wide text-slate-400 mb-2 block">${param.label}</label>
        ${param.type === 'range' ? `
          <div class="relative h-2">
            <div class="absolute h-2 w-full bg-slate-800 rounded-full top-1/2 -translate-y-1/2"></div>
            <input type="range" id="noise${key.charAt(0).toUpperCase() + key.slice(1)}" min="${param.min}" max="${param.max}" value="${value}" step="${param.step}" class="absolute top-0 w-full h-2 z-10">
          </div>
          <div class="flex justify-between mt-2 text-xs text-slate-400">
            <span>${param.min}</span>
            <span id="noise${key.charAt(0).toUpperCase() + key.slice(1)}Value">${value}</span>
            <span>${param.max}</span>
          </div>
        ` : ''}
      `;
      container.appendChild(div);
    });
  }
  
  // Add cellular-specific parameters
  if (type === 'cellular') {
    // Add common params first
    Object.entries(commonParams).forEach(([key, param]) => {
      const div = document.createElement('div');
      const value = getValue(key, param.value);
      div.innerHTML = `
        <label class="text-xs uppercase tracking-wide text-slate-400 mb-2 block">${param.label}</label>
        ${param.type === 'range' ? `
          <div class="relative h-2">
            <div class="absolute h-2 w-full bg-slate-800 rounded-full top-1/2 -translate-y-1/2"></div>
            <input type="range" id="noise${key.charAt(0).toUpperCase() + key.slice(1)}" min="${param.min}" max="${param.max}" value="${value}" step="${param.step}" class="absolute top-0 w-full h-2 z-10">
          </div>
          <div class="flex justify-between mt-2 text-xs text-slate-400">
            <span>${param.min}</span>
            <span id="noise${key.charAt(0).toUpperCase() + key.slice(1)}Value">${value}</span>
            <span>${param.max}</span>
          </div>
        ` : ''}
      `;
      container.appendChild(div);
    });
    // Then cellular-specific params
    Object.entries(cellularParams).forEach(([key, param]) => {
      const div = document.createElement('div');
      const id = `noise${key.charAt(0).toUpperCase() + key.slice(1)}`;
      const value = currentValues[id] !== undefined ? currentValues[id] : param.value;
      div.innerHTML = `
        <label class="text-xs uppercase tracking-wide text-slate-400 mb-2 block">${param.label}</label>
        <select id="${id}" class="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 focus:outline-none">
          ${param.options.map(opt => `<option value="${opt.value}" ${opt.value === value ? 'selected' : ''}>${opt.text}</option>`).join('')}
        </select>
      `;
      container.appendChild(div);
    });
  }
  
  // Add voronoi-specific parameters
  if (type === 'voronoi') {
    // Add common params first
    Object.entries(commonParams).forEach(([key, param]) => {
      const div = document.createElement('div');
      const value = getValue(key, param.value);
      div.innerHTML = `
        <label class="text-xs uppercase tracking-wide text-slate-400 mb-2 block">${param.label}</label>
        ${param.type === 'range' ? `
          <div class="relative h-2">
            <div class="absolute h-2 w-full bg-slate-800 rounded-full top-1/2 -translate-y-1/2"></div>
            <input type="range" id="noise${key.charAt(0).toUpperCase() + key.slice(1)}" min="${param.min}" max="${param.max}" value="${value}" step="${param.step}" class="absolute top-0 w-full h-2 z-10">
          </div>
          <div class="flex justify-between mt-2 text-xs text-slate-400">
            <span>${param.min}</span>
            <span id="noise${key.charAt(0).toUpperCase() + key.slice(1)}Value">${value}</span>
            <span>${param.max}</span>
          </div>
        ` : ''}
      `;
      container.appendChild(div);
    });
    // Then voronoi-specific params
    Object.entries(voronoiParams).forEach(([key, param]) => {
      const div = document.createElement('div');
      const id = `noise${key.charAt(0).toUpperCase() + key.slice(1)}`;
      const value = currentValues[id] !== undefined ? currentValues[id] : param.value;
      div.innerHTML = `
        <label class="text-xs uppercase tracking-wide text-slate-400 mb-2 block">${param.label}</label>
        <select id="${id}" class="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 focus:outline-none">
          ${param.options.map(opt => `<option value="${opt.value}" ${opt.value === value ? 'selected' : ''}>${opt.text}</option>`).join('')}
        </select>
      `;
      container.appendChild(div);
    });
  }
  
  // Setup event listeners for new inputs
  setupNoiseTypeSpecificListeners();
}

function setupNoiseTypeSpecificListeners() {
  const typeSpecificDiv = document.getElementById('noiseTypeSpecific');
  if (!typeSpecificDiv) return;
  
  // Remove old listeners by cloning (clean way to remove all)
  const newDiv = typeSpecificDiv.cloneNode(true);
  typeSpecificDiv.parentNode.replaceChild(newDiv, typeSpecificDiv);
  
  // Function to update persistence/lacunarity disabled state based on octaves
  function updatePersistenceLacunarityState() {
    const octavesInput = document.getElementById('noiseOctaves');
    const persistenceInput = document.getElementById('noisePersistence');
    const lacunarityInput = document.getElementById('noiseLacunarity');
    
    if (octavesInput && persistenceInput && lacunarityInput) {
      const octaves = parseInt(octavesInput.value) || 1;
      const shouldHide = octaves <= 1;
      
      // Find parent divs and hide/show them
      const persistenceDiv = persistenceInput.closest('div').parentElement;
      const lacunarityDiv = lacunarityInput.closest('div').parentElement;
      
      if (persistenceDiv) {
        if (shouldHide) {
          persistenceDiv.style.display = 'none';
        } else {
          persistenceDiv.style.display = '';
        }
      }
      
      if (lacunarityDiv) {
        if (shouldHide) {
          lacunarityDiv.style.display = 'none';
        } else {
          lacunarityDiv.style.display = '';
        }
      }
    }
  }
  
  // Add listener to octaves slider to update persistence/lacunarity state
  const octavesInput = newDiv.querySelector('#noiseOctaves');
  if (octavesInput) {
    octavesInput.addEventListener('input', (e) => {
      const valueDisplay = document.getElementById('noiseOctavesValue');
      if (valueDisplay) {
        valueDisplay.textContent = e.target.value;
      }
      updatePersistenceLacunarityState();
      updateNoisePreview();
    });
  }
  
  // Add listeners to range inputs for value display updates
  const rangeInputs = newDiv.querySelectorAll('input[type="range"]');
  rangeInputs.forEach(input => {
    if (input.id === 'noiseOctaves') {
      // Already handled above
      return;
    }
    const valueDisplay = document.getElementById(input.id + 'Value');
    if (valueDisplay) {
      input.addEventListener('input', (e) => {
        valueDisplay.textContent = e.target.value;
        updateNoisePreview();
      });
    } else {
      input.addEventListener('input', () => {
        updateNoisePreview();
      });
    }
  });
  
  // Add listeners to select inputs
  const selectInputs = newDiv.querySelectorAll('select');
  selectInputs.forEach(input => {
    input.addEventListener('change', () => {
      updateNoisePreview();
    });
  });
  
  // Initial state update
  updatePersistenceLacunarityState();
}

if (el.genSlopeMask) el.genSlopeMask.addEventListener('click', () => openMaskGeneratorPanel('slope'));
if (el.genNoiseMask) el.genNoiseMask.addEventListener('click', () => openMaskGeneratorPanel('noise'));
if (el.genErosionMask) el.genErosionMask.addEventListener('click', () => openMaskGeneratorPanel('erosion'));
if (el.closeMaskGenerator) el.closeMaskGenerator.addEventListener('click', closeMaskGeneratorPanel);

// Apply buttons
const applySlopeMask = document.getElementById('applySlopeMask');
const applyNoiseMask = document.getElementById('applyNoiseMask');
const applyErosionMask = document.getElementById('applyErosionMask');

if (applySlopeMask) {
  applySlopeMask.addEventListener('click', () => {
    // Get mode and parameters
    const mode = document.getElementById('slopeMaskMode')?.value || 'add';
    const min = parseInt(document.getElementById('slopeRangeMin')?.value || 60);
    const max = parseInt(document.getElementById('slopeRangeMax')?.value || 255);
    const falloff = parseInt(document.getElementById('slopeFalloff')?.value || -50);
    const invert = document.getElementById('slopeMaskInvert')?.checked || false;
    
    // Generate the mask pattern
    const W = state.resizedWidth, H = state.resizedHeight;
    if (!state.mask || state.mask.length !== W * H) {
      state.mask = new Float32Array(W * H);
    }
    
    const generatedMask = new Float32Array(W * H);
    generateSlopeMask(min, max, falloff, generatedMask);
    
    // Invert if needed
    if (invert) {
      for (let i = 0; i < W * H; i++) {
        generatedMask[i] = 255 - generatedMask[i];
      }
    }
    
    // Apply based on mode
    if (mode === 'add') {
      for (let i = 0; i < W * H; i++) {
        state.mask[i] = Math.min(255, state.mask[i] + generatedMask[i]);
      }
    } else { // subtract
      for (let i = 0; i < W * H; i++) {
        state.mask[i] = Math.max(0, state.mask[i] - generatedMask[i]);
      }
    }
    
    // Save state after applying (so this operation can be undone in one step)
    saveMaskState();
    
    render3DPreview();
    closeMaskGeneratorPanel();
  });
}

if (applyNoiseMask) {
  applyNoiseMask.addEventListener('click', () => {
    // Get mode and parameters
    const mode = document.getElementById('noiseMaskMode')?.value || 'add';
    const type = document.getElementById('noiseType')?.value || 'perlin';
    const seed = parseInt(document.getElementById('noiseSeed')?.value) || 0;
    const scale = parseInt(document.getElementById('noiseScale')?.value) || 32;
    const offsetX = parseFloat(document.getElementById('noiseOffsetX')?.value) || 0;
    const offsetY = parseFloat(document.getElementById('noiseOffsetY')?.value) || 0;
    const balance = parseFloat(document.getElementById('noiseBalance')?.value) || 0;
    const contrast = parseFloat(document.getElementById('noiseContrast')?.value) || 100;
    const invert = document.getElementById('noiseMaskInvert')?.checked || false;
    
    // Collect type-specific parameters
    const typeParams = {};
    const typeSpecificDiv = document.getElementById('noiseTypeSpecific');
    if (typeSpecificDiv) {
      const inputs = typeSpecificDiv.querySelectorAll('input, select');
      inputs.forEach(input => {
        let key = input.id.replace(/^noise/, '');
        key = key.charAt(0).toLowerCase() + key.slice(1);
        if (input.type === 'number' || input.type === 'range') {
          typeParams[key] = parseFloat(input.value) || 0;
        } else {
          typeParams[key] = input.value;
        }
      });
    }
    
    typeParams.balance = balance;
    typeParams.contrast = contrast;
    
    // Generate the mask pattern
    const W = state.resizedWidth, H = state.resizedHeight;
    if (!state.mask || state.mask.length !== W * H) {
      state.mask = new Float32Array(W * H);
    }
    
    const generatedMask = new Float32Array(W * H);
    generateNoiseMask(type, seed, scale, offsetX, offsetY, typeParams, generatedMask);
    
    // Invert if needed
    if (invert) {
      for (let i = 0; i < W * H; i++) {
        generatedMask[i] = 255 - generatedMask[i];
      }
    }
    
    // Apply based on mode
    if (mode === 'add') {
      for (let i = 0; i < W * H; i++) {
        state.mask[i] = Math.min(255, state.mask[i] + generatedMask[i]);
      }
    } else { // subtract
      for (let i = 0; i < W * H; i++) {
        state.mask[i] = Math.max(0, state.mask[i] - generatedMask[i]);
      }
    }
    
    // Save state after applying (so this operation can be undone in one step)
    saveMaskState();
    
    render3DPreview();
    closeMaskGeneratorPanel();
  });
}

if (applyErosionMask) {
  applyErosionMask.addEventListener('click', () => {
    if (!state.heightmap) return;
    const settings = readErosionControls();
    const { mode, invert, ...generatorOptions } = settings;
    const W = state.resizedWidth;
    const H = state.resizedHeight;
    if (!W || !H) return;

    if (!state.mask || state.mask.length !== W * H) {
      state.mask = new Float32Array(W * H);
    }

    const scratch = new Float32Array(W * H);
    const erosionMask = generateErosionMask(generatorOptions, scratch);
    if (!erosionMask) return;
    const maskData = erosionMask;

    if (invert) {
      for (let i = 0; i < maskData.length; i++) {
        maskData[i] = 255 - maskData[i];
      }
    }

    if (mode === 'add') {
      for (let i = 0; i < W * H; i++) {
        state.mask[i] = Math.min(255, state.mask[i] + maskData[i]);
      }
    } else {
      for (let i = 0; i < W * H; i++) {
        state.mask[i] = Math.max(0, state.mask[i] - maskData[i]);
      }
    }

    saveMaskState();
    render3DPreview();
    closeMaskGeneratorPanel();
  });
}

// Live preview for noise inputs
const noiseTypeSelect = document.getElementById('noiseType');
if (noiseTypeSelect) {
  noiseTypeSelect.addEventListener('change', (e) => {
    updateNoiseTypeSpecificUI(e.target.value);
    updateNoisePreview();
  });
}

const noiseInputs = ['noiseSeed', 'noiseOffsetX', 'noiseOffsetY'];
noiseInputs.forEach(id => {
  const inputEl = document.getElementById(id);
  if (inputEl) {
    inputEl.addEventListener('input', () => {
      updateNoisePreview();
    });
  }
});

// Random seed button
const randomSeedBtn = document.getElementById('randomSeedBtn');
if (randomSeedBtn) {
  randomSeedBtn.addEventListener('click', () => {
    const seedInput = document.getElementById('noiseSeed');
    if (seedInput) {
      // Generate random seed between -2147483648 and 2147483647 (32-bit integer range)
      const randomSeed = Math.floor(Math.random() * 4294967296) - 2147483648;
      seedInput.value = randomSeed;
      updateNoisePreview();
    }
  });
}

// Initialize sliders
setupSlopeRangeSlider();
setupValueDisplays();
setupErosionValueDisplays();
if (el.maskInput) el.maskInput.addEventListener('change', async (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  if (!state.resizedWidth || !state.resizedHeight) {
    alert('Load a heightmap before importing a mask.');
    e.target.value = '';
    return;
  }

  closeMaskBlendModal();
  state.pendingMaskImport = null;

  try {
    const importedData = await loadMaskFromFile(file);
    if (!importedData) throw new Error('Failed to read mask image.');

    let previousSnapshot = null;
    if (state.mask && state.mask.length === importedData.length) {
      previousSnapshot = new Float32Array(state.mask);
    } else {
      previousSnapshot = new Float32Array(importedData.length);
    }

    state.pendingMaskImport = { data: importedData, previousSnapshot };
    if (el.maskBlendFilename) {
      el.maskBlendFilename.textContent = file.name || 'mask';
    }
    openMaskBlendModal();
  } catch (err) {
    console.error('Mask import failed:', err);
    alert('Failed to import mask. Please try a different file.');
    e.target.value = '';
    state.pendingMaskImport = null;
    closeMaskBlendModal();
  }
});
if (el.clearMask) el.clearMask.addEventListener('click', () => {
  if (state.mask) state.mask.fill(0);
  saveMaskState(); // Save state after clearing (so clear can be undone in one step)
  render3DPreview();
});

if (el.maskBlendAdd) {
  el.maskBlendAdd.addEventListener('click', () => applyPendingMaskImport('add'));
}
if (el.maskBlendSubtract) {
  el.maskBlendSubtract.addEventListener('click', () => applyPendingMaskImport('subtract'));
}
if (el.maskBlendOverride) {
  el.maskBlendOverride.addEventListener('click', () => applyPendingMaskImport('override'));
}
if (el.maskBlendRotation && el.maskBlendRotationValue) {
  el.maskBlendRotation.addEventListener('input', (e) => {
    const value = parseInt(e.target.value, 10);
    const degrees = value * 90;
    el.maskBlendRotationValue.textContent = `${degrees}°`;
  });
}
if (el.maskBlendCancel) {
  el.maskBlendCancel.addEventListener('click', () => {
    cancelPendingMaskImport();
  });
}
if (el.maskBlendOverlay) {
  el.maskBlendOverlay.addEventListener('click', () => {
    cancelPendingMaskImport();
  });
}

document.addEventListener('keydown', (evt) => {
  if (evt.key === 'Escape' && el.maskBlendModal && el.maskBlendModal.classList.contains('flex')) {
    cancelPendingMaskImport();
  }
});

// Undo/Redo buttons
const undoMaskBtn = document.getElementById('undoMask');
const redoMaskBtn = document.getElementById('redoMask');

if (undoMaskBtn) {
  undoMaskBtn.addEventListener('click', undoMask);
}

if (redoMaskBtn) {
  redoMaskBtn.addEventListener('click', redoMask);
}

// Keyboard shortcuts for undo/redo
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'z') {
    e.preventDefault();
    undoMask();
  } else if ((e.ctrlKey || e.metaKey) && (e.shiftKey && e.key === 'z' || e.key === 'y')) {
    e.preventDefault();
    redoMask();
  }
});

// Mode change listeners for mask generators
const slopeMaskMode = document.getElementById('slopeMaskMode');
const noiseMaskMode = document.getElementById('noiseMaskMode');

if (slopeMaskMode) {
  slopeMaskMode.addEventListener('change', () => {
    if (state.previewMask) {
      const min = parseInt(document.getElementById('slopeRangeMin')?.value || 60);
      const max = parseInt(document.getElementById('slopeRangeMax')?.value || 255);
      const falloff = parseInt(document.getElementById('slopeFalloff')?.value || -50);
      const mode = slopeMaskMode.value;
      const invert = document.getElementById('slopeMaskInvert')?.checked || false;
      const W = state.resizedWidth, H = state.resizedHeight;
      
      // Generate new mask pattern
      const generatedMask = new Float32Array(W * H);
      generateSlopeMask(min, max, falloff, generatedMask);
      
      // Invert if needed
      if (invert) {
        for (let i = 0; i < W * H; i++) {
          generatedMask[i] = 255 - generatedMask[i];
        }
      }
      
      // Initialize preview with current mask
      if (!state.previewMask || state.previewMask.length !== W * H) {
        state.previewMask = new Float32Array(W * H);
        if (state.mask && state.mask.length === W * H) {
          state.previewMask.set(state.mask);
        }
      }
      
      // Apply mode to preview
      if (mode === 'add') {
        for (let i = 0; i < W * H; i++) {
          state.previewMask[i] = Math.min(255, (state.mask && state.mask[i] ? state.mask[i] : 0) + generatedMask[i]);
        }
      } else { // subtract
        for (let i = 0; i < W * H; i++) {
          state.previewMask[i] = Math.max(0, (state.mask && state.mask[i] ? state.mask[i] : 0) - generatedMask[i]);
        }
      }
      
      render3DPreview();
    }
  });
}

if (noiseMaskMode) {
  noiseMaskMode.addEventListener('change', () => {
    updateNoisePreview();
  });
}

// Invert checkbox listeners
const slopeMaskInvert = document.getElementById('slopeMaskInvert');
const noiseMaskInvert = document.getElementById('noiseMaskInvert');

if (slopeMaskInvert) {
  slopeMaskInvert.addEventListener('change', () => {
    if (state.previewMask) {
      const min = parseInt(document.getElementById('slopeRangeMin')?.value || 60);
      const max = parseInt(document.getElementById('slopeRangeMax')?.value || 255);
      const falloff = parseInt(document.getElementById('slopeFalloff')?.value || -50);
      const mode = document.getElementById('slopeMaskMode')?.value || 'add';
      const invert = slopeMaskInvert.checked;
      const W = state.resizedWidth, H = state.resizedHeight;
      
      // Generate new mask pattern
      const generatedMask = new Float32Array(W * H);
      generateSlopeMask(min, max, falloff, generatedMask);
      
      // Invert if needed
      if (invert) {
        for (let i = 0; i < W * H; i++) {
          generatedMask[i] = 255 - generatedMask[i];
        }
      }
      
      // Initialize preview with current mask
      if (!state.previewMask || state.previewMask.length !== W * H) {
        state.previewMask = new Float32Array(W * H);
        if (state.mask && state.mask.length === W * H) {
          state.previewMask.set(state.mask);
        }
      }
      
      // Apply mode to preview
      if (mode === 'add') {
        for (let i = 0; i < W * H; i++) {
          state.previewMask[i] = Math.min(255, (state.mask && state.mask[i] ? state.mask[i] : 0) + generatedMask[i]);
        }
      } else { // subtract
        for (let i = 0; i < W * H; i++) {
          state.previewMask[i] = Math.max(0, (state.mask && state.mask[i] ? state.mask[i] : 0) - generatedMask[i]);
        }
      }
      
      render3DPreview();
    }
  });
}

if (noiseMaskInvert) {
  noiseMaskInvert.addEventListener('change', () => {
    updateNoisePreview();
  });
}

// Initialize undo/redo buttons
updateUndoRedoButtons();

// Initialize brush mode buttons
updateBrushModeButtons();

// Initialize skybox UI state visuals on load
updateSkyboxInfoDisplay();
updateMaxBoundsVisualization();
updateSkyboxVisualization();

