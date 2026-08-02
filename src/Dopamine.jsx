import { AbsoluteFill, useCurrentFrame, interpolate, Audio, Sequence } from 'remotion';
import { staticFile } from 'remotion';

// ─── Design System ───────────────────────────────────────────────────────────
const C = {
  bg: '#f5f3ee',
  paper: '#ffffff',
  text: '#1a1a2e',
  sub: '#6b7280',
  blue: '#2563eb',
  gold: '#d97706',
  red: '#dc2626',
  green: '#059669',
  border: 'rgba(26,26,46,0.08)',
  cardBg: 'rgba(255,255,255,0.9)',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const lerp = (f, [a, b], [c, d]) =>
  interpolate(f, [a, b], [c, d], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
const fadeIn = (f, delay = 0) => lerp(f, [delay, delay + 18], [0, 1]);
const fadeOut = (f, total) => lerp(f, [total - 14, total], [1, 0]);
const sceneFade = (f, total) => Math.min(fadeIn(f), fadeOut(f, total));

// ─── Audio Duration Constants ─────────────────────────────────────────────────
const AUDIO = {
  s1: 614,
  s2: 969,
  s3: 1153,
  s4: 935,
  s5: 942,
  s6: 804,
  s7: 929,
};
const BUF = 20;

// ─── Scene Boundaries ────────────────────────────────────────────────────────
const OP_END = 150;
const S1_START = OP_END;
const S2_START = S1_START + AUDIO.s1 + BUF;
const S3_START = S2_START + AUDIO.s2 + BUF;
const S4_START = S3_START + AUDIO.s3 + BUF;
const S5_START = S4_START + AUDIO.s4 + BUF;
const S6_START = S5_START + AUDIO.s5 + BUF;
const S7_START = S6_START + AUDIO.s6 + BUF;
const ED_START = S7_START + AUDIO.s7 + BUF;
export const TOTAL = ED_START + 600; // 7666

// ─── Background ──────────────────────────────────────────────────────────────
const Bg = () => (
  <div style={{ position: 'absolute', inset: 0, background: C.bg }}>
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'radial-gradient(circle, rgba(26,26,46,0.06) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }}
    />
  </div>
);

// ─── Captions ────────────────────────────────────────────────────────────────
// lines: [{ text, at, hi?, hiColor? }]
//   at = frame from scene start when this line appears
//   omit at → evenly distributed
const Captions = ({ lines, f, duration }) => {
  // Assign frame positions
  const timed = lines.map((entry, i) => {
    const e = typeof entry === 'string' ? { text: entry } : entry;
    const at = e.at !== undefined ? e.at
      : Math.floor((duration / lines.length) * i);
    return { ...e, at };
  });

  // Find current active line
  let idx = 0;
  for (let i = 0; i < timed.length; i++) {
    if (f >= timed[i].at) idx = i;
  }
  const entry = timed[idx];
  const nextAt = idx < timed.length - 1 ? timed[idx + 1].at : duration;
  const localF = f - entry.at;
  const lineDur = nextAt - entry.at;

  const lineOpacity = Math.min(
    lerp(localF, [0, 8], [0, 1]),
    lerp(localF, [lineDur - 8, lineDur], [1, 0])
  );

  const hi = entry.hi || null;
  const hiColor = entry.hiColor || '#e53935';

  const renderText = () => {
    if (!hi) return entry.text;
    const parts = entry.text.split(hi);
    return parts.flatMap((p, i) => i < parts.length - 1
      ? [p, <span key={i} style={{ color: hiColor }}>{hi}</span>]
      : [p]
    );
  };

  if (f < timed[0].at || f >= duration) return null;

  return (
    <div style={{
      position: 'absolute',
      bottom: 80,
      left: '50%',
      transform: 'translateX(-50%)',
      color: '#fff',
      fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif',
      fontSize: 36,
      fontWeight: 800,
      textAlign: 'center',
      lineHeight: 1.55,
      opacity: Math.max(0, Math.min(1, lineOpacity)),
      letterSpacing: '0.02em',
      whiteSpace: 'pre-wrap',
      textShadow: '0 2px 4px rgba(0,0,0,0.9), 0 0 12px rgba(0,0,0,0.8), 2px 2px 0 rgba(0,0,0,0.6)',
      maxWidth: '80%',
    }}>
      {renderText()}
    </div>
  );
};

// ─── Scene Label Pill ─────────────────────────────────────────────────────────
const SceneLabel = ({ label, opacity = 1 }) => (
  <div
    style={{
      position: 'absolute',
      top: 48,
      left: 80,
      background: C.blue,
      color: '#fff',
      fontSize: 13,
      fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif',
      fontWeight: 700,
      letterSpacing: '0.12em',
      padding: '6px 16px',
      borderRadius: 999,
      opacity,
    }}
  >
    {label}
  </div>
);

// ─── Opening (ダークサムネ風) ──────────────────────────────────────────────────
export const Opening = ({ f, title, subtitle, tags = [] }) => {
  const totalDur = 600;
  const sc = sceneFade(f, totalDur);
  const tagO = fadeIn(f, 0);
  const tagX = lerp(f, [0, 20], [-30, 0]);
  const t1O = fadeIn(f, 18);
  const t1Y = lerp(f, [18, 42], [40, 0]);
  const t2O = fadeIn(f, 36);
  const t2Y = lerp(f, [36, 60], [40, 0]);
  const subO = fadeIn(f, 65);
  const brainO = fadeIn(f, 30);
  const brainSc = lerp(f, [30, 70], [0.88, 1]);

  const lines = title.split('\n');
  const mid = Math.ceil(lines.length / 2);
  const line1 = lines.slice(0, mid).join('\n');
  const line2 = lines.slice(mid).join('\n');

  return (
    <AbsoluteFill style={{ opacity: sc }}>
      {/* Dark background with subtle noise */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 60%, #111111 100%)' }} />
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(ellipse at 70% 50%, rgba(245,230,66,0.04) 0%, transparent 60%)',
      }} />

      {/* Category tag top-left */}
      <div style={{
        position: 'absolute', top: 72, left: 80,
        display: 'flex', gap: 10, alignItems: 'center',
        opacity: tagO, transform: `translateX(${tagX}px)`,
      }}>
        {tags.map((tag, i) => (
          <div key={i} style={{
            background: i === 0 ? '#f5e642' : 'rgba(255,255,255,0.1)',
            border: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.2)',
            color: i === 0 ? '#111111' : '#fff',
            fontSize: 18,
            fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif',
            fontWeight: 700,
            padding: '7px 20px',
            borderRadius: 6,
            letterSpacing: '0.08em',
          }}>{tag}</div>
        ))}
      </div>

      {/* Left: Title block */}
      <div style={{
        position: 'absolute', left: 80, top: 0, bottom: 0, width: 980,
        display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12,
      }}>
        {/* Line 1 — yellow */}
        <div style={{ opacity: t1O, transform: `translateY(${t1Y}px)` }}>
          {line1.split('\n').map((l, i) => (
            <div key={i} style={{
              fontFamily: 'Hiragino Kaku Gothic ProN, sans-serif',
              fontSize: 118,
              fontWeight: 900,
              color: '#f5e642',
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              textShadow: '0 0 60px rgba(245,230,66,0.3)',
            }}>{l}</div>
          ))}
        </div>
        {/* Line 2 — white */}
        <div style={{ opacity: t2O, transform: `translateY(${t2Y}px)` }}>
          {line2.split('\n').map((l, i) => (
            <div key={i} style={{
              fontFamily: 'Hiragino Kaku Gothic ProN, sans-serif',
              fontSize: 118,
              fontWeight: 900,
              color: '#ffffff',
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
            }}>{l}</div>
          ))}
        </div>
        {/* Subtitle */}
        <div style={{
          opacity: subO, marginTop: 20,
          fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif',
          fontSize: 26, color: 'rgba(255,255,255,0.55)',
          letterSpacing: '0.05em',
        }}>{subtitle}</div>
      </div>

      {/* Right: Brain SVG visual */}
      <div style={{
        position: 'absolute', right: 60, top: 0, bottom: 0, width: 760,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: brainO, transform: `scale(${brainSc})`,
      }}>
        <svg width="680" height="680" viewBox="0 0 680 680">
          {/* Glow bg */}
          <defs>
            <radialGradient id="glow" cx="50%" cy="50%">
              <stop offset="0%" stopColor="#f5e642" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#f5e642" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="340" cy="340" r="320" fill="url(#glow)" />
          {/* Brain outline */}
          <ellipse cx="340" cy="340" rx="220" ry="180" fill="none" stroke="rgba(245,230,66,0.2)" strokeWidth="2" />
          {/* Brain folds */}
          {[
            "M160,280 Q220,240 280,270 Q340,240 400,270 Q460,240 520,280",
            "M145,320 Q210,290 280,310 Q340,285 400,310 Q470,285 535,320",
            "M155,360 Q215,335 285,355 Q340,330 395,355 Q465,330 525,360",
            "M170,400 Q225,378 290,395 Q340,375 390,395 Q455,375 510,400",
          ].map((d, i) => (
            <path key={i} d={d} fill="none" stroke={i < 2 ? '#f5e642' : 'rgba(255,255,255,0.35)'} strokeWidth={i < 2 ? 3 : 2} strokeLinecap="round" opacity={0.8 - i * 0.1} />
          ))}
          {/* Center divider */}
          <line x1="340" y1="170" x2="340" y2="510" stroke="rgba(245,230,66,0.3)" strokeWidth="1.5" strokeDasharray="8,6" />
          {/* Dopamine label */}
          <text x="340" y="570" textAnchor="middle" fontSize="22" fontFamily="Helvetica Neue" fontWeight="700" fill="rgba(245,230,66,0.7)" letterSpacing="6">DOPAMINE</text>
          {/* Connecting dots */}
          {[[200,260],[340,200],[480,260],[520,340],[480,420],[340,470],[200,420],[160,340]].map(([x,y],i) => (
            <circle key={i} cx={x} cy={y} r="5" fill={i % 2 === 0 ? '#f5e642' : 'rgba(255,255,255,0.6)'} opacity="0.8" />
          ))}
        </svg>
      </div>

      {/* Bottom right: SCIENCE NOTE */}
      <div style={{
        position: 'absolute', bottom: 60, right: 80,
        fontFamily: 'Helvetica Neue, sans-serif', fontSize: 16,
        fontWeight: 700, letterSpacing: '0.3em',
        color: 'rgba(255,255,255,0.25)',
        opacity: subO,
      }}>SCIENCE NOTE</div>
    </AbsoluteFill>
  );
};

