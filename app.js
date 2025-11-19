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
  genHeightMask: document.getElementById('genHeightMask'),
  genErosionMask: document.getElementById('genErosionMask'),
  maskInput: document.getElementById('maskInput'),
  brushSize: document.getElementById('brushSize'),
  brushStrength: document.getElementById('brushStrength'),
  brushPaintMode: document.getElementById('brushPaintMode'),
  brushEraseMode: document.getElementById('brushEraseMode'),
  clearMask: document.getElementById('clearMask'),
  exportMask: document.getElementById('exportMask'),
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
  heightMaskPanel: document.getElementById('heightMaskPanel'),
  erosionMaskPanel: document.getElementById('erosionMaskPanel'),
  heightMaskMode: document.getElementById('heightMaskMode'),
  heightMaskInvert: document.getElementById('heightMaskInvert'),
  heightGradientCanvas: document.getElementById('heightGradientCanvas'),
  heightGradientSelection: document.getElementById('heightGradientSelection'),
  heightSelectedStopInfo: document.getElementById('heightSelectedStopInfo'),
  heightGradientValue: document.getElementById('heightGradientValue'),
  heightGradientValueDisplay: document.getElementById('heightGradientValueDisplay'),
  heightGradientAddStop: document.getElementById('heightGradientAddStop'),
  heightGradientReset: document.getElementById('heightGradientReset'),
  heightGradientPresetSelect: document.getElementById('heightGradientPresetSelect'),
  heightGradientLoadPreset: document.getElementById('heightGradientLoadPreset'),
  heightGradientDeletePreset: document.getElementById('heightGradientDeletePreset'),
  heightGradientPresetName: document.getElementById('heightGradientPresetName'),
  heightGradientSavePreset: document.getElementById('heightGradientSavePreset'),
  maskLivePreview: document.getElementById('maskLivePreview'),
  maskBlendModal: document.getElementById('maskBlendModal'),
  maskBlendOverlay: document.getElementById('maskBlendOverlay'),
  maskBlendFilename: document.getElementById('maskBlendFilename'),
  maskBlendRotation: document.getElementById('maskBlendRotation'),
  maskBlendRotationValue: document.getElementById('maskBlendRotationValue'),
  maskBlendAdd: document.getElementById('maskBlendAdd'),
  maskBlendSubtract: document.getElementById('maskBlendSubtract'),
  maskBlendIntersect: document.getElementById('maskBlendIntersect'),
  maskBlendOverride: document.getElementById('maskBlendOverride'),
  maskBlendCancel: document.getElementById('maskBlendCancel'),
  // Vis Optimisation elements
  tabVisOptimisation: document.getElementById('tabVisOptimisation'),
  visGridDensity: document.getElementById('visGridDensity'),
  visIterations: document.getElementById('visIterations'),
  visOptimisationInfo: document.getElementById('visOptimisationInfo'),
  generateVisBlocks: document.getElementById('generateVisBlocks'),
  generateVisBlocksText: document.getElementById('generateVisBlocksText'),
  generateVisBlocksSpinner: document.getElementById('generateVisBlocksSpinner'),
  cancelVisBlocks: document.getElementById('cancelVisBlocks'),
  showVisBlocks: document.getElementById('showVisBlocks'),
  // Terrain editor elements
  editTerrainBtn: document.getElementById('editTerrainBtn'),
  terrainNormalMode: document.getElementById('terrainNormalMode'),
  terrainEditMode: document.getElementById('terrainEditMode'),
  terrainEditBlurBtn: document.getElementById('terrainEditBlurBtn'),
  terrainEditErosionBtn: document.getElementById('terrainEditErosionBtn'),
  exitTerrainEditBtn: document.getElementById('exitTerrainEditBtn'),
  terrainEditorPanel: document.getElementById('terrainEditorPanel'),
  terrainEditorTitle: document.getElementById('terrainEditorTitle'),
  closeTerrainEditor: document.getElementById('closeTerrainEditor'),
  blurTerrainPanel: document.getElementById('blurTerrainPanel'),
  erosionTerrainPanel: document.getElementById('erosionTerrainPanel'),
  blurRadius: document.getElementById('blurRadius'),
  blurRadiusValue: document.getElementById('blurRadiusValue'),
  blurIterations: document.getElementById('blurIterations'),
  blurIterationsValue: document.getElementById('blurIterationsValue'),
  applyBlurTerrain: document.getElementById('applyBlurTerrain'),
  erosionTerrainSeed: document.getElementById('erosionTerrainSeed'),
  erosionTerrainDroplets: document.getElementById('erosionTerrainDroplets'),
  erosionTerrainDropletsValue: document.getElementById('erosionTerrainDropletsValue'),
  erosionTerrainMaxSteps: document.getElementById('erosionTerrainMaxSteps'),
  erosionTerrainMaxStepsValue: document.getElementById('erosionTerrainMaxStepsValue'),
  erosionTerrainRadius: document.getElementById('erosionTerrainRadius'),
  erosionTerrainRadiusValue: document.getElementById('erosionTerrainRadiusValue'),
  erosionTerrainInertia: document.getElementById('erosionTerrainInertia'),
  erosionTerrainInertiaValue: document.getElementById('erosionTerrainInertiaValue'),
  erosionTerrainCapacity: document.getElementById('erosionTerrainCapacity'),
  erosionTerrainCapacityValue: document.getElementById('erosionTerrainCapacityValue'),
  erosionTerrainDeposition: document.getElementById('erosionTerrainDeposition'),
  erosionTerrainDepositionValue: document.getElementById('erosionTerrainDepositionValue'),
  erosionTerrainErosionRate: document.getElementById('erosionTerrainErosionRate'),
  erosionTerrainErosionRateValue: document.getElementById('erosionTerrainErosionRateValue'),
  erosionTerrainEvaporation: document.getElementById('erosionTerrainEvaporation'),
  erosionTerrainEvaporationValue: document.getElementById('erosionTerrainEvaporationValue'),
  erosionTerrainGravity: document.getElementById('erosionTerrainGravity'),
  erosionTerrainGravityValue: document.getElementById('erosionTerrainGravityValue'),
  erosionTerrainMinSlope: document.getElementById('erosionTerrainMinSlope'),
  erosionTerrainMinSlopeValue: document.getElementById('erosionTerrainMinSlopeValue'),
  applyErosionTerrain: document.getElementById('applyErosionTerrain')
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
  previewHeightmap: null,        // Float32Array [h*w], temporary preview heightmap for terrain editing
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
  heightGradientStops: null,
  heightSelectedStopId: null,
  heightDraggingStopId: null,
  heightDraggingPointerId: null,
  heightPresets: [],
  // Skybox state
  skybox: {
    enabled: false,
    topOffset: 2048,
    maxMapSize: 32766,           // 32768 - 2 (1 unit buffer each side)
    maxSkyboxSize: 32768,
    maxBoundsVisible: false,
    skyboxBoundsVisible: false
  },
  // Vis Optimisation state
  visBlocks: null,               // Array of optimized blocks after greedy meshing
  visMeshCancelled: false        // Flag to cancel greedy mesh operation
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
let strokePreSnapshotSaved = false; // Track if we've saved pre-stroke state for current stroke

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
  // Live preview: render on every brush stroke to reflect changes immediately
  render3DPreview();
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

const HEIGHT_PRESET_STORAGE_KEY = 'dispgen_height_gradient_presets_v1';

let heightGradientStopCounter = 0;

function loadHeightGradientPresets() {
  let presets = [];
  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(HEIGHT_PRESET_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          presets = parsed;
        }
      }
    } catch {
      // Ignore parsing/storage errors
    }
  }
  const sanitized = [];
  if (Array.isArray(presets)) {
    for (const entry of presets) {
      if (!entry || typeof entry !== 'object') continue;
      const name = typeof entry.name === 'string' ? entry.name.trim().slice(0, 64) : '';
      if (!name) continue;
      const stops = Array.isArray(entry.stops) ? entry.stops.map((stop) => ({
        position: clamp01(typeof stop?.position === 'number' ? stop.position : parseFloat(stop?.position ?? 0)),
        value: clamp01(typeof stop?.value === 'number' ? stop.value : parseFloat(stop?.value ?? 0))
      })) : [];
      if (stops.length < 2) continue;
      sanitized.push({ name, stops });
    }
  }
  state.heightPresets = sanitized;
  syncHeightPresetSelect();
}

function persistHeightGradientPresets() {
  if (typeof localStorage === 'undefined') return;
  try {
    const serialized = JSON.stringify(state.heightPresets ?? []);
    localStorage.setItem(HEIGHT_PRESET_STORAGE_KEY, serialized);
  } catch {
    // Ignore storage errors
  }
}

function syncHeightPresetSelect(forcedSelection = null) {
  if (!el.heightGradientPresetSelect) return;
  const select = el.heightGradientPresetSelect;
  const presets = Array.isArray(state.heightPresets) ? state.heightPresets : [];
  const previousValue = forcedSelection !== null ? forcedSelection : select.value;
  select.innerHTML = '';
  
  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = presets.length ? 'Choose preset' : 'No presets saved';
  select.appendChild(placeholder);
  
  for (const preset of presets) {
    const option = document.createElement('option');
    option.value = preset.name;
    option.textContent = preset.name;
    select.appendChild(option);
  }
  
  if (previousValue && presets.some((preset) => preset.name === previousValue)) {
    select.value = previousValue;
  } else {
    select.value = '';
  }
  
  updateHeightPresetButtons();
}

function updateHeightPresetButtons() {
  const hasSelection = !!el.heightGradientPresetSelect?.value;
  if (el.heightGradientLoadPreset) {
    el.heightGradientLoadPreset.disabled = !hasSelection;
  }
  if (el.heightGradientDeletePreset) {
    el.heightGradientDeletePreset.disabled = !hasSelection;
  }
}

function saveHeightGradientPreset(name) {
  const trimmed = name.trim().slice(0, 64);
  if (!trimmed) return false;
  const stops = getHeightGradientStopsSorted().map((stop) => ({
    position: clamp01(stop.position),
    value: clamp01(stop.value)
  }));
  if (stops.length < 2) return false;
  const presets = Array.isArray(state.heightPresets) ? [...state.heightPresets] : [];
  const index = presets.findIndex((preset) => preset.name.toLowerCase() === trimmed.toLowerCase());
  const payload = { name: trimmed, stops };
  if (index >= 0) {
    presets[index] = payload;
  } else {
    presets.push(payload);
  }
  presets.sort((a, b) => a.name.localeCompare(b.name));
  state.heightPresets = presets;
  persistHeightGradientPresets();
  syncHeightPresetSelect(trimmed);
  return true;
}

