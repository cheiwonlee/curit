// ============================================================
// src/hooks/useActiveSection.ts
//
// 스크롤 시 현재 보이는 카테고리 섹션을 감지하는 커스텀 Hook
//
// Intersection Observer란?
//   → "이 요소가 화면(뷰포트)에 들어왔는지" 감지하는 브라우저 API
//   → 스크롤 이벤트를 직접 감지하는 것보다 성능이 훨씬 좋음
//
// 동작:
//   1. 각 카테고리 섹션의 slug ID를 전달받음
//   2. 화면에 보이는 섹션의 slug를 반환
//   3. CategoryTabs에서 해당 탭을 하이라이트
// ============================================================
import { useState, useEffect } from 'react';

export function useActiveSection(sectionIds: string[]) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (sectionIds.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        } else {
          // 아무 섹션도 안 보이면 null → "전체보기" 활성화
          setActiveId(null);
        }
      },
      {
        rootMargin: '-250px 0px -50% 0px',
        threshold: 0,
      }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sectionIds]);

  return activeId;
}