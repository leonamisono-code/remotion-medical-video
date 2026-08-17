import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

const C = {
  bg: '#060c18', blue: '#5eb0f0', gold: '#f0c040', red: '#e85050',
  white: '#ffffff', sub: '#8ab8d0', green: '#50e8a0',
  glassBg: 'rgba(8, 18, 48, 0.55)', glassBorder: 'rgba(255,255,255,0.05)',
};

const lerp = (f, [a, b], [c, d]) =>
  interpolate(f, [a, b], [c, d], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

const fade = (lf, total) => Math.min(lerp(lf, [0, 10], [0, 1]), lerp(lf, [total - 10, total], [1, 0]));

const S = {
  opening: [0, 450],
  t1: [450, 1170], t2: [1170, 1890], t3: [1890, 2610],
  t4: [2610, 3330], t5: [3330, 4050], t6: [4050, 4770],
  t7: [4770, 5490], ending: [5490, 6090],
};

// ── SVG icon components (no emoji) ──

const IconBrain = ({ size = 120, color, f = 0 }) => {
  const pulse = 1 + Math.sin(f * 0.08) * 0.015;
  return (
    <svg width={size} height={size * 0.75} viewBox="0 0 200 150" style={{ transform: `scale(${pulse})` }}>
      <ellipse cx="100" cy="78" rx="88" ry="62" fill={`${color}0d`} stroke={`${color}44`} strokeWidth="2" />
      <path d="M28,55 Q60,36 100,50 Q140,36 172,55" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M20,78 Q52,62 86,74 Q114,62 148,74 Q170,62 180,78" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M28,101 Q60,88 100,98 Q140,88 172,101" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="100" cy="78" r="18" fill={`${color}18`} stroke={`${color}55`} strokeWidth="1.5" />
      <line x1="100" y1="66" x2="100" y2="90" stroke={color} strokeWidth="1.5" />
      <line x1="88" y1="78" x2="112" y2="78" stroke={color} strokeWidth="1.5" />
    </svg>
  );
};

const IconClock = ({ size = 120, color, pct = 0 }) => {
  const R = size * 0.4, CX = size / 2, CY = size / 2;
  const circ = 2 * Math.PI * R;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={CX} cy={CY} r={R} fill="none" stroke={`${color}18`} strokeWidth={size * 0.1} />
      <circle cx={CX} cy={CY} r={R} fill="none" stroke={color} strokeWidth={size * 0.1}
        strokeDasharray={`${pct * circ} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${CX} ${CY})`} />
      {/* Clock hands */}
      <line x1={CX} y1={CY} x2={CX} y2={CY - R * 0.55}
        stroke={`${color}88`} strokeWidth="2" strokeLinecap="round"
        transform={`rotate(${pct * 360} ${CX} ${CY})`} />
    </svg>
  );
};

const IconThermometer = ({ size = 40, color }) => (
  <svg width={size} height={size * 2.5} viewBox="0 0 40 100">
    <rect x="15" y="2" width="10" height="62" rx="5" fill="none" stroke={color} strokeWidth="2" />
    <rect x="17" y="40" width="6" height="26" rx="3" fill={color} opacity="0.7" />
    <circle cx="20" cy="78" r="12" fill={`${color}33`} stroke={color} strokeWidth="2" />
    <circle cx="20" cy="78" r="7" fill={color} />
  </svg>
);

const IconSnowflake = ({ size = 40, color }) => {
  const arms = Array.from({ length: 6 }, (_, i) => {
    const angle = (i * 60 * Math.PI) / 180;
    const x2 = 20 + Math.cos(angle) * 16;
    const y2 = 20 + Math.sin(angle) * 16;
    return `M20,20 L${x2},${y2}`;
  });
  return (
    <svg width={size} height={size} viewBox="0 0 40 40">
      {arms.map((d, i) => (
        <path key={i} d={d} stroke={color} strokeWidth="2" strokeLinecap="round" />
      ))}
      <circle cx="20" cy="20" r="3" fill={color} />
    </svg>
  );
};

const IconPhone = ({ size = 80, color }) => (
  <svg width={size} height={size * 1.6} viewBox="0 0 80 128">
    <rect x="8" y="2" width="64" height="124" rx="12" fill="none" stroke={`${color}55`} strokeWidth="2.5" />
    <rect x="12" y="14" width="56" height="90" rx="4" fill={`${color}12`} />
    {/* Screen glow lines */}
    {[20,32,44,56,68,80].map((y, i) => (
      <line key={i} x1="18" y1={y} x2={18 + 32 * (1 - i * 0.08)} y2={y}
        stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity={0.5 - i * 0.06} />
    ))}
    {/* Blue light rays */}
    <line x1="40" y1="14" x2="60" y2="-4" stroke={color} strokeWidth="1.5" strokeDasharray="4,3" opacity="0.6" />
    <line x1="50" y1="14" x2="74" y2="4" stroke={color} strokeWidth="1.5" strokeDasharray="4,3" opacity="0.4" />
    <circle cx="40" cy="116" r="5" fill="none" stroke={`${color}66`} strokeWidth="2" />
  </svg>
);

