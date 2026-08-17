import { AbsoluteFill, useCurrentFrame, interpolate, spring } from 'remotion';

const FPS = 30;
const W = 1920;
const H = 1080;
const M = 96; // margin constant

// ── Design Tokens ──────────────────────────────────────────
const C = {
  bg: '#060c18',
  blue: '#5eb0f0',
  gold: '#f0c040',
  red: '#e85050',
  white: '#ffffff',
  sub: '#8ab0cc',
  glassBg: 'rgba(6, 14, 40, 0.88)',
  glassBorder: 'rgba(80, 150, 240, 0.22)',
};

// ── Utility interpolators ──────────────────────────────────
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' };
const fi = (frame, start, dur = 12) =>
  interpolate(frame, [start, start + dur], [0, 1], clamp);
const su = (frame, start, dur = 18, dist = 28) =>
  interpolate(frame, [start, start + dur], [dist, 0], clamp);
const sl = (frame, start, dur = 18, dist = 40) =>
  interpolate(frame, [start, start + dur], [-dist, 0], clamp);
const sr = (frame, start, dur = 18, dist = 40) =>
  interpolate(frame, [start, start + dur], [dist, 0], clamp);

// Scene fade: in first 12 frames, out last 12 frames
const sceneFade = (f, total) => {
  const fadeIn = interpolate(f, [0, 12], [0, 1], clamp);
  const fadeOut = interpolate(f, [total - 12, total], [1, 0], clamp);
  return Math.min(fadeIn, fadeOut);
};

// ── 1. ProgressBar ─────────────────────────────────────────
const ProgressBar = ({ frame }) => {
  const pct = frame / 449;
  return (
    <div style={{
      position: 'absolute',
      top: 0, left: 0,
      width: `${pct * 100}%`,
      height: 3,
      background: `linear-gradient(90deg, ${C.blue}, ${C.gold})`,
      zIndex: 100,
    }} />
  );
};

// ── 2. Chapter dots ────────────────────────────────────────
const Chapter = ({ num, total, op }) => (
  <div style={{
    position: 'absolute',
    top: 36,
    right: M,
    display: 'flex',
    gap: 10,
    alignItems: 'center',
    opacity: op,
    zIndex: 90,
  }}>
    {Array.from({ length: total }, (_, i) => (
      <div key={i} style={{
        width: i === num ? 24 : 8,
        height: 8,
        borderRadius: 4,
        background: i === num ? C.gold : 'rgba(255,255,255,0.3)',
        transition: 'width 0.3s',
      }} />
    ))}
  </div>
);

// ── 3. Telop ───────────────────────────────────────────────
const Telop = ({ text, op }) => {
  const ty = interpolate(op, [0, 1], [12, 0], clamp);
  return (
    <div style={{
      position: 'absolute',
      bottom: 56,
      left: 0,
      right: 0,
      display: 'flex',
      justifyContent: 'center',
      opacity: op,
      transform: `translateY(${ty}px)`,
      zIndex: 80,
    }}>
      <div style={{
        position: 'relative',
        background: C.glassBg,
        border: `1px solid ${C.glassBorder}`,
        borderRadius: 18,
        padding: '22px 72px',
        maxWidth: '82%',
        textAlign: 'center',
        overflow: 'hidden',
      }}>
        {/* top accent line */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: 1,
          background: `linear-gradient(90deg, transparent, ${C.blue}, transparent)`,
        }} />
        {text.split('\n').map((line, i) => (
          <div key={i} style={{
            fontSize: 62,
            fontWeight: 'bold',
            color: C.white,
            fontFamily: 'Hiragino Kaku Gothic ProN, sans-serif',
            letterSpacing: '0.05em',
            lineHeight: 1.6,
          }}>{line}</div>
        ))}
      </div>
    </div>
  );
};

