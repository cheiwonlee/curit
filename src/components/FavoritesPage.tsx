// ============================================================
// src/components/FavoritesPage.tsx — 북마크함 (curit 로고 추가)
// ============================================================

import { useState, useMemo } from 'react';
import SiteCard from './SiteCard';
import CuritLogo from './CuritLogo';
import type { CategoryWithSites } from '../types';

interface FavoritesPageProps {
  websiteData: CategoryWithSites[];
  favoriteIds: Set<number>;
  userId: string | null;
  onToggleFavorite: (siteId: number) => void;
  onLoginRequired: () => void;
  onBack: () => void;
}

export default function FavoritesPage({ websiteData, favoriteIds, userId, onToggleFavorite, onLoginRequired, onBack }: FavoritesPageProps) {
  const [activeFilter, setActiveFilter] = useState('전체');
  const [searchTerm, setSearchTerm] = useState('');

  const favoritedData = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();
    return websiteData
      .map((group) => ({
        ...group,
        items: group.items.filter(
          (item) =>
            favoriteIds.has(item.id) &&
            (item.name.toLowerCase().includes(lowerSearch) ||
             (item.note && item.note.toLowerCase().includes(lowerSearch)))
        ),
      }))
      .filter(
        (group) =>
          (activeFilter === '전체' || group.name === activeFilter) &&
          group.items.length > 0
      );
  }, [websiteData, favoriteIds, searchTerm, activeFilter]);

  const availableCategories = useMemo(() => {
    return websiteData.filter((group) =>
      group.items.some((item) => favoriteIds.has(item.id))
    );
  }, [websiteData, favoriteIds]);

  const totalFavorites = Array.from(favoriteIds).length;

  return (
    <div className="bg-[#FFF5F7] min-h-screen text-slate-800">
      {/* 헤더 — curit 로고 포함 */}
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
                key={cat.id}
                onClick={() => setActiveFilter(cat.name)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 border ${
                  activeFilter === cat.name
                    ? 'bg-rose-400 text-white border-rose-400 shadow-md'
                    : 'bg-white text-pink-400 border-pink-100 hover:border-pink-300'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 pt-40 pb-40">
        {favoritedData.length === 0 ? (
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
          favoritedData.map((group) => (
            <section key={group.id} className="mt-16">
              <div className="flex items-center gap-4 mb-8 pb-4 border-b border-pink-100">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{group.name}</h3>
                <span className="text-pink-300 text-sm font-bold">{group.items.length}개</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {group.items.map((item) => (
                  <SiteCard
                    key={item.id}
                    item={item}
                    isFavorited={favoriteIds.has(item.id)}
                    userId={userId}
                    onToggleFavorite={onToggleFavorite}
                    onLoginRequired={onLoginRequired}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </main>
    </div>
  );
}