import React, { useCallback, useEffect, useRef, useState } from 'react';
import { HudElementLayout } from '../game/types';

export type WalkDirectionKey = 'throttle' | 'brake' | 'left' | 'right';

interface VirtualJoystickProps {
  onTouchWalk: (key: WalkDirectionKey, active: boolean) => void;
  layout?: HudElementLayout;
}

interface DirectionState {
  throttle: boolean;
  brake: boolean;
  left: boolean;
  right: boolean;
}

const BASE_SIZE_PX = 120;
const BASE_RADIUS_PX = BASE_SIZE_PX / 2;
const KNOB_RADIUS_PX = 24;
const MAX_TRAVEL_PX = BASE_RADIUS_PX - KNOB_RADIUS_PX * 0.55; // ~46.8px inside 60px radius
const DEADZONE_RATIO = 0.2;
const SECTOR_THRESHOLD = Math.sin(Math.PI / 8); // ~0.3827 -> 8 exact 45° sectors

const IDLE_DIRECTIONS: DirectionState = {
  throttle: false,
  brake: false,
  left: false,
  right: false,
};

export const VirtualJoystick: React.FC<VirtualJoystickProps> = ({ onTouchWalk, layout }) => {
  const baseRef = useRef<HTMLDivElement | null>(null);
  const activeTouchIdRef = useRef<number | null>(null);
  const mouseDraggingRef = useRef(false);
  const lastDirsRef = useRef<DirectionState>({ ...IDLE_DIRECTIONS });
  const onTouchWalkRef = useRef(onTouchWalk);
  onTouchWalkRef.current = onTouchWalk;

  const [stickOffset, setStickOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isActive, setIsActive] = useState(false);

  const commitDirections = useCallback((next: DirectionState) => {
    const prev = lastDirsRef.current;
    const keys: WalkDirectionKey[] = ['throttle', 'brake', 'left', 'right'];
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      if (prev[k] !== next[k]) {
        onTouchWalkRef.current(k, next[k]);
      }
    }
    lastDirsRef.current = next;
  }, []);

  const resetAllDirections = useCallback(() => {
    const keys: WalkDirectionKey[] = ['throttle', 'brake', 'left', 'right'];
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      if (lastDirsRef.current[k]) {
        onTouchWalkRef.current(k, false);
      }
    }
    lastDirsRef.current = { ...IDLE_DIRECTIONS };
  }, []);

  const updateFromClientPos = useCallback(
    (clientX: number, clientY: number) => {
      const el = baseRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const effectiveScale = rect.width > 0 ? rect.width / BASE_SIZE_PX : 1;

      const rawDx = (clientX - centerX) / effectiveScale;
      const rawDy = (clientY - centerY) / effectiveScale;
      const dist = Math.hypot(rawDx, rawDy);

      let clampedX = rawDx;
      let clampedY = rawDy;
      if (dist > MAX_TRAVEL_PX && dist > 0) {
        const scale = MAX_TRAVEL_PX / dist;
        clampedX = rawDx * scale;
        clampedY = rawDy * scale;
      }

      setStickOffset({ x: clampedX, y: clampedY });

      const magnitude = Math.min(1, dist / MAX_TRAVEL_PX);
      if (magnitude < DEADZONE_RATIO || dist === 0) {
        commitDirections(IDLE_DIRECTIONS);
        return;
      }

      // Standard polar angle: +X right, -Y up (forward = throttle), +Y down (backward = brake)
      const angle = Math.atan2(-clampedY, clampedX);
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      commitDirections({
        throttle: sinA >= SECTOR_THRESHOLD,
        brake: sinA <= -SECTOR_THRESHOLD,
        right: cosA >= SECTOR_THRESHOLD,
        left: cosA <= -SECTOR_THRESHOLD,
      });
    },
    [commitDirections]
  );

  const releaseJoystick = useCallback(() => {
    activeTouchIdRef.current = null;
    mouseDraggingRef.current = false;
    setIsActive(false);
    setStickOffset({ x: 0, y: 0 });
    resetAllDirections();
  }, [resetAllDirections]);

  useEffect(() => {
    const handleWindowMouseMove = (e: MouseEvent) => {
      if (!mouseDraggingRef.current) return;
      updateFromClientPos(e.clientX, e.clientY);
    };

    const handleWindowMouseUp = () => {
      if (!mouseDraggingRef.current) return;
      releaseJoystick();
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
    window.addEventListener('blur', handleWindowMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
      window.removeEventListener('blur', handleWindowMouseUp);
      resetAllDirections();
    };
  }, [releaseJoystick, resetAllDirections, updateFromClientPos]);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (activeTouchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    if (!touch) return;
    activeTouchIdRef.current = touch.identifier;
    setIsActive(true);
    updateFromClientPos(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const touchId = activeTouchIdRef.current;
    if (touchId === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      if (t.identifier === touchId) {
        updateFromClientPos(t.clientX, t.clientY);
        return;
      }
    }
    for (let i = 0; i < e.touches.length; i++) {
      const t = e.touches[i];
      if (t.identifier === touchId) {
        updateFromClientPos(t.clientX, t.clientY);
        return;
      }
    }
  };

  const handleTouchEndOrCancel = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const touchId = activeTouchIdRef.current;
    if (touchId === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === touchId) {
        releaseJoystick();
        return;
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    mouseDraggingRef.current = true;
    setIsActive(true);
    updateFromClientPos(e.clientX, e.clientY);
  };

  const positionedStyle: React.CSSProperties = layout
    ? {
        touchAction: 'none',
        left: `${layout.x}%`,
        top: `${layout.y}%`,
        opacity: layout.opacity,
        transform: `translate(-50%, -50%) scale(${layout.scale})`,
      }
    : { touchAction: 'none' };

  return (
    <div
      ref={baseRef}
      role="application"
      aria-label="Joystick virtual de movimiento"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEndOrCancel}
      onTouchCancel={handleTouchEndOrCancel}
      onMouseDown={handleMouseDown}
      onPointerDown={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.preventDefault()}
      style={positionedStyle}
      className={`pointer-events-auto fixed z-20 flex h-[120px] w-[120px] touch-none select-none items-center justify-center rounded-full border border-white/15 bg-slate-950/75 shadow-2xl backdrop-blur-md cursor-grab active:cursor-grabbing ${
        layout ? '' : 'bottom-6 left-6'
      }`}
    >
      {/* Subtle Inner Deadzone Ring & Directional Crosshair */}
      <div className="pointer-events-none absolute h-[24px] w-[24px] rounded-full border border-white/10" />
      <div className="pointer-events-none absolute inset-3 rounded-full border border-white/[0.06]" />
      <span className="pointer-events-none absolute top-2 text-[8px] font-bold text-slate-500">
        ▲
      </span>
      <span className="pointer-events-none absolute bottom-2 text-[8px] font-bold text-slate-500">
        ▼
      </span>
      <span className="pointer-events-none absolute left-2 text-[8px] font-bold text-slate-500">
        ◀
      </span>
      <span className="pointer-events-none absolute right-2 text-[8px] font-bold text-slate-500">
        ▶
      </span>

      {/* Movable Inner Stick */}
      <div
        className={`pointer-events-none h-12 w-12 rounded-full border shadow-lg ${
          isActive
            ? 'border-[#e10600]/80 bg-white/25 transition-none shadow-[0_0_16px_rgba(225,6,0,0.45)]'
            : 'border-white/25 bg-white/15 transition-transform duration-150 ease-out'
        }`}
        style={{
          transform: `translate3d(${stickOffset.x.toFixed(1)}px, ${stickOffset.y.toFixed(1)}px, 0)`,
        }}
      >
        <div className="mx-auto mt-3.5 h-4 w-4 rounded-full bg-white/30" />
      </div>
    </div>
  );
};
