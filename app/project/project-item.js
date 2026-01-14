import Image from "next/image";

export default function ProjectItem({ data }) {
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

  // 외부 링크 URL 추출 (모든 노션 속성 유형 및 속성명 대응)
  const getUrl = (p) => {
    if (!p) return null;
    const val = p.url ||
      p.rich_text?.[0]?.plain_text ||
      p.title?.[0]?.plain_text ||
      p.files?.[0]?.file?.url ||
      p.files?.[0]?.external?.url || null;

    if (typeof val === 'string') {
      const trimmed = val.trim();
      if (trimmed.startsWith('http') || trimmed.startsWith('www')) {
        return trimmed.startsWith('www') ? `https://${trimmed}` : trimmed;
      }
    }
    return null;
  };

  // 가능한 모든 속성명 후보군 탐색
  const findUrlInProps = (properties) => {
    const keywords = ['Github', 'github', 'GITHUB', 'URL', 'url', 'Link', 'link', 'Git', 'git', 'Pages', 'pages', 'Site', 'site'];
    // 1. 명시적인 매칭 우선
    for (const key of keywords) {
      const url = getUrl(properties[key]);
      if (url) return url;
    }
    // 2. 검색어 포함 매칭 (예: "Github URL", "배포링크" 등)
    for (const key in properties) {
      if (keywords.some(k => key.toLowerCase().includes(k.toLowerCase()))) {
        const url = getUrl(properties[key]);
        if (url) return url;
      }
    }
    return '';
  };

  const githubUrl = findUrlInProps(prop);

  return (
    <div className="flex flex-col h-full rounded-xl projectItem">
      <div className="relative w-full h-[300px]">
        <Image
          className="rounded-t-xl"
          src={imgSrc}
          fill
          style={{ border: '1px solid rgba(0, 0, 0, .5)', objectFit: 'cover' }}
          alt="project cover image"
          priority
          unoptimized
        />
      </div>
      <div className="flex flex-col flex-1 info rounded-b-xl relative">
        {githubUrl && (
          <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded-full backdrop-blur-sm border border-white/20">
            외부 사이트 🔗
          </div>
        )}
        <h3>{title}</h3>
        <p>{summation}</p>
        <ul className="mt-auto flex gap-1 flex-wrap">
          {keywords.map((v, index) => {
            // 공식 로고 컬러 매핑
            const brandColors = {
              'HTML': { bg: '#E34F26', text: '#fff' },
              'CSS': { bg: '#1572B6', text: '#fff' },
              'JavaScript': { bg: '#F7DF1E', text: '#000' },
              'Javascript': { bg: '#F7DF1E', text: '#000' },
              'React': { bg: '#61DAFB', text: '#000' },
              'Next.js': { bg: '#000', text: '#fff' }
            };

            const brandStyle = brandColors[v.name] || { bg: v.color, text: '#fff' };

            return <li
              key={v.id || index}
              style={{ backgroundColor: brandStyle.bg, color: brandStyle.text }} >
              {v.name}
            </li>
          })}
        </ul>
      </div>
    </div>
  )
};