// ── 4. Background ──────────────────────────────────────────
const Background = ({ frame }) => {
  const rotate = frame * 0.28;

  // particles: 60 points deterministic
  const particles = Array.from({ length: 60 }, (_, i) => ({
    x: ((i * 317 + 11) % 1000) / 10,
    y: ((i * 193 + 53) % 1000) / 10,
    r: 0.6 + ((i * 7) % 13) / 10,
    op: 0.08 + ((i * 3) % 24) / 100,
  }));

  // 3 rings: top-left, bottom-right, center
  const rings = [
    { cx: W * 0.08, cy: H * 0.12, r: 200, dir: 1 },
    { cx: W * 0.92, cy: H * 0.88, r: 250, dir: -1 },
    { cx: W * 0.5,  cy: H * 0.5,  r: 460, dir: 0.6 },
  ];

  return (
    <svg style={{ position: 'absolute', inset: 0 }} width={W} height={H}>
      <defs>
        {/* vignette */}
        <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.72)" />
        </radialGradient>
      </defs>

      {/* grid: 20 vertical + 12 horizontal */}
      <g opacity={0.025} stroke={C.blue} strokeWidth="1">
        {Array.from({ length: 20 }, (_, i) => (
          <line key={`v${i}`} x1={(i + 1) * W / 21} y1={0} x2={(i + 1) * W / 21} y2={H} />
        ))}
        {Array.from({ length: 12 }, (_, i) => (
          <line key={`h${i}`} x1={0} y1={(i + 1) * H / 13} x2={W} y2={(i + 1) * H / 13} />
        ))}
      </g>

      {/* particles */}
      {particles.map((p, i) => (
        <circle key={i} cx={p.x * W / 100} cy={p.y * H / 100} r={p.r} fill={C.white} opacity={p.op} />
      ))}

      {/* rotating dashed rings */}
      {rings.map((rg, i) => (
        <g key={i}>
          <circle
            cx={rg.cx} cy={rg.cy} r={rg.r}
            fill="none" stroke={`rgba(94,176,240,0.14)`} strokeWidth="1.5"
            strokeDasharray="10,8"
            transform={`rotate(${rotate * rg.dir}, ${rg.cx}, ${rg.cy})`}
          />
          <circle
            cx={rg.cx} cy={rg.cy} r={rg.r * 0.65}
            fill="none" stroke={`rgba(94,176,240,0.07)`} strokeWidth="1"
            strokeDasharray="5,10"
            transform={`rotate(${-rotate * rg.dir * 1.4}, ${rg.cx}, ${rg.cy})`}
          />
        </g>
      ))}

      {/* vignette overlay */}
      <rect x={0} y={0} width={W} height={H} fill="url(#vignette)" />
    </svg>
  );
};

// ── 5. Brain SVG ───────────────────────────────────────────
const Brain = ({ op, x, y, size = 280, pulse = 0 }) => {
  const shadow = `drop-shadow(0 0 ${18 + pulse * 14}px rgba(94,176,240,${0.35 + pulse * 0.25}))`;
  return (
    <svg
      width={size} height={size * 0.92}
      viewBox="0 0 220 202"
      style={{
        opacity: op,
        position: 'absolute',
        left: x - size / 2,
        top: y - (size * 0.92) / 2,
        filter: shadow,
      }}
    >
      <defs>
        <radialGradient id="brainFill" cx="50%" cy="45%">
          <stop offset="0%" stopColor="rgba(94,176,240,0.18)" />
          <stop offset="100%" stopColor="rgba(94,176,240,0.04)" />
        </radialGradient>
      </defs>
      {/* Left hemisphere */}
      <path
        d="M110 26 C80 16 42 24 28 52 C14 80 16 114 28 138 C40 162 66 172 90 170 C104 168 110 160 110 160 L110 26Z"
        fill="url(#brainFill)" stroke={C.blue} strokeWidth="2.2"
      />
      {/* Right hemisphere */}
      <path
        d="M110 26 C140 16 178 24 192 52 C206 80 204 114 192 138 C180 162 154 172 130 170 C116 168 110 160 110 160 L110 26Z"
        fill="url(#brainFill)" stroke={C.blue} strokeWidth="2.2"
      />
      {/* Center divide dashed */}
      <line x1="110" y1="22" x2="110" y2="162" stroke={C.blue} strokeWidth="1.2" strokeDasharray="5,4" opacity="0.4" />
      {/* Left folds – 4 rows */}
      <path d="M44 60 Q58 50 72 60 Q86 50 100 60" fill="none" stroke={C.blue} strokeWidth="1.6" opacity="0.55" />
      <path d="M34 84 Q50 70 66 84 Q82 70 98 84" fill="none" stroke={C.blue} strokeWidth="1.6" opacity="0.55" />
      <path d="M30 108 Q48 92 66 108 Q84 92 100 108" fill="none" stroke={C.blue} strokeWidth="1.6" opacity="0.55" />
      <path d="M36 132 Q54 116 72 132 Q90 116 104 132" fill="none" stroke={C.blue} strokeWidth="1.6" opacity="0.55" />
      {/* Right folds – 4 rows */}
      <path d="M120 60 Q134 50 148 60 Q162 50 176 60" fill="none" stroke={C.blue} strokeWidth="1.6" opacity="0.55" />
      <path d="M122 84 Q138 70 154 84 Q170 70 186 84" fill="none" stroke={C.blue} strokeWidth="1.6" opacity="0.55" />
      <path d="M120 108 Q136 92 154 108 Q172 92 190 108" fill="none" stroke={C.blue} strokeWidth="1.6" opacity="0.55" />
      <path d="M116 132 Q132 116 150 132 Q168 116 184 132" fill="none" stroke={C.blue} strokeWidth="1.6" opacity="0.55" />
      {/* Brainstem */}
      <rect x="94" y="162" width="32" height="34" rx="11"
        fill="rgba(94,176,240,0.12)" stroke={C.blue} strokeWidth="2" />
    </svg>
  );
};