function loadHeightGradientPreset(name) {
  if (!name) return false;
  const presets = Array.isArray(state.heightPresets) ? state.heightPresets : [];
  const preset = presets.find((entry) => entry.name === name);
  if (!preset || !Array.isArray(preset.stops) || preset.stops.length < 2) return false;
  const mappedStops = preset.stops.map((stop) => createHeightGradientStop(
    clamp01(typeof stop.position === 'number' ? stop.position : parseFloat(stop.position ?? 0)),
    clamp01(typeof stop.value === 'number' ? stop.value : parseFloat(stop.value ?? 0))
  ));
  if (mappedStops.length < 2) return false;
  state.heightGradientStops = mappedStops;
  ensureHeightGradientState();
  state.heightSelectedStopId = state.heightGradientStops[0]?.id ?? null;
  renderHeightGradientCanvas();
  renderHeightGradientUI();
  if (el.heightGradientPresetSelect) {
    el.heightGradientPresetSelect.value = name;
  }
  updateHeightPresetButtons();
  updateHeightMaskPreview();
  return true;
}

function deleteHeightGradientPreset(name) {
  if (!name) return false;
  const presets = Array.isArray(state.heightPresets) ? [...state.heightPresets] : [];
  const next = presets.filter((preset) => preset.name !== name);
  if (next.length === presets.length) return false;
  state.heightPresets = next;
  persistHeightGradientPresets();
  syncHeightPresetSelect('');
  return true;
}

function createHeightGradientStop(position, value) {
  heightGradientStopCounter += 1;
  return {
    id: heightGradientStopCounter,
    position: clamp01(position),
    value: clamp01(value)
  };
}

function ensureHeightGradientState() {
  if (!Array.isArray(state.heightGradientStops) || state.heightGradientStops.length < 2) {
    state.heightGradientStops = [
      createHeightGradientStop(0, 1),
      createHeightGradientStop(1, 0)
    ];
  } else {
    state.heightGradientStops = state.heightGradientStops.map((stop) => ({
      id: stop.id ?? createHeightGradientStop(stop.position ?? 0, stop.value ?? 0).id,
      position: clamp01(stop.position ?? 0),
      value: clamp01(stop.value ?? 0)
    }));
  }
  state.heightGradientStops.sort((a, b) => a.position - b.position);
  if (!state.heightSelectedStopId || !state.heightGradientStops.some((stop) => stop.id === state.heightSelectedStopId)) {
    state.heightSelectedStopId = state.heightGradientStops[0]?.id ?? null;
  }
  return state.heightGradientStops;
}

function getHeightGradientStopsSorted() {
  return [...ensureHeightGradientState()];
}

function getSelectedHeightStop() {
  const stops = ensureHeightGradientState();
  let selected = stops.find((stop) => stop.id === state.heightSelectedStopId);
  if (!selected && stops.length) {
    state.heightSelectedStopId = stops[0].id;
    selected = stops[0];
  }
  return selected ?? null;
}

function setSelectedHeightStop(stopId, { rerender = true } = {}) {
  const stops = ensureHeightGradientState();
  if (stopId && stops.some((stop) => stop.id === stopId)) {
    state.heightSelectedStopId = stopId;
  }
  if (rerender) {
    renderHeightGradientCanvas();
    renderHeightGradientUI();
  }
}

function sampleHeightGradientValue(stops, t) {
  if (!stops.length) return 0;
  if (t <= stops[0].position) return stops[0].value;
  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i];
    const b = stops[i + 1];
    if (t <= b.position) {
      const span = Math.max(1e-6, b.position - a.position);
      const u = (t - a.position) / span;
      return a.value + (b.value - a.value) * u;
    }
  }
  return stops[stops.length - 1].value;
}

function generateHeightMask(stops = null, outputMask = null) {
  if (!state.heightmap) return null;
  const W = state.resizedWidth;
  const H = state.resizedHeight;
  if (!W || !H) return null;
  const total = W * H;
  
  let out = outputMask;
  if (!out || out.length !== total) {
    out = new Float32Array(total);
  }
  
  const gradientStops = stops ? [...stops] : getHeightGradientStopsSorted();
  if (!gradientStops.length) {
    out.fill(0);
    return out;
  }
  
  gradientStops.sort((a, b) => a.position - b.position);
  const lut = new Float32Array(256);
  for (let i = 0; i < 256; i++) {
    const t = i / 255;
    lut[i] = clamp01(sampleHeightGradientValue(gradientStops, t)) * 255;
  }
  
  const hm = state.heightmap;
  for (let i = 0; i < total; i++) {
    const h = hm[i];
    const lutIndex = Math.max(0, Math.min(255, Math.round(h)));
    out[i] = lut[lutIndex];
  }
  
  return out;
}

function renderHeightGradientCanvas() {
  if (!el.heightGradientCanvas) return;
  const ctx = el.heightGradientCanvas.getContext('2d');
  if (!ctx) return;
  const { width, height } = el.heightGradientCanvas;
  ctx.clearRect(0, 0, width, height);
  
  const stops = getHeightGradientStopsSorted();
  if (!stops.length) {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);
    return;
  }
  
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, width, height);
  
  const barTop = height * 0.32;
  const barHeight = height * 0.36;
  const gradient = ctx.createLinearGradient(0, 0, width, 0);
  for (const stop of stops) {
    const v = clamp01(stop.value);
    const c = Math.round(v * 255);
    gradient.addColorStop(clamp01(stop.position), `rgb(${c},${c},${c})`);
  }
  ctx.fillStyle = gradient;
  ctx.fillRect(0, barTop, width, barHeight);
  
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, barTop);
  ctx.lineTo(width, barTop);
  ctx.moveTo(0, barTop + barHeight);
  ctx.lineTo(width, barTop + barHeight);
  ctx.stroke();
  
  const selectedId = state.heightSelectedStopId;
  for (const stop of stops) {
    const x = clamp01(stop.position) * width;
    const valueColor = Math.round(clamp01(stop.value) * 255);
    const isSelected = stop.id === selectedId;
    ctx.lineWidth = isSelected ? 3 : 2;
    ctx.strokeStyle = isSelected ? 'rgba(167, 139, 250, 0.95)' : 'rgba(129, 140, 248, 0.6)';
    ctx.beginPath();
    ctx.moveTo(x, barTop - 8);
    ctx.lineTo(x, barTop + barHeight + 8);
    ctx.stroke();
    
    ctx.fillStyle = `rgb(${valueColor},${valueColor},${valueColor})`;
    ctx.beginPath();
    ctx.arc(x, barTop + barHeight / 2, isSelected ? 6 : 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = isSelected ? 2.2 : 1.6;
    ctx.strokeStyle = isSelected ? 'rgba(139, 92, 246, 0.9)' : 'rgba(30, 64, 175, 0.8)';
    ctx.stroke();
  }
}

function renderHeightGradientUI() {
  if (!el.heightGradientSelection) return;
  const stops = getHeightGradientStopsSorted();
  const selected = getSelectedHeightStop();
  updateHeightPresetButtons();
  
  if (!selected || !el.heightGradientValue || !el.heightSelectedStopInfo || !el.heightGradientValueDisplay) {
    if (el.heightSelectedStopInfo) {
      el.heightSelectedStopInfo.textContent = 'None';
    }
    if (el.heightGradientValue) {
      el.heightGradientValue.disabled = true;
      el.heightGradientValue.value = '0';
    }
    if (el.heightGradientValueDisplay) {
      el.heightGradientValueDisplay.textContent = '0.00';
    }
    return;
  }
  
  el.heightGradientValue.disabled = false;
  el.heightGradientValue.value = (selected.value * 100).toString();
  el.heightGradientValueDisplay.textContent = selected.value.toFixed(2);
  const positionPercent = (selected.position * 100).toFixed(1);
  el.heightSelectedStopInfo.textContent = `Pos ${positionPercent}%`;
  
  if (stops.length <= 2) {
    el.heightGradientSelection.classList.add('opacity-90');
  } else {
    el.heightGradientSelection.classList.remove('opacity-90');
  }
  updateHeightPresetButtons();
}

function updateHeightGradientStop(stopId, updates) {
  ensureHeightGradientState();
  let modified = false;
  state.heightGradientStops = state.heightGradientStops.map((stop) => {
    if (stop.id !== stopId) return stop;
    const updated = { ...stop };
    if (updates.position !== undefined) {
      updated.position = clamp01(updates.position);
    }
    if (updates.value !== undefined) {
      updated.value = clamp01(updates.value);
    }
    modified = true;
    return updated;
  });
  if (!modified) return;
  state.heightGradientStops.sort((a, b) => a.position - b.position);
  renderHeightGradientCanvas();
  renderHeightGradientUI();
  updateHeightMaskPreview();
}

function addHeightGradientStop(position = null) {
  const stops = getHeightGradientStopsSorted();
  if (!stops.length) {
    state.heightGradientStops = [
      createHeightGradientStop(0, 0),
      createHeightGradientStop(1, 1)
    ];
    ensureHeightGradientState();
    renderHeightGradientCanvas();
    renderHeightGradientUI();
    updateHeightMaskPreview();
    return;
  }
  
  let insertPosition = position;
  let insertValue;
  
  if (insertPosition === null || insertPosition === undefined) {
    let largestGap = -1;
    for (let i = 0; i < stops.length - 1; i++) {
      const a = stops[i];
      const b = stops[i + 1];
      const gap = b.position - a.position;
      if (gap > largestGap) {
        largestGap = gap;
        insertPosition = clamp01(a.position + gap / 2);
      }
    }
    insertValue = clamp01(sampleHeightGradientValue(stops, insertPosition ?? 0.5));
  } else {
    insertPosition = clamp01(insertPosition);
    insertValue = clamp01(sampleHeightGradientValue(stops, insertPosition));
  }
  
  const newStop = createHeightGradientStop(insertPosition ?? 0.5, insertValue ?? 0.5);
  state.heightGradientStops = [...stops, newStop];
  state.heightGradientStops.sort((a, b) => a.position - b.position);
  state.heightSelectedStopId = newStop.id;
  renderHeightGradientCanvas();
  renderHeightGradientUI();
  updateHeightMaskPreview();
}

