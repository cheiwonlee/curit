// ============================================================
// src/components/FavoritesPage.tsx — 북마크함
//
// 기존 사이트 북마크 + 나만의 사이트 북마크를 섞어서 표시
// 썸네일, 카테고리 필터, 검색 지원
// ============================================================

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import CuritLogo from './CuritLogo';
import type { CategoryWithSites } from '../types';

// ============================================================
// Props
// ============================================================
interface FavoritesPageProps {
  websiteData: CategoryWithSites[];
  favoriteIds: Set<number>;
  userId: string | null;
  onToggleFavorite: (siteId: number) => void;
  onBack: () => void;
}

export default function FavoritesPage({
  websiteData,
  favoriteIds,
  userId,
  onToggleFavorite,
  onBack,
}: FavoritesPageProps) {
  const [activeFilter, setActiveFilter] = useState('전체');
  const [searchTerm, setSearchTerm] = useState('');

  // 나만의 사이트 북마크를 직접 로드 (MySitesPage 동기화 문제 해결)
  const [userSiteFavorites, setUserSiteFavorites] = useState<any[]>([]);

  useEffect(() => {
    if (!userId) return;
    const loadUserFavs = async () => {
      const { data: favIds } = await supabase
        .from('user_site_favorites').select('user_site_id').eq('user_id', userId);
      if (favIds && favIds.length > 0) {
        const ids = favIds.map(f => f.user_site_id);
        const { data: sites } = await supabase
          .from('user_sites').select('*').in('id', ids);
        if (sites) setUserSiteFavorites(sites);
      }
    };
    loadUserFavs();
  }, [userId]);

  // 나만의 사이트 북마크 해제
  const handleToggleUserSiteFav = async (siteId: number) => {
    if (!userId) return;
    await supabase.from('user_site_favorites')
      .delete().eq('user_id', userId).eq('user_site_id', siteId);
    setUserSiteFavorites(prev => prev.filter(s => s.id !== siteId));
  };

  // ============================================================
  // 통합 북마크 타입
  // ============================================================
  type UnifiedItem = {
    id: string;
    name: string;
    url: string;
    note: string | null;
    thumbnailUrl: string | null;
    category: string;
    isUserSite: boolean;
    originalId: number;
  };

  // 썸네일 URL
  const getThumbnail = (url: string, customThumb?: string | null) => {
    if (customThumb) return customThumb;
    return `https://image.thum.io/get/width/300/crop/600/noanimate/${url}`;
  };

  // ============================================================
  // 두 종류 북마크 합치기
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
            thumbnailUrl: (item as any).thumbnail_url || null,
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
        thumbnailUrl: site.thumbnail_url || null,
        category: site.category || '내 사이트',
        isUserSite: true,
        originalId: site.id,
      });
    });

    return items;
  }, [websiteData, favoriteIds, userSiteFavorites]);

  // ============================================================
  // 검색 + 필터
  // ============================================================
  const filtered = useMemo(() => {
    let result = allFavorites;
    if (activeFilter !== '전체') {
      result = result.filter((item) => item.category === activeFilter);
    }
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

  // 카테고리별 그룹
  const groupedFavorites = useMemo(() => {
    const groups: { [key: string]: UnifiedItem[] } = {};
    filtered.forEach((item) => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return Object.entries(groups);
  }, [filtered]);

  // 필터용 카테고리
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
            <h2 className="text-lg font-bold text-pink-900">북마크함</h2>
            <span className="text-pink-300 text-sm font-bold">{totalFavorites}개</span>

            <div className="flex-1 max-w-md ml-auto relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </div>
              <input type="text" placeholder="북마크함에서 검색..."
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-pink-50/50 border border-transparent focus:bg-white focus:border-pink-300 rounded-xl pl-10 pr-4 py-2.5 text-sm transition-all outline-none placeholder:text-pink-200" />
            </div>
          </div>

          {/* 카테고리 필터 */}
          <div className="flex items-center gap-2 mt-4 overflow-x-auto no-scrollbar">
            <button onClick={() => setActiveFilter('전체')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 ${
                activeFilter === '전체' ? 'bg-pink-600 text-white shadow-md' : 'bg-white text-pink-400 border border-pink-100 hover:bg-pink-50'
              }`}>전체</button>
            {availableCategories.map((cat) => (
              <button key={cat} onClick={() => setActiveFilter(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 border ${
                  activeFilter === cat ? 'bg-rose-400 text-white border-rose-400 shadow-md' : 'bg-white text-pink-400 border-pink-100 hover:border-pink-300'
                }`}>{cat}</button>
            ))}
          </div>
        </div>
      </div>

      {/* 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 pt-44 pb-40">
        {groupedFavorites.length === 0 ? (
          <div className="py-40 text-center">
            <div className="w-24 h-24 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-8">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-pink-200">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
            <h3 className="text-2xl font-black text-slate-900">
              {totalFavorites === 0 ? '아직 북마크한 사이트가 없어요.' : '검색 결과가 없어요.'}
            </h3>
            <p className="text-pink-300 mt-3 font-medium">
              {totalFavorites === 0 ? '마음에 드는 사이트에 ♥를 눌러 북마크해보세요.' : '다른 키워드로 검색해 보세요.'}
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
                    {/* 썸네일 */}
                    <a href={item.url} target="_blank" rel="noopener noreferrer"
                      className="block aspect-[16/10] bg-pink-50/30 overflow-hidden relative">
                      <img src={getThumbnail(item.url, item.thumbnailUrl)} alt={item.name} loading="lazy"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      {/* 하트 해제 버튼 */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          if (item.isUserSite) handleToggleUserSiteFav(item.originalId);
                          else onToggleFavorite(item.originalId);
                        }}
                        className="absolute top-2 right-2 p-2 rounded-full bg-white/90 text-pink-500 shadow-sm hover:scale-110 transition-transform">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                          fill="currentColor" stroke="currentColor" strokeWidth="2">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                      </button>
                    </a>

                    {/* 사이트 정보 */}
                    <div className="p-4">
                      <a href={item.url} target="_blank" rel="noopener noreferrer"
                        className="text-sm font-bold text-slate-900 hover:text-pink-500 transition-colors">
                        {item.name}
                      </a>
                      {item.note && <p className="text-xs text-slate-400 mt-2 line-clamp-2">{item.note}</p>}
                      {item.isUserSite && (
                        <span className="inline-block mt-2 px-2 py-0.5 bg-pink-50 text-pink-400 rounded-full text-[10px] font-bold">내 사이트</span>
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