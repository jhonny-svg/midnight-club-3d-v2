import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Car,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Gauge,
  Hand,
  Lightbulb,
  Move,
  RotateCcw,
  Save,
  Sliders,
  X,
  Zap,
} from 'lucide-react';
import {
  cloneDefaultCustomHud,
  CustomHudLayout,
  DEFAULT_CUSTOM_HUD,
  HighwayHudElementKey,
  HUD_RACING_COLORS,
  HudElementKey,
  HudElementLayout,
  SpeedUnits,
  TachometerStyleConfig,
  TransmissionMode,
  WalkingHudElementKey,
} from '../game/types';
import { TachometerDial } from './TachometerDial';

export type HudEditorMode = 'HIGHWAY' | 'WALKING';

interface CustomHudEditorProps {
  open: boolean;
  initialMode?: HudEditorMode;
  customHud: CustomHudLayout;
  speedUnits: SpeedUnits;
  activeTx: TransmissionMode;
  onSave: (nextCustomHud: CustomHudLayout) => void;
  onCancel: () => void;
}

const ELEMENT_LABELS: Record<HudElementKey, string> = {
  steerLeft: 'Girar Izquierda',
  steerRight: 'Girar Derecha',
  gas: 'Acelerador (GAS)',
  brake: 'Freno / Reversa',
  nitro: 'Nitro (N2O)',
  shiftUp: 'Subir Marcha (+)',
  shiftDown: 'Bajar Marcha (-)',
  headlights: 'Luces / Duelo',
  speedometer: 'Tacómetro / Velocímetro',
  joystick: 'Joystick Virtual',
  interact: 'Botón Interactuar',
  enterCar: 'Subir al Coche',
};

const HIGHWAY_KEYS: HighwayHudElementKey[] = [
  'steerLeft',
  'steerRight',
  'headlights',
  'brake',
  'gas',
  'nitro',
  'shiftDown',
  'shiftUp',
  'speedometer',
];

const WALKING_KEYS: WalkingHudElementKey[] = ['joystick', 'interact', 'enterCar'];

function cloneLayout(src: CustomHudLayout): CustomHudLayout {
  return {
    steerLeft: { ...src.steerLeft },
    steerRight: { ...src.steerRight },
    gas: { ...src.gas },
    brake: { ...src.brake },
    nitro: { ...src.nitro },
    shiftUp: { ...src.shiftUp },
    shiftDown: { ...src.shiftDown },
    headlights: { ...src.headlights },
    speedometer: { ...src.speedometer },
    joystick: { ...src.joystick },
    interact: { ...src.interact },
    enterCar: { ...src.enterCar },
    tachometerStyle: { ...src.tachometerStyle },
  };
}

interface DragState {
  key: HudElementKey;
  pointerType: 'touch' | 'mouse';
  touchId: number | null;
  startClientX: number;
  startClientY: number;
  originX: number;
  originY: number;
}