// ─── Ending ───────────────────────────────────────────────────────────────────
export const Ending = ({ f }) => {
  const totalDur = 600;
  const masterOpacity = sceneFade(f, totalDur);
  const headingOpacity = fadeIn(f, 0);
  const b1Opacity = fadeIn(f, 40);
  const b2Opacity = fadeIn(f, 80);
  const b3Opacity = fadeIn(f, 120);
  const ctaOpacity = fadeIn(f, 180);

  const bullets = [
    'ドーパミンは快楽ではなく、やる気・動機づけのホルモン',
    '現代の即時報酬環境が閾値を上げ、普通の満足感を奪っている',
    '意図的に「遅延」を作ることで、本来の感度を取り戻せるかもしれない',
  ];
  const bulletOpacities = [b1Opacity, b2Opacity, b3Opacity];

  return (
    <AbsoluteFill style={{ opacity: masterOpacity }}>
      <Bg />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 48,
          padding: '0 160px',
        }}
      >
        {/* Heading */}
        <div
          style={{
            opacity: headingOpacity,
            fontFamily: 'Hiragino Mincho ProN, Georgia, serif',
            fontSize: 52,
            fontWeight: 700,
            color: C.text,
            letterSpacing: '0.05em',
          }}
        >
          今日のまとめ
        </div>

        {/* Bullets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28, width: '100%', maxWidth: 960 }}>
          {bullets.map((text, i) => (
            <div
              key={i}
              style={{
                opacity: bulletOpacities[i],
                display: 'flex',
                alignItems: 'flex-start',
                gap: 20,
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: C.blue,
                  flexShrink: 0,
                  marginTop: 10,
                }}
              />
              <div
                style={{
                  fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif',
                  fontSize: 26,
                  color: C.text,
                  lineHeight: 1.6,
                  letterSpacing: '0.03em',
                }}
              >
                {text}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div
          style={{
            opacity: ctaOpacity,
            fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif',
            fontSize: 22,
            color: C.gold,
            letterSpacing: '0.05em',
            fontWeight: 600,
          }}
        >
          チャンネル登録・高評価よろしくお願いします
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 1: Hook ────────────────────────────────────────────────────────────
const Scene1 = ({ f, duration }) => {
  const masterOpacity = sceneFade(f, duration);
  const leftOpacity = fadeIn(f, 10);
  const strikeProgress = lerp(f, [80, 120], [0, 1]);
  const rightOpacity = fadeIn(f, 130);

  return (
    <AbsoluteFill style={{ opacity: masterOpacity }}>
      <Bg />
      <SceneLabel label="SCENE 01 / HOOK" opacity={fadeIn(f, 5)} />

      {/* Left area: main content */}
      <div
        style={{
          position: 'absolute',
          left: 80,
          top: 0,
          bottom: 0,
          width: '55%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 40,
        }}
      >
        <div
          style={{
            opacity: leftOpacity,
            fontFamily: 'Hiragino Mincho ProN, Georgia, serif',
            fontSize: 28,
            color: C.sub,
            letterSpacing: '0.05em',
          }}
        >
          努力が続かない理由は…
        </div>

        {/* Strikethrough word */}
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <div
            style={{
              opacity: leftOpacity,
              fontFamily: 'Hiragino Mincho ProN, Georgia, serif',
              fontSize: 96,
              fontWeight: 700,
              color: C.text,
              letterSpacing: '0.02em',
            }}
          >
            意志の問題？
          </div>
          {/* Strikethrough line */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: 0,
              height: 6,
              background: C.red,
              width: `${strikeProgress * 100}%`,
              borderRadius: 3,
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div
            style={{
              opacity: rightOpacity,
              fontFamily: 'Hiragino Mincho ProN, Georgia, serif',
              fontSize: 32,
              color: C.sub,
              fontWeight: 600,
            }}
          >
            NO —
          </div>
          <div
            style={{
              opacity: rightOpacity,
              fontFamily: 'Hiragino Mincho ProN, Georgia, serif',
              fontSize: 80,
              fontWeight: 700,
              color: C.blue,
              letterSpacing: '0.02em',
            }}
          >
            環境の問題
          </div>
        </div>
      </div>

      {/* Right visual: ≠ comparison */}
      <div
        style={{
          position: 'absolute',
          right: 80,
          top: 0,
          bottom: 0,
          width: '35%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 20,
          opacity: rightOpacity,
        }}
      >
        <div
          style={{
            background: C.cardBg,
            border: `1px solid ${C.border}`,
            borderRadius: 24,
            padding: '40px 48px',
            textAlign: 'center',
            boxShadow: '0 4px 24px rgba(26,26,46,0.07)',
          }}
        >
          <div
            style={{
              fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif',
              fontSize: 32,
              color: C.sub,
              marginBottom: 8,
              textDecoration: 'line-through',
              textDecorationColor: C.red,
            }}
          >
            意志力
          </div>
          <div
            style={{
              fontFamily: 'Helvetica Neue, Arial, sans-serif',
              fontSize: 48,
              fontWeight: 700,
              color: C.sub,
              margin: '12px 0',
            }}
          >
            ≠
          </div>
          <div
            style={{
              fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif',
              fontSize: 32,
              color: C.blue,
              fontWeight: 700,
            }}
          >
            環境設計
          </div>
        </div>
      </div>

      <Captions f={f} duration={AUDIO.s1} lines={[
        { text: 'やる気が続かない',                                  at: 5,   hi: 'やる気',    hiColor: '#e53935' },
        { text: '頑張ろうとしても、すぐに別のことが気になる',          at: 68  },
        { text: '意志の弱さでしょうか？',                            at: 156, hi: '意志の弱さ', hiColor: '#e53935' },
        { text: '現代の環境そのものが\n脳に何かをしているのでは？',    at: 255 },
        { text: '昔の人と今の私たちの間で',                          at: 397 },
        { text: '一体、何が変わったのか？',                          at: 468, hi: '何が変わったのか', hiColor: '#2563eb' },
        { text: 'カギは「ドーパミン」にあるかもしれない',              at: 535, hi: 'ドーパミン', hiColor: '#2563eb' },
      ]} />
      <Audio src={staticFile('audio/dopamine/s1_hook.wav')} />
    </AbsoluteFill>
  );
};

