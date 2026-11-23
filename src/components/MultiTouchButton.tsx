import React, { useCallback, useEffect, useRef, useState } from 'react';
import { TouchControlsMode } from '../game/types';

export function detectTouchCapabilities(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    'ontouchstart' in window ||
    (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0) ||
    window.innerWidth <= 1024
  );
}

export function useTouchControlsActive(mode: TouchControlsMode): boolean {
  const [active, setActive] = useState<boolean>(() =>
    mode === 'ALWAYS' ? true : detectTouchCapabilities()
  );

  useEffect(() => {
    if (mode === 'ALWAYS') {
      setActive(true);
      return;
    }
    const update = () => setActive(detectTouchCapabilities());
    update();
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, [mode]);

  return active;
}

interface MultiTouchHoldButtonProps {
  onHoldChange: (active: boolean) => void;
  style?: React.CSSProperties;
  className?: string;
  activeClassName?: string;
  ariaLabel: string;
  children: React.ReactNode;
}

/**
 * Competitive mobile hold button with independent TouchEvent.identifier tracking.
 * Allows steering + throttle + brake + nitro to be held simultaneously by different fingers
 * without pointer-leave dropouts or cross-finger interference.
 */
export const MultiTouchHoldButton: React.FC<MultiTouchHoldButtonProps> = ({
  onHoldChange,
  style,
  className = '',
  activeClassName = '',
  ariaLabel,
  children,
}) => {
  const activeTouchIdsRef = useRef<Set<number>>(new Set());
  const mouseHeldRef = useRef(false);
  const isHeldRef = useRef(false);
  const onHoldChangeRef = useRef(onHoldChange);
  onHoldChangeRef.current = onHoldChange;

  const [pressed, setPressed] = useState(false);

  const syncHeldState = useCallback(() => {
    const nextHeld = activeTouchIdsRef.current.size > 0 || mouseHeldRef.current;
    if (nextHeld !== isHeldRef.current) {
      isHeldRef.current = nextHeld;
      setPressed(nextHeld);
      onHoldChangeRef.current(nextHeld);
    }
  }, []);

  const forceRelease = useCallback(() => {
    activeTouchIdsRef.current.clear();
    mouseHeldRef.current = false;
    if (isHeldRef.current) {
      isHeldRef.current = false;
      setPressed(false);
      onHoldChangeRef.current(false);
    }
  }, []);

  useEffect(() => {
    const handleMouseUp = () => {
      if (!mouseHeldRef.current) return;
      mouseHeldRef.current = false;
      syncHeldState();
    };
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('blur', forceRelease);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('blur', forceRelease);
      forceRelease();
    };
  }, [forceRelease, syncHeldState]);

  const handleTouchStart = (e: React.TouchEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    for (let i = 0; i < e.changedTouches.length; i++) {
      activeTouchIdsRef.current.add(e.changedTouches[i].identifier);
    }
    syncHeldState();
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLButtonElement>) => {
    e.stopPropagation();
  };

  const handleTouchEndOrCancel = (e: React.TouchEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    for (let i = 0; i < e.changedTouches.length; i++) {
      activeTouchIdsRef.current.delete(e.changedTouches[i].identifier);
    }
    syncHeldState();
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    mouseHeldRef.current = true;
    syncHeldState();
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.stopPropagation();
  };

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-pressed={pressed}
      style={{ ...style, touchAction: 'none' }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEndOrCancel}
      onTouchCancel={handleTouchEndOrCancel}
      onMouseDown={handleMouseDown}
      onPointerDown={handlePointerDown}
      onContextMenu={(e) => e.preventDefault()}
      className={`${className} ${pressed ? activeClassName : ''}`}
    >
      {children}
    </button>
  );
};
