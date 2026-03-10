// ============================================================
// src/components/FavoriteButton.tsx — 즐겨찾기 하트 버튼
//
// 카드 위에 표시되는 하트 아이콘
// 클릭하면 Supabase favorites 테이블에 추가/제거
// ============================================================

import { supabase } from '../lib/supabase';

interface FavoriteButtonProps {
  siteId: number;
  isFavorited: boolean;
  userId: string | null;        // 비로그인이면 null
  onToggle: (siteId: number) => void;  // 부모에게 변경 알림
  onLoginRequired: () => void;  // 비로그인 시 로그인 모달 열기
}

export default function FavoriteButton({ siteId, isFavorited, userId, onToggle, onLoginRequired }: FavoriteButtonProps) {

  const handleClick = async (e: React.MouseEvent) => {
    // 카드 링크 클릭 방지 (하트만 클릭되게)
    e.preventDefault();
    e.stopPropagation();

    // 비로그인 시 로그인 모달 띄우기
    if (!userId) {
      onLoginRequired();
      return;
    }

    if (isFavorited) {
      // 즐겨찾기 제거
      await supabase.from('favorites').delete().eq('user_id', userId).eq('site_id', siteId);
    } else {
      // 즐겨찾기 추가
      await supabase.from('favorites').insert({ user_id: userId, site_id: siteId });
    }

    onToggle(siteId);
  };

  return (
    <button
      onClick={handleClick}
      className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-all shadow-sm hover:shadow-md"
      aria-label={isFavorited ? '즐겨찾기 해제' : '즐겨찾기 추가'}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill={isFavorited ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        className={isFavorited ? 'text-pink-500' : 'text-pink-300 hover:text-pink-500'}
      >
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
      </svg>
    </button>
  );
}