const IconWave = ({ width = 400, height = 60, color, offset = 0 }) => {
  const pts = Array.from({ length: 64 }, (_, i) => {
    const x = i * (width / 63);
    const y = height / 2 + Math.sin(i * 0.48 + offset) * (height * 0.38) +
              Math.sin(i * 0.9 + offset * 1.4) * (height * 0.15);
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

// ── Shared UI ──

const Bg = ({ color = C.blue }) => (
  <div style={{ position: 'absolute', inset: 0, background: C.bg, overflow: 'hidden' }}>
    <div style={{
      position: 'absolute', inset: 0,
      backgroundImage: `linear-gradient(rgba(80,150,240,0.028) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(80,150,240,0.028) 1px, transparent 1px)`,
      backgroundSize: '120px 120px',
    }} />
    <div style={{
      position: 'absolute', top: -260, left: '50%', transform: 'translateX(-50%)',
      width: 1800, height: 800,
      background: `radial-gradient(ellipse, ${color}0e 0%, transparent 62%)`,
    }} />
  </div>
);

const Dots = ({ cur }) => (
  <div style={{ position: 'absolute', top: 34, right: 52, display: 'flex', gap: 8 }}>
    {Array.from({ length: 7 }, (_, i) => (
      <div key={i} style={{
        width: i + 1 === cur ? 24 : 7, height: 7, borderRadius: 4,
        background: i + 1 === cur ? C.gold : 'rgba(255,255,255,0.14)',
      }} />
    ))}
  </div>
);

const Tag = ({ num, color }) => (
  <div style={{ position: 'absolute', top: 34, left: 56, display: 'flex', alignItems: 'center', gap: 12 }}>
    <div style={{ width: 3, height: 16, background: color, borderRadius: 2 }} />
    <span style={{ fontSize: 13, fontWeight: 700, color: C.sub, letterSpacing: '0.16em', fontFamily: 'Helvetica Neue, sans-serif' }}>SLEEP TRIVIA</span>
    <div style={{ background: color, borderRadius: 20, padding: '3px 12px', fontSize: 12, fontWeight: 800, color: C.bg, letterSpacing: '0.1em', fontFamily: 'Helvetica Neue, sans-serif' }}>
      {`#${String(num).padStart(2, '0')}`}
    </div>
  </div>
);

const Title = ({ f, text, color }) => {
  const op = lerp(f, [8, 30], [0, 1]);
  const y = lerp(f, [8, 30], [12, 0]);
  return (
    <div style={{ position: 'absolute', top: 80, left: 0, right: 0, textAlign: 'center', opacity: op, transform: `translateY(${y}px)` }}>
      <div style={{ fontSize: 62, fontWeight: 900, color: C.white, fontFamily: 'Hiragino Kaku Gothic ProN, sans-serif', lineHeight: 1.25, whiteSpace: 'pre-wrap' }}>
        {text.split(/(\[.*?\])/).map((p, i) =>
          p.startsWith('[') && p.endsWith(']') ? <span key={i} style={{ color }}>{p.slice(1, -1)}</span> : p
        )}
      </div>
    </div>
  );
};

const Telop = ({ f, lines }) => {
  const cur = lines.find(l => f >= l.from && f < l.to);
  if (!cur) return null;
  const op = Math.min(lerp(f, [cur.from, cur.from + 8], [0, 1]), lerp(f, [cur.to - 8, cur.to], [1, 0]));
  return (
    <div style={{ position: 'absolute', bottom: 40, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: op }}>
      <div style={{
        background: 'rgba(0,0,0,0.78)', borderRadius: 10, padding: '13px 34px',
        maxWidth: '66%', textAlign: 'center', fontSize: 33, fontWeight: 700,
        color: C.white, fontFamily: 'Hiragino Kaku Gothic ProN, sans-serif',
        lineHeight: 1.6, letterSpacing: '0.03em', textShadow: '0 2px 10px rgba(0,0,0,1)',
      }}>
        {cur.text}
      </div>
    </div>
  );
};

// ── Side stat panels: pure typography, no card box ──
const StatPanelInline = ({ f, delay, side, label, value, note, color }) => {
  const op = lerp(f, [delay, delay + 22], [0, 1]);
  const tx = lerp(f, [delay, delay + 22], [side === 'left' ? -44 : 44, 0]);
  const isLeft = side === 'left';
  return (
    <div style={{ opacity: op, transform: `translateX(${tx}px)`, width: 210, flexShrink: 0, textAlign: isLeft ? 'right' : 'left' }}>
      <div style={{ width: 28, height: 2, background: color, borderRadius: 2, marginBottom: 14, marginLeft: isLeft ? 'auto' : 0 }} />
      <div style={{ fontSize: 11, color: C.sub, letterSpacing: '0.14em', marginBottom: 6, fontFamily: 'Helvetica Neue, sans-serif', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: 72, fontWeight: 900, color, lineHeight: 1, fontFamily: 'Helvetica Neue, sans-serif', letterSpacing: '-0.03em', textShadow: `0 0 40px ${color}44`, whiteSpace: 'pre' }}>{value}</div>
      <div style={{ fontSize: 15, color: C.sub, marginTop: 10, lineHeight: 1.65, fontFamily: 'Hiragino Kaku Gothic ProN, sans-serif', whiteSpace: 'pre-wrap' }}>{note}</div>
    </div>
  );
};

const StatPanel = ({ f, delay, side, label, value, note, color }) => {
  const op = lerp(f, [delay, delay + 22], [0, 1]);
  const tx = lerp(f, [delay, delay + 22], [side === 'left' ? -44 : 44, 0]);
  const isLeft = side === 'left';
  return (
    <div style={{
      position: 'absolute',
      [side]: 60,
      top: '50%', transform: `translateY(-50%) translateX(${tx}px)`,
      opacity: op, width: 240,
      textAlign: isLeft ? 'right' : 'left',
    }}>
      <div style={{
        width: 28, height: 2, background: color, borderRadius: 2, marginBottom: 14,
        marginLeft: isLeft ? 'auto' : 0,
      }} />
      <div style={{ fontSize: 11, color: C.sub, letterSpacing: '0.14em', marginBottom: 6, fontFamily: 'Helvetica Neue, sans-serif', textTransform: 'uppercase' }}>{label}</div>
      <div style={{
        fontSize: 76, fontWeight: 900, color, lineHeight: 1,
        fontFamily: 'Helvetica Neue, sans-serif', letterSpacing: '-0.03em',
        textShadow: `0 0 40px ${color}44`,
      }}>{value}</div>
      <div style={{ fontSize: 16, color: C.sub, marginTop: 10, lineHeight: 1.65, fontFamily: 'Hiragino Kaku Gothic ProN, sans-serif' }}>{note}</div>
    </div>
  );
};

// ── Visual wrapper (no heavy card, elements float) ──
const VisualBox = ({ children }) => (
  <div style={{
    background: C.glassBg, border: `1px solid ${C.glassBorder}`,
    borderRadius: 28, padding: '28px 36px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
  }}>
    {children}
  </div>
);

const VisualLabel = ({ text }) => (
  <div style={{ fontSize: 13, color: C.sub, letterSpacing: '0.16em', fontFamily: 'Helvetica Neue, sans-serif', textTransform: 'uppercase' }}>{text}</div>
);

const VisualCenter = ({ f, children }) => {
  const op = lerp(f, [18, 46], [0, 1]);
  const sc = lerp(f, [18, 46], [0.87, 1]);
  return (
    <div style={{
      position: 'absolute', top: 196, left: 0, right: 0, bottom: 116,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      opacity: op, transform: `scale(${sc})`,
    }}>
      {children}
    </div>
  );
};

// ══════════════════════════════════════
//  VISUALS — no emoji, SVG only
// ══════════════════════════════════════

// ① あくび: Brain + cooling flow
const V1 = ({ f, color }) => {
  const arrW = lerp(f, [50, 100], [0, 180]);
  const labO = lerp(f, [90, 120], [0, 1]);
  const tempNum = Math.round(lerp(f, [140, 280], [37.2, 36.6]) * 10) / 10;
  const tempO = lerp(f, [140, 170], [0, 1]);
  const brainPulse = 1 + Math.sin(f * 0.07) * 0.02;
  return (
    <VisualBox>
      <VisualLabel text="Brain Cooling Mechanism" />
      <div style={{ transform: `scale(${brainPulse})` }}>
        <IconBrain size={160} color={color} f={f} />
      </div>
      {/* Flow: thermometer → arrow → snowflake */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <IconThermometer size={28} color={C.red} />
        <svg width={Math.max(arrW, 8)} height="20" viewBox={`0 0 ${Math.max(arrW, 8)} 20`}>
          <defs>
            <marker id="a1" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
              <path d="M0,0 L7,3.5 L0,7 Z" fill={color} />
            </marker>
          </defs>
          {arrW > 8 && <line x1="2" y1="10" x2={arrW - 2} y2="10" stroke={color} strokeWidth="2.5" markerEnd="url(#a1)" />}
        </svg>
        <IconSnowflake size={32} color={color} />
      </div>
      <div style={{ opacity: labO, textAlign: 'center' }}>
        <div style={{ fontSize: 38, fontWeight: 800, color, fontFamily: 'Helvetica Neue, sans-serif', letterSpacing: '-0.01em' }}>COOLING</div>
        <div style={{ fontSize: 17, color: C.sub, marginTop: 4 }}>あくびで脳の温度を下げている</div>
      </div>
      <div style={{ opacity: tempO, display: 'flex', alignItems: 'baseline', gap: 5 }}>
        <span style={{ fontSize: 13, color: C.sub }}>脳温</span>
        <span style={{ fontSize: 42, fontWeight: 900, color, fontFamily: 'Helvetica Neue, sans-serif' }}>{tempNum}</span>
        <span style={{ fontSize: 16, color: C.sub }}>℃</span>
        <span style={{ fontSize: 13, color: `${color}88`, marginLeft: 4 }}>下降中</span>
      </div>
    </VisualBox>
  );
};

// ② 夢: Clock arc + comparison
const V2 = ({ f, color }) => {
  const pct = lerp(f, [46, 200], [0, 1]);
  const cmpO = lerp(f, [200, 240], [0, 1]);
  const barW1 = lerp(f, [200, 360], [0, 240]);
  const barW2 = lerp(f, [220, 300], [0, 20]);
  return (
    <VisualBox>
      <VisualLabel text="Dream Processing Time" />
      <div style={{ position: 'relative' }}>
        <IconClock size={220} color={color} pct={pct} />
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 15, color: C.sub, fontFamily: 'Hiragino Kaku Gothic ProN, sans-serif' }}>実時間</div>
          <div style={{ fontSize: 46, fontWeight: 900, color, lineHeight: 1, fontFamily: 'Helvetica Neue, sans-serif' }}>数秒</div>
        </div>
      </div>
      <div style={{ opacity: cmpO, width: '100%' }}>
        <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, color: C.sub, minWidth: 52, textAlign: 'right' }}>体感</span>
          <div style={{ height: 12, width: barW1, background: `${color}55`, borderRadius: 4 }} />
          <span style={{ fontSize: 12, color: C.sub }}>何時間も</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, color: C.sub, minWidth: 52, textAlign: 'right' }}>実時間</span>
          <div style={{ height: 12, width: barW2, background: color, borderRadius: 4 }} />
          <span style={{ fontSize: 12, color, fontWeight: 700 }}>数十秒</span>
        </div>
      </div>
    </VisualBox>
  );
};

