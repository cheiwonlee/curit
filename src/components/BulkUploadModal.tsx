// ============================================================
// src/components/BulkUploadModal.tsx — 사이트 일괄 업로드
//
// 기능:
//   - CSV/XLSX 파일 업로드 (드래그 앤 드롭 지원)
//   - 양식 다운로드
//   - 미리보기 테이블 (셀 직접 수정 가능)
//   - 개별 행 삭제, 전체 선택/해제
//   - URL 자동 보정 (https:// 추가)
//   - 중복 체크 (기존 사이트 + 파일 내)
//   - 업로드 결과 요약 + 실패 CSV 다운로드
//   - [?] 도움말 팝업
// ============================================================

import { useState, useRef, useMemo } from "react";
import { supabase } from "../lib/supabase";
import * as XLSX from "xlsx";

interface BulkUploadModalProps {
  userId: string;
  existingUrls: string[]; // 이미 등록된 URL 목록 (중복 체크용)
  onClose: () => void;
  onComplete: () => void; // 업로드 완료 후 목록 새로고침
}

interface UploadRow {
  id: number;
  name: string;
  url: string;
  category: string;
  note: string;
  selected: boolean;
  errors: string[];
  isDuplicate: boolean; // 기존 사이트와 중복
  isFileDuplicate: boolean; // 파일 내 중복
}

type UploadResult = {
  success: number;
  failed: { name: string; url: string; reason: string }[];
};