function resetHeightGradientStops() {
  state.heightGradientStops = [
    createHeightGradientStop(0, 1),
    createHeightGradientStop(1, 0)
  ];
  ensureHeightGradientState();
  state.heightSelectedStopId = state.heightGradientStops[0]?.id ?? null;
  renderHeightGradientCanvas();
  renderHeightGradientUI();
  updateHeightMaskPreview();
}

function removeSelectedHeightStop() {
  const stops = getHeightGradientStopsSorted();
  if (stops.length <= 2) return false;
  const selected = getSelectedHeightStop();
  if (!selected) return false;
  const index = stops.findIndex((stop) => stop.id === selected.id);
  if (index <= 0 || index >= stops.length - 1) return false;
  
  state.heightGradientStops = state.heightGradientStops.filter((stop) => stop.id !== selected.id);
  ensureHeightGradientState();
  const nextStops = getHeightGradientStopsSorted();
  const nextIndex = Math.min(index, nextStops.length - 1);
  state.heightSelectedStopId = nextStops[nextIndex]?.id ?? nextStops[nextStops.length - 1]?.id ?? null;
  
  renderHeightGradientCanvas();
  renderHeightGradientUI();
  updateHeightMaskPreview();
  return true;
}

function heightCanvasPositionFromEvent(event) {
  if (!el.heightGradientCanvas) return null;
  const rect = el.heightGradientCanvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const position = clamp01(x / Math.max(1, rect.width));
  return { x, width: rect.width, position };
}

function handleHeightCanvasPointerDown(event) {
  if (!el.heightGradientCanvas) return;
  const metrics = heightCanvasPositionFromEvent(event);
  if (!metrics) return;
  
  const stops = getHeightGradientStopsSorted();
  let closestStop = null;
  let closestDistance = Infinity;
  for (const stop of stops) {
    const distance = Math.abs(stop.position - metrics.position) * metrics.width;
    if (distance < closestDistance) {
      closestDistance = distance;
      closestStop = stop;
    }
  }
  
  const thresholdPx = 12;
  if (closestStop && closestDistance <= thresholdPx) {
    setSelectedHeightStop(closestStop.id);
    state.heightDraggingStopId = closestStop.id;
    state.heightDraggingPointerId = event.pointerId;
    el.heightGradientCanvas.setPointerCapture(event.pointerId);
  }
}

function handleHeightCanvasPointerMove(event) {
  if (!el.heightGradientCanvas) return;
  if (!state.heightDraggingStopId) return;
  if (state.heightDraggingPointerId !== null && state.heightDraggingPointerId !== event.pointerId) return;
  
  const metrics = heightCanvasPositionFromEvent(event);
  if (!metrics) return;
  
  const stops = getHeightGradientStopsSorted();
  const index = stops.findIndex((stop) => stop.id === state.heightDraggingStopId);
  if (index === -1) return;
  const epsilon = 0.0005;
  const minPos = index === 0 ? 0 : stops[index - 1].position + epsilon;
  const maxPos = index === stops.length - 1 ? 1 : stops[index + 1].position - epsilon;
  const clamped = Math.max(minPos, Math.min(maxPos, metrics.position));
  
  updateHeightGradientStop(state.heightDraggingStopId, { position: clamped });
}

function stopHeightCanvasDrag(event) {
  if (!el.heightGradientCanvas) return;
  if (state.heightDraggingPointerId !== null && event && state.heightDraggingPointerId !== event.pointerId) {
    return;
  }
  if (state.heightDraggingPointerId !== null) {
    try {
      el.heightGradientCanvas.releasePointerCapture(state.heightDraggingPointerId);
    } catch {
      // Ignore if pointer capture already lost
    }
  }
  state.heightDraggingStopId = null;
  state.heightDraggingPointerId = null;
}

function handleHeightCanvasPointerUp(event) {
  stopHeightCanvasDrag(event);
}

function handleHeightCanvasPointerLeave(event) {
  stopHeightCanvasDrag(event);
}

function handleHeightCanvasDoubleClick(event) {
  if (!el.heightGradientCanvas) return;
  const metrics = heightCanvasPositionFromEvent(event);
  if (!metrics) return;
  addHeightGradientStop(metrics.position);
}

function updateHeightMaskPreview() {
  if (!state.heightmap) return;
  const W = state.resizedWidth;
  const H = state.resizedHeight;
  if (!W || !H) return;
  
  const mode = el.heightMaskMode?.value || 'add';
  const invert = !!el.heightMaskInvert?.checked;
  const stops = getHeightGradientStopsSorted();
  if (!stops.length) return;
  
  const generatedMask = new Float32Array(W * H);
  generateHeightMask(stops, generatedMask);
  
  if (invert) {
    for (let i = 0; i < generatedMask.length; i++) {
      generatedMask[i] = 255 - generatedMask[i];
    }
  }
  
  if (!state.previewMask || state.previewMask.length !== W * H) {
    state.previewMask = new Float32Array(W * H);
  }
  
  const baseMask = (state.mask && state.mask.length === W * H) ? state.mask : null;
  for (let i = 0; i < generatedMask.length; i++) {
    const base = baseMask ? baseMask[i] : 0;
    if (mode === 'add') {
      state.previewMask[i] = Math.min(255, base + generatedMask[i]);
    } else if (mode === 'subtract') {
      state.previewMask[i] = Math.max(0, base - generatedMask[i]);
    } else if (mode === 'intersect') {
      state.previewMask[i] = Math.min(base, generatedMask[i]);
    }
  }
  
  render3DPreview();
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
  } else if (blendMode === 'intersect') {
    for (let i = 0; i < len; i++) {
      // Intersection: take the minimum of both masks
      state.mask[i] = Math.min(state.mask[i], maskData[i]);
    }
  }

  if (pending.previousSnapshot && state.maskHistory.length === 0) {
    pushMaskHistorySnapshot(pending.previousSnapshot);
  }

  saveMaskState();
  render3DPreview();
  cancelPendingMaskImport();
  updateExportMaskButton();
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
    skyboxLines: null,
    visBlocksLines: null
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
  // Save the pre-stroke snapshot so the first action is undoable
  if (!strokePreSnapshotSaved) {
    saveMaskState();
    strokePreSnapshotSaved = true;
  }
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
  strokePreSnapshotSaved = false;
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

  // Vis blocks visualization
  if (state.three.visBlocksLines) {
    scene.remove(state.three.visBlocksLines);
    state.three.visBlocksLines.geometry.dispose();
    state.three.visBlocksLines.material.dispose();
    state.three.visBlocksLines = null;
  }

  if (el.showVisBlocks && el.showVisBlocks.checked && state.visBlocks && state.visBlocks.length > 0) {
    const visLineMat = new THREE.LineBasicMaterial({
      color: new THREE.Color(0x4043A3),
      depthTest: true,
      depthWrite: false,
      transparent: true,
      opacity: 0.8
    });

    // Create edges for all vis blocks
    const positions = [];
    const indices = [];
    let vertexOffset = 0;

    for (const block of state.visBlocks) {
      const halfX = block.widthX / 2;
      const halfY = block.widthY / 2;
      const halfZ = block.widthZ / 2;
      const centerX = block.x + halfX;
      const centerY = block.y + halfY;
      const centerZ = block.z + halfZ;

      // 8 corners of the box
      const corners = [
        [centerX - halfX, centerY - halfY, centerZ - halfZ], // 0
        [centerX + halfX, centerY - halfY, centerZ - halfZ], // 1
        [centerX + halfX, centerY + halfY, centerZ - halfZ], // 2
        [centerX - halfX, centerY + halfY, centerZ - halfZ], // 3
        [centerX - halfX, centerY - halfY, centerZ + halfZ], // 4
        [centerX + halfX, centerY - halfY, centerZ + halfZ], // 5
        [centerX + halfX, centerY + halfY, centerZ + halfZ], // 6
        [centerX - halfX, centerY + halfY, centerZ + halfZ]  // 7
      ];

      // Add vertices
      for (const corner of corners) {
        positions.push(corner[0], corner[1], corner[2]);
      }

      // Add edges (12 edges per box)
      const edgePairs = [
        [0, 1], [1, 2], [2, 3], [3, 0], // bottom face
        [4, 5], [5, 6], [6, 7], [7, 4], // top face
        [0, 4], [1, 5], [2, 6], [3, 7]  // vertical edges
      ];

      for (const [a, b] of edgePairs) {
        indices.push(vertexOffset + a, vertexOffset + b);
      }

      vertexOffset += 8;
    }

    const visGeom = new THREE.BufferGeometry();
    visGeom.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
    visGeom.setIndex(indices);
    const visLines = new THREE.LineSegments(visGeom, visLineMat);
    visLines.renderOrder = 1; // Render after mesh
    scene.add(visLines);
    state.three.visBlocksLines = visLines;
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

  // Add vis blocks if they exist
  if (state.visBlocks && state.visBlocks.length > 0) {
    const visMaterial = 'dev/dev_blendmeasure';
    for (const block of state.visBlocks) {
      const origin = new Vertex(
        block.x + block.widthX / 2,
        block.y + block.widthY / 2,
        block.z + block.widthZ / 2
      );
      const dimensions = [block.widthX, block.widthY, block.widthZ];
      const visBlock = new Block(origin, dimensions, visMaterial);
      // Set lightmapscale to 1024 on all sides
      for (let i = 0; i < 6; i++) {
        visBlock.brush.children[i].lightmapscale = 1024;
      }
      map.world.children.push(visBlock);
    }
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
    // Enable vis optimisation button
    if (el.generateVisBlocks) {
      el.generateVisBlocks.disabled = false;
    }
    // Enable terrain editor button
    if (el.editTerrainBtn) {
      el.editTerrainBtn.disabled = false;
    }
    updateTabStates(); // Enable Material, Skybox, and Visibility tabs
    render3DPreview();
    updateSkyboxInfoDisplay();
    updateSkyboxVisualization();
    updateExportMaskButton();
  } catch (err) {
    alert('Failed to load heightmap: ' + err);
  }
});

