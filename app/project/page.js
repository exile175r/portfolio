// 데이터 페칭을 위한 서버 컴포넌트
import ProjectContent from "./project-content";

// 환경변수 설정
const DATABASE_ID = process.env.NOTION_DATABASE_ID;
const TOKEN = process.env.NOTION_TOKEN;

// 더미 프로젝트 데이터 (환경변수가 없을 때 사용)
const dummyProjects = {
  results: [
    {
      id: '1',
      cover: null,
      properties: {
        이름: {
          title: [{ plain_text: 'Canvas Drawing Tool' }]
        },
        'AI 요약': {
          rich_text: [{ plain_text: 'HTML5 Canvas를 사용한 드로잉 도구입니다. 다양한 도형과 텍스트를 그릴 수 있습니다.' }]
        },
        'AI 키워드': [
          { id: '1', name: 'Canvas', color: 'blue' },
          { id: '2', name: 'Drawing', color: 'green' },
          { id: '3', name: 'HTML5', color: 'purple' }
        ]
      }
    },
    {
      id: '2',
      cover: null,
      properties: {
        이름: {
          title: [{ plain_text: 'SVG Animation' }]
        },
        'AI 요약': {
          rich_text: [{ plain_text: 'SVG를 사용한 애니메이션 프로젝트입니다. 인터랙티브한 그래픽 요소를 제공합니다.' }]
        },
        'AI 키워드': [
          { id: '4', name: 'SVG', color: 'red' },
          { id: '5', name: 'Animation', color: 'orange' },
          { id: '6', name: 'Interactive', color: 'blue' }
        ]
      }
    },
    {
      id: '3',
      cover: null,
      properties: {
        이름: {
          title: [{ plain_text: 'Video Player' }]
        },
        'AI 요약': {
          rich_text: [{ plain_text: '커스텀 비디오 플레이어입니다. 다양한 컨트롤과 기능을 제공합니다.' }]
        },
        'AI 키워드': [
          { id: '7', name: 'Video', color: 'green' },
          { id: '8', name: 'Player', color: 'blue' },
          { id: '9', name: 'Custom', color: 'purple' }
        ]
      }
    }
  ]
};

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
    return <ProjectContent projects={dummyProjects} />;
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
    return <ProjectContent projects={dummyProjects} />;
  }
}