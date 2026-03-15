// ============================================================
// src/App.tsx — 메인 페이지 (인증 상태 관리 수정)
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
import { useActiveSection } from './hooks/useActiveSection';

export default function App() {
  // ============================================================
  // 상태(State)
  // ============================================================
  const [searchTerm, setSearchTerm] = useState('');

  // DB 데이터
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [sites, setSites] = useState<SiteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 인증 관련
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [authLoading, setAuthLoading] = useState(true); // 인증 상태 확인 중

  // UI 상태
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showMyPage, setShowMyPage] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);

  // 즐겨찾기
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());

  // ============================================================
  // 데이터 로딩 (카테고리 + 사이트)
  // 1. 데이터 로딩 및 동기화 (Supabase 연동)
  // 이 코드는 앱이 시작되자마자 Supabase DB에서 categories와 sites 테이블의 데이터를 가져옵니다.
  // useEffect: 컴포넌트 마운트 시 한 번 실행되며, 카테고리와 사이트 목록을 각각 가져와 상태(setCategories, setSites)에 저장합니다.
  // 에러 핸들링: 데이터를 불러오는 동안 로딩 스피너를 보여주고, 실패할 경우 에러 메시지와 함께 '다시 시도' 버튼을 띄우는 예외 처리가 잘 되어 있습니다.
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
  // 2. 정교한 인증(Authentication) 관리
  // 사용자의 로그인 상태를 단순히 한 번 확인하는 것에 그치지 않고, 세션의 유지와 변화를 실시간으로 감지합니다.
  
  // - 초기 세션 확인 (initAuth): 페이지가 새로고침될 때 현재 로그인된 사용자가 있는지 확인하고, 있다면 프로필과 즐겨찾기 목록을 즉시 로드합니다.
  // - 실시간 상태 구독 (onAuthStateChange): 사용자가 로그인하거나 로그아웃하는 이벤트를 감지하여 userId, profile, favoriteIds 등을 실시간으로 업데이트합니다.
  // - authLoading 상태: 인증 정보가 확인되기 전까지는 로그인 여부를 판단하지 않도록 하여, 깜빡임 현상이나 잘못된 접근을 방지합니다.

  // ============================================================
  useEffect(() => {
    // 1. 현재 세션 확인 (페이지 새로고침 시)
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      console.log('세션 확인:', session);
      console.log('유저:', session?.user?.email);

      if (session?.user) {
        setUserId(session.user.id);
        setUserEmail(session.user.email || null);
        await loadProfile(session.user.id);
        await loadFavorites(session.user.id);
      }
      setAuthLoading(false); // 인증 확인 완료
    };

    initAuth();

    // 2. 인증 상태 변화 구독 (로그인/로그아웃 시)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event); // 디버깅용

        if (session?.user) {
          setUserId(session.user.id);
          setUserEmail(session.user.email || null);
          await loadProfile(session.user.id);
          await loadFavorites(session.user.id);
        } else {
          setUserId(null);
          setUserEmail(null);
          setProfile(null);
          setFavoriteIds(new Set());
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // 프로필 로드
  const loadProfile = async (uid: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', uid)
      .single();
    if (data) setProfile(data);
  };

  // 즐겨찾기 목록 로드
  const loadFavorites = async (uid: string) => {
    const { data } = await supabase
      .from('favorites')
      .select('site_id')
      .eq('user_id', uid);
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
  // 데이터 결합 + 검색 필터링

  // 3. 데이터 결합 및 검색 필터링
  // DB에서 가져온 원본 데이터를 사용자에게 보여주기 적합한 형태로 가공하는 과정입니다.

  // - websiteData (useMemo): 카테고리와 사이트 데이터를 결합하여, 각 카테고리 내에 해당 사이트들이 배열로 들어있는 트리 구조를 만듭니다.
  // - filteredData (useMemo): 검색어(searchTerm)가 입력되면 사이트의 이름, 노트, 태그를 대소문자 구분 없이 검색하여 실시간으로 결과를 걸러냅니다.
  // - 효율성: useMemo를 사용해 검색어나 원본 데이터가 바뀔 때만 다시 계산하도록 최적화되어 있습니다.

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

  // Intersection Observer
  const sectionSlugs = useMemo(() => websiteData.map((g) => g.slug), [websiteData]);
  const activeSectionId = useActiveSection(sectionSlugs);

  // ============================================================
  // 로그인 여부 (authLoading이 끝난 후에만 판단)
  // ============================================================
  const isLoggedIn = !authLoading && !!userId;

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

  if (error) {
    return (
      <div className="min-h-screen bg-[#FFF5F7] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 font-bold text-lg mb-2">오류 발생</p>
          <p className="text-slate-500">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors">다시 시도</button>
        </div>
      </div>
    );
  }

  // ============================================================
  // 회원가입 페이지
  // ============================================================
  if (showSignup) {
    return (
      <SignupPage
        onBack={() => { setShowSignup(false); setShowAuthModal(true); }}
        onComplete={() => { setShowSignup(false); window.location.reload(); }}
      />
    );
  }

  // ============================================================
  // 마이페이지
  // ============================================================
  if (showMyPage) {
    return (
      <MyPage
        profile={profile}
        userEmail={userEmail}
        onBack={() => setShowMyPage(false)}
      />
    );
  }

  // ============================================================
  // 북마크함 (즐겨찾기)
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
  // 메인 UI
  // ============================================================
  return (
    <div className="bg-[#FFF5F7] text-slate-800 selection:bg-pink-100 selection:text-pink-600 min-h-screen">

      {/* 로그인 모달 */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSignupClick={() => setShowSignup(true)}
      />

      {/* 네비게이션 */}
      <nav className="fixed top-0 inset-x-0 z-[100] glass-nav border-b border-pink-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center gap-4">
            {/* 로고 */}
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

            {/* 검색바 */}
            <SearchBar value={searchTerm} onChange={setSearchTerm} />

            {/* 네비게이션 버튼들 */}
            <NavButtons
              isLoggedIn={isLoggedIn}
              onLoginClick={() => setShowAuthModal(true)}
              onMyPageClick={() => setShowMyPage(true)}
              onBookmarksClick={() => setShowFavorites(true)}
            />
          </div>

          {/* 카테고리 탭 */}
          <CategoryTabs
            categories={websiteData.map((g) => ({ name: g.name, slug: g.slug }))}
            activeSectionId={activeSectionId}
          />
        </div>
      </nav>

      {/* 히어로 헤더 */}
      <header className="pt-40 md:pt-64 pb-20 px-6 text-center">
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

      {/* 푸터 */}
      <footer className="bg-white border-t border-pink-100 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex flex-col items-center gap-6">
            <p className="text-pink-300 text-xs font-bold tracking-[0.2em] uppercase">curit — 당신의 북마크를 큐레이션합니다.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}