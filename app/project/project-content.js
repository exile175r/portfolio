'use client';
import { useState } from 'react';
import ProjectItem from "./project-item";
import IframeContainer from "./iframe-container"

export default function ProjectContent({ projects }) {
  const [showIframe, setShowIframe] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState('');

  // 프로젝트 ID에 따른 iframe src 매핑
  const projectUrls = {
    'project1': '/contents/canvas/index.html',
    'project2': '/contents/svg_animation/index.html',
    'project3': '/contents/player/index.html',
    'project4': '/contents/오목/index.html',
    'project5': '/contents/카드게임(Solitaire)/index.html',
    // 여기에 더 많은 프로젝트 URL을 추가할 수 있습니다
  };

  const handleProjectClick = (projectId) => {
    setCurrentProjectId(projectId);
    setShowIframe(true);
  };

  const handleClose = () => {
    setShowIframe(false);
    setCurrentProjectId('');
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen xp-5 mb-10">
        <h2 className="ml-6 text-4xl font-bold sm:text-6ml">
          총 프로젝트 : {projects.results.length}
        </h2>
        <div className="py-6 px-6 grid grid-cols-1 gap-8 md:grid-cols-2 w-full">
          {projects.results.map((aProject, i) => (
            <div
              key={aProject.id}
              onClick={() => handleProjectClick(i+1)}  // 프로젝트 ID 전달
              style={{cursor: 'pointer'}}
            >
              <ProjectItem data={aProject} />
            </div>
          ))}
        </div>
      </div>
      <IframeContainer 
        show={showIframe} 
        onClose={handleClose}
        src={projectUrls[`project${currentProjectId}`] || '/contents/canvas/index.html'}  // 기본값 설정
      />
    </>
  );
} 