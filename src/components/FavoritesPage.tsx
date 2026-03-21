// ============================================================
// src/components/FavoritesPage.tsx — 북마크함 (통합 버전)
//
// 기존 사이트 북마크 + 나만의 사이트 북마크를 섞어서 표시
// 카테고리별 그룹, 검색, 필터 지원
// ============================================================

import { useState, useMemo } from 'react';
import CuritLogo from './CuritLogo';
import type { CategoryWithSites } from '../types';

// ============================================================
// 통합 북마크 아이템 타입
// ============================================================
type UnifiedItem = {
  id: string;           // 충돌 방지: "site-1" or "user-2"
  name: string;
  url: string;
  note: string | null;
  category: string;
  isUserSite: boolean;  // 나만의 사이트 여부 (배지 표시용)
  originalId: number;   // 원래 테이블의 id (토글용)
};

// ============================================================
// Props
// ============================================================
interface FavoritesPageProps {
  websiteData: CategoryWithSites[];
  favoriteIds: Set<number>;
  onToggleFavorite: (siteId: number) => void;
  onBack: () => void;
  userSiteFavorites?: { id: number; name: string; url: string; category: string; note: string | null }[];
  onToggleUserSiteFavorite?: (siteId: number) => void;
}

export default function FavoritesPage({
  websiteData,
  favoriteIds,
  onToggleFavorite,
  onBack,
  userSiteFavorites = [],
  onToggleUserSiteFavorite,
}: FavoritesPageProps) {
  const [activeFilter, setActiveFilter] = useState('전체');
  const [searchTerm, setSearchTerm] = useState('');

  // ============================================================
  // 기존 사이트 + 나만의 사이트 북마크를 하나로 합침
  // ============================================================
  const allFavorites: UnifiedItem[] = useMemo(() => {
    const items: UnifiedItem[] = [];

    // 기존 사이트 북마크
    websiteData.forEach((group) => {
      group.items.forEach((item) => {
        if (favoriteIds.has(item.id)) {
          items.push({
            id: `site-${item.id}`,
            name: item.name,
            url: item.url,
            note: item.note,
            category: group.name,
            isUserSite: false,
            originalId: item.id,
          });
        }
      });
    });

    // 나만의 사이트 북마크
    userSiteFavorites.forEach((site) => {
      items.push({
        id: `user-${site.id}`,
        name: site.name,
        url: site.url,
        note: site.note,
        category: site.category || '내 사이트',
        isUserSite: true,
        originalId: site.id,
      });
    });

    return items;
  }, [websiteData, favoriteIds, userSiteFavorites]);

  // ============================================================
  // 검색 필터
  // ============================================================
  const filtered = useMemo(() => {
    let result = allFavorites;

    // 카테고리 필터
    if (activeFilter !== '전체') {
      result = result.filter((item) => item.category === activeFilter);
    }

    // 검색어 필터
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(lower) ||
          (item.note && item.note.toLowerCase().includes(lower)) ||
          item.category.toLowerCase().includes(lower)
      );
    }

    return result;
  }, [allFavorites, searchTerm, activeFilter]);

  // ============================================================
  // 카테고리별 그룹
  // ============================================================
  const groupedFavorites = useMemo(() => {
    const groups: { [key: string]: UnifiedItem[] } = {};
    filtered.forEach((item) => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return Object.entries(groups);
  }, [filtered]);

  // ============================================================
  // 필터용 카테고리 목록 (북마크가 있는 카테고리만)
  // ============================================================
  const availableCategories = useMemo(() => {
    const cats = new Set(allFavorites.map((f) => f.category));
    return Array.from(cats).sort();
  }, [allFavorites]);

  const totalFavorites = allFavorites.length;

  // ============================================================
  // UI
  // ============================================================
  return (
    <div className="bg-[#FFF5F7] min-h-screen text-slate-800">

      {/* 헤더 */}
      <div className="glass-nav fixed top-0 inset-x-0 z-[100] border-b border-pink-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 rounded-xl hover:bg-pink-50 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-500">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </button>
            <CuritLogo onHomeClick={onBack} />
            <div className="h-6 w-px bg-pink-200" />
            <h2 className="text-lg font-bold text-pink-900">내 컬렉션</h2>
            <span className="text-pink-300 text-sm font-bold">{totalFavorites}개</span>

            {/* 검색 */}
            <div className="flex-1 max-w-md ml-auto relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </div>
              <input
                type="text"
                placeholder="컬렉션에서 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-pink-50/50 border border-transparent focus:bg-white focus:border-pink-300 rounded-xl pl-10 pr-4 py-2.5 text-sm transition-all outline-none placeholder:text-pink-200"
              />
            </div>
          </div>

          {/* 카테고리 필터 */}
          <div className="flex items-center gap-2 mt-4 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveFilter('전체')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 ${
                activeFilter === '전체'
                  ? 'bg-pink-600 text-white shadow-md'
                  : 'bg-white text-pink-400 border border-pink-100 hover:bg-pink-50'
              }`}
            >
              전체
            </button>
            {availableCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 border ${
                  activeFilter === cat
                    ? 'bg-rose-400 text-white border-rose-400 shadow-md'
                    : 'bg-white text-pink-400 border-pink-100 hover:border-pink-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 pt-40 pb-40">
        {groupedFavorites.length === 0 ? (
          <div className="py-40 text-center">
            <div className="w-24 h-24 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-8">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-pink-200">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
            <h3 className="text-2xl font-black text-slate-900">
              {totalFavorites === 0 ? '아직 담아둔 사이트가 없어요.' : '검색 결과가 없어요.'}
            </h3>
            <p className="text-pink-300 mt-3 font-medium">
              {totalFavorites === 0
                ? '마음에 드는 사이트에 ♥를 눌러 나만의 컬렉션을 만들어보세요.'
                : '다른 키워드로 검색해 보세요.'}
            </p>
          </div>
        ) : (
          groupedFavorites.map(([category, items]) => (
            <section key={category} className="mt-16">
              <div className="flex items-center gap-4 mb-8 pb-4 border-b border-pink-100">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{category}</h3>
                <span className="text-pink-300 text-sm font-bold">{items.length}개</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {items.map((item) => (
                  <div key={item.id} className="bg-white rounded-2xl border border-pink-50 hover:border-pink-200 hover:shadow-lg transition-all overflow-hidden group">
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-base font-bold text-slate-900 hover:text-pink-500 transition-colors flex-1"
                        >
                          {item.name}
                        </a>
                        {/* 북마크 해제 버튼 */}
                        <button
                          onClick={() => {
                            if (item.isUserSite && onToggleUserSiteFavorite) {
                              onToggleUserSiteFavorite(item.originalId);
                            } else {
                              onToggleFavorite(item.originalId);
                            }
                          }}
                          className="text-pink-500 shrink-0 p-1 hover:scale-110 transition-transform"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                            fill="currentColor" stroke="currentColor" strokeWidth="2">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                          </svg>
                        </button>
                      </div>
                      {item.note && <p className="text-xs text-slate-400 line-clamp-2">{item.note}</p>}
                      {/* 나만의 사이트 배지 */}
                      {item.isUserSite && (
                        <span className="inline-block mt-2 px-2 py-0.5 bg-pink-50 text-pink-400 rounded-full text-[10px] font-bold">
                          내 사이트
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))
        )}
      </main>
    </div>
  );
}