// ③ 金縛り: AWAKE ≠ LOCKED + wave
const V3 = ({ f, color }) => {
  const lO = lerp(f, [44, 68], [0, 1]);
  const eqO = lerp(f, [68, 88], [0, 1]);
  const rO = lerp(f, [74, 98], [0, 1]);
  const remO = lerp(f, [160, 190], [0, 1]);
  const waveOff = f * 0.13;
  return (
    <VisualBox>
      <VisualLabel text="Sleep Paralysis" />
      <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
        {/* AWAKE side */}
        <div style={{ opacity: lO, textAlign: 'center', width: 160 }}>
          <IconBrain size={72} color={C.gold} />
          <div style={{ fontSize: 22, fontWeight: 800, color: C.gold, marginTop: 10, fontFamily: 'Helvetica Neue, sans-serif', letterSpacing: '0.04em' }}>AWAKE</div>
          <div style={{ fontSize: 14, color: C.sub, marginTop: 5 }}>意識：起きている</div>
        </div>
        {/* ≠ */}
        <div style={{ fontSize: 52, color: C.sub, fontFamily: 'Helvetica Neue, sans-serif', fontWeight: 200, opacity: eqO }}>≠</div>
        {/* LOCKED side */}
        <div style={{ opacity: rO, textAlign: 'center', width: 160 }}>
          {/* Muscle/body icon: simple human silhouette */}
          <svg width="72" height="90" viewBox="0 0 72 90">
            <circle cx="36" cy="14" r="12" fill="none" stroke={color} strokeWidth="2.5" />
            <line x1="36" y1="26" x2="36" y2="60" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
            <line x1="36" y1="36" x2="18" y2="52" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
            <line x1="36" y1="36" x2="54" y2="52" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
            <line x1="36" y1="60" x2="22" y2="82" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
            <line x1="36" y1="60" x2="50" y2="82" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
            {/* Lock chain effect */}
            <rect x="26" y="44" width="20" height="12" rx="3" fill="none" stroke={`${color}88`} strokeWidth="1.5" strokeDasharray="3,2" />
          </svg>
          <div style={{ fontSize: 22, fontWeight: 800, color, marginTop: 2, fontFamily: 'Helvetica Neue, sans-serif', letterSpacing: '0.04em' }}>LOCKED</div>
          <div style={{ fontSize: 14, color: C.sub, marginTop: 5 }}>体：まだ寝ている</div>
        </div>
      </div>
      <IconWave width={640} height={52} color={color} offset={waveOff} />
      <div style={{ opacity: remO, display: 'flex', gap: 28, alignItems: 'center' }}>
        <span style={{ fontSize: 13, color: C.sub }}>REM睡眠中に発生</span>
        <div style={{ width: 1, height: 14, background: `${C.sub}44` }} />
        <span style={{ fontSize: 13, color: C.sub }}>脳の自己防衛システム</span>
      </div>
    </VisualBox>
  );
};

