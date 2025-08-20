// 데이터 페칭을 위한 서버 컴포넌트
import ProjectContent from "./project-content";

// 환경변수 설정
const DATABASE_ID = process.env.NOTION_DATABASE_ID;
const TOKEN = process.env.NOTION_TOKEN;

export default async function Page() {
  // 환경변수 검증
  const hasValidEnvVars = DATABASE_ID && 
                         TOKEN && 
                         DATABASE_ID !== 'undefined' && 
                         TOKEN !== 'undefined' &&
                         typeof DATABASE_ID === 'string' &&
                         typeof TOKEN === 'string' &&
                         DATABASE_ID.trim() !== '' &&
                         TOKEN.trim() !== '';

  if (!hasValidEnvVars) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          환경변수 설정 오류
        </h2>
        <p className="text-gray-600 mb-4">
          Notion API 설정이 완료되지 않았습니다.
        </p>
        <p className="text-sm text-gray-500">
          NOTION_DATABASE_ID와 NOTION_TOKEN 환경변수를 확인해주세요.
        </p>
      </div>
    );
  }

  // Notion API 호출
  try {
    const options = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TOKEN}`
      },
      body: JSON.stringify({
        sorts: [
          {
            "property": "order",
            "direction": "ascending"
          }
        ],
        page_size: 100
      })
    };

    const res = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, options);
    
    if (!res.ok) {
      throw new Error(`Notion API error: ${res.status} ${res.statusText}`);
    }
    
    const projects = await res.json();
    
    // 데이터 구조 검증
    if (!projects || !projects.results) {
      throw new Error('Invalid data structure from Notion API');
    }

    return <ProjectContent projects={projects} />;
    
  } catch (error) {
    console.error('Error fetching projects:', error);
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          프로젝트 데이터 로드 실패
        </h2>
        <p className="text-gray-600 mb-4">
          Notion API에서 프로젝트 데이터를 가져오는 중 오류가 발생했습니다.
        </p>
        <p className="text-sm text-gray-500">
          잠시 후 다시 시도해주세요.
        </p>
        <details className="mt-4 text-sm">
          <summary className="cursor-pointer text-blue-600">오류 상세정보</summary>
          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-w-md">
            {error.message}
          </pre>
        </details>
      </div>
    );
  }
}