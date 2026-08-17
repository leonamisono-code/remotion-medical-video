import { AbsoluteFill, Video, useCurrentFrame, interpolate, staticFile } from 'remotion';

const CAPTIONS = [
  { from: 0.0,  to: 3.8,  text: 'あなたは最近、\nこんなことを言われたことはありませんか？' },
  { from: 3.8,  to: 7.68, text: '「血糖値が高めですね」\n「血圧に気をつけてください」' },
  { from: 7.68, to: 11.1, text: 'でも、自覚症状はない。\nだから、ついつい後回しにしてしまう。' },
  { from: 11.1, to: 14.52,text: '実は、それが一番危ない。' },
  { from: 14.52,to: 18.4, text: '生活習慣病は、気づかないうちに\n静かに進行します。' },
  { from: 18.4, to: 22.28,text: 'このチャンネルでは、\n忙しい毎日でも実践できる' },
  { from: 22.28,to: 27.0, text: '生活習慣病の予防と改善の\nヒントをお届けします。' },
  { from: 27.0, to: 30.5, text: 'まずは、今日から1つだけ。\n一緒に始めましょう。' },
];

const FPS = 30;

export const TelopComposition = () => {
  const frame = useCurrentFrame();
  const currentSec = frame / FPS;

  const currentCaption = CAPTIONS.find(
    c => currentSec >= c.from && currentSec < c.to
  );

  const getOpacity = (caption) => {
    if (!caption) return 0;
    const startFrame = caption.from * FPS;
    const endFrame = caption.to * FPS;
    const fadeIn  = interpolate(frame, [startFrame, startFrame + 6], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const fadeOut = interpolate(frame, [endFrame - 6, endFrame],     [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    return Math.min(fadeIn, fadeOut);
  };

  const opacity = getOpacity(currentCaption);

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {/* 動画をフレームいっぱいに表示 */}
      <Video
        src={staticFile('input.mp4')}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />

      {/* テロップ：画面下部中央に固定 */}
      {currentCaption && (
        <div style={{
          position: 'absolute',
          bottom: 48,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          opacity,
        }}>
          <div style={{
            textAlign: 'center',
            maxWidth: '88%',
          }}>
            {currentCaption.text.split('\n').map((line, i) => (
              <div key={i} style={{
                fontSize: 32,
                fontWeight: 'bold',
                color: '#fff',
                fontFamily: 'Hiragino Kaku Gothic ProN, sans-serif',
                letterSpacing: '0.04em',
                lineHeight: 1.65,
                textShadow: '0 2px 8px rgba(0,0,0,1), 0 0 16px rgba(0,0,0,0.9)',
              }}>
                {line}
              </div>
            ))}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
