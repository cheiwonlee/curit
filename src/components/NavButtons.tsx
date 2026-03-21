// ============================================================
// src/components/NavButtons.tsx — 네비게이션 버튼 그룹
//
// 비로그인: [마이페이지] [북마크함] [로그인]
// 로그인:   [마이페이지] [북마크함] [내 사이트] [로그아웃]
// ============================================================

import { supabase } from '../lib/supabase';

interface NavButtonsProps {
  isLoggedIn: boolean;
  onLoginClick: () => void;
  onMyPageClick: () => void;
  onBookmarksClick: () => void;
  onMySitesClick: () => void;
}

export default function NavButtons({ isLoggedIn, onLoginClick, onMyPageClick, onBookmarksClick, onMySitesClick }: NavButtonsProps) {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = window.location.pathname;
  };

  return (
    <div className="flex items-center gap-2 shrink-0">
      {/* 마이페이지 */}
      <button onClick={onMyPageClick}
        className="flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold transition-colors bg-white border border-pink-100 text-pink-500 hover:bg-pink-50 hover:border-pink-300">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
        <span>마이페이지</span>
      </button>

      {/* 북마크함 */}
      <button onClick={onBookmarksClick}
        className="flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold transition-colors bg-white border border-pink-100 text-pink-500 hover:bg-pink-50 hover:border-pink-300">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
        <span>북마크함</span>
      </button>

      {/* 내 사이트 (로그인 시만) */}
      {isLoggedIn && (
        <button onClick={onMySitesClick}
          className="flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold transition-colors bg-white border border-pink-100 text-pink-500 hover:bg-pink-50 hover:border-pink-300">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
          </svg>
          <span>내 사이트</span>
        </button>
      )}

      {/* 로그인/로그아웃 */}
      {isLoggedIn ? (
        <button onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold transition-colors bg-pink-50 text-pink-400 hover:bg-pink-100">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          <span>로그아웃</span>
        </button>
      ) : (
        <button onClick={onLoginClick}
          className="flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold transition-colors bg-pink-500 text-white hover:bg-pink-600">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
          </svg>
          <span>로그인</span>
        </button>
      )}
    </div>
  );
}