// Helper function to check if mask has been modified (contains non-zero values)
function hasMaskBeenModified() {
  if (!state.mask) return false;
  for (let i = 0; i < state.mask.length; i++) {
    if (state.mask[i] !== 0) return true;
  }
  return false;
}

// Helper function to clear mask and reset history
function clearMaskIfModified() {
  if (hasMaskBeenModified()) {
    if (state.mask) state.mask.fill(0);
    // Reset mask history since the mask is now invalid
    state.maskHistory = [];
    state.maskHistoryIndex = -1;
    updateUndoRedoButtons();
    updateExportMaskButton();
    // Re-render preview to remove mask overlay
    if (state.heightmap) render3DPreview();
  }
}

for (const id of ['tilesX','tilesY','tileSize','maxHeight']) {
  el[id].addEventListener('input', () => {
    clampMapDimensionsIfNeeded();
    // Clear mask if it was modified, since terrain parameters changed
    clearMaskIfModified();
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

// Vis Optimisation event listeners
if (el.generateVisBlocks) {
  el.generateVisBlocks.addEventListener('click', generateVisBlocks);
}

if (el.cancelVisBlocks) {
  el.cancelVisBlocks.addEventListener('click', cancelVisBlocks);
}

if (el.showVisBlocks) {
  el.showVisBlocks.addEventListener('change', () => {
    if (state.heightmap) render3DPreview();
  });
}

// Initial label
updateDimensionsLabel();

// ------------------------ Vis Optimisation ------------------------

/**
 * 3D Rasterize the terrain area and keep only cells fully below the terrain
 * Returns a 3D array where true means the cell is fully below terrain
 */
function rasterizeTerrain3D(gridDensity) {
  if (!state.heightmap) return null;
  
  const W = state.resizedWidth;
  const H = state.resizedHeight;
  const numTilesX = parseInt(el.tilesX.value, 10);
  const numTilesY = parseInt(el.tilesY.value, 10);
  const tileSize = parseInt(el.tileSize.value, 10);
  const maxHeight = parseInt(el.maxHeight.value, 10);
  
  const totalWidth = numTilesX * tileSize;
  const totalDepth = numTilesY * tileSize;
  
  // Calculate grid dimensions
  const gridSizeX = Math.ceil(totalWidth / gridDensity);
  const gridSizeY = Math.ceil(totalDepth / gridDensity);
  const gridSizeZ = Math.ceil(maxHeight / gridDensity);
  
  // Create 3D grid (x, y, z)
  const grid = new Array(gridSizeX);
  for (let x = 0; x < gridSizeX; x++) {
    grid[x] = new Array(gridSizeY);
    for (let y = 0; y < gridSizeY; y++) {
      grid[x][y] = new Array(gridSizeZ).fill(false);
    }
  }
  
  // Convert world coordinates to heightmap pixel coordinates
  // Terrain is centered at origin, so:
  // World X: [-totalWidth/2, totalWidth/2] -> Heightmap X: [0, W-1]
  // World Y: [-totalDepth/2, totalDepth/2] -> Heightmap Y: [0, H-1]
  const worldToHeightmapX = (worldX) => {
    const normalizedX = (worldX + totalWidth / 2) / totalWidth;
    return normalizedX * (W - 1);
  };
  const worldToHeightmapY = (worldY) => {
    const normalizedY = (worldY + totalDepth / 2) / totalDepth;
    return normalizedY * (H - 1);
  };
  
  // For each grid cell, check if all 8 corners are below terrain
  for (let gx = 0; gx < gridSizeX; gx++) {
    for (let gy = 0; gy < gridSizeY; gy++) {
      for (let gz = 0; gz < gridSizeZ; gz++) {
        // Calculate world position of cell center
        const worldX = (gx + 0.5) * gridDensity - totalWidth / 2;
        const worldY = (gy + 0.5) * gridDensity - totalDepth / 2;
        const worldZ = (gz + 0.5) * gridDensity;
        
        // Check all 8 corners of the cell and additionally sample along each cube edge
        // to avoid "leaking" where terrain dips between corners.
        const cellHalfSize = gridDensity / 2;
        // Add a small margin so vis blocks stay some distance beneath the terrain surface.
        // This prevents blocks that touch the terrain from being generated; margin is in world units.
        const visBlockMargin = 16;
        let allBelow = true;

        // Define the 8 cube corner offsets
        const cornerOffsets = [
          [-1, -1, -1],
          [ 1, -1, -1],
          [-1,  1, -1],
          [ 1,  1, -1],
          [-1, -1,  1],
          [ 1, -1,  1],
          [-1,  1,  1],
          [ 1,  1,  1]
        ];

        // Helper to sample terrain Z at world X,Y
        const sampleTerrainZ = (x, y) => {
          const hmX = worldToHeightmapX(x);
          const hmY = worldToHeightmapY(y);
          const terrainHeight = bilinearSample(state.heightmap, W, H, hmX, hmY);
          return (terrainHeight / 255.0) * maxHeight;
        };

        // First check corners
        for (const off of cornerOffsets) {
          const cornerX = worldX + off[0] * cellHalfSize;
          const cornerY = worldY + off[1] * cellHalfSize;
          const cornerZ = worldZ + off[2] * cellHalfSize;
          const terrainZ = sampleTerrainZ(cornerX, cornerY);
          // Ensure the corner is at least `visBlockMargin` units below the terrain.
          if (cornerZ + visBlockMargin >= terrainZ) {
            allBelow = false;
            break;
          }
        }

        // If corners are below terrain, additionally sample along each of the 12 edges.
        // Sample N points per edge (including endpoints) to ensure edges are submerged.
        if (allBelow) {
          const edgeSampleCount = 5;
          // Build edges by pairing corner indices that differ by exactly one axis
          const edges = [];
          for (let i = 0; i < cornerOffsets.length; i++) {
            for (let j = i + 1; j < cornerOffsets.length; j++) {
              const a = cornerOffsets[i];
              const b = cornerOffsets[j];
              // Count axis differences
              let diffCount = 0;
              for (let k = 0; k < 3; k++) if (a[k] !== b[k]) diffCount++;
              if (diffCount === 1) edges.push([a, b]);
            }
          }

          // For each edge, sample evenly along the edge
          outerEdgeLoop:
          for (const [a, b] of edges) {
            for (let s = 0; s < edgeSampleCount; s++) {
              const t = s / (edgeSampleCount - 1); // 0..1
              const sampleX = worldX + ((1 - t) * a[0] + t * b[0]) * cellHalfSize;
              const sampleY = worldY + ((1 - t) * a[1] + t * b[1]) * cellHalfSize;
              const sampleZ = worldZ + ((1 - t) * a[2] + t * b[2]) * cellHalfSize;

              const terrainZ = sampleTerrainZ(sampleX, sampleY);
              // Ensure the sampled edge point is at least `visBlockMargin` units below the terrain.
              if (sampleZ + visBlockMargin >= terrainZ) {
                allBelow = false;
                break outerEdgeLoop;
              }
            }
          }
        }
        
        grid[gx][gy][gz] = allBelow;
      }
    }
  }
  
  return { grid, gridSizeX, gridSizeY, gridSizeZ, gridDensity };
}

/**
 * Helper function to yield control to the browser
 */
function yieldToBrowser() {
  return new Promise(resolve => setTimeout(resolve, 0));
}

/**
 * Greedy mesh algorithm using iterative random approach (async with cancellation)
 * Returns array of optimized blocks: { x, y, z, widthX, widthY, widthZ }
 */
async function greedyMesh(rasterData, iterations) {
  if (!rasterData) return [];
  
  const { grid, gridSizeX, gridSizeY, gridSizeZ, gridDensity } = rasterData;
  
  // Get world coordinate offsets
  const numTilesX = parseInt(el.tilesX.value, 10);
  const numTilesY = parseInt(el.tilesY.value, 10);
  const tileSize = parseInt(el.tileSize.value, 10);
  const totalWidth = numTilesX * tileSize;
  const totalDepth = numTilesY * tileSize;
  const worldOffsetX = -totalWidth / 2;
  const worldOffsetY = -totalDepth / 2;
  
  // Cache for seeds and their block counts
  const seedResults = [];
  
  // Process each Z layer separately
  for (let z = 0; z < gridSizeZ; z++) {
    // Check for cancellation
    if (state.visMeshCancelled) break;
    
    // Create a 2D mask for this layer (true = solid, false = empty)
    const layer = new Array(gridSizeX);
    for (let x = 0; x < gridSizeX; x++) {
      layer[x] = new Array(gridSizeY).fill(false);
      for (let y = 0; y < gridSizeY; y++) {
        layer[x][y] = grid[x][y][z];
      }
    }
    
    // Get list of all solid voxels in this layer
    const solidVoxels = [];
    for (let x = 0; x < gridSizeX; x++) {
      for (let y = 0; y < gridSizeY; y++) {
        if (layer[x][y]) {
          solidVoxels.push({ x, y });
        }
      }
    }
    
    if (solidVoxels.length === 0) continue;
    
    // Try different seeds
    for (let iter = 0; iter < iterations; iter++) {
      // Check for cancellation
      if (state.visMeshCancelled) break;
      
      // Yield control periodically to allow UI updates and cancellation checks
      if (iter % 10 === 0) {
        await yieldToBrowser();
      }
      
      const seed = iter;
      const random = createSeededRandom(seed);
      const processed = new Array(gridSizeX);
      for (let x = 0; x < gridSizeX; x++) {
        processed[x] = new Array(gridSizeY).fill(false);
      }
      
      const blocks = [];
      const remainingVoxels = [...solidVoxels];
      
      // Process until all voxels are covered
      while (remainingVoxels.length > 0) {
        // Check for cancellation
        if (state.visMeshCancelled) break;
        
        // Choose a random remaining voxel
        const randomIndex = Math.floor(random() * remainingVoxels.length);
        const startVoxel = remainingVoxels[randomIndex];
        
        if (processed[startVoxel.x][startVoxel.y]) {
          // Remove processed voxels from the list
          remainingVoxels.splice(randomIndex, 1);
          continue;
        }
        
        // Start expanding from this voxel
        let minX = startVoxel.x;
        let maxX = startVoxel.x;
        let minY = startVoxel.y;
        let maxY = startVoxel.y;
        
        let canExpand = true;
        while (canExpand) {
          canExpand = false;
          
          // Try to expand in all 4 directions
          const directions = [
            { dx: -1, dy: 0, check: () => minX > 0, expand: () => minX-- },
            { dx: 1, dy: 0, check: () => maxX < gridSizeX - 1, expand: () => maxX++ },
            { dx: 0, dy: -1, check: () => minY > 0, expand: () => minY-- },
            { dx: 0, dy: 1, check: () => maxY < gridSizeY - 1, expand: () => maxY++ }
          ];
          
          // Shuffle directions randomly
          for (let i = directions.length - 1; i > 0; i--) {
            const j = Math.floor(random() * (i + 1));
            [directions[i], directions[j]] = [directions[j], directions[i]];
          }
          
          // Try each direction
          for (const dir of directions) {
            if (!dir.check()) continue;
            
            // Check if we can expand in this direction
            let canExpandDir = true;
            if (dir.dx !== 0) {
              const checkX = dir.dx > 0 ? maxX + 1 : minX - 1;
              for (let y = minY; y <= maxY; y++) {
                if (!layer[checkX][y] || processed[checkX][y]) {
                  canExpandDir = false;
                  break;
                }
              }
              if (canExpandDir) {
                dir.expand();
                canExpand = true;
                break;
              }
            } else {
              const checkY = dir.dy > 0 ? maxY + 1 : minY - 1;
              for (let x = minX; x <= maxX; x++) {
                if (!layer[x][checkY] || processed[x][checkY]) {
                  canExpandDir = false;
                  break;
                }
              }
              if (canExpandDir) {
                dir.expand();
                canExpand = true;
                break;
              }
            }
          }
        }
        
        // Mark all cells in this rectangle as processed
        for (let x = minX; x <= maxX; x++) {
          for (let y = minY; y <= maxY; y++) {
            processed[x][y] = true;
            // Remove from remaining voxels
            const idx = remainingVoxels.findIndex(v => v.x === x && v.y === y);
            if (idx >= 0) {
              remainingVoxels.splice(idx, 1);
            }
          }
        }
        
        // Add block
        blocks.push({
          x: worldOffsetX + (minX * gridDensity),
          y: worldOffsetY + (minY * gridDensity),
          z: z * gridDensity,
          widthX: (maxX - minX + 1) * gridDensity,
          widthY: (maxY - minY + 1) * gridDensity,
          widthZ: gridDensity
        });
      }
      
      // Store result for this seed (even if cancelled, we keep what we have)
      if (!seedResults[z]) {
        seedResults[z] = [];
      }
      seedResults[z].push({
        seed,
        blocks,
        blockCount: blocks.length
      });
    }
  }
  
  // Find the best seed for each layer (lowest block count)
  // Use best result found so far, even if cancelled
  const allBlocks = [];
  for (let z = 0; z < gridSizeZ; z++) {
    if (!seedResults[z] || seedResults[z].length === 0) continue;
    
    // Find seed with lowest block count
    let bestResult = seedResults[z][0];
    for (const result of seedResults[z]) {
      if (result.blockCount < bestResult.blockCount) {
        bestResult = result;
      }
    }
    
    allBlocks.push(...bestResult.blocks);
  }
  
  return allBlocks;
}

/**
 * Generate vis blocks from terrain
 */
function generateVisBlocks() {
  if (!state.heightmap) {
    alert('Please load a heightmap first');
    return;
  }
  
  const gridDensity = parseInt(el.visGridDensity.value, 10);
  if (!gridDensity || gridDensity <= 0) {
    alert('Grid density must be greater than 0');
    return;
  }
  
  const iterations = parseInt(el.visIterations.value, 10);
  if (!iterations || iterations <= 0) {
    alert('Iterations must be greater than 0');
    return;
  }
  
  // Reset cancellation flag
  state.visMeshCancelled = false;
  
  // Show loading spinner and cancel button
  if (el.generateVisBlocks) {
    el.generateVisBlocks.disabled = true;
  }
  if (el.generateVisBlocksText) {
    el.generateVisBlocksText.classList.add('opacity-0');
  }
  if (el.generateVisBlocksSpinner) {
    el.generateVisBlocksSpinner.classList.remove('hidden');
  }
  if (el.cancelVisBlocks) {
    el.cancelVisBlocks.classList.remove('hidden');
  }
  
  // Show loading state
  if (el.visOptimisationInfo) {
    el.visOptimisationInfo.textContent = 'Rasterizing terrain...';
  }
  
  // Use setTimeout to allow UI to update
  setTimeout(async () => {
    const rasterData = rasterizeTerrain3D(gridDensity);
    
    if (el.visOptimisationInfo) {
      el.visOptimisationInfo.textContent = `Running iterative optimization (${iterations} iterations)...`;
    }
    
    const blocks = await greedyMesh(rasterData, iterations);
    state.visBlocks = blocks;
    
    // Hide loading spinner and cancel button
    if (el.generateVisBlocksText) {
      el.generateVisBlocksText.classList.remove('opacity-0');
    }
    if (el.generateVisBlocksSpinner) {
      el.generateVisBlocksSpinner.classList.add('hidden');
    }
    if (el.generateVisBlocks) {
      el.generateVisBlocks.disabled = false;
    }
    if (el.cancelVisBlocks) {
      el.cancelVisBlocks.classList.add('hidden');
    }
    
    // Update info display
    if (el.visOptimisationInfo) {
      const numTilesX = parseInt(el.tilesX.value, 10);
      const numTilesY = parseInt(el.tilesY.value, 10);
      const tileSize = parseInt(el.tileSize.value, 10);
      const totalWidth = numTilesX * tileSize;
      const totalDepth = numTilesY * tileSize;
      const maxHeight = parseInt(el.maxHeight.value, 10);
      
      const gridSizeX = Math.ceil(totalWidth / gridDensity);
      const gridSizeY = Math.ceil(totalDepth / gridDensity);
      const gridSizeZ = Math.ceil(maxHeight / gridDensity);
      const totalCells = gridSizeX * gridSizeY * gridSizeZ;
      
      const cancelledText = state.visMeshCancelled ? ' (Cancelled - using best result so far)' : '';
      
      el.visOptimisationInfo.textContent = 
        `Grid Density: ${gridDensity} units\n` +
        `Grid Size: ${gridSizeX} x ${gridSizeY} x ${gridSizeZ}\n` +
        `Total Cells: ${totalCells}\n` +
        `Optimized Blocks: ${blocks.length}\n` +
        `Reduction: ${((1 - blocks.length / totalCells) * 100).toFixed(1)}%${cancelledText}`;
    }
    
    // Re-render preview to show blocks
    if (state.heightmap) render3DPreview();
  }, 10);
}

// Cancel vis blocks generation
function cancelVisBlocks() {
  state.visMeshCancelled = true;
}

// ------------------------ Tab Switching ------------------------
const tabTerrain = document.getElementById('tabTerrain');
const tabMaterial = document.getElementById('tabMaterial');
const tabSkybox = document.getElementById('tabSkybox');
const tabVisOptimisation = document.getElementById('tabVisOptimisation');
const contentTerrain = document.getElementById('tabContentTerrain');
const contentMaterial = document.getElementById('tabContentMaterial');
const contentSkybox = document.getElementById('tabContentSkybox');
const contentVisOptimisation = document.getElementById('tabContentVisOptimisation');

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

// Update tab enabled/disabled states based on heightmap availability
function updateTabStates() {
  const hasHeightmap = !!state.heightmap;
  
  // Material, Skybox, and Visibility tabs require a heightmap
  if (tabMaterial) {
    if (hasHeightmap) {
      tabMaterial.disabled = false;
      tabMaterial.classList.remove('opacity-50', 'cursor-not-allowed');
      tabMaterial.style.pointerEvents = '';
    } else {
      tabMaterial.disabled = true;
      tabMaterial.classList.add('opacity-50', 'cursor-not-allowed');
      tabMaterial.style.pointerEvents = 'none';
    }
  }
  
  if (tabSkybox) {
    if (hasHeightmap) {
      tabSkybox.disabled = false;
      tabSkybox.classList.remove('opacity-50', 'cursor-not-allowed');
      tabSkybox.style.pointerEvents = '';
    } else {
      tabSkybox.disabled = true;
      tabSkybox.classList.add('opacity-50', 'cursor-not-allowed');
      tabSkybox.style.pointerEvents = 'none';
    }
  }
  
  if (tabVisOptimisation) {
    if (hasHeightmap) {
      tabVisOptimisation.disabled = false;
      tabVisOptimisation.classList.remove('opacity-50', 'cursor-not-allowed');
      tabVisOptimisation.style.pointerEvents = '';
    } else {
      tabVisOptimisation.disabled = true;
      tabVisOptimisation.classList.add('opacity-50', 'cursor-not-allowed');
      tabVisOptimisation.style.pointerEvents = 'none';
    }
  }
}

function switchTab(tabName) {
  // Prevent switching to disabled tabs
  if (tabName === 'material' && (!state.heightmap || tabMaterial?.disabled)) {
    return;
  }
  if (tabName === 'skybox' && (!state.heightmap || tabSkybox?.disabled)) {
    return;
  }
  if (tabName === 'visoptimisation' && (!state.heightmap || tabVisOptimisation?.disabled)) {
    return;
  }
  
  // Exit terrain edit mode when switching away from terrain tab
  if (tabName !== 'terrain') {
    exitTerrainEditMode();
  }
  
  // Reset all tabs
  [tabTerrain, tabMaterial, tabSkybox, tabVisOptimisation].forEach(tab => {
    if (tab) {
      tab.classList.remove('active', 'text-slate-300', 'border-indigo-500');
      tab.classList.add('text-slate-400', 'border-transparent');
    }
  });
  [contentTerrain, contentMaterial, contentSkybox, contentVisOptimisation].forEach(content => {
    if (content) content.classList.add('hidden');
  });

  if (tabName === 'terrain') {
    tabTerrain.classList.add('active', 'text-slate-300', 'border-indigo-500');
    tabTerrain.classList.remove('text-slate-400', 'border-transparent');
    contentTerrain.classList.remove('hidden');
    if (state.heightmap) render3DPreview();
  } else if (tabName === 'skybox') {
    tabSkybox.classList.add('active', 'text-slate-300', 'border-indigo-500');
    tabSkybox.classList.remove('text-slate-400', 'border-transparent');
    contentSkybox.classList.remove('hidden');
    if (state.heightmap) render3DPreview();
  } else if (tabName === 'visoptimisation') {
    tabVisOptimisation.classList.add('active', 'text-slate-300', 'border-indigo-500');
    tabVisOptimisation.classList.remove('text-slate-400', 'border-transparent');
    contentVisOptimisation.classList.remove('hidden');
    if (state.heightmap) render3DPreview();
  } else {
    // material tab
    tabMaterial.classList.add('active', 'text-slate-300', 'border-indigo-500');
    tabMaterial.classList.remove('text-slate-400', 'border-transparent');
    contentMaterial.classList.remove('hidden');
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
if (tabVisOptimisation) {
  tabVisOptimisation.addEventListener('click', () => switchTab('visoptimisation'));
}

// Initialize tab states on page load
updateTabStates();

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

// Custom setup for inputs that double/halve values
function setupVisInputCounter(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;
  
  const decrementBtn = document.querySelector(`[data-input-counter-decrement="${inputId}"]`);
  const incrementBtn = document.querySelector(`[data-input-counter-increment="${inputId}"]`);
  
  if (decrementBtn) {
    decrementBtn.addEventListener('click', () => {
      const min = parseInt(input.min) || 1;
      const current = parseInt(input.value) || min;
      const newValue = Math.max(min, Math.floor(current / 2));
      input.value = newValue;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
  }
  
  if (incrementBtn) {
    incrementBtn.addEventListener('click', () => {
      const max = parseInt(input.max) || Infinity;
      const current = parseInt(input.value) || 1;
      const newValue = Math.min(max, current * 2);
      input.value = newValue;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
  }
}

// Apply double/halve behavior to these inputs
setupVisInputCounter('tileSize');
setupVisInputCounter('maxHeight');
setupVisInputCounter('skyboxTopOffset');
setupVisInputCounter('visGridDensity');
setupVisInputCounter('visIterations');

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
let generatorPreSnapshotSaved = false;

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
    if (el.heightMaskPanel) el.heightMaskPanel.classList.add('hidden');
    if (el.erosionMaskPanel) el.erosionMaskPanel.classList.add('hidden');
    // Generate preview immediately with current/default values
    if (state.heightmap) {
      // Save pre-stroke snapshot once per generation session
      if (!generatorPreSnapshotSaved) {
        saveMaskState();
        generatorPreSnapshotSaved = true;
      }
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
      } else if (mode === 'subtract') {
        for (let i = 0; i < W * H; i++) {
          state.previewMask[i] = Math.max(0, (state.mask && state.mask[i] ? state.mask[i] : 0) - generatedMask[i]);
        }
      } else if (mode === 'intersect') {
        for (let i = 0; i < W * H; i++) {
          const base = state.mask && state.mask[i] ? state.mask[i] : 0;
          state.previewMask[i] = Math.min(base, generatedMask[i]);
        }
      }
      
      render3DPreview();
    }
  } else if (type === 'noise') {
    el.maskGeneratorTitle.textContent = 'Generate Noise Mask';
    el.slopeMaskPanel.classList.add('hidden');
    el.noiseMaskPanel.classList.remove('hidden');
    if (el.heightMaskPanel) el.heightMaskPanel.classList.add('hidden');
    if (el.erosionMaskPanel) el.erosionMaskPanel.classList.add('hidden');
    // Update type-specific UI
    const noiseType = document.getElementById('noiseType')?.value || 'perlin';
    updateNoiseTypeSpecificUI(noiseType);
    // Generate preview immediately with current/default values (force update)
    if (state.heightmap) {
      if (!generatorPreSnapshotSaved) {
        saveMaskState();
        generatorPreSnapshotSaved = true;
      }
      updateNoisePreview(true);
    }
  } else if (type === 'height') {
    el.maskGeneratorTitle.textContent = 'Generate Height Mask';
    if (el.slopeMaskPanel) el.slopeMaskPanel.classList.add('hidden');
    if (el.noiseMaskPanel) el.noiseMaskPanel.classList.add('hidden');
    if (el.erosionMaskPanel) el.erosionMaskPanel.classList.add('hidden');
    if (el.heightMaskPanel) el.heightMaskPanel.classList.remove('hidden');
    ensureHeightGradientState();
    renderHeightGradientCanvas();
    renderHeightGradientUI();
    syncHeightPresetSelect();
    
    if (state.heightmap) {
      if (!generatorPreSnapshotSaved) {
        saveMaskState();
        generatorPreSnapshotSaved = true;
      }
      if (!state.previewMask || state.previewMask.length !== state.resizedWidth * state.resizedHeight) {
        state.previewMask = new Float32Array(state.resizedWidth * state.resizedHeight);
        if (state.mask && state.mask.length === state.previewMask.length) {
          state.previewMask.set(state.mask);
        }
      }
      updateHeightMaskPreview();
    }
  } else if (type === 'erosion') {
    el.maskGeneratorTitle.textContent = 'Generate Erosion Mask';
    if (el.slopeMaskPanel) el.slopeMaskPanel.classList.add('hidden');
    if (el.noiseMaskPanel) el.noiseMaskPanel.classList.add('hidden');
    if (el.heightMaskPanel) el.heightMaskPanel.classList.add('hidden');
    if (el.erosionMaskPanel) el.erosionMaskPanel.classList.remove('hidden');

    if (state.heightmap) {
      if (!generatorPreSnapshotSaved) {
        saveMaskState();
        generatorPreSnapshotSaved = true;
      }
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
  generatorPreSnapshotSaved = false;
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
      } else if (mode === 'subtract') {
        for (let i = 0; i < W * H; i++) {
          state.previewMask[i] = Math.max(0, (state.mask && state.mask[i] ? state.mask[i] : 0) - generatedMask[i]);
        }
      } else if (mode === 'intersect') {
        for (let i = 0; i < W * H; i++) {
          const base = state.mask && state.mask[i] ? state.mask[i] : 0;
          state.previewMask[i] = Math.min(base, generatedMask[i]);
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
  } else if (mode === 'subtract') {
    for (let i = 0; i < W * H; i++) {
      state.previewMask[i] = Math.max(0, (state.mask && state.mask[i] ? state.mask[i] : 0) - generatedMask[i]);
    }
  } else if (mode === 'intersect') {
    for (let i = 0; i < W * H; i++) {
      const base = state.mask && state.mask[i] ? state.mask[i] : 0;
      state.previewMask[i] = Math.min(base, generatedMask[i]);
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
    } else if (mode === 'subtract') {
      state.previewMask[i] = Math.max(0, base - generatedMask[i]);
    } else if (mode === 'intersect') {
      state.previewMask[i] = Math.min(base, generatedMask[i]);
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

loadHeightGradientPresets();
ensureHeightGradientState();
renderHeightGradientCanvas();
renderHeightGradientUI();

if (el.genSlopeMask) el.genSlopeMask.addEventListener('click', () => openMaskGeneratorPanel('slope'));
if (el.genNoiseMask) el.genNoiseMask.addEventListener('click', () => openMaskGeneratorPanel('noise'));
if (el.genHeightMask) el.genHeightMask.addEventListener('click', () => openMaskGeneratorPanel('height'));
if (el.genErosionMask) el.genErosionMask.addEventListener('click', () => openMaskGeneratorPanel('erosion'));
if (el.closeMaskGenerator) el.closeMaskGenerator.addEventListener('click', closeMaskGeneratorPanel);

if (el.heightGradientAddStop) {
  el.heightGradientAddStop.addEventListener('click', () => {
    addHeightGradientStop();
  });
}
if (el.heightGradientReset) {
  el.heightGradientReset.addEventListener('click', () => {
    resetHeightGradientStops();
  });
}
if (el.heightGradientCanvas) {
  el.heightGradientCanvas.addEventListener('pointerdown', handleHeightCanvasPointerDown);
  el.heightGradientCanvas.addEventListener('pointermove', handleHeightCanvasPointerMove);
  el.heightGradientCanvas.addEventListener('pointerup', handleHeightCanvasPointerUp);
  el.heightGradientCanvas.addEventListener('pointercancel', handleHeightCanvasPointerUp);
  el.heightGradientCanvas.addEventListener('pointerleave', handleHeightCanvasPointerLeave);
  el.heightGradientCanvas.addEventListener('dblclick', handleHeightCanvasDoubleClick);
}
if (el.heightGradientPresetSelect) {
  el.heightGradientPresetSelect.addEventListener('change', () => {
    updateHeightPresetButtons();
  });
}
if (el.heightGradientSavePreset) {
  el.heightGradientSavePreset.addEventListener('click', () => {
    const nameField = el.heightGradientPresetName;
    const rawName = nameField?.value ?? '';
    if (!rawName.trim()) return;
    const saved = saveHeightGradientPreset(rawName);
    if (saved && nameField) {
      nameField.value = '';
    }
  });
}
if (el.heightGradientPresetName) {
  el.heightGradientPresetName.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      el.heightGradientSavePreset?.click();
    }
  });
}
if (el.heightGradientLoadPreset) {
  el.heightGradientLoadPreset.addEventListener('click', () => {
    const name = el.heightGradientPresetSelect?.value;
    if (!name) return;
    loadHeightGradientPreset(name);
  });
}
if (el.heightGradientDeletePreset) {
  el.heightGradientDeletePreset.addEventListener('click', () => {
    const name = el.heightGradientPresetSelect?.value;
    if (!name) return;
    deleteHeightGradientPreset(name);
  });
}
if (el.heightGradientValue) {
  el.heightGradientValue.addEventListener('input', (event) => {
    const selected = getSelectedHeightStop();
    if (!selected) return;
    const raw = parseFloat(event.target.value);
    const normalized = clamp01((Number.isFinite(raw) ? raw : 0) / 100);
    if (el.heightGradientValueDisplay) {
      el.heightGradientValueDisplay.textContent = normalized.toFixed(2);
    }
    updateHeightGradientStop(selected.id, { value: normalized });
  });
}
if (el.heightMaskMode) {
  el.heightMaskMode.addEventListener('change', () => {
    if (!el.heightMaskPanel?.classList.contains('hidden')) {
      updateHeightMaskPreview();
    }
  });
}

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Delete') return;
  const target = event.target;
  const tag = target?.tagName?.toLowerCase?.() || '';
  if (tag === 'input' || tag === 'textarea' || target?.isContentEditable) {
    return;
  }
  const panelVisible = !el.heightMaskPanel?.classList.contains('hidden');
  if (!panelVisible) return;
  const removed = removeSelectedHeightStop();
  if (removed) {
    event.preventDefault();
  }
});
if (el.heightMaskInvert) {
  el.heightMaskInvert.addEventListener('change', () => {
    if (!el.heightMaskPanel?.classList.contains('hidden')) {
      updateHeightMaskPreview();
    }
  });
}

// Apply buttons
const applySlopeMask = document.getElementById('applySlopeMask');
const applyNoiseMask = document.getElementById('applyNoiseMask');
const applyErosionMask = document.getElementById('applyErosionMask');
const applyHeightMask = document.getElementById('applyHeightMask');

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
    } else if (mode === 'subtract') {
      for (let i = 0; i < W * H; i++) {
        state.mask[i] = Math.max(0, state.mask[i] - generatedMask[i]);
      }
    } else if (mode === 'intersect') {
      for (let i = 0; i < W * H; i++) {
        state.mask[i] = Math.min(state.mask[i], generatedMask[i]);
      }
    }
    
    // Save state after applying (so this operation can be undone in one step)
    saveMaskState();
    
    render3DPreview();
    closeMaskGeneratorPanel();
    updateExportMaskButton();
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
    } else if (mode === 'subtract') {
      for (let i = 0; i < W * H; i++) {
        state.mask[i] = Math.max(0, state.mask[i] - generatedMask[i]);
      }
    } else if (mode === 'intersect') {
      for (let i = 0; i < W * H; i++) {
        state.mask[i] = Math.min(state.mask[i], generatedMask[i]);
      }
    }
    
    // Save state after applying (so this operation can be undone in one step)
    saveMaskState();
    
    render3DPreview();
    closeMaskGeneratorPanel();
    updateExportMaskButton();
  });
}

if (applyHeightMask) {
  applyHeightMask.addEventListener('click', () => {
    if (!state.heightmap) return;
    const W = state.resizedWidth;
    const H = state.resizedHeight;
    if (!W || !H) return;
    
    const mode = el.heightMaskMode?.value || 'add';
    const invert = !!el.heightMaskInvert?.checked;
    const stops = getHeightGradientStopsSorted();
    if (!stops.length) return;
    
    if (!state.mask || state.mask.length !== W * H) {
      state.mask = new Float32Array(W * H);
    }
    
    const generatedMask = generateHeightMask(stops);
    if (!generatedMask) return;
    
    if (invert) {
      for (let i = 0; i < generatedMask.length; i++) {
        generatedMask[i] = 255 - generatedMask[i];
      }
    }
    
    if (mode === 'add') {
      for (let i = 0; i < generatedMask.length; i++) {
        state.mask[i] = Math.min(255, state.mask[i] + generatedMask[i]);
      }
    } else if (mode === 'subtract') {
      for (let i = 0; i < generatedMask.length; i++) {
        state.mask[i] = Math.max(0, state.mask[i] - generatedMask[i]);
      }
    } else if (mode === 'intersect') {
      for (let i = 0; i < generatedMask.length; i++) {
        state.mask[i] = Math.min(state.mask[i], generatedMask[i]);
      }
    }
    
    saveMaskState();
    render3DPreview();
    closeMaskGeneratorPanel();
    updateExportMaskButton();
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
    } else if (mode === 'subtract') {
      for (let i = 0; i < W * H; i++) {
        state.mask[i] = Math.max(0, state.mask[i] - maskData[i]);
      }
    } else if (mode === 'intersect') {
      for (let i = 0; i < W * H; i++) {
        state.mask[i] = Math.min(state.mask[i], maskData[i]);
      }
    }

    saveMaskState();
    render3DPreview();
    closeMaskGeneratorPanel();
    updateExportMaskButton();
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
  updateExportMaskButton();
});

// Export mask as PNG
function exportMaskAsPNG() {
  if (!state.mask || !state.resizedWidth || !state.resizedHeight) {
    alert('No mask to export. Please create a mask first.');
    return;
  }

  const W = state.resizedWidth;
  const H = state.resizedHeight;
  
  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  
  // Create ImageData
  const imageData = ctx.createImageData(W, H);
  const data = imageData.data;
  
  // Convert Float32Array mask to ImageData (grayscale)
  for (let i = 0; i < W * H; i++) {
    const value = Math.round(state.mask[i]);
    const idx = i * 4;
    data[idx] = value;     // R
    data[idx + 1] = value; // G
    data[idx + 2] = value; // B
    data[idx + 3] = 255;   // A
  }
  
  // Draw to canvas
  ctx.putImageData(imageData, 0, 0);
  
  // Convert to blob and download
  canvas.toBlob((blob) => {
    if (!blob) {
      alert('Failed to export mask.');
      return;
    }
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mask.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 'image/png');
}

// Update export mask button state
function updateExportMaskButton() {
  if (el.exportMask) {
    const hasMask = state.mask && state.resizedWidth && state.resizedHeight;
    el.exportMask.disabled = !hasMask;
  }
}

if (el.exportMask) {
  el.exportMask.addEventListener('click', exportMaskAsPNG);
}

if (el.maskBlendAdd) {
  el.maskBlendAdd.addEventListener('click', () => applyPendingMaskImport('add'));
}
if (el.maskBlendSubtract) {
  el.maskBlendSubtract.addEventListener('click', () => applyPendingMaskImport('subtract'));
}
if (el.maskBlendIntersect) {
  el.maskBlendIntersect.addEventListener('click', () => applyPendingMaskImport('intersect'));
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
      } else if (mode === 'subtract') {
        for (let i = 0; i < W * H; i++) {
          state.previewMask[i] = Math.max(0, (state.mask && state.mask[i] ? state.mask[i] : 0) - generatedMask[i]);
        }
      } else if (mode === 'intersect') {
        for (let i = 0; i < W * H; i++) {
          const base = state.mask && state.mask[i] ? state.mask[i] : 0;
          state.previewMask[i] = Math.min(base, generatedMask[i]);
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
      } else if (mode === 'subtract') {
        for (let i = 0; i < W * H; i++) {
          state.previewMask[i] = Math.max(0, (state.mask && state.mask[i] ? state.mask[i] : 0) - generatedMask[i]);
        }
      } else if (mode === 'intersect') {
        for (let i = 0; i < W * H; i++) {
          const base = state.mask && state.mask[i] ? state.mask[i] : 0;
          state.previewMask[i] = Math.min(base, generatedMask[i]);
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

// ------------------------ Terrain Editor Panel ------------------------
let terrainEditorPreSnapshotSaved = false;

function openTerrainEditorPanel(type) {
  if (!el.terrainEditorPanel) return;
  el.terrainEditorPanel.classList.remove('translate-x-full');
  
  // Initialize preview heightmap
  if (state.heightmap) {
    const W = state.resizedWidth, H = state.resizedHeight;
    if (!state.previewHeightmap || state.previewHeightmap.length !== W * H) {
      state.previewHeightmap = new Float32Array(W * H);
      // Copy current heightmap to preview
      state.previewHeightmap.set(state.heightmap);
    }
  }
  
  if (type === 'blur') {
    el.terrainEditorTitle.textContent = 'Blur Terrain';
    el.blurTerrainPanel.classList.remove('hidden');
    el.erosionTerrainPanel.classList.add('hidden');
    updateBlurTerrainPreview();
  } else if (type === 'erosion') {
    el.terrainEditorTitle.textContent = 'Erosion Terrain';
    el.blurTerrainPanel.classList.add('hidden');
    el.erosionTerrainPanel.classList.remove('hidden');
    updateErosionTerrainPreview();
  }
}

function closeTerrainEditorPanel() {
  if (!el.terrainEditorPanel) return;
  el.terrainEditorPanel.classList.add('translate-x-full');
  // Reset preview heightmap
  if (state.previewHeightmap && state.heightmap) {
    state.previewHeightmap.set(state.heightmap);
    render3DPreview();
  }
  terrainEditorPreSnapshotSaved = false;
}

// Blur effect implementation
function applyBlurToHeightmap(heightmap, W, H, radius, iterations) {
  const result = new Float32Array(heightmap);
  
  for (let iter = 0; iter < iterations; iter++) {
    const temp = new Float32Array(result);
    const kernelSize = radius * 2 + 1;
    const kernel = new Float32Array(kernelSize);
    let kernelSum = 0;
    
    // Create Gaussian kernel
    const sigma = radius / 3;
    for (let i = 0; i < kernelSize; i++) {
      const x = i - radius;
      const value = Math.exp(-(x * x) / (2 * sigma * sigma));
      kernel[i] = value;
      kernelSum += value;
    }
    // Normalize kernel
    for (let i = 0; i < kernelSize; i++) {
      kernel[i] /= kernelSum;
    }
    
    // Horizontal blur
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        let sum = 0;
        for (let kx = -radius; kx <= radius; kx++) {
          const px = Math.max(0, Math.min(W - 1, x + kx));
          sum += temp[y * W + px] * kernel[kx + radius];
        }
        result[y * W + x] = sum;
      }
    }
    
    // Vertical blur
    const temp2 = new Float32Array(result);
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        let sum = 0;
        for (let ky = -radius; ky <= radius; ky++) {
          const py = Math.max(0, Math.min(H - 1, y + ky));
          sum += temp2[py * W + x] * kernel[ky + radius];
        }
        result[y * W + x] = sum;
      }
    }
  }
  
  return result;
}

function updateBlurTerrainPreview() {
  if (!state.heightmap || !state.previewHeightmap) return;
  const W = state.resizedWidth, H = state.resizedHeight;
  const radius = parseInt(el.blurRadius?.value || 3, 10);
  const iterations = parseInt(el.blurIterations?.value || 1, 10);
  
  const blurred = applyBlurToHeightmap(state.heightmap, W, H, radius, iterations);
  state.previewHeightmap.set(blurred);
  
  // Temporarily use preview heightmap for rendering
  const original = state.heightmap;
  state.heightmap = state.previewHeightmap;
  render3DPreview();
  state.heightmap = original;
}

function applyBlurTerrain() {
  if (!state.heightmap || !state.previewHeightmap) return;
  const W = state.resizedWidth, H = state.resizedHeight;
  const radius = parseInt(el.blurRadius?.value || 3, 10);
  const iterations = parseInt(el.blurIterations?.value || 1, 10);
  
  // Save snapshot before applying
  if (!terrainEditorPreSnapshotSaved) {
    terrainEditorPreSnapshotSaved = true;
  }
  
  const blurred = applyBlurToHeightmap(state.heightmap, W, H, radius, iterations);
  state.heightmap.set(blurred);
  state.previewHeightmap.set(blurred);
  
  // Don't call resizeHeightmapImage() as it would regenerate from original image
  // The heightmap is already updated with the blur
  
  render3DPreview();
  clearMaskIfModified(); // Clear mask since terrain changed
  
  // Close the panel after applying
  closeTerrainEditorPanel();
}

// Erosion effect - reuse existing erosion code but apply to heightmap
function applyErosionToHeightmap(heightmap, W, H, options = {}) {
  const settings = {
    droplets: Math.max(1, Math.floor(options.droplets ?? 1500)),
    maxSteps: Math.max(1, Math.floor(options.maxSteps ?? 120)),
    radius: Math.max(0.5, options.radius ?? 1.5),
    inertia: Math.max(0, Math.min(0.99, options.inertia ?? 0.1)),
    capacity: Math.max(0.0001, options.capacity ?? 10),
    depositionRate: Math.max(0, Math.min(1, options.deposition ?? 0.02)),
    erosionRate: Math.max(0, Math.min(1, options.erosionRate ?? 0.9)),
    evaporationRate: Math.max(0, Math.min(0.99, options.evaporation ?? 0.02)),
    gravity: Math.max(0.0001, options.gravity ?? 20),
    minSlope: Math.max(0, options.minSlope ?? 0.05),
    seed: options.seed ?? 0
  };
  
  // Create a copy to work with
  const heights = new Float32Array(heightmap);
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
          // Use radius-based erosion similar to erodeSedimentAt
          const radiusInt = Math.max(1, Math.ceil(settings.radius));
          const cx = Math.floor(nx);
          const cy = Math.floor(ny);
          const indices = [];
          let totalWeight = 0;
          
          for (let yy = cy - radiusInt; yy <= cy + radiusInt; yy++) {
            if (yy < 0 || yy >= H) continue;
            for (let xx = cx - radiusInt; xx <= cx + radiusInt; xx++) {
              if (xx < 0 || xx >= W) continue;
              const dx = (xx + 0.5) - nx;
              const dy = (yy + 0.5) - ny;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist > settings.radius) continue;
              const weight = 1 - dist / settings.radius;
              if (weight <= 0) continue;
              indices.push({ idx: yy * W + xx, weight });
              totalWeight += weight;
            }
          }
          
          if (totalWeight > 1e-6) {
            const invTotal = 1 / totalWeight;
            let removedTotal = 0;
            for (let i = 0; i < indices.length; i++) {
              const { idx, weight } = indices[i];
              const portion = erodeAmount * weight * invTotal;
              const available = Math.min(portion, heights[idx]);
              if (available <= 0) continue;
              heights[idx] -= available;
              removedTotal += available;
            }
            sediment += removedTotal;
          }
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
  
  return heights;
}

