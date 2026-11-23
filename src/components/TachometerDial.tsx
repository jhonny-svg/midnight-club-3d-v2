import React, { useId } from 'react';
import {
  DEFAULT_TACHOMETER_STYLE,
  TachometerStyleConfig,
  TransmissionMode,
} from '../game/types';

interface TachometerDialProps {
  speedDisplay: number;
  speedUnitLabel: string;
  rpm: number;
  maxRpm: number;
  gear: number;
  nitro: number;
  activeTx: TransmissionMode;
  tcsEnabled: boolean;
  cdiRacing: boolean;
  revLimiterActive: boolean;
  styleConfig?: TachometerStyleConfig;
  className?: string;
}

const DIAL_START_DEG = 135;
const DIAL_SWEEP_DEG = 270;

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngleDeg: number,
  endAngleDeg: number,
  clockwise = true
): string {
  const diff = Math.abs(endAngleDeg - startAngleDeg);
  if (diff < 0.25) return '';
  const start = polarToCartesian(cx, cy, r, startAngleDeg);
  const end = polarToCartesian(cx, cy, r, endAngleDeg);
  const largeArc = diff > 180 ? 1 : 0;
  const sweepFlag = clockwise ? 1 : 0;
  return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${r} ${r} 0 ${largeArc} ${sweepFlag} ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
}

function formatGear(gear: number): string {
  if (gear < 0) return 'R';
  if (gear === 0) return 'N';
  return String(gear);
}

