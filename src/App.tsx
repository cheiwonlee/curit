// ============================================================
// src/App.tsx — Phase 1+3+4: 정렬 드롭다운 + 사이트 등록 + 내 사이트
// ============================================================

import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from './lib/supabase';
import type { CategoryRow, SiteItem, CategoryWithSites, Profile } from './types';

import SearchBar from './components/SearchBar';
import CategoryTabs from './components/CategoryTabs';
import SiteCard from './components/SiteCard';
import AuthModal from './components/AuthModal';
import NavButtons from './components/NavButtons';
import MyPage from './components/MyPage';
import SignupPage from './components/SignupPage';
import FavoritesPage from './components/FavoritesPage';
import SortDropdown from './components/SortDropdown';
import SiteRequestPage from './components/SiteRequestPage';
import MySitesPage from './components/MySitesPage';
import ScrollToTopButton from './components/ScrollToTopButton';
import { useActiveSection } from './hooks/useActiveSection';

import type { SortMode } from './components/SortDropdown';

export default function App() {
  // ============================================================
  // 상태(State)
  // ============================================================
  const [searchTerm, setSearchTerm] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('category');

  // DB 데이터
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [sites, setSites] = useState<SiteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 인증 관련
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authProvider, setAuthProvider] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  // UI 상태
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showMyPage, setShowMyPage] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showSiteRequest, setShowSiteRequest] = useState(false);
  const [showMySites, setShowMySites] = useState(false);
  const [loginRedirect, setLoginRedirect] = useState<'mypage' | 'bookmarks' | 'mysites' | null>(null);

  // 즐겨찾기
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());

  // ============================================================
  // 데이터 로딩
  // ============================================================
  useEffect(() => {
    async function fetchData() {
      try {
        const { data: catData } = await supabase.from('categories').select('*').order('sort_order');
        const { data: siteData } = await supabase.from('sites').select('*').order('sort_order');
        setCategories(catData || []);
        setSites(siteData || []);
      } catch (err) {
        setError('데이터 로딩 실패');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // ============================================================
  // 인증 (교착 방지: onAuthStateChange에서 await 금지)
  // ============================================================
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (window.location.hash && window.location.hash.includes('access_token')) {
          window.history.replaceState({}, '', window.location.pathname);
        }
        if (session?.user) {
          setUserId(session.user.id);
          setUserEmail(session.user.email || null);
          setAuthProvider(session.user.app_metadata?.provider || 'email');
        } else {
          setUserId(null); setUserEmail(null); setAuthProvider(null);
          setProfile(null); setFavoriteIds(new Set());
        }
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  // userId 변경 시 프로필+즐겨찾기 로드
  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      try {
        const { data: p } = await supabase.from('profiles').select('*').eq('id', userId).single();
        if (p) setProfile(p);
      } catch (e) { console.log('프로필 없음'); }
      try {
        const { data: f } = await supabase.from('favorites').select('site_id').eq('user_id', userId);
        if (f) setFavoriteIds(new Set(f.map((x) => x.site_id)));
      } catch (e) { console.log('즐겨찾기 없음'); }

      if (loginRedirect === 'mypage') { setShowMyPage(true); setLoginRedirect(null); }
      else if (loginRedirect === 'bookmarks') { setShowFavorites(true); setLoginRedirect(null); }
      else if (loginRedirect === 'mysites') { setShowMySites(true); setLoginRedirect(null); }
    };
    load();
  }, [userId]);

  // ============================================================
  // 브라우저 뒤로가기
  // ============================================================
  useEffect(() => {
    const handle = () => {
      const h = window.location.hash;
      setShowMyPage(h === '#mypage');
      setShowFavorites(h === '#bookmarks');
      setShowSignup(h === '#signup');
      setShowSiteRequest(h === '#request');
      setShowMySites(h === '#mysites');
      if (!h || h === '#') setShowAuthModal(false);
    };
    window.addEventListener('popstate', handle);
    return () => window.removeEventListener('popstate', handle);
  }, []);

  // ============================================================
  // 즐겨찾기 토글
  // ============================================================
  const handleToggleFavorite = useCallback((siteId: number) => {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(siteId)) next.delete(siteId); else next.add(siteId);
      return next;
    });
  }, []);

  // ============================================================
  // 데이터 결합 + 검색 + 정렬
  // ============================================================
  const websiteData: CategoryWithSites[] = useMemo(() => {
    return categories.map((cat) => ({
      ...cat,
      items: sites.filter((site) => site.category_id === cat.id),
    }));
  }, [categories, sites]);

  const filteredData = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();
    let result = websiteData
      .map((group) => ({
        ...group,
        items: group.items.filter(
          (item) =>
            !lowerSearch ||
            item.name.toLowerCase().includes(lowerSearch) ||
            (item.note && item.note.toLowerCase().includes(lowerSearch)) ||
            (item.tags && item.tags.toLowerCase().includes(lowerSearch))
        ),
      }))
      .filter((group) => group.items.length > 0);

    if (sortMode !== 'category') {
      const allItems = result.flatMap((g) => g.items);
      if (sortMode === 'asc') allItems.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
      else if (sortMode === 'desc') allItems.sort((a, b) => b.name.localeCompare(a.name, 'ko'));
      else if (sortMode === 'recent') allItems.sort((a, b) => b.id - a.id);

      const label = sortMode === 'asc' ? '가나다순 (ㄱ→ㅎ)' : sortMode === 'desc' ? '가나다순 (ㅎ→ㄱ)' : '최근 등록순';
      result = [{ id: 0, name: label, slug: 'sorted', sort_order: 0, items: allItems }];
    }
    return result;
  }, [searchTerm, websiteData, sortMode]);

  const sectionSlugs = useMemo(() => websiteData.map((g) => g.slug), [websiteData]);
  const activeSectionId = useActiveSection(sectionSlugs);
  const isLoggedIn = !!userId;

  // 페이지 이동 헬퍼
  const goTo = (page: string, setter: (v: boolean) => void) => {
    setter(true);
    window.history.pushState({}, '', '#' + page);
  };
  const goHome = (setter: (v: boolean) => void) => {
    setter(false);
    window.history.pushState({}, '', window.location.pathname);
  };

  // ============================================================
  // 로딩/에러
  // ============================================================
  if (loading) return (
    <div className="min-h-screen bg-[#FFF5F7] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-pink-400 font-medium">로딩 중...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#FFF5F7] flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-500 font-bold text-lg mb-2">오류 발생</p>
        <p className="text-slate-500">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors">다시 시도</button>
      </div>
    </div>
  );

  // ============================================================
  // 서브 페이지들
  // ============================================================
  if (showSignup) return (
    <SignupPage
      onBack={() => { goHome(setShowSignup); setShowAuthModal(true); }}
      onComplete={() => { goHome(setShowSignup); window.location.reload(); }}
    />
  );

  if (showMyPage) return (
    <MyPage profile={profile} userEmail={userEmail} authProvider={authProvider}
      onBack={() => goHome(setShowMyPage)}
      onProfileUpdate={(p) => setProfile(p)} />
  );

  if (showFavorites) return (
    <FavoritesPage websiteData={websiteData} favoriteIds={favoriteIds} userId={userId}
      onToggleFavorite={handleToggleFavorite}
      onLoginRequired={() => setShowAuthModal(true)}
      onBack={() => goHome(setShowFavorites)} />
  );

  if (showSiteRequest) return (
    <SiteRequestPage categories={categories} userId={userId}
      onBack={() => goHome(setShowSiteRequest)} />
  );

  if (showMySites && userId) return (
    <MySitesPage userId={userId}
      onBack={() => goHome(setShowMySites)} />
  );

  // ============================================================
  // 메인 UI
  // ============================================================
  return (
    <div className="bg-[#FFF5F7] text-slate-800 selection:bg-pink-100 selection:text-pink-600 min-h-screen">
      <AuthModal isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSignupClick={() => goTo('signup', setShowSignup)} />

      {/* 네비게이션 */}
      <nav className="fixed top-0 inset-x-0 z-[100] glass-nav border-b border-pink-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex items-center gap-3 cursor-pointer shrink-0"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="w-10 h-10 bg-gradient-to-tr from-pink-500 to-rose-400 rounded-xl flex items-center justify-center text-white shadow-lg shadow-pink-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <h1 className="text-2xl font-black text-pink-900 tracking-tighter lowercase">curit</h1>
            </div>

            <SearchBar value={searchTerm} onChange={setSearchTerm} />

            <NavButtons isLoggedIn={isLoggedIn}
              onLoginClick={() => setShowAuthModal(true)}
              onMyPageClick={() => {
                if (isLoggedIn) goTo('mypage', setShowMyPage);
                else { setLoginRedirect('mypage'); setShowAuthModal(true); }
              }}
              onBookmarksClick={() => {
                if (isLoggedIn) goTo('bookmarks', setShowFavorites);
                else { setLoginRedirect('bookmarks'); setShowAuthModal(true); }
              }}
              onMySitesClick={() => {
                if (isLoggedIn) goTo('mysites', setShowMySites);
                else { setLoginRedirect('mysites'); setShowAuthModal(true); }
              }}
            />
          </div>

          {/* 정렬 드롭다운 + 카테고리 탭 */}
          <div className="flex items-center gap-2 mt-4">
            <SortDropdown value={sortMode} onChange={setSortMode} />
            {sortMode === 'category' && (
              <div className="flex-1 overflow-hidden">
                <CategoryTabs
                  categories={websiteData.map((g) => ({ name: g.name, slug: g.slug }))}
                  activeSectionId={activeSectionId}
                />
              </div>
            )}
            {sortMode !== 'category' && (
              <span className="text-xs text-pink-300 font-medium">
                {sortMode === 'asc' ? 'ㄱ→ㅎ 순으로 정렬됨' : sortMode === 'desc' ? 'ㅎ→ㄱ 순으로 정렬됨' : '최근 등록된 순으로 정렬됨'}
              </span>
            )}
          </div>
        </div>
      </nav>

      {/* 히어로 */}
      <header className="pt-48 md:pt-72 pb-20 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 mb-8 px-5 py-2 bg-pink-100/50 rounded-full text-pink-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="animate-pulse">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            <span className="text-xs font-black tracking-widest uppercase">Curated Links, Smarter Workflow</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight mb-8 leading-[1.1]">
            쓸만한 사이트, <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-rose-400">여기 다 큐릿했어요.</span>
          </h2>
          <p className="text-pink-400 text-lg font-medium leading-relaxed">
            디자인, 취업, 부동산, 재테크까지 — 흩어진 좋은 사이트들을 한곳에.
            <br className="hidden md:block" />
            검색하고, 즐겨찾기하고, 나만의 링크 컬렉션을 만들어보세요.
          </p>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 pb-40">
        {filteredData.length === 0 ? (
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
                  <SiteCard key={item.id} item={item}
                    isFavorited={favoriteIds.has(item.id)} userId={userId}
                    onToggleFavorite={handleToggleFavorite}
                    onLoginRequired={() => setShowAuthModal(true)} />
                ))}
              </div>
            </section>
          ))
        )}
      </main>

      <ScrollToTopButton />

      {/* 푸터 */}
      <footer className="bg-white border-t border-pink-100">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h4 className="font-bold text-sm text-slate-900 mb-4">서비스</h4>
              <ul className="space-y-2.5">
                <li><button onClick={() => goTo('request', setShowSiteRequest)} className="text-sm text-slate-400 hover:text-pink-500 transition-colors">사이트 등록 신청</button></li>
                <li><a href="mailto:sarah0w0@naver.com?subject=[curit] 문의" className="text-sm text-slate-400 hover:text-pink-500 transition-colors">문의하기</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 mb-4">법적 고지</h4>
              <ul className="space-y-2.5">
                <li><span className="text-sm text-slate-400">개인정보 처리방침</span></li>
                <li><span className="text-sm text-slate-400">이용약관</span></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 mb-4">문의</h4>
              <ul className="space-y-2.5">
                <li><a href="mailto:sarah0w0@naver.com" className="text-sm text-slate-400 hover:text-pink-500 transition-colors">sarah0w0@naver.com</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 mb-4">curit</h4>
              <p className="text-sm text-slate-400 leading-relaxed">쓸만한 사이트,<br/>여기 다 큐릿했어요.</p>
            </div>
          </div>
          <div className="border-t border-pink-50 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-pink-300 text-xs font-bold">© 2026 curit. All rights reserved.</p>
            <p className="text-pink-200 text-xs">당신의 북마크를 큐레이션합니다.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}