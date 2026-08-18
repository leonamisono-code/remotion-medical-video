import { AbsoluteFill, useCurrentFrame, interpolate, Audio, Sequence, Img } from 'remotion';
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

// ─── Slide helper — crossfade between distinct visual states ─────────────────
const Slide = ({ f, from, to, children }) => {
  const op = Math.min(
    lerp(f, [from, from + 12], [0, 1]),
    lerp(f, [to - 12, to], [1, 0])
  );
  if (op <= 0.001) return null;
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: op }}>
      {children}
    </div>
  );
};

// ─── Audio Duration Constants ─────────────────────────────────────────────────
const AUDIO = {
  s1: 657,
  s2: 1083,
  s3: 1240,
  s4: 1064,
  s5: 1215,
  s6: 1226,
  s7: 932,
};
const BUF = 20;

// ─── Scene Boundaries ────────────────────────────────────────────────────────
const OP_END = 0;
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

// ─── Opening — 3フェーズ構成 ─────────────────────────────────────────────────
export const Opening = ({ f, title, subtitle, tags = [] }) => {
  const totalDur = 270;
  const masterOp = Math.min(
    lerp(f, [0, 12], [0, 1]),
    lerp(f, [totalDur - 18, totalDur], [1, 0])
  );

  // Phase 1: Hook question (0-90f)
  const hookOp = Math.min(
    lerp(f, [5, 22], [0, 1]),
    lerp(f, [72, 92], [1, 0])
  );
  const hookScale = lerp(f, [5, 45], [0.88, 1]);

  // Phase 2: Brain image + rings (80-270f)
  const brainOp = lerp(f, [80, 128], [0, 1]);
  const brainScale = lerp(f, [80, 160], [1.06, 1]);

  // Phase 3: Tags + Title (155-270f)
  const tagOp = fadeIn(f, 155);
  const tagX = lerp(f, [155, 178], [-30, 0]);
  const t1Op = fadeIn(f, 174);
  const t1Y = lerp(f, [174, 200], [40, 0]);
  const t2Op = fadeIn(f, 196);
  const t2Y = lerp(f, [196, 222], [40, 0]);
  const subOp = fadeIn(f, 226);

  const lines = title.split('\n');
  const mid = Math.ceil(lines.length / 2);
  const line1 = lines.slice(0, mid).join('\n');
  const line2 = lines.slice(mid).join('\n');

  return (
    <AbsoluteFill style={{ opacity: masterOp }}>
      {/* ── Dark base ── */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(140deg, #07070f 0%, #0e0e1e 55%, #060610 100%)' }} />
      {/* ── Phase 1: Hook question ── */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: hookOp,
      }}>
        <div style={{
          fontFamily: 'Hiragino Kaku Gothic ProN, sans-serif',
          fontSize: 148,
          fontWeight: 900,
          color: '#ffffff',
          letterSpacing: '-0.02em',
          lineHeight: 1.1,
          textAlign: 'center',
          transform: `scale(${hookScale})`,
          textShadow: '0 0 100px rgba(255,255,255,0.12), 0 4px 32px rgba(0,0,0,0.8)',
        }}>
          なぜ、<br />頑張れないのか
        </div>
      </div>
      {/* ── Phase 2: Brain image ── */}
      <div style={{ position: 'absolute', inset: 0, opacity: brainOp }}>
        <div style={{
          position: 'absolute',
          right: -60,
          top: '50%',
          transform: `translateY(-50%) scale(${brainScale})`,
          width: 900, height: 900,
        }}>
          <Img
            src={staticFile('brain.png')}
            style={{
              width: '100%', height: '100%',
              objectFit: 'contain',
              filter: 'hue-rotate(190deg) saturate(1.8) brightness(0.9)',
              mixBlendMode: 'screen',
            }}
            from={-1} />
        </div>

        {/* Gold rings + overlays */}
        <svg style={{ position: 'absolute', inset: 0 }} width="1920" height="1080" viewBox="0 0 1920 1080">
          <defs>
            <filter id="opGlow">
              <feGaussianBlur in="SourceGraphic" stdDeviation="9" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <radialGradient id="opGoldBlob" cx="76%" cy="50%">
              <stop offset="0%"   stopColor="#f5a800" stopOpacity="0.32" />
              <stop offset="38%"  stopColor="#f5a800" stopOpacity="0.07" />
              <stop offset="100%" stopColor="#060610"  stopOpacity="0" />
            </radialGradient>
            <linearGradient id="opLeftFade" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%"   stopColor="#08080f" stopOpacity="1" />
              <stop offset="44%"  stopColor="#08080f" stopOpacity="0.88" />
              <stop offset="64%"  stopColor="#08080f" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#08080f" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="opTopFade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#07070f" stopOpacity="0.75" />
              <stop offset="18%"  stopColor="#07070f" stopOpacity="0" />
              <stop offset="82%"  stopColor="#07070f" stopOpacity="0" />
              <stop offset="100%" stopColor="#07070f" stopOpacity="0.75" />
            </linearGradient>
          </defs>

          {/* Glow blob */}
          <ellipse cx="1450" cy="540" rx="700" ry="560" fill="url(#opGoldBlob)" />

          {/* Concentric rings */}
          {[500, 400, 308, 225, 152, 90].map((r, i) => (
            <circle key={i} cx={1440} cy={542} r={r} fill="none"
              stroke={`rgba(245,180,40,${0.30 - i * 0.04})`}
              strokeWidth={i < 2 ? 3.5 : 2}
              filter="url(#opGlow)"
            />
          ))}

          {/* Center dot */}
          <circle cx={1440} cy={542} r={24} fill="rgba(245,180,40,0.18)" filter="url(#opGlow)" />
          <circle cx={1440} cy={542} r={10} fill="#f5b828" filter="url(#opGlow)" />

          {/* Overlays */}
          <rect x="0" y="0" width="1920" height="1080" fill="url(#opLeftFade)" />
          <rect x="0" y="0" width="1920" height="1080" fill="url(#opTopFade)" />

          <text x="1440" y="980" textAnchor="middle"
            fontSize="16" fontFamily="Helvetica Neue, Arial"
            fontWeight="700" letterSpacing="10"
            fill="rgba(245,180,40,0.40)">DOPAMINE</text>
        </svg>
      </div>
      {/* ── Phase 3: Tags ── */}
      <div style={{
        position: 'absolute', top: 72, left: 80,
        display: 'flex', gap: 10, alignItems: 'center',
        opacity: tagOp, transform: `translateX(${tagX}px)`,
      }}>
        {tags.map((tag, i) => (
          <div key={i} style={{
            background: i === 0 ? '#f5e642' : 'rgba(255,255,255,0.1)',
            border: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.2)',
            color: i === 0 ? '#111111' : '#fff',
            fontSize: 18, fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif',
            fontWeight: 700, padding: '7px 20px',
            borderRadius: 6, letterSpacing: '0.08em',
          }}>{tag}</div>
        ))}
      </div>
      {/* ── Phase 3: Title block ── */}
      <div style={{
        position: 'absolute', left: 80, top: 0, bottom: 0, width: 1020,
        display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 10,
      }}>
        <div style={{ opacity: t1Op, transform: `translateY(${t1Y}px)` }}>
          {line1.split('\n').map((l, i) => (
            <div key={i} style={{
              fontFamily: 'Hiragino Kaku Gothic ProN, sans-serif',
              fontSize: 110, fontWeight: 900,
              color: '#f5e642', lineHeight: 1.05, letterSpacing: '-0.02em',
              textShadow: '0 0 60px rgba(245,230,66,0.4)',
            }}>{l}</div>
          ))}
        </div>
        <div style={{ opacity: t2Op, transform: `translateY(${t2Y}px)` }}>
          {line2.split('\n').map((l, i) => (
            <div key={i} style={{
              fontFamily: 'Hiragino Kaku Gothic ProN, sans-serif',
              fontSize: 110, fontWeight: 900,
              color: '#ffffff', lineHeight: 1.05, letterSpacing: '-0.02em',
            }}>{l}</div>
          ))}
        </div>
        <div style={{
          opacity: subOp, marginTop: 18,
          fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif',
          fontSize: 26, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.05em',
        }}>{subtitle}</div>
      </div>
      {/* Bottom right watermark */}
      <div style={{
        position: 'absolute', bottom: 60, right: 80,
        fontFamily: 'Helvetica Neue, sans-serif', fontSize: 16,
        fontWeight: 700, letterSpacing: '0.3em',
        color: 'rgba(255,255,255,0.22)', opacity: subOp,
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

// ─── Scene 1: Hook — 3スライド構成 ───────────────────────────────────────────
const Scene1 = ({ f, duration }) => {
  const masterOpacity = sceneFade(f, duration);

  // Slide A: The Question (0-215)
  const aSubOp = fadeIn(f, 8);
  const aSubY = lerp(f, [8, 28], [-20, 0]);
  const aQOp = fadeIn(f, 28);
  const aQY = lerp(f, [28, 55], [60, 0]);

  // Slide B: Strikethrough / Negation (200-415)
  const bStrikeW = lerp(f, [208, 265], [0, 100]);
  const bNoOp = fadeIn(f, 265);
  const bNoScale = lerp(f, [265, 285], [0.7, 1]);

  // Slide C: Answer (400-duration)
  const cAnsOp = fadeIn(f, 408);
  const cAnsScale = lerp(f, [408, 440], [0.85, 1]);
  const cSubOp = fadeIn(f, 450);
  const cTagOp = fadeIn(f, 490);

  return (
    <AbsoluteFill style={{ opacity: masterOpacity }}>
      <Bg />
      <SceneLabel label="SCENE 01 / HOOK" opacity={fadeIn(f, 5)} />

      {/* Slide A: 問い */}
      <Slide f={f} from={0} to={215}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28 }}>
          <div style={{ opacity: aSubOp, transform: `translateY(${aSubY}px)`, fontFamily: 'Hiragino Mincho ProN, Georgia, serif', fontSize: 30, color: C.sub, letterSpacing: '0.1em' }}>
            努力が続かない理由は…
          </div>
          <div style={{ opacity: aQOp, transform: `translateY(${aQY}px)`, fontFamily: 'Hiragino Mincho ProN, Georgia, serif', fontSize: 120, fontWeight: 700, color: C.text, letterSpacing: '0.02em', lineHeight: 1, textAlign: 'center' }}>
            やる気の<br />問題？
          </div>
        </div>
      </Slide>

      {/* Slide B: 打ち消し */}
      <Slide f={f} from={200} to={415}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 40 }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <div style={{ fontFamily: 'Hiragino Mincho ProN, Georgia, serif', fontSize: 128, fontWeight: 700, color: C.text, letterSpacing: '0.02em', lineHeight: 1 }}>
              意志の問題？
            </div>
            <div style={{ position: 'absolute', top: '50%', left: 0, height: 8, width: `${bStrikeW}%`, background: C.red, borderRadius: 4, transform: 'translateY(-50%)' }} />
          </div>
          <div style={{ opacity: bNoOp, transform: `scale(${bNoScale})`, fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: 56, fontWeight: 700, color: C.sub, letterSpacing: '0.04em' }}>
            — NO —
          </div>
        </div>
      </Slide>

      {/* Slide C: 答え */}
      <Slide f={f} from={400} to={duration}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
          <div style={{ opacity: cAnsOp, transform: `scale(${cAnsScale})`, fontFamily: 'Hiragino Mincho ProN, Georgia, serif', fontSize: 108, fontWeight: 700, color: C.blue, letterSpacing: '0.02em', lineHeight: 1, textAlign: 'center' }}>
            環境の問題
          </div>
          <div style={{ opacity: cSubOp, fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif', fontSize: 26, color: C.sub, textAlign: 'center', lineHeight: 1.8 }}>
            現代の環境そのものが<br />脳に変化を起こしている
          </div>
          <div style={{ opacity: cTagOp, marginTop: 8, background: `rgba(37,99,235,0.08)`, border: `1px solid ${C.blue}`, borderRadius: 999, padding: '6px 24px', fontFamily: 'Helvetica Neue, sans-serif', fontSize: 14, color: C.blue, fontWeight: 700, letterSpacing: '0.15em' }}>
            KEY: DOPAMINE
          </div>
        </div>
      </Slide>

      <Captions f={f} duration={AUDIO.s1} lines={[
        { text: 'スマホを置こうとした。\nでも気づいたら1時間が過ぎていた。', at: 5 },
        { text: '「今日こそやる」と思ったのに\n気づけばXを開いている',       at: 155 },
        { text: 'これって、意志が弱いからでしょうか？',                      at: 286, hi: '意志が弱い', hiColor: '#e53935' },
        { text: '実は、そうではないかもしれません',                          at: 359 },
        { text: '原因は、脳の中で起きているある変化にあります',              at: 438 },
        { text: 'カギは「ドーパミン」という神経伝達物質です',                at: 570, hi: 'ドーパミン', hiColor: '#2563eb' },
      ]} />
      <Audio src={staticFile('audio/dopamine/s1_hook.wav')} />
    </AbsoluteFill>
  );
};

// ─── Scene 2: ドーパミンとは — 3スライド構成 ─────────────────────────────────
const Scene2 = ({ f, duration }) => {
  const masterOpacity = sceneFade(f, duration);

  // Slide A: WANTING spotlight (0-305)
  const aLabelOp = fadeIn(f, 8);
  const aWantOp = fadeIn(f, 18);
  const aWantScale = lerp(f, [18, 50], [0.8, 1]);
  const aSubOp = fadeIn(f, 80);

  // Slide B: WANTING ≠ PLEASURE + bar chart (290-650)
  const bWantOp = fadeIn(f, 295);
  const bNotEqOp = fadeIn(f, 318);
  const bPleasureOp = fadeIn(f, 338);
  const barH1 = lerp(f, [345, 400], [0, 180]);
  const barH2 = lerp(f, [365, 420], [0, 110]);
  const bCiteOp = fadeIn(f, 430);

  // Slide C: Conclusion (635-duration)
  const cHeadOp = fadeIn(f, 642);
  const cHeadScale = lerp(f, [642, 670], [0.88, 1]);
  const cQ1Op = fadeIn(f, 690);
  const cQ2Op = fadeIn(f, 730);

  return (
    <AbsoluteFill style={{ opacity: masterOpacity }}>
      <Bg />
      <SceneLabel label="SCENE 02 / DOPAMINE" opacity={fadeIn(f, 5)} />

      {/* Slide A: WANTING spotlight */}
      <Slide f={f} from={0} to={305}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <div style={{ opacity: aLabelOp, fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif', fontSize: 18, color: C.sub, letterSpacing: '0.14em' }}>
            ドーパミンの正体
          </div>
          <div style={{ opacity: aWantOp, transform: `scale(${aWantScale})`, fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: 160, fontWeight: 900, color: C.blue, letterSpacing: '-0.03em', lineHeight: 1 }}>
            WANTING
          </div>
          <div style={{ opacity: aSubOp, fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif', fontSize: 24, color: C.sub, letterSpacing: '0.04em', marginTop: 16 }}>
            「快楽」ではなく「欲しがる」こと
          </div>
        </div>
      </Slide>

      {/* Slide B: WANTING ≠ PLEASURE + bar chart */}
      <Slide f={f} from={290} to={650}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 80 }}>
          {/* Center equation */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ opacity: bWantOp, fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: 108, fontWeight: 900, color: C.blue, letterSpacing: '-0.03em', lineHeight: 1 }}>WANTING</div>
            <div style={{ opacity: bNotEqOp, fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: 64, fontWeight: 300, color: C.sub }}>≠</div>
            <div style={{ opacity: bPleasureOp, fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: 80, fontWeight: 700, color: C.sub, letterSpacing: '-0.02em', lineHeight: 1 }}>PLEASURE</div>
            <div style={{ opacity: bCiteOp, marginTop: 20, fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif', fontSize: 15, color: C.sub, fontStyle: 'italic' }}>― Wolfram Schultz / Robert Sapolsky</div>
          </div>
          {/* Bar chart */}
          <div style={{ opacity: bWantOp, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div style={{ fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif', fontSize: 13, color: C.sub }}>ドーパミン分泌量</div>
            <div style={{ display: 'flex', gap: 28, alignItems: 'flex-end', height: 200 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 56, height: barH1, background: C.blue, borderRadius: '6px 6px 0 0' }} />
                <div style={{ fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif', fontSize: 13, color: C.blue, fontWeight: 600 }}>報酬前</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 56, height: barH2, background: C.sub, borderRadius: '6px 6px 0 0', opacity: 0.5 }} />
                <div style={{ fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif', fontSize: 13, color: C.sub }}>報酬後</div>
              </div>
            </div>
            <div style={{ fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif', fontSize: 11, color: C.sub, opacity: 0.5 }}>※ 概念図</div>
          </div>
        </div>
      </Slide>

      {/* Slide C: Conclusion */}
      <Slide f={f} from={635} to={duration}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28 }}>
          <div style={{ opacity: cHeadOp, transform: `scale(${cHeadScale})`, fontFamily: 'Hiragino Mincho ProN, Georgia, serif', fontSize: 68, fontWeight: 700, color: C.text, textAlign: 'center', lineHeight: 1.3 }}>
            報酬への「期待」<br />こそがエンジン
          </div>
          <div style={{ display: 'flex', gap: 20, marginTop: 8 }}>
            <div style={{ opacity: cQ1Op, background: `rgba(37,99,235,0.08)`, border: `1px solid ${C.blue}`, borderRadius: 12, padding: '14px 28px', fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif', fontSize: 20, color: C.blue, fontWeight: 600 }}>
              もらう直前 → 最大分泌
            </div>
          </div>
          <div style={{ opacity: cQ2Op, fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif', fontSize: 16, color: C.sub, fontStyle: 'italic' }}>
            ドーパミンの本質は「やる気」のホルモン
          </div>
        </div>
      </Slide>

      <Captions f={f} duration={AUDIO.s2} lines={[
        { text: '神経科学者シュルツのサル実験',                           at: 5   },
        { text: 'ランプが光る → ジュースが出る',                         at: 150 },
        { text: '最初：ジュースが出た瞬間にドーパミン分泌',              at: 275 },
        { text: '繰り返すうち、タイミングが変わった',                    at: 417 },
        { text: 'ランプが光った瞬間に分泌されるようになった',            at: 535, hi: 'ランプが光った瞬間', hiColor: '#2563eb' },
        { text: 'ドーパミンは「快楽」ではなく「予測」に反応する',       at: 696, hi: '予測', hiColor: '#2563eb' },
        { text: '本質は「やる気・動機づけ」のホルモン',                  at: 866, hi: 'やる気', hiColor: '#2563eb' },
        { text: 'これがすべての出発点です',                              at: 975 },
      ]} />
      <Audio src={staticFile('audio/dopamine/s2_what.wav')} />
    </AbsoluteFill>
  );
};

// ─── Scene 3: 昔の生活 — 3スライド構成 ──────────────────────────────────────
const Scene3 = ({ f, duration }) => {
  const masterOpacity = sceneFade(f, duration);

  // Slide A: 昔の生活 narrative (0-375)
  const aHeadOp = fadeIn(f, 10);
  const aBullet1Op = fadeIn(f, 50);
  const aBullet2Op = fadeIn(f, 130);
  const aBullet3Op = fadeIn(f, 240);

  // Slide B: Full-width timeline (360-760)
  const bNode1Op = fadeIn(f, 368);
  const bBarW = lerp(f, [385, 580], [0, 100]);
  const bLabelOp = fadeIn(f, 430);
  const bNode2Op = lerp(f, [565, 590], [0, 1]);
  const bSubOp = fadeIn(f, 600);

  // Slide C: Berridge — wanting ≠ liking (745-duration)
  const cHeadOp = fadeIn(f, 752);
  const cHeadScale = lerp(f, [752, 780], [0.88, 1]);
  const cEqOp = fadeIn(f, 800);
  const cSubOp = fadeIn(f, 870);
  const cCiteOp = fadeIn(f, 940);

  return (
    <AbsoluteFill style={{ opacity: masterOpacity }}>
      <Bg />
      <SceneLabel label="SCENE 03 / ANCIENT LIFE" opacity={fadeIn(f, 5)} />

      {/* Slide A: 昔の暮らしナレーション */}
      <Slide f={f} from={0} to={375}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 160px', gap: 40 }}>
          <div style={{ opacity: aHeadOp, fontFamily: 'Hiragino Mincho ProN, Georgia, serif', fontSize: 56, fontWeight: 700, color: C.text }}>
            昔の生活
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%', maxWidth: 820 }}>
            {[
              { op: aBullet1Op, text: '動物の足跡を何時間も追う' },
              { op: aBullet2Op, text: '川で何度も空振りを繰り返す' },
              { op: aBullet3Op, text: 'ようやく獲物にありつける', color: C.blue },
            ].map(({ op, text, color }, i) => (
              <div key={i} style={{ opacity: op, display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: color || C.sub, flexShrink: 0 }} />
                <div style={{ fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif', fontSize: 28, color: color || C.text, lineHeight: 1.5 }}>{text}</div>
              </div>
            ))}
          </div>
          <div style={{ opacity: aBullet3Op, fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif', fontSize: 18, color: C.sub, fontStyle: 'italic' }}>
            報酬が来るまでの時間が長く、道のりは不確か
          </div>
        </div>
      </Slide>

      {/* Slide B: タイムライン */}
      <Slide f={f} from={360} to={760}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 100px', gap: 48 }}>
          <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 0, position: 'relative', height: 120 }}>
            <div style={{ opacity: bNode1Op, textAlign: 'center', width: 120, flexShrink: 0 }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: C.text, margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                  <circle cx="18" cy="8" r="5" stroke="white" strokeWidth="2"/>
                  <line x1="18" y1="13" x2="18" y2="26" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="18" y1="19" x2="10" y2="26" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="18" y1="19" x2="26" y2="26" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="18" y1="26" x2="13" y2="34" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="18" y1="26" x2="23" y2="34" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div style={{ fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif', fontSize: 18, color: C.text, fontWeight: 700 }}>努力</div>
            </div>
            <div style={{ flex: 1, position: 'relative' }}>
              <div style={{ height: 8, background: C.border, borderRadius: 4, position: 'relative' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${bBarW}%`, background: C.blue, borderRadius: 4 }} />
              </div>
              <div style={{ position: 'absolute', top: -36, left: 0, right: 0, textAlign: 'center', opacity: bLabelOp }}>
                <span style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: 14, fontWeight: 700, color: C.blue, letterSpacing: '0.18em', background: 'rgba(37,99,235,0.06)', border: `1px solid ${C.blue}`, borderRadius: 4, padding: '3px 14px' }}>← WANTING TIME →</span>
              </div>
              <div style={{ position: 'absolute', top: 20, left: 0, right: 0, textAlign: 'center', opacity: bLabelOp, fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif', fontSize: 14, color: C.sub }}>数日〜数週間</div>
            </div>
            <div style={{ opacity: bNode2Op, textAlign: 'center', width: 120, flexShrink: 0 }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: C.gold, margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <path d="M16 4 L19.6 12.2 L28.8 13.1 L22.2 19.1 L24.1 28.2 L16 23.6 L7.9 28.2 L9.8 19.1 L3.2 13.1 L12.4 12.2 Z" fill="white"/>
                </svg>
              </div>
              <div style={{ fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif', fontSize: 18, color: C.gold, fontWeight: 700 }}>報酬</div>
            </div>
          </div>
          <div style={{ opacity: bSubOp, fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif', fontSize: 22, color: C.sub, textAlign: 'center', lineHeight: 1.8 }}>
            報酬が来るまでの「間」が長いほど<br />ドーパミンは持続的に分泌され続ける
          </div>
        </div>
      </Slide>

      {/* Slide C: Berridge — wanting ≠ liking */}
      <Slide f={f} from={745} to={duration}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 32 }}>
          <div style={{ opacity: cHeadOp, transform: `scale(${cHeadScale})`, display: 'flex', alignItems: 'baseline', gap: 20 }}>
            <span style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: 80, fontWeight: 900, color: C.blue }}>wanting</span>
            <span style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: 56, fontWeight: 300, color: C.sub }}>≠</span>
            <span style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: 80, fontWeight: 900, color: C.red }}>liking</span>
          </div>
          <div style={{ opacity: cEqOp, display: 'flex', gap: 24 }}>
            <div style={{ background: `rgba(37,99,235,0.08)`, border: `1px solid ${C.blue}`, borderRadius: 12, padding: '14px 28px', fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif', fontSize: 20, color: C.blue, fontWeight: 600 }}>欲しがる</div>
            <div style={{ background: `rgba(220,38,38,0.08)`, border: `1px solid ${C.red}`, borderRadius: 12, padding: '14px 28px', fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif', fontSize: 20, color: C.red, fontWeight: 600 }}>満足する</div>
          </div>
          <div style={{ opacity: cSubOp, fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif', fontSize: 22, color: C.sub, textAlign: 'center', lineHeight: 1.7 }}>
            昔の生活では、wantingの時間が長かった<br />つまりドーパミンが長く機能し続けていた
          </div>
          <div style={{ opacity: cCiteOp, fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif', fontSize: 15, color: C.sub, fontStyle: 'italic' }}>
            ― Kent Berridge, University of Michigan
          </div>
        </div>
      </Slide>

      <Captions f={f} duration={AUDIO.s3} lines={[
        { text: '人類の歴史の99%は農耕以前',                            at: 5   },
        { text: '狩猟採集民：獲物1頭に平均3〜5日',                      at: 150, hi: '3〜5日', hiColor: '#e53935' },
        { text: '足跡を読み、川を渡り、何度も空振り',                   at: 342 },
        { text: '「もうすぐ獲れる」という期待が何日も続く',             at: 483, hi: 'もうすぐ', hiColor: '#2563eb' },
        { text: 'この長い待機時間がドーパミンを持続させた',             at: 604 },
        { text: 'バリッジ教授（ミシガン大）の「wanting」理論',          at: 763 },
        { text: '欲しがる状態が長いほど、人は動き続けられる',           at: 922, hi: '欲しがる状態', hiColor: '#2563eb' },
        { text: '昔の生活はドーパミンのトレーニングだった',             at: 1089 },
      ]} />
      <Audio src={staticFile('audio/dopamine/s3_past.wav')} />
    </AbsoluteFill>
  );
};

// ─── Scene 4: 今の生活 — 3スライド構成 ──────────────────────────────────────
const Scene4 = ({ f, duration }) => {
  const masterOpacity = sceneFade(f, duration);

  // Slide A: Split screen 昔 vs 今 (0-335)
  const aSlideOp = fadeIn(f, 5);
  const aLeftX = lerp(f, [5, 35], [-120, 0]);
  const aRightX = lerp(f, [5, 35], [120, 0]);
  const aLeftW = lerp(f, [60, 220], [0, 100]);

  // Slide B: 即時報酬サイクル × 3 (320-640)
  const bHeadOp = fadeIn(f, 326);
  const cycles = [326, 400, 474];

  // Slide C: 閾値 concept (625-duration)
  const cThreshOp = fadeIn(f, 632);
  const cThreshScale = lerp(f, [632, 665], [0.8, 1]);
  const cSubOp = fadeIn(f, 680);
  const cCiteOp = fadeIn(f, 740);
  const cExOp = fadeIn(f, 790);

  return (
    <AbsoluteFill style={{ opacity: masterOpacity }}>
      <SceneLabel label="SCENE 04 / MODERN LIFE" opacity={fadeIn(f, 5)} />

      {/* Slide A: Split screen */}
      <Slide f={f} from={0} to={335}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>
          <div style={{ flex: 1, background: '#1a1a2e', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 56px', gap: 32, opacity: aSlideOp, transform: `translateX(${aLeftX}px)` }}>
            <div style={{ fontFamily: 'Helvetica Neue, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.22em' }}>BEFORE</div>
            <div style={{ fontFamily: 'Hiragino Mincho ProN, Georgia, serif', fontSize: 56, fontWeight: 700, color: '#fff' }}>昔の生活</div>
            <div style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif', fontSize: 15, color: 'rgba(255,255,255,0.6)' }}>努力</span>
                <span style={{ fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif', fontSize: 15, color: C.gold }}>報酬</span>
              </div>
              <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, position: 'relative' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${aLeftW}%`, background: C.blue, borderRadius: 3 }} />
              </div>
              <div style={{ marginTop: 10, textAlign: 'center', fontFamily: 'Helvetica Neue, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.12em' }}>← WANTING TIME (数日〜数週間) →</div>
            </div>
            <div style={{ fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif', fontSize: 18, color: 'rgba(255,255,255,0.55)', textAlign: 'center', lineHeight: 1.7 }}>ドーパミンが長く持続する</div>
          </div>
          <div style={{ width: 1, background: C.border, flexShrink: 0 }} />
          <div style={{ flex: 1, background: C.bg, overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 56px', gap: 24, opacity: aSlideOp, transform: `translateX(${aRightX}px)` }}>
            <div style={{ fontFamily: 'Helvetica Neue, sans-serif', fontSize: 12, color: C.sub, letterSpacing: '0.22em' }}>NOW</div>
            <div style={{ fontFamily: 'Hiragino Mincho ProN, Georgia, serif', fontSize: 56, fontWeight: 700, color: C.text }}>今の生活</div>
            <div style={{ fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif', fontSize: 20, color: C.sub, textAlign: 'center', lineHeight: 1.8 }}>
              お腹が空いたら → 30分で届く<br />
              退屈なら → 無限スクロール<br />
              知りたいことは → 3秒で解決
            </div>
          </div>
        </div>
      </Slide>

      {/* Slide B: 即時報酬サイクル */}
      <Slide f={f} from={320} to={640}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 160px', gap: 36 }}>
          <div style={{ opacity: bHeadOp, fontFamily: 'Hiragino Mincho ProN, Georgia, serif', fontSize: 44, fontWeight: 700, color: C.text }}>
            今の生活 — 即時報酬のループ
          </div>
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 18 }}>
            {cycles.map((startAt, i) => {
              const cf = Math.max(0, f - startAt);
              const co = fadeIn(cf, 10);
              const pw = lerp(cf, [15, 55], [0, 100]);
              const labels = [
                { l: 'お腹が空いた', r: '30分で届く' },
                { l: '退屈した', r: '無限スクロール' },
                { l: '知りたいことができた', r: '3秒で解決' },
              ];
              return (
                <div key={i} style={{ opacity: co }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif', fontSize: 16, color: C.text }}>{labels[i].l}</span>
                    <span style={{ fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif', fontSize: 16, color: C.red, fontWeight: 700 }}>{labels[i].r}</span>
                  </div>
                  <div style={{ height: 6, background: C.border, borderRadius: 3, position: 'relative' }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${pw}%`, background: `linear-gradient(90deg, ${C.blue}, ${C.red})`, borderRadius: 3 }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ opacity: fadeIn(f, 540), fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif', fontSize: 22, color: C.sub, textAlign: 'center' }}>
            あらゆる欲求が、ほぼ即座に満たされる
          </div>
        </div>
      </Slide>

      {/* Slide C: 閾値 */}
      <Slide f={f} from={625} to={duration}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28 }}>
          <div style={{ opacity: cThreshOp, transform: `scale(${cThreshScale})`, display: 'flex', alignItems: 'baseline', gap: 20 }}>
            <span style={{ fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif', fontSize: 96, fontWeight: 700, color: C.red }}>閾値</span>
            <span style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: 72, fontWeight: 900, color: C.red }}>↑</span>
          </div>
          <div style={{ opacity: cSubOp, fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif', fontSize: 26, color: C.sub, textAlign: 'center', lineHeight: 1.8 }}>
            「過剰刺激」が続くと<br />より強い刺激がないと、やる気が出なくなる
          </div>
          <div style={{ opacity: cExOp, fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif', fontSize: 20, color: C.text, background: `rgba(220,38,38,0.06)`, border: `1px solid ${C.red}`, borderRadius: 12, padding: '12px 32px' }}>
            同じコーヒーでは眠気が覚めなくなる
          </div>
          <div style={{ opacity: cCiteOp, fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif', fontSize: 15, color: C.sub, fontStyle: 'italic' }}>
            ― Anna Lembke, Stanford University
          </div>
        </div>
      </Slide>

      <Captions f={f} duration={AUDIO.s4} lines={[
        { text: 'Uber Eats：注文から食事まで平均28分',                  at: 5,   hi: '28分', hiColor: '#e53935' },
        { text: 'Google・ChatGPT：どんな疑問も3秒で解決',              at: 149, hi: '3秒', hiColor: '#e53935' },
        { text: 'TikTok：0.5秒ごとに新しい刺激',                       at: 305, hi: '0.5秒', hiColor: '#e53935' },
        { text: '脳は、ほぼ待たずに報酬を受け取り続けている',           at: 488 },
        { text: 'レンブケ博士（スタンフォード）',                        at: 589 },
        { text: '「快楽と苦痛のバランス崩壊」',                         at: 679, hi: 'バランス崩壊', hiColor: '#e53935' },
        { text: '過剰刺激 → ドーパミン受容体の感度低下',               at: 800, hi: '感度低下', hiColor: '#e53935' },
        { text: '同じ刺激では満足できなくなる',                         at: 954 },
      ]} />
      <Audio src={staticFile('audio/dopamine/s4_now.wav')} />
    </AbsoluteFill>
  );
};

// ─── Scene 5: スマホ — 3スライド構成 ─────────────────────────────────────────
const Scene5 = ({ f, duration }) => {
  const masterOpacity = sceneFade(f, duration);

  // Slide A: Fixed vs Variable reward (0-315)
  const aHeadOp = fadeIn(f, 10);
  const aCol1Op = fadeIn(f, 40);
  const aCol2Op = fadeIn(f, 80);
  const aPulseAmp = 0.025;
  const aPulseScale = 1 + aPulseAmp * Math.sin((f / 10) * Math.PI * 2);

  // Slide B: Notification dots burst (300-645)
  const bHeadOp = fadeIn(f, 306);
  const phase = f < 300 ? 0 : f < 490 ? 1 : 2;
  const baseDots = [
    { x: 15, y: 20, delay: 308 }, { x: 60, y: 10, delay: 320 },
    { x: 35, y: 55, delay: 335 }, { x: 80, y: 40, delay: 315 },
    { x: 20, y: 75, delay: 345 }, { x: 70, y: 70, delay: 325 },
    { x: 50, y: 30, delay: 340 }, { x: 10, y: 45, delay: 355 },
    { x: 90, y: 20, delay: 312 }, { x: 45, y: 85, delay: 330 },
  ];
  const burstDots = [
    { x: 25, y: 15 }, { x: 55, y: 35 }, { x: 75, y: 60 },
    { x: 40, y: 80 }, { x: 85, y: 25 }, { x: 30, y: 50 },
    { x: 65, y: 85 }, { x: 10, y: 65 }, { x: 50, y: 10 },
    { x: 80, y: 75 }, { x: 20, y: 40 }, { x: 70, y: 45 },
  ];
  const cycleLen = phase === 1 ? 40 : 80;

  // Slide C: 予測不能性 conclusion (630-duration)
  const cHeadOp = fadeIn(f, 636);
  const cHeadScale = lerp(f, [636, 660], [0.88, 1]);
  const cSubOp = fadeIn(f, 680);
  const cTagOp = fadeIn(f, 740);

  return (
    <AbsoluteFill style={{ opacity: masterOpacity }}>
      <Bg />
      <SceneLabel label="SCENE 05 / SMARTPHONE" opacity={fadeIn(f, 5)} />

      {/* Slide A: Fixed vs Variable */}
      <Slide f={f} from={0} to={315}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 120px', gap: 40 }}>
          <div style={{ opacity: aHeadOp, fontFamily: 'Hiragino Mincho ProN, Georgia, serif', fontSize: 48, fontWeight: 700, color: C.text }}>
            スキナーの発見
          </div>
          <div style={{ display: 'flex', gap: 36, width: '100%' }}>
            <div style={{ opacity: aCol1Op, flex: 1, background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 20, padding: '32px 28px', boxShadow: '0 2px 12px rgba(26,26,46,0.05)' }}>
              <div style={{ fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif', fontSize: 13, color: C.sub, letterSpacing: '0.1em', marginBottom: 12 }}>FIXED REWARD</div>
              <div style={{ fontFamily: 'Hiragino Mincho ProN, Georgia, serif', fontSize: 28, fontWeight: 700, color: C.sub, marginBottom: 14 }}>固定報酬</div>
              <div style={{ fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif', fontSize: 16, color: C.sub, lineHeight: 1.7 }}>毎回同じ報酬<br />→ 慣れが生じる<br />→ 飽きる</div>
            </div>
            <div style={{ opacity: aCol2Op, flex: 1, background: `rgba(37,99,235,0.06)`, border: `2px solid ${C.blue}`, borderRadius: 20, padding: '32px 28px', boxShadow: '0 4px 24px rgba(37,99,235,0.15)', transform: `scale(${aPulseScale})` }}>
              <div style={{ fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif', fontSize: 13, color: C.blue, letterSpacing: '0.1em', marginBottom: 12, fontWeight: 700 }}>VARIABLE REWARD</div>
              <div style={{ fontFamily: 'Hiragino Mincho ProN, Georgia, serif', fontSize: 28, fontWeight: 700, color: C.blue, marginBottom: 14 }}>可変報酬</div>
              <div style={{ fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif', fontSize: 16, color: C.text, lineHeight: 1.7 }}>時々大きな報酬<br />→ 予測不可能<br />→ やめられない</div>
            </div>
          </div>
          <div style={{ opacity: fadeIn(f, 200), fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif', fontSize: 15, color: C.sub, fontStyle: 'italic' }}>― B.F. Skinner / Variable Reward Schedule</div>
        </div>
      </Slide>

      {/* Slide B: Notification dots */}
      <Slide f={f} from={300} to={645}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 80 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 480 }}>
            <div style={{ opacity: bHeadOp, fontFamily: 'Hiragino Mincho ProN, Georgia, serif', fontSize: 44, fontWeight: 700, color: C.text }}>SNSの「いいね」</div>
            <div style={{ opacity: bHeadOp, fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif', fontSize: 22, color: C.sub, lineHeight: 1.8 }}>
              来るときもある<br />突然たくさん来ることもある<br />この<span style={{ color: C.red, fontWeight: 700 }}>予測不能性</span>こそが罠
            </div>
            <div style={{ opacity: fadeIn(f, 490), fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif', fontSize: 18, color: C.sub, fontStyle: 'italic' }}>スロットマシンと同じ構造</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div style={{ opacity: bHeadOp, fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif', fontSize: 15, color: C.sub }}>Likeの通知</div>
            <div style={{ position: 'relative', width: 300, height: 300, background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 24, boxShadow: '0 4px 24px rgba(26,26,46,0.07)', overflow: 'hidden' }}>
              {baseDots.map((dot, i) => {
                const ph = (f - dot.delay + cycleLen * 10) % cycleLen;
                const o = ph < 18 ? ph / 18 : ph < cycleLen * 0.6 ? 1 : (cycleLen - ph) / (cycleLen * 0.4);
                return (
                  <div key={i} style={{ position: 'absolute', left: `${dot.x}%`, top: `${dot.y}%`, width: 22, height: 22, borderRadius: '50%', background: C.blue, opacity: f > dot.delay ? Math.max(0, Math.min(1, o)) : 0, transform: 'translate(-50%, -50%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 11, color: '#fff' }}>♥</span>
                  </div>
                );
              })}
              {phase === 1 && burstDots.map((dot, i) => {
                const burstF = f - 490;
                const stagger = i * 6;
                const o = burstF < stagger ? 0 : burstF < stagger + 12 ? (burstF - stagger) / 12 : burstF < 140 ? 1 : (160 - burstF) / 20;
                return (
                  <div key={`b${i}`} style={{ position: 'absolute', left: `${dot.x}%`, top: `${dot.y}%`, width: 22, height: 22, borderRadius: '50%', background: i % 3 === 0 ? C.blue : i % 3 === 1 ? C.red : C.gold, opacity: Math.max(0, Math.min(1, o)), transform: 'translate(-50%, -50%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 11, color: '#fff' }}>♥</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Slide>

      {/* Slide C: 予測不能性 conclusion */}
      <Slide f={f} from={630} to={duration}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28 }}>
          <div style={{ opacity: cHeadOp, transform: `scale(${cHeadScale})`, fontFamily: 'Hiragino Mincho ProN, Georgia, serif', fontSize: 72, fontWeight: 700, color: C.text, textAlign: 'center', lineHeight: 1.2 }}>
            予測不能性
          </div>
          <div style={{ opacity: cSubOp, fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif', fontSize: 24, color: C.sub, textAlign: 'center', lineHeight: 1.8 }}>
            脳は「次は何が来るか」を予測しようとして<br />何度も画面に向かわされてしまう
          </div>
          <div style={{ opacity: cTagOp, display: 'flex', gap: 16 }}>
            <div style={{ background: `rgba(220,38,38,0.08)`, border: `1px solid ${C.red}`, borderRadius: 999, padding: '8px 24px', fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif', fontSize: 16, color: C.red, fontWeight: 700 }}>SNS</div>
            <div style={{ background: `rgba(220,38,38,0.08)`, border: `1px solid ${C.red}`, borderRadius: 999, padding: '8px 24px', fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif', fontSize: 16, color: C.red, fontWeight: 700 }}>スロットマシン</div>
            <div style={{ background: `rgba(220,38,38,0.08)`, border: `1px solid ${C.red}`, borderRadius: 999, padding: '8px 24px', fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif', fontSize: 16, color: C.red, fontWeight: 700 }}>同じ構造</div>
          </div>
        </div>
      </Slide>

      <Captions f={f} duration={AUDIO.s5} lines={[
        { text: 'SNSは、脳にとって別格の存在',                          at: 5   },
        { text: 'スキナーの実験：不規則な報酬のほうが行動が強化される', at: 125, hi: '不規則な報酬', hiColor: '#e53935' },
        { text: '「可変報酬スケジュール」',                              at: 431, hi: '可変報酬スケジュール', hiColor: '#2563eb' },
        { text: 'スロットマシン：勝率3割でもやめられない理由',          at: 514, hi: 'スロットマシン', hiColor: '#e53935' },
        { text: '「いいね」も同じ構造',                                  at: 692 },
        { text: '来るときもある、0のときもある',                         at: 800 },
        { text: 'この予測不能性が、脳を画面に向かわせる',               at: 891, hi: '予測不能性', hiColor: '#e53935' },
        { text: '「スマホはポケットに入ったスロットマシンだ」\n— トリスタン・ハリス（元Google倫理担当）', at: 1018 },
      ]} />
      <Audio src={staticFile('audio/dopamine/s5_phone.wav')} />
    </AbsoluteFill>
  );
};

// ─── Scene 6: 何が起きているか — 3スライド構成 ───────────────────────────────
const Scene6 = ({ f, duration }) => {
  const masterOpacity = sceneFade(f, duration);

  // Slide A: WANTING growing (0-275)
  const aHeadOp = fadeIn(f, 10);
  const aWantOp = fadeIn(f, 28);
  const aWantSize = lerp(f, [28, 200], [72, 140]);
  const aWantY = lerp(f, [28, 200], [0, -40]);
  const aSubOp = fadeIn(f, 120);

  // Slide B: Diverging WANTING↑ LIKING↓ (260-535)
  const bWantOp = fadeIn(f, 266);
  const bWantY = lerp(f, [266, 430], [0, -80]);
  const bWantSize = lerp(f, [266, 430], [88, 148]);
  const bLikeOp = fadeIn(f, 285);
  const bLikeY = lerp(f, [285, 430], [0, 70]);
  const bLikeSize = lerp(f, [285, 430], [88, 52]);
  const bGapOp = fadeIn(f, 340);
  const bGapH = lerp(f, [340, 430], [0, 120]);
  const bCardOp = fadeIn(f, 266);

  // Slide C: Conclusion (520-duration)
  const cHeadOp = fadeIn(f, 526);
  const cHeadScale = lerp(f, [526, 555], [0.88, 1]);
  const cBullet1Op = fadeIn(f, 575);
  const cBullet2Op = fadeIn(f, 620);
  const cBullet3Op = fadeIn(f, 660);
  const cCiteOp = fadeIn(f, 720);

  return (
    <AbsoluteFill style={{ opacity: masterOpacity }}>
      <Bg />
      <SceneLabel label="SCENE 06 / DIVERGENCE" opacity={fadeIn(f, 5)} />

      {/* Slide A: WANTING だけが成長 */}
      <Slide f={f} from={0} to={275}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
          <div style={{ opacity: aHeadOp, fontFamily: 'Hiragino Mincho ProN, Georgia, serif', fontSize: 36, fontWeight: 700, color: C.text }}>
            脳内で何が起きているか
          </div>
          <div style={{ opacity: aWantOp, transform: `translateY(${aWantY}px)`, fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: aWantSize, fontWeight: 900, color: C.blue, letterSpacing: '-0.02em', lineHeight: 1 }}>
            WANTING ↑
          </div>
          <div style={{ opacity: aSubOp, fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif', fontSize: 22, color: C.sub, textAlign: 'center', lineHeight: 1.7 }}>
            「欲しがる」気持ちだけが<br />どんどん高まっていく
          </div>
        </div>
      </Slide>

      {/* Slide B: WANTING↑ LIKING↓ 乖離 */}
      <Slide f={f} from={260} to={535}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>
          {/* Left: kinetic */}
          <div style={{ position: 'absolute', left: 80, top: 0, bottom: 0, width: '50%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ opacity: bWantOp, transform: `translateY(${bWantY}px)`, fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: bWantSize, fontWeight: 900, color: C.blue, letterSpacing: '-0.02em', lineHeight: 1 }}>WANTING ↑</div>
            <div style={{ opacity: bGapOp, height: bGapH, display: 'flex', alignItems: 'center', paddingLeft: 12, overflow: 'hidden' }}>
              <div style={{ width: 4, height: '100%', background: `linear-gradient(${C.blue}, ${C.red})`, borderRadius: 2, opacity: 0.4 }} />
              <div style={{ marginLeft: 16, fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif', fontSize: 17, color: C.sub, fontStyle: 'italic' }}>乖離が広がる</div>
            </div>
            <div style={{ opacity: bLikeOp, transform: `translateY(${bLikeY}px)`, fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: bLikeSize, fontWeight: 900, color: C.red, letterSpacing: '-0.02em', lineHeight: 1 }}>LIKING ↓</div>
            <div style={{ opacity: fadeIn(f, 440), marginTop: 20, fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif', fontSize: 14, color: C.sub, fontStyle: 'italic' }}>― Kent Berridge</div>
          </div>
          {/* Right: card */}
          <div style={{ position: 'absolute', right: 80, top: 0, bottom: 0, width: '38%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: bCardOp }}>
            <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 24, padding: '48px 40px', textAlign: 'center', boxShadow: '0 4px 24px rgba(26,26,46,0.07)', width: '100%' }}>
              <div style={{ fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif', fontSize: 18, color: C.sub, marginBottom: 28 }}>欲しいのに満たされない</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ background: `rgba(37,99,235,0.1)`, border: `1px solid ${C.blue}`, borderRadius: 12, padding: '14px', fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif', fontSize: 16, color: C.blue, fontWeight: 600 }}>もっと欲しい（WANTING）</div>
                <div style={{ background: `rgba(220,38,38,0.08)`, border: `1px solid ${C.red}`, borderRadius: 12, padding: '14px', fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif', fontSize: 16, color: C.red, fontWeight: 600 }}>でも楽しめない（LIKING）</div>
              </div>
            </div>
          </div>
        </div>
      </Slide>

      {/* Slide C: Conclusion */}
      <Slide f={f} from={520} to={duration}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 160px', gap: 32 }}>
          <div style={{ opacity: cHeadOp, transform: `scale(${cHeadScale})`, fontFamily: 'Hiragino Mincho ProN, Georgia, serif', fontSize: 52, fontWeight: 700, color: C.text, textAlign: 'center' }}>
            これは性格の問題ではない
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%', maxWidth: 840 }}>
            {[
              { op: cBullet1Op, text: '何かを手に入れても、すぐ次が欲しくなる' },
              { op: cBullet2Op, text: 'やり遂げても、達成感が薄い', color: C.red },
              { op: cBullet3Op, text: '普通の日常が、どこか虚ろに感じられる' },
            ].map(({ op, text, color }, i) => (
              <div key={i} style={{ opacity: op, display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: color || C.sub, flexShrink: 0 }} />
                <div style={{ fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif', fontSize: 24, color: color || C.text, lineHeight: 1.5 }}>{text}</div>
              </div>
            ))}
          </div>
          <div style={{ opacity: cCiteOp, fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif', fontSize: 17, color: C.sub, fontStyle: 'italic' }}>
            長期の過剰刺激による脳のドーパミン系の変化
          </div>
        </div>
      </Slide>

      <Captions f={f} duration={AUDIO.s6} lines={[
        { text: 'この状態が長期化するとどうなるか',                                    at: 5   },
        { text: 'うつ病の有病率：2000年→2020年で約3倍（WHO）',                        at: 98,  hi: '約3倍', hiColor: '#e53935' },
        { text: 'スマートフォン普及の時期とほぼ重なる',                                at: 366 },
        { text: '達成しても、すぐ次が欲しくなる',                                      at: 478 },
        { text: '楽しいはずの休日が、なぜかぼんやりしている',                          at: 575 },
        { text: 'これは怠けではありません',                                            at: 699 },
        { text: '「wanting↑ なのに liking が伴わない」\n— バリッジ教授',              at: 756, hi: 'wanting↑', hiColor: '#2563eb' },
        { text: '欲しがる回路は動いているのに\n満足する回路が機能しなくなっている',    at: 992 },
      ]} />
      <Audio src={staticFile('audio/dopamine/s6_effect.wav')} />
    </AbsoluteFill>
  );
};

// ─── Scene 7: 解決策 — 3スライド構成 ─────────────────────────────────────────
const Scene7 = ({ f, duration }) => {
  const masterOpacity = sceneFade(f, duration);

  // Slide A: Question (0-190)
  const aHeadOp = fadeIn(f, 10);
  const aHeadY = lerp(f, [10, 40], [50, 0]);
  const aSubOp = fadeIn(f, 60);

  // Slide B: 意図的な遅延 + 3 steps (175-455)
  const bMainOp = fadeIn(f, 182);
  const bMainScale = lerp(f, [182, 215], [0.88, 1]);
  const bItem1Op = fadeIn(f, 250);
  const bItem2Op = fadeIn(f, 310);
  const bItem3Op = fadeIn(f, 370);

  // Slide C: DOPAMINE DETOX (440-duration)
  const cCardOp = fadeIn(f, 447);
  const cCardScale = lerp(f, [447, 480], [0.9, 1]);
  const cSubOp = fadeIn(f, 520);
  const cFinalOp = fadeIn(f, 700);

  return (
    <AbsoluteFill style={{ opacity: masterOpacity }}>
      <Bg />
      <SceneLabel label="SCENE 07 / SOLUTION" opacity={fadeIn(f, 5)} />

      {/* Slide A: 問い */}
      <Slide f={f} from={0} to={190}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28 }}>
          <div style={{ opacity: aHeadOp, transform: `translateY(${aHeadY}px)`, fontFamily: 'Hiragino Mincho ProN, Georgia, serif', fontSize: 80, fontWeight: 700, color: C.text, textAlign: 'center', lineHeight: 1.2 }}>
            どうすれば<br />いいか？
          </div>
          <div style={{ opacity: aSubOp, fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif', fontSize: 22, color: C.sub, textAlign: 'center', lineHeight: 1.7 }}>
            答えは単純ですが、簡単ではありません
          </div>
        </div>
      </Slide>

      {/* Slide B: 意図的な遅延 */}
      <Slide f={f} from={175} to={455}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 80 }}>
          {/* Left: main concept */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32, maxWidth: 520 }}>
            <div style={{ opacity: bMainOp, transform: `scale(${bMainScale})`, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'Hiragino Mincho ProN, Georgia, serif', fontSize: 64, fontWeight: 700, color: C.text }}>意図的な</span>
              <span style={{ fontFamily: 'Hiragino Mincho ProN, Georgia, serif', fontSize: 64, fontWeight: 700, color: C.gold, background: 'rgba(217,119,6,0.1)', padding: '0 12px', borderRadius: 8, border: `2px solid ${C.gold}` }}>遅延</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {[
                { text: 'スマホを置く', op: bItem1Op },
                { text: '退屈を埋めない', op: bItem2Op },
                { text: '間を楽しむ', op: bItem3Op },
              ].map(({ text, op }, i) => (
                <div key={i} style={{ opacity: op, display: 'flex', alignItems: 'center', gap: 20 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: C.blue, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: 16, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif', fontSize: 30, color: C.text, fontWeight: 600 }}>{text}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Right: mini card */}
          <div style={{ opacity: bMainOp, background: C.cardBg, border: `2px solid ${C.gold}`, borderRadius: 24, padding: '40px 36px', textAlign: 'center', boxShadow: '0 4px 24px rgba(217,119,6,0.12)' }}>
            <div style={{ fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif', fontSize: 14, color: C.gold, letterSpacing: '0.1em', fontWeight: 700, marginBottom: 20 }}>DOPAMINE DETOX</div>
            <div style={{ fontFamily: 'Hiragino Mincho ProN, Georgia, serif', fontSize: 28, fontWeight: 700, color: C.text, lineHeight: 1.5 }}>感度を<br />取り戻す</div>
            <div style={{ marginTop: 20, fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif', fontSize: 15, color: C.sub, lineHeight: 1.6 }}>普通の喜びを<br />感じられる脳へ</div>
          </div>
        </div>
      </Slide>

      {/* Slide C: Final message — full center */}
      <Slide f={f} from={440} to={duration}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 32, padding: '0 160px' }}>
          <div style={{ opacity: cCardOp, transform: `scale(${cCardScale})`, fontFamily: 'Hiragino Mincho ProN, Georgia, serif', fontSize: 56, fontWeight: 700, color: C.text, textAlign: 'center', lineHeight: 1.4 }}>
            ドーパミンは<br />目標に向かう道中、<br />私たちを動かす
          </div>
          <div style={{ opacity: cSubOp, fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif', fontSize: 22, color: C.sub, textAlign: 'center', lineHeight: 1.8 }}>
            昔の人が持っていたその感覚を<br />現代の私たちも取り戻せる余地は、あるはずです
          </div>
          <div style={{ opacity: cFinalOp, background: `rgba(37,99,235,0.07)`, border: `1px solid ${C.blue}`, borderRadius: 999, padding: '10px 32px', fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif', fontSize: 18, color: C.blue, fontWeight: 700, letterSpacing: '0.06em' }}>
            「間」を生活に取り戻そう
          </div>
        </div>
      </Slide>

      <Captions f={f} duration={AUDIO.s7} lines={[
        { text: 'ペンシルバニア大学の研究（2018年）',                         at: 5   },
        { text: 'SNS使用を1日10分に制限',                                     at: 139, hi: '10分', hiColor: '#2563eb' },
        { text: '4週間後：孤独感・抑うつ感が大きく低下',                      at: 264, hi: '大きく低下', hiColor: '#2563eb' },
        { text: '答えは「やめる」ではなく「間をつくる」こと',                  at: 402, hi: '間をつくる', hiColor: '#2563eb' },
        { text: '退屈でもすぐにスマホを開かない',                             at: 514 },
        { text: 'その5分間の「まだか」が\nドーパミンを再び機能させる',         at: 591, hi: 'まだか', hiColor: '#2563eb' },
        { text: '「待つ力」を少しずつ取り戻す',                               at: 735, hi: '待つ力', hiColor: '#2563eb' },
        { text: 'それが、やる気が続く脳への最初の一歩',                       at: 824 },
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
