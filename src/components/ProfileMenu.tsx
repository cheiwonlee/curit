// ============================================================
// src/components/ProfileMenu.tsx — 프로필 드롭다운 메뉴
//
// 로그인 상태: 프로필 사진 + 드롭다운 (즐겨찾기함, 프로필 수정, 로그아웃)
// 비로그인 상태: 로그인 버튼
// ============================================================

import { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types';

interface ProfileMenuProps {
  profile: Profile | null;
  onLoginClick: () => void;
  onFavoritesClick: () => void;
}

export default function ProfileMenu({ profile, onLoginClick, onFavoritesClick }: ProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [nickname, setNickname] = useState(profile?.nickname || '');
  const menuRef = useRef<HTMLDivElement>(null);

  // 메뉴 바깥 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setEditing(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 비로그인 상태: 로그인 버튼
  if (!profile) {
    return (
      <button
        onClick={onLoginClick}
        className="px-5 py-2.5 bg-pink-500 text-white rounded-2xl text-xs font-bold hover:bg-pink-600 transition-colors shrink-0"
      >
        로그인
      </button>
    );
  }

  // 닉네임 수정
  const handleUpdateNickname = async () => {
    await supabase.from('profiles').update({ nickname }).eq('id', profile.id);
    setEditing(false);
    window.location.reload(); // 간단하게 새로고침으로 반영
  };

  // 로그아웃
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div ref={menuRef} className="relative shrink-0">
      {/* 프로필 아바타 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full overflow-hidden border-2 border-pink-200 hover:border-pink-400 transition-colors"
      >
        {profile.avatar_url ? (
          <img src={profile.avatar_url} alt="프로필" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-pink-300 to-rose-300 flex items-center justify-center text-white text-sm font-black">
            {(profile.nickname || '?')[0]}
          </div>
        )}
      </button>

      {/* 드롭다운 메뉴 */}
      {isOpen && (
        <div className="absolute right-0 top-14 w-64 bg-white rounded-2xl shadow-2xl border border-pink-100 p-4 z-50">
          {/* 프로필 정보 */}
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-pink-50">
            <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-pink-300 to-rose-300 flex items-center justify-center text-white text-sm font-black">
                  {(profile.nickname || '?')[0]}
                </div>
              )}
            </div>
            {editing ? (
              <div className="flex-1 flex gap-2">
                <input
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="flex-1 px-2 py-1 border border-pink-200 rounded-lg text-sm outline-none"
                  autoFocus
                />
                <button onClick={handleUpdateNickname} className="text-pink-500 text-xs font-bold">저장</button>
              </div>
            ) : (
              <div className="flex-1">
                <p className="font-bold text-sm text-slate-900">{profile.nickname || '사용자'}</p>
                <button onClick={() => { setEditing(true); setNickname(profile.nickname || ''); }} className="text-pink-400 text-xs hover:underline">닉네임 수정</button>
              </div>
            )}
          </div>

          {/* 메뉴 항목들 */}
          <button
            onClick={() => { onFavoritesClick(); setIsOpen(false); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-pink-50 transition-colors text-sm text-slate-700 font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-pink-400"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            즐겨찾기함
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-pink-50 transition-colors text-sm text-slate-400 font-medium mt-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
            로그아웃
          </button>
        </div>
      )}
    </div>
  );
}
