// ============================================================
// src/hooks/useActiveSection.ts — 스크롤 기반 카테고리 감지
//
// Intersection Observer 대신 scroll 이벤트 사용
// → 더 정확하고 안정적
// ============================================================

import { useState, useEffect } from 'react';

export function useActiveSection(sectionIds: string[]) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (sectionIds.length === 0) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const offset = 300; // 네비게이션 높이 + 여유

      // 맨 위에 있으면 전체보기
      if (scrollY < 400) {
        setActiveId(null);
        return;
      }

      // 각 섹션의 위치를 확인하여 현재 보이는 섹션 찾기
      let current: string | null = null;

      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (!el) continue;

        const rect = el.getBoundingClientRect();
        // 섹션의 상단이 화면 상단 + offset 아래에 있으면 아직 안 지나침
        // 섹션의 하단이 화면 상단 + offset 위에 있으면 이미 지나침
        if (rect.top <= offset) {
          current = id;
        }
      }

      setActiveId(current);
    };

    // 초기 실행
    handleScroll();

    // 스크롤 이벤트 (throttle로 성능 최적화)
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [sectionIds]);

  return activeId;
}