// ── 6. Stomach SVG ─────────────────────────────────────────
const Stomach = ({ op, x, y, size = 240, pulse = 0 }) => {
  const shadow = `drop-shadow(0 0 ${16 + pulse * 12}px rgba(232,80,80,${0.3 + pulse * 0.22}))`;
  const sc = 1 + pulse * 0.04;
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 180 180"
      style={{
        opacity: op,
        position: 'absolute',
        left: x - size / 2,
        top: y - size / 2,
        filter: shadow,
        transform: `scale(${sc})`,
        transformOrigin: 'center',
      }}
    >
      <defs>
        <radialGradient id="stomachFill" cx="45%" cy="45%">
          <stop offset="0%" stopColor="rgba(232,80,80,0.22)" />
          <stop offset="100%" stopColor="rgba(232,80,80,0.04)" />
        </radialGradient>
      </defs>
      {/* Main stomach shape */}
      <path
        d="M62 36 Q38 38 28 60 Q16 86 18 114 Q20 142 50 158 Q78 172 108 164 Q138 156 152 132 Q166 108 158 80 Q150 54 128 44 Q108 34 88 42 Q76 28 62 36Z"
        fill="url(#stomachFill)" stroke={C.red} strokeWidth="2.8"
      />
      {/* Esophagus lines at top */}
      <line x1="74" y1="24" x2="68" y2="44" stroke={C.red} strokeWidth="2" opacity="0.7" />
      <line x1="86" y1="20" x2="80" y2="42" stroke={C.red} strokeWidth="2" opacity="0.7" />
      {/* Rugae: vertical fold lines */}
      <path d="M54 62 Q48 90 54 118" fill="none" stroke={C.red} strokeWidth="1.8" opacity="0.45" />
      <path d="M74 52 Q66 84 72 120" fill="none" stroke={C.red} strokeWidth="1.8" opacity="0.45" />
      <path d="M94 50 Q88 82 92 118" fill="none" stroke={C.red} strokeWidth="1.8" opacity="0.45" />
      <path d="M114 54 Q110 84 114 116" fill="none" stroke={C.red} strokeWidth="1.8" opacity="0.45" />
      {/* Pylorus detail at right */}
      <path d="M148 88 Q162 96 158 110 Q154 124 142 128"
        fill="none" stroke={C.red} strokeWidth="2" opacity="0.6" />
    </svg>
  );
};

