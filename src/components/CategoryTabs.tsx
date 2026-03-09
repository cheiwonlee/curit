// ============================================================
// components/CategoryTabs.tsx — 카테고리 탭 컴포넌트
//
// HTML 원본 대응:
//   <div id="categoryTabs">...</div>
//   + categoryTabs.innerHTML = `<button onclick="filterCategory(...)">...`
//
// React에서 달라진 점:
//   - innerHTML로 버튼 HTML 문자열을 생성하던 것
//     → .map()으로 <button> JSX 요소를 직접 렌더링
//   - onclick="filterCategory('전체')" 인라인 핸들러
//     → onClick={() => onSelect('전체')} React 이벤트
//   - window.filterCategory 전역 함수
//     → props로 전달받은 onSelect 콜백 함수
// ============================================================

import { Category } from '../types';

interface CategoryTabsProps {
  categories: Category[];                     // 전체 카테고리 목록
  activeCategory: string;                     // 현재 선택된 카테고리 이름
  onSelect: (category: string, id?: string) => void;  // 탭 클릭 시 호출할 함수
  // id?: string 의 '?'는 선택적(optional) 매개변수
  // → id를 전달할 수도, 안 할 수도 있음
}

export default function CategoryTabs({ categories, activeCategory, onSelect }: CategoryTabsProps) {
  return (
    // --------------------------------------------------------
    // 탭 컨테이너
    // overflow-x-auto: 탭이 많으면 가로 스크롤
    // no-scrollbar: 스크롤바 숨김 (CSS에서 정의)
    //
    // 접근성 개선 (HTML 원본에 없던 것):
    //   role="tablist": 스크린리더에게 "이건 탭 목록"이라고 알려줌
    //   aria-label: 이 영역의 용도 설명
    // --------------------------------------------------------
    <div
      role="tablist"
      aria-label="카테고리 필터"
      className="flex items-center gap-2 mt-5 pb-1 overflow-x-auto no-scrollbar"
    >
      {/* --------------------------------------------------------
          "전체보기" 버튼
          
          onClick={() => onSelect('전체')}
          → 클릭하면 부모의 onSelect 함수를 호출하여 '전체'로 변경
          
          HTML 원본과의 비교:
            원본: onclick="filterCategory('전체')"  ← 문자열로 된 JS 코드
            React: onClick={() => onSelect('전체')} ← 실제 함수 참조
          
          삼항 연산자로 스타일 분기:
            activeCategory === '전체' ? '활성 스타일' : '비활성 스타일'
          → HTML 원본과 동일한 로직이지만, JSX 안에서 {} 로 감싸서 사용
          
          접근성:
            role="tab": 스크린리더에게 "이건 탭 버튼"이라고 알려줌
            aria-selected: "이 탭이 현재 선택됐는지" 알려줌
      -------------------------------------------------------- */}
      <button
        role="tab"
        aria-selected={activeCategory === '전체'}
        onClick={() => onSelect('전체')}
        className={`px-5 py-2 rounded-full text-xs font-bold transition-all shrink-0 ${
          activeCategory === '전체'
            ? 'bg-pink-600 text-white shadow-md shadow-pink-100'
            : 'bg-white text-pink-400 border border-pink-50 hover:bg-pink-50'
        }`}
      >
        전체보기
      </button>

      {/* --------------------------------------------------------
          카테고리별 탭 버튼들
          
          categories.map(group => ...)
          → 배열의 각 요소(group)를 <button> JSX로 변환
          
          HTML 원본에서는:
            websiteData.map(group => `<button>...</button>`).join('')
          → 문자열을 만들어서 innerHTML에 넣었음
          
          React에서는:
            categories.map(group => <button>...</button>)
          → JSX 요소 배열을 직접 반환
          
          key={group.id}:
          → React가 리스트의 각 항목을 구별하기 위한 고유 식별자
          → key가 없으면 React가 어떤 항목이 변경됐는지 모름
          → 성능 최적화에 필수적!
          → HTML 원본에는 없던 React 고유 개념
      -------------------------------------------------------- */}
      {categories.map((group) => (
        <button
          key={group.id}
          role="tab"
          aria-selected={activeCategory === group.category}
          onClick={() => onSelect(group.category, group.id)}
          className={`px-5 py-2 rounded-full text-xs font-bold transition-all shrink-0 border ${
            activeCategory === group.category
              ? 'bg-rose-400 text-white border-rose-400 shadow-md shadow-rose-100'
              : 'bg-white text-pink-400 border-pink-100 hover:border-pink-300'
          }`}
        >
          {group.category}
        </button>
      ))}
    </div>
  );
}