// ④ スマホ: Bar + flow
const V4 = ({ f, color }) => {
  const barH = lerp(f, [46, 120], [140, 56]);
  const labO = lerp(f, [115, 145], [0, 1]);
  const flowO = lerp(f, [180, 220], [0, 1]);
  return (
    <VisualBox>
      <VisualLabel text="Melatonin Suppression" />
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 36 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 110, height: 140, borderRadius: '8px 8px 0 0',
            background: `linear-gradient(180deg, ${C.green}cc, ${C.green}88)`,
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 10,
          }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: C.bg }}>100%</span>
          </div>
          <div style={{ width: 110, height: 2, background: `${C.sub}22` }} />
          <div style={{ fontSize: 14, color: C.sub, marginTop: 8 }}>スマホなし</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 110, height: barH, borderRadius: '8px 8px 0 0',
            background: `linear-gradient(180deg, ${color}cc, ${color}88)`,
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 8,
          }}>
            {barH > 24 && <span style={{ fontSize: 18, fontWeight: 800, color: C.bg }}>{Math.round(barH / 1.4)}%</span>}
          </div>
          <div style={{ width: 110, height: 2, background: `${C.sub}22` }} />
          <div style={{ fontSize: 14, color: C.sub, marginTop: 8 }}>スマホあり</div>
        </div>
        <IconPhone size={68} color={color} />
      </div>
      <div style={{ opacity: labO }}>
        <div style={{ fontSize: 36, fontWeight: 800, color, fontFamily: 'Helvetica Neue, sans-serif' }}>最大 50% 抑制</div>
      </div>
      {/* Phase 2: flow */}
      <div style={{ opacity: flowO, display: 'flex', alignItems: 'center', gap: 8 }}>
        {['スマホ光', '→', '脳が昼と錯覚', '→', 'メラトニン↓', '→', '眠れない'].map((item, i) => (
          <span key={i} style={{
            fontSize: i % 2 === 1 ? 16 : 13, color: i % 2 === 1 ? `${color}77` : C.sub,
            fontFamily: 'Hiragino Kaku Gothic ProN, sans-serif', fontWeight: i % 2 === 0 ? 600 : 400,
            opacity: lerp(f, [180 + i * 10, 208 + i * 10], [0, 1]),
          }}>{item}</span>
        ))}
      </div>
    </VisualBox>
  );
};

