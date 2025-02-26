import {DATABASE_ID, TOKEN} from "../../config";
import ProjectItem from "./project-item";

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
          "property": "이름",
          "direction": "ascending"
        }
      ],
      page_size: 100
    })
  };

  const res = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, options);

  const projects = await res.json();

  // console.log(projects)

  return(
    <div className="flex flex-col items-center justify-center min-h-screen xp-5 mb-10">
      <h2 className="ml-6 text-4xl font-bold sm:text-6ml">총 프로젝트 : {projects.results.length}</h2>
      <div className="py-6 px-6 grid grid-cols-1 gap-8 md:grid-cols-2 w-full">
        {projects.results.map((aProject)=>{
          return <ProjectItem key={aProject.id} data={aProject} />
        })}
      </div>
    </div>
  );
}