import { AbsoluteFill, Img, staticFile } from 'remotion';

// ─── Text outline via stacked text-shadows ────────────────────────────────────
const outline = (size = 9, color = '#000') =>
  [[-1,-1],[1,-1],[-1,1],[1,1],[-1,0],[1,0],[0,-1],[0,1],
   [-2,-1],[2,-1],[-2,1],[2,1],[-1,-2],[1,-2],[-1,2],[1,2]]
    .map(([x,y]) => `${x*size}px ${y*size}px 0 ${color}`)
    .join(', ');


// ─── Thumbnail Composition ────────────────────────────────────────────────────
export const ThumbnailComp = () => {
  return (
    <AbsoluteFill style={{
      background: 'linear-gradient(140deg, #04040e 0%, #0a0a1e 50%, #060612 100%)',
      overflow: 'hidden',
    }}>

      {/* ── Brain image: right side ── */}
      <div style={{
        position: 'absolute',
        right: -60,
        top: '50%',
        transform: 'translateY(-50%)',
        width: 820,
        height: 820,
        // gold color tint via mix-blend-mode
      }}>
        <Img
          src={staticFile('brain.png')}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            objectPosition: 'center',
            // tint to blue-gold palette
            filter: 'hue-rotate(190deg) saturate(1.6) brightness(0.85)',
            mixBlendMode: 'screen',
          }}
        />
      </div>

      {/* ── SVG layer: concentric gold rings + overlays ── */}
      <svg
        style={{ position: 'absolute', inset: 0 }}
        width="1280" height="720"
        viewBox="0 0 1280 720"
      >
        <defs>
          <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Gold radial glow behind rings */}
          <radialGradient id="goldGlow" cx="74%" cy="50%">
            <stop offset="0%"   stopColor="#f5a800" stopOpacity="0.30" />
            <stop offset="35%"  stopColor="#f5a800" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#04040e" stopOpacity="0" />
          </radialGradient>

          {/* Left-to-right dark fade so text stays readable */}
          <linearGradient id="leftFade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#04040e" stopOpacity="1" />
            <stop offset="48%"  stopColor="#04040e" stopOpacity="0.82" />
            <stop offset="68%"  stopColor="#04040e" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#04040e" stopOpacity="0" />
          </linearGradient>

          {/* Top & bottom vignette */}
          <linearGradient id="topFade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#04040e" stopOpacity="0.7" />
            <stop offset="20%"  stopColor="#04040e" stopOpacity="0" />
            <stop offset="80%"  stopColor="#04040e" stopOpacity="0" />
            <stop offset="100%" stopColor="#04040e" stopOpacity="0.7" />
          </linearGradient>
        </defs>

        {/* Gold glow blob */}
        <ellipse cx="960" cy="360" rx="480" ry="360" fill="url(#goldGlow)" />

        {/* Concentric rings — centre = brain focal point */}
        {[340, 270, 205, 148, 96, 52].map((r, i) => (
          <circle
            key={i}
            cx={950} cy={365} r={r}
            fill="none"
            stroke={`rgba(245,180,40,${0.28 - i * 0.04})`}
            strokeWidth={i === 0 ? 3 : i < 3 ? 2 : 1.5}
            filter="url(#glow)"
          />
        ))}

        {/* Center bright dot */}
        <circle cx={950} cy={365} r={14} fill="rgba(245,180,40,0.25)" filter="url(#glow)" />
        <circle cx={950} cy={365} r={6}  fill="#f5b828" filter="url(#glow)" />

        {/* Left gradient overlay */}
        <rect x="0" y="0" width="1280" height="720" fill="url(#leftFade)" />
        {/* Top/bottom vignette */}
        <rect x="0" y="0" width="1280" height="720" fill="url(#topFade)" />

        {/* DOPAMINE watermark */}
        <text
          x="952" y="654"
          textAnchor="middle"
          fontSize="15"
          fontFamily="Helvetica Neue, Arial"
          fontWeight="700"
          letterSpacing="10"
          fill="rgba(245,180,40,0.45)"
        >DOPAMINE</text>
      </svg>

      {/* ── Text layer ── */}
      <div style={{
        position: 'absolute',
        left: 56,
        top: 0,
        bottom: 0,
        width: 740,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 6,
        padding: '40px 0',
      }}>

        {/* Label */}
        <div style={{
          fontFamily: 'Hiragino Kaku Gothic ProN, sans-serif',
          fontSize: 28,
          fontWeight: 700,
          color: '#6ab4ff',
          letterSpacing: '0.06em',
          marginBottom: 4,
          textShadow: outline(4, '#000'),
        }}>
          脳科学が証明した
        </div>

        {/* Line 1 */}
        <div style={{
          fontFamily: 'Hiragino Kaku Gothic ProN, sans-serif',
          fontSize: 108,
          fontWeight: 900,
          color: '#ffffff',
          lineHeight: 1.0,
          letterSpacing: '-0.01em',
          textShadow: outline(10, '#000'),
        }}>
          やる気が
        </div>

        {/* Line 2 — gold, biggest */}
        <div style={{
          fontFamily: 'Hiragino Kaku Gothic ProN, sans-serif',
          fontSize: 118,
          fontWeight: 900,
          color: '#f5b828',
          lineHeight: 1.0,
          letterSpacing: '-0.01em',
          textShadow: outline(10, '#000'),
        }}>
          続かない
        </div>

        {/* Line 3 — red, medium */}
        <div style={{
          fontFamily: 'Hiragino Kaku Gothic ProN, sans-serif',
          fontSize: 100,
          fontWeight: 900,
          color: '#ff3b3b',
          lineHeight: 1.0,
          letterSpacing: '-0.01em',
          textShadow: outline(10, '#000'),
        }}>
          本当の理由
        </div>

        {/* Tag */}
        <div style={{
          display: 'flex',
          gap: 10,
          marginTop: 12,
        }}>
          {['ドーパミン', '脳科学', '習慣'].map((tag, i) => (
            <div key={i} style={{
              fontFamily: 'Hiragino Kaku Gothic Pro, sans-serif',
              fontSize: 22,
              fontWeight: 700,
              color: i === 0 ? '#f5b828' : 'rgba(255,255,255,0.7)',
              background: i === 0 ? 'rgba(245,184,40,0.15)' : 'rgba(255,255,255,0.08)',
              border: `1px solid ${i === 0 ? 'rgba(245,184,40,0.5)' : 'rgba(255,255,255,0.2)'}`,
              borderRadius: 6,
              padding: '4px 14px',
              letterSpacing: '0.04em',
            }}>
              {tag}
            </div>
          ))}
        </div>
      </div>

    </AbsoluteFill>
  );
};
