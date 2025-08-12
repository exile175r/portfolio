'use client';

import { useState, useEffect, useRef } from 'react';

export default function IframeContainer({ show, onClose, src }){
  const [loading, setLoading] = useState(true);
  const [iframeSrc, setIframeSrc] = useState(null);
  const iframeRef = useRef(null);

  useEffect(() => {
    if (show) {
      setIframeSrc(src);
    }
  }, [show, src]);

  useEffect(() => {
    if (!iframeSrc) return;
    
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      console.log('iframe is loaded');
      setLoading(false);
      
      // iframe 내부에서 미디어 파일 접근을 위한 설정
      try {
        iframe.contentWindow.postMessage({
          type: 'SETUP_MEDIA_ACCESS',
          origin: window.location.origin
        }, '*');
      } catch (error) {
        console.log('PostMessage failed:', error);
      }
    };

    const handleError = (error) => {
      console.error('Iframe load error:', error);
      setLoading(false);
    };

    iframe.addEventListener('load', handleLoad);
    iframe.addEventListener('error', handleError);
    
    return () => {
      iframe.removeEventListener('load', handleLoad);
      iframe.removeEventListener('error', handleError);
    };
  }, [iframeSrc]);

  useEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [show]);

  if (!show) return null;

  return (
    <div className="iframe-container" style={{
      padding: '20px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, .8)',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000
    }}>
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          backgroundColor: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          cursor: 'pointer',
          zIndex: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '40px',
          boxShadow: '0 0 5px rgba(0, 0, 0, .5)'
        }}
      >
        ×
      </button>
      {loading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1
        }}>
          Loading...
        </div>
      )}
      {iframeSrc && (
        <iframe
          ref={iframeRef}
          src={iframeSrc}
          width="100%"
          height="100%"
          style={{
            border: 'none',
            borderRadius: '6px'
          }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          sandbox="allow-scripts allow-forms allow-popups allow-modals allow-downloads allow-same-origin"
        ></iframe>
      )}
    </div>
  );
}