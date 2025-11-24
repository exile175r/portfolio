# Next.js 포트폴리오 프로젝트 기술서

## 📋 프로젝트 개요

**프로젝트명**: Next.js 포트폴리오 웹사이트  
**버전**: 0.1.0  
**개발 기간**: 2024년  
**프로젝트 유형**: 개인 포트폴리오 웹사이트  
**배포 플랫폼**: Vercel (권장)

## 🏗️ 기술 스택

### Frontend Framework
- **Next.js 15.1.7** - React 기반 풀스택 프레임워크
- **React 19.0.0** - 사용자 인터페이스 구축
- **React DOM 19.0.0** - DOM 조작

### Styling & UI
- **Tailwind CSS 3.4.1** - 유틸리티 기반 CSS 프레임워크
- **PostCSS 8** - CSS 전처리기
- **CSS Variables** - 다크모드 지원을 위한 CSS 변수

### Development Tools
- **ESLint 9** - 코드 품질 관리
- **ESLint Config Next** - Next.js 전용 린팅 규칙
- **Turbopack** - 빠른 개발 서버 (개발 모드)

### External Libraries
- **Lottie React 2.4.1** - 애니메이션 지원
- **Dotenv 16.4.7** - 환경변수 관리

## 🎯 주요 기능

### 1. 포트폴리오 프로젝트 관리
- **Notion API 연동**: 프로젝트 데이터베이스와 실시간 연동
- **동적 콘텐츠 로딩**: 프로젝트별 HTML/CSS/JS 파일 동적 로딩
- **프로젝트 카드 시스템**: 그리드 기반 프로젝트 목록 표시

### 2. 인터랙티브 프로젝트 실행
- **Web Component 기반**: Shadow DOM을 활용한 프로젝트 격리
- **멀티미디어 지원**: 비디오, 오디오, 이미지 등 다양한 미디어 타입
- **실시간 프로젝트 실행**: 클릭 시 즉시 프로젝트 실행 환경 제공

### 3. 반응형 디자인
- **모바일 우선 설계**: Tailwind CSS를 활용한 반응형 레이아웃
- **그리드 시스템**: 1열(모바일) → 2열(데스크톱) 자동 전환
- **적응형 UI**: 다양한 화면 크기에 최적화된 사용자 경험

## 🏛️ 프로젝트 구조

```
next-portfolio/
├── app/                          # Next.js App Router
│   ├── layout.js                # 루트 레이아웃
│   ├── page.js                  # 메인 페이지
│   ├── header.js                # 헤더 컴포넌트
│   ├── animation.js             # 애니메이션 컴포넌트
│   ├── globals.css              # 전역 스타일
│   └── project/                 # 프로젝트 페이지
│       ├── page.js              # 프로젝트 메인 페이지
│       ├── project-content.js   # 프로젝트 목록 컨테이너
│       ├── project-item.js      # 개별 프로젝트 카드
│       └── custom-content-container.js # 프로젝트 실행 모달
├── public/                       # 정적 파일
│   ├── contents/                # 프로젝트 콘텐츠
│   │   ├── canvas/             # Canvas 드로잉 도구
│   │   ├── svg_animation/      # SVG 애니메이션
│   │   ├── player/             # 커스텀 비디오 플레이어
│   │   ├── omok/               # 오목 게임
│   │   ├── solitaire/          # 솔리테어 게임
│   │   └── bingo/              # 빙고 게임
│   ├── animation.json          # Lottie 애니메이션 파일
│   └── favicon.ico             # 파비콘
├── config/                      # 설정 파일
│   └── index.js                # 환경 설정
└── vercel.json                 # Vercel 배포 설정
```

## 🔧 핵심 컴포넌트 분석

### 1. ProjectContent 컴포넌트
```javascript
// 주요 기능
- 프로젝트 데이터 검증 및 에러 처리
- 반응형 그리드 레이아웃 (1열/2열)
- 프로젝트 클릭 이벤트 처리
- 모달 상태 관리
```

### 2. CustomContentContainer 컴포넌트
```javascript
// 주요 기능
- Web Component 기반 프로젝트 실행 환경
- Shadow DOM을 활용한 스타일 격리
- 동적 리소스 로딩 (HTML/CSS/JS)
- CORS 정책 및 보안 헤더 관리
```

### 3. ProjectItem 컴포넌트
```javascript
// 주요 기능
- 프로젝트 정보 표시 (제목, 요약, 키워드)
- 이미지 최적화 (Next.js Image 컴포넌트)
- 반응형 카드 디자인
- 키워드 태그 시스템
```