// ── 7. Arrow (draw-on) ─────────────────────────────────────
const Arrow = ({ op, x1, y1, x2, y2, label, color, frame, delay = 0 }) => {
  const f = Math.max(0, frame - delay);
  const progress = interpolate(f, [0, 40], [0, 1], clamp);
  const mx = x1 + (x2 - x1) * progress;
  const my = y1 + (y2 - y1) * progress;
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  const ux = dx / len, uy = dy / len;

  const showHead = progress > 0.88;
  const showLabel = progress > 0.5;

  return (
    <svg style={{ position: 'absolute', inset: 0, overflow: 'visible' }} width={W} height={H}>
      <g opacity={op}>
        {/* glow line */}
        <line x1={x1} y1={y1} x2={mx} y2={my}
          stroke={color} strokeWidth="6" opacity="0.18" strokeLinecap="round" />
        {/* main dashed line */}
        <line x1={x1} y1={y1} x2={mx} y2={my}
          stroke={color} strokeWidth="2.2" strokeDasharray="9,6" strokeLinecap="round" />
        {/* arrowhead */}
        {showHead && (
          <polygon
            points={`${x2},${y2} ${x2 - ux * 16 - uy * 8},${y2 - uy * 16 + ux * 8} ${x2 - ux * 16 + uy * 8},${y2 - uy * 16 - ux * 8}`}
            fill={color}
          />
        )}
        {/* label in glass box */}
        {showLabel && label && (
          <foreignObject
            x={(x1 + x2) / 2 - uy * 30 - 60}
            y={(y1 + y2) / 2 + ux * 30 - 22}
            width="120" height="44"
          >
            <div
              xmlns="http://www.w3.org/1999/xhtml"
              style={{
                background: C.glassBg,
                border: `1px solid ${color}55`,
                borderRadius: 8,
                padding: '6px 12px',
                textAlign: 'center',
                fontSize: 22,
                fontWeight: 'bold',
                color: color,
                fontFamily: 'Hiragino Kaku Gothic ProN, sans-serif',
                whiteSpace: 'nowrap',
              }}
            >
              {label}
            </div>
          </foreignObject>
        )}
      </g>
    </svg>
  );
};

// ── 8. Counter ─────────────────────────────────────────────
const Counter = ({ frame, start, to, color, size }) => {
  const v = Math.round(interpolate(frame, [start, start + 60], [0, to], clamp));
  return (
    <span style={{ fontSize: size, fontWeight: 'bold', color, lineHeight: 1, fontFamily: 'Hiragino Kaku Gothic ProN, sans-serif' }}>
      {v}
    </span>
  );
};

