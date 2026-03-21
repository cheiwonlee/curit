// ============================================================
// src/components/SiteRequestPage.tsx — 사이트 등록 신청
//
// 두 가지 버전:
//   버전1: 직접 입력 (사이트 링크, 이름, 카테고리, 설명)
//   버전2: 추천글 링크만 입력 (트윗 등)
// 또는 이메일로 신청 가능
// ============================================================

import { useState } from 'react';
import { supabase } from '../lib/supabase';
import CuritLogo from './CuritLogo';
import type { CategoryRow } from '../types';

interface SiteRequestPageProps {
  categories: CategoryRow[];
  userId: string | null;
  onBack: () => void;
}

export default function SiteRequestPage({ categories, userId, onBack }: SiteRequestPageProps) {
  const [mode, setMode] = useState<'form1' | 'form2'>('form1');

  // 버전1 필드
  const [siteUrl, setSiteUrl] = useState('');
  const [siteName, setSiteName] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [description, setDescription] = useState('');

  // 버전2 필드
  const [sourceUrl, setSourceUrl] = useState('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================================
  // 폼 제출
  // ============================================================
  const handleSubmit = async () => {
    if (mode === 'form1' && !siteUrl.trim()) {
      setError('사이트 링크를 입력해주세요.');
      return;
    }
    if (mode === 'form2' && !sourceUrl.trim()) {
      setError('추천글 링크를 입력해주세요.');
      return;
    }

    setLoading(true);
    setError(null);

    const { error: insertError } = await supabase.from('site_requests').insert({
      user_id: userId,
      site_url: mode === 'form1' ? siteUrl.trim() : '',
      site_name: mode === 'form1' ? siteName.trim() || null : null,
      category_id: mode === 'form1' ? categoryId : null,
      description: mode === 'form1' ? description.trim() || null : null,
      source_url: mode === 'form2' ? sourceUrl.trim() : null,
    });

    if (insertError) {
      setError('신청 중 오류가 발생했습니다.');
      console.error(insertError);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  // ============================================================
  // 이메일로 신청
  // ============================================================
  const handleEmailRequest = () => {
    const subject = encodeURIComponent('[curit] 사이트 등록 신청');
    const body = encodeURIComponent(
      '사이트 링크: \n사이트명: \n카테고리: \n간단한 설명: \n'
    );
    window.location.href = `mailto:sarah0w0@naver.com?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen bg-[#FFF5F7] text-slate-800">
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
            <h2 className="text-lg font-bold text-pink-900">사이트 등록 신청</h2>
          </div>
        </div>
      </div>

      <main className="max-w-lg mx-auto px-4 pt-28 pb-40">
        {success ? (
          /* 성공 화면 */
          <div className="bg-white rounded-3xl p-8 shadow-lg border border-pink-50 text-center">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-3">신청 완료!</h3>
            <p className="text-slate-500 text-sm mb-6">검토 후 반영하겠습니다. 감사합니다.</p>
            <button onClick={onBack} className="px-6 py-3 bg-pink-500 text-white rounded-2xl font-bold hover:bg-pink-600 transition-colors">
              홈으로 돌아가기
            </button>
          </div>
        ) : (
          <>
            {/* 신청 방식 선택 */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-pink-50 mb-6">
              <h3 className="text-lg font-black text-slate-900 mb-4">신청 방식을 선택해주세요</h3>
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setMode('form1')}
                  className={`flex-1 py-3 rounded-2xl text-sm font-bold transition-all ${
                    mode === 'form1' ? 'bg-pink-500 text-white' : 'bg-pink-50 text-pink-400'
                  }`}
                >
                  직접 입력
                </button>
                <button
                  onClick={() => setMode('form2')}
                  className={`flex-1 py-3 rounded-2xl text-sm font-bold transition-all ${
                    mode === 'form2' ? 'bg-pink-500 text-white' : 'bg-pink-50 text-pink-400'
                  }`}
                >
                  추천글 링크
                </button>
              </div>

              {/* 버전1: 직접 입력 */}
              {mode === 'form1' && (
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">사이트 링크 <span className="text-pink-500">*</span></label>
                    <input
                      type="url"
                      placeholder="https://example.com"
                      value={siteUrl}
                      onChange={(e) => setSiteUrl(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:border-pink-300 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">사이트명 (선택)</label>
                    <input
                      type="text"
                      placeholder="사이트 이름"
                      value={siteName}
                      onChange={(e) => setSiteName(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:border-pink-300 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">카테고리 (선택)</label>
                    <select
                      value={categoryId || ''}
                      onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:border-pink-300 transition-colors"
                    >
                      <option value="">카테고리 선택</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">간단한 설명 (선택)</label>
                    <textarea
                      placeholder="이 사이트가 유용한 이유를 알려주세요"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:border-pink-300 transition-colors resize-none"
                    />
                  </div>
                </div>
              )}

              {/* 버전2: 추천글 링크 */}
              {mode === 'form2' && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">추천글 링크 <span className="text-pink-500">*</span></label>
                  <input
                    type="url"
                    placeholder="트윗, 블로그 글 등의 URL"
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:border-pink-300 transition-colors"
                  />
                  <p className="text-xs text-slate-400 mt-2">사이트를 추천하는 글의 링크를 붙여넣어 주세요.</p>
                </div>
              )}

              {error && <p className="text-red-500 text-xs mt-4 text-center font-medium">{error}</p>}

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-3 bg-pink-500 text-white rounded-2xl font-bold hover:bg-pink-600 transition-colors disabled:opacity-50 mt-6"
              >
                {loading ? '신청 중...' : '신청하기'}
              </button>
            </div>

            {/* 이메일로 신청 */}
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-pink-50 text-center">
              <p className="text-sm text-slate-400 mb-3">또는 이메일로 직접 신청할 수 있어요.</p>
              <button
                onClick={handleEmailRequest}
                className="px-6 py-2.5 bg-white border border-pink-200 text-pink-500 rounded-2xl text-sm font-bold hover:bg-pink-50 transition-colors"
              >
                이메일로 신청하기
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}