function updateErosionTerrainPreview() {
  if (!state.heightmap || !state.previewHeightmap) return;
  const W = state.resizedWidth, H = state.resizedHeight;
  
  const options = {
    seed: parseInt(el.erosionTerrainSeed?.value || 0, 10),
    droplets: parseInt(el.erosionTerrainDroplets?.value || 1500, 10),
    maxSteps: parseInt(el.erosionTerrainMaxSteps?.value || 120, 10),
    radius: parseFloat(el.erosionTerrainRadius?.value || 1.5),
    inertia: parseFloat(el.erosionTerrainInertia?.value || 0.1),
    capacity: parseInt(el.erosionTerrainCapacity?.value || 10, 10),
    deposition: parseFloat(el.erosionTerrainDeposition?.value || 0.02),
    erosionRate: parseFloat(el.erosionTerrainErosionRate?.value || 0.9),
    evaporation: parseFloat(el.erosionTerrainEvaporation?.value || 0.02),
    gravity: parseInt(el.erosionTerrainGravity?.value || 20, 10),
    minSlope: parseFloat(el.erosionTerrainMinSlope?.value || 0.05)
  };
  
  const eroded = applyErosionToHeightmap(state.heightmap, W, H, options);
  state.previewHeightmap.set(eroded);
  
  // Temporarily use preview heightmap for rendering
  const original = state.heightmap;
  state.heightmap = state.previewHeightmap;
  render3DPreview();
  state.heightmap = original;
}