## 🌐 API 및 외부 연동

### Notion API 연동
- **데이터베이스 쿼리**: 프로젝트 정보 실시간 조회
- **정렬 기능**: order 속성 기반 프로젝트 순서 관리
- **에러 처리**: API 실패 시 더미 데이터로 폴백
- **환경변수 관리**: 보안을 위한 토큰 관리

### 환경변수 설정
```bash
NOTION_DATABASE_ID=your_database_id
NOTION_TOKEN=your_integration_token
```

## 🎨 UI/UX 특징

### 1. 디자인 시스템
- **컬러 팔레트**: CSS 변수를 활용한 테마 시스템
- **타이포그래피**: Arial, Helvetica 폰트 스택
- **간격 시스템**: Tailwind CSS의 일관된 간격 규칙
- **그림자 효과**: 카드 및 모달의 깊이감 표현

### 2. 애니메이션
- **Lottie 애니메이션**: JSON 기반 벡터 애니메이션
- **CSS 트랜지션**: 부드러운 상태 전환 효과
- **로딩 스피너**: 사용자 피드백을 위한 시각적 요소

### 3. 반응형 디자인
- **브레이크포인트**: Tailwind CSS의 기본 브레이크포인트 활용
- **그리드 시스템**: CSS Grid를 활용한 유연한 레이아웃
- **이미지 최적화**: Next.js Image 컴포넌트의 자동 최적화

## 🔒 보안 및 성능

### 보안 기능
- **CSP 헤더**: Content Security Policy 설정
- **X-Frame-Options**: 클릭재킹 공격 방지
- **CORS 정책**: 적절한 크로스 오리진 설정
- **환경변수 보호**: 민감한 정보의 코드 하드코딩 방지

### 성능 최적화
- **Turbopack**: 빠른 개발 서버
- **이미지 최적화**: Next.js 자동 이미지 최적화
- **코드 스플리팅**: 페이지별 자동 코드 분할
- **정적 파일 서빙**: 효율적인 정적 리소스 관리

## 🚀 배포 및 운영

### 배포 환경
- **Vercel**: Next.js 공식 배포 플랫폼
- **정적 파일 호스팅**: public 폴더의 콘텐츠 자동 서빙
- **자동 배포**: Git 연동을 통한 CI/CD

### 환경별 설정
- **개발 환경**: localhost:3000
- **프로덕션 환경**: Vercel 도메인
- **환경변수**: Vercel 대시보드에서 설정

## 📱 지원 브라우저

- **Chrome**: 최신 버전
- **Firefox**: 최신 버전
- **Safari**: 최신 버전
- **Edge**: 최신 버전
- **모바일 브라우저**: iOS Safari, Chrome Mobile

## 🛠️ 개발 가이드

### 개발 서버 실행
```bash
npm install          # 의존성 설치
npm run dev          # 개발 서버 실행
npm run build        # 프로덕션 빌드
npm run start        # 프로덕션 서버 실행
npm run lint         # 코드 린팅
```

### 프로젝트 추가 방법
1. `public/contents/` 폴더에 새 프로젝트 폴더 생성
2. `custom-content-container.js`의 `projectResources` 객체에 프로젝트 정보 추가
3. 프로젝트별 HTML, CSS, JS 파일 준비
4. Notion 데이터베이스에 프로젝트 정보 추가

## 🔮 향후 개선 계획

### 단기 개선사항
- [ ] 다크모드 토글 기능
- [ ] 프로젝트 검색 및 필터링
- [ ] 프로젝트 카테고리 분류
- [ ] 애니메이션 성능 최적화

### 장기 개선사항
- [ ] PWA 지원 (오프라인 기능)
- [ ] 다국어 지원 (i18n)
- [ ] SEO 최적화
- [ ] 분석 도구 연동 (Google Analytics)

## 📊 프로젝트 통계

- **총 프로젝트 수**: 5개 (Canvas, SVG Animation, Player, Omok, Solitaire)
- **코드 라인 수**: 약 1,000+ 라인
- **사용 기술**: 8개 주요 기술 스택
- **지원 미디어**: HTML5, Canvas, SVG, Video, Audio

## 📞 문의 및 지원

프로젝트 관련 문의사항이나 기술 지원이 필요한 경우, 프로젝트 저장소의 Issues 섹션을 통해 문의해 주시기 바랍니다.

---

**문서 버전**: 1.0.0  
**최종 업데이트**: 2024년  
**작성자**: 개발팀
