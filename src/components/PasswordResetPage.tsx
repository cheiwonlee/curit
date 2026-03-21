// ============================================================
// src/components/PasswordResetPage.tsx — 아이디/비밀번호 찾기
//
// 탭 1: 아이디 찾기 (이메일로 아이디 조회)
// 탭 2: 비밀번호 재설정 (이메일로 OTP 발송 → 인증 → 새 비밀번호)
// ============================================================

import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface PasswordResetPageProps {
  onBack: () => void;
  onComplete: () => void;
}

export default function PasswordResetPage({ onBack, onComplete }: PasswordResetPageProps) {
  const [tab, setTab] = useState<'id' | 'password'>('id');

  // 공통
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 아이디 찾기
  const [foundUsername, setFoundUsername] = useState<string | null>(null);

  // 비밀번호 재설정
  const [step, setStep] = useState(1); // 1: 이메일, 2: 인증번호, 3: 새 비밀번호
  const [, setCodeSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [resetComplete, setResetComplete] = useState(false);

  // ============================================================
  // 아이디 찾기
  // ============================================================
  const handleFindUsername = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('올바른 이메일을 입력해주세요.');
      return;
    }

    setLoading(true);
    setError(null);
    setFoundUsername(null);

    const { data, error: rpcError } = await supabase.rpc('get_username_by_email', {
      email_input: email,
    });

    if (rpcError || !data) {
      setError('해당 이메일로 가입된 계정을 찾을 수 없습니다.');
    } else {
      setFoundUsername(data);
    }
    setLoading(false);
  };

  // ============================================================
  // 비밀번호 재설정 — OTP 발송
  // ============================================================
  const handleSendResetCode = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('올바른 이메일을 입력해주세요.');
      return;
    }

    setLoading(true);
    setError(null);

    // 이메일이 존재하는지 확인
    const { data: exists } = await supabase.rpc('check_email_exists', {
      email_input: email,
    });

    if (!exists) {
      setError('해당 이메일로 가입된 계정이 없습니다.');
      setLoading(false);
      return;
    }

    // OTP 발송
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });

    if (otpError) {
      setError('인증번호 발송에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } else {
      setCodeSent(true);
      setStep(2);
      alert('인증번호가 이메일로 발송되었습니다.');
    }
    setLoading(false);
  };

  // ============================================================
  // 비밀번호 재설정 — 인증번호 확인
  // ============================================================
  const handleVerifyCode = async () => {
    setLoading(true);
    setError(null);

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: verificationCode,
      type: 'email',
    });

    if (verifyError) {
      setError('인증번호가 일치하지 않습니다.');
    } else {
      setStep(3);
    }
    setLoading(false);
  };

  // ============================================================
  // 비밀번호 재설정 — 새 비밀번호 설정
  // ============================================================
  const handleResetPassword = async () => {
    if (newPassword.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다.');
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    setLoading(true);
    setError(null);

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      setError('비밀번호 변경에 실패했습니다: ' + updateError.message);
    } else {
      setResetComplete(true);
    }
    setLoading(false);
  };

  // ============================================================
  // UI
  // ============================================================
  return (
    <div className="min-h-screen bg-[#FFF5F7] flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">

        {/* 헤더 */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={onBack} className="p-2 rounded-xl hover:bg-pink-50 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-500">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <h2 className="text-2xl font-black text-slate-900">계정 찾기</h2>
        </div>

        {/* 탭 선택 */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => { setTab('id'); setError(null); setFoundUsername(null); }}
            className={`flex-1 py-2.5 rounded-2xl text-sm font-bold transition-all ${
              tab === 'id' ? 'bg-pink-500 text-white' : 'bg-pink-50 text-pink-400'
            }`}
          >
            아이디 찾기
          </button>
          <button
            onClick={() => { setTab('password'); setError(null); setStep(1); setCodeSent(false); setResetComplete(false); }}
            className={`flex-1 py-2.5 rounded-2xl text-sm font-bold transition-all ${
              tab === 'password' ? 'bg-pink-500 text-white' : 'bg-pink-50 text-pink-400'
            }`}
          >
            비밀번호 재설정
          </button>
        </div>

        {/* ======== 아이디 찾기 ======== */}
        {tab === 'id' && (
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">가입할 때 사용한 이메일</label>
              <input type="email" placeholder="example@email.com" value={email}
                onChange={(e) => { setEmail(e.target.value); setFoundUsername(null); setError(null); }}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:border-pink-300 transition-colors" />
            </div>

            <button onClick={handleFindUsername} disabled={loading}
              className="w-full py-3 bg-pink-500 text-white rounded-2xl font-bold hover:bg-pink-600 transition-colors disabled:opacity-50">
              {loading ? '조회 중...' : '아이디 찾기'}
            </button>

            {foundUsername && (
              <div className="bg-green-50 rounded-2xl p-5 text-center">
                <p className="text-xs text-green-600 mb-2 font-medium">회원님의 아이디를 찾았습니다.</p>
                <p className="text-xl font-black text-green-700">{foundUsername}</p>
                <button onClick={onBack}
                  className="mt-4 px-6 py-2 bg-green-500 text-white rounded-xl text-xs font-bold hover:bg-green-600 transition-colors">
                  로그인하러 가기
                </button>
              </div>
            )}
          </div>
        )}

        {/* ======== 비밀번호 재설정 ======== */}
        {tab === 'password' && !resetComplete && (
          <div className="flex flex-col gap-4">
            {/* 단계 표시 */}
            <div className="flex items-center gap-2 mb-2">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex-1">
                  <div className={`w-full h-1.5 rounded-full transition-colors ${step >= s ? 'bg-pink-500' : 'bg-pink-100'}`} />
                </div>
              ))}
            </div>

            {/* Step 1: 이메일 입력 */}
            {step === 1 && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">가입할 때 사용한 이메일</label>
                  <input type="email" placeholder="example@email.com" value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(null); }}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:border-pink-300 transition-colors" />
                </div>
                <button onClick={handleSendResetCode} disabled={loading}
                  className="w-full py-3 bg-pink-500 text-white rounded-2xl font-bold hover:bg-pink-600 transition-colors disabled:opacity-50">
                  {loading ? '발송 중...' : '인증번호 발송'}
                </button>
              </>
            )}

            {/* Step 2: 인증번호 */}
            {step === 2 && (
              <>
                <p className="text-xs text-slate-400 text-center">{email}으로 인증번호를 발송했습니다.</p>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">인증번호</label>
                  <input type="text" placeholder="메일로 받은 인증번호 입력" value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
                    maxLength={8}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:border-pink-300 tracking-widest text-center font-bold" />
                </div>
                <button onClick={handleVerifyCode} disabled={loading || verificationCode.length < 6}
                  className="w-full py-3 bg-pink-500 text-white rounded-2xl font-bold hover:bg-pink-600 transition-colors disabled:opacity-50">
                  {loading ? '확인 중...' : '인증번호 확인'}
                </button>
              </>
            )}

            {/* Step 3: 새 비밀번호 */}
            {step === 3 && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">새 비밀번호</label>
                  <input type="password" placeholder="8자 이상 입력해주세요" value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:border-pink-300 transition-colors" />
                  {newPassword.length > 0 && newPassword.length < 8 && (
                    <p className="text-red-400 text-xs mt-1.5 font-medium">8자 이상 입력해주세요.</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">새 비밀번호 확인</label>
                  <input type="password" placeholder="비밀번호를 다시 입력해주세요" value={newPasswordConfirm}
                    onChange={(e) => setNewPasswordConfirm(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:border-pink-300 transition-colors" />
                  {newPasswordConfirm.length > 0 && newPassword !== newPasswordConfirm && (
                    <p className="text-red-400 text-xs mt-1.5 font-medium">비밀번호가 일치하지 않습니다.</p>
                  )}
                  {newPasswordConfirm.length > 0 && newPassword === newPasswordConfirm && newPassword.length >= 8 && (
                    <p className="text-green-500 text-xs mt-1.5 font-medium">비밀번호가 일치합니다.</p>
                  )}
                </div>
                <button onClick={handleResetPassword}
                  disabled={loading || newPassword.length < 8 || newPassword !== newPasswordConfirm}
                  className="w-full py-3 bg-pink-500 text-white rounded-2xl font-bold hover:bg-pink-600 transition-colors disabled:opacity-50">
                  {loading ? '변경 중...' : '비밀번호 변경'}
                </button>
              </>
            )}
          </div>
        )}

        {/* 비밀번호 재설정 완료 */}
        {tab === 'password' && resetComplete && (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500"><path d="M20 6L9 17l-5-5"/></svg>
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">비밀번호 변경 완료!</h3>
            <p className="text-sm text-slate-400 mb-6">새 비밀번호로 로그인해주세요.</p>
            <button onClick={onComplete}
              className="px-6 py-3 bg-pink-500 text-white rounded-2xl font-bold hover:bg-pink-600 transition-colors">
              로그인하러 가기
            </button>
          </div>
        )}

        {/* 에러 */}
        {error && <p className="text-red-500 text-xs mt-4 text-center font-medium">{error}</p>}
      </div>
    </div>
  );
}