function applyErosionTerrain() {
  if (!state.heightmap || !state.previewHeightmap) return;
  const W = state.resizedWidth, H = state.resizedHeight;
  
  const options = {
    seed: parseInt(el.erosionTerrainSeed?.value || 0, 10),
    droplets: parseInt(el.erosionTerrainDroplets?.value || 1500, 10),
    maxSteps: parseInt(el.erosionTerrainMaxSteps?.value || 120, 10),
    radius: parseFloat(el.erosionTerrainRadius?.value || 1.5),
    inertia: parseFloat(el.erosionTerrainInertia?.value || 0.1),
    capacity: parseInt(el.erosionTerrainCapacity?.value || 10, 10),
    deposition: parseFloat(el.erosionTerrainDeposition?.value || 0.02),
    erosionRate: parseFloat(el.erosionTerrainErosionRate?.value || 0.9),
    evaporation: parseFloat(el.erosionTerrainEvaporation?.value || 0.02),
    gravity: parseInt(el.erosionTerrainGravity?.value || 20, 10),
    minSlope: parseFloat(el.erosionTerrainMinSlope?.value || 0.05)
  };
  
  // Save snapshot before applying
  if (!terrainEditorPreSnapshotSaved) {
    terrainEditorPreSnapshotSaved = true;
  }
  
  const eroded = applyErosionToHeightmap(state.heightmap, W, H, options);
  state.heightmap.set(eroded);
  state.previewHeightmap.set(eroded);
  
  // Don't call resizeHeightmapImage() as it would regenerate from original image
  // The heightmap is already updated with the erosion
  
  render3DPreview();
  clearMaskIfModified(); // Clear mask since terrain changed
  
  // Close the panel after applying
  closeTerrainEditorPanel();
}