export default function BulkUploadModal({
  userId,
  existingUrls,
  onClose,
  onComplete,
}: BulkUploadModalProps) {
  // ============================================================
  // 상태
  // ============================================================
  const [step, setStep] = useState<"upload" | "preview" | "result">("upload");
  const [rows, setRows] = useState<UploadRow[]>([]);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ============================================================
  // URL 자동 보정
  // ============================================================
  const fixUrl = (url: string): string => {
    let fixed = url.trim();
    if (!fixed) return fixed;
    // http/https가 없으면 https:// 추가
    if (!/^https?:\/\//i.test(fixed)) {
      fixed = "https://" + fixed;
    }
    return fixed;
  };

  // ============================================================
  // 유효성 검사 + 중복 체크
  // ============================================================
  const validateRows = (
    rawRows: Omit<
      UploadRow,
      "id" | "selected" | "errors" | "isDuplicate" | "isFileDuplicate"
    >[],
  ): UploadRow[] => {
    const existingSet = new Set(
      existingUrls.map((u) => u.toLowerCase().replace(/\/+$/, "")),
    );
    const urlCount: { [key: string]: number } = {};

    // 파일 내 URL 카운트
    rawRows.forEach((r) => {
      const normalized = r.url.toLowerCase().replace(/\/+$/, "");
      urlCount[normalized] = (urlCount[normalized] || 0) + 1;
    });

    return rawRows.map((r, i) => {
      const errors: string[] = [];
      const url = fixUrl(r.url);
      const normalizedUrl = url.toLowerCase().replace(/\/+$/, "");

      if (!r.name.trim()) errors.push("사이트명 필수");
      if (!url) errors.push("URL 필수");
      else if (!/^https?:\/\/.+\..+/.test(url)) errors.push("URL 형식 오류");

      const isDuplicate = existingSet.has(normalizedUrl);
      const isFileDuplicate = (urlCount[normalizedUrl] || 0) > 1;

      if (isDuplicate) errors.push("이미 등록된 사이트");
      if (isFileDuplicate) errors.push("파일 내 중복");

      return {
        id: i,
        name: r.name.trim(),
        url,
        category: r.category.trim() || "미분류",
        note: r.note.trim(),
        selected: errors.length === 0,
        errors,
        isDuplicate,
        isFileDuplicate,
      };
    });
  };

  // ============================================================
  // 파일 파싱 (CSV + XLSX)
  // ============================================================
  const parseFile = async (file: File) => {
    setParseError(null);

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["csv", "xlsx", "xls"].includes(ext || "")) {
      setParseError("지원하지 않는 파일 형식입니다. (csv, xlsx, xls만 가능)");
      return;
    }

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json<any>(sheet, { header: 1 });

      if (json.length < 2) {
        setParseError(
          "데이터가 없습니다. 첫 번째 행은 헤더, 두 번째 행부터 데이터입니다.",
        );
        return;
      }

      if (json.length > 101) {
        setParseError("한 번에 최대 100개까지 업로드 가능합니다.");
        return;
      }

      // 첫 행은 헤더로 스킵
      const rawRows = json
        .slice(1)
        .filter((row: any[]) => row && row.length > 0 && (row[0] || row[1]))
        .map((row: any[]) => ({
          name: String(row[0] || "").trim(),
          url: fixUrl(String(row[1] || "").trim()),
          category: String(row[2] || "미분류").trim(),
          note: String(row[3] || "").trim(),
        }));

      if (rawRows.length === 0) {
        setParseError("업로드할 데이터가 없습니다.");
        return;
      }

      setRows(validateRows(rawRows));
      setStep("preview");
    } catch (e) {
      setParseError("파일을 읽는 중 오류가 발생했습니다.");
      console.error(e);
    }
  };

  // ============================================================
  // 드래그 앤 드롭
  // ============================================================
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) parseFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) parseFile(file);
  };

  // ============================================================
  // 양식 다운로드
  // ============================================================
  const downloadTemplate = () => {
    // 헤더 + 예시 데이터
    const data = [
      ["사이트명", "사이트 링크", "카테고리", "설명"],
      ["Google", "https://www.google.com", "기타", "세계 최대 검색엔진"],
      ["Notion", "https://www.notion.so", "생산성", "올인원 워크스페이스"],
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);

    // 열 너비 설정
    ws["!cols"] = [
      { wch: 20 }, // 사이트명
      { wch: 35 }, // 사이트 링크
      { wch: 15 }, // 카테고리
      { wch: 30 }, // 설명
    ];

    // 카테고리 드롭다운 (100행까지)
    const categories = [
      "미분류",
      ...[
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
      ],
    ];
    const formulaList = '"' + categories.join(",") + '"';

    ws["!dataValidations"] = {
      list: [
        {
          sqref: "C2:C101",
          type: "list",
          formula1: formulaList,
          showDropDown: true,
          error: "목록에서 카테고리를 선택하거나 직접 입력해주세요.",
          errorTitle: "카테고리 선택",
        },
      ],
    };

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "사이트 목록");

    XLSX.writeFile(wb, "curit-일괄업로드-양식.xlsx");
  };

  // ============================================================
  // 미리보기 — 셀 수정
  // ============================================================
  const updateRow = (
    id: number,
    field: keyof Pick<UploadRow, "name" | "url" | "category" | "note">,
    value: string,
  ) => {
    setRows((prev) => {
      const updated = prev.map((r) =>
        r.id === id
          ? { ...r, [field]: field === "url" ? fixUrl(value) : value }
          : r,
      );
      // 재검증
      const revalidated = validateRows(
        updated.map((r) => ({
          name: r.name,
          url: r.url,
          category: r.category,
          note: r.note,
        })),
      );
      // 기존 selected 상태 유지 (에러 없는 것만 자동 선택)
      return revalidated.map((r, i) => ({
        ...r,
        selected: updated[i].selected && r.errors.length === 0,
      }));
    });
  };

  // ============================================================
  // 행 삭제 / 선택
  // ============================================================
  const deleteRow = (id: number) => {
    setRows((prev) => {
      const filtered = prev.filter((r) => r.id !== id);
      return validateRows(
        filtered.map((r) => ({
          name: r.name,
          url: r.url,
          category: r.category,
          note: r.note,
        })),
      );
    });
  };

  const toggleRow = (id: number) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, selected: !r.selected } : r)),
    );
  };

  const toggleAll = () => {
    const validRows = rows.filter((r) => r.errors.length === 0);
    const allSelected = validRows.every((r) => r.selected);
    setRows((prev) =>
      prev.map((r) =>
        r.errors.length === 0 ? { ...r, selected: !allSelected } : r,
      ),
    );
  };

  // ============================================================
  // 통계
  // ============================================================
  const stats = useMemo(() => {
    const total = rows.length;
    const valid = rows.filter((r) => r.errors.length === 0).length;
    const selected = rows.filter((r) => r.selected).length;
    const errors = rows.filter((r) => r.errors.length > 0).length;
    return { total, valid, selected, errors };
  }, [rows]);

  // ============================================================
  // 업로드
  // ============================================================
  const handleUpload = async () => {
    const toUpload = rows.filter((r) => r.selected && r.errors.length === 0);
    if (toUpload.length === 0) return;

    setUploading(true);
    const failed: UploadResult["failed"] = [];
    let success = 0;

    for (const row of toUpload) {
      const { error } = await supabase.from("user_sites").insert({
        user_id: userId,
        name: row.name,
        url: row.url,
        category: row.category,
        note: row.note || null,
      });

      if (error) {
        failed.push({ name: row.name, url: row.url, reason: error.message });
      } else {
        success++;
      }
    }

    setResult({ success, failed });
    setStep("result");
    setUploading(false);

    if (success > 0) onComplete();
  };

  // ============================================================
  // 실패 항목 CSV 다운로드
  // ============================================================
  const downloadFailedCsv = () => {
    if (!result || result.failed.length === 0) return;
    const BOM = "\uFEFF";
    const header = "사이트명,사이트 링크,실패 사유\n";
    const content = result.failed
      .map((f) => `"${f.name}","${f.url}","${f.reason}"`)
      .join("\n");
    const blob = new Blob([BOM + header + content], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "curit-업로드실패항목.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // ============================================================
  // UI
  // ============================================================
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-2xl mx-4 shadow-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-pink-50 shrink-0">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-black text-slate-900">
              📤 사이트 일괄 업로드
            </h3>
            <button
              onClick={() => setShowHelp(true)}
              className="w-6 h-6 rounded-full bg-pink-100 text-pink-500 text-xs font-bold hover:bg-pink-200 transition-colors flex items-center justify-center"
            >
              ?
            </button>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-pink-50 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* 콘텐츠 */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* ======== STEP 1: 파일 업로드 ======== */}
          {step === "upload" && (
            <div>
              {/* 양식 다운로드 */}
              <div className="flex items-center gap-3 mb-5">
                <button
                  onClick={downloadTemplate}
                  className="flex items-center gap-2 px-4 py-2 bg-pink-50 text-pink-500 rounded-xl text-xs font-bold hover:bg-pink-100 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                  </svg>
                  양식 다운로드
                </button>
                <span className="text-[11px] text-slate-400">
                  CSV 또는 XLSX 파일을 업로드하세요
                </span>
              </div>

              {/* 드래그 앤 드롭 영역 */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
                  dragOver
                    ? "border-pink-400 bg-pink-50"
                    : "border-pink-200 hover:border-pink-300 hover:bg-pink-50/50"
                }`}
              >
                <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-pink-400"
                  >
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                  </svg>
                </div>
                <p className="text-sm font-bold text-slate-700 mb-1">
                  파일을 여기에 드래그하거나 클릭하여 업로드
                </p>
                <p className="text-xs text-slate-400">
                  .csv, .xlsx, .xls 파일 지원 · 최대 100개
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {parseError && (
                <p className="text-red-500 text-xs mt-3 text-center font-medium">
                  {parseError}
                </p>
              )}
            </div>
          )}

          {/* ======== STEP 2: 미리보기 ======== */}
          {step === "preview" && (
            <div>
              {/* 통계 바 */}
              <div className="flex items-center gap-4 mb-4 text-xs">
                <span className="text-slate-500">
                  전체 <b className="text-slate-900">{stats.total}</b>개
                </span>
                <span className="text-green-600">
                  업로드 가능 <b>{stats.valid}</b>개
                </span>
                <span className="text-pink-500">
                  선택됨 <b>{stats.selected}</b>개
                </span>
                {stats.errors > 0 && (
                  <span className="text-red-500">
                    오류 <b>{stats.errors}</b>개
                  </span>
                )}
                <button
                  onClick={() => {
                    setStep("upload");
                    setRows([]);
                  }}
                  className="ml-auto text-xs text-pink-400 hover:underline"
                >
                  다른 파일 선택
                </button>
              </div>

              {/* 테이블 */}
              <div className="border border-pink-100 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-pink-50/80">
                        <th className="w-10 p-2 text-center">
                          <input
                            type="checkbox"
                            checked={
                              stats.valid > 0 &&
                              rows
                                .filter((r) => r.errors.length === 0)
                                .every((r) => r.selected)
                            }
                            onChange={toggleAll}
                            className="accent-pink-500 w-3.5 h-3.5"
                          />
                        </th>
                        <th className="p-2 text-left font-bold text-slate-600 min-w-[120px]">
                          사이트명 *
                        </th>
                        <th className="p-2 text-left font-bold text-slate-600 min-w-[180px]">
                          사이트 링크 *
                        </th>
                        <th className="p-2 text-left font-bold text-slate-600 min-w-[80px]">
                          카테고리
                        </th>
                        <th className="p-2 text-left font-bold text-slate-600 min-w-[120px]">
                          설명
                        </th>
                        <th className="w-16 p-2 text-center font-bold text-slate-600">
                          상태
                        </th>
                        <th className="w-10 p-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => (
                        <tr
                          key={row.id}
                          className={`border-t border-pink-50 ${
                            row.errors.length > 0
                              ? "bg-red-50/50"
                              : row.selected
                                ? "bg-white"
                                : "bg-slate-50/50"
                          }`}
                        >
                          <td className="p-2 text-center">
                            <input
                              type="checkbox"
                              checked={row.selected}
                              disabled={row.errors.length > 0}
                              onChange={() => toggleRow(row.id)}
                              className="accent-pink-500 w-3.5 h-3.5"
                            />
                          </td>
                          <td className="p-1">
                            <input
                              value={row.name}
                              onChange={(e) =>
                                updateRow(row.id, "name", e.target.value)
                              }
                              className={`w-full px-2 py-1.5 rounded-lg text-xs outline-none border ${
                                !row.name
                                  ? "border-red-300 bg-red-50"
                                  : "border-transparent focus:border-pink-300 focus:bg-white"
                              }`}
                            />
                          </td>
                          <td className="p-1">
                            <input
                              value={row.url}
                              onChange={(e) =>
                                updateRow(row.id, "url", e.target.value)
                              }
                              className={`w-full px-2 py-1.5 rounded-lg text-xs outline-none border ${
                                row.errors.some((e) => e.includes("URL"))
                                  ? "border-red-300 bg-red-50"
                                  : "border-transparent focus:border-pink-300 focus:bg-white"
                              }`}
                            />
                          </td>
                          <td className="p-1">
                            <input
                              value={row.category}
                              onChange={(e) =>
                                updateRow(row.id, "category", e.target.value)
                              }
                              className="w-full px-2 py-1.5 rounded-lg text-xs outline-none border border-transparent focus:border-pink-300 focus:bg-white"
                            />
                          </td>
                          <td className="p-1">
                            <input
                              value={row.note}
                              onChange={(e) =>
                                updateRow(row.id, "note", e.target.value)
                              }
                              className="w-full px-2 py-1.5 rounded-lg text-xs outline-none border border-transparent focus:border-pink-300 focus:bg-white"
                            />
                          </td>
                          <td className="p-2 text-center">
                            {row.errors.length > 0 ? (
                              <span
                                className="inline-block px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-[10px] font-bold"
                                title={row.errors.join(", ")}
                              >
                                ⚠ {row.errors.length}
                              </span>
                            ) : (
                              <span className="inline-block px-2 py-0.5 bg-green-100 text-green-600 rounded-full text-[10px] font-bold">
                                OK
                              </span>
                            )}
                          </td>
                          <td className="p-1 text-center">
                            <button
                              onClick={() => deleteRow(row.id)}
                              className="p-1 rounded hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 에러 행 상세 */}
              {stats.errors > 0 && (
                <div className="mt-3 p-3 bg-red-50 rounded-xl">
                  <p className="text-xs font-bold text-red-600 mb-1">
                    ⚠ 오류가 있는 행 ({stats.errors}개)
                  </p>
                  {rows
                    .filter((r) => r.errors.length > 0)
                    .map((r) => (
                      <p key={r.id} className="text-[10px] text-red-500">
                        <b>{r.name || "(이름없음)"}</b>: {r.errors.join(", ")}
                      </p>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* ======== STEP 3: 결과 ======== */}
          {step === "result" && result && (
            <div className="text-center py-4">
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
                  result.failed.length === 0 ? "bg-green-50" : "bg-yellow-50"
                }`}
              >
                {result.failed.length === 0 ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-green-500"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-yellow-500"
                  >
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" />
                  </svg>
                )}
              </div>

              <h3 className="text-xl font-black text-slate-900 mb-2">
                업로드 완료!
              </h3>

              <div className="flex items-center justify-center gap-6 mb-6">
                <div className="text-center">
                  <p className="text-2xl font-black text-green-500">
                    {result.success}
                  </p>
                  <p className="text-xs text-slate-400">성공</p>
                </div>
                {result.failed.length > 0 && (
                  <div className="text-center">
                    <p className="text-2xl font-black text-red-500">
                      {result.failed.length}
                    </p>
                    <p className="text-xs text-slate-400">실패</p>
                  </div>
                )}
              </div>

              {/* 실패 항목 */}
              {result.failed.length > 0 && (
                <div className="mb-6">
                  <div className="bg-red-50 rounded-xl p-4 text-left mb-3">
                    {result.failed.map((f, i) => (
                      <p key={i} className="text-xs text-red-600 mb-1">
                        <b>{f.name}</b> ({f.url}): {f.reason}
                      </p>
                    ))}
                  </div>
                  <button
                    onClick={downloadFailedCsv}
                    className="text-xs text-pink-500 font-bold hover:underline"
                  >
                    실패 항목 CSV 다운로드
                  </button>
                </div>
              )}

              <button
                onClick={onClose}
                className="px-8 py-3 bg-pink-500 text-white rounded-2xl font-bold hover:bg-pink-600 transition-colors"
              >
                확인
              </button>
            </div>
          )}
        </div>

        {/* 하단 버튼 (미리보기 단계) */}
        {step === "preview" && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-pink-50 shrink-0">
            <p className="text-xs text-slate-400">
              선택된 <b className="text-pink-500">{stats.selected}</b>개
              사이트를 업로드합니다
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setStep("upload");
                  setRows([]);
                }}
                className="px-4 py-2.5 bg-slate-100 text-slate-500 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading || stats.selected === 0}
                className="px-6 py-2.5 bg-pink-500 text-white rounded-xl text-sm font-bold hover:bg-pink-600 transition-colors disabled:opacity-50"
              >
                {uploading ? "업로드 중..." : `${stats.selected}개 업로드`}
              </button>
            </div>
          </div>
        )}

        {/* ======== 도움말 팝업 ======== */}
        {showHelp && (
          <div
            className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50"
            onClick={() => setShowHelp(false)}
          >
            <div
              className="bg-white rounded-3xl p-6 w-full max-w-sm mx-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-black text-slate-900 mb-4">
                📋 일괄 업로드 안내
              </h3>

              <div className="flex flex-col gap-3 text-xs text-slate-600">
                <div>
                  <p className="font-bold text-slate-900 mb-1">
                    지원 파일 형식
                  </p>
                  <p>.csv, .xlsx, .xls</p>
                </div>

                <div>
                  <p className="font-bold text-slate-900 mb-1">
                    필수 열 (1~2열)
                  </p>
                  <p>
                    • <b>사이트명</b> (첫 번째 열) — 필수
                  </p>
                  <p>
                    • <b>사이트 링크</b> (두 번째 열) — 필수
                  </p>
                </div>

                <div>
                  <p className="font-bold text-slate-900 mb-1">
                    선택 열 (3~4열)
                  </p>
                  <p>
                    • <b>카테고리</b> (세 번째 열) — 비어있으면 "미분류"
                  </p>
                  <p>
                    • <b>설명</b> (네 번째 열) — 선택
                  </p>
                </div>

                <div className="bg-yellow-50 rounded-xl p-3">
                  <p className="font-bold text-yellow-700 mb-1">⚠ 주의사항</p>
                  <p className="text-yellow-600">
                    • 첫 번째 행은 헤더로 인식됩니다
                  </p>
                  <p className="text-yellow-600">
                    • 사이트명과 링크는 필수입니다
                  </p>
                  <p className="text-yellow-600">
                    • 링크에 https://가 없으면 자동 추가됩니다
                  </p>
                  <p className="text-yellow-600">
                    • 한 번에 최대 100개까지 가능합니다
                  </p>
                  <p className="text-yellow-600">
                    • 이미 등록된 URL은 중복 표시됩니다
                  </p>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => {
                    downloadTemplate();
                    setShowHelp(false);
                  }}
                  className="flex-1 py-2.5 bg-pink-50 text-pink-500 rounded-xl text-sm font-bold hover:bg-pink-100 transition-colors"
                >
                  양식 다운로드
                </button>
                <button
                  onClick={() => setShowHelp(false)}
                  className="flex-1 py-2.5 bg-pink-500 text-white rounded-xl text-sm font-bold hover:bg-pink-600 transition-colors"
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
