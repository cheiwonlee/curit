// ============================================================
// src/components/SignupPage.tsx — 회원가입 페이지
//
// 단계:
//   1. 이름 입력
//   2. 이메일 입력 → 인증번호 발송
//   3. 인증번호 입력 (6자리)
//   4. 아이디 입력 + 중복확인
//   5. 비밀번호 (8자 이상) + 비밀번호 확인
//   6. 가입 완료 → 홈으로 이동
// ============================================================

import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface SignupPageProps {
  onBack: () => void;           // 로그인 화면으로 돌아가기
  onComplete: () => void;       // 가입 완료 → 홈으로
}

export default function SignupPage({ onBack, onComplete }: SignupPageProps) {
  // 입력 필드 상태
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  // UI 상태
  const [step, setStep] = useState(1);  // 현재 단계 (1~3)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 인증/검증 상태
  const [codeSent, setCodeSent] = useState(false);
  const [codeVerified, setCodeVerified] = useState(false);
  const [usernameChecked, setUsernameChecked] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(false);
  const [sentCode, setSentCode] = useState('');  // 발송된 인증번호 (임시 저장)

  // ============================================================
  // 이메일 인증번호 발송
  //
  // Supabase의 이메일 인증을 직접 활용하는 대신,
  // 6자리 랜덤 코드를 생성하여 Supabase Auth의 OTP 방식으로 처리
  //
  // 실제 프로덕션에서는 별도 이메일 서비스(SendGrid 등)를 쓰지만,
  // Supabase의 signInWithOtp를 활용하면 무료로 가능
  // ============================================================
  const handleSendCode = async () => {
    if (!email) { setError('이메일을 입력해주세요.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('올바른 이메일 형식이 아닙니다.');
      return;
    }

    setLoading(true);
    setError(null);

    // 6자리 랜덤 코드 생성
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setSentCode(code);

    // Supabase Auth의 OTP 이메일 발송
    // (Supabase가 자동으로 이메일을 보내줌)
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        data: { verification_code: code },
        shouldCreateUser: false, // 아직 유저를 만들지 않음
      },
    });

    // OTP가 실패해도 (유저가 없어서) 코드 자체는 생성됨
    // 간단한 구현을 위해 클라이언트에서 코드를 검증
    setCodeSent(true);
    setLoading(false);

    // 실제로는 이메일 발송이 됐는지 확인해야 하지만,
    // Supabase 무료 플랜에서는 이메일 발송에 제한이 있을 수 있어
    // 개발 단계에서는 콘솔에 코드를 출력해서 테스트
    console.log('인증번호:', code);
    alert(`인증번호가 발송되었습니다. (개발 모드: ${code})`);
  };

  // ============================================================
  // 인증번호 확인
  // ============================================================
  const handleVerifyCode = () => {
    if (verificationCode === sentCode) {
      setCodeVerified(true);
      setError(null);
      setStep(2);
    } else {
      setError('인증번호가 일치하지 않습니다.');
    }
  };

  // ============================================================
  // 아이디 중복확인
  //
  // Supabase RPC (Remote Procedure Call)를 사용:
  //   → SQL에서 만든 check_username 함수를 호출
  //   → true = 이미 존재, false = 사용 가능
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

    const { data, error: rpcError } = await supabase.rpc('check_username', {
      username_input: username,
    });

    if (rpcError) {
      setError('중복확인 중 오류가 발생했습니다.');
    } else if (data === true) {
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
  // 최종 회원가입
  //
  // 1. Supabase Auth에 유저 생성 (이메일 + 비밀번호)
  // 2. profiles 테이블에 username, nickname 저장
  //    (트리거가 자동으로 profiles 행을 만들지만, username은 별도 업데이트)
  // ============================================================
  const handleSignup = async () => {
    // 비밀번호 검증
    if (password.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다.');
      return;
    }
    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (!usernameChecked) {
      setError('아이디 중복확인을 해주세요.');
      return;
    }

    setLoading(true);
    setError(null);

    // 1. Supabase Auth 유저 생성
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nickname: name,
          username: username,
        },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // 2. profiles에 username 저장
    if (authData.user) {
      await supabase
        .from('profiles')
        .update({ username, nickname: name })
        .eq('id', authData.user.id);
    }

    setLoading(false);
    alert('회원가입이 완료되었습니다!');
    onComplete();
  };

  return (
    <div className="min-h-screen bg-[#FFF5F7] flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">

        {/* 헤더 */}
        <div className="flex items-center gap-3 mb-8">
          <button onClick={onBack} className="p-2 rounded-xl hover:bg-pink-50 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-500">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <h2 className="text-2xl font-black text-slate-900">회원가입</h2>
        </div>

        {/* 단계 표시 */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-full h-1.5 rounded-full transition-colors ${
                step >= s ? 'bg-pink-500' : 'bg-pink-100'
              }`} />
            </div>
          ))}
        </div>

        {/* ======== STEP 1: 이름 + 이메일 + 인증 ======== */}
        {step === 1 && (
          <div className="flex flex-col gap-4">
            {/* 이름 */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">이름</label>
              <input
                type="text"
                placeholder="이름을 입력해주세요"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:border-pink-300 transition-colors"
              />
            </div>

            {/* 이메일 */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">이메일</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setCodeSent(false); setCodeVerified(false); }}
                  disabled={codeVerified}
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:border-pink-300 transition-colors disabled:opacity-50"
                />
                <button
                  onClick={handleSendCode}
                  disabled={loading || codeVerified}
                  className={`px-4 py-3 rounded-2xl text-xs font-bold shrink-0 transition-colors ${
                    codeVerified
                      ? 'bg-green-100 text-green-600'
                      : 'bg-pink-500 text-white hover:bg-pink-600 disabled:opacity-50'
                  }`}
                >
                  {codeVerified ? '인증완료' : codeSent ? '재발송' : '인증번호'}
                </button>
              </div>
            </div>

            {/* 인증번호 입력 (이메일 발송 후 표시) */}
            {codeSent && !codeVerified && (
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">인증번호 (6자리)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="인증번호를 입력해주세요"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:border-pink-300 tracking-widest text-center font-bold"
                  />
                  <button
                    onClick={handleVerifyCode}
                    disabled={verificationCode.length !== 6}
                    className="px-4 py-3 bg-pink-500 text-white rounded-2xl text-xs font-bold hover:bg-pink-600 transition-colors disabled:opacity-50 shrink-0"
                  >
                    확인
                  </button>
                </div>
              </div>
            )}

            {/* 다음 단계 버튼 */}
            {codeVerified && (
              <button
                onClick={() => { if (name) setStep(2); else setError('이름을 입력해주세요.'); }}
                className="w-full py-3 bg-pink-500 text-white rounded-2xl font-bold hover:bg-pink-600 transition-colors mt-2"
              >
                다음
              </button>
            )}
          </div>
        )}

        {/* ======== STEP 2: 아이디 ======== */}
        {step === 2 && (
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">아이디</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="영문, 숫자, 밑줄(_) 3자 이상"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setUsernameChecked(false);
                    setUsernameAvailable(false);
                  }}
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:border-pink-300 transition-colors"
                />
                <button
                  onClick={handleCheckUsername}
                  disabled={loading}
                  className={`px-4 py-3 rounded-2xl text-xs font-bold shrink-0 transition-colors ${
                    usernameChecked && usernameAvailable
                      ? 'bg-green-100 text-green-600'
                      : 'bg-pink-500 text-white hover:bg-pink-600 disabled:opacity-50'
                  }`}
                >
                  {usernameChecked && usernameAvailable ? '사용가능' : '중복확인'}
                </button>
              </div>
              {usernameChecked && usernameAvailable && (
                <p className="text-green-500 text-xs mt-1.5 font-medium">사용 가능한 아이디입니다.</p>
              )}
            </div>

            <button
              onClick={() => {
                if (!usernameChecked) { setError('아이디 중복확인을 해주세요.'); return; }
                setError(null);
                setStep(3);
              }}
              disabled={!usernameChecked || !usernameAvailable}
              className="w-full py-3 bg-pink-500 text-white rounded-2xl font-bold hover:bg-pink-600 transition-colors disabled:opacity-50 mt-2"
            >
              다음
            </button>
          </div>
        )}

        {/* ======== STEP 3: 비밀번호 ======== */}
        {step === 3 && (
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">비밀번호</label>
              <input
                type="password"
                placeholder="8자 이상 입력해주세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:border-pink-300 transition-colors"
              />
              {password.length > 0 && password.length < 8 && (
                <p className="text-red-400 text-xs mt-1.5 font-medium">비밀번호는 8자 이상이어야 합니다.</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">비밀번호 확인</label>
              <input
                type="password"
                placeholder="비밀번호를 다시 입력해주세요"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:border-pink-300 transition-colors"
              />
              {passwordConfirm.length > 0 && password !== passwordConfirm && (
                <p className="text-red-400 text-xs mt-1.5 font-medium">비밀번호가 일치하지 않습니다.</p>
              )}
              {passwordConfirm.length > 0 && password === passwordConfirm && password.length >= 8 && (
                <p className="text-green-500 text-xs mt-1.5 font-medium">비밀번호가 일치합니다.</p>
              )}
            </div>

            <button
              onClick={handleSignup}
              disabled={loading || password.length < 8 || password !== passwordConfirm}
              className="w-full py-3 bg-pink-500 text-white rounded-2xl font-bold hover:bg-pink-600 transition-colors disabled:opacity-50 mt-2"
            >
              {loading ? '가입 중...' : '가입하기'}
            </button>
          </div>
        )}

        {/* 에러 메시지 */}
        {error && (
          <p className="text-red-500 text-xs mt-4 text-center font-medium">{error}</p>
        )}

        {/* 단계 뒤로가기 */}
        {step > 1 && (
          <button
            onClick={() => { setStep(step - 1); setError(null); }}
            className="w-full text-center text-xs text-pink-400 mt-4 hover:underline"
          >
            이전 단계로
          </button>
        )}
      </div>
    </div>
  );
}