export const CustomHudEditor: React.FC<CustomHudEditorProps> = ({
  open,
  initialMode = 'HIGHWAY',
  customHud,
  speedUnits,
  activeTx,
  onSave,
  onCancel,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<DragState | null>(null);

  const [mode, setMode] = useState<HudEditorMode>(initialMode);
  const [draft, setDraft] = useState<CustomHudLayout>(() => cloneLayout(customHud));
  const [selectedKey, setSelectedKey] = useState<HudElementKey>(
    initialMode === 'HIGHWAY' ? 'speedometer' : 'joystick'
  );
  const [panelCollapsed, setPanelCollapsed] = useState(false);

  useEffect(() => {
    if (open) {
      setMode(initialMode);
      setDraft(cloneLayout(customHud));
      setSelectedKey(initialMode === 'HIGHWAY' ? 'speedometer' : 'joystick');
      setPanelCollapsed(false);
    }
  }, [open, initialMode, customHud]);

  const clampPct = (val: number, min: number, max: number) =>
    Math.round(Math.min(max, Math.max(min, val)) * 10) / 10;

  const updateElementPosition = useCallback((key: HudElementKey, clientX: number, clientY: number) => {
    const drag = dragRef.current;
    const container = containerRef.current;
    if (!drag || !container || drag.key !== key) return;
    const rect = container.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const dxPct = ((clientX - drag.startClientX) / rect.width) * 100;
    const dyPct = ((clientY - drag.startClientY) / rect.height) * 100;

    const nextX = clampPct(drag.originX + dxPct, 4, 96);
    const nextY = clampPct(drag.originY + dyPct, 6, 94);

    setDraft((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        x: nextX,
        y: nextY,
      },
    }));
  }, []);

  useEffect(() => {
    if (!open) return;

    const handleMouseMove = (e: MouseEvent) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerType !== 'mouse') return;
      updateElementPosition(drag.key, e.clientX, e.clientY);
    };

    const handleMouseUp = () => {
      const drag = dragRef.current;
      if (!drag || drag.pointerType !== 'mouse') return;
      dragRef.current = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('blur', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('blur', handleMouseUp);
      dragRef.current = null;
    };
  }, [open, updateElementPosition]);

  if (!open) return null;

  const activeKeys: HudElementKey[] = mode === 'HIGHWAY' ? HIGHWAY_KEYS : WALKING_KEYS;
  const activeSelectedKey: HudElementKey = activeKeys.includes(selectedKey)
    ? selectedKey
    : activeKeys[0];
  const selectedLayout: HudElementLayout = draft[activeSelectedKey];

  const updateSelectedLayout = (patch: Partial<HudElementLayout>) => {
    setDraft((prev) => ({
      ...prev,
      [activeSelectedKey]: {
        ...prev[activeSelectedKey],
        ...patch,
      },
    }));
  };

  const updateTachoStyle = (patch: Partial<TachometerStyleConfig>) => {
    setDraft((prev) => ({
      ...prev,
      tachometerStyle: {
        ...prev.tachometerStyle,
        ...patch,
      },
    }));
  };

  const handleToggleMode = () => {
    const nextMode: HudEditorMode = mode === 'HIGHWAY' ? 'WALKING' : 'HIGHWAY';
    setMode(nextMode);
    setSelectedKey(nextMode === 'HIGHWAY' ? 'speedometer' : 'joystick');
  };

  const handleResetAll = () => {
    setDraft(cloneDefaultCustomHud());
  };

  const handleResetSelected = () => {
    setDraft((prev) => ({
      ...prev,
      [activeSelectedKey]: { ...DEFAULT_CUSTOM_HUD[activeSelectedKey] },
      ...(activeSelectedKey === 'speedometer'
        ? { tachometerStyle: { ...DEFAULT_CUSTOM_HUD.tachometerStyle } }
        : {}),
    }));
  };

  const handleTouchStartElement = (
    key: HudElementKey,
    e: React.TouchEvent<HTMLDivElement>
  ) => {
    e.stopPropagation();
    setSelectedKey(key);
    if (dragRef.current) return;
    const t = e.changedTouches[0];
    if (!t) return;
    dragRef.current = {
      key,
      pointerType: 'touch',
      touchId: t.identifier,
      startClientX: t.clientX,
      startClientY: t.clientY,
      originX: draft[key].x,
      originY: draft[key].y,
    };
  };

  const handleTouchMoveElement = (
    key: HudElementKey,
    e: React.TouchEvent<HTMLDivElement>
  ) => {
    e.stopPropagation();
    const drag = dragRef.current;
    if (!drag || drag.pointerType !== 'touch' || drag.key !== key) return;
    for (let i = 0; i < e.touches.length; i++) {
      const t = e.touches[i];
      if (t.identifier === drag.touchId) {
        updateElementPosition(key, t.clientX, t.clientY);
        return;
      }
    }
  };

  const handleTouchEndElement = (
    key: HudElementKey,
    e: React.TouchEvent<HTMLDivElement>
  ) => {
    e.stopPropagation();
    const drag = dragRef.current;
    if (!drag || drag.pointerType !== 'touch' || drag.key !== key) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === drag.touchId) {
        dragRef.current = null;
        return;
      }
    }
  };

  const handleMouseDownElement = (
    key: HudElementKey,
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    setSelectedKey(key);
    dragRef.current = {
      key,
      pointerType: 'mouse',
      touchId: null,
      startClientX: e.clientX,
      startClientY: e.clientY,
      originX: draft[key].x,
      originY: draft[key].y,
    };
  };

  const renderElementPreview = (key: HudElementKey) => {
    switch (key) {
      case 'steerLeft':
        return (
          <div className="flex h-14 w-14 items-center justify-center border border-white/25 bg-[#090b10]/92 text-white shadow-lg">
            <ChevronLeft className="h-7 w-7" />
          </div>
        );
      case 'steerRight':
        return (
          <div className="flex h-14 w-14 items-center justify-center border border-white/25 bg-[#090b10]/92 text-white shadow-lg">
            <ChevronRight className="h-7 w-7" />
          </div>
        );
      case 'headlights':
        return (
          <div className="flex h-12 w-14 flex-col items-center justify-center border border-sky-400/45 bg-[#0b1524]/92 text-[10px] font-bold text-sky-200 shadow-lg">
            <Lightbulb className="h-3.5 w-3.5 mb-0.5 text-sky-300" />
            <span>LUCES</span>
          </div>
        );
      case 'brake':
        return (
          <div className="flex h-14 px-3.5 flex-col items-center justify-center border border-white/25 bg-[#090b10]/92 text-xs font-bold text-slate-200 shadow-lg">
            <span>FRENO</span>
          </div>
        );
      case 'gas':
        return (
          <div className="flex h-14 px-5 flex-col items-center justify-center border border-red-400/50 bg-[#e10600]/92 text-xs font-extrabold text-white shadow-lg">
            <span>GAS</span>
          </div>
        );
      case 'nitro':
        return (
          <div className="flex h-14 px-3.5 flex-col items-center justify-center border border-sky-400/50 bg-[#0d2238]/92 text-xs font-extrabold text-sky-200 shadow-lg">
            <Zap className="h-3.5 w-3.5 mb-0.5" />
            <span>NITRO</span>
          </div>
        );
      case 'shiftDown':
        return (
          <div className="flex h-11 px-3 items-center justify-center border border-white/25 bg-[#090b10]/92 text-xs font-bold text-slate-200 shadow-lg">
            Gear -
          </div>
        );
      case 'shiftUp':
        return (
          <div className="flex h-11 px-3 items-center justify-center border border-white/25 bg-[#090b10]/92 text-xs font-bold text-slate-200 shadow-lg">
            Gear +
          </div>
        );
      case 'speedometer':
        return (
          <TachometerDial
            speedDisplay={speedUnits === 'MPH' ? 92 : 148}
            speedUnitLabel={speedUnits === 'MPH' ? 'MPH' : 'KM/H'}
            rpm={6350}
            maxRpm={8000}
            gear={3}
            nitro={85}
            activeTx={activeTx}
            tcsEnabled={true}
            cdiRacing={true}
            revLimiterActive={false}
            styleConfig={draft.tachometerStyle}
          />
        );
      case 'joystick':
        return (
          <div className="relative flex h-[120px] w-[120px] items-center justify-center rounded-full border border-white/25 bg-slate-950/75 shadow-2xl backdrop-blur-md">
            <div className="h-[24px] w-[24px] rounded-full border border-white/10" />
            <div className="absolute inset-3 rounded-full border border-white/[0.06]" />
            <span className="absolute top-2 text-[8px] font-bold text-slate-500">▲</span>
            <span className="absolute bottom-2 text-[8px] font-bold text-slate-500">▼</span>
            <span className="absolute left-2 text-[8px] font-bold text-slate-500">◀</span>
            <span className="absolute right-2 text-[8px] font-bold text-slate-500">▶</span>
            <div className="absolute h-12 w-12 rounded-full border border-white/30 bg-white/18 shadow-lg">
              <div className="mx-auto mt-3.5 h-4 w-4 rounded-full bg-white/30" />
            </div>
          </div>
        );
      case 'interact':
        return (
          <div className="flex items-center gap-2 border border-amber-400/50 bg-[#090b10]/94 px-4 py-2.5 text-xs font-bold text-white shadow-xl whitespace-nowrap">
            <Hand className="h-3.5 w-3.5 text-amber-400" />
            <span>[E] Interactuar</span>
          </div>
        );
      case 'enterCar':
        return (
          <div className="flex items-center gap-2 border border-[#e10600]/65 bg-[#090b10]/94 px-4 py-2.5 text-xs font-bold text-white shadow-xl whitespace-nowrap">
            <Car className="h-3.5 w-3.5 text-[#e10600]" />
            <span>[F] Subir al Coche</span>
          </div>
        );
    }
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 overflow-hidden bg-slate-950/45 select-none"
      role="dialog"
      aria-modal="true"
      aria-label="Editor visual de Custom HUD"
    >
      {/* Subtle tactical alignment crosshair grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(148,163,184,0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.18) 1px, transparent 1px)',
          backgroundSize: '10% 10%',
        }}
      />
      <div className="pointer-events-none absolute inset-y-0 left-1/2 w-px bg-cyan-400/20" />
      <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-cyan-400/20" />

      {/* ==================== TOP BAR + FLOATING TOOL PANEL (TOP CENTER) ==================== */}
      <div className="pointer-events-none absolute inset-x-0 top-2 z-30 flex flex-col items-center gap-2 px-2">
        {/* Top Action Strip */}
        <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-1.5 border border-white/15 bg-[#07090f]/95 px-2.5 py-2 shadow-2xl backdrop-blur-md">
          <button
            type="button"
            onClick={handleToggleMode}
            className="flex items-center gap-1.5 border border-cyan-400/50 bg-cyan-500/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-cyan-200 hover:bg-cyan-500/25 cursor-pointer"
          >
            <Move className="h-3.5 w-3.5" />
            CAMBIAR MODO: {mode === 'HIGHWAY' ? 'AUTOPISTA' : 'A PIE'}
          </button>

          <button
            type="button"
            onClick={handleResetAll}
            className="flex items-center gap-1.5 border border-white/15 bg-white/[0.04] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-200 hover:border-white/35 hover:text-white cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            REINICIAR
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-1.5 border border-white/15 bg-white/[0.04] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-300 hover:border-red-400/50 hover:text-white cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
            CANCELAR
          </button>

          <button
            type="button"
            onClick={() => onSave(draft)}
            className="flex items-center gap-1.5 bg-[#e10600] px-3.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-white hover:bg-[#ff1812] cursor-pointer"
          >
            <Save className="h-3.5 w-3.5" />
            GUARDAR Y SALIR
          </button>
        </div>

        {/* Floating Contextual Tool Panel (Top-Center) */}
        <div className="pointer-events-auto w-full max-w-[480px] border border-white/15 bg-[#080b12]/95 shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-white/[0.08] px-3 py-1.5">
            <div className="flex items-center gap-2 min-w-0">
              <Sliders className="h-3.5 w-3.5 text-[#e10600] shrink-0" />
              <span className="truncate text-[11px] font-bold uppercase tracking-wider text-white">
                {ELEMENT_LABELS[activeSelectedKey]}
              </span>
              <span className="font-telemetry text-[10px] text-cyan-300 shrink-0">
                ({selectedLayout.x.toFixed(0)}%, {selectedLayout.y.toFixed(0)}%)
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleResetSelected}
                className="border border-white/15 bg-white/[0.04] px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-wider text-slate-300 hover:text-white cursor-pointer"
                title="Restaurar elemento seleccionado"
              >
                Reset Pieza
              </button>
              <button
                type="button"
                onClick={() => setPanelCollapsed((v) => !v)}
                className="flex h-6 w-6 items-center justify-center border border-white/15 bg-white/[0.04] text-slate-300 hover:text-white cursor-pointer"
                aria-label={panelCollapsed ? 'Expandir herramientas' : 'Minimizar herramientas'}
              >
                {panelCollapsed ? (
                  <ChevronDown className="h-3.5 w-3.5" />
                ) : (
                  <ChevronUp className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>

          {!panelCollapsed && (
            <div className="max-h-[44vh] overflow-y-auto p-3 space-y-3">
              {/* Scale & Opacity Sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label
                      htmlFor="hud-el-scale"
                      className="text-[10px] font-semibold uppercase tracking-wider text-slate-300"
                    >
                      Tamaño (Escala)
                    </label>
                    <span className="font-telemetry text-[11px] font-bold text-white">
                      {selectedLayout.scale.toFixed(2)}x
                    </span>
                  </div>
                  <input
                    id="hud-el-scale"
                    type="range"
                    min={0.6}
                    max={1.6}
                    step={0.05}
                    value={selectedLayout.scale}
                    onChange={(e) =>
                      updateSelectedLayout({ scale: parseFloat(e.target.value) })
                    }
                    className="w-full accent-[#e10600] cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label
                      htmlFor="hud-el-opacity"
                      className="text-[10px] font-semibold uppercase tracking-wider text-slate-300"
                    >
                      Opacidad
                    </label>
                    <span className="font-telemetry text-[11px] font-bold text-white">
                      {Math.round(selectedLayout.opacity * 100)}%
                    </span>
                  </div>
                  <input
                    id="hud-el-opacity"
                    type="range"
                    min={0.2}
                    max={1.0}
                    step={0.05}
                    value={selectedLayout.opacity}
                    onChange={(e) =>
                      updateSelectedLayout({ opacity: parseFloat(e.target.value) })
                    }
                    className="w-full accent-[#e10600] cursor-pointer"
                  />
                </div>
              </div>

              {/* Contextual Tachometer Subpanel */}
              {activeSelectedKey === 'speedometer' && (
                <div className="border-t border-white/[0.08] pt-2.5 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-amber-300">
                    <Gauge className="h-3.5 w-3.5" />
                    Personalización Visual del Tacómetro
                  </div>

                  {/* Color Palettes */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <div className="text-[9.5px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        Color Acento
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {HUD_RACING_COLORS.map((c) => (
                          <button
                            key={`acc_${c.id}`}
                            type="button"
                            title={c.label}
                            onClick={() => updateTachoStyle({ accentColor: c.hex })}
                            className={`h-5 w-5 border cursor-pointer transition-transform ${
                              draft.tachometerStyle.accentColor.toLowerCase() ===
                              c.hex.toLowerCase()
                                ? 'scale-110 border-white ring-1 ring-white'
                                : 'border-white/25 hover:scale-105'
                            }`}
                            style={{ backgroundColor: c.hex }}
                            aria-label={`Acento ${c.label}`}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="text-[9.5px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        Color Números
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {HUD_RACING_COLORS.map((c) => (
                          <button
                            key={`num_${c.id}`}
                            type="button"
                            title={c.label}
                            onClick={() => updateTachoStyle({ numberColor: c.hex })}
                            className={`h-5 w-5 border cursor-pointer transition-transform ${
                              draft.tachometerStyle.numberColor.toLowerCase() ===
                              c.hex.toLowerCase()
                                ? 'scale-110 border-white ring-1 ring-white'
                                : 'border-white/25 hover:scale-105'
                            }`}
                            style={{ backgroundColor: c.hex }}
                            aria-label={`Números ${c.label}`}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="text-[9.5px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        Color Aguja / Arco
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {HUD_RACING_COLORS.map((c) => (
                          <button
                            key={`ndl_${c.id}`}
                            type="button"
                            title={c.label}
                            onClick={() => updateTachoStyle({ needleColor: c.hex })}
                            className={`h-5 w-5 border cursor-pointer transition-transform ${
                              draft.tachometerStyle.needleColor.toLowerCase() ===
                              c.hex.toLowerCase()
                                ? 'scale-110 border-white ring-1 ring-white'
                                : 'border-white/25 hover:scale-105'
                            }`}
                            style={{ backgroundColor: c.hex }}
                            aria-label={`Aguja ${c.label}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Face Opacity + Show Numbers / Show Gear Toggles */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <div className="flex-1 min-w-[160px]">
                      <div className="flex items-center justify-between mb-1">
                        <label
                          htmlFor="tacho-face-opacity"
                          className="text-[9.5px] font-semibold uppercase tracking-wider text-slate-300"
                        >
                          Opacidad Fondo del Reloj
                        </label>
                        <span className="font-telemetry text-[10.5px] font-bold text-white">
                          {Math.round(draft.tachometerStyle.faceOpacity * 100)}%
                        </span>
                      </div>
                      <input
                        id="tacho-face-opacity"
                        type="range"
                        min={0.2}
                        max={1.0}
                        step={0.05}
                        value={draft.tachometerStyle.faceOpacity}
                        onChange={(e) =>
                          updateTachoStyle({ faceOpacity: parseFloat(e.target.value) })
                        }
                        className="w-full accent-amber-400 cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          updateTachoStyle({
                            showNumbers: !draft.tachometerStyle.showNumbers,
                          })
                        }
                        className={`border px-2.5 py-1.5 text-[9.5px] font-bold uppercase tracking-wider cursor-pointer ${
                          draft.tachometerStyle.showNumbers
                            ? 'border-emerald-400/60 bg-emerald-500/20 text-emerald-200'
                            : 'border-white/15 bg-white/[0.04] text-slate-400'
                        }`}
                      >
                        Números 0-8: {draft.tachometerStyle.showNumbers ? 'SÍ' : 'NO'}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          updateTachoStyle({
                            showGear: !draft.tachometerStyle.showGear,
                          })
                        }
                        className={`border px-2.5 py-1.5 text-[9.5px] font-bold uppercase tracking-wider cursor-pointer ${
                          draft.tachometerStyle.showGear
                            ? 'border-emerald-400/60 bg-emerald-500/20 text-emerald-200'
                            : 'border-white/15 bg-white/[0.04] text-slate-400'
                        }`}
                      >
                        Marcha: {draft.tachometerStyle.showGear ? 'SÍ' : 'NO'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ==================== DRAGGABLE HUD ELEMENTS ==================== */}
      {activeKeys.map((key) => {
        const el = draft[key];
        const isSelected = activeSelectedKey === key;

        return (
          <div
            key={key}
            role="button"
            tabIndex={0}
            aria-label={`Mover ${ELEMENT_LABELS[key]}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setSelectedKey(key);
              }
            }}
            onTouchStart={(e) => handleTouchStartElement(key, e)}
            onTouchMove={(e) => handleTouchMoveElement(key, e)}
            onTouchEnd={(e) => handleTouchEndElement(key, e)}
            onTouchCancel={(e) => handleTouchEndElement(key, e)}
            onMouseDown={(e) => handleMouseDownElement(key, e)}
            style={{
              touchAction: 'none',
              left: `${el.x}%`,
              top: `${el.y}%`,
              opacity: el.opacity,
              transform: `translate(-50%, -50%) scale(${el.scale})`,
            }}
            className={`absolute z-20 cursor-grab active:cursor-grabbing p-1 transition-shadow ${
              isSelected
                ? 'border-2 border-dashed border-cyan-400 bg-cyan-400/10 shadow-[0_0_24px_rgba(34,211,238,0.4)] z-25'
                : 'border border-dashed border-white/45 bg-white/[0.03] hover:border-white/80'
            }`}
          >
            {/* Floating Tag Badge */}
            <div
              className={`pointer-events-none absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-wider ${
                isSelected
                  ? 'bg-cyan-400 text-slate-950'
                  : 'bg-black/80 text-slate-300 border border-white/15'
              }`}
            >
              {ELEMENT_LABELS[key]}
            </div>

            <div className="pointer-events-none">{renderElementPreview(key)}</div>
          </div>
        );
      })}
    </div>
  );
};