// ─── Scene 2: ドーパミンとは ──────────────────────────────────────────────────
const Scene2 = ({ f, duration }) => {
  const masterOpacity = sceneFade(f, duration);
  const titleOpacity = fadeIn(f, 10);
  const wantingOpacity = fadeIn(f, 30);
  const notEqOpacity = fadeIn(f, 55);
  const pleasureOpacity = fadeIn(f, 75);
  const barOpacity = fadeIn(f, 120);
  const barH1 = lerp(f, [130, 180], [0, 200]);
  const barH2 = lerp(f, [150, 200], [0, 130]);

  return (
    <AbsoluteFill style={{ opacity: masterOpacity }}>
      <Bg />
      <SceneLabel label="SCENE 02 / DOPAMINE" opacity={fadeIn(f, 5)} />

      {/* Left content */}
      <div
        style={{
          position: 'absolute',
          left: 80,
          top: 0,
          bottom: 0,
          width: '55%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 12,
        }}
      >
        <div
          style={{
            opacity: titleOpacity,
            fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif',
            fontSize: 22,
            color: C.sub,
            letterSpacing: '0.08em',
            marginBottom: 16,
          }}
        >
          ドーパミンの正体
        </div>

        <div
          style={{
            opacity: wantingOpacity,
            fontFamily: 'Helvetica Neue, Arial, sans-serif',
            fontSize: 108,
            fontWeight: 900,
            color: C.blue,
            letterSpacing: '-0.02em',
            lineHeight: 1,
          }}
        >
          WANTING
        </div>

        <div
          style={{
            opacity: notEqOpacity,
            fontFamily: 'Helvetica Neue, Arial, sans-serif',
            fontSize: 52,
            fontWeight: 700,
            color: C.sub,
          }}
        >
          ≠
        </div>

        <div
          style={{
            opacity: pleasureOpacity,
            fontFamily: 'Helvetica Neue, Arial, sans-serif',
            fontSize: 72,
            fontWeight: 700,
            color: C.sub,
            letterSpacing: '-0.01em',
          }}
        >
          PLEASURE
        </div>

        <div
          style={{
            opacity: fadeIn(f, 100),
            fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif',
            fontSize: 20,
            color: C.sub,
            fontStyle: 'italic',
            marginTop: 24,
          }}
        >
          ― Wolfram Schultz / Robert Sapolsky
        </div>
      </div>

      {/* Right: bar chart */}
      <div
        style={{
          position: 'absolute',
          right: 80,
          top: 0,
          bottom: 0,
          width: '35%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 32,
          opacity: barOpacity,
        }}
      >
        <div
          style={{
            fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif',
            fontSize: 18,
            color: C.sub,
            marginBottom: 8,
          }}
        >
          ドーパミン分泌量
        </div>
        <div style={{ display: 'flex', gap: 48, alignItems: 'flex-end', height: 260 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 80,
                height: barH1,
                background: C.blue,
                borderRadius: '8px 8px 0 0',
                transition: 'height 0.5s',
              }}
            />
            <div
              style={{
                fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif',
                fontSize: 16,
                color: C.blue,
                fontWeight: 600,
              }}
            >
              報酬前
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 80,
                height: barH2,
                background: C.sub,
                borderRadius: '8px 8px 0 0',
                opacity: 0.6,
              }}
            />
            <div
              style={{
                fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif',
                fontSize: 16,
                color: C.sub,
              }}
            >
              報酬後
            </div>
          </div>
        </div>
        <div
          style={{
            fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif',
            fontSize: 13,
            color: C.sub,
            opacity: 0.7,
          }}
        >
          ※ 概念図
        </div>
      </div>

      <Captions f={f} duration={AUDIO.s2} lines={[
        { text: 'ドーパミン＝「快楽ホルモン」',                       at: 5   },
        { text: 'でも、それは正確ではありません',                     at: 120, hi: '正確ではありません', hiColor: '#e53935' },
        { text: 'シュルツ博士（2017年ノーベル賞）の研究',             at: 272 },
        { text: 'ドーパミンは「報酬そのもの」ではなく',               at: 339 },
        { text: '「報酬を予測したとき」に分泌される',                 at: 412, hi: '予測したとき', hiColor: '#2563eb' },
        { text: '本質は「やる気」のホルモン',                         at: 567, hi: 'やる気',      hiColor: '#2563eb' },
        { text: 'サポルスキー教授（スタンフォード）',                  at: 719 },
        { text: '「もらう直前」の方がドーパミンが多く出る',           at: 870, hi: 'もらう直前',  hiColor: '#2563eb' },
        { text: '報酬への「期待」こそがエンジン',                     at: 920 },
      ]} />
      <Audio src={staticFile('audio/dopamine/s2_what.wav')} />
    </AbsoluteFill>
  );
};

