// ============================================================
// src/components/CuritLogo.tsx — 공통 로고 컴포넌트
//
// 마이페이지, 북마크함 등 모든 페이지 헤더에서 재사용
// 클릭 시 메인 홈으로 이동
// ============================================================

interface CuritLogoProps {
  onHomeClick: () => void;
}

export default function CuritLogo({ onHomeClick }: CuritLogoProps) {
  return (
    <div
      className="flex items-center gap-3 cursor-pointer shrink-0"
      onClick={onHomeClick}
    >
      <div className="w-10 h-10 bg-gradient-to-tr from-pink-500 to-rose-400 rounded-xl flex items-center justify-center text-white shadow-lg shadow-pink-200">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      </div>
      <h1 className="text-2xl font-black text-pink-900 tracking-tighter lowercase">curit</h1>
    </div>
  );
}