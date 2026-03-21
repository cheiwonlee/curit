// ============================================================
// src/components/MyPage.tsx — 마이페이지 (최종 수정)
//
// 수정사항:
//   - curit 로고 추가 (클릭 시 홈으로)
//   - 구글 로그인 시 비밀번호 변경 숨김
//   - 닉네임 공백 시 저장 버튼 비활성화
//   - 프로필 사진 업로드 수정
//   - 닉네임 저장 후 새로고침 대신 상태 업데이트
// ============================================================

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types';
import CuritLogo from './CuritLogo';
import { generateRandomNickname } from '../utils/randomNickname';


interface MyPageProps {
  profile: Profile | null;
  userEmail: string | null;
  authProvider: string | null;  // 'google', 'kakao', 'email' 등
  onBack: () => void;
  onProfileUpdate: (updatedProfile: Profile) => void;
}

export default function MyPage({ profile, userEmail, authProvider, onBack, onProfileUpdate }: MyPageProps) {
  const [editingNickname, setEditingNickname] = useState(false);
  const [nickname, setNickname] = useState(profile?.nickname || '');
  const [currentNickname, setCurrentNickname] = useState(profile?.nickname || '');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || null);

  // profile이 바뀌면 로컬 상태도 동기화
  useEffect(() => {
    if (profile?.avatar_url) setAvatarUrl(profile.avatar_url);
    if (profile?.nickname) setCurrentNickname(profile.nickname);
  }, [profile]);

  // 비밀번호 변경
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 구글 로그인 여부 확인
  const isOAuthUser = authProvider === 'google' || authProvider === 'kakao';


  // 회원 탈퇴
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  if (!profile) return null;

  // ============================================================
  // 닉네임 수정 (새로고침 없이 상태 업데이트)
  // ============================================================
  const handleSaveNickname = async () => {
    if (!nickname.trim()) return; // 공백 방지

    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ nickname: nickname.trim() })
      .eq('id', profile.id);

    if (error) {
      alert('닉네임 저장에 실패했습니다.');
      console.error('닉네임 저장 에러:', error);
    } else {
      setCurrentNickname(nickname.trim());
      setEditingNickname(false);
      onProfileUpdate({ ...profile, nickname: nickname.trim() });
    }
    setSaving(false);
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

    // 기존 파일 삭제 후 업로드 (덮어쓰기)
    await supabase.storage.from('avatars').remove([filePath]);

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      alert('이미지 업로드에 실패했습니다. avatars 버킷이 있는지 확인해주세요.');
      console.error('업로드 에러:', uploadError);
      setUploading(false);
      return;
    }

    // 공개 URL 가져오기 (캐시 방지를 위해 타임스탬프 추가)
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    const newUrl = urlData.publicUrl + '?t=' + Date.now();

    // profiles에 URL 저장
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: newUrl })
      .eq('id', profile.id);

    if (updateError) {
      alert('프로필 업데이트에 실패했습니다.');
      console.error('프로필 업데이트 에러:', updateError);
    } else {
      setAvatarUrl(newUrl);
    }

    setUploading(false);
  };

  // ============================================================
  // 비밀번호 변경
  // ============================================================
  const handlePasswordChange = async () => {
    setPasswordMessage(null);

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

    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: userEmail || '',
      password: currentPassword,
    });

    if (verifyError) {
      setPasswordMessage({ type: 'error', text: '현재 비밀번호가 올바르지 않습니다.' });
      setPasswordLoading(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      setPasswordMessage({ type: 'error', text: '비밀번호 변경에 실패했습니다.' });
    } else {
      setPasswordMessage({ type: 'success', text: '비밀번호가 성공적으로 변경되었습니다.' });
      setCurrentPassword('');
      setNewPassword('');
      setNewPasswordConfirm('');
      setTimeout(() => {
        setPasswordMessage(null);
        setShowPasswordChange(false);
      }, 3000);
    }

    setPasswordLoading(false);
  };


  // ============================================================
  // 회원 탈퇴
  // ============================================================

    const handleDeleteAccount = async () => {
    if (deleteConfirmText !== '탈퇴합니다') return;
    setDeleting(true);

    const { error } = await supabase.rpc('delete_own_account');

    if (error) {
      alert('회원탈퇴에 실패했습니다. 잠시 후 다시 시도해주세요.');
      console.error('탈퇴 에러:', error);
      setDeleting(false);
      return;
    }

    await supabase.auth.signOut();
    alert('회원탈퇴가 완료되었습니다. 이용해주셔서 감사합니다.');
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-[#FFF5F7] text-slate-800">
      {/* 헤더 — curit 로고 포함 */}
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
            <h2 className="text-lg font-bold text-pink-900">마이페이지</h2>
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
                {avatarUrl ? (
                  <img src={avatarUrl} alt="프로필" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-pink-300 to-rose-300 flex items-center justify-center text-white text-3xl font-black">
                    {(currentNickname || '?')[0]}
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
            <p className="text-xs text-pink-300 mt-3">사진 위에 마우스를 올려 변경</p>
          </div>

          {/* 프로필 정보 */}
          <div className="flex flex-col gap-5">
            {/* 닉네임 */}
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5">닉네임</label>
              {editingNickname ? (
                <div className="flex gap-2">
                  <input value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:border-pink-300"
                    autoFocus />
                  <button
                    onClick={() => setNickname(generateRandomNickname())}
                    className="px-3 py-3 bg-pink-100 text-pink-500 rounded-2xl text-sm font-bold hover:bg-pink-200 transition-colors shrink-0"
                    title="랜덤 닉네임"
                  >
                    🎲
                  </button>
                  <button onClick={handleSaveNickname}
                    disabled={saving || !nickname.trim()}
                    className="px-4 py-3 bg-pink-500 text-white rounded-2xl text-xs font-bold hover:bg-pink-600 transition-colors shrink-0 disabled:opacity-50">
                    {saving ? '저장 중...' : '저장'}
                  </button>
                  <button onClick={() => { setEditingNickname(false); setNickname(currentNickname); }}
                    className="px-4 py-3 bg-slate-100 text-slate-500 rounded-2xl text-xs font-bold hover:bg-slate-200 transition-colors shrink-0">
                    취소
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-2xl">
                  <span className="text-sm font-medium text-slate-700">{currentNickname || '설정 안 됨'}</span>
                  <button
                    onClick={() => { setEditingNickname(true); setNickname(currentNickname); }}
                    className="text-pink-500 text-xs font-bold hover:underline"
                  >
                    수정
                  </button>
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

            {/* 로그인 방식 */}
            {isOAuthUser && (
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5">로그인 방식</label>
                <div className="px-4 py-3 bg-slate-50 rounded-2xl">
                  <span className="text-sm font-medium text-slate-500">
                    {authProvider === 'google' ? 'Google 계정' : 'Kakao 계정'}으로 로그인
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 비밀번호 변경 카드 — 이메일 가입 사용자만 표시 */}
        {!isOAuthUser && (
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
                {passwordMessage && (
                  <p className={`text-xs font-medium text-center ${passwordMessage.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                    {passwordMessage.text}
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={handlePasswordChange}
                    disabled={passwordLoading || newPassword.length < 8 || newPassword !== newPasswordConfirm}
                    className="flex-1 py-3 bg-pink-500 text-white rounded-2xl text-sm font-bold hover:bg-pink-600 transition-colors disabled:opacity-50"
                  >
                    {passwordLoading ? '변경 중...' : '비밀번호 변경'}
                  </button>
                  <button
                    onClick={() => { setShowPasswordChange(false); setCurrentPassword(''); setNewPassword(''); setNewPasswordConfirm(''); setPasswordMessage(null); }}
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
        )}

        {/* 회원탈퇴 */}
        <div className="mt-6 text-center">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="text-xs text-slate-300 hover:text-red-400 transition-colors"
          >
            회원탈퇴
          </button>
        </div>

        {/* 회원탈퇴 확인 모달 */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)}>
            <div className="bg-white rounded-3xl p-8 w-full max-w-sm mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-xl font-black text-slate-900 mb-3">정말 탈퇴하시겠어요?</h3>
              <p className="text-sm text-slate-500 mb-2">탈퇴 시 다음 데이터가 영구 삭제됩니다.</p>
              <ul className="text-xs text-slate-400 mb-6 space-y-1">
                <li>• 프로필 정보 (닉네임, 프로필 사진)</li>
                <li>• 북마크한 사이트 목록</li>
                <li>• 나만의 사이트 목록</li>
                <li>• 사이트 등록 신청 내역</li>
              </ul>

              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-500 mb-1.5">확인을 위해 "탈퇴합니다"를 입력해주세요</label>
                <input
                  type="text"
                  placeholder="탈퇴합니다"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:border-red-300 transition-colors"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== '탈퇴합니다' || deleting}
                  className="flex-1 py-3 bg-red-500 text-white rounded-2xl text-sm font-bold hover:bg-red-600 transition-colors disabled:opacity-30"
                >
                  {deleting ? '처리 중...' : '탈퇴하기'}
                </button>
                <button
                  onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(''); }}
                  className="px-6 py-3 bg-slate-100 text-slate-500 rounded-2xl text-sm font-bold hover:bg-slate-200 transition-colors"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        )}

        
      </main>
    </div>
  );
}