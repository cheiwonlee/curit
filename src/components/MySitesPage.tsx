// ============================================================
// src/components/MySitesPage.tsx — 나만의 사이트
//
// 기능: 사이트 추가/수정/삭제, 카테고리, 썸네일, 검색,
//       CSV 다운로드, 북마크(♥)
// ============================================================

import { useState, useEffect, useMemo } from "react";
import { supabase } from "../lib/supabase";
import CuritLogo from "./CuritLogo";
import BulkUploadModal from "./BulkUploadModal";

interface UserSite {
  id: number;
  name: string;
  url: string;
  category: string;
  note: string | null;
  thumbnail_url: string | null;
  sort_order: number;
}

interface MySitesPageProps {
  userId: string;
  onBack: () => void;
}

const DEFAULT_CATEGORIES = [
  "디자인",
  "개발",
  "마케팅",
  "취업",
  "교육",
  "부동산",
  "재테크",
  "생산성",
  "엔터테인먼트",
  "기타",
];

export default function MySitesPage({ userId, onBack }: MySitesPageProps) {
  // ============================================================
  // 상태
  // ============================================================
  const [sites, setSites] = useState<UserSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());

  // 추가/수정 모달
  const [showForm, setShowForm] = useState(false);
  const [editingSite, setEditingSite] = useState<UserSite | null>(null);
  const [formName, setFormName] = useState("");
  const [formUrl, setFormUrl] = useState("");
  const [formCategory, setFormCategory] = useState("미분류");
  const [formCustomCategory, setFormCustomCategory] = useState("");
  const [formNote, setFormNote] = useState("");
  const [formThumbnailUrl, setFormThumbnailUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // 일괄 업로드
  const [showBulkUpload, setShowBulkUpload] = useState(false);

  // ============================================================
  // 데이터 로드
  // ============================================================
  useEffect(() => {
    loadSites();
  }, [userId]);

  const loadSites = async () => {
    const { data } = await supabase
      .from("user_sites")
      .select("*")
      .eq("user_id", userId)
      .order("sort_order")
      .order("created_at", { ascending: false });
    if (data) setSites(data);

    const { data: favData } = await supabase
      .from("user_site_favorites")
      .select("user_site_id")
      .eq("user_id", userId);
    if (favData) setFavoriteIds(new Set(favData.map((f) => f.user_site_id)));

    setLoading(false);
  };

  // ============================================================
  // 검색 + 카테고리별 그룹
  // ============================================================
  const filteredSites = useMemo(() => {
    if (!searchTerm) return sites;
    const lower = searchTerm.toLowerCase();
    return sites.filter(
      (s) =>
        s.name.toLowerCase().includes(lower) ||
        s.url.toLowerCase().includes(lower) ||
        s.category.toLowerCase().includes(lower) ||
        (s.note && s.note.toLowerCase().includes(lower)),
    );
  }, [sites, searchTerm]);

  const groupedSites = useMemo(() => {
    const groups: { [key: string]: UserSite[] } = {};
    filteredSites.forEach((s) => {
      if (!groups[s.category]) groups[s.category] = [];
      groups[s.category].push(s);
    });
    return groups;
  }, [filteredSites]);

  // ============================================================
  // 폼 열기 (추가 / 수정)
  // ============================================================
  const openAddForm = () => {
    setEditingSite(null);
    setFormName("");
    setFormUrl("");
    setFormCategory("미분류");
    setFormCustomCategory("");
    setFormNote("");
    setFormThumbnailUrl("");
    setShowForm(true);
  };

  const openEditForm = (site: UserSite) => {
    setEditingSite(site);
    setFormName(site.name);
    setFormUrl(site.url);
    if (DEFAULT_CATEGORIES.includes(site.category)) {
      setFormCategory(site.category);
      setFormCustomCategory("");
    } else {
      setFormCategory("기타");
      setFormCustomCategory(site.category);
    }
    setFormNote(site.note || "");
    setFormThumbnailUrl(site.thumbnail_url || "");
    setShowForm(true);
  };

  // ============================================================
  // 썸네일 업로드
  // ============================================================
  const handleThumbnailUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("2MB 이하만 업로드 가능합니다.");
      return;
    }

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `user-sites/${userId}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });
    if (error) {
      alert("업로드 실패");
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(path);
    setFormThumbnailUrl(urlData.publicUrl);
    setUploading(false);
  };

  // ============================================================
  // 저장 (추가 / 수정)
  // ============================================================
  const handleSave = async () => {
    if (!formName.trim() || !formUrl.trim()) return;
    setSaving(true);

    const finalCategory =
      formCategory === "기타"
        ? formCustomCategory.trim() || "기타"
        : formCategory;

    const siteData = {
      name: formName.trim(),
      url: formUrl.trim(),
      category: finalCategory,
      note: formNote.trim() || null,
      thumbnail_url: formThumbnailUrl || null,
    };

    if (editingSite) {
      await supabase
        .from("user_sites")
        .update(siteData)
        .eq("id", editingSite.id);
    } else {
      await supabase
        .from("user_sites")
        .insert({ ...siteData, user_id: userId });
    }

    setSaving(false);
    setShowForm(false);
    loadSites();
  };

  // ============================================================
  // 삭제
  // ============================================================
  const handleDelete = async (id: number) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    await supabase.from("user_sites").delete().eq("id", id);
    loadSites();
  };

  // ============================================================
  // 북마크 토글
  // ============================================================
  const handleToggleFavorite = async (siteId: number) => {
    const isFav = favoriteIds.has(siteId);
    if (isFav) {
      await supabase
        .from("user_site_favorites")
        .delete()
        .eq("user_id", userId)
        .eq("user_site_id", siteId);
      setFavoriteIds((prev) => {
        const n = new Set(prev);
        n.delete(siteId);
        return n;
      });
    } else {
      await supabase
        .from("user_site_favorites")
        .insert({ user_id: userId, user_site_id: siteId });
      setFavoriteIds((prev) => {
        const n = new Set(prev);
        n.add(siteId);
        return n;
      });
    }
  };

  // ============================================================
  // CSV 다운로드
  // ============================================================
  const handleExport = () => {
    const BOM = "\uFEFF";
    const header = "No,사이트명,사이트 링크,카테고리,설명\n";
    const rows = sites
      .map(
        (s, i) =>
          `${i + 1},"${s.name}","${s.url}","${s.category}","${s.note || ""}"`,
      )
      .join("\n");
    const blob = new Blob([BOM + header + rows], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `curit-내사이트-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ============================================================
  // 썸네일 폴백
  // ============================================================
  const getThumbnail = (site: UserSite) => {
    if (site.thumbnail_url) return site.thumbnail_url;
    return `https://image.thum.io/get/width/300/crop/600/noanimate/${site.url}`;
  };

  // ============================================================
  // UI
  // ============================================================
  return (
    <div className="min-h-screen bg-[#FFF5F7] text-slate-800">
      {/* ============ 헤더 ============ */}
      <div className="glass-nav fixed top-0 inset-x-0 z-[100] border-b border-pink-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 rounded-xl hover:bg-pink-50 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-pink-500"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <CuritLogo onHomeClick={onBack} />
            <div className="h-6 w-px bg-pink-200" />
            <h2 className="text-lg font-bold text-pink-900">나만의 사이트</h2>
            <span className="text-pink-300 text-sm font-bold">
              {sites.length}개
            </span>

            {/* 검색 */}
            <div className="flex-1 max-w-xs ml-auto relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-pink-50/50 border border-transparent focus:bg-white focus:border-pink-300 rounded-xl pl-9 pr-4 py-2 text-sm transition-all outline-none placeholder:text-pink-200"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ============ 메인 콘텐츠 ============ */}
      <main className="max-w-4xl mx-auto px-4 pt-24 pb-40">
        {/* 상단 버튼 */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={openAddForm}
            className="flex items-center gap-2 px-5 py-2.5 bg-pink-500 text-white rounded-2xl text-sm font-bold hover:bg-pink-600 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            사이트 추가
          </button>

          {/* 일괄 업로드 버튼 (새로 추가) */}
          <button
            onClick={() => setShowBulkUpload(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-pink-200 text-pink-500 rounded-2xl text-sm font-bold hover:bg-pink-50 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
            </svg>
            일괄 업로드
          </button>

          {sites.length > 0 && (
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-pink-200 text-pink-500 rounded-2xl text-sm font-bold hover:bg-pink-50 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              엑셀 다운로드
            </button>
          )}
        </div>

        {/* 사이트 목록 */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mx-auto" />
          </div>
        ) : sites.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-pink-200"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">
              아직 추가한 사이트가 없어요
            </h3>
            <p className="text-pink-300 text-sm">
              "사이트 추가" 버튼으로 나만의 사이트를 등록해보세요.
            </p>
          </div>
        ) : (
          Object.entries(groupedSites).map(([category, categorySites]) => (
            <section key={category} className="mb-10">
              <h3 className="text-lg font-black text-slate-900 mb-4 pb-2 border-b border-pink-100">
                {category}{" "}
                <span className="text-pink-300 text-sm font-bold ml-2">
                  {categorySites.length}개
                </span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {categorySites.map((site) => (
                  <div
                    key={site.id}
                    className="bg-white rounded-2xl border border-pink-50 hover:border-pink-200 transition-colors group overflow-hidden"
                  >
                    {/* 썸네일 */}
                    <a
                      href={site.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block aspect-[16/10] bg-pink-50/30 overflow-hidden relative"
                    >
                      <img
                        src={getThumbnail(site)}
                        alt={site.name}
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {/* 하트 버튼 (썸네일 위) */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleToggleFavorite(site.id);
                        }}
                        className={`absolute top-2 right-2 p-2 rounded-full transition-all ${
                          favoriteIds.has(site.id)
                            ? "bg-white/90 text-pink-500 shadow-sm"
                            : "bg-white/60 text-slate-300 opacity-0 group-hover:opacity-100 hover:text-pink-400"
                        }`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill={
                            favoriteIds.has(site.id) ? "currentColor" : "none"
                          }
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                      </button>
                    </a>

                    {/* 사이트 정보 */}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <a
                            href={site.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-bold text-slate-900 hover:text-pink-500 transition-colors"
                          >
                            {site.name}
                          </a>
                          <p className="text-[11px] text-pink-300 mt-1 truncate">
                            {site.url}
                          </p>
                          {site.note && (
                            <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                              {site.note}
                            </p>
                          )}
                        </div>
                        {/* 수정/삭제 버튼 */}
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button
                            onClick={() => openEditForm(site)}
                            className="p-1.5 rounded-lg hover:bg-pink-50 text-slate-400 hover:text-pink-500 transition-colors"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="13"
                              height="13"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(site.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="13"
                              height="13"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))
        )}
      </main>

      {/* 일괄 업로드 모달 */}
      {showBulkUpload && (
        <BulkUploadModal
          userId={userId}
          existingUrls={sites.map((s) => s.url)}
          onClose={() => setShowBulkUpload(false)}
          onComplete={() => {
            setShowBulkUpload(false);
            loadSites();
          }}
        />
      )}

      {/* ============ 추가/수정 모달 ============ */}
      {showForm && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setShowForm(false)}
        >
          <div
            className="bg-white rounded-3xl p-8 w-full max-w-md mx-4 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-black text-slate-900 mb-6">
              {editingSite ? "사이트 수정" : "사이트 추가"}
            </h3>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">
                  사이트명 <span className="text-pink-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="사이트 이름"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:border-pink-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">
                  사이트 링크 <span className="text-pink-500">*</span>
                </label>
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:border-pink-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">
                  카테고리
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => {
                    setFormCategory(e.target.value);
                    if (e.target.value !== "기타") setFormCustomCategory("");
                  }}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:border-pink-300"
                >
                  <option value="미분류">미분류</option>
                  {DEFAULT_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                {formCategory === "기타" && (
                  <input
                    type="text"
                    placeholder="카테고리명을 입력해주세요"
                    value={formCustomCategory}
                    onChange={(e) => setFormCustomCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:border-pink-300 mt-2"
                    autoFocus
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">
                  설명 (선택)
                </label>
                <textarea
                  placeholder="간단한 설명"
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:border-pink-300 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">
                  썸네일 (선택)
                </label>
                {formThumbnailUrl && (
                  <div className="relative mb-2 rounded-xl overflow-hidden aspect-[16/10] bg-slate-100">
                    <img
                      src={formThumbnailUrl}
                      alt="썸네일"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => setFormThumbnailUrl("")}
                      className="absolute top-2 right-2 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center text-xs hover:bg-black/70"
                    >
                      ✕
                    </button>
                  </div>
                )}
                <label className="flex items-center justify-center gap-2 w-full py-3 bg-slate-50 border border-dashed border-slate-300 rounded-2xl text-sm text-slate-400 hover:border-pink-300 hover:text-pink-500 transition-colors cursor-pointer">
                  {uploading ? "업로드 중..." : "이미지 업로드"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  업로드하지 않으면 자동 썸네일이 표시됩니다.
                </p>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={handleSave}
                disabled={saving || !formName.trim() || !formUrl.trim()}
                className="flex-1 py-3 bg-pink-500 text-white rounded-2xl font-bold hover:bg-pink-600 transition-colors disabled:opacity-50"
              >
                {saving ? "저장 중..." : editingSite ? "수정" : "추가"}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-6 py-3 bg-slate-100 text-slate-500 rounded-2xl font-bold hover:bg-slate-200 transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
