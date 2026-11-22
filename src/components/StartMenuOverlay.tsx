import React, { useState } from 'react';
import { CarFront, Check, Gamepad2, Play, Settings, X } from 'lucide-react';
import {
  CAR_CATALOG,
  createDefaultCarState,
  getCarEffectiveHp,
  getCarEffectiveTopSpeed,
  SaveProfile,
} from '../game/types';

interface StartMenuOverlayProps {
  profile: SaveProfile;
  onStart: () => void;
  onOpenConfig: () => void;
  onOpenControls: () => void;
  onSelectCar: (carId: string) => void;
}

export const StartMenuOverlay: React.FC<StartMenuOverlayProps> = ({
  profile,
  onStart,
  onOpenConfig,
  onOpenControls,
  onSelectCar,
}) => {
  const [garageOpen, setGarageOpen] = useState(false);
  const activeSpec = CAR_CATALOG[profile.activeCarId] ?? CAR_CATALOG.kuruma_2008;
  const ownedSpecs = Object.values(CAR_CATALOG).filter((c) =>
    profile.ownedCars.includes(c.id)
  );

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between p-5 md:p-9">
      {/* Subtle top & bottom dark vignettes leaving the nocturnal paddock 3D scene bright & clear */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-40"
        style={{
          background:
            'linear-gradient(180deg, rgba(4,7,13,0.78) 0%, rgba(4,7,13,0.32) 60%, rgba(4,7,13,0) 100%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-44"
        style={{
          background:
            'linear-gradient(0deg, rgba(4,7,13,0.88) 0%, rgba(4,7,13,0.42) 62%, rgba(4,7,13,0) 100%)',
        }}
      />

      {/* Top-Left Stylized "GHOST DRIVER" Logo + Top-Right Cash Readout */}
      <header className="relative flex items-start justify-between gap-4">
        <div className="select-none">
          <div className="flex items-center gap-2.5">
            <span className="h-[2px] w-7 bg-cyan-400" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-300">
              Wangan Night Syndicate
            </span>
          </div>
          <h1
            className="font-display mt-1 text-4xl sm:text-5xl md:text-6xl font-black italic uppercase tracking-[0.06em] text-white leading-none"
            style={{
              textShadow: '0 4px 22px rgba(6,182,212,0.28), 0 2px 6px rgba(0,0,0,0.85)',
            }}
          >
            GHOST <span className="text-cyan-400">DRIVER</span>
          </h1>
          <div className="mt-1.5 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em] text-slate-300">
            <span>{activeSpec.brand}</span>
            <span className="text-slate-500">·</span>
            <span className="text-white">{activeSpec.name}</span>
          </div>
        </div>

        <div className="border border-cyan-400/35 bg-[#060910]/85 px-4 py-2 text-right shadow-lg">
          <div className="text-[9px] font-semibold uppercase tracking-[0.22em] text-slate-400">
            Créditos
          </div>
          <div className="font-telemetry text-lg font-bold tabular-nums text-white">
            ${profile.cash.toLocaleString()}
          </div>
        </div>
      </header>

      {/* Inline Lobby Garage Selector Drawer (previews vehicle live on Lobby asphalt) */}
      {garageOpen && (
        <div className="pointer-events-auto relative my-auto ml-0 w-full max-w-md border border-cyan-400/45 bg-[#060910]/92 p-4 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-3">
            <div>
              <div className="text-[9px] font-bold uppercase tracking-[0.22em] text-cyan-300">
                Garaje Activo
              </div>
              <h2 className="font-display text-base font-bold uppercase tracking-[0.12em] text-white">
                Seleccionar Vehículo ({ownedSpecs.length})
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setGarageOpen(false)}
              className="flex h-7 w-7 items-center justify-center border border-white/15 bg-white/[0.04] text-slate-300 hover:border-cyan-400/60 hover:text-white cursor-pointer"
              aria-label="Cerrar garaje"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
            {ownedSpecs.map((spec) => {
              const st = profile.cars[spec.id] ?? createDefaultCarState(spec);
              const isActive = spec.id === profile.activeCarId;
              const hp = getCarEffectiveHp(spec, st);
              const topSpeed = getCarEffectiveTopSpeed(spec, st);
              return (
                <button
                  key={spec.id}
                  type="button"
                  onClick={() => onSelectCar(spec.id)}
                  className={`flex w-full items-center justify-between border px-3 py-2 text-left transition-colors cursor-pointer ${
                    isActive
                      ? 'border-cyan-400 bg-cyan-500/15 text-white'
                      : 'border-white/10 bg-black/40 text-slate-200 hover:border-cyan-400/45 hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="h-3.5 w-3.5 shrink-0 border border-white/30"
                      style={{ backgroundColor: st?.paint ?? spec.defaultPaint }}
                    />
                    <div className="min-w-0">
                      <div className="truncate text-xs font-bold uppercase tracking-wider">
                        {spec.name}
                      </div>
                      <div className="font-telemetry text-[10px] tabular-nums text-slate-400">
                        {hp} HP · {topSpeed} km/h
                      </div>
                    </div>
                  </div>
                  {isActive && (
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-cyan-300 shrink-0">
                      <Check className="h-3.5 w-3.5" />
                      Equipado
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom Aligned Action Bar: CONFIGURACIÓN, CONTROLES, GARAJE + Yellow-Lime JUGAR */}
      <footer className="relative flex flex-wrap items-center justify-between gap-3 pt-4">
        <div className="pointer-events-auto flex flex-wrap items-center gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={onOpenConfig}
            className="flex items-center gap-2 border border-cyan-400/55 bg-black/75 px-5 py-3 text-xs sm:text-sm font-bold uppercase tracking-[0.16em] text-slate-100 hover:border-cyan-300 hover:bg-black/90 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-lg"
          >
            <Settings className="h-4 w-4 text-cyan-400" />
            CONFIGURACIÓN
          </button>

          <button
            type="button"
            onClick={onOpenControls}
            className="flex items-center gap-2 border border-cyan-400/55 bg-black/75 px-5 py-3 text-xs sm:text-sm font-bold uppercase tracking-[0.16em] text-slate-100 hover:border-cyan-300 hover:bg-black/90 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-lg"
          >
            <Gamepad2 className="h-4 w-4 text-cyan-400" />
            CONTROLES
          </button>

          <button
            type="button"
            onClick={() => setGarageOpen((v) => !v)}
            className={`flex items-center gap-2 border px-5 py-3 text-xs sm:text-sm font-bold uppercase tracking-[0.16em] transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-lg ${
              garageOpen
                ? 'border-cyan-300 bg-cyan-500/20 text-white'
                : 'border-cyan-400/55 bg-black/75 text-slate-100 hover:border-cyan-300 hover:bg-black/90 hover:text-white'
            }`}
          >
            <CarFront className="h-4 w-4 text-cyan-400" />
            GARAJE
          </button>
        </div>

        <div className="pointer-events-auto">
          <button
            type="button"
            onClick={onStart}
            className="flex items-center gap-3 border border-lime-200/70 px-10 py-3.5 text-sm sm:text-base font-black uppercase tracking-[0.22em] text-slate-950 transition-transform hover:scale-[1.02] active:scale-[0.99] whitespace-nowrap shrink-0 cursor-pointer shadow-[0_8px_28px_rgba(163,230,53,0.38)]"
            style={{
              background:
                'linear-gradient(135deg, #facc15 0%, #bef264 55%, #84cc16 100%)',
            }}
          >
            <Play className="h-4 w-4 fill-current" />
            JUGAR
          </button>
        </div>
      </footer>
    </div>
  );
};
