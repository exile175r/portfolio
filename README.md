This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## 환경변수 설정

### 1. .env.local 파일 생성

프로젝트 루트 디렉토리에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```bash
# Notion API 설정
NOTION_DATABASE_ID=your_database_id_here
NOTION_TOKEN=your_integration_token_here
```

### 2. Notion API 설정 방법

#### 2.1 Integration Token 생성
1. [Notion Developers](https://www.notion.so/my-integrations) 페이지 방문
2. "New integration" 클릭
3. Integration 이름 입력 (예: "Portfolio Integration")
4. "Submit" 클릭하여 토큰 생성
5. 생성된 토큰을 복사하여 `NOTION_TOKEN`에 설정

#### 2.2 Database ID 확인
1. Notion에서 프로젝트 데이터베이스 페이지 열기
2. URL에서 데이터베이스 ID 복사:
   ```
   https://www.notion.so/workspace/DATABASE_ID?v=...
   ```
3. 복사한 ID를 `NOTION_DATABASE_ID`에 설정

#### 2.3 Database 권한 설정
1. 데이터베이스 페이지에서 "..." 메뉴 클릭
2. "Add connections" 선택
3. 생성한 Integration 추가
4. "Confirm" 클릭

### 3. 환경변수 설정 후

환경변수를 설정한 후에는 **개발 서버를 재시작**해야 합니다:

```bash
# 개발 서버 중지 (Ctrl+C)
# 개발 서버 재시작
npm run dev
```

## 문제 해결

### 500 Internal Server Error 해결

프로젝트 탭에서 500 에러가 발생하는 경우:

1. **환경변수 확인**: `.env.local` 파일이 올바르게 설정되었는지 확인
2. **서버 재시작**: 환경변수 변경 후 개발 서버 재시작
3. **더미 데이터 사용**: 환경변수가 없으면 자동으로 더미 데이터 표시

### 더미 데이터 사용 시

환경변수가 설정되지 않은 경우:
- 노란색 경고 메시지와 함께 더미 프로젝트 표시
- 실제 Notion 데이터 대신 샘플 프로젝트 정보 제공
- 개발 및 테스트 목적으로 사용 가능

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
