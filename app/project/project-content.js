'use client';
import { useState } from 'react';
import ProjectItem from "./project-item";
import CustomContentContainer from "./custom-content-container"

export default function ProjectContent({ projects }) {
  const [showContent, setShowContent] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState('');


  if (!projects) {
    console.warn('Projects prop is null or undefined');
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          데이터 없음
        </h2>
        <p className="text-gray-600">
          프로젝트 데이터가 전달되지 않았습니다.
        </p>
      </div>
    );
  }

  // results가 없으면 빈 배열로 처리
  const projectResults = projects.results || [];

  if (!Array.isArray(projectResults)) {
    console.warn('Projects.results is not an array:', projectResults);
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          데이터 형식 오류
        </h2>
        <p className="text-gray-600">
          프로젝트 데이터 형식이 올바르지 않습니다.
        </p>
        <details className="mt-4 text-sm">
          <summary>데이터 구조</summary>
          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
            {JSON.stringify(projects, null, 2)}
          </pre>
        </details>
      </div>
    );
  }

  const handleProjectClick = (projectId) => {
    setCurrentProjectId(projectId);
    setShowContent(true);
  };

  const handleClose = () => {
    setShowContent(false);
    setCurrentProjectId('');
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen xp-5 mb-10">
        <h2 className="ml-6 text-4xl font-bold sm:text-6ml">
          총 프로젝트 : {projectResults.length}
        </h2>
        <div className="py-6 px-6 grid grid-cols-1 gap-8 md:grid-cols-2 w-full lg:grid-cols-3">
          {projectResults.map((aProject, i) => {
            const prop = aProject.properties || {};

            // 외부 링크 탐색 매니저 (ProjectItem과 로직 통일)
            const getProjectUrl = (properties) => {
              const getVal = (p) => {
                if (!p) return null;
                const v = p.url || p.rich_text?.[0]?.plain_text || p.title?.[0]?.plain_text || p.files?.[0]?.file?.url || p.files?.[0]?.external?.url || null;
                if (typeof v === 'string' && (v.trim().startsWith('http') || v.trim().startsWith('www'))) {
                  const t = v.trim();
                  return t.startsWith('www') ? `https://${t}` : t;
                }
                return null;
              };
              const keys = ['Github', 'github', 'GITHUB', 'URL', 'url', 'Link', 'link', 'Git', 'git', 'Pages', 'pages', 'Site', 'site'];
              for (const k of keys) {
                const u = getVal(properties[k]);
                if (u) return u;
              }
              for (const key in properties) {
                if (keys.some(k => key.toLowerCase().includes(k.toLowerCase()))) {
                  const u = getVal(properties[key]);
                  if (u) return u;
                }
              }
              return null;
            };

            const githubUrl = getProjectUrl(prop);

            // 디버깅용 로그
            if (i === 0) console.log('첫 번째 프로젝트 데이터 예시:', prop);
            if (githubUrl) console.log(`프로젝트 [${i}] 외부 링크 감지됨:`, githubUrl);

            return (
              <div
                key={aProject.id}
                onClick={() => {
                  if (githubUrl) {
                    window.open(githubUrl, '_blank');
                  } else {
                    handleProjectClick(i + 1);
                  }
                }}
                style={{ cursor: 'pointer' }}
              >
                <ProjectItem data={aProject} />
              </div>
            );
          })}
        </div>
      </div>
      <CustomContentContainer
        show={showContent}
        onClose={handleClose}
        projectId={currentProjectId}
      />
    </>
  );
} 