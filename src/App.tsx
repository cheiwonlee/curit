// ============================================================
// src/App.tsx — 메인 페이지 (curit 브랜딩 적용)
// ============================================================

import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from './lib/supabase';
import type { CategoryRow, SiteItem, CategoryWithSites, Profile } from './types';

import SearchBar from './components/SearchBar';
import CategoryTabs from './components/CategoryTabs';
import SiteCard from './components/SiteCard';
import AuthModal from './components/AuthModal';
import ProfileMenu from './components/ProfileMenu';
import FavoritesPage from './components/FavoritesPage';
import { useActiveSection } from './hooks/useActiveSection';

export default function App() {
  // ============================================================
  // 상태(State)
  // ============================================================
  const [searchTerm, setSearchTerm] = useState('');

  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [sites, setSites] = useState<SiteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [showFavorites, setShowFavorites] = useState(false);

  // ============================================================
  // 데이터 로딩
  // ============================================================
  useEffect(() => {
    async function fetchData() {
      try {
        const { data: catData, error: catError } = await supabase
          .from('categories').select('*').order('sort_order');
        if (catError) throw catError;

        const { data: siteData, error: siteError } = await supabase
          .from('sites').select('*').order('sort_order');
        if (siteError) throw siteError;

        setCategories(catData || []);
        setSites(siteData || []);
      } catch (err) {
        setError('데이터를 불러오는 데 실패했습니다.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // ============================================================
  // 인증 상태 감지
  // ============================================================
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id);
        loadProfile(session.user.id);
        loadFavorites(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
        loadProfile(session.user.id);
        loadFavorites(session.user.id);
      } else {
        setUserId(null);
        setProfile(null);
        setFavoriteIds(new Set());
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (uid: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', uid).single();
    if (data) setProfile(data);
  };

  const loadFavorites = async (uid: string) => {
    const { data } = await supabase.from('favorites').select('site_id').eq('user_id', uid);
    if (data) {
      setFavoriteIds(new Set(data.map((f) => f.site_id)));
    }
  };

  // ============================================================
  // 즐겨찾기 토글
  // ============================================================
  const handleToggleFavorite = useCallback((siteId: number) => {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(siteId)) next.delete(siteId);
      else next.add(siteId);
      return next;
    });
  }, []);

  // ============================================================
  // 데이터 결합 + 검색 필터링 (tags 포함)
  // ============================================================
  const websiteData: CategoryWithSites[] = useMemo(() => {
    return categories.map((cat) => ({
      ...cat,
      items: sites.filter((site) => site.category_id === cat.id),
    }));
  }, [categories, sites]);

  const filteredData = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();
    if (!lowerSearch) return websiteData;

    return websiteData
      .map((group) => ({
        ...group,
        items: group.items.filter(
          (item) =>
            item.name.toLowerCase().includes(lowerSearch) ||
            (item.note && item.note.toLowerCase().includes(lowerSearch)) ||
            (item.tags && item.tags.toLowerCase().includes(lowerSearch))
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [searchTerm, websiteData]);

  // ============================================================
  // Intersection Observer
  // ============================================================
  const sectionSlugs = useMemo(() => websiteData.map((g) => g.slug), [websiteData]);
  const activeSectionId = useActiveSection(sectionSlugs);

  // ============================================================
  // 로딩 화면
  // ============================================================
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF5F7] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-pink-400 font-medium">로딩 중...</p>
        </div>
      </div>
    );
  }

  // ============================================================
  // 에러 화면
  // ============================================================
  if (error) {
    return (
      <div className="min-h-screen bg-[#FFF5F7] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 font-bold text-lg mb-2">오류 발생</p>
          <p className="text-slate-500">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors">
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // 즐겨찾기함 페이지
  // ============================================================
  if (showFavorites) {
    return (
      <FavoritesPage
        websiteData={websiteData}
        favoriteIds={favoriteIds}
        userId={userId}
        onToggleFavorite={handleToggleFavorite}
        onLoginRequired={() => setShowAuthModal(true)}
        onBack={() => setShowFavorites(false)}
      />
    );
  }

  // ============================================================
  // 메인 UI — curit 브랜딩 적용
  // ============================================================
  return (
    <div className="bg-[#FFF5F7] text-slate-800 selection:bg-pink-100 selection:text-pink-600 min-h-screen">

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      {/* ====================================================
          네비게이션 — 로고를 "curit"으로 변경
      ==================================================== */}
      <nav className="fixed top-0 inset-x-0 z-[100] glass-nav border-b border-pink-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center gap-4">
            {/* 로고: curit */}
            <div
              className="flex items-center gap-3 cursor-pointer shrink-0"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <div className="w-10 h-10 bg-gradient-to-tr from-pink-500 to-rose-400 rounded-xl flex items-center justify-center text-white shadow-lg shadow-pink-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <h1 className="text-2xl font-black text-pink-900 tracking-tighter lowercase">curit</h1>
            </div>

            {/* 검색바: 플레이스홀더 변경 */}
            <SearchBar value={searchTerm} onChange={setSearchTerm} />

            {/* 프로필 메뉴 */}
            <ProfileMenu
              profile={profile}
              onLoginClick={() => setShowAuthModal(true)}
              onFavoritesClick={() => setShowFavorites(true)}
            />
          </div>

          <CategoryTabs
            categories={websiteData.map((g) => ({ name: g.name, slug: g.slug }))}
            activeSectionId={activeSectionId}
          />
        </div>
      </nav>

      {/* ====================================================
          히어로 헤더 — curit 문구
      ==================================================== */}
      <header className="pt-40 md:pt-64 pb-20 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          {/* 배지: Curated Links, Smarter Workflow */}
          <div className="inline-flex items-center gap-2 mb-8 px-5 py-2 bg-pink-100/50 rounded-full text-pink-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="animate-pulse">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            <span className="text-xs font-black tracking-widest uppercase">Curated Links, Smarter Workflow</span>
          </div>

          {/* 타이틀: 쓸만한 사이트, 여기 다 큐릿했어요. */}
          <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight mb-8 leading-[1.1]">
            쓸만한 사이트, <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-rose-400">여기 다 큐릿했어요.</span>
          </h2>

          {/* 설명 */}
          <p className="text-pink-400 text-lg font-medium leading-relaxed">
            디자인, 취업, 부동산, 재테크까지 — 흩어진 좋은 사이트들을 한곳에.
            <br className="hidden md:block" />
            검색하고, 즐겨찾기하고, 나만의 링크 컬렉션을 만들어보세요.
          </p>
        </div>
      </header>

      {/* ====================================================
          메인 콘텐츠 — 카드 그리드
      ==================================================== */}
      <main className="max-w-7xl mx-auto px-4 pb-40">
        {filteredData.length === 0 ? (
          /* 빈 상태: curit 문구 */
          <div className="py-40 text-center">
            <div className="w-24 h-24 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-8 text-pink-200">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
            <h3 className="text-2xl font-black text-slate-900">앗, 아직 큐릿되지 않은 키워드예요.</h3>
            <p className="text-pink-300 mt-3 font-medium">다른 키워드로 검색하거나 카테고리를 둘러보세요.</p>
          </div>
        ) : (
          filteredData.map((group) => (
            <section key={group.id} id={group.slug} className="scroll-mt-56 mt-20">
              <div className="flex items-center gap-4 mb-10 pb-4 border-b border-pink-100">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">{group.name}</h3>
                <span className="text-pink-300 text-sm font-bold">{group.items.length} 리소스</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {group.items.map((item) => (
                  <SiteCard
                    key={item.id}
                    item={item}
                    isFavorited={favoriteIds.has(item.id)}
                    userId={userId}
                    onToggleFavorite={handleToggleFavorite}
                    onLoginRequired={() => setShowAuthModal(true)}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </main>

      {/* ====================================================
          푸터 — curit 문구
      ==================================================== */}
      <footer className="bg-white border-t border-pink-100 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex flex-col items-center gap-6">
            <a href="https://x.com/fr2e_u" target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center gap-4 hover:scale-105 transition-transform">
              <div className="w-12 h-12 rounded-full border border-pink-100 flex items-center justify-center text-pink-400 group-hover:text-pink-600 group-hover:border-pink-300 group-hover:bg-pink-50 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
                </svg>
              </div>
              <h5 className="text-xl font-black mb-1 tracking-tight text-pink-900 group-hover:text-pink-600 transition-colors">developed by @fr2e_u</h5>
            </a>
            <div className="h-px w-full max-w-[200px] bg-pink-100 my-2" />
            <p className="text-pink-300 text-xs font-bold tracking-[0.2em] uppercase">curit — 당신의 북마크를 큐레이션합니다.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}