export const TachometerDial: React.FC<TachometerDialProps> = ({
  speedDisplay,
  speedUnitLabel,
  rpm,
  maxRpm,
  gear,
  nitro,
  activeTx,
  tcsEnabled,
  cdiRacing,
  revLimiterActive,
  styleConfig = DEFAULT_TACHOMETER_STYLE,
  className = 'relative h-[188px] w-[188px] sm:h-[214px] sm:w-[214px] md:h-[238px] md:w-[238px] select-none',
}) => {
  const uid = useId().replace(/:/g, '');
  const dialBgId = `acDialBg_${uid}`;
  const rpmSweepId = `acRpmSweep_${uid}`;

  const {
    accentColor,
    numberColor,
    needleColor,
    showNumbers,
    showGear,
    faceOpacity,
  } = styleConfig;

  const dialMaxRpm = Math.max(8000, Math.ceil(maxRpm / 1000) * 1000);
  const dialRedlineRpm = Math.max(5500, maxRpm - 900);
  const majorTickCount = Math.round(dialMaxRpm / 1000);
  const totalHalfTicks = majorTickCount * 2 + 1;

  const clampedRpm = Math.min(dialMaxRpm, Math.max(0, rpm));
  const rpmRatio = clampedRpm / dialMaxRpm;
  const needleDeg = DIAL_START_DEG + rpmRatio * DIAL_SWEEP_DEG;
  const redlineStartDeg = DIAL_START_DEG + (dialRedlineRpm / dialMaxRpm) * DIAL_SWEEP_DEG;
  const dialEndDeg = DIAL_START_DEG + DIAL_SWEEP_DEG;

  const isRedline = clampedRpm >= dialRedlineRpm;
  const turboSpooling = clampedRpm >= 4200;

  const rpmBgPath = describeArc(120, 120, 90, DIAL_START_DEG, dialEndDeg);
  const redlineTrackPath = describeArc(120, 120, 90, redlineStartDeg, dialEndDeg);
  const rpmActivePath = describeArc(
    120,
    120,
    90,
    DIAL_START_DEG,
    Math.max(DIAL_START_DEG + 0.5, needleDeg)
  );

  const nitroStartDeg = 144;
  const nitroMaxDeg = 216;
  const nitroRatio = Math.min(1, Math.max(0, nitro / 100));
  const nitroFillDeg = nitroStartDeg + (nitroMaxDeg - nitroStartDeg) * nitroRatio;
  const nitroTrackPath = describeArc(120, 120, 108, nitroStartDeg, nitroMaxDeg);
  const nitroFillPath = describeArc(
    120,
    120,
    108,
    nitroStartDeg,
    Math.max(nitroStartDeg + 0.5, nitroFillDeg)
  );

  const needleTip = polarToCartesian(120, 120, 92, needleDeg);
  const needleInner = polarToCartesian(120, 120, 44, needleDeg);
  const gearLabel = formatGear(gear);
  const clampedFaceOpacity = Math.min(1, Math.max(0.2, faceOpacity));

  return (
    <div className={className}>
      <svg
        viewBox="0 0 240 240"
        className="h-full w-full drop-shadow-[0_12px_28px_rgba(0,0,0,0.75)]"
        role="img"
        aria-label={`Tacómetro ${speedDisplay} ${speedUnitLabel}, marcha ${gearLabel}, ${Math.round(clampedRpm)} RPM`}
      >
        <defs>
          <radialGradient id={dialBgId} cx="50%" cy="48%" r="54%">
            <stop offset="0%" stopColor="#141923" stopOpacity={clampedFaceOpacity} />
            <stop offset="78%" stopColor="#090b10" stopOpacity={clampedFaceOpacity} />
            <stop offset="100%" stopColor="#05070b" stopOpacity={Math.min(1, clampedFaceOpacity + 0.02)} />
          </radialGradient>
          <linearGradient id={rpmSweepId} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={accentColor} stopOpacity="0.82" />
            <stop offset="65%" stopColor={needleColor} />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>

        {/* Outer Dial Housing */}
        <circle
          cx="120"
          cy="120"
          r="102"
          fill={`url(#${dialBgId})`}
          stroke={accentColor}
          strokeOpacity="0.45"
          strokeWidth="1.6"
        />
        <circle
          cx="120"
          cy="120"
          r="97"
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1"
        />

        {/* Lateral NITRO Arc Gauge (Left Outer Bezel) */}
        {nitroTrackPath && (
          <path
            d={nitroTrackPath}
            fill="none"
            stroke="rgba(56,189,248,0.16)"
            strokeWidth="5"
            strokeLinecap="round"
          />
        )}
        {nitroFillPath && nitro > 0 && (
          <path
            d={nitroFillPath}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="5"
            strokeLinecap="round"
          />
        )}

        {/* RPM Track & Redline Background Arc */}
        <path
          d={rpmBgPath}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="7"
          strokeLinecap="butt"
        />
        <path
          d={redlineTrackPath}
          fill="none"
          stroke="rgba(225,6,0,0.34)"
          strokeWidth="7"
          strokeLinecap="butt"
        />

        {/* Active Illuminated RPM Arc */}
        {rpmActivePath && (
          <path
            d={rpmActivePath}
            fill="none"
            stroke={isRedline ? '#ff1e1e' : `url(#${rpmSweepId})`}
            strokeWidth="7"
            strokeLinecap="butt"
          />
        )}

        {/* Major & Minor RPM Ticks (0 .. dialMaxRpm) */}
        {Array.from({ length: totalHalfTicks }).map((_, idx) => {
          const rpmVal = idx * 500;
          const isMajor = idx % 2 === 0;
          const isRed = rpmVal >= dialRedlineRpm;
          const deg = DIAL_START_DEG + (rpmVal / dialMaxRpm) * DIAL_SWEEP_DEG;
          const pOuter = polarToCartesian(120, 120, 95, deg);
          const pInner = polarToCartesian(120, 120, isMajor ? 83 : 88, deg);
          const pLabel = polarToCartesian(120, 120, 70, deg);

          return (
            <g key={rpmVal}>
              <line
                x1={pOuter.x}
                y1={pOuter.y}
                x2={pInner.x}
                y2={pInner.y}
                stroke={
                  isRed
                    ? '#ef4444'
                    : isMajor
                      ? accentColor
                      : 'rgba(148,163,184,0.45)'
                }
                strokeOpacity={isRed || !isMajor ? 1 : 0.85}
                strokeWidth={isMajor ? 2 : 1}
              />
              {isMajor && showNumbers && (
                <text
                  x={pLabel.x}
                  y={pLabel.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={isRed ? '#f87171' : numberColor}
                  fontSize="11"
                  fontWeight="700"
                  className="font-telemetry"
                >
                  {idx / 2}
                </text>
              )}
            </g>
          );
        })}

        {/* Real-Time Animated Needle */}
        <line
          x1={needleInner.x}
          y1={needleInner.y}
          x2={needleTip.x}
          y2={needleTip.y}
          stroke={needleColor}
          strokeWidth="2.8"
          strokeLinecap="round"
        />
        <circle
          cx={needleTip.x}
          cy={needleTip.y}
          r="2"
          fill={needleColor}
        />

        {/* Clean Inner Telemetry Disc */}
        <circle
          cx="120"
          cy="120"
          r="52"
          fill="#080a0f"
          fillOpacity={Math.min(1, clampedFaceOpacity + 0.02)}
          stroke={accentColor}
          strokeOpacity="0.32"
          strokeWidth="1.1"
        />

        {/* x1000 RPM sub-label */}
        <text
          x="120"
          y="83"
          textAnchor="middle"
          fill={accentColor}
          fillOpacity="0.9"
          fontSize="7.5"
          fontWeight="700"
          letterSpacing="1.2"
        >
          RPM x1000
        </text>

        {/* Large Central Digital Speed */}
        <text
          x="120"
          y={showGear ? '112' : '118'}
          textAnchor="middle"
          dominantBaseline="central"
          fill={numberColor === '#cbd5e1' ? '#ffffff' : numberColor}
          fontSize="36"
          fontWeight="800"
          className="font-telemetry"
        >
          {speedDisplay}
        </text>
        <text
          x="120"
          y={showGear ? '134' : '142'}
          textAnchor="middle"
          fill="#94a3b8"
          fontSize="9"
          fontWeight="700"
          letterSpacing="1.5"
        >
          {speedUnitLabel}
        </text>

        {/* Central Gear & AT/MT Indicator */}
        {showGear && (
          <>
            <rect
              x="96"
              y="145"
              width="48"
              height="22"
              rx="2"
              fill="rgba(255,255,255,0.04)"
              stroke={isRedline ? '#ef4444' : accentColor}
              strokeOpacity={isRedline ? 1 : 0.65}
              strokeWidth="1"
            />
            <text
              x="111"
              y="156.5"
              textAnchor="middle"
              dominantBaseline="central"
              fill={isRedline ? '#ff3b30' : accentColor}
              fontSize="14"
              fontWeight="800"
              className="font-telemetry"
            >
              {gearLabel}
            </text>
            <line
              x1="122"
              y1="149"
              x2="122"
              y2="163"
              stroke="rgba(255,255,255,0.14)"
              strokeWidth="1"
            />
            <text
              x="133"
              y="156.5"
              textAnchor="middle"
              dominantBaseline="central"
              fill="#cbd5e1"
              fontSize="8.5"
              fontWeight="700"
              className="font-telemetry"
            >
              {activeTx}
            </text>
          </>
        )}

        {/* Bottom Bezel Tell-Tales: Headlights + Turbo + TCS + CDI */}
        <g transform="translate(80, 184)">
          <path d="M4 4 C1 4 0 8 4 8 L7 8 L7 4 Z" fill="#34d399" />
          <line x1="8.5" y1="4.2" x2="12" y2="3.2" stroke="#34d399" strokeWidth="1.2" />
          <line x1="8.5" y1="6" x2="12" y2="6" stroke="#34d399" strokeWidth="1.2" />
          <line x1="8.5" y1="7.8" x2="12" y2="8.8" stroke="#34d399" strokeWidth="1.2" />

          <text
            x="30"
            y="7.5"
            textAnchor="middle"
            fill={turboSpooling ? '#f59e0b' : '#475569'}
            fontSize="7.5"
            fontWeight="800"
            letterSpacing="0.8"
            className="font-telemetry"
          >
            TURBO
          </text>

          <text
            x="55"
            y="7.5"
            textAnchor="middle"
            fill={tcsEnabled ? '#38bdf8' : '#475569'}
            fontSize="7.5"
            fontWeight="700"
            letterSpacing="0.6"
            className="font-telemetry"
          >
            TCS
          </text>

          <text
            x="76"
            y="7.5"
            textAnchor="middle"
            fill={
              cdiRacing
                ? revLimiterActive
                  ? '#ff2a2a'
                  : '#f59e0b'
                : '#334155'
            }
            fontSize="7.5"
            fontWeight="800"
            letterSpacing="0.6"
            className="font-telemetry"
          >
            CDI
          </text>
        </g>

        {/* NITRO % Readout beside Left Arc */}
        <text
          x="17"
          y="153"
          textAnchor="middle"
          fill="#38bdf8"
          fontSize="8.5"
          fontWeight="800"
          className="font-telemetry"
        >
          N2O
        </text>
        <text
          x="17"
          y="163"
          textAnchor="middle"
          fill="#bae6fd"
          fontSize="8"
          fontWeight="700"
          className="font-telemetry"
        >
          {nitro}%
        </text>
      </svg>
    </div>
  );
};
