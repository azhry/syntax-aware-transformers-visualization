import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import 'katex/dist/katex.min.css';

import { Scene1Intro } from './Scene1Intro';
import { Scene2Encoder } from './Scene2Encoder';
import { Scene3Dependency } from './Scene3Dependency';
import { Scene4AEA } from './Scene4AEA';
import { Scene5SATLayers } from './Scene5SATLayers';
import { Scene6Distance } from './Scene6Distance';
import { Scene7Inference } from './Scene7Inference';
import { Scene8Training } from './Scene8Training';
import { Scene9Results } from './Scene9Results';

// ~75 seconds total at 30fps = 2250 frames
const DUR = {
  INTRO: { start: 0, d: 90 },  // 3s
  ENCODER: { start: 90, d: 180 },  // 6s
  DEP: { start: 270, d: 240 },  // 8s
  AEA: { start: 510, d: 600 },  // 20s
  LAYERS: { start: 1110, d: 600 },  // 20s (Extended to slow down calculations)
  DIST: { start: 1710, d: 120 },  // 4s
  INFER: { start: 1830, d: 210 },  // 7s
  TRAIN: { start: 2040, d: 90 },   // 3s
  RESULTS: { start: 2130, d: 120 }, // 4s 
};

const BG = '#020617';

export const SATransformerVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: BG, color: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      <Sequence from={DUR.INTRO.start} durationInFrames={DUR.INTRO.d}><Scene1Intro /></Sequence>
      <Sequence from={DUR.ENCODER.start} durationInFrames={DUR.ENCODER.d}><Scene2Encoder /></Sequence>
      <Sequence from={DUR.DEP.start} durationInFrames={DUR.DEP.d}><Scene3Dependency /></Sequence>
      <Sequence from={DUR.AEA.start} durationInFrames={DUR.AEA.d}><Scene4AEA /></Sequence>
      <Sequence from={DUR.LAYERS.start} durationInFrames={DUR.LAYERS.d}><Scene5SATLayers /></Sequence>
      <Sequence from={DUR.DIST.start} durationInFrames={DUR.DIST.d}><Scene6Distance /></Sequence>
      <Sequence from={DUR.INFER.start} durationInFrames={DUR.INFER.d}><Scene7Inference /></Sequence>
      <Sequence from={DUR.TRAIN.start} durationInFrames={DUR.TRAIN.d}><Scene8Training /></Sequence>
      <Sequence from={DUR.RESULTS.start} durationInFrames={DUR.RESULTS.d}><Scene9Results /></Sequence>
    </AbsoluteFill>
  );
};
