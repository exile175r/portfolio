import Image from "next/image";

export default function ProjectItem({data}){
  // 데이터 구조 검증
  if (!data || !data.cover || !data.properties) {
    return (
      <div className="flex flex-col rounded-xl projectItem p-4 border border-gray-300">
        <div className="text-red-600">데이터 오류</div>
      </div>
    );
  }

  // 안전한 데이터 추출
  const imgSrc = data.cover?.file?.url || data.cover?.external?.url || '/placeholder-image.jpg';
  const prop = data.properties || {};
  
  // 이름 추출 (안전하게)
  const title = prop.이름?.title?.[0]?.plain_text || '제목 없음';
  
  // AI 요약 추출 (안전하게)
  const summation = prop['AI 요약']?.rich_text?.[0]?.plain_text || '요약 정보가 없습니다.';
  
  // AI 키워드 추출 (안전하게)
  const keywords = prop['AI 키워드']?.multi_select || [];

  return (
    <div className="flex flex-col h-full rounded-xl projectItem">
      <div className="relative w-full h-[300px]">
        <Image 
          className="rounded-t-xl"
          src={imgSrc}
          fill
          style={{ objectFit: 'cover' }}
          alt="project cover image"
          priority
          unoptimized
        />
      </div>
      <div className="flex flex-col flex-1 info rounded-b-xl">
        <h3>{title}</h3>
        <p>{summation}</p>
        <ul className="mt-auto flex gap-1">
          {keywords.map((v, index) => {
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