// ⑤ 寝相: 3 positions using geometric SVG (no emoji)
const SleepPosIcon = ({ type, color, size = 80 }) => {
  if (type === 'curl') return (
    <svg width={size} height={size} viewBox="0 0 80 80">
      <path d="M40,68 A28,28 0 1,1 12,40 A14,14 0 1,0 40,68 Z" fill={`${color}18`} stroke={color} strokeWidth="2.5" />
      <circle cx="14" cy="28" r="5" fill={`${color}66`} />
    </svg>
  );
  if (type === 'star') return (
    <svg width={size} height={size} viewBox="0 0 80 80">
      <circle cx="40" cy="20" r="8" fill="none" stroke={color} strokeWidth="2.5" />
      <line x1="40" y1="28" x2="40" y2="58" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="40" y1="40" x2="16" y2="56" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="40" y1="40" x2="64" y2="56" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="40" y1="58" x2="24" y2="76" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="40" y1="58" x2="56" y2="76" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
  // prone (うつ伏せ)
  return (
    <svg width={size} height={size} viewBox="0 0 80 80">
      <ellipse cx="40" cy="40" rx="32" ry="14" fill={`${color}12`} stroke={color} strokeWidth="2.5" />
      <circle cx="8" cy="40" r="7" fill="none" stroke={`${color}88`} strokeWidth="2" />
      <line x1="15" y1="40" x2="25" y2="32" stroke={`${color}55`} strokeWidth="1.5" />
      <line x1="15" y1="40" x2="25" y2="48" stroke={`${color}55`} strokeWidth="1.5" />
    </svg>
  );
};

const V5 = ({ f }) => {
  const pctO = lerp(f, [170, 210], [0, 1]);
  const items = [
    { type: 'curl', label: '丸まる', sub: '安心感を求める', pct: '41%', c: C.blue },
    { type: 'star', label: '大の字', sub: '開放的', pct: '28%', c: C.gold },
    { type: 'prone', label: 'うつ伏せ', sub: 'コントロール型', pct: '17%', c: C.green },
  ];
  return (
    <VisualBox>
      <VisualLabel text="Sleep Position & Personality" />
      <div style={{ display: 'flex', gap: 28 }}>
        {items.map((it, i) => {
          const op = lerp(f, [40 + i * 18, 66 + i * 18], [0, 1]);
          const ty = lerp(f, [40 + i * 18, 66 + i * 18], [24, 0]);
          return (
            <div key={i} style={{
              background: `${it.c}0a`, border: `1px solid ${it.c}33`,
              borderTop: `3px solid ${it.c}`,
              borderRadius: 18, padding: '24px 24px 20px',
              textAlign: 'center', width: 178,
              opacity: op, transform: `translateY(${ty}px)`,
            }}>
              <SleepPosIcon type={it.type} color={it.c} size={72} />
              <div style={{ fontSize: 20, fontWeight: 800, color: it.c, marginTop: 12, fontFamily: 'Hiragino Kaku Gothic ProN, sans-serif' }}>{it.label}</div>
              <div style={{ fontSize: 13, color: C.sub, marginTop: 4 }}>{it.sub}</div>
              <div style={{ opacity: pctO, fontSize: 26, fontWeight: 900, color: it.c, marginTop: 10, fontFamily: 'Helvetica Neue, sans-serif' }}>{it.pct}</div>
            </div>
          );
        })}
      </div>
      <div style={{ opacity: pctO, fontSize: 12, color: `${C.sub}66` }}>※各姿勢の割合（参考値）</div>
    </VisualBox>
  );
};

// ⑥ 90分: Wave + markers
const V6 = ({ f, color }) => {
  const prog = lerp(f, [40, 210], [0, 1]);
  const labO = lerp(f, [175, 208], [0, 1]);
  const mrkO = lerp(f, [220, 255], [0, 1]);
  const VW = 880, VH = 210;
  const pts = Array.from({ length: 140 }, (_, i) => {
    const t = i / 139;
    if (t > prog) return null;
    return `${20 + t * (VW - 40)},${VH / 2 + (-Math.sin(t * Math.PI * 4.5) * 72 + Math.sin(t * Math.PI * 2) * 18)}`;
  }).filter(Boolean).join(' ');
  return (
    <VisualBox>
      <VisualLabel text="Sleep Cycle Variation" />
      <svg width={VW} height={VH + 26} viewBox={`0 0 ${VW} ${VH + 26}`}>
        <line x1="20" y1={VH / 2} x2={VW - 20} y2={VH / 2} stroke={`${color}1a`} strokeWidth="1" />
        {['70min', '90min', '120min'].map((lbl, i) => (
          <text key={i} x={20 + (i * 0.4 + 0.2) * (VW - 40)} y={VH + 22} textAnchor="middle" fontSize="15" fill={`${color}66`} fontFamily="Helvetica Neue">{lbl}</text>
        ))}
        {pts && <polyline points={pts} fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />}
        {[
          { t: 0.14, label: 'Aさん  70min', c: C.red },
          { t: 0.49, label: 'Bさん  90min', c: color },
          { t: 0.85, label: 'Cさん 120min', c: C.gold },
        ].map((m, i) => {
          const mx = 20 + m.t * (VW - 40);
          return (
            <g key={i} opacity={mrkO}>
              <line x1={mx} y1="8" x2={mx} y2={VH - 8} stroke={m.c} strokeWidth="1.5" strokeDasharray="5,4" />
              <text x={mx} y="6" textAnchor="middle" fontSize="13" fill={m.c} fontFamily="Helvetica Neue">{m.label}</text>
            </g>
          );
        })}
      </svg>
      <div style={{ opacity: labO }}>
        <div style={{ fontSize: 28, fontWeight: 800, color }}>70〜120分　個人差がある</div>
      </div>
    </VisualBox>
  );
};

// ⑦ 体温: Curve + window
const V7 = ({ f, color }) => {
  const prog = lerp(f, [40, 180], [0, 1]);
  const mrkO = lerp(f, [145, 175], [0, 1]);
  const winO = lerp(f, [200, 235], [0, 1]);
  const VW = 880, VH = 210;
  const tempY = (t) => t < 0.32 ? VH * 0.78 - t * (VH * 0.62 / 0.32) : VH * 0.78 - VH * 0.62 + ((t - 0.32) / 0.68) * (VH * 0.56);
  const pts = Array.from({ length: 130 }, (_, i) => {
    const t = i / 129;
    if (t > prog) return null;
    return `${20 + t * (VW - 40)},${tempY(t)}`;
  }).filter(Boolean).join(' ');
  const p90x = 20 + 0.56 * (VW - 40);
  const sleepX = 20 + 0.84 * (VW - 40);
  return (
    <VisualBox>
      <VisualLabel text="Core Body Temperature" />
      <svg width={VW} height={VH + 26} viewBox={`0 0 ${VW} ${VH + 26}`}>
        <line x1="20" y1={VH * 0.78} x2={VW - 20} y2={VH * 0.78} stroke={`${color}1a`} strokeWidth="1" />
        <text x="22" y={VH + 22} fontSize="14" fill={`${color}55`} fontFamily="Helvetica Neue">入浴</text>
        <text x={p90x - 12} y={VH + 22} fontSize="14" fill={C.gold} fontFamily="Helvetica Neue" opacity={mrkO}>90分後</text>
        <text x={VW - 30} y={VH + 22} fontSize="14" fill={`${color}55`} fontFamily="Helvetica Neue">就寝</text>
        {pts && <polyline points={pts} fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />}
        {prog > 0.32 && <circle cx={20 + 0.32 * (VW - 40)} cy={tempY(0.32)} r="7" fill={color} opacity={mrkO} />}
        <line x1={p90x} y1="12" x2={p90x} y2={VH * 0.78} stroke={C.gold} strokeWidth="2" strokeDasharray="6,4" opacity={mrkO} />
        <rect x={p90x} y="12" width={sleepX - p90x} height={VH * 0.78 - 12}
          fill={`${C.gold}08`} stroke={`${C.gold}28`} strokeWidth="1.5" rx="2" opacity={winO} />
        <text x={(p90x + sleepX) / 2} y="26" textAnchor="middle" fontSize="12" fill={C.gold} fontFamily="Helvetica Neue" opacity={winO}>最適入眠窓</text>
      </svg>
      <div style={{ fontSize: 24, fontWeight: 800, color }}>入浴90分後が最も眠りやすい</div>
    </VisualBox>
  );
};

// ══════════════════════════════════════
//  TRIVIA DATA
// ══════════════════════════════════════
const TRIVIAS = [
  {
    num: 1, color: C.blue, Visual: V1, layout: 'full',
    title: 'あくびは\n"[脳の冷却装置]"',
    left:  { label: 'common belief', value: '×', note: '「酸素不足を\n補うため」は誤り' },
    right: { label: 'cooling effect', value: '↓T', note: 'あくびで脳の\n温度が下がる' },
    telop: [
      { from: 80,  to: 252, text: '眠くなるとあくびが出ますよね' },
      { from: 252, to: 442, text: '実は「酸素不足を補う」ためではありません' },
      { from: 442, to: 640, text: '脳の温度を下げる冷却装置だったんです' },
    ],
  },
  {
    num: 2, color: C.gold, Visual: V2, layout: 'side',
    title: '夢の実時間は\n"[ほんの数秒]"',
    left:  { label: 'perceived time', value: '∞', note: '体感では\n何時間もの夢' },
    right: { label: 'actual time', value: '<10s', note: '脳の処理は\nわずか数十秒' },
    telop: [
      { from: 80,  to: 252, text: '「すごく長い夢を見た」という経験、ありますよね' },
      { from: 252, to: 442, text: 'でも脳が処理している時間は数秒〜数十秒程度' },
      { from: 442, to: 640, text: '記憶を圧縮して再生しているような状態なんです' },
    ],
  },
  {
    num: 3, color: C.sub, Visual: V3, layout: 'full',
    title: '金縛りは\n"[体だけ寝ている]"状態',
    left:  { label: 'phase', value: 'REM', note: 'レム睡眠中に\n筋肉が自動ブロック' },
    right: { label: 'phenomenon', value: 'GAP', note: '意識だけが\n先に覚醒してしまう' },
    telop: [
      { from: 80,  to: 252, text: '金縛りの正体は、科学的に説明できます' },
      { from: 252, to: 442, text: 'レム睡眠中、脳は筋肉の動きをブロックしています' },
      { from: 442, to: 640, text: '意識だけ先に覚醒して、体のブロックが残っている状態です' },
    ],
  },
  {
    num: 4, color: C.red, Visual: V4, layout: 'side',
    title: 'スマホは\n毎晩"[時差ボケ]"を起こしている',
    left:  { label: 'suppression', value: '50%', note: 'メラトニンが\n最大半分まで減少' },
    right: { label: 'equivalent to', value: 'JET\nLAG', note: '毎晩\n時差ボケ状態' },
    telop: [
      { from: 80,  to: 252, text: 'ブルーライトを浴びると、脳は「まだ昼間だ」と錯覚します' },
      { from: 252, to: 442, text: '睡眠ホルモン・メラトニンが最大50%も抑制されます' },
      { from: 442, to: 640, text: 'これは海外旅行の時差ボケと全く同じ仕組みです' },
    ],
  },
  {
    num: 5, color: C.green, Visual: V5, layout: 'full',
    title: '寝相には\n"[個性]"が出る',
    left:  { label: 'most common', value: '41%', note: '丸まり型が\n最も多いとされる' },
    right: { label: 'types', value: '3', note: '寝相から読み解く\n3つの心理タイプ' },
    telop: [
      { from: 80,  to: 252, text: '寝相には心理的な傾向があると言われています' },
      { from: 252, to: 442, text: '丸まる＝安心感、大の字＝開放的、うつ伏せ＝コントロール型' },
      { from: 442, to: 640, text: '心理学の分野で研究されている興味深い相関です' },
    ],
  },
  {
    num: 6, color: C.blue, Visual: V6, layout: 'side',
    title: '90分サイクルは\n"[平均値]"に過ぎない',
    left:  { label: 'min cycle', value: '70', note: '最短サイクルは\n70分の人もいる' },
    right: { label: 'max cycle', value: '120', note: '最長サイクルは\n120分の人もいる' },
    telop: [
      { from: 80,  to: 252, text: '「90分の倍数で起きると良い」はよく聞く話' },
      { from: 252, to: 442, text: 'でも実際は70分〜120分と、個人差があります' },
      { from: 442, to: 640, text: 'スッキリ起きられるタイミングが、あなたの正解です' },
    ],
  },
  {
    num: 7, color: C.gold, Visual: V7, layout: 'full',
    title: '体温が"[下がる瞬間]"に\n眠気がやってくる',
    left:  { label: 'optimal bath timing', value: '90', note: '就寝の90分前に\n入浴するのがベスト' },
    right: { label: 'temperature drop', value: '↓', note: '体温急降下で\n自然な眠気が来る' },
    telop: [
      { from: 80,  to: 252, text: '人は深部体温が下がるタイミングで眠気を感じます' },
      { from: 252, to: 442, text: 'お風呂で体温を上げると、その後急激に体温が下がります' },
      { from: 442, to: 640, text: 'だから寝る90分前の入浴が最も効果的なんです' },
    ],
  },
];

// ── Opening ──
const Opening = ({ f }) => {
  const sc = fade(f, 450);
  const t1O = lerp(f, [6, 28], [0, 1]);
  const t1Y = lerp(f, [6, 28], [14, 0]);
  const divW = lerp(f, [35, 78], [0, 460]);
  const subO = lerp(f, [72, 108], [0, 1]);
  const subY = lerp(f, [72, 108], [12, 0]);
  const crdO = lerp(f, [45, 78], [0, 1]);
  const crdS = lerp(f, [45, 78], [0.8, 1]);
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: sc }}>
      <Bg color={C.blue} />
      <div style={{ position: 'absolute', left: 92, top: '50%', transform: 'translateY(-50%)', width: 880 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22, opacity: t1O, transform: `translateY(${t1Y}px)` }}>
          <div style={{ width: 3, height: 16, background: C.gold, borderRadius: 2 }} />
          <span style={{ fontSize: 13, color: C.sub, letterSpacing: '0.18em', fontFamily: 'Helvetica Neue, sans-serif', fontWeight: 700 }}>HEALTH &amp; LIFESTYLE</span>
        </div>
        <div style={{ fontSize: 84, fontWeight: 900, color: C.white, lineHeight: 1.16, fontFamily: 'Hiragino Kaku Gothic ProN, sans-serif', opacity: t1O, transform: `translateY(${t1Y}px)` }}>
          9割が知らない<br /><span style={{ color: C.blue }}>睡眠</span>の雑学
        </div>
        <div style={{ width: divW, height: 3, marginTop: 28, marginBottom: 28, background: `linear-gradient(90deg, ${C.gold}, transparent)`, borderRadius: 2 }} />
        <div style={{ fontSize: 25, color: C.sub, lineHeight: 1.9, fontFamily: 'Hiragino Kaku Gothic ProN, sans-serif', opacity: subO, transform: `translateY(${subY}px)` }}>
          人生の約1/3を眠って過ごす私たち。<br />
          でも眠りの真実を知っている人はほとんどいません。<br />
          今日は聞いたら話したくなる雑学を7つ紹介します。
        </div>
      </div>
      <div style={{ position: 'absolute', right: 92, top: '50%', transform: `translateY(-50%) scale(${crdS})`, opacity: crdO, transformOrigin: 'center', textAlign: 'center' }}>
        <div style={{ background: C.glassBg, border: `1px solid ${C.glassBorder}`, borderRadius: 28, padding: '48px 68px', boxShadow: `0 0 80px rgba(94,176,240,0.08)` }}>
          <div style={{ fontSize: 13, color: C.sub, letterSpacing: '0.18em', marginBottom: 10, fontFamily: 'Helvetica Neue, sans-serif' }}>TODAY'S TRIVIA</div>
          <div style={{ fontSize: 144, fontWeight: 900, color: C.gold, lineHeight: 1, fontFamily: 'Helvetica Neue, sans-serif', textShadow: `0 0 60px ${C.gold}44` }}>7</div>
          <div style={{ fontSize: 18, color: C.sub, marginTop: 10, fontFamily: 'Helvetica Neue, sans-serif' }}>selected facts</div>
        </div>
      </div>
    </div>
  );
};