// ─── Scene 3: 昔の生活 ────────────────────────────────────────────────────────
const Scene3 = ({ f, duration }) => {
  const masterOpacity = sceneFade(f, duration);
  const headingOpacity = fadeIn(f, 10);
  const lineOpacity = fadeIn(f, 40);
  const progressWidth = lerp(f, [60, 260], [0, 100]);
  const labelOpacity = fadeIn(f, 80);
  const rightOpacity = fadeIn(f, 120);

  return (
    <AbsoluteFill style={{ opacity: masterOpacity }}>
      <Bg />
      <SceneLabel label="SCENE 03 / ANCIENT LIFE" opacity={fadeIn(f, 5)} />

      {/* Left content */}
      <div
        style={{
          position: 'absolute',
          left: 80,
          top: 0,
          bottom: 0,
          width: '55%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 40,
        }}
      >
        <div
          style={{
            opacity: headingOpacity,
            fontFamily: 'Hiragino Mincho ProN, Georgia, serif',
            fontSize: 64,
            fontWeight: 700,
            color: C.text,
          }}
        >
          昔の生活
        </div>
        <div
          style={{
            opacity: fadeIn(f, 25),
            fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif',
            fontSize: 24,
            color: C.sub,
            lineHeight: 1.7,
          }}
        >
          努力と報酬の間には<br />長い「待ち時間」があった
        </div>

        {/* Timeline */}
        <div style={{ opacity: lineOpacity, position: 'relative', marginTop: 20 }}>
          {/* Track */}
          <div
            style={{
              height: 6,
              background: C.border,
              borderRadius: 3,
              position: 'relative',
              marginBottom: 20,
            }}
          >
            {/* Progress */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                height: '100%',
                width: `${progressWidth}%`,
                background: C.blue,
                borderRadius: 3,
              }}
            />
          </div>

          {/* WANTING TIME label */}
          <div
            style={{
              opacity: labelOpacity,
              position: 'absolute',
              top: -32,
              left: '10%',
              right: '10%',
              textAlign: 'center',
              fontFamily: 'Helvetica Neue, Arial, sans-serif',
              fontSize: 15,
              fontWeight: 700,
              color: C.blue,
              letterSpacing: '0.15em',
            }}
          >
            ← WANTING TIME →
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div
              style={{
                fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif',
                fontSize: 20,
                color: C.text,
                fontWeight: 600,
              }}
            >
              努力
            </div>
            <div
              style={{
                fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif',
                fontSize: 20,
                color: C.gold,
                fontWeight: 600,
              }}
            >
              報酬
            </div>
          </div>
        </div>

        <div
          style={{
            opacity: fadeIn(f, 200),
            fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif',
            fontSize: 16,
            color: C.sub,
            fontStyle: 'italic',
          }}
        >
          ― Kent Berridge, University of Michigan
        </div>
      </div>

      {/* Right visual */}
      <div
        style={{
          position: 'absolute',
          right: 80,
          top: 0,
          bottom: 0,
          width: '35%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 24,
          opacity: rightOpacity,
        }}
      >
        <div
          style={{
            background: C.cardBg,
            border: `1px solid ${C.border}`,
            borderRadius: 24,
            padding: '48px 40px',
            textAlign: 'center',
            boxShadow: '0 4px 24px rgba(26,26,46,0.07)',
          }}
        >
          <div
            style={{
              fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif',
              fontSize: 18,
              color: C.sub,
              marginBottom: 24,
            }}
          >
            昔の報酬サイクル
          </div>
          {[
            { label: '狩りに出る', color: C.text },
            { label: '数日〜数週間', color: C.sub, small: true },
            { label: '獲物を得る', color: C.gold },
          ].map((item, i) => (
            <div key={i} style={{ marginBottom: i < 2 ? 8 : 0 }}>
              {item.small ? (
                <div
                  style={{
                    fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif',
                    fontSize: 14,
                    color: item.color,
                    margin: '8px 0',
                    opacity: 0.7,
                  }}
                >
                  {item.label}
                </div>
              ) : (
                <div
                  style={{
                    fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif',
                    fontSize: 22,
                    color: item.color,
                    fontWeight: 600,
                  }}
                >
                  {item.label}
                </div>
              )}
              {i < 2 && (
                <div
                  style={{ fontSize: 20, color: C.sub, opacity: 0.4, marginTop: 4 }}
                >
                  ↓
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <Captions f={f} duration={AUDIO.s3} lines={[
        { text: '農耕が始まる以前の生活を想像してみてください',         at: 5   },
        { text: '食料を得るには、動物の足跡を何時間も追う',             at: 111 },
        { text: '川で何度も空振りを繰り返し',                          at: 227 },
        { text: 'ようやく獲物にありつける',                             at: 315, hi: 'ようやく', hiColor: '#2563eb' },
        { text: '報酬が来るまでの時間が長く、道のりは不確か',           at: 370 },
        { text: '「まだか…まだか」という時間こそが',                   at: 460, hi: 'まだか',   hiColor: '#2563eb' },
        { text: 'ドーパミンを持続的に分泌させていた',                   at: 552 },
        { text: 'バリッジ教授（ミシガン大）の指摘',                     at: 669 },
        { text: 'wanting（欲しがる）≠ liking（満足する）',             at: 740, hi: 'wanting', hiColor: '#2563eb' },
        { text: '昔の生活では、wantingの時間が長かった',                at: 928 },
        { text: 'つまりドーパミンが長く機能し続けていた',               at: 1064 },
      ]} />
      <Audio src={staticFile('audio/dopamine/s3_past.wav')} />
    </AbsoluteFill>
  );
};

// ─── Scene 4: 今の生活 ────────────────────────────────────────────────────────
const Scene4 = ({ f, duration }) => {
  const masterOpacity = sceneFade(f, duration);
  const headingOpacity = fadeIn(f, 10);

  // 3 short cycle animations, staggered
  const cycles = [0, 120, 240];
  const thresholdOpacity = fadeIn(f, 380);

  return (
    <AbsoluteFill style={{ opacity: masterOpacity }}>
      <Bg />
      <SceneLabel label="SCENE 04 / MODERN LIFE" opacity={fadeIn(f, 5)} />

      <div
        style={{
          position: 'absolute',
          left: 80,
          top: 0,
          bottom: 0,
          width: '55%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 32,
        }}
      >
        <div
          style={{
            opacity: headingOpacity,
            fontFamily: 'Hiragino Mincho ProN, Georgia, serif',
            fontSize: 64,
            fontWeight: 700,
            color: C.text,
          }}
        >
          今の生活
        </div>
        <div
          style={{
            opacity: fadeIn(f, 25),
            fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif',
            fontSize: 22,
            color: C.sub,
            lineHeight: 1.7,
          }}
        >
          即時報酬の繰り返しが<br />ドーパミン閾値を上げていく
        </div>

        {/* 3 short timelines */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {cycles.map((offset, i) => {
            const cycleF = Math.max(0, f - offset);
            const cycleOpacity = fadeIn(cycleF, 10);
            const pW = lerp(cycleF, [20, 60], [0, 100]);
            return (
              <div key={i} style={{ opacity: cycleOpacity }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span
                    style={{
                      fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif',
                      fontSize: 16,
                      color: C.text,
                    }}
                  >
                    タップ
                  </span>
                  <span
                    style={{
                      fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif',
                      fontSize: 16,
                      color: C.gold,
                    }}
                  >
                    即報酬
                  </span>
                </div>
                <div
                  style={{
                    height: 5,
                    background: C.border,
                    borderRadius: 3,
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      height: '100%',
                      width: `${pW}%`,
                      background: `linear-gradient(90deg, ${C.blue}, ${C.gold})`,
                      borderRadius: 3,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Threshold text */}
        <div
          style={{
            opacity: thresholdOpacity,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginTop: 8,
          }}
        >
          <div
            style={{
              fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif',
              fontSize: 48,
              fontWeight: 700,
              color: C.red,
            }}
          >
            閾値 ↑
          </div>
          <div
            style={{
              fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif',
              fontSize: 20,
              color: C.sub,
            }}
          >
            普通の満足感が薄れていく
          </div>
        </div>

        <div
          style={{
            opacity: fadeIn(f, 450),
            fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif',
            fontSize: 16,
            color: C.sub,
            fontStyle: 'italic',
          }}
        >
          ― Anna Lembke, Stanford University
        </div>
      </div>

      {/* Right visual */}
      <div
        style={{
          position: 'absolute',
          right: 80,
          top: 0,
          bottom: 0,
          width: '35%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 24,
          opacity: fadeIn(f, 100),
        }}
      >
        <div
          style={{
            background: C.cardBg,
            border: `1px solid ${C.border}`,
            borderRadius: 24,
            padding: '48px 40px',
            textAlign: 'center',
            boxShadow: '0 4px 24px rgba(26,26,46,0.07)',
          }}
        >
          <div
            style={{
              fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif',
              fontSize: 18,
              color: C.sub,
              marginBottom: 24,
            }}
          >
            現代の報酬サイクル
          </div>
          {[
            { label: 'スマホを開く', color: C.text },
            { label: '0.3秒', color: C.sub, small: true },
            { label: 'いいね！', color: C.gold },
          ].map((item, i) => (
            <div key={i} style={{ marginBottom: i < 2 ? 8 : 0 }}>
              {item.small ? (
                <div
                  style={{
                    fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif',
                    fontSize: 14,
                    color: item.color,
                    margin: '8px 0',
                    opacity: 0.7,
                  }}
                >
                  {item.label}
                </div>
              ) : (
                <div
                  style={{
                    fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif',
                    fontSize: 22,
                    color: item.color,
                    fontWeight: 600,
                  }}
                >
                  {item.label}
                </div>
              )}
              {i < 2 && (
                <div
                  style={{ fontSize: 20, color: C.sub, opacity: 0.4, marginTop: 4 }}
                >
                  ↓
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <Captions f={f} duration={AUDIO.s4} lines={[
        { text: 'では、現代はどうでしょうか',                           at: 5   },
        { text: 'お腹が空いたら → 30分で届く',                        at: 70,  hi: '30分で届く',     hiColor: '#e53935' },
        { text: '退屈なら → 無限スクロール',                           at: 160, hi: '無限スクロール', hiColor: '#e53935' },
        { text: '知りたいことは → 3秒で答えが出る',                    at: 240, hi: '3秒で',          hiColor: '#e53935' },
        { text: 'あらゆる欲求が、ほぼ即座に満たされる',                 at: 321 },
        { text: 'レンブケ博士（スタンフォード精神科）',                  at: 420 },
        { text: '「過剰刺激」が続くと',                                 at: 510, hi: '過剰刺激',       hiColor: '#e53935' },
        { text: '脳のドーパミン系の「閾値」が上がる',                   at: 590, hi: '閾値',           hiColor: '#e53935' },
        { text: 'より強い刺激がないと、やる気が出なくなる',             at: 706 },
        { text: '同じ量のコーヒーでは眠気が覚めなくなる',              at: 810 },
      ]} />
      <Audio src={staticFile('audio/dopamine/s4_now.wav')} />
    </AbsoluteFill>
  );
};

// ─── Scene 5: スマホ ──────────────────────────────────────────────────────────
const Scene5 = ({ f, duration }) => {
  const masterOpacity = sceneFade(f, duration);
  const headingOpacity = fadeIn(f, 10);
  const col1Opacity = fadeIn(f, 40);
  const col2Opacity = fadeIn(f, 80);
  // Phase 0(0-300): 静か, Phase 1(300-480): バースト時に少し強調, Phase 2(480+): 安定
  const pulseAmp = f < 300 ? 0.02 : f < 480 ? 0.05 : 0.015;
  const pulseSpeed = f < 480 ? 10 : 12;
  const pulseScale = 1 + pulseAmp * Math.sin((f / pulseSpeed) * Math.PI * 2);

  // Phase: 0=通常(0-300), 1=バースト(300-480), 2=沈静化(480-)
  const phase = f < 300 ? 0 : f < 480 ? 1 : 2;

  // Base dots — always visible
  const baseDots = [
    { x: 15, y: 20, delay: 100 },
    { x: 60, y: 10, delay: 140 },
    { x: 35, y: 55, delay: 180 },
    { x: 80, y: 40, delay: 120 },
    { x: 20, y: 75, delay: 220 },
    { x: 70, y: 70, delay: 160 },
    { x: 50, y: 30, delay: 200 },
    { x: 10, y: 45, delay: 250 },
    { x: 90, y: 20, delay: 130 },
    { x: 45, y: 85, delay: 190 },
  ];

  // Burst dots — appear only during phase 1
  const burstDots = [
    { x: 25, y: 15 }, { x: 55, y: 35 }, { x: 75, y: 60 },
    { x: 40, y: 80 }, { x: 85, y: 25 }, { x: 30, y: 50 },
    { x: 65, y: 85 }, { x: 10, y: 65 }, { x: 50, y: 10 },
    { x: 80, y: 75 }, { x: 20, y: 40 }, { x: 70, y: 45 },
  ];

  const cycleLen = phase === 1 ? 40 : phase === 2 ? 120 : 80;

  return (
    <AbsoluteFill style={{ opacity: masterOpacity }}>
      <Bg />
      <SceneLabel label="SCENE 05 / SMARTPHONE" opacity={fadeIn(f, 5)} />

      <div
        style={{
          position: 'absolute',
          left: 80,
          top: 0,
          bottom: 0,
          width: '55%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 40,
        }}
      >
        <div
          style={{
            opacity: headingOpacity,
            fontFamily: 'Hiragino Mincho ProN, Georgia, serif',
            fontSize: 56,
            fontWeight: 700,
            color: C.text,
          }}
        >
          スマホが設計する報酬
        </div>

        {/* Two columns */}
        <div style={{ display: 'flex', gap: 40 }}>
          {/* Fixed reward */}
          <div
            style={{
              opacity: col1Opacity,
              flex: 1,
              background: C.cardBg,
              border: `1px solid ${C.border}`,
              borderRadius: 20,
              padding: '32px 28px',
              boxShadow: '0 2px 12px rgba(26,26,46,0.05)',
            }}
          >
            <div
              style={{
                fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif',
                fontSize: 14,
                color: C.sub,
                letterSpacing: '0.1em',
                marginBottom: 16,
              }}
            >
              FIXED REWARD
            </div>
            <div
              style={{
                fontFamily: 'Hiragino Mincho ProN, Georgia, serif',
                fontSize: 28,
                fontWeight: 700,
                color: C.sub,
                marginBottom: 16,
              }}
            >
              固定報酬
            </div>
            <div
              style={{
                fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif',
                fontSize: 16,
                color: C.sub,
                lineHeight: 1.6,
                opacity: 0.8,
              }}
            >
              毎回同じ報酬<br />→ 慣れが生じる<br />→ 飽きる
            </div>
          </div>

          {/* Variable reward */}
          <div
            style={{
              opacity: col2Opacity,
              flex: 1,
              background: `rgba(37,99,235,0.06)`,
              border: `2px solid ${C.blue}`,
              borderRadius: 20,
              padding: '32px 28px',
              boxShadow: '0 4px 24px rgba(37,99,235,0.15)',
              transform: `scale(${pulseScale})`,
            }}
          >
            <div
              style={{
                fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif',
                fontSize: 14,
                color: C.blue,
                letterSpacing: '0.1em',
                marginBottom: 16,
                fontWeight: 700,
              }}
            >
              VARIABLE REWARD
            </div>
            <div
              style={{
                fontFamily: 'Hiragino Mincho ProN, Georgia, serif',
                fontSize: 28,
                fontWeight: 700,
                color: C.blue,
                marginBottom: 16,
              }}
            >
              可変報酬
            </div>
            <div
              style={{
                fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif',
                fontSize: 16,
                color: C.text,
                lineHeight: 1.6,
              }}
            >
              時々大きな報酬<br />→ 予測不可能<br />→ やめられない
            </div>
          </div>
        </div>

        <div
          style={{
            opacity: fadeIn(f, 200),
            fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif',
            fontSize: 16,
            color: C.sub,
            fontStyle: 'italic',
          }}
        >
          ― B.F. Skinner / Variable Reward Schedule
        </div>
      </div>

      {/* Right: notification dots */}
      <div
        style={{
          position: 'absolute',
          right: 80,
          top: 0,
          bottom: 0,
          width: '35%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
        }}
      >
        <div
          style={{
            opacity: col2Opacity,
            fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif',
            fontSize: 16,
            color: C.sub,
            marginBottom: 8,
          }}
        >
          Likeの通知
        </div>
        <div
          style={{
            position: 'relative',
            width: 320,
            height: 320,
            background: C.cardBg,
            border: `1px solid ${C.border}`,
            borderRadius: 24,
            boxShadow: '0 4px 24px rgba(26,26,46,0.07)',
            overflow: 'hidden',
          }}
        >
          {baseDots.map((dot, i) => {
            const ph = (f - dot.delay + cycleLen * 10) % cycleLen;
            const o = ph < 18 ? ph / 18 : ph < cycleLen * 0.6 ? 1 : (cycleLen - ph) / (cycleLen * 0.4);
            return (
              <div key={i} style={{
                position: 'absolute', left: `${dot.x}%`, top: `${dot.y}%`,
                width: 22, height: 22, borderRadius: '50%', background: C.blue,
                opacity: f > dot.delay ? Math.max(0, Math.min(1, o)) : 0,
                transform: 'translate(-50%, -50%)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 11, color: '#fff' }}>♥</span>
              </div>
            );
          })}
          {phase === 1 && burstDots.map((dot, i) => {
            const burstF = f - 300;
            const stagger = i * 6;
            const o = burstF < stagger ? 0 : burstF < stagger + 12 ? (burstF - stagger) / 12 : burstF < 160 ? 1 : (180 - burstF) / 20;
            return (
              <div key={`b${i}`} style={{
                position: 'absolute', left: `${dot.x}%`, top: `${dot.y}%`,
                width: 22, height: 22, borderRadius: '50%',
                background: i % 3 === 0 ? C.blue : i % 3 === 1 ? C.red : C.gold,
                opacity: Math.max(0, Math.min(1, o)),
                transform: 'translate(-50%, -50%)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 11, color: '#fff' }}>♥</span>
              </div>
            );
          })}
        </div>
      </div>

      <Captions f={f} duration={AUDIO.s5} lines={[
        { text: 'その中でも、SNSは構造的に特別',                       at: 15  },
        { text: 'スキナーが発見した「可変報酬スケジュール」',           at: 152, hi: '可変報酬スケジュール', hiColor: '#2563eb' },
        { text: '「毎回もらえる」より「もらえるかもしれない」',         at: 321 },
        { text: '不規則なパターンの方が、行動が強化される',             at: 417, hi: '行動が強化される',    hiColor: '#e53935' },
        { text: 'スロットマシンがやめられないのも、これが理由',         at: 508, hi: 'スロットマシン',      hiColor: '#e53935' },
        { text: 'SNSの「いいね」もまったく同じ構造',                   at: 624 },
        { text: '来るときもあれば、突然たくさん来ることもある',         at: 759 },
        { text: 'この予測不能性が、脳を何度も画面に向かわせる',        at: 814, hi: '予測不能性',          hiColor: '#e53935' },
      ]} />
      <Audio src={staticFile('audio/dopamine/s5_phone.wav')} />
    </AbsoluteFill>
  );
};

// ─── Scene 6: 何が起きているか ────────────────────────────────────────────────
const Scene6 = ({ f, duration }) => {
  const masterOpacity = sceneFade(f, duration);
  const headingOpacity = fadeIn(f, 10);
  const wantingOpacity = fadeIn(f, 40);
  const likingOpacity = fadeIn(f, 80);
  const gapOpacity = fadeIn(f, 120);

  const wantingSize = lerp(f, [40, 120], [80, 140]);
  const likingSize = lerp(f, [80, 160], [80, 60]);
  const gapHeight = lerp(f, [120, 220], [0, 120]);

  return (
    <AbsoluteFill style={{ opacity: masterOpacity }}>
      <Bg />
      <SceneLabel label="SCENE 06 / DIVERGENCE" opacity={fadeIn(f, 5)} />

      <div
        style={{
          position: 'absolute',
          left: 80,
          top: 0,
          bottom: 0,
          width: '50%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 20,
        }}
      >
        <div
          style={{
            opacity: headingOpacity,
            fontFamily: 'Hiragino Mincho ProN, Georgia, serif',
            fontSize: 44,
            fontWeight: 700,
            color: C.text,
            marginBottom: 20,
          }}
        >
          脳内で何が起きているか
        </div>

        <div
          style={{
            opacity: wantingOpacity,
            fontFamily: 'Helvetica Neue, Arial, sans-serif',
            fontSize: wantingSize,
            fontWeight: 900,
            color: C.blue,
            letterSpacing: '-0.02em',
            lineHeight: 1,
          }}
        >
          WANTING ↑
        </div>

        <div
          style={{
            opacity: gapOpacity,
            height: gapHeight,
            display: 'flex',
            alignItems: 'center',
            paddingLeft: 12,
          }}
        >
          <div
            style={{
              width: 4,
              height: '100%',
              background: `linear-gradient(${C.blue}, ${C.red})`,
              borderRadius: 2,
              opacity: 0.5,
            }}
          />
          <div
            style={{
              marginLeft: 16,
              fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif',
              fontSize: 18,
              color: C.sub,
              fontStyle: 'italic',
            }}
          >
            乖離が広がる
          </div>
        </div>

        <div
          style={{
            opacity: likingOpacity,
            fontFamily: 'Helvetica Neue, Arial, sans-serif',
            fontSize: likingSize,
            fontWeight: 900,
            color: C.red,
            letterSpacing: '-0.02em',
            lineHeight: 1,
          }}
        >
          LIKING ↓
        </div>

        <div
          style={{
            opacity: fadeIn(f, 200),
            fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif',
            fontSize: 16,
            color: C.sub,
            fontStyle: 'italic',
            marginTop: 20,
          }}
        >
          ― Kent Berridge
        </div>
      </div>

      {/* Right visual */}
      <div
        style={{
          position: 'absolute',
          right: 80,
          top: 0,
          bottom: 0,
          width: '40%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 24,
          opacity: fadeIn(f, 60),
        }}
      >
        <div
          style={{
            background: C.cardBg,
            border: `1px solid ${C.border}`,
            borderRadius: 24,
            padding: '48px 40px',
            textAlign: 'center',
            boxShadow: '0 4px 24px rgba(26,26,46,0.07)',
            width: '100%',
          }}
        >
          <div
            style={{
              fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif',
              fontSize: 18,
              color: C.sub,
              marginBottom: 32,
            }}
          >
            欲しいのに満たされない
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <div
              style={{
                background: `rgba(37,99,235,0.1)`,
                border: `1px solid ${C.blue}`,
                borderRadius: 12,
                padding: '16px',
                fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif',
                fontSize: 18,
                color: C.blue,
                fontWeight: 600,
              }}
            >
              もっと欲しい（WANTING）
            </div>
            <div
              style={{
                background: `rgba(220,38,38,0.08)`,
                border: `1px solid ${C.red}`,
                borderRadius: 12,
                padding: '16px',
                fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif',
                fontSize: 18,
                color: C.red,
                fontWeight: 600,
              }}
            >
              でも楽しめない（LIKING）
            </div>
          </div>
        </div>
      </div>

      <Captions f={f} duration={AUDIO.s6} lines={[
        { text: 'バリッジ教授の言葉を借りれば',                         at: 5   },
        { text: 'wanting（欲しがる）は高まっているのに',                at: 72,  hi: 'wanting', hiColor: '#2563eb' },
        { text: 'liking（実際の満足感）は伴わなくなっている',           at: 129, hi: 'liking',  hiColor: '#e53935' },
        { text: '何かを手に入れても、すぐ次が欲しくなる',               at: 270 },
        { text: 'やり遂げても、達成感が薄い',                           at: 375, hi: '達成感が薄い', hiColor: '#e53935' },
        { text: '普通の日常が、どこか虚ろに感じられる',                 at: 434 },
        { text: 'これは性格や根性の問題ではない',                       at: 532 },
        { text: '長期の過剰刺激によって',                               at: 630 },
        { text: '脳のドーパミン系が変化している可能性がある',           at: 679 },
      ]} />
      <Audio src={staticFile('audio/dopamine/s6_effect.wav')} />
    </AbsoluteFill>
  );
};

// ─── Scene 7: 解決策 ──────────────────────────────────────────────────────────
const Scene7 = ({ f, duration }) => {
  const masterOpacity = sceneFade(f, duration);
  const headingOpacity = fadeIn(f, 10);
  const mainOpacity = fadeIn(f, 50);
  const item1Opacity = fadeIn(f, 120);
  const item2Opacity = fadeIn(f, 160);
  const item3Opacity = fadeIn(f, 200);

  return (
    <AbsoluteFill style={{ opacity: masterOpacity }}>
      <Bg />
      <SceneLabel label="SCENE 07 / SOLUTION" opacity={fadeIn(f, 5)} />

      <div
        style={{
          position: 'absolute',
          left: 80,
          top: 110,
          bottom: 180,
          width: '55%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 40,
        }}
      >
        <div
          style={{
            opacity: headingOpacity,
            fontFamily: 'Hiragino Mincho ProN, Georgia, serif',
            fontSize: 56,
            fontWeight: 700,
            color: C.text,
          }}
        >
          どうすればいいか？
        </div>

        {/* Main message */}
        <div
          style={{
            opacity: mainOpacity,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              fontFamily: 'Hiragino Mincho ProN, Georgia, serif',
              fontSize: 64,
              fontWeight: 700,
              color: C.text,
            }}
          >
            意図的な
          </span>
          <span
            style={{
              fontFamily: 'Hiragino Mincho ProN, Georgia, serif',
              fontSize: 64,
              fontWeight: 700,
              color: C.gold,
              background: 'rgba(217,119,6,0.1)',
              padding: '0 12px',
              borderRadius: 8,
              border: `2px solid ${C.gold}`,
            }}
          >
            遅延
          </span>
        </div>

        {/* 3 action items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {[
            { text: 'スマホを置く', opacity: item1Opacity },
            { text: '退屈を埋めない', opacity: item2Opacity },
            { text: '間を楽しむ', opacity: item3Opacity },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                opacity: item.opacity,
                display: 'flex',
                alignItems: 'center',
                gap: 20,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: C.blue,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'Helvetica Neue, Arial, sans-serif',
                  fontSize: 16,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </div>
              <div
                style={{
                  fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif',
                  fontSize: 32,
                  color: C.text,
                  fontWeight: 600,
                }}
              >
                {item.text}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right visual */}
      <div
        style={{
          position: 'absolute',
          right: 80,
          top: 110,
          bottom: 180,
          width: '35%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 24,
          opacity: fadeIn(f, 80),
        }}
      >
        <div
          style={{
            background: C.cardBg,
            border: `2px solid ${C.gold}`,
            borderRadius: 24,
            padding: '48px 40px',
            textAlign: 'center',
            boxShadow: '0 4px 24px rgba(217,119,6,0.12)',
          }}
        >
          <div
            style={{
              fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif',
              fontSize: 16,
              color: C.gold,
              letterSpacing: '0.1em',
              fontWeight: 700,
              marginBottom: 24,
            }}
          >
            DOPAMINE DETOX
          </div>
          <div
            style={{
              fontFamily: 'Hiragino Mincho ProN, Georgia, serif',
              fontSize: 28,
              fontWeight: 700,
              color: C.text,
              lineHeight: 1.5,
            }}
          >
            感度を<br />取り戻す
          </div>
          <div
            style={{
              marginTop: 24,
              fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif',
              fontSize: 16,
              color: C.sub,
              lineHeight: 1.6,
            }}
          >
            普通の喜びを<br />感じられる脳へ
          </div>
        </div>
      </div>

      <Captions f={f} duration={AUDIO.s7} lines={[
        { text: 'では、どうすればいいのでしょうか',                     at: 5   },
        { text: '答えは単純ですが、簡単ではありません',                 at: 80  },
        { text: '意図的に「遅らせる」こと',                             at: 174, hi: '遅らせる',    hiColor: '#2563eb' },
        { text: 'すぐ手に入るものを、少し待つ',                        at: 233 },
        { text: 'スマホを置く時間をつくる',                             at: 300, hi: 'スマホを置く', hiColor: '#2563eb' },
        { text: '退屈をすぐに埋めない',                                 at: 356, hi: '退屈',         hiColor: '#e53935' },
        { text: '報酬が来るまでの「間」を生活に戻す',                  at: 411 },
        { text: 'ドーパミンは、目標に向かう道中、私たちを動かす',       at: 536 },
        { text: '昔の人が持っていたその感覚を',                         at: 732 },
        { text: '現代の私たちも取り戻せる余地は、あるはずです',         at: 820 },
      ]} />
      <Audio src={staticFile('audio/dopamine/s7_solution.wav')} />
    </AbsoluteFill>
  );
};

// ─── Root Composition ─────────────────────────────────────────────────────────
export const DopamineComposition = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Audio src={staticFile('audio/dopamine/bgm.mp3')} volume={0.12} />
      <Sequence from={0} durationInFrames={OP_END}>
        <Opening
          f={frame}
          title={"昔と今の\n生活習慣の違いは\nドーパミンが\n原因だった？"}
          subtitle={"なぜ現代人は努力が続かないのか"}
          tags={["ドーパミン", "脳科学", "現代生活", "習慣"]}
        />
      </Sequence>
      <Sequence from={S1_START} durationInFrames={S2_START - S1_START}>
        <Scene1 f={frame - S1_START} duration={AUDIO.s1 + BUF} />
      </Sequence>
      <Sequence from={S2_START} durationInFrames={S3_START - S2_START}>
        <Scene2 f={frame - S2_START} duration={AUDIO.s2 + BUF} />
      </Sequence>
      <Sequence from={S3_START} durationInFrames={S4_START - S3_START}>
        <Scene3 f={frame - S3_START} duration={AUDIO.s3 + BUF} />
      </Sequence>
      <Sequence from={S4_START} durationInFrames={S5_START - S4_START}>
        <Scene4 f={frame - S4_START} duration={AUDIO.s4 + BUF} />
      </Sequence>
      <Sequence from={S5_START} durationInFrames={S6_START - S5_START}>
        <Scene5 f={frame - S5_START} duration={AUDIO.s5 + BUF} />
      </Sequence>
      <Sequence from={S6_START} durationInFrames={S7_START - S6_START}>
        <Scene6 f={frame - S6_START} duration={AUDIO.s6 + BUF} />
      </Sequence>
      <Sequence from={S7_START} durationInFrames={ED_START - S7_START}>
        <Scene7 f={frame - S7_START} duration={AUDIO.s7 + BUF} />
      </Sequence>
      <Sequence from={ED_START} durationInFrames={TOTAL - ED_START}>
        <Ending f={frame - ED_START} />
      </Sequence>
    </AbsoluteFill>
  );
};