// Terrain edit mode toggle functions
function enterTerrainEditMode() {
  if (el.terrainNormalMode) el.terrainNormalMode.classList.add('hidden');
  if (el.terrainEditMode) el.terrainEditMode.classList.remove('hidden');
}

function exitTerrainEditMode() {
  if (el.terrainNormalMode) el.terrainNormalMode.classList.remove('hidden');
  if (el.terrainEditMode) el.terrainEditMode.classList.add('hidden');
  // Close the terrain editor panel if open
  closeTerrainEditorPanel();
}

// Terrain editor event listeners
if (el.editTerrainBtn) {
  el.editTerrainBtn.addEventListener('click', () => {
    enterTerrainEditMode();
  });
}

if (el.exitTerrainEditBtn) {
  el.exitTerrainEditBtn.addEventListener('click', () => {
    exitTerrainEditMode();
  });
}

if (el.terrainEditBlurBtn) {
  el.terrainEditBlurBtn.addEventListener('click', () => {
    openTerrainEditorPanel('blur');
  });
}

if (el.terrainEditErosionBtn) {
  el.terrainEditErosionBtn.addEventListener('click', () => {
    openTerrainEditorPanel('erosion');
  });
}

if (el.closeTerrainEditor) {
  el.closeTerrainEditor.addEventListener('click', closeTerrainEditorPanel);
}

