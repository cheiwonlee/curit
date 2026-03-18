// ============================================================
// src/components/SignupPage.tsx — 회원가입 페이지 (로직 수정)
//
// 수정된 흐름:
//   1. 이름 + 이메일 입력
//      → OTP 발송 (유저 자동 생성됨)
//      → 인증번호 입력 → 자동 로그인됨
//   2. 아이디 입력 + 중복확인
//      → 본인의 자동 생성된 username은 제외하고 체크
//   3. 비밀번호 설정
//      → signUp 대신 updateUser로 비밀번호 설정
//      → profiles 업데이트 (username, nickname)
// ============================================================

import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface SignupPageProps {
  onBack: () => void;
  onComplete: () => void;
}

export default function SignupPage({ onBack, onComplete }: SignupPageProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [codeSent, setCodeSent] = useState(false);
  const [codeVerified, setCodeVerified] = useState(false);
  const [usernameChecked, setUsernameChecked] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(false);
  const [verifiedUserId, setVerifiedUserId] = useState<string | null>(null);

  // ============================================================
  // 이메일 인증번호 발송
  // ============================================================
  const handleSendCode = async () => {
    if (!name.trim()) { setError('이름을 입력해주세요.'); return; }
    if (!email) { setError('이메일을 입력해주세요.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('올바른 이메일 형식이 아닙니다.');
      return;
    }

    setLoading(true);
    setError(null);

    // 이메일 중복 확인
    const { data: emailExists } = await supabase.rpc('check_email_exists', {
      email_input: email,
    });

    if (emailExists) {
      setError('이미 가입된 이메일입니다. 로그인해주세요.');
      setLoading(false);
      return;
    }

    // OTP 발송
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });

    if (otpError) {
      setError('인증번호 발송에 실패했습니다. 잠시 후 다시 시도해주세요.');
      setLoading(false);
      return;
    }

    setCodeSent(true);
    setLoading(false);
    alert('인증번호가 이메일로 발송되었습니다. 메일함을 확인해주세요.');
  };

  // ============================================================
  // 인증번호 확인
  // ============================================================
  const handleVerifyCode = async () => {
    setLoading(true);
    setError(null);

    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: verificationCode,
      type: 'email',
    });

    if (verifyError) {
      setError('인증번호가 일치하지 않습니다.');
      setLoading(false);
      return;
    }

    if (data.user) {
      setVerifiedUserId(data.user.id);
    }

    setCodeVerified(true);
    setLoading(false);
    setStep(2);
  };

  // ============================================================
  // 아이디 중복확인 (본인 제외)
  // ============================================================
  const handleCheckUsername = async () => {
    if (!username) { setError('아이디를 입력해주세요.'); return; }
    if (username.length < 3) { setError('아이디는 3자 이상이어야 합니다.'); return; }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('아이디는 영문, 숫자, 밑줄(_)만 사용 가능합니다.');
      return;
    }

    setLoading(true);
    setError(null);

    // 본인 ID를 제외하고 같은 username이 있는지 확인
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .neq('id', verifiedUserId || '')
      .maybeSingle();

    if (data) {
      setError('이미 사용 중인 아이디입니다.');
      setUsernameAvailable(false);
    } else {
      setUsernameAvailable(true);
      setUsernameChecked(true);
      setError(null);
    }
    setLoading(false);
  };

  // ============================================================
  // 최종 회원가입 (updateUser로 비밀번호 설정 + 프로필 업데이트)
  // ============================================================
  const handleSignup = async () => {
    if (password.length < 8) { setError('비밀번호는 8자 이상이어야 합니다.'); return; }
    if (password !== passwordConfirm) { setError('비밀번호가 일치하지 않습니다.'); return; }
    if (!usernameChecked) { setError('아이디 중복확인을 해주세요.'); return; }

    setLoading(true);
    setError(null);

    // 1. 비밀번호 설정
    const { error: updateAuthError } = await supabase.auth.updateUser({
      password: password,
    });

    if (updateAuthError) {
      setError('비밀번호 설정에 실패했습니다: ' + updateAuthError.message);
      setLoading(false);
      return;
    }

    // 2. profiles 업데이트
    if (verifiedUserId) {
      await supabase
        .from('profiles')
        .update({ username, nickname: name.trim() })
        .eq('id', verifiedUserId);
    }

    setLoading(false);
    alert('회원가입이 완료되었습니다!');
    onComplete();
  };

  // ============================================================
  // UI
  // ============================================================
  return (
    <div className="min-h-screen bg-[#FFF5F7] flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">

        <div className="flex items-center gap-3 mb-8">
          <button onClick={onBack} className="p-2 rounded-xl hover:bg-pink-50 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-500">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <h2 className="text-2xl font-black text-slate-900">회원가입</h2>
        </div>

        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex-1">
              <div className={`w-full h-1.5 rounded-full transition-colors ${step >= s ? 'bg-pink-500' : 'bg-pink-100'}`} />
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">이름</label>
              <input type="text" placeholder="이름을 입력해주세요" value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:border-pink-300 transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">이메일</label>
              <div className="flex gap-2">
                <input type="email" placeholder="example@email.com" value={email}
                  onChange={(e) => { setEmail(e.target.value); setCodeSent(false); setCodeVerified(false); }}
                  disabled={codeVerified}
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:border-pink-300 transition-colors disabled:opacity-50" />
                <button onClick={handleSendCode} disabled={loading || codeVerified}
                  className={`px-4 py-3 rounded-2xl text-xs font-bold shrink-0 transition-colors ${
                    codeVerified ? 'bg-green-100 text-green-600' : 'bg-pink-500 text-white hover:bg-pink-600 disabled:opacity-50'
                  }`}>
                  {codeVerified ? '인증완료' : codeSent ? '재발송' : '인증번호'}
                </button>
              </div>
            </div>
            {codeSent && !codeVerified && (
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">인증번호</label>
                <div className="flex gap-2">
                  <input type="text" placeholder="메일로 받은 인증번호 입력"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
                    maxLength={8}
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:border-pink-300 tracking-widest text-center font-bold" />
                  <button onClick={handleVerifyCode} disabled={verificationCode.length < 6 || loading}
                    className="px-4 py-3 bg-pink-500 text-white rounded-2xl text-xs font-bold hover:bg-pink-600 transition-colors disabled:opacity-50 shrink-0">
                    {loading ? '확인 중...' : '확인'}
                  </button>
                </div>
              </div>
            )}
            {codeVerified && (
              <button onClick={() => { if (name.trim()) { setError(null); setStep(2); } else setError('이름을 입력해주세요.'); }}
                className="w-full py-3 bg-pink-500 text-white rounded-2xl font-bold hover:bg-pink-600 transition-colors mt-2">
                다음
              </button>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">아이디</label>
              <div className="flex gap-2">
                <input type="text" placeholder="영문, 숫자, 밑줄(_) 3자 이상" value={username}
                  onChange={(e) => { setUsername(e.target.value); setUsernameChecked(false); setUsernameAvailable(false); }}
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:border-pink-300 transition-colors" />
                <button onClick={handleCheckUsername} disabled={loading}
                  className={`px-4 py-3 rounded-2xl text-xs font-bold shrink-0 transition-colors ${
                    usernameChecked && usernameAvailable ? 'bg-green-100 text-green-600' : 'bg-pink-500 text-white hover:bg-pink-600 disabled:opacity-50'
                  }`}>
                  {usernameChecked && usernameAvailable ? '사용가능' : '중복확인'}
                </button>
              </div>
              {usernameChecked && usernameAvailable && (
                <p className="text-green-500 text-xs mt-1.5 font-medium">사용 가능한 아이디입니다.</p>
              )}
            </div>
            <button onClick={() => { if (!usernameChecked) { setError('아이디 중복확인을 해주세요.'); return; } setError(null); setStep(3); }}
              disabled={!usernameChecked || !usernameAvailable}
              className="w-full py-3 bg-pink-500 text-white rounded-2xl font-bold hover:bg-pink-600 transition-colors disabled:opacity-50 mt-2">
              다음
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">비밀번호</label>
              <input type="password" placeholder="8자 이상 입력해주세요" value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:border-pink-300 transition-colors" />
              {password.length > 0 && password.length < 8 && (
                <p className="text-red-400 text-xs mt-1.5 font-medium">비밀번호는 8자 이상이어야 합니다.</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">비밀번호 확인</label>
              <input type="password" placeholder="비밀번호를 다시 입력해주세요" value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:border-pink-300 transition-colors" />
              {passwordConfirm.length > 0 && password !== passwordConfirm && (
                <p className="text-red-400 text-xs mt-1.5 font-medium">비밀번호가 일치하지 않습니다.</p>
              )}
              {passwordConfirm.length > 0 && password === passwordConfirm && password.length >= 8 && (
                <p className="text-green-500 text-xs mt-1.5 font-medium">비밀번호가 일치합니다.</p>
              )}
            </div>
            <button onClick={handleSignup}
              disabled={loading || password.length < 8 || password !== passwordConfirm}
              className="w-full py-3 bg-pink-500 text-white rounded-2xl font-bold hover:bg-pink-600 transition-colors disabled:opacity-50 mt-2">
              {loading ? '가입 중...' : '가입하기'}
            </button>
          </div>
        )}

        {error && <p className="text-red-500 text-xs mt-4 text-center font-medium">{error}</p>}

        {step > 1 && (
          <button onClick={() => { setStep(step - 1); setError(null); }}
            className="w-full text-center text-xs text-pink-400 mt-4 hover:underline">
            이전 단계로
          </button>
        )}
      </div>
    </div>
  );
}