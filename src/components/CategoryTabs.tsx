// ============================================================
// components/CategoryTabs.tsx — 카테고리 탭 (v2)
//
// v1 대비 변경점:
//   - 카테고리 클릭 → 필터링이 아니라 해당 섹션으로 스크롤 이동
//   - activeSectionId: Intersection Observer가 감지한 현재 보이는 섹션
//   → 스크롤하면 자동으로 해당 카테고리 탭이 하이라이트됨
// ============================================================

import { useEffect, useRef } from 'react';

interface CategoryTabsProps {
  categories: { name: string; slug: string }[];
  activeSectionId: string | null;  // Intersection Observer가 감지한 현재 섹션 ID
}

export default function CategoryTabs({ categories, activeSectionId }: CategoryTabsProps) {
  const tabsRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);

  // 활성 탭이 바뀌면 자동으로 탭 영역을 스크롤하여 해당 탭이 보이게
  useEffect(() => {
    if (activeTabRef.current && tabsRef.current) {
      const tab = activeTabRef.current;
      const container = tabsRef.current;
      const tabLeft = tab.offsetLeft;
      const tabWidth = tab.offsetWidth;
      const containerWidth = container.offsetWidth;
      // 탭을 컨테이너 중앙에 위치시킴
      container.scrollTo({
        left: tabLeft - containerWidth / 2 + tabWidth / 2,
        behavior: 'smooth',
      });
    }
  }, [activeSectionId]);

  // 카테고리 클릭 → 해당 섹션으로 스크롤 이동
  // v1에서는 필터링이었지만, v2에서는 스크롤만 이동
  const handleClick = (slug: string) => {
    const el = document.getElementById(slug);
    if (el) {
      window.scrollTo({ top: el.offsetTop - 180, behavior: 'smooth' });
    }
  };

  // "전체" 클릭 → 맨 위로
  const handleAllClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 아무 섹션도 보이지 않으면 "전체"를 활성
  const isAllActive = !activeSectionId;

  return (
    <div
      ref={tabsRef}
      role="tablist"
      aria-label="카테고리 필터"
      className="flex items-center gap-2 mt-5 pb-1 overflow-x-auto no-scrollbar"
    >
      <button
        role="tab"
        aria-selected={isAllActive}
        onClick={handleAllClick}
        ref={isAllActive ? activeTabRef : null}
        className={`px-5 py-2 rounded-full text-xs font-bold transition-all shrink-0 ${
          isAllActive
            ? 'bg-pink-600 text-white shadow-md shadow-pink-100'
            : 'bg-white text-pink-400 border border-pink-50 hover:bg-pink-50'
        }`}
      >
        전체보기
      </button>

      {categories.map((cat) => {
        const isActive = activeSectionId === cat.slug;
        return (
          <button
            key={cat.slug}
            role="tab"
            aria-selected={isActive}
            ref={isActive ? activeTabRef : null}
            onClick={() => handleClick(cat.slug)}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all shrink-0 border ${
              isActive
                ? 'bg-rose-400 text-white border-rose-400 shadow-md shadow-rose-100'
                : 'bg-white text-pink-400 border-pink-100 hover:border-pink-300'
            }`}
          >
            {cat.name}
          </button>
        );
      })}
    </div>
  );
}