// ── Trivia Scene ──
const TriviaScene = ({ f, total, data }) => {
  const sc = fade(f, total);
  const visOp = lerp(f, [18, 46], [0, 1]);
  const visSc = lerp(f, [18, 46], [0.87, 1]);

  return (
    <div style={{ position: 'absolute', inset: 0, opacity: sc }}>
      <Bg color={data.color} />
      <Tag num={data.num} color={data.color} />
      <Dots cur={data.num} />
      <Title f={f} text={data.title} color={data.color} />

      {data.layout === 'side' ? (
        <div style={{
          position: 'absolute',
          top: 195, left: 40, right: 40, bottom: 110,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 36,
        }}>
          <StatPanelInline f={f} delay={88} side="left" color={data.color} {...data.left} />
          <div style={{ opacity: visOp, transform: `scale(${visSc})`, flexShrink: 0 }}>
            <data.Visual f={f} color={data.color} />
          </div>
          <StatPanelInline f={f} delay={118} side="right" color={data.color} {...data.right} />
        </div>
      ) : (
        <div style={{
          position: 'absolute',
          top: 195, left: 0, right: 0, bottom: 110,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: visOp,
          transform: `scale(${visSc * 1.28})`,
        }}>
          <data.Visual f={f} color={data.color} />
        </div>
      )}

      <Telop f={f} lines={data.telop} />
    </div>
  );
};

