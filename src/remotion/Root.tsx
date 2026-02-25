import React from 'react';
import { Composition } from 'remotion';
import { SATransformerVideo } from './SATransformer';
import './style.css';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="SATransformerVideo"
        component={SATransformerVideo}
        durationInFrames={2400}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
