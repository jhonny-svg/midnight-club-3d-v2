import React, { useEffect, useState } from 'react';
import {
  Check,
  Crown,
  Database,
  Gamepad2,
  Globe,
  Keyboard,
  LayoutTemplate,
  Monitor,
  Move,
  Radio,
  RotateCcw,
  Sliders,
  Users,
  Volume2,
  X,
} from 'lucide-react';
import {
  cloneDefaultCustomHud,
  cloneDefaultKeybindings,
  DEFAULT_SETTINGS,
  formatKeybindingDisplay,
  GameSettings,
  GraphicsQuality,
  KEY_ACTION_META,
  KeyAction,
  Keybindings,
  RadioStation,
  RemotePlayerSummary,
  SpeedUnits,
  TouchControlsMode,
  TransmissionMode,
  ViewDistance,
  WeatherMode,
} from '../game/types';
import { HudEditorMode } from './CustomHudEditor';

export type SettingsTab = 'GRAFICOS' | 'AUDIO' | 'CONTROLES' | 'CUSTOM_HUD' | 'ONLINE' | 'DATOS';

interface SettingsModalProps {
  open: boolean;
  initialTab?: SettingsTab;
  settings: GameSettings;
  onClose: () => void;
  onUpdateSettings: (patch: Partial<GameSettings>) => void;
  onResetProgress: () => void;
  onReturnToMenu?: () => void;
  onOpenHudEditor?: (mode: HudEditorMode) => void;
  playerName?: string;
  onChangePlayerName?: (name: string) => void;
  onlineConnected?: boolean;
  onlineRoomCode?: string;
  onlinePlayers?: RemotePlayerSummary[];
  onJoinOnlineRoom?: (opts: { roomCode?: string; createPrivate?: boolean; name?: string }) => void;
  radioStation?: RadioStation;
  onSetRadioStation?: (station: RadioStation) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  open,
  initialTab = 'GRAFICOS',
  settings,
  onClose,
  onUpdateSettings,
  onResetProgress,
  onReturnToMenu,
  onOpenHudEditor,
  playerName = 'GHOST_078',
  onChangePlayerName,
  onlineConnected = false,
  onlineRoomCode = 'PUBLIC',
  onlinePlayers = [],
  onJoinOnlineRoom,
  radioStation = 'OFF',
  onSetRadioStation,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);
  const [confirmReset, setConfirmReset] = useState(false);
  const [capturingAction, setCapturingAction] = useState<KeyAction | null>(null);
  const [hudModeSelect, setHudModeSelect] = useState<HudEditorMode>('HIGHWAY');
  const [hudRestoredBanner, setHudRestoredBanner] = useState(false);
  const [draftName, setDraftName] = useState(playerName);
  const [joinCodeInput, setJoinCodeInput] = useState('');

  useEffect(() => {
    setDraftName(playerName);
  }, [playerName]);

  useEffect(() => {
    if (open) {
      setActiveTab(initialTab);
      setConfirmReset(false);
      setHudRestoredBanner(false);
    }
  }, [open, initialTab]);

  useEffect(() => {
    if (!open || !capturingAction) return;

    const handleCaptureKey = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (e.code === 'Escape') {
        setCapturingAction(null);
        return;
      }

      const newCodes =
        e.code === 'ShiftLeft' || e.code === 'ShiftRight'
          ? ['ShiftLeft', 'ShiftRight']
          : [e.code];

      const currentBindings = settings.keybindings;
      const prevCodes = currentBindings[capturingAction] ?? [];
      const nextBindings: Keybindings = { ...currentBindings };

      (Object.keys(nextBindings) as KeyAction[]).forEach((act) => {
        if (act === capturingAction) return;
        const filtered = (nextBindings[act] ?? []).filter((c) => !newCodes.includes(c));
        if (filtered.length !== (nextBindings[act] ?? []).length) {
          if (filtered.length === 0 && prevCodes.length > 0 && !newCodes.includes(prevCodes[0])) {
            nextBindings[act] = [prevCodes[0]];
          } else {
            nextBindings[act] = filtered.length > 0 ? filtered : nextBindings[act];
          }
        }
      });

      nextBindings[capturingAction] = newCodes;
      onUpdateSettings({ keybindings: nextBindings });
      setCapturingAction(null);
    };

    window.addEventListener('keydown', handleCaptureKey, true);
    return () => window.removeEventListener('keydown', handleCaptureKey, true);
  }, [open, capturingAction, settings.keybindings, onUpdateSettings]);

  if (!open) return null;

  const tabs: Array<{ id: SettingsTab; label: string; icon: React.ReactNode }> = [
    { id: 'GRAFICOS', label: 'Gráficos', icon: <Monitor className="h-3.5 w-3.5" /> },
    { id: 'AUDIO', label: 'Audio', icon: <Volume2 className="h-3.5 w-3.5" /> },
    { id: 'CONTROLES', label: 'Controles', icon: <Gamepad2 className="h-3.5 w-3.5" /> },
    { id: 'CUSTOM_HUD', label: 'CUSTOM HUD', icon: <LayoutTemplate className="h-3.5 w-3.5" /> },
    { id: 'ONLINE', label: 'Online', icon: <Globe className="h-3.5 w-3.5" /> },
    { id: 'DATOS', label: 'Juego / Datos', icon: <Database className="h-3.5 w-3.5" /> },
  ];

  const handleRestoreDefaults = () => {
    setCapturingAction(null);
    onUpdateSettings({
      ...DEFAULT_SETTINGS,
      keybindings: cloneDefaultKeybindings(),
      customHud: cloneDefaultCustomHud(),
    });
  };

  return (
    <div
      className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
    >
      <div className="w-full max-w-2xl border border-white/[0.12] bg-[#090b10] shadow-2xl flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-3.5">
          <div className="flex items-center gap-3">
            <div className="h-6 w-[3px] bg-[#e10600]" />
            <div>
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-slate-400">
                <Sliders className="h-3 w-3 text-[#e10600]" />
                Configuración del Simulador
              </div>
              <h2
                id="settings-modal-title"
                className="font-display text-xl font-semibold tracking-wider text-white uppercase"
              >
                Ajustes
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setConfirmReset(false);
              onClose();
            }}
            className="flex h-8 w-8 items-center justify-center border border-white/[0.1] bg-white/[0.03] text-slate-300 hover:text-white hover:border-white/25 transition-colors cursor-pointer"
            aria-label="Cerrar ajustes"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Strip */}
        <div className="flex items-center border-b border-white/[0.08] bg-[#06080c] px-4 overflow-x-auto">
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setConfirmReset(false);
                  setCapturingAction(null);
                }}
                className={`relative flex items-center gap-2 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.icon}
                {tab.label}
                {active && <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#e10600]" />}
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {activeTab === 'GRAFICOS' && (
            <div className="space-y-5">
              {/* Quality */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium uppercase tracking-[0.14em] text-slate-200">
                    Calidad Gráfica
                  </label>
                  <span className="font-telemetry text-[11px] text-slate-400">
                    {settings.graphicsQuality === 'LOW'
                      ? 'Ahorro / Móvil · 1.0x · Sin Bloom ni Sombras'
                      : settings.graphicsQuality === 'MEDIUM'
                        ? 'Equilibrado · 1.25x · Bloom Suave'
                        : 'Máximo Detalle · 1.5x · Sombras + Bloom'}
                  </span>
                </div>
                <div className="grid grid-cols-3 border border-white/[0.08] bg-[#06080c]">
                  {(['LOW', 'MEDIUM', 'HIGH'] as GraphicsQuality[]).map((q, idx) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => onUpdateSettings({ graphicsQuality: q })}
                      className={`py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors whitespace-nowrap cursor-pointer ${
                        idx > 0 ? 'border-l border-white/[0.08]' : ''
                      } ${
                        settings.graphicsQuality === q
                          ? 'bg-[#e10600] text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {q === 'LOW' ? 'Baja' : q === 'MEDIUM' ? 'Media' : 'Alta'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Exposure / Brightness */}
              <div className="border-t border-white/[0.06] pt-4">
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="setting-exposure"
                    className="text-xs font-medium uppercase tracking-[0.14em] text-slate-200"
                  >
                    Brillo / Exposición PBR
                  </label>
                  <span className="font-telemetry text-xs font-semibold text-white">
                    {settings.exposure.toFixed(2)}
                  </span>
                </div>
                <input
                  id="setting-exposure"
                  type="range"
                  min={0.65}
                  max={1.35}
                  step={0.05}
                  value={settings.exposure}
                  onChange={(e) => onUpdateSettings({ exposure: parseFloat(e.target.value) })}
                  className="w-full accent-[#e10600] cursor-pointer"
                />
                <div className="mt-1 flex justify-between text-[10px] text-slate-500 font-telemetry">
                  <span>0.65 (Oscuro)</span>
                  <span>0.85 (Natural)</span>
                  <span>1.35 (Luminoso)</span>
                </div>
              </div>

              {/* FOV */}
              <div className="border-t border-white/[0.06] pt-4">
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="setting-fov"
                    className="text-xs font-medium uppercase tracking-[0.14em] text-slate-200"
                  >
                    Campo de Visión (FOV)
                  </label>
                  <span className="font-telemetry text-xs font-semibold text-white">
                    {Math.round(settings.fov)}°
                  </span>
                </div>
                <input
                  id="setting-fov"
                  type="range"
                  min={60}
                  max={100}
                  step={2}
                  value={settings.fov}
                  onChange={(e) => onUpdateSettings({ fov: parseInt(e.target.value, 10) })}
                  className="w-full accent-[#e10600] cursor-pointer"
                />
                <div className="mt-1 flex justify-between text-[10px] text-slate-500 font-telemetry">
                  <span>60° (Estrecho)</span>
                  <span>72° (Realista)</span>
                  <span>100° (Sensación Velocidad)</span>
                </div>
              </div>

              {/* View Distance */}
              <div className="border-t border-white/[0.06] pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium uppercase tracking-[0.14em] text-slate-200">
                    Distancia de Visión
                  </span>
                  <span className="font-telemetry text-[11px] text-slate-400">
                    {settings.viewDistance === 'SHORT'
                      ? 'Corta (Máximos FPS)'
                      : settings.viewDistance === 'MEDIUM'
                        ? 'Media (Balanceada)'
                        : 'Lejana (Horizonte Amplio)'}
                  </span>
                </div>
                <div className="grid grid-cols-3 border border-white/[0.08] bg-[#06080c]">
                  {(
                    [
                      { id: 'SHORT', label: 'Corta' },
                      { id: 'MEDIUM', label: 'Media' },
                      { id: 'FAR', label: 'Lejana' },
                    ] as Array<{ id: ViewDistance; label: string }>
                  ).map((vd, idx) => (
                    <button
                      key={vd.id}
                      type="button"
                      onClick={() => onUpdateSettings({ viewDistance: vd.id })}
                      className={`py-2.5 px-2 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors whitespace-nowrap cursor-pointer ${
                        idx > 0 ? 'border-l border-white/[0.08]' : ''
                      } ${
                        settings.viewDistance === vd.id
                          ? 'bg-[#e10600] text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {vd.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Weather / Time of Day */}
              <div className="border-t border-white/[0.06] pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium uppercase tracking-[0.14em] text-slate-200">
                    Hora del Día / Clima
                  </span>
                </div>
                <div className="grid grid-cols-3 border border-white/[0.08] bg-[#06080c]">
                  {(
                    [
                      { id: 'DAY', label: 'Día Claro' },
                      { id: 'SUNSET', label: 'Atardecer' },
                      { id: 'NIGHT', label: 'Noche Urbana' },
                    ] as Array<{ id: WeatherMode; label: string }>
                  ).map((w, idx) => (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => onUpdateSettings({ weather: w.id })}
                      className={`py-2.5 px-2 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors whitespace-nowrap cursor-pointer ${
                        idx > 0 ? 'border-l border-white/[0.08]' : ''
                      } ${
                        settings.weather === w.id
                          ? 'bg-[#e10600] text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {w.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'AUDIO' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between border border-white/[0.08] bg-[#06080c] px-4 py-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-white">
                    Silenciar Todo el Audio
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Desactiva motor, válvulas BOV, explosiones CDI y roces cercanos
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ muted: !settings.muted })}
                  className={`px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] border transition-colors cursor-pointer ${
                    settings.muted
                      ? 'border-[#e10600] bg-[#e10600] text-white'
                      : 'border-white/15 bg-white/[0.04] text-slate-200 hover:border-white/35'
                  }`}
                >
                  {settings.muted ? 'Silenciado' : 'Activo'}
                </button>
              </div>

              {/* Master */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="setting-master-vol"
                    className="text-xs font-medium uppercase tracking-[0.14em] text-slate-200"
                  >
                    Volumen General
                  </label>
                  <span className="font-telemetry text-xs font-semibold text-white">
                    {Math.round(settings.masterVolume * 100)}%
                  </span>
                </div>
                <input
                  id="setting-master-vol"
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={settings.masterVolume}
                  onChange={(e) => onUpdateSettings({ masterVolume: parseFloat(e.target.value) })}
                  className="w-full accent-[#e10600] cursor-pointer"
                />
              </div>

              {/* Engine */}
              <div className="border-t border-white/[0.06] pt-4">
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="setting-engine-vol"
                    className="text-xs font-medium uppercase tracking-[0.14em] text-slate-200"
                  >
                    Motor, Escape y Turbo BOV
                  </label>
                  <span className="font-telemetry text-xs font-semibold text-white">
                    {Math.round(settings.engineVolume * 100)}%
                  </span>
                </div>
                <input
                  id="setting-engine-vol"
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={settings.engineVolume}
                  onChange={(e) => onUpdateSettings({ engineVolume: parseFloat(e.target.value) })}
                  className="w-full accent-[#e10600] cursor-pointer"
                />
              </div>

              {/* SFX */}
              <div className="border-t border-white/[0.06] pt-4">
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="setting-sfx-vol"
                    className="text-xs font-medium uppercase tracking-[0.14em] text-slate-200"
                  >
                    Efectos, Explosiones CDI y Roces Cercanos
                  </label>
                  <span className="font-telemetry text-xs font-semibold text-white">
                    {Math.round(settings.sfxVolume * 100)}%
                  </span>
                </div>
                <input
                  id="setting-sfx-vol"
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={settings.sfxVolume}
                  onChange={(e) => onUpdateSettings({ sfxVolume: parseFloat(e.target.value) })}
                  className="w-full accent-[#e10600] cursor-pointer"
                />
              </div>

              {/* Radio Nocturna Phonk / Synthwave */}
              {onSetRadioStation && (
                <div className="border-t border-white/[0.06] pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.14em] text-slate-200">
                      <Radio className="h-3.5 w-3.5 text-cyan-400" />
                      Radio del Coche (Phonk / Synthwave)
                    </span>
                    <span className="font-telemetry text-[11px] text-cyan-300">{radioStation}</span>
                  </div>
                  <div className="grid grid-cols-3 border border-white/[0.08] bg-[#06080c]">
                    {(
                      [
                        { id: 'OFF', label: 'Apagada' },
                        { id: 'PHONK', label: 'Phonk 130 BPM' },
                        { id: 'SYNTHWAVE', label: 'Synthwave 108 BPM' },
                      ] as Array<{ id: RadioStation; label: string }>
                    ).map((st, idx) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => onSetRadioStation(st.id)}
                        className={`py-2.5 px-2 text-[10.5px] font-semibold uppercase tracking-[0.1em] transition-colors cursor-pointer ${
                          idx > 0 ? 'border-l border-white/[0.08]' : ''
                        } ${
                          radioStation === st.id
                            ? 'bg-cyan-500 text-slate-950 font-bold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'CONTROLES' && (
            <div className="space-y-5">
              {/* Transmission */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium uppercase tracking-[0.14em] text-slate-200">
                    Transmisión por Defecto
                  </span>
                </div>
                <div className="grid grid-cols-2 border border-white/[0.08] bg-[#06080c]">
                  {(['AT', 'MT'] as TransmissionMode[]).map((tr, idx) => (
                    <button
                      key={tr}
                      type="button"
                      onClick={() => onUpdateSettings({ transmission: tr })}
                      className={`py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors cursor-pointer ${
                        idx > 0 ? 'border-l border-white/[0.08]' : ''
                      } ${
                        settings.transmission === tr
                          ? 'bg-[#e10600] text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {tr === 'AT' ? 'Automática (AT)' : 'Manual Secuencial (MT)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Steering Sensitivity */}
              <div className="border-t border-white/[0.06] pt-4">
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="setting-steer-sens"
                    className="text-xs font-medium uppercase tracking-[0.14em] text-slate-200"
                  >
                    Sensibilidad de Dirección
                  </label>
                  <span className="font-telemetry text-xs font-semibold text-white">
                    {settings.steeringSensitivity.toFixed(2)}x
                  </span>
                </div>
                <input
                  id="setting-steer-sens"
                  type="range"
                  min={0.5}
                  max={1.8}
                  step={0.05}
                  value={settings.steeringSensitivity}
                  onChange={(e) =>
                    onUpdateSettings({ steeringSensitivity: parseFloat(e.target.value) })
                  }
                  className="w-full accent-[#e10600] cursor-pointer"
                />
              </div>

              {/* Camera Sensitivity */}
              <div className="border-t border-white/[0.06] pt-4">
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="setting-cam-sens"
                    className="text-xs font-medium uppercase tracking-[0.14em] text-slate-200"
                  >
                    Sensibilidad de Cámara Orbital
                  </label>
                  <span className="font-telemetry text-xs font-semibold text-white">
                    {settings.cameraSensitivity.toFixed(2)}x
                  </span>
                </div>
                <input
                  id="setting-cam-sens"
                  type="range"
                  min={0.5}
                  max={1.8}
                  step={0.05}
                  value={settings.cameraSensitivity}
                  onChange={(e) =>
                    onUpdateSettings({ cameraSensitivity: parseFloat(e.target.value) })
                  }
                  className="w-full accent-[#e10600] cursor-pointer"
                />
              </div>

              {/* Touch Controls Mode */}
              <div className="border-t border-white/[0.06] pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium uppercase tracking-[0.14em] text-slate-200">
                    Controles Táctiles en Pantalla
                  </span>
                  <span className="font-telemetry text-[11px] text-slate-400">
                    {settings.touchControlsMode === 'ALWAYS'
                      ? 'Visibles en todo momento'
                      : 'Automático en móvil / tablet / táctil'}
                  </span>
                </div>
                <div className="grid grid-cols-2 border border-white/[0.08] bg-[#06080c]">
                  {(
                    [
                      { id: 'AUTO', label: 'Auto (Táctil / ≤1024px)' },
                      { id: 'ALWAYS', label: 'Siempre Activos' },
                    ] as Array<{ id: TouchControlsMode; label: string }>
                  ).map((tm, idx) => (
                    <button
                      key={tm.id}
                      type="button"
                      onClick={() => onUpdateSettings({ touchControlsMode: tm.id })}
                      className={`py-2.5 px-2 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors cursor-pointer ${
                        idx > 0 ? 'border-l border-white/[0.08]' : ''
                      } ${
                        settings.touchControlsMode === tm.id
                          ? 'bg-[#e10600] text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {tm.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* TCS */}
              <div className="flex items-center justify-between border border-white/[0.08] bg-[#06080c] px-4 py-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-white">
                    Control de Tracción (TCS)
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Estabiliza el coche en lluvia intensa y giros a alta velocidad
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ tcsEnabled: !settings.tcsEnabled })}
                  className={`px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] border transition-colors cursor-pointer ${
                    settings.tcsEnabled
                      ? 'border-emerald-500/60 bg-emerald-500/15 text-emerald-300'
                      : 'border-white/15 bg-white/[0.04] text-slate-300'
                  }`}
                >
                  {settings.tcsEnabled ? 'Activado' : 'Desactivado'}
                </button>
              </div>

              {/* ABS */}
              <div className="flex items-center justify-between border border-white/[0.08] bg-[#06080c] px-4 py-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-white">
                    Frenos Antibloqueo (ABS)
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Evita el bloqueo de ruedas al frenar a fondo y mantiene el control direccional
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ absEnabled: !settings.absEnabled })}
                  className={`px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] border transition-colors cursor-pointer ${
                    settings.absEnabled
                      ? 'border-emerald-500/60 bg-emerald-500/15 text-emerald-300'
                      : 'border-white/15 bg-white/[0.04] text-slate-300'
                  }`}
                >
                  {settings.absEnabled ? 'Activado' : 'Desactivado'}
                </button>
              </div>

              {/* Interactive Keybindings Assignment */}
              <div className="border border-white/[0.08] bg-[#06080c] p-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] pb-2.5 mb-3">
                  <div>
                    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-[#e10600] font-semibold">
                      <Keyboard className="h-3.5 w-3.5" />
                      Asignación de Teclas (Keybindings)
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Haz clic en cualquier botón y pulsa la nueva tecla (Esc cancela)
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setCapturingAction(null);
                      onUpdateSettings({ keybindings: cloneDefaultKeybindings() });
                    }}
                    className="flex items-center gap-1.5 border border-white/[0.12] bg-white/[0.04] px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-200 hover:border-white/30 hover:text-white transition-colors cursor-pointer"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Restaurar teclas por defecto
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {KEY_ACTION_META.map((meta) => {
                    const isCapturing = capturingAction === meta.action;
                    const codes = settings.keybindings[meta.action] ?? [];
                    return (
                      <div
                        key={meta.action}
                        className="flex items-center justify-between gap-2 border border-white/[0.06] bg-white/[0.02] px-2.5 py-2"
                      >
                        <div className="min-w-0">
                          <div className="text-[11px] font-medium text-white truncate">
                            {meta.label}
                          </div>
                          <div className="text-[9px] text-slate-500 truncate">
                            {meta.desc}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setCapturingAction(isCapturing ? null : meta.action)
                          }
                          className={`shrink-0 min-w-[96px] border px-2.5 py-1 font-telemetry text-[10px] font-bold uppercase tracking-wider text-center transition-colors cursor-pointer ${
                            isCapturing
                              ? 'border-[#e10600] bg-[#e10600] text-white'
                              : 'border-white/15 bg-black/50 text-slate-100 hover:border-white/40'
                          }`}
                        >
                          {isCapturing ? 'Pulsa una tecla...' : formatKeybindingDisplay(codes)}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'CUSTOM_HUD' && (
            <div className="space-y-5">
              <div className="border border-white/[0.08] bg-[#06080c] p-4">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#e10600]">
                  <Move className="h-3.5 w-3.5" />
                  Personalización Competitiva de HUD Táctil y Tacómetro
                </div>
                <p className="mt-1.5 text-xs text-slate-300 leading-relaxed">
                  Mueve, escala y ajusta la opacidad de cada botón táctil y personaliza los colores,
                  números e indicador de marcha del tacómetro en tiempo real sobre la pista 3D.
                </p>
              </div>

              {/* Mode Selector */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium uppercase tracking-[0.14em] text-slate-200">
                    Modo de Juego a Editar
                  </span>
                  <span className="font-telemetry text-[11px] text-cyan-300">
                    {hudModeSelect === 'HIGHWAY' ? '9 elementos' : '3 elementos'}
                  </span>
                </div>
                <div className="grid grid-cols-2 border border-white/[0.08] bg-[#06080c]">
                  {(
                    [
                      { id: 'HIGHWAY', label: 'AUTOPISTA / CONDUCCIÓN' },
                      { id: 'WALKING', label: 'A PIE / GARAJE' },
                    ] as Array<{ id: HudEditorMode; label: string }>
                  ).map((m, idx) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setHudModeSelect(m.id)}
                      className={`py-3 px-2 text-[11px] font-bold uppercase tracking-[0.12em] transition-colors cursor-pointer ${
                        idx > 0 ? 'border-l border-white/[0.08]' : ''
                      } ${
                        hudModeSelect === m.id
                          ? 'bg-[#e10600] text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tachometer Summary Snapshot */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border border-white/[0.08] bg-[#06080c] p-3">
                <div className="flex items-center gap-2">
                  <span
                    className="h-4 w-4 border border-white/25 shrink-0"
                    style={{ backgroundColor: settings.customHud.tachometerStyle.accentColor }}
                  />
                  <div className="min-w-0">
                    <div className="text-[9px] uppercase text-slate-400">Acento</div>
                    <div className="font-telemetry text-[10px] font-bold text-white truncate">
                      {settings.customHud.tachometerStyle.accentColor}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="h-4 w-4 border border-white/25 shrink-0"
                    style={{ backgroundColor: settings.customHud.tachometerStyle.needleColor }}
                  />
                  <div className="min-w-0">
                    <div className="text-[9px] uppercase text-slate-400">Aguja</div>
                    <div className="font-telemetry text-[10px] font-bold text-white truncate">
                      {settings.customHud.tachometerStyle.needleColor}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-[9px] uppercase text-slate-400">Escala Reloj</div>
                  <div className="font-telemetry text-[11px] font-bold text-white">
                    {settings.customHud.speedometer.scale.toFixed(2)}x
                  </div>
                </div>
                <div>
                  <div className="text-[9px] uppercase text-slate-400">Fondo Reloj</div>
                  <div className="font-telemetry text-[11px] font-bold text-white">
                    {Math.round(settings.customHud.tachometerStyle.faceOpacity * 100)}%
                  </div>
                </div>
              </div>

              {/* Primary Open Editor + Reset HUD Buttons */}
              <div className="space-y-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setConfirmReset(false);
                    onClose();
                    onOpenHudEditor?.(hudModeSelect);
                  }}
                  className="flex w-full items-center justify-center gap-2 bg-[#e10600] py-3.5 px-4 text-xs font-extrabold uppercase tracking-[0.18em] text-white shadow-lg hover:bg-[#ff1812] transition-colors cursor-pointer"
                >
                  <LayoutTemplate className="h-4 w-4" />
                  ABRIR EDITOR DE HUD EN PANTALLA
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onUpdateSettings({ customHud: cloneDefaultCustomHud() });
                    setHudRestoredBanner(true);
                    window.setTimeout(() => setHudRestoredBanner(false), 2000);
                  }}
                  className="flex w-full items-center justify-center gap-2 border border-white/15 bg-white/[0.04] py-2.5 px-4 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-200 hover:border-white/35 hover:text-white transition-colors cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  {hudRestoredBanner
                    ? 'HUD RESTAURADO POR DEFECTO ✓'
                    : 'RESTAURAR HUD POR DEFECTO'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'ONLINE' && (
            <div className="space-y-4">
              {/* Connection Status + Current Room */}
              <div className="flex flex-wrap items-center justify-between gap-3 border border-white/[0.08] bg-[#06080c] p-4">
                <div>
                  <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em]">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        onlineConnected ? 'bg-emerald-400' : 'bg-amber-400'
                      }`}
                    />
                    <span className={onlineConnected ? 'text-emerald-300' : 'text-amber-300'}>
                      {onlineConnected
                        ? 'Multijugador Cross-Play PC / Móvil Conectado'
                        : 'Conectando al servidor WebSocket...'}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-slate-400">
                    Sala activa:{' '}
                    <span className="font-telemetry font-bold text-white">
                      {onlineRoomCode}
                    </span>{' '}
                    · Jugadores en pista:{' '}
                    <span className="font-telemetry font-bold text-cyan-300">
                      {onlinePlayers.length + (onlineConnected ? 1 : 0)}
                    </span>
                  </div>
                </div>

                {onJoinOnlineRoom && (
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        onJoinOnlineRoom({ roomCode: 'PUBLIC', name: draftName.trim() || playerName })
                      }
                      className={`border px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-wider cursor-pointer ${
                        onlineRoomCode === 'PUBLIC'
                          ? 'border-emerald-400 bg-emerald-500/20 text-emerald-200'
                          : 'border-white/15 bg-white/[0.04] text-slate-200 hover:border-white/35'
                      }`}
                    >
                      Sala Pública
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onJoinOnlineRoom({ createPrivate: true, name: draftName.trim() || playerName })
                      }
                      className="bg-[#e10600] px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-wider text-white hover:bg-[#ff1812] cursor-pointer"
                    >
                      Crear Sala Privada
                    </button>
                  </div>
                )}
              </div>

              {/* Nickname + Private Room Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="border border-white/[0.08] bg-[#06080c] p-3.5">
                  <label
                    htmlFor="online-nickname"
                    className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400 mb-1.5"
                  >
                    Nombre de Piloto Online
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="online-nickname"
                      type="text"
                      maxLength={16}
                      value={draftName}
                      onChange={(e) =>
                        setDraftName(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ''))
                      }
                      className="flex-1 border border-white/15 bg-black/60 px-3 py-1.5 font-telemetry text-xs font-bold text-white uppercase focus:border-cyan-400 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const clean = draftName.trim() || 'GHOST_078';
                        onChangePlayerName?.(clean);
                        onJoinOnlineRoom?.({ roomCode: onlineRoomCode, name: clean });
                      }}
                      className="border border-cyan-400/50 bg-cyan-500/15 px-3 py-1.5 text-[10.5px] font-bold uppercase text-cyan-200 hover:bg-cyan-500/30 cursor-pointer"
                    >
                      Aplicar
                    </button>
                  </div>
                </div>

                <div className="border border-white/[0.08] bg-[#06080c] p-3.5">
                  <label
                    htmlFor="online-room-code"
                    className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400 mb-1.5"
                  >
                    Unirse por Código de Sala
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="online-room-code"
                      type="text"
                      maxLength={10}
                      value={joinCodeInput}
                      onChange={(e) =>
                        setJoinCodeInput(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))
                      }
                      placeholder="Ej. X9K2P"
                      className="flex-1 border border-white/15 bg-black/60 px-3 py-1.5 font-telemetry text-xs font-bold tracking-widest text-white uppercase focus:border-[#e10600] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const code = joinCodeInput.trim();
                        if (!code) return;
                        onJoinOnlineRoom?.({
                          roomCode: code,
                          name: draftName.trim() || playerName,
                        });
                      }}
                      className="bg-white/[0.08] border border-white/15 px-3 py-1.5 text-[10.5px] font-bold uppercase text-white hover:border-white/35 cursor-pointer"
                    >
                      Entrar
                    </button>
                  </div>
                </div>
              </div>

              {/* Active Room Leaderboard / Players */}
              <div className="border border-white/[0.08] bg-[#06080c] p-3.5">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                    <Users className="h-3.5 w-3.5 text-cyan-400" />
                    Pilotos en Sala ({onlinePlayers.length})
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Destella largas [L] cerca de un rival en el Highway para iniciar Duelo
                  </span>
                </div>

                {onlinePlayers.length === 0 ? (
                  <div className="border border-white/[0.05] bg-black/40 p-4 text-center text-xs text-slate-400">
                    Eres el primer piloto conectado en esta sala. Comparte el código{' '}
                    <span className="font-telemetry font-bold text-white">{onlineRoomCode}</span>{' '}
                    con amigos en PC o Móvil.
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {onlinePlayers.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between border border-white/[0.06] bg-black/40 px-3 py-2 text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {p.isKing && <Crown className="h-3.5 w-3.5 text-amber-400 shrink-0" />}
                          <span className="font-telemetry font-bold text-white truncate">
                            {p.name}
                          </span>
                          <span className="text-[10px] uppercase text-slate-400">
                            {p.mode === 'HIGHWAY'
                              ? `${p.speedKmh} km/h`
                              : p.inCarMeet
                                ? 'Car Meet'
                                : 'Parking'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 font-telemetry text-[11px] shrink-0">
                          <span className="text-amber-300">{p.score} pts</span>
                          <span className="text-pink-300">♥ {p.likes}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'DATOS' && (
            <div className="space-y-5">
              {/* Speed Units */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium uppercase tracking-[0.14em] text-slate-200">
                    Unidades de Velocidad
                  </span>
                </div>
                <div className="grid grid-cols-2 border border-white/[0.08] bg-[#06080c]">
                  {(['KMH', 'MPH'] as SpeedUnits[]).map((u, idx) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => onUpdateSettings({ speedUnits: u })}
                      className={`py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors cursor-pointer ${
                        idx > 0 ? 'border-l border-white/[0.08]' : ''
                      } ${
                        settings.speedUnits === u
                          ? 'bg-[#e10600] text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {u === 'KMH' ? 'Kilómetros / hora (KM/H)' : 'Millas / hora (MPH)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* HUD Toggles */}
              <div className="space-y-2.5 border-t border-white/[0.06] pt-4">
                <div className="flex items-center justify-between border border-white/[0.08] bg-[#06080c] px-4 py-3">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.14em] text-white">
                      Velocímetro y Telemetría
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Cluster central con tacómetro RPM, marcha, combo y nitro
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ showSpeedometer: !settings.showSpeedometer })}
                    className={`px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] border transition-colors cursor-pointer ${
                      settings.showSpeedometer
                        ? 'border-emerald-500/60 bg-emerald-500/15 text-emerald-300'
                        : 'border-white/15 bg-white/[0.04] text-slate-300'
                    }`}
                  >
                    {settings.showSpeedometer ? 'Visible' : 'Oculto'}
                  </button>
                </div>
              </div>

              {/* Reset Progress */}
              <div className="border-t border-white/[0.08] pt-4">
                <div className="border border-red-500/30 bg-red-950/20 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-red-300">
                        Reiniciar Progreso del Perfil
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Restaura créditos ($12,500), garaje inicial (Karin Kuruma 2008) y piezas Stock.
                      </div>
                    </div>

                    {!confirmReset ? (
                      <button
                        type="button"
                        onClick={() => setConfirmReset(true)}
                        className="border border-red-500/50 bg-red-600/20 px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-red-200 hover:bg-red-600 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        Reiniciar Datos
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setConfirmReset(false)}
                          className="border border-white/15 bg-white/[0.04] px-3 py-1.5 text-[11px] font-semibold uppercase text-slate-300 hover:text-white cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onResetProgress();
                            setConfirmReset(false);
                          }}
                          className="flex items-center gap-1.5 bg-[#e10600] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white hover:bg-[#ff1812] cursor-pointer"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Confirmar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.08] bg-[#06080c] px-5 py-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRestoreDefaults}
              className="flex items-center gap-1.5 border border-white/[0.1] bg-white/[0.03] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-300 hover:text-white hover:border-white/25 transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              Restaurar Predeterminados
            </button>

            {onReturnToMenu && (
              <button
                type="button"
                onClick={() => {
                  setConfirmReset(false);
                  onClose();
                  onReturnToMenu();
                }}
                className="border border-white/[0.1] bg-white/[0.03] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-300 hover:text-white hover:border-white/25 transition-colors cursor-pointer"
              >
                Menú Principal
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              setConfirmReset(false);
              onClose();
            }}
            className="bg-[#e10600] px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white hover:bg-[#ff1812] transition-colors cursor-pointer"
          >
            Guardar y Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
