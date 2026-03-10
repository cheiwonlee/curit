// ============================================================
// src/components/AuthModal.tsx — 로그인/회원가입 모달
//
// 소셜 로그인: Google, Naver, Kakao (Supabase Auth OAuth)
// 이메일 회원가입/로그인도 지원
// ============================================================

import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  // 로그인 모드 / 회원가입 모드 전환
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // ============================================================
  // 소셜 로그인 (Google / Naver / Kakao)
  //
  // Supabase Auth가 OAuth 인증을 처리:
  //   1. 사용자를 해당 서비스 로그인 페이지로 이동
  //   2. 로그인 성공 시 Supabase로 리다이렉트
  //   3. Supabase가 세션 생성 → auth.users에 행 추가
  //   4. 위에서 만든 트리거가 profiles 테이블에도 행 생성
  //
  // ⚠️ Supabase 대시보드에서 OAuth Provider 설정 필요:
  //   Authentication → Providers → Google/Naver/Kakao 활성화
  // ============================================================
  const handleSocialLogin = async (provider: 'google' | 'kakao') => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) setError(error.message);
    setLoading(false);
  };

  // 네이버는 Supabase 기본 제공이 아니므로 커스텀 OIDC로 처리
  // → 여기서는 우선 구글/카카오만 구현, 네이버는 추후 추가
  // (네이버 로그인은 Supabase의 custom OIDC provider 설정 필요)

  // ============================================================
  // 이메일 회원가입
  // ============================================================
  const handleEmailSignup = async () => {
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nickname }, // 이 값이 트리거를 통해 profiles.nickname에 저장됨
      },
    });

    if (error) {
      setError(error.message);
    } else {
      alert('가입 완료! 이메일 인증을 확인해주세요.');
      onClose();
    }
    setLoading(false);
  };

  // ============================================================
  // 이메일 로그인
  // ============================================================
  const handleEmailLogin = async () => {
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.');
    } else {
      onClose();
    }
    setLoading(false);
  };

  const handleSubmit = () => {
    if (mode === 'signup') handleEmailSignup();
    else handleEmailLogin();
  };

  return (
    // 모달 배경 (클릭하면 닫힘)
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      {/* 모달 본체 (클릭 이벤트 전파 차단) */}
      <div className="bg-white rounded-3xl p-8 w-full max-w-md mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        
        <h2 className="text-2xl font-black text-slate-900 text-center mb-6">
          {mode === 'login' ? '로그인' : '회원가입'}
        </h2>

        {/* 소셜 로그인 버튼 */}
        <div className="flex flex-col gap-3 mb-6">
          <button
            onClick={() => handleSocialLogin('google')}
            disabled={loading}
            className="flex items-center justify-center gap-3 w-full py-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors font-medium text-sm"
          >
            <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Google로 계속
          </button>

          <button
            onClick={() => handleSocialLogin('kakao')}
            disabled={loading}
            className="flex items-center justify-center gap-3 w-full py-3 bg-[#FEE500] rounded-2xl hover:bg-[#FDD800] transition-colors font-medium text-sm text-[#191919]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#191919"><path d="M12 3C6.48 3 2 6.58 2 10.94c0 2.8 1.86 5.27 4.66 6.67l-1.18 4.33c-.1.36.31.65.62.44l5.02-3.33c.29.02.58.04.88.04 5.52 0 10-3.58 10-7.94S17.52 3 12 3z"/></svg>
            카카오로 계속
          </button>
        </div>

        {/* 구분선 */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs text-slate-400 font-medium">또는 이메일로</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {/* 이메일 입력 폼 */}
        <div className="flex flex-col gap-3 mb-4">
          {mode === 'signup' && (
            <input
              type="text"
              placeholder="닉네임"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:border-pink-300"
            />
          )}
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:border-pink-300"
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:border-pink-300"
          />
        </div>

        {error && <p className="text-red-500 text-xs mb-4 text-center">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3 bg-pink-500 text-white rounded-2xl font-bold hover:bg-pink-600 transition-colors disabled:opacity-50"
        >
          {loading ? '처리 중...' : mode === 'login' ? '로그인' : '가입하기'}
        </button>

        {/* 모드 전환 */}
        <p className="text-center text-xs text-slate-400 mt-4">
          {mode === 'login' ? (
            <>계정이 없으신가요? <button onClick={() => setMode('signup')} className="text-pink-500 font-bold hover:underline">회원가입</button></>
          ) : (
            <>이미 계정이 있으신가요? <button onClick={() => setMode('login')} className="text-pink-500 font-bold hover:underline">로그인</button></>
          )}
        </p>
      </div>
    </div>
  );
}
