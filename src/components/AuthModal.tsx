// ============================================================
// src/components/AuthModal.tsx — 로그인 모달
//
// 기능:
//   - Google OAuth 로그인 (앱 내 브라우저 감지)
//   - 아이디/이메일 + 비밀번호 로그인
//   - 회원가입 페이지 이동
//   - 계정 찾기 페이지 이동
// ============================================================

import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignupClick: () => void;
  onFindAccountClick: () => void;
}

export default function AuthModal({ isOpen, onClose, onSignupClick, onFindAccountClick }: AuthModalProps) {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // ============================================================
  // 소셜 로그인 (앱 내 브라우저 감지 포함)
  // ============================================================
  const handleSocialLogin = async (provider: 'google') => {
    const ua = navigator.userAgent.toLowerCase();
    const isInAppBrowser = /kakaotalk|instagram|fbav|fban|line|naver|daum|twitterbot/i.test(ua);

    if (isInAppBrowser) {
      if (/kakaotalk/i.test(ua)) {
        window.location.href = 'kakaotalk://web/openExternal?url=' + encodeURIComponent(window.location.href);
      } else {
        alert('앱 내 브라우저에서는 Google 로그인이 지원되지 않습니다.\n\n우측 상단 메뉴(⋯)에서 "기본 브라우저로 열기"를 선택해주세요.');
      }
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin,
        queryParams: { prompt: 'select_account' },
      },
    });
    if (error) setError(error.message);
    setLoading(false);
  };

  // ============================================================
  // 아이디/이메일 + 비밀번호 로그인
  // ============================================================
  const handleLogin = async () => {
    if (!loginId || !password) {
      setError('아이디(또는 이메일)와 비밀번호를 입력해주세요.');
      return;
    }

    setLoading(true);
    setError(null);

    let email = loginId;

    // @가 없으면 아이디로 간주 → DB에서 이메일 조회
    if (!loginId.includes('@')) {
      const { data: foundEmail, error: rpcError } = await supabase.rpc(
        'get_email_by_username',
        { username_input: loginId }
      );

      if (rpcError || !foundEmail) {
        setError('존재하지 않는 아이디입니다.');
        setLoading(false);
        return;
      }

      email = foundEmail;
    }

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setError('아이디(이메일) 또는 비밀번호가 올바르지 않습니다.');
    } else {
      window.location.href = window.location.pathname;
    }
    setLoading(false);
  };

  // ============================================================
  // UI
  // ============================================================
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-3xl p-8 w-full max-w-md mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>

        {/* 로고 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-pink-900 tracking-tighter lowercase mb-2">curit</h1>
          <p className="text-pink-300 text-sm font-medium">쓸만한 사이트, 여기 다 큐릿했어요</p>
        </div>

        {/* 소셜 로그인 */}
        {/* 소셜 로그인 — 앱 내 브라우저에서는 숨김 */}
        {!/kakaotalk|instagram|fbav|fban|line|naver|daum/i.test(navigator.userAgent) ? (
          <div className="flex flex-col gap-3 mb-6">
            <button onClick={() => handleSocialLogin('google')} disabled={loading}
              className="flex items-center justify-center gap-3 w-full py-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors font-medium text-sm">
              <svg width="18" height="18" viewBox="0 0 24 24">...</svg>
              Google로 계속
            </button>
          </div>
        ) : (
          <div className="mb-6 p-3 bg-yellow-50 rounded-2xl text-center">
            <p className="text-xs text-yellow-700 font-medium">
              앱 내 브라우저에서는 Google 로그인이 제한됩니다.
            </p>
            <p className="text-[10px] text-yellow-500 mt-1">
              이메일로 로그인하거나, 외부 브라우저에서 접속해주세요.
            </p>
          </div>
        )}

        {/* 구분선 */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs text-slate-400 font-medium">또는</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {/* 아이디/이메일 로그인 */}
        <div className="flex flex-col gap-3 mb-4">
          <input
            type="text"
            placeholder="아이디 또는 이메일"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:border-pink-300"
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:border-pink-300"
          />
        </div>

        {error && <p className="text-red-500 text-xs mb-4 text-center">{error}</p>}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-3 bg-pink-500 text-white rounded-2xl font-bold hover:bg-pink-600 transition-colors disabled:opacity-50"
        >
          {loading ? '로그인 중...' : '로그인'}
        </button>

        {/* 계정 찾기 */}
        <button
          onClick={() => { onClose(); onFindAccountClick(); }}
          className="w-full text-center text-xs text-pink-400 hover:underline mt-3"
        >
          아이디/비밀번호를 잊으셨나요?
        </button>

        {/* 회원가입 링크 */}
        <p className="text-center text-xs text-slate-400 mt-4">
          계정이 없으신가요?{' '}
          <button
            onClick={() => { onClose(); onSignupClick(); }}
            className="text-pink-500 font-bold hover:underline"
          >
            회원가입
          </button>
        </p>
      </div>
    </div>
  );
}