// ── 9. BarChart ────────────────────────────────────────────
const BarChart = ({ frame, start, x, y, h, val, maxVal, color, label, subLabel }) => {
  const bh = interpolate(frame, [start, start + 50], [0, h * val / maxVal], clamp);
  const pct = Math.round(val / maxVal * 100);

  return (
    <svg style={{ position: 'absolute', inset: 0, overflow: 'visible' }} width={W} height={H}>
      <defs>
        <linearGradient id={`barGrad${x}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.55" />
          <stop offset="100%" stopColor={color} stopOpacity="0.18" />
        </linearGradient>
      </defs>
      {/* glow fill */}
      <rect x={x - 110} y={y - bh} width={220} height={bh} rx="8"
        fill={color} opacity="0.10" />
      {/* main fill */}
      <rect x={x - 110} y={y - bh} width={220} height={bh} rx="8"
        fill={`url(#barGrad${x})`} stroke={color} strokeWidth="2" />
      {/* colored cap */}
      <rect x={x - 110} y={y - bh} width={220} height={8} rx="4"
        fill={color} opacity="0.9" />
      {/* percentage above bar */}
      <text x={x} y={y - bh - 14} textAnchor="middle"
        fontSize="20" fontWeight="bold" fill={color}
        fontFamily="Hiragino Kaku Gothic ProN, sans-serif">
        {val}%
      </text>
      {/* label below */}
      <text x={x} y={y + 34} textAnchor="middle"
        fontSize="20" fontWeight="bold" fill={C.white}
        fontFamily="Hiragino Kaku Gothic ProN, sans-serif">
        {label}
      </text>
      {/* subLabel below label */}
      <text x={x} y={y + 56} textAnchor="middle"
        fontSize="15" fill={C.sub}
        fontFamily="Hiragino Kaku Gothic ProN, sans-serif">
        {subLabel}
      </text>
    </svg>
  );
};

// ── Section Header tag ─────────────────────────────────────
const SectionTag = ({ text, color = C.blue }) => (
  <div style={{
    display: 'inline-flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  }}>
    <div style={{ width: 28, height: 2, background: color }} />
    <div style={{
      fontSize: 13,
      letterSpacing: '0.35em',
      color: color,
      fontWeight: 'bold',
      fontFamily: 'Hiragino Kaku Gothic ProN, sans-serif',
    }}>{text}</div>
  </div>
);

// ── MAIN COMPOSITION ───────────────────────────────────────
export const MedicalComposition = () => {
  const frame = useCurrentFrame();

  const SCENES = [
    { from: 0,   to: 90,  len: 90  },
    { from: 90,  to: 220, len: 130 },
    { from: 220, to: 340, len: 120 },
    { from: 340, to: 450, len: 110 },
  ];

  const si = SCENES.findIndex((s, i) =>
    frame >= s.from && (i === SCENES.length - 1 || frame < s.to)
  );
  const scene = SCENES[si] ?? SCENES[0];
  const f = frame - scene.from;
  const sceneOp = sceneFade(f, scene.len);

  // pulse for organ animations
  const pulse = Math.sin(frame * 0.12) * 0.5 + 0.5;

  return (
    <AbsoluteFill style={{
      background: C.bg,
      fontFamily: 'Hiragino Kaku Gothic ProN, sans-serif',
      overflow: 'hidden',
    }}>
      <Background frame={frame} />
      <ProgressBar frame={frame} />
      <Chapter num={si} total={4} op={sceneOp} />

      {/* ─── SCENE 0: Title ─── */}
      {si === 0 && (
        <AbsoluteFill style={{ opacity: sceneOp }}>

          {/* 中央グロー展開 */}
          <div style={{
            position: 'absolute',
            top: '50%', left: '38%',
            transform: 'translate(-50%, -50%)',
            width: `${interpolate(f, [0, 45], [100, 1000], clamp)}px`,
            height: `${interpolate(f, [0, 45], [100, 1000], clamp)}px`,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(94,176,240,0.07) 0%, transparent 70%)',
            opacity: interpolate(f, [0, 20], [0, 1], clamp),
          }} />

          {/* 左アクセントライン */}
          <div style={{
            position: 'absolute', left: M - 24, top: '10%',
            width: 4,
            height: `${interpolate(f, [6, 52], [0, 80], clamp)}%`,
            background: `linear-gradient(180deg, ${C.blue}, transparent)`,
            borderRadius: 2,
          }} />

          {/* タグ */}
          <div style={{
            position: 'absolute', top: 80, left: M,
            display: 'flex', alignItems: 'center', gap: 14,
            opacity: fi(f, 4), transform: `translateX(${sl(f, 4)}px)`,
          }}>
            <div style={{ width: 32, height: 1.5, background: C.blue }} />
            <span style={{ fontSize: 13, letterSpacing: '0.4em', color: C.blue }}>HEALTH TRIVIA</span>
            <div style={{
              background: 'rgba(240,192,64,0.12)', border: `1px solid ${C.gold}`,
              borderRadius: 100, padding: '3px 16px',
              fontSize: 12, color: C.gold, letterSpacing: '0.15em',
            }}>#01</div>
          </div>

          {/* メインタイトル左側 */}
          <div style={{ position: 'absolute', left: M, top: '22%' }}>
            <div style={{
              fontSize: 44, color: C.sub, marginBottom: 18, letterSpacing: '0.04em',
              opacity: fi(f, 12), transform: `translateX(${sl(f, 12, 20)}px)`,
            }}>
              なぜ眠れないと
            </div>
            <div style={{
              fontSize: 136, fontWeight: 'bold', color: C.white, lineHeight: 1.05,
              textShadow: `0 0 80px rgba(94,176,240,0.25), 0 4px 40px rgba(0,0,0,0.5)`,
              opacity: fi(f, 20, 22), transform: `translateY(${su(f, 20, 22, 44)}px)`,
              letterSpacing: '-0.01em',
            }}>
              太るのか？
            </div>
            {/* ゴールドライン */}
            <div style={{
              marginTop: 28,
              width: `${interpolate(f, [38, 68], [0, 500], clamp)}px`,
              height: 4, borderRadius: 2,
              background: `linear-gradient(90deg, ${C.gold}, rgba(240,192,64,0.1))`,
              boxShadow: `0 0 24px ${C.gold}55`,
            }} />
            <div style={{
              marginTop: 30, fontSize: 28, color: C.sub, letterSpacing: '0.06em',
              opacity: fi(f, 52),
            }}>
              睡眠とホルモンの知られざる関係
            </div>
          </div>

          {/* 右側：スタットカード */}
          <div style={{
            position: 'absolute', right: M, top: '15%',
            width: 640,
            opacity: fi(f, 28, 22),
            transform: `translateX(${sr(f, 28, 22)}px)`,
          }}>
            <div style={{
              position: 'relative',
              background: C.glassBg,
              border: `1px solid ${C.glassBorder}`,
              borderRadius: 28,
              padding: '52px 64px',
              textAlign: 'center',
              boxShadow: `0 0 80px rgba(240,192,64,0.07), 0 24px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.07)`,
              overflow: 'hidden',
            }}>
              {/* トップアクセント */}
              <div style={{
                position: 'absolute', top: 0, left: '8%', right: '8%', height: 2,
                background: `linear-gradient(90deg, transparent, ${C.gold}cc, transparent)`,
              }} />
              {/* ボトムアクセント */}
              <div style={{
                position: 'absolute', bottom: 0, left: '30%', right: '30%', height: 1,
                background: `linear-gradient(90deg, transparent, ${C.blue}88, transparent)`,
              }} />
              <div style={{
                fontSize: 13, letterSpacing: '0.45em', color: C.gold,
                marginBottom: 20, opacity: 0.8,
              }}>
                FOOD CRAVING UP
              </div>
              <div style={{
                fontSize: 170, fontWeight: 'bold', color: C.gold, lineHeight: 1,
                textShadow: `0 0 80px rgba(240,192,64,0.5)`,
                letterSpacing: '-0.02em',
              }}>22</div>
              <div style={{
                fontSize: 64, fontWeight: 'bold', color: C.gold,
                lineHeight: 1, marginTop: -10,
                textShadow: `0 0 40px rgba(240,192,64,0.4)`,
              }}>%</div>
              <div style={{
                marginTop: 24, fontSize: 22, color: C.sub, lineHeight: 1.6,
              }}>
                睡眠不足たった<span style={{ color: C.white, fontWeight: 'bold' }}>1日</span>で<br />食欲がこれだけ増加する
              </div>
            </div>
          </div>

          <Telop text="睡眠不足と食欲の意外な関係" op={fi(f, 62)} />
        </AbsoluteFill>
      )}

      {/* ─── SCENE 1: Mechanism ─── */}
      {si === 1 && (
        <AbsoluteFill style={{ opacity: sceneOp }}>
          {/* Header */}
          <div style={{
            position: 'absolute',
            top: 72,
            left: M,
            opacity: fi(f, 0),
            transform: `translateY(${su(f, 0)}px)`,
          }}>
            <SectionTag text="MECHANISM" color={C.blue} />
            <div style={{ fontSize: 32, color: C.white, fontWeight: 'bold', letterSpacing: '0.04em' }}>
              睡眠不足が
              <span style={{ color: C.gold }}>脳</span>
              に与える影響
            </div>
          </div>

          {/* Brain */}
          <Brain
            op={fi(f, 6)}
            x={480} y={430} size={560}
            pulse={f > 20 ? pulse : 0}
          />
          {/* Brain label */}
          <div style={{
            position: 'absolute',
            left: 200,
            top: 720,
            opacity: fi(f, 20),
            textAlign: 'center',
            width: 560,
          }}>
            <div style={{ fontSize: 24, color: C.blue, fontWeight: 'bold', letterSpacing: '0.08em' }}>脳・視床下部</div>
            <div style={{ fontSize: 16, color: C.sub, marginTop: 4, letterSpacing: '0.06em' }}>Hypothalamus</div>
          </div>

          {/* Arrows */}
          <Arrow
            op={fi(f, 30)} frame={f} delay={30}
            x1={760} y1={350} x2={1180} y2={270}
            label="グレリン↑" color={C.gold}
          />
          <Arrow
            op={fi(f, 48)} frame={f} delay={48}
            x1={760} y1={510} x2={1180} y2={590}
            label="レプチン↓" color={C.red}
          />

          {/* Stomach */}
          <Stomach
            op={fi(f, 55)}
            x={1440} y={430} size={520}
            pulse={f > 55 ? pulse : 0}
          />
          {/* Stomach label */}
          <div style={{
            position: 'absolute',
            right: 180,
            top: 720,
            opacity: fi(f, 65),
            textAlign: 'center',
            width: 520,
          }}>
            <div style={{ fontSize: 22, color: C.red, fontWeight: 'bold', letterSpacing: '0.08em' }}>食欲中枢</div>
            <div style={{ fontSize: 15, color: C.sub, marginTop: 4, letterSpacing: '0.06em' }}>Appetite Center</div>
          </div>

          {/* Info cards */}
          <div style={{
            position: 'absolute',
            bottom: 160,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 36,
            opacity: fi(f, 80),
          }}>
            {[
              { arrow: '↑', name: 'グレリン', sub: '空腹ホルモン増加', color: C.gold },
              { arrow: '↓', name: 'レプチン', sub: '満腹ホルモン減少', color: C.red },
            ].map((item, i) => (
              <div key={i} style={{
                background: C.glassBg,
                border: `1px solid ${item.color}44`,
                borderRadius: 12,
                padding: '16px 36px',
                textAlign: 'center',
                minWidth: 260,
              }}>
                <div style={{
                  fontSize: 30,
                  fontWeight: 'bold',
                  color: item.color,
                  letterSpacing: '0.04em',
                }}>
                  {item.arrow} {item.name}
                </div>
                <div style={{ fontSize: 15, color: C.sub, marginTop: 6 }}>{item.sub}</div>
              </div>
            ))}
          </div>

          <Telop
            text={'ホルモンバランスが乱れ\n食欲コントロールが効かなくなる'}
            op={fi(f, 95)}
          />
        </AbsoluteFill>
      )}

      {/* ─── SCENE 2: Data ─── */}
      {si === 2 && (
        <AbsoluteFill style={{ opacity: sceneOp }}>
          {/* Header */}
          <div style={{
            position: 'absolute',
            top: 72,
            left: M,
            opacity: fi(f, 0),
            transform: `translateY(${su(f, 0)}px)`,
          }}>
            <SectionTag text="DATA" color={C.gold} />
            <div style={{ fontSize: 32, color: C.white, fontWeight: 'bold', letterSpacing: '0.04em' }}>
              たった
              <span style={{ color: C.gold }}>1日</span>
              の睡眠不足で
            </div>
          </div>

          {/* Big counter */}
          <div style={{
            position: 'absolute',
            top: 180,
            left: 0, right: 0,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            gap: 8,
            opacity: fi(f, 8),
          }}>
            <Counter frame={f} start={10} to={22} color={C.gold} size={290} />
            <span style={{
              fontSize: 110,
              fontWeight: 'bold',
              color: C.gold,
              marginBottom: 30,
              fontFamily: 'Hiragino Kaku Gothic ProN, sans-serif',
            }}>%</span>
          </div>

          <div style={{
            position: 'absolute',
            top: 430,
            left: 0, right: 0,
            textAlign: 'center',
            opacity: fi(f, 60),
            fontSize: 36,
            fontWeight: 'bold',
            color: C.white,
            letterSpacing: '0.04em',
          }}>
            食欲がアップする
          </div>

          {/* Grid lines */}
          <svg style={{ position: 'absolute', inset: 0 }} width={W} height={H}>
            {[660, 770, 880, 950].map((yy, i) => (
              <line key={i} x1={W * 0.2} y1={yy} x2={W * 0.8} y2={yy}
                stroke={i === 3 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.07)'}
                strokeWidth={i === 3 ? 1.5 : 1} strokeDasharray={i === 3 ? '0' : '4,6'} />
            ))}
          </svg>

          {/* Bar charts */}
          <BarChart
            frame={f} start={28}
            x={W * 0.32} y={960} h={420}
            val={100} maxVal={130}
            color={C.blue}
            label="通常睡眠" subLabel="7〜8時間"
          />
          <BarChart
            frame={f} start={44}
            x={W * 0.68} y={960} h={420}
            val={122} maxVal={130}
            color={C.gold}
            label="睡眠不足" subLabel="5時間以下"
          />

          <Telop text={'しかも高カロリーなものを\n無意識に選んでしまう'} op={fi(f, 85)} />
        </AbsoluteFill>
      )}

      {/* ─── SCENE 3: Solution ─── */}
      {si === 3 && (
        <AbsoluteFill style={{ opacity: sceneOp }}>
          {/* Left column */}
          <div style={{
            position: 'absolute',
            left: M,
            top: 100,
            width: 480,
            opacity: fi(f, 0),
            transform: `translateX(${sl(f, 0)}px)`,
          }}>
            <SectionTag text="SOLUTION" color={C.blue} />
            <div style={{
              fontSize: 76,
              fontWeight: 'bold',
              color: C.white,
              lineHeight: 1.3,
              letterSpacing: '0.02em',
            }}>
              今夜から<br />できること
            </div>
            {/* Gold animated underline */}
            <div style={{
              marginTop: 20,
              width: `${interpolate(f, [16, 52], [0, 260], clamp)}px`,
              height: 3,
              background: `linear-gradient(90deg, ${C.gold}, transparent)`,
            }} />
            <div style={{
              marginTop: 24,
              fontSize: 16,
              color: C.sub,
              lineHeight: 1.8,
              opacity: fi(f, 30),
            }}>
              睡眠はダイエットの<br />土台となる習慣です。<br />今日から見直しましょう。
            </div>
          </div>

          {/* Vertical divider */}
          <div style={{
            position: 'absolute',
            left: M + 420,
            top: '12%',
            width: 1,
            height: '76%',
            background: `linear-gradient(180deg, transparent, ${C.glassBorder}, transparent)`,
          }} />

          {/* Right column: cards */}
          <div style={{
            position: 'absolute',
            left: M + 540,
            top: 90,
            width: 1100,
            display: 'flex',
            flexDirection: 'column',
            gap: 30,
          }}>
            {[
              { num: '01', text: '睡眠を7時間確保する',   sub: '就寝・起床時刻を毎日固定する',       color: C.blue },
              { num: '02', text: '深夜の食事を避ける',     sub: '就寝3時間前からの食事を控える',     color: C.gold },
              { num: '03', text: '寝る前のスマホを控える', sub: 'ブルーライトがメラトニンを抑制する', color: C.red  },
            ].map((item, i) => (
              <div key={i} style={{
                opacity: fi(f, 20 + i * 22),
                transform: `translateX(${sr(f, 20 + i * 22)}px)`,
                display: 'flex',
                alignItems: 'stretch',
                background: C.glassBg,
                border: `1px solid ${C.glassBorder}`,
                borderLeft: `3px solid ${item.color}`,
                borderRadius: '0 14px 14px 0',
                overflow: 'hidden',
              }}>
                {/* number section */}
                <div style={{
                  padding: '28px 36px',
                  display: 'flex',
                  alignItems: 'center',
                  minWidth: 110,
                  borderRight: `1px solid ${C.glassBorder}`,
                }}>
                  <span style={{
                    fontSize: 36,
                    fontWeight: 'bold',
                    color: item.color,
                    letterSpacing: '0.04em',
                  }}>{item.num}</span>
                </div>
                {/* text section */}
                <div style={{ padding: '26px 36px' }}>
                  <div style={{ fontSize: 32, fontWeight: 'bold', color: C.white, letterSpacing: '0.03em' }}>
                    {item.text}
                  </div>
                  <div style={{ fontSize: 20, color: C.sub, marginTop: 8, letterSpacing: '0.03em' }}>
                    {item.sub}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom summary */}
          <div style={{
            position: 'absolute',
            bottom: 170,
            left: 0, right: 0,
            textAlign: 'center',
            opacity: fi(f, 82),
            fontSize: 20,
            color: C.sub,
            letterSpacing: '0.05em',
          }}>
            ダイエットの前に、まず
            <span style={{ color: C.gold, fontWeight: 'bold' }}>睡眠</span>
            を整えよう
          </div>

          <Telop text={'小さな習慣の積み重ねが\n健康な体をつくる'} op={fi(f, 88)} />
        </AbsoluteFill>
      )}

      {/* Brand watermark */}
      <div style={{
        position: 'absolute',
        bottom: 18,
        right: M,
        fontSize: 10,
        letterSpacing: '0.35em',
        color: `rgba(94,176,240,0.25)`,
        zIndex: 10,
      }}>
        HEALTH &amp; LIFESTYLE
      </div>
    </AbsoluteFill>
  );
};
