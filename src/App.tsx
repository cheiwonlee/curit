// ============================================================
// src/App.tsx — Supabase에서 데이터를 가져오는 메인 페이지
//
// 이전 버전과의 차이:
//   이전: import { websiteData } from './data/sites';  ← 하드코딩
//   지금: useEffect + supabase.from('sites').select()  ← DB에서 가져옴
//
// 새로 등장하는 개념:
//   useEffect: 컴포넌트가 화면에 나타날 때 "한 번" 실행하는 코드
//   → API 호출, 데이터 불러오기 등에 사용
//   → "페이지가 뜨면 DB에서 데이터 가져와" 라는 뜻
// ============================================================

import { useState, useEffect, useMemo } from 'react';
import SearchBar from './components/SearchBar';
import CategoryTabs from './components/CategoryTabs';
import SiteCard from './components/SiteCard';
import { supabase } from './lib/supabase';
import { CategoryRow, SiteItem, CategoryWithSites } from './types';

export default function App() {
  // ============================================================
  // 상태(State) 정의
  // ============================================================
  const [activeCategory, setActiveCategory] = useState('전체');
  const [searchTerm, setSearchTerm] = useState('');

  // DB에서 가져온 데이터를 저장할 상태
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [sites, setSites] = useState<SiteItem[]>([]);

  // 로딩 상태: 데이터를 가져오는 중인지
  const [loading, setLoading] = useState(true);

  // 에러 상태: 데이터 가져오기 실패 시
  const [error, setError] = useState<string | null>(null);

  // ============================================================
  // useEffect — 페이지가 처음 뜰 때 DB에서 데이터 가져오기
  //
  // useEffect(실행할함수, [의존성배열]);
  //   → 의존성 배열이 빈 배열 []이면: 처음 한 번만 실행
  //   → 의존성 배열에 값이 있으면: 그 값이 바뀔 때마다 실행
  //
  // async/await란?
  //   → DB에서 데이터를 가져오는 건 시간이 걸리는 작업
  //   → await = "이 작업이 끝날 때까지 기다려"
  //   → async = "이 함수 안에서 await를 쓸 거야"라는 선언
  // ============================================================
  useEffect(() => {
    async function fetchData() {
      try {
        // DB에서 카테고리 목록 가져오기 (sort_order 순으로 정렬)
        const { data: catData, error: catError } = await supabase
          .from('categories')
          .select('*')
          .order('sort_order');

        if (catError) throw catError;
        // throw: 에러를 던짐 → 아래 catch 블록으로 이동

        // DB에서 사이트 목록 가져오기 (sort_order 순으로 정렬)
        const { data: siteData, error: siteError } = await supabase
          .from('sites')
          .select('*')
          .order('sort_order');

        if (siteError) throw siteError;

        // 가져온 데이터를 상태에 저장
        setCategories(catData || []);
        setSites(siteData || []);
      } catch (err) {
        // 에러 발생 시 에러 메시지 저장
        setError('데이터를 불러오는 데 실패했습니다.');
        console.error(err);
      } finally {
        // 성공이든 실패든 로딩 상태 해제
        setLoading(false);
      }
    }

    fetchData();
  }, []);
  // ↑ [] 빈 배열: 컴포넌트가 처음 마운트될 때 한 번만 실행

  // ============================================================
  // 카테고리 + 사이트를 합쳐서 화면 표시용 데이터 만들기
  //
  // DB에서는 categories와 sites가 별도 테이블이지만,
  // 화면에 표시할 때는 "카테고리별로 사이트를 묶은" 형태가 필요함
  //
  // 이전 버전의 websiteData와 같은 구조로 변환:
  //   [{ name: "폰트...", slug: "font", items: [사이트1, 사이트2, ...] }]
  // ============================================================
  const websiteData: CategoryWithSites[] = useMemo(() => {
    return categories.map((cat) => ({
      ...cat,
      items: sites.filter((site) => site.category_id === cat.id),
      // ↑ 이 카테고리에 속하는 사이트만 필터링
    }));
  }, [categories, sites]);

  // ============================================================
  // 검색 + 카테고리 필터링 (이전 버전과 동일한 로직)
  // ============================================================
  const filteredData = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();

    return websiteData
      .map((group) => ({
        ...group,
        items: group.items.filter(
          (item) =>
            item.name.toLowerCase().includes(lowerSearch) ||
            (item.note && item.note.toLowerCase().includes(lowerSearch))
        ),
      }))
      .filter(
        (group) =>
          (activeCategory === '전체' || group.name === activeCategory) &&
          group.items.length > 0
      );
  }, [searchTerm, activeCategory, websiteData]);

  // ============================================================
  // 카테고리 선택 핸들러
  // ============================================================
  const handleCategorySelect = (category: string, id?: string) => {
    setActiveCategory(category);
    if (id) {
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) window.scrollTo({ top: el.offsetTop - 180, behavior: 'smooth' });
      }, 10);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // ============================================================
  // 로딩 화면 — DB에서 데이터를 가져오는 동안 표시
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
  // 에러 화면 — DB 연결 실패 시 표시
  // ============================================================
  if (error) {
    return (
      <div className="min-h-screen bg-[#FFF5F7] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 font-bold text-lg mb-2">오류 발생</p>
          <p className="text-slate-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // 메인 UI (이전 버전과 거의 동일)
  // ============================================================
  return (
    <div className="bg-[#FFF5F7] text-slate-800 selection:bg-pink-100 selection:text-pink-600 min-h-screen">

      {/* 네비게이션 */}
      <nav className="fixed top-0 inset-x-0 z-[100] glass-nav border-b border-pink-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div
              className="flex items-center gap-3 cursor-pointer shrink-0"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <div className="w-10 h-10 bg-gradient-to-tr from-pink-500 to-rose-400 rounded-xl flex items-center justify-center text-white shadow-lg shadow-pink-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <h1 className="text-2xl font-black text-pink-900 tracking-tighter lowercase">s archive</h1>
            </div>
            <SearchBar value={searchTerm} onChange={setSearchTerm} />
          </div>

          {/* CategoryTabs에 전달하는 데이터 형태를 맞춰줌 */}
          <CategoryTabs
            categories={websiteData.map((g) => ({
              category: g.name,
              id: g.slug,
              items: g.items.map((s) => ({ name: s.name, url: s.url, note: s.note || '' })),
            }))}
            activeCategory={activeCategory}
            onSelect={handleCategorySelect}
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
            <span className="text-xs font-black tracking-widest uppercase">Smart Curation for Productivity</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight mb-8 leading-[1.1]">
            당신의 워크플로우를 <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-rose-400">가장 감각적으로 연결합니다.</span>
          </h2>
          <p className="text-pink-400 text-lg font-medium leading-relaxed">
            비즈니스 트렌드부터 실물 경제 정보까지, 엄선된 큐레이션을 경험하세요.
            <br className="hidden md:block" />
            모든 카테고리와 설명이 통합된 최종 버전의 아카이브입니다.
          </p>
        </div>
      </header>

      {/* 메인 콘텐츠 — 카드 그리드 */}
      <main className="max-w-7xl mx-auto px-4 pb-40">
        {filteredData.length === 0 ? (
          <div className="py-40 text-center">
            <div className="w-24 h-24 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-8 text-pink-200">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
            <h3 className="text-2xl font-black text-slate-900">찾으시는 결과가 없네요</h3>
            <p className="text-pink-300 mt-3 font-medium">다른 카테고리를 둘러보거나 검색어를 확인해 주세요.</p>
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
                  <SiteCard key={item.id} item={{ name: item.name, url: item.url, note: item.note || '' }} />
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
            <a href="https://x.com/fr2e_u" target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center gap-4 hover:scale-105 transition-transform">
              <div className="w-12 h-12 rounded-full border border-pink-100 flex items-center justify-center text-pink-400 group-hover:text-pink-600 group-hover:border-pink-300 group-hover:bg-pink-50 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
                </svg>
              </div>
              <h5 className="text-xl font-black mb-1 tracking-tight text-pink-900 group-hover:text-pink-600 transition-colors">developed by @fr2e_u</h5>
            </a>
            <div className="h-px w-full max-w-[200px] bg-pink-100 my-2" />
            <p className="text-pink-300 text-xs font-bold tracking-[0.2em] uppercase">Curated for Excellence • 2026 Updated.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
