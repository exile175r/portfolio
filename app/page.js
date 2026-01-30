import Link from 'next/link';
import LottieAnimation from "./animation"

export default function Home() {
  return (
    <section className="text-gray-600 body-font">
      <div className="container mx-auto flex px-5 py-24 md:flex-row flex-col items-center">
        <div className="lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left mb-16 md:mb-0 items-center text-center">
          <h1 className="title-font sm:text-4xl text-3xl mb-4 font-bold text-gray-900">
            프로젝트를 통한 성장과 도전
            <span style={{
              display: 'block',
              fontSize: '24px'
            }}>: 배움과 혁신의 흔적</span>
          </h1>
          <p className="mb-8 leading-relaxed" style={{
            textIndent: '10px',
            fontWeight: 700
          }}>
            본 포트폴리오는 초·중학교 교과서를 기반으로 한 교사 및 학생용 콘텐츠와
            유아 및 초등학생을 위한 교육 콘텐츠 개발 경험을 바탕으로 제작되었습니다.
            프로젝트의 상세 내용은 Project 페이지에서 확인해 주시기 바랍니다.
          </p>
          <div className="flex justify-center md:justify-start gap-4">
            <Link href="/project" className="inline-flex text-white bg-indigo-500 border-0 py-2 px-3 focus:outline-none hover:bg-indigo-600 rounded text-lg">프로젝트 보러가기</Link>
            <Link href="https://github.com/exile175r/portfolio" target="_blank" className="inline-flex text-white bg-indigo-500 border-0 py-2 px-3 focus:outline-none hover:bg-indigo-600 rounded text-lg">GitHub Link</Link>
          </div>
        </div>
        <div className="lg:max-w-lg lg:w-full md:w-1/2 w-5/6">
          <LottieAnimation />
        </div>
      </div>
    </section>
  );
}
