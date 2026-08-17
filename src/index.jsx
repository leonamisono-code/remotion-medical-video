import { registerRoot, Composition } from 'remotion';
import { MyComposition } from './Composition.jsx';
import { TelopComposition } from './Telop.jsx';
import { MedicalComposition } from './Medical.jsx';
import { SleepTriviaComposition } from './SleepTrivia.jsx';
import { DopamineComposition, TOTAL as DOPAMINE_TOTAL } from './Dopamine.jsx';
import { ThumbnailComp } from './Thumbnail.jsx';

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="MyComp"
        component={MyComposition}
        durationInFrames={90}
        fps={30}
        width={1080}
        height={1080}
      />
      <Composition
        id="TelopComp"
        component={TelopComposition}
        durationInFrames={916}
        fps={30}
        width={1474}
        height={798}
      />
      <Composition
        id="MedicalComp"
        component={MedicalComposition}
        durationInFrames={450}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="SleepTriviaComp"
        component={SleepTriviaComposition}
        durationInFrames={6090}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="DopamineComp"
        component={DopamineComposition}
        durationInFrames={DOPAMINE_TOTAL}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="DopamineThumbnail"
        component={ThumbnailComp}
        durationInFrames={1}
        fps={30}
        width={1280}
        height={720}
      />
    </>
  );
};

registerRoot(RemotionRoot);