// ── Ending ──
const Ending = ({ f }) => {
  const sc = fade(f, 600);
  const titleO = lerp(f, [10, 36], [0, 1]);
  const titleY = lerp(f, [10, 36], [18, 0]);
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: sc }}>
      <Bg color={C.blue} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '0 96px' }}>
        <div style={{ fontSize: 50, fontWeight: 900, color: C.white, marginBottom: 44, fontFamily: 'Hiragino Kaku Gothic ProN, sans-serif', textAlign: 'center', opacity: titleO, transform: `translateY(${titleY}px)` }}>
          今日の<span style={{ color: C.blue }}>7つ</span>の雑学、まとめ
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 40px', width: '100%', maxWidth: 1480 }}>
          {TRIVIAS.map((t, i) => {
            const op = lerp(f, [36 + i * 13, 62 + i * 13], [0, 1]);
            const tx = lerp(f, [36 + i * 13, 62 + i * 13], [-20, 0]);
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 18,
                background: C.glassBg, border: `1px solid ${t.color}28`,
                borderLeft: `4px solid ${t.color}`,
                borderRadius: 12, padding: '16px 26px',
                opacity: op, transform: `translateX(${tx}px)`,
              }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: t.color, minWidth: 32, fontFamily: 'Hiragino Kaku Gothic ProN, sans-serif' }}>
                  {['①','②','③','④','⑤','⑥','⑦'][i]}
                </div>
                <div style={{ fontSize: 20, color: C.white, fontFamily: 'Hiragino Kaku Gothic ProN, sans-serif' }}>
                  {t.telop[2].text}
                </div>
              </div>
            );
          })}
          <div style={{
            background: `linear-gradient(135deg, rgba(94,176,240,0.08), rgba(240,192,64,0.06))`,
            border: `1px solid ${C.gold}44`, borderRadius: 12, padding: '16px 26px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: lerp(f, [175, 215], [0, 1]),
          }}>
            <div style={{ fontSize: 20, color: C.gold, fontFamily: 'Hiragino Kaku Gothic ProN, sans-serif', textAlign: 'center', fontWeight: 700 }}>
              チャンネル登録・高評価よろしくお願いします！
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Root ──
export const SleepTriviaComposition = () => {
  const frame = useCurrentFrame();
  if (frame < S.opening[1]) return <AbsoluteFill><Opening f={frame} /></AbsoluteFill>;
  for (let i = 0; i < 7; i++) {
    const key = `t${i + 1}`;
    const [start, end] = S[key];
    if (frame >= start && frame < end)
      return <AbsoluteFill><TriviaScene f={frame - start} total={end - start} data={TRIVIAS[i]} /></AbsoluteFill>;
  }
  return <AbsoluteFill><Ending f={frame - S.ending[0]} /></AbsoluteFill>;
};
