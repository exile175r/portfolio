import Image from "next/image";

export default function ProjectItem({data}){

  const title = data.properties.이름.title[0].plain_text;
  const imgSrc = data.cover.file?.url || data.cover.external.url;

  return (
    <div className="flex flex-col bg-slate-400 rounded-t-xl">
      <div className="relative w-full h-[300px]">
        <Image 
          className="rounded-t-xl"
          src={imgSrc}
          fill
          style={{ objectFit: 'none' }}
          alt="project cover image"
        />
      </div>
      <h3>{title}</h3>
    </div>
  )
};