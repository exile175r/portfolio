'use client';

import { useState, useEffect, useRef } from 'react';

// Web Component 정의 (클라이언트 사이드에서만)
let ProjectContent;
if (typeof window !== 'undefined' && typeof HTMLElement !== 'undefined') {
  ProjectContent = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.stylesheets = [];
    this.scripts = [];
    this.isLoading = false;
    this.currentProjectPath = '/contents/canvas'; // 기본값
  }

  connectedCallback() {
    this.render();
  }

  disconnectedCallback() {
    this.cleanup();
  }

  setContent(html, css, js, projectPath) {
    if (this.isLoading) return; // 중복 로드 방지
    this.currentProjectPath = projectPath || '/contents/canvas'; // 기본값
    this.loadContent(html, css, js);
  }

  async loadContent(html, css, js) {
    if (this.isLoading) return;
    this.isLoading = true;
    
    try {
      // 기존 리소스 정리
      this.cleanup();
      
      // HTML에서 body 태그 내용 추출 (정규식 사용)
      const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
      let bodyContent = '';
      
      if (bodyMatch && bodyMatch[1]) {
        bodyContent = bodyMatch[1];
      } else {
        // body 태그가 없으면 전체 HTML 사용
        bodyContent = html;
      }
      
      // 비디오 요소를 Blob으로 변환하는 로직 추가 (Player 프로젝트 강제 실행)
      if (this.currentProjectPath.includes('/player')) {
        bodyContent = await this.convertVideoToBlob(bodyContent);
      }
      
      // head에서 CSS와 JS 추출 (정규식 사용)
      const headLinks = [];
      const headScripts = [];
      
      // CSS 링크 추출
      const cssMatches = html.match(/<link[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/gi);
      if (cssMatches) {
        cssMatches.forEach(match => {
          const hrefMatch = match.match(/href=["']([^"']+)["']/i);
          if (hrefMatch) {
            // 상대 경로를 절대 경로로 변환
            let href = hrefMatch[1];
            if (!href.startsWith('/') && !href.startsWith('http')) {
              // 현재 프로젝트 경로를 기준으로 절대 경로 생성
              const projectPath = this.getProjectPath();
              href = `${projectPath}/${href}`;
            }
            headLinks.push({ href });
          }
        });
      }
      
      // JS 스크립트 추출
      const scriptMatches = html.match(/<script[^>]*src=["']([^"']+)["'][^>]*>/gi);
      if (scriptMatches) {
        scriptMatches.forEach(match => {
          const srcMatch = match.match(/src=["']([^"']+)["']/i);
          if (srcMatch) {
            // 상대 경로를 절대 경로로 변환
            let src = srcMatch[1];
            if (!src.startsWith('/') && !src.startsWith('http')) {
              // 현재 프로젝트 경로을 기준으로 절대 경로 생성
              const projectPath = this.getProjectPath();
              src = `${projectPath}/${src}`;
            }
            headScripts.push({ src });
          }
        });
      }
      
      // 중복 제거: HTML에서 추출된 리소스와 프로젝트별 리소스 병합
      const allCss = this.mergeResources(headLinks, css, 'href');
      const allJs = this.mergeResources(headScripts, js, 'src');
      
      // CSS를 먼저 로드
        console.log('Step 1: Loading CSS files...');
        const cssResults = await this.loadAllCSS(allCss);
        
        // CSS 로딩 완료 후 추가 대기 (폰트 로딩을 위해)
        console.log('Step 1.5: Waiting for CSS and fonts to be applied...');
        if (this.currentProjectPath === '/contents/player') {
          // Player 프로젝트는 폰트 로딩 대기 없이 바로 진행
          console.log('Player project - proceeding immediately');
        } else {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // CSS 변수 격리 실행
        this.isolateCSSVariables();
        
        // HTML 컨텐츠를 먼저 삽입
        const contentDiv = this.shadowRoot.querySelector('#content');
        if (contentDiv) {
          if (bodyContent && bodyContent.trim().length > 0) {
            // CSS 변수 격리를 위해 content-scope 클래스 추가
            const wrappedContent = `<div class="content-scope">${bodyContent}</div>`;
            contentDiv.innerHTML = wrappedContent;
          } else {
            console.error('No content to insert');
          }
        } else {
          console.error('Content div not found in shadow DOM');
        }
       
        // HTML 삽입 완료 후 DOM이 준비될 때까지 대기
        await new Promise((resolve, reject) => {
          // 타임아웃 설정 (20초)
          const timeout = setTimeout(() => {
            resolve();
          }, 20000);
          
          let domReady = false;
          let checkCount = 0;
          const maxChecks = 200; // 최대 200번 체크
          
          const checkDOMReady = () => {
            if (domReady || checkCount >= maxChecks) {
              clearTimeout(timeout);
              resolve();
              return;
            }
            
            checkCount++;
            
            const contentDiv = this.shadowRoot.querySelector('#content');
            if (!contentDiv || contentDiv.children.length === 0) {
              setTimeout(checkDOMReady, 100);
              return;
            }
            
              // 실제 DOM 접근 테스트 (범용적 검증)
             try {
               // 프로젝트별 필수 요소 정의
               const projectRequiredElements = this.getRequiredElements();
               const accessibleElements = [];
               const partiallyReadyElements = [];
               
               for (const selector of projectRequiredElements) {
                 try {
                   const element = contentDiv.querySelector(selector);
                   if (element) {
                     // 요소가 존재하는지 확인
                     if (element.offsetWidth > 0 && element.offsetHeight > 0) {
                       accessibleElements.push(selector);
                     } else {
                       // 요소는 존재하지만 아직 렌더링되지 않음
                       partiallyReadyElements.push(selector);
                       console.log(`${selector} exists but not rendered yet (${element.offsetWidth}x${element.offsetHeight})`);
                     }
                   }
                 } catch (e) {
                   console.warn(`Error accessing ${selector}:`, e);
                 }
               }
               
               // 더 유연한 준비 조건: 최소 2개 요소가 준비되거나, 모든 요소가 존재하면 진행
               const totalReady = accessibleElements.length + partiallyReadyElements.length;
               const minRequired = Math.min(2, projectRequiredElements.length);
               
               if (accessibleElements.length >= minRequired || totalReady >= projectRequiredElements.length) {
                 // 추가 검증: 실제 querySelector 동작 테스트
                 try {
                   const testResult = contentDiv.querySelectorAll('*');
                   if (testResult && testResult.length > 0) {
                     console.log(`DOM is ready (${accessibleElements.length}/${projectRequiredElements.length} fully ready, ${partiallyReadyElements.length} partially ready), proceeding with JS execution`);
                     domReady = true;
                     clearTimeout(timeout);
                     resolve();
                     return;
                   }
                 } catch (e) {
                   console.warn('DOM query test failed, retrying...', e);
                 }
               }
               
               // 더 긴 대기 시간으로 DOM 안정화
               setTimeout(checkDOMReady, 300);
             } catch (error) {
               console.warn('DOM check error, retrying...', error);
               setTimeout(checkDOMReady, 300);
             }
          };
          
          // 초기 체크 시작
          checkDOMReady();
        });
        
        // JS 로드 & 실행
        const jsResults = await this.loadAllJS(allJs);
      
         } catch (error) {
       console.error('Error loading content:', error);
       
       // 에러 발생 시 사용자에게 알림
       this.showErrorMessage(error.message || '컨텐츠 로딩 중 오류가 발생했습니다.');
     } finally {
       this.isLoading = false;
     }
  }

  async loadAllCSS(cssList) {
    // Font Awesome CSS 자동 추가 (Player 프로젝트인 경우)
    if (this.currentProjectPath === '/contents/player') {
      cssList.unshift('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css');
      
      // Font Awesome 폰트 파일들도 직접 로딩
      const fontFiles = [
        'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/webfonts/fa-solid-900.woff2',
        'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/webfonts/fa-regular-400.woff2',
        'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/webfonts/fa-brands-400.woff2'
      ];
      
      for (const fontUrl of fontFiles) {
        try {
          const fontFace = new FontFace('Font Awesome 6 Free', `url(${fontUrl})`);
          await fontFace.load();
          document.fonts.add(fontFace);
        } catch (error) {
          // 폰트 로딩 실패 시 무시하고 진행
        }
      }
    }
    
    const cssPromises = cssList.map(async (cssPath, index) => {
      const href = typeof cssPath === 'string' ? cssPath : cssPath.href;
      if (!href) {
        return null;
      }
      
      try {
        return await new Promise((resolve, reject) => {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = href;
          link.id = `css-${Date.now()}-${index}`;
          
          // 타임아웃 설정 (5초)
          const timeout = setTimeout(() => {
            resolve(null);
          }, 5000);
          
          link.onload = () => {
            clearTimeout(timeout);
            this.stylesheets.push(link);
            
            // Font Awesome CSS인 경우 폰트 경로 수정
            if (href.includes('font-awesome') && href.includes('all.min.css')) {
              this.fixFontAwesomePaths();
            }
            
            resolve(link);
          };
          
          link.onerror = () => {
            clearTimeout(timeout);
            resolve(null);
          };
          
          // shadow DOM에 추가
          this.shadowRoot.appendChild(link);
          
          console.log(`CSS link added to shadow DOM: ${href}`);
        });
      } catch (error) {
        console.warn(`Error loading CSS ${href}:`, error);
        return null;
      }
    });
    
    const results = await Promise.all(cssPromises);
    const successfulResults = results.filter(result => result !== null);
    
    console.log('CSS loading completed:', {
      total: cssList.length,
      successful: successfulResults.length,
      failed: cssList.length - successfulResults.length
    });
    
    return successfulResults;
  }

    async loadAllJS(jsList) {
    try {
      // 모든 JS 파일을 순서대로 가져와서 하나로 합치기
      const jsCodeParts = [];
      
      for (let i = 0; i < jsList.length; i++) {
        const jsPath = jsList[i];
        const src = typeof jsPath === 'string' ? jsPath : jsPath.src;
        
        if (!src) {
          continue;
        }
        
        try {
          const response = await fetch(src);
          if (!response.ok) {
            continue;
          }
          
          const jsCode = await response.text();
          
          // 각 JS 파일을 주석과 함께 구분하여 추가
          jsCodeParts.push(`\n// ===== ${src} =====\n${jsCode}\n`);
          
        } catch (error) {
          // JS 로딩 실패 시 무시하고 진행
        }
      }
      
      if (jsCodeParts.length === 0) {
        return [];
      }
      
      // 모든 JS 코드를 하나로 합치기
      const combinedJsCode = jsCodeParts.join('\n');
      
      // 전역 변수로 shadow DOM 컨텍스트 설정
      window.__shadowRoot__ = this.shadowRoot;
      
      // DOM 쿼리 헬퍼 함수를 전역에 설정
      window.$ = (selector) => window.__shadowRoot__.querySelector(selector);
      window.$$ = (selector) => window.__shadowRoot__.querySelectorAll(selector);
      
             // 합쳐진 JS 코드를 한 번에 실행 (에러 발생 시 재시도)
       
       let executionSuccess = false;
       let retryCount = 0;
       const maxRetries = 3;
       
               while (!executionSuccess && retryCount < maxRetries) {
          try {
            // JS 실행 전 DOM 요소 재검증
            const contentDiv = this.shadowRoot.querySelector('#content');
            if (!contentDiv) {
              throw new Error('Content div not found');
            }
            
            // 실제 DOM 접근 테스트
            try {
              const testQuery = contentDiv.querySelectorAll('*');
              if (!testQuery || testQuery.length === 0) {
                throw new Error('querySelectorAll test failed');
              }
            } catch (queryError) {
              await new Promise(resolve => setTimeout(resolve, 1500));
              continue;
            }
            
             // 주요 DOM 요소들이 실제로 존재하는지 확인 (범용적 검증)
             const projectRequiredElements = this.getRequiredElements();
             const missingElements = [];
             const unrenderedElements = [];
             
             for (const selector of projectRequiredElements) {
               try {
                 const element = contentDiv.querySelector(selector);
                 if (!element) {
                   missingElements.push(selector);
                 } else if (element.offsetWidth === 0 && element.offsetHeight === 0) {
                   unrenderedElements.push(selector);
                   console.log(`${selector} exists but not rendered (${element.offsetWidth}x${element.offsetHeight})`);
                 }
               } catch (e) {
                 missingElements.push(`${selector} (access error)`);
               }
             }
             
             // 요소가 존재하지 않는 경우만 에러로 처리
             if (missingElements.length > 0) {
               console.warn(`Missing elements: ${missingElements.join(', ')}`);
               await new Promise(resolve => setTimeout(resolve, 1500));
               continue;
             }
             
             // 렌더링되지 않은 요소가 있어도 진행 (CSS가 아직 로드되지 않았을 수 있음)
             if (unrenderedElements.length > 0) {
               console.log(`Some elements not yet rendered: ${unrenderedElements.join(', ')}, but proceeding anyway`);
             }
             
             // 최종 검증: 실제 JS에서 사용할 쿼리 테스트
             try {
               const finalTest = contentDiv.querySelectorAll(projectRequiredElements.join(', '));
               if (finalTest.length !== projectRequiredElements.length) {
                 throw new Error(`Final test failed: expected ${projectRequiredElements.length}, got ${finalTest.length}`);
               }
             } catch (finalError) {
               await new Promise(resolve => setTimeout(resolve, 1500));
               continue;
             }
            
            // JS 실행
            eval(combinedJsCode);
            executionSuccess = true;
          } catch (error) {
            retryCount++;
            
            if (retryCount < maxRetries) {
              // DOM이 더 준비될 때까지 대기 후 재시도
              await new Promise(resolve => setTimeout(resolve, 1500));
            } else {
              throw error;
            }
          }
        }
       
       // 실행된 스크립트 정보 저장
       const scriptInfo = { 
         src: 'combined-bundle', 
         executed: executionSuccess, 
         code: combinedJsCode, 
         order: 0,
         fileCount: jsCodeParts.length,
         retryCount: retryCount
       };
       this.scripts.push(scriptInfo);
       
       return [scriptInfo];
      
    } catch (error) {
      console.error('Error executing combined JS:', error);
      return [];
    }
  }

  cleanup() {
    // shadow DOM 내부의 CSS와 JS 제거
    this.stylesheets.forEach(link => {
      if (link && link.parentNode) {
        link.parentNode.removeChild(link);
      }
    });
    
    // script는 DOM 요소가 아니므로 정리만
    this.scripts = [];
    
    // Blob URL 정리 (메모리 누수 방지)
    if (this.videoBlobURLs) {
      this.videoBlobURLs.forEach(blobURL => {
        URL.revokeObjectURL(blobURL);
      });
      this.videoBlobURLs = [];
    }
    
         // 전역 변수 정리
     if (window.__shadowRoot__) {
       delete window.__shadowRoot__;
     }
    
    // shadow DOM 내용 정리
    const contentDiv = this.shadowRoot.querySelector('#content');
    if (contentDiv) contentDiv.innerHTML = '';
  }

     render() {
     this.shadowRoot.innerHTML = `
       <style>
         :host {
           display: block;
           width: 100%;
           height: 100%;
           overflow: auto;
           background-color: white;
           border-radius: 6px;
           position: relative;
         }
         
         #content {
           width: 100%;
           height: 100%;
         }
         
         .error-message {
           position: absolute;
           top: 50%;
           left: 50%;
           transform: translate(-50%, -50%);
           background-color: #ff6b6b;
           color: white;
           padding: 20px;
           border-radius: 8px;
           text-align: center;
           max-width: 80%;
           z-index: 1000;
         }
       </style>
       <div id="content"></div>
       <div id="error-container" style="display: none;"></div>
     `;
   }
   
   // 에러 메시지 표시
   showErrorMessage(message) {
     const errorContainer = this.shadowRoot.querySelector('#error-container');
     if (errorContainer) {
       errorContainer.innerHTML = `<div class="error-message">${message}</div>`;
       errorContainer.style.display = 'block';
       
       // 5초 후 자동으로 숨김
       setTimeout(() => {
         errorContainer.style.display = 'none';
       }, 5000);
     }
   }

  // 프로젝트 경로 가져오기
  getProjectPath() {
    return this.currentProjectPath || '/contents/canvas';
  }

     // 리소스 중복 제거 및 병합
   mergeResources(headResources, projectResources, key) {
     const merged = [...headResources];
     const existingPaths = new Set(headResources.map(r => r[key]));
     
     projectResources.forEach(resource => {
       const path = typeof resource === 'string' ? resource : resource[key];
       if (!existingPaths.has(path)) {
         merged.push(resource);
         existingPaths.add(path);
       }
     });
     
     return merged;
   }
   
   // CSS 변수 격리 (메인 앱과 충돌 방지) - CORS 안전하게 처리
   isolateCSSVariables() {
     try {
       // Shadow DOM 내부의 CSS 변수들을 격리
       const styleSheets = this.shadowRoot.querySelectorAll('link[rel="stylesheet"]');
       for (const sheet of styleSheets) {
         try {
           // CORS 정책 확인 - 외부 스타일시트는 건너뛰기
           if (sheet.sheet && sheet.href && sheet.href.startsWith(window.location.origin)) {
             const cssRules = sheet.sheet.cssRules;
             for (let i = 0; i < cssRules.length; i++) {
               const rule = cssRules[i];
               if (rule instanceof CSSStyleRule && rule.selectorText === ':root') {
                 // :root를 .content-scope로 변경하여 CSS 변수 격리
                 const newSelector = rule.selectorText.replace(':root', '.content-scope');
                 const newRule = `${newSelector} { ${rule.style.cssText} }`;
                 
                 // 기존 규칙 제거하고 새 규칙 추가
                 sheet.sheet.deleteRule(i);
                 sheet.sheet.insertRule(newRule, i);
               }
             }
           } else if (sheet.href && !sheet.href.startsWith(window.location.origin)) {
             // 외부 스타일시트는 건너뛰기
           }
         } catch (sheetError) {
           // 개별 스타일시트 오류는 무시하고 계속 진행
         }
       }
     } catch (error) {
       // CSS 변수 격리 중 오류 발생 시 무시하고 진행
     }
   }

   // Font Awesome 폰트 경로 수정 - CORS 안전하게 처리
   fixFontAwesomePaths() {
     try {
       // CSS 규칙에서 폰트 경로를 절대 경로로 수정
       const styleSheets = this.shadowRoot.querySelectorAll('link[rel="stylesheet"]');
       for (const sheet of styleSheets) {
         try {
           // Font Awesome 스타일시트만 처리
           if (sheet.href && sheet.href.includes('font-awesome')) {
             // CORS 정책 확인
             if (sheet.sheet && sheet.href.startsWith('https://')) {
               const cssRules = sheet.sheet.cssRules;
               if (cssRules) {
                 for (let i = 0; i < cssRules.length; i++) {
                   const rule = cssRules[i];
                   if (rule instanceof CSSFontFaceRule) {
                     const src = rule.style.getPropertyValue('src');
                     if (src && src.includes('webfonts/')) {
                       // 상대 경로를 절대 경로로 변환
                       const absoluteSrc = src.replace(/webfonts\//g, 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/webfonts/');
                       rule.style.setProperty('src', absoluteSrc);
                     }
                   }
                 }
               }
             }
           }
         } catch (sheetError) {
           // 개별 스타일시트 오류는 무시하고 계속 진행
         }
       }
     } catch (error) {
       // Font Awesome 경로 수정 중 오류 발생 시 무시하고 진행
     }
   }

   // 프로젝트별 필수 요소 정의 (간단하게)
   getRequiredElements() {
     const projectPath = this.currentProjectPath;
     
     // 프로젝트별 메인 컨테이너 요소 (하나만 사용)
     const elementMapping = {
       '/contents/canvas': ['#canvas', '#drawTool', '#figure', '#textBox'],
       '/contents/svg_animation': ['#wrap'],
       '/contents/player': ['#videoContainer', '#video'],
       '/contents/omok': ['#wrap'],
       '/contents/solitaire': ['#wrap']
     };
     
     // 기본값: 일반적인 컨테이너 요소들
     const defaultElements = ['#content', 'main', 'article', 'section', '#wrap'];
     
     // 프로젝트별 요소가 있으면 사용, 없으면 기본값 사용
     return elementMapping[projectPath] || defaultElements;
   }
   
        async convertVideoToBlob(htmlContent) {
     try {
             // 비디오 Blob 변환 시작
       
       // 비디오 파일 경로 추출
       const videoMatch = htmlContent.match(/<video[^>]*src=["']([^"']+)["'][^>]*>/i);
       if (!videoMatch) {
         return htmlContent;
       }
      
      const videoSrc = videoMatch[1];
      // 파일명 추출
      const fileName = videoSrc.split('/').pop();
      
      // 절대 경로로 변환 (환경 감지)
      let absoluteVideoPath = videoSrc;
      if (!videoSrc.startsWith('http') && !videoSrc.startsWith('//')) {
        // 현재 실행 환경 확인
        
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const isLocalNetwork = window.location.hostname.startsWith('192.168.') || window.location.hostname.startsWith('10.') || window.location.hostname.startsWith('172.');
        const isLocalPort = window.location.port === '3000' || window.location.port === '3001';
        
        // 로컬 환경 강제 감지
        if (isLocalhost || isLocalNetwork || isLocalPort || window.location.protocol === 'http:') {
          // 로컬 환경: localhost:3000 사용
          const localOrigin = `http://${window.location.hostname}:${window.location.port}`;
          if (videoSrc.startsWith('/')) {
            absoluteVideoPath = `${localOrigin}${videoSrc}`;
          } else {
            absoluteVideoPath = `${localOrigin}${this.currentProjectPath}/${videoSrc}`;
          }
          // 로컬 환경 감지됨
        } else {
          // 배포 환경: 현재 origin 사용
          if (videoSrc.startsWith('/')) {
            absoluteVideoPath = `${window.location.origin}${videoSrc}`;
          } else {
            absoluteVideoPath = `${window.location.origin}${this.currentProjectPath}/${videoSrc}`;
          }
        }
      }
      
      // 절대 경로 설정 완료
      
      // 비디오 파일을 fetch로 가져와서 Blob 생성
      
        const response = await fetch(absoluteVideoPath);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch video: ${response.status} ${response.statusText}`);
        }
        
        const videoBlob = await response.blob();
      
              // 파일 크기 검증
        const fileSizeMB = (videoBlob.size / 1024 / 1024).toFixed(2);
        
        if (videoBlob.size === 0) {
          throw new Error('Video file is empty (0 bytes) - fetch failed or file not found');
        }
        
        if (parseFloat(fileSizeMB) < 0.01) {
          // 작은 파일 크기 경고
          if (videoBlob.size < 1000) { // 1KB 미만인 경우
            const textContent = await videoBlob.text();
            
            if (textContent.includes('<!DOCTYPE') || textContent.includes('<html')) {
              throw new Error('Video file returned HTML instead of video content - likely a 404 or redirect page');
            }
          }
        }
      
        const blobURL = URL.createObjectURL(videoBlob);
        
        // HTML에서 비디오 src를 Blob URL로 교체
        const updatedHtml = htmlContent.replace(
          /(<video[^>]*src=["'])[^"']+(["'][^>]*>)/i,
          `$1${blobURL}$2`
        );
        
        // Blob URL을 정리할 수 있도록 저장
        this.videoBlobURLs = this.videoBlobURLs || [];
        this.videoBlobURLs.push(blobURL);
        
        return updatedHtml;
      
         } catch (error) {
       console.error('Error converting video to Blob:', error);
       
       // 에러 발생 시 원본 HTML 반환
       return htmlContent;
     }
   }
  }; // 클래스 정의 완료
}

// Web Component 등록 (클라이언트 사이드에서만)
if (typeof window !== 'undefined' && typeof customElements !== 'undefined' && !customElements.get('project-content')) {
  customElements.define('project-content', ProjectContent);
}

export default function CustomContentContainer({ show, onClose, projectId }) {
  const [loading, setLoading] = useState(true); // 초기값을 true로 변경하여 로딩 화면이 항상 표시되도록 함
  const [loadingTimeout, setLoadingTimeout] = useState(null);
  const projectElementRef = useRef(null);

  // 프로젝트별 리소스 매핑 (더 범용적으로)
  const projectResources = {
    '1': {
      html: '/contents/canvas/index.html',
      basePath: '/contents/canvas',
      css: ['/contents/canvas/style.css'],
      js: [
          '/contents/canvas/include/common.js',
          '/contents/canvas/include/draw.js',
          '/contents/canvas/include/drag.js',
          '/contents/canvas/include/figure.js',
          '/contents/canvas/include/resizing.js',
          '/contents/canvas/index.js'
      ]
    },
    '2': {
      html: '/contents/svg_animation/index.html',
      basePath: '/contents/svg_animation',
      css: ['/contents/svg_animation/style.css'],
      js: ['/contents/svg_animation/draw.js']
    },
    '3': {
      html: '/contents/player/index.html',
      basePath: '/contents/player',
      css: ['/contents/player/style.css'],
      js: ['/contents/player/player.js']
    },
    '4': {
      html: '/contents/omok/index.html',
      basePath: '/contents/omok',
      css: ['/contents/omok/style.css'],
      js: ['/contents/omok/main.js']
    },
    '5': {
      html: '/contents/solitaire/index.html',
      basePath: '/contents/solitaire',
      css: ['/contents/solitaire/style.css'],
      js: ['/contents/solitaire/index.js']
    }
  };

  useEffect(() => {
    if (!show || !projectId) return;

    const loadContent = async () => {
      let timeoutId = null; // 로컬 변수로 관리
      
      try {
        // 로딩 상태를 즉시 true로 설정하여 로딩 화면 표시
        setLoading(true);
        
        const resources = projectResources[projectId];
        if (!resources) {
          throw new Error('프로젝트를 찾을 수 없습니다.');
        }

        // HTML 로드
        const htmlResponse = await fetch(resources.html);
        const htmlContent = await htmlResponse.text();

        // CSS 로드
        if (resources.css && resources.css.length > 0) {
          await projectElementRef.current.loadAllCSS(resources.css);
        }

        // 커스텀 태그에 컨텐츠 설정
        if (projectElementRef.current) {
          // setContent가 완전히 완료될 때까지 기다림
          await projectElementRef.current.setContent(
            htmlContent,
            resources.css,
            resources.js,
            resources.basePath
          );
          
          // 추가로 DOM이 완전히 준비될 때까지 대기
          await new Promise(resolve => {
            const checkReady = () => {
              const contentDiv = projectElementRef.current.shadowRoot?.querySelector('#content');
              if (contentDiv && contentDiv.children.length > 0) {
                // DOM이 준비되었는지 확인
                const hasContent = contentDiv.querySelectorAll('*').length > 0;
                if (hasContent) {
                  resolve();
                } else {
                  setTimeout(checkReady, 100);
                }
              } else {
                setTimeout(checkReady, 100);
              }
            };
            checkReady();
          });
        }
        
        // 로딩 타이머 정리
        if (timeoutId) {
          clearTimeout(timeoutId);
          setLoadingTimeout(null);
        }
        
        // 모든 컨텐츠 로딩이 완료된 후에만 로딩 화면 숨김
        setLoading(false);
        
      } catch (error) {
        console.error('Error loading content:', error);
        // 에러 발생 시 로딩 타이머 정리
        if (timeoutId) {
          clearTimeout(timeoutId);
          setLoadingTimeout(null);
        }
        setLoading(false);
      }
    };

    loadContent();
  }, [show, projectId]);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
      }
    };
  }, [loadingTimeout]);

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
    <div className="custom-content-container" style={{
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
        <div 
          className="loading-container"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1,
            textAlign: 'center',
            color: 'white'
          }}
        >
          {/* 원형 스피너만 */}
          <div className="spinner" style={{
            width: '60px',
            height: '60px',
            border: '4px solid rgba(255, 255, 255, 0.3)',
            borderTop: '4px solid #fff',
            borderRadius: '50%',
            animation: 'spin .5s linear infinite'
          }}></div>
        </div>
      )}
      
      <project-content
        ref={projectElementRef}
        style={{
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          opacity: loading ? 0 : 1,
          transition: 'opacity 0.3s ease-in'
        }}
      />
      
      {/* CSS 애니메이션을 위한 스타일 */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
