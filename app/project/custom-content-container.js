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
      
      console.log('Loading content with:', { html: html.substring(0, 200) + '...', css, js });
      
      // HTML에서 body 태그 내용 추출 (정규식 사용)
      const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
      let bodyContent = '';
      
      if (bodyMatch && bodyMatch[1]) {
        bodyContent = bodyMatch[1];
        console.log('Body content extracted:', {
          contentLength: bodyContent.length,
          contentPreview: bodyContent.substring(0, 200) + '...'
        });
      } else {
        // body 태그가 없으면 전체 HTML 사용
        bodyContent = html;
        console.log('No body tag found, using full HTML');
      }
      
      // 비디오 요소를 Blob으로 변환하는 로직 추가 (Player 프로젝트 강제 실행)
      if (this.currentProjectPath.includes('/player')) {
        console.log('Player project detected, forcing video Blob conversion...');
        bodyContent = await this.convertVideoToBlob(bodyContent);
        console.log('Video Blob conversion completed');
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
      
      console.log('Extracted resources:', {
        headLinks: headLinks.length,
        headScripts: headScripts.length
      });
      
      // 중복 제거: HTML에서 추출된 리소스와 프로젝트별 리소스 병합
      const allCss = this.mergeResources(headLinks, css, 'href');
      const allJs = this.mergeResources(headScripts, js, 'src');
      
      console.log('Starting resource loading:', {
        totalCss: allCss.length,
        totalJs: allJs.length
      });
      
        // CSS를 먼저 로드
        console.log('Step 1: Loading CSS files...');
        const cssResults = await this.loadAllCSS(allCss);
        
        // CSS 로딩 완료 후 추가 대기 (폰트 로딩을 위해)
        console.log('Step 1.5: Waiting for CSS and fonts to be applied...');
        if (this.currentProjectPath === '/contents/player') {
          // Player 프로젝트는 폰트 로딩을 위해 더 오래 대기
          await new Promise(resolve => setTimeout(resolve, 2000));
          console.log('Font Awesome fonts should be ready now');
          
          // 폰트 로딩 상태 확인 (간소화)
          try {
            const testElement = document.createElement('i');
            testElement.className = 'fas fa-play';
            this.shadowRoot.appendChild(testElement);
            
            // 간단한 폰트 확인
            const computedStyle = window.getComputedStyle(testElement);
            console.log('Font loading check completed');
            
            // 테스트 요소 제거
            this.shadowRoot.removeChild(testElement);
          } catch (error) {
            console.warn('Font loading check failed:', error);
          }
        } else {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // CSS 변수 격리 실행
        console.log('Step 1.6: Isolating CSS variables...');
        this.isolateCSSVariables();
        
        // HTML 컨텐츠를 먼저 삽입
        console.log('Step 2: Inserting body content...');
       const contentDiv = this.shadowRoot.querySelector('#content');
       if (contentDiv) {
         if (bodyContent && bodyContent.trim().length > 0) {
           console.log('Inserting content into shadow DOM...');
           
           // CSS 변수 격리를 위해 content-scope 클래스 추가
           const wrappedContent = `<div class="content-scope">${bodyContent}</div>`;
           contentDiv.innerHTML = wrappedContent;
           console.log('Content inserted successfully:', {
             contentLength: bodyContent.length,
             contentPreview: bodyContent.substring(0, 200) + '...',
             shadowDOMContent: contentDiv.innerHTML.substring(0, 200) + '...'
           });
           
           // 삽입된 컨텐츠 확인
           const insertedElements = contentDiv.children;
           console.log('Inserted elements:', {
             count: insertedElements.length,
             elements: Array.from(insertedElements).map(el => ({
               tagName: el.tagName,
               id: el.id,
               className: el.className
             }))
           });
         } else {
           console.error('No content to insert');
         }
       } else {
         console.error('Content div not found in shadow DOM');
       }
       
               // HTML 삽입 완료 후 DOM이 준비될 때까지 대기 (강화된 검증)
        console.log('Step 3: Waiting for DOM to be ready...');
        await new Promise((resolve, reject) => {
          // 타임아웃 설정 (20초)
          const timeout = setTimeout(() => {
            console.warn('DOM ready timeout reached, proceeding anyway');
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
        console.log('Step 4: Loading JS files...');
        const jsResults = await this.loadAllJS(allJs);
       
       console.log('Resource loading completed:', {
         cssLoaded: cssResults.length,
         jsLoaded: jsResults.length
       });
      
      console.log('All resources loaded successfully:', {
        css: cssResults.length,
        js: jsResults.length
      });
      
         } catch (error) {
       console.error('Error loading content:', error);
       
       // 에러 발생 시 사용자에게 알림
       this.showErrorMessage(error.message || '컨텐츠 로딩 중 오류가 발생했습니다.');
     } finally {
       this.isLoading = false;
     }
  }

  async loadAllCSS(cssList) {
    console.log('Starting CSS loading for', cssList.length, 'files');
    
    // Font Awesome CSS 자동 추가 (Player 프로젝트인 경우)
    if (this.currentProjectPath === '/contents/player') {
      cssList.unshift('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css');
      console.log('Font Awesome CSS added for Player project');
      
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
          console.log(`Font loaded: ${fontUrl}`);
        } catch (error) {
          console.warn(`Failed to load font: ${fontUrl}`, error);
        }
      }
    }
    
    const cssPromises = cssList.map(async (cssPath, index) => {
      const href = typeof cssPath === 'string' ? cssPath : cssPath.href;
      if (!href) {
        console.warn('Invalid CSS path at index', index, cssPath);
        return null;
      }
      
      console.log(`Loading CSS ${index + 1}/${cssList.length}:`, href);
      
      try {
        return await new Promise((resolve, reject) => {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = href;
          link.id = `css-${Date.now()}-${index}`;
          
          // 타임아웃 설정 (5초)
          const timeout = setTimeout(() => {
            console.warn(`CSS loading timeout: ${href}`);
            resolve(null);
          }, 5000);
          
          link.onload = () => {
            clearTimeout(timeout);
            this.stylesheets.push(link);
            console.log(`CSS loaded successfully: ${href}`);
            
            // Font Awesome CSS인 경우 폰트 경로 수정
            if (href.includes('font-awesome') && href.includes('all.min.css')) {
              this.fixFontAwesomePaths();
            }
            
            resolve(link);
          };
          
          link.onerror = () => {
            clearTimeout(timeout);
            console.warn(`Failed to load CSS: ${href}`);
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
    console.log('Starting bundled JS loading for', jsList.length, 'files');
    
    try {
      // 모든 JS 파일을 순서대로 가져와서 하나로 합치기
      const jsCodeParts = [];
      
      for (let i = 0; i < jsList.length; i++) {
        const jsPath = jsList[i];
        const src = typeof jsPath === 'string' ? jsPath : jsPath.src;
        
        if (!src) {
          console.warn(`Invalid JS path at index ${i}:`, jsPath);
          continue;
        }
        
        console.log(`Fetching JS ${i + 1}/${jsList.length}: ${src}`);
        
        try {
          const response = await fetch(src);
          if (!response.ok) {
            console.warn(`Failed to fetch JS: ${src}`);
            continue;
          }
          
          const jsCode = await response.text();
          console.log(`JS code fetched for: ${src}`, jsCode.substring(0, 100) + '...');
          
          // 각 JS 파일을 주석과 함께 구분하여 추가
          jsCodeParts.push(`\n// ===== ${src} =====\n${jsCode}\n`);
          
        } catch (error) {
          console.warn(`Error loading JS ${src}:`, error);
        }
      }
      
      if (jsCodeParts.length === 0) {
        console.warn('No JS files loaded successfully');
        return [];
      }
      
      // 모든 JS 코드를 하나로 합치기
      const combinedJsCode = jsCodeParts.join('\n');
      console.log('Combined JS code length:', combinedJsCode.length);
      
      // 전역 변수로 shadow DOM 컨텍스트 설정
      window.__shadowRoot__ = this.shadowRoot;
      
      // DOM 쿼리 헬퍼 함수를 전역에 설정
      window.$ = (selector) => window.__shadowRoot__.querySelector(selector);
      window.$$ = (selector) => window.__shadowRoot__.querySelectorAll(selector);
      
             // 합쳐진 JS 코드를 한 번에 실행 (에러 발생 시 재시도)
       console.log('Executing combined JS code...');
       
       let executionSuccess = false;
       let retryCount = 0;
       const maxRetries = 3;
       
               while (!executionSuccess && retryCount < maxRetries) {
          try {
            // JS 실행 전 DOM 요소 재검증 (강화)
            console.log(`Validating DOM before JS execution (attempt ${retryCount + 1})...`);
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
              console.log(`DOM query test passed: ${testQuery.length} elements found`);
            } catch (queryError) {
              console.warn('DOM query test failed, DOM not ready yet:', queryError);
              await new Promise(resolve => setTimeout(resolve, 1500)); // 1000ms → 1500ms로 증가
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
               console.log('Final DOM validation passed, all elements accessible');
             } catch (finalError) {
               console.warn('Final validation failed:', finalError);
               await new Promise(resolve => setTimeout(resolve, 1500));
               continue;
             }
            
            console.log('DOM validation passed, executing JS...');
            eval(combinedJsCode);
            executionSuccess = true;
            console.log('All JS executed successfully as bundle');
          } catch (error) {
            retryCount++;
            console.warn(`JS execution failed (attempt ${retryCount}/${maxRetries}):`, error);
            
            if (retryCount < maxRetries) {
              // DOM이 더 준비될 때까지 대기 후 재시도
              console.log(`Waiting before retry ${retryCount + 1}...`);
              await new Promise(resolve => setTimeout(resolve, 1500)); // 1000ms → 1500ms로 증가
            } else {
              console.error('All JS execution attempts failed');
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
        console.log('Blob URL revoked:', blobURL);
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
                 console.log('CSS variable isolated:', rule.selectorText, '→', newSelector);
               }
             }
           } else if (sheet.href && !sheet.href.startsWith(window.location.origin)) {
             // 외부 스타일시트는 로그만 남기고 건너뛰기
             console.log('Skipping external stylesheet for CSS variable isolation:', sheet.href);
           }
         } catch (sheetError) {
           // 개별 스타일시트 오류는 무시하고 계속 진행
           console.log('Skipping stylesheet due to CORS policy:', sheet.href);
         }
       }
     } catch (error) {
       console.warn('CSS variable isolation completed with warnings:', error);
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
                       console.log('Fixed font path:', src, '→', absoluteSrc);
                     }
                   }
                 }
               }
             } else {
               console.log('Skipping Font Awesome path fix due to CORS policy:', sheet.href);
             }
           }
         } catch (sheetError) {
           // 개별 스타일시트 오류는 무시하고 계속 진행
           console.log('Skipping Font Awesome stylesheet due to CORS policy:', sheet.href);
         }
       }
     } catch (error) {
       console.warn('Font Awesome path fixing completed with warnings:', error);
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
       console.log('=== VIDEO BLOB CONVERSION START ===');
       console.log('HTML content length:', htmlContent.length);
       console.log('HTML preview:', htmlContent.substring(0, 500) + '...');
       
       // 비디오 파일 경로 추출
       const videoMatch = htmlContent.match(/<video[^>]*src=["']([^"']+)["'][^>]*>/i);
       if (!videoMatch) {
         console.log('❌ No video element found in HTML');
         console.log('HTML content:', htmlContent);
         return htmlContent;
       }
      
      const videoSrc = videoMatch[1];
      console.log('Found video src:', videoSrc);
      
      // 파일명 추출 및 로깅
      const fileName = videoSrc.split('/').pop();
      console.log('Video filename:', fileName);
      
      // 절대 경로로 변환 (환경 감지)
      let absoluteVideoPath = videoSrc;
      if (!videoSrc.startsWith('http') && !videoSrc.startsWith('//')) {
        // 현재 실행 환경 확인 (강화된 감지)
        console.log('🔍 Environment detection:', {
          href: window.location.href,
          origin: window.location.origin,
          hostname: window.location.hostname,
          port: window.location.port,
          protocol: window.location.protocol
        });
        
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
          console.log('🌐 Local environment detected, using:', localOrigin);
        } else {
          // 배포 환경: 현재 origin 사용
          if (videoSrc.startsWith('/')) {
            absoluteVideoPath = `${window.location.origin}${videoSrc}`;
          } else {
            absoluteVideoPath = `${window.location.origin}${this.currentProjectPath}/${videoSrc}`;
          }
          console.log('🚀 Production environment detected, using:', window.location.origin);
        }
        
        // 경로 검증 로깅
        console.log('🔍 Path construction details:', {
          originalVideoSrc: videoSrc,
          startsWithSlash: videoSrc.startsWith('/'),
          currentProjectPath: this.currentProjectPath,
          constructedPath: absoluteVideoPath
        });
      }
      
      console.log('Absolute video path:', absoluteVideoPath);
      
      // 먼저 HEAD 요청으로 파일 존재 여부 확인
      try {
        const headResponse = await fetch(absoluteVideoPath, { method: 'HEAD' });
        console.log('🔍 HEAD request result:', {
          status: headResponse.status,
          statusText: headResponse.statusText,
          contentLength: headResponse.headers.get('content-length'),
          contentType: headResponse.headers.get('content-type')
        });
        
        if (!headResponse.ok) {
          console.warn('⚠️ HEAD request failed, but proceeding with GET request');
        }
      } catch (headError) {
        console.warn('⚠️ HEAD request failed:', headError.message);
      }
      
      // 비디오 파일을 fetch로 가져와서 Blob 생성
      console.log('🔍 Fetching video from:', absoluteVideoPath);
      
      const response = await fetch(absoluteVideoPath);
      console.log('📡 Fetch response status:', response.status, response.statusText);
      console.log('📡 Fetch response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        throw new Error(`Failed to fetch video: ${response.status} ${response.statusText}`);
      }
      
      const videoBlob = await response.blob();
      console.log('📦 Blob created:', {
        size: videoBlob.size,
        type: videoBlob.type,
        lastModified: videoBlob.lastModified
      });
      
      // 파일 크기 검증
      const fileSizeMB = (videoBlob.size / 1024 / 1024).toFixed(2);
      console.log('Video file size:', fileSizeMB, 'MB');
      
      if (videoBlob.size === 0) {
        throw new Error('Video file is empty (0 bytes) - fetch failed or file not found');
      }
      
      if (parseFloat(fileSizeMB) < 0.01) {
        console.warn('⚠️ Video file is very small:', fileSizeMB, 'MB - might be corrupted');
      }
      
      const blobURL = URL.createObjectURL(videoBlob);
      console.log('Video converted to Blob URL:', blobURL);
      
      // HTML에서 비디오 src를 Blob URL로 교체
      const updatedHtml = htmlContent.replace(
        /(<video[^>]*src=["'])[^"']+(["'][^>]*>)/i,
        `$1${blobURL}$2`
      );
      
      // Blob URL을 정리할 수 있도록 저장
      this.videoBlobURLs = this.videoBlobURLs || [];
      this.videoBlobURLs.push(blobURL);
      
      console.log('HTML updated with Blob URL');
      return updatedHtml;
      
         } catch (error) {
       console.error('❌ Error converting video to Blob:', error);
       console.error('Error details:', {
         name: error.name,
         message: error.message,
         stack: error.stack
       });
       
       // 추가 디버깅 정보
       console.error('🔍 Debug info:', {
         absoluteVideoPath,
         currentOrigin: window.location.origin,
         currentProjectPath: this.currentProjectPath,
         videoSrc: videoMatch ? videoMatch[1] : 'No match found'
       });
       
       console.log('🔄 Falling back to original HTML');
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
  const [loading, setLoading] = useState(true);
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
      setLoading(true);
      const resources = projectResources[projectId];
      
      if (!resources) {
        console.error('Project resources not found');
        setLoading(false);
        return;
      }

      try {
        // HTML 로드
        const htmlResponse = await fetch(resources.html);
        const htmlContent = await htmlResponse.text();
        
        // 커스텀 태그에 컨텐츠 설정
        if (projectElementRef.current) {
          await projectElementRef.current.setContent(
            htmlContent,
            resources.css,
            resources.js,
            resources.basePath // 프로젝트별 HTML 경로를 전달
          );
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading content:', error);
        setLoading(false);
      }
    };

    loadContent();
  }, [show, projectId]);

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
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1,
          color: 'white',
          fontSize: '18px'
        }}>
          Loading...
        </div>
      )}
      
      <project-content
        ref={projectElementRef}
        style={{
          width: '100%',
          height: '100%',
          overflow: 'hidden'
        }}
      />
    </div>
  );
}
