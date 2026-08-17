import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, spring } from 'remotion';

export const MyComposition = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // タイトルのフェードイン（0〜20フレーム）
  const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  const titleY = interpolate(frame, [0, 20], [40, 0], { extrapolateRight: 'clamp' });

  // サブテキストのフェードイン（20〜40フレーム）
  const subOpacity = interpolate(frame, [20, 40], [0, 1], { extrapolateRight: 'clamp' });
  const subY = interpolate(frame, [20, 40], [30, 0], { extrapolateRight: 'clamp' });

  // ラインのスケール（10〜35フレーム）
  const lineScale = interpolate(frame, [10, 35], [0, 1], { extrapolateRight: 'clamp' });

  // バッジのspring（30フレームから）
  const badgeScale = spring({ frame: frame - 30, fps, config: { damping: 12, stiffness: 100 } });

  return (
    <AbsoluteFill style={{
      background: 'linear-gradient(135deg, #e8f4f8 0%, #f0f7fb 40%, #fdf8f2 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Hiragino Mincho ProN, serif',
    }}>

      {/* 背景の装飾円 */}
      <div style={{
        position: 'absolute',
        top: -100,
        right: -100,
        width: 500,
        height: 500,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(184,147,90,0.06), transparent)',
      }} />
      <div style={{
        position: 'absolute',
        bottom: -80,
        left: -80,
        width: 400,
        height: 400,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(107,175,214,0.08), transparent)',
      }} />

      {/* CLINIC ラベル */}
      <div style={{
        opacity: titleOpacity,
        transform: `translateY(${titleY}px)`,
        fontSize: 14,
        letterSpacing: '0.4em',
        color: '#b8935a',
        marginBottom: 16,
      }}>
        SUMMER CAMPAIGN
      </div>

      {/* ゴールドライン */}
      <div style={{
        width: 60 * lineScale,
        height: 1,
        background: 'linear-gradient(90deg, transparent, #b8935a, transparent)',
        marginBottom: 24,
      }} />

      {/* メインタイトル */}
      <div style={{
        opacity: titleOpacity,
        transform: `translateY(${titleY}px)`,
        fontSize: 56,
        fontWeight: 400,
        color: '#1a3a52',
        letterSpacing: '0.12em',
        lineHeight: 1.4,
        textAlign: 'center',
      }}>
        この夏、<br />理想の二重で
      </div>

      {/* サブタイトル */}
      <div style={{
        opacity: subOpacity,
        transform: `translateY(${subY}px)`,
        fontSize: 28,
        color: '#4a7a9b',
        letterSpacing: '0.15em',
        marginTop: 16,
      }}>
        思いきり楽しもう。
      </div>

      {/* 価格バッジ */}
      <div style={{
        transform: `scale(${badgeScale})`,
        marginTop: 48,
        background: 'linear-gradient(90deg, #b8935a, #dfc089, #b8935a)',
        borderRadius: 4,
        padding: '14px 40px',
        color: '#fff',
        fontSize: 18,
        letterSpacing: '0.1em',
      }}>
        埋没法（3点留め）90,000円
      </div>

    </AbsoluteFill>
  );
};
