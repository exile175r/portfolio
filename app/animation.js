'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import lottieJson from '../public/animation.json';

const LottieReact = dynamic(() => import('lottie-react'), {
  ssr: false,
  loading: () => <p>Loading...</p>
});

function LottieAnimation() {
  return (
    <LottieReact
      loop
      autoplay
      animationData={lottieJson}
    />
  );
}

export default LottieAnimation;