// ============================================================
// src/hooks/useScrollDirection.ts — 스크롤 방향 감지
//
// 스크롤 내리면 'down', 올리면 'up' 반환
// 모바일 네비 숨김/표시에 사용
// ============================================================

import { useState, useEffect } from 'react';

export function useScrollDirection() {
  const [direction, setDirection] = useState<'up' | 'down'>('up');
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const currentY = window.scrollY;

          // 맨 위 근처에서는 항상 표시
          if (currentY < 100) {
            setDirection('up');
          }
          // 20px 이상 차이나야 방향 전환 (떨림 방지)
          else if (currentY > lastScrollY + 20) {
            setDirection('down');
          } else if (currentY < lastScrollY - 20) {
            setDirection('up');
          }

          setLastScrollY(currentY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return direction;
}