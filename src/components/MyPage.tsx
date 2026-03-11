// ============================================================
// src/components/MyPage.tsx — 마이페이지 (비밀번호 변경 추가)
// ============================================================

import { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types';

interface MyPageProps {
  profile: Profile | null;
  userEmail: string | null;
  onBack: () => void;
}

export default function MyPage({ profile, userEmail, onBack }: MyPageProps) {
  // 닉네임 수정
  const [editingNickname, setEditingNickname] = useState(false);
  const [nickname, setNickname] = useState(profile?.nickname || '');
  const [saving, setSaving] = useState(false);

  // 프로필 사진
  const [uploading, setUploading] = useState(false);

  // 비밀번호 변경
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!profile) return null;

  // ============================================================
  // 닉네임 수정
  // ============================================================
  const handleSaveNickname = async () => {
    setSaving(true);
    await supabase.from('profiles').update({ nickname }).eq('id', profile.id);
    setSaving(false);
    setEditingNickname(false);
    window.location.reload();
  };

  // ============================================================
  // 프로필 사진 업로드
  // ============================================================
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('이미지 크기는 2MB 이하여야 합니다.');
      return;
    }

    setUploading(true);

    const fileExt = file.name.split('.').pop();
    const filePath = `${profile.id}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      alert('이미지 업로드에 실패했습니다.');
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    await supabase
      .from('profiles')
      .update({ avatar_url: urlData.publicUrl })
      .eq('id', profile.id);

    setUploading(false);
    window.location.reload();
  };

  // ============================================================
  // 비밀번호 변경
  //
  // Supabase Auth의 updateUser 메서드를 사용
  // → 새 비밀번호만 전달하면 변경됨
  // → 현재 비밀번호 확인은 signInWithPassword로 검증
  // ============================================================
  const handlePasswordChange = async () => {
    setPasswordMessage(null);

    // 유효성 검사
    if (!currentPassword) {
      setPasswordMessage({ type: 'error', text: '현재 비밀번호를 입력해주세요.' });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordMessage({ type: 'error', text: '새 비밀번호는 8자 이상이어야 합니다.' });
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      setPasswordMessage({ type: 'error', text: '새 비밀번호가 일치하지 않습니다.' });
      return;
    }
    if (currentPassword === newPassword) {
      setPasswordMessage({ type: 'error', text: '현재 비밀번호와 다른 비밀번호를 입력해주세요.' });
      return;
    }

    setPasswordLoading(true);

    // 1. 현재 비밀번호 확인 (로그인 시도)
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: userEmail || '',
      password: currentPassword,
    });

    if (verifyError) {
      setPasswordMessage({ type: 'error', text: '현재 비밀번호가 올바르지 않습니다.' });
      setPasswordLoading(false);
      return;
    }

    // 2. 새 비밀번호로 변경
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      setPasswordMessage({ type: 'error', text: '비밀번호 변경에 실패했습니다. 다시 시도해주세요.' });
    } else {
      setPasswordMessage({ type: 'success', text: '비밀번호가 성공적으로 변경되었습니다.' });
      // 입력 필드 초기화
      setCurrentPassword('');
      setNewPassword('');
      setNewPasswordConfirm('');
      // 3초 후 메시지 숨기기
      setTimeout(() => {
        setPasswordMessage(null);
        setShowPasswordChange(false);
      }, 3000);
    }

    setPasswordLoading(false);
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
            <h1 className="text-xl font-black text-pink-900">마이페이지</h1>
          </div>
        </div>
      </div>

      {/* 콘텐츠 */}
      <main className="max-w-lg mx-auto px-4 pt-28 pb-40">

        {/* 프로필 카드 */}
        <div className="bg-white rounded-3xl p-8 shadow-lg border border-pink-50 mb-6">
          {/* 프로필 사진 */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-pink-200">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="프로필" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-pink-300 to-rose-300 flex items-center justify-center text-white text-3xl font-black">
                    {(profile.nickname || '?')[0]}
                  </div>
                )}
              </div>
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <span className="text-white text-xs font-bold">
                  {uploading ? '업로드 중...' : '변경'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-xs text-pink-300 mt-3">사진을 클릭하여 변경</p>
          </div>

          {/* 프로필 정보 */}
          <div className="flex flex-col gap-5">
            {/* 닉네임 */}
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5">닉네임</label>
              {editingNickname ? (
                <div className="flex gap-2">
                  <input
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:border-pink-300"
                    autoFocus
                  />
                  <button onClick={handleSaveNickname} disabled={saving} className="px-4 py-3 bg-pink-500 text-white rounded-2xl text-xs font-bold hover:bg-pink-600 transition-colors shrink-0">
                    {saving ? '저장 중...' : '저장'}
                  </button>
                  <button onClick={() => { setEditingNickname(false); setNickname(profile.nickname || ''); }} className="px-4 py-3 bg-slate-100 text-slate-500 rounded-2xl text-xs font-bold hover:bg-slate-200 transition-colors shrink-0">
                    취소
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-2xl">
                  <span className="text-sm font-medium text-slate-700">{profile.nickname || '설정 안 됨'}</span>
                  <button onClick={() => { setEditingNickname(true); setNickname(profile.nickname || ''); }} className="text-pink-500 text-xs font-bold hover:underline">수정</button>
                </div>
              )}
            </div>

            {/* 아이디 */}
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5">아이디</label>
              <div className="px-4 py-3 bg-slate-50 rounded-2xl">
                <span className="text-sm font-medium text-slate-700">{(profile as any).username || '설정 안 됨'}</span>
              </div>
            </div>

            {/* 이메일 */}
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5">이메일</label>
              <div className="px-4 py-3 bg-slate-50 rounded-2xl">
                <span className="text-sm font-medium text-slate-500">{userEmail || '—'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 비밀번호 변경 카드 */}
        <div className="bg-white rounded-3xl p-8 shadow-lg border border-pink-50">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-black text-slate-900">비밀번호 변경</h3>
            {!showPasswordChange && (
              <button
                onClick={() => setShowPasswordChange(true)}
                className="text-pink-500 text-xs font-bold hover:underline"
              >
                변경하기
              </button>
            )}
          </div>

          {showPasswordChange ? (
            <div className="flex flex-col gap-4">
              {/* 현재 비밀번호 */}
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5">현재 비밀번호</label>
                <input
                  type="password"
                  placeholder="현재 비밀번호를 입력해주세요"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:border-pink-300 transition-colors"
                />
              </div>

              {/* 새 비밀번호 */}
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5">새 비밀번호</label>
                <input
                  type="password"
                  placeholder="8자 이상 입력해주세요"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:border-pink-300 transition-colors"
                />
                {newPassword.length > 0 && newPassword.length < 8 && (
                  <p className="text-red-400 text-xs mt-1.5 font-medium">8자 이상 입력해주세요.</p>
                )}
              </div>

              {/* 새 비밀번호 확인 */}
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5">새 비밀번호 확인</label>
                <input
                  type="password"
                  placeholder="새 비밀번호를 다시 입력해주세요"
                  value={newPasswordConfirm}
                  onChange={(e) => setNewPasswordConfirm(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:border-pink-300 transition-colors"
                />
                {newPasswordConfirm.length > 0 && newPassword !== newPasswordConfirm && (
                  <p className="text-red-400 text-xs mt-1.5 font-medium">비밀번호가 일치하지 않습니다.</p>
                )}
                {newPasswordConfirm.length > 0 && newPassword === newPasswordConfirm && newPassword.length >= 8 && (
                  <p className="text-green-500 text-xs mt-1.5 font-medium">비밀번호가 일치합니다.</p>
                )}
              </div>

              {/* 메시지 */}
              {passwordMessage && (
                <p className={`text-xs font-medium text-center ${
                  passwordMessage.type === 'success' ? 'text-green-500' : 'text-red-500'
                }`}>
                  {passwordMessage.text}
                </p>
              )}

              {/* 버튼 */}
              <div className="flex gap-2">
                <button
                  onClick={handlePasswordChange}
                  disabled={passwordLoading || newPassword.length < 8 || newPassword !== newPasswordConfirm}
                  className="flex-1 py-3 bg-pink-500 text-white rounded-2xl text-sm font-bold hover:bg-pink-600 transition-colors disabled:opacity-50"
                >
                  {passwordLoading ? '변경 중...' : '비밀번호 변경'}
                </button>
                <button
                  onClick={() => {
                    setShowPasswordChange(false);
                    setCurrentPassword('');
                    setNewPassword('');
                    setNewPasswordConfirm('');
                    setPasswordMessage(null);
                  }}
                  className="px-6 py-3 bg-slate-100 text-slate-500 rounded-2xl text-sm font-bold hover:bg-slate-200 transition-colors"
                >
                  취소
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400">비밀번호를 변경하려면 "변경하기"를 클릭하세요.</p>
          )}
        </div>
      </main>
    </div>
  );
}