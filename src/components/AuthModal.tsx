// ============================================================
// src/components/AuthModal.tsx — 로그인 모달 (curit v2)
//
// 변경점:
//   - 회원가입 폼 제거 → "회원가입" 클릭 시 별도 페이지로 이동
//   - 소셜 로그인 (Google, Kakao) 유지
//   - 아이디 + 비밀번호 로그인 추가
// ============================================================

import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignupClick: () => void;  // 회원가입 페이지로 이동
}

export default function AuthModal({ isOpen, onClose, onSignupClick }: AuthModalProps) {
  const [loginId, setLoginId] = useState('');    // 아이디 또는 이메일
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // 소셜 로그인
  const handleSocialLogin = async (provider: 'google' /* | 'kakao' */) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin },
    });
    if (error) setError(error.message);
    setLoading(false);
  };

  // 아이디/이메일 + 비밀번호 로그인
  const handleLogin = async () => {
    if (!loginId || !password) {
      setError('아이디(또는 이메일)와 비밀번호를 입력해주세요.');
      return;
    }

    setLoading(true);
    setError(null);

    // 아이디로 입력한 경우: profiles에서 이메일을 찾아옴
    let email = loginId;

    // @가 없으면 아이디로 간주 → 이메일 조회
    if (!loginId.includes('@')) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', loginId)
        .single();

      if (!profileData) {
        setError('존재하지 않는 아이디입니다.');
        setLoading(false);
        return;
      }

      // auth.users에서 이메일 가져오기 (profiles.id = auth.users.id)
      const { data: userData } = await supabase.auth.admin?.getUserById(profileData.id) || {};
      if (userData?.user?.email) {
        email = userData.user.email;
      } else {
        // admin API가 안 되면 직접 이메일을 입력하도록 안내
        setError('아이디 로그인은 준비 중입니다. 이메일로 로그인해주세요.');
        setLoading(false);
        return;
      }
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

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-3xl p-8 w-full max-w-md mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>

        {/* 로고 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-pink-900 tracking-tighter lowercase mb-2">curit</h1>
          <p className="text-pink-300 text-sm font-medium">쓸만한 사이트, 여기 다 큐릿했어요</p>
        </div>

        {/* 소셜 로그인 */}
        <div className="flex flex-col gap-3 mb-6">
          <button
            onClick={() => handleSocialLogin('google')}
            disabled={loading}
            className="flex items-center justify-center gap-3 w-full py-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors font-medium text-sm"
          >
            <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Google로 계속
          </button>

          {/*
          <button
            onClick={() => handleSocialLogin('kakao')}
            disabled={loading}
            className="flex items-center justify-center gap-3 w-full py-3 bg-[#FEE500] rounded-2xl hover:bg-[#FDD800] transition-colors font-medium text-sm text-[#191919]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#191919"><path d="M12 3C6.48 3 2 6.58 2 10.94c0 2.8 1.86 5.27 4.66 6.67l-1.18 4.33c-.1.36.31.65.62.44l5.02-3.33c.29.02.58.04.88.04 5.52 0 10-3.58 10-7.94S17.52 3 12 3z"/></svg>
            카카오로 계속
          </button>
          */}
        </div>

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