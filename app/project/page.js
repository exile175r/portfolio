// 데이터 페칭을 위한 서버 컴포넌트
import {DATABASE_ID, TOKEN} from "../../config";
import ProjectContent from "./project-content";

export default async function Page() {
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
  const projects = await res.json();

  return <ProjectContent projects={projects} />;
}