// Blur controls
if (el.blurRadius) {
  el.blurRadius.addEventListener('input', (e) => {
    if (el.blurRadiusValue) el.blurRadiusValue.textContent = e.target.value;
    updateBlurTerrainPreview();
  });
}

if (el.blurIterations) {
  el.blurIterations.addEventListener('input', (e) => {
    if (el.blurIterationsValue) el.blurIterationsValue.textContent = e.target.value;
    updateBlurTerrainPreview();
  });
}

if (el.applyBlurTerrain) {
  el.applyBlurTerrain.addEventListener('click', applyBlurTerrain);
}

// Erosion controls - update value displays
const erosionValueUpdates = [
  { input: 'erosionTerrainDroplets', display: 'erosionTerrainDropletsValue' },
  { input: 'erosionTerrainMaxSteps', display: 'erosionTerrainMaxStepsValue' },
  { input: 'erosionTerrainRadius', display: 'erosionTerrainRadiusValue' },
  { input: 'erosionTerrainInertia', display: 'erosionTerrainInertiaValue' },
  { input: 'erosionTerrainCapacity', display: 'erosionTerrainCapacityValue' },
  { input: 'erosionTerrainDeposition', display: 'erosionTerrainDepositionValue' },
  { input: 'erosionTerrainErosionRate', display: 'erosionTerrainErosionRateValue' },
  { input: 'erosionTerrainEvaporation', display: 'erosionTerrainEvaporationValue' },
  { input: 'erosionTerrainGravity', display: 'erosionTerrainGravityValue' },
  { input: 'erosionTerrainMinSlope', display: 'erosionTerrainMinSlopeValue' }
];

erosionValueUpdates.forEach(({ input, display }) => {
  const inputEl = el[input];
  const displayEl = el[display];
  if (inputEl && displayEl) {
    inputEl.addEventListener('input', (e) => {
      const value = parseFloat(e.target.value);
      displayEl.textContent = value.toFixed(value < 1 ? 2 : 0);
      updateErosionTerrainPreview();
    });
  }
});

if (el.applyErosionTerrain) {
  el.applyErosionTerrain.addEventListener('click', applyErosionTerrain);
}

// Initialize undo/redo buttons
updateUndoRedoButtons();

// Initialize brush mode buttons
updateBrushModeButtons();

// Initialize skybox UI state visuals on load
updateSkyboxInfoDisplay();
updateMaxBoundsVisualization();
updateSkyboxVisualization();

