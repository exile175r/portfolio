import Image from "next/image";

export default function ProjectItem({data}){
  const imgSrc = data.cover.file?.url || data.cover.external.url;
  const prop = data.properties;
  const title = prop.이름.title[0].plain_text;
  const summation = prop['AI 요약'].rich_text[0].plain_text;
  const keywords = prop['AI 키워드'].multi_select;

  return (
    <div className="flex flex-col rounded-xl projectItem">
      <div className="relative w-full h-[300px]">
        <Image 
          className="rounded-t-xl"
          src={imgSrc}
          fill
          style={{ objectFit: 'none' }}
          alt="project cover image"
          priority
        />
      </div>
      <div className="info rounded-b-xl">
        <h3>{title}</h3>
        <p>{summation}</p>
        <ul className="flex gap-1">
          {keywords.map(v => {
            return <li
              key={v.id || index}
              style={{ backgroundColor: v.color, color: '#fff' }} >
              {v.name}
            </li>
          })}
        </ul>
      </div>
    </div>
  )
};