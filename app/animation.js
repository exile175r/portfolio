'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import lottieJson from '../public/animation.json';

const LottieReact = dynamic(() => import('lottie-react'), {
  ssr: false,
  loading: () => null // 기본 로딩 텍스트 제거
});

function LottieAnimation() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLottieLoaded, setIsLottieLoaded] = useState(false);

  useEffect(() => {
    // Lottie 컴포넌트가 로드되면 로딩 상태 해제
    if (isLottieLoaded) {
      // 로딩 화면을 부드럽게 페이드아웃
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  }, [isLottieLoaded]);

  return (
    <div className="relative w-full h-full">
      {/* 로딩 화면 */}
      {isLoading && (
        <div 
          className="loading-overlay"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            borderRadius: '12px',
            backdropFilter: 'blur(5px)',
            transition: 'opacity 0.5s ease-out'
          }}
        >
          {/* 스피너 */}
          <div 
            className="spinner"
            style={{
              width: '50px',
              height: '50px',
              border: '3px solid #e5e7eb',
              borderTop: '3px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}
          ></div>
        </div>
      )}
      
      {/* Lottie 애니메이션 */}
      <div 
        style={{
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.5s ease-in',
          width: '100%',
          height: '100%'
        }}
      >
        <LottieReact
          loop
          autoplay
          animationData={lottieJson}
          onDOMLoaded={() => setIsLottieLoaded(true)}
          style={{
            width: '100%',
            height: '100%'
          }}
        />
      </div>
      
      {/* CSS 애니메이션을 위한 스타일 */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .loading-overlay {
          animation: fadeIn 0.3s ease-in;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default LottieAnimation;