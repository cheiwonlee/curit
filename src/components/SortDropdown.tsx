// ============================================================
// src/components/SortDropdown.tsx — 정렬 드롭다운 (순서 편집 포함)
// ============================================================

import { useState, useRef, useEffect } from 'react';

export type SortMode = 'category' | 'asc' | 'desc' | 'recent';

interface SortDropdownProps {
  value: SortMode;
  onChange: (mode: SortMode) => void;
  onReorderClick?: () => void;
}

const OPTIONS: { value: SortMode; label: string }[] = [
  { value: 'category', label: '카테고리순' },
  { value: 'asc', label: '가나다순 (ㄱ→ㅎ)' },
  { value: 'desc', label: '가나다순 (ㅎ→ㄱ)' },
  { value: 'recent', label: '최근 등록순' },
];

export default function SortDropdown({ value, onChange, onReorderClick }: SortDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const currentLabel = OPTIONS.find((o) => o.value === value)?.label || '정렬';

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-white border border-pink-100 text-pink-500 hover:border-pink-300 transition-all"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18M6 12h12M9 18h6"/>
        </svg>
        {currentLabel}
        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${open ? 'rotate-180' : ''}`}>
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-10 bg-white rounded-2xl shadow-xl border border-pink-100 py-2 z-50 min-w-[170px]">
          {OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-colors ${
                value === opt.value
                  ? 'text-pink-600 bg-pink-50 font-bold'
                  : 'text-slate-500 hover:bg-pink-50 hover:text-pink-500'
              }`}
            >
              {value === opt.value && <span className="mr-2">✓</span>}
              {opt.label}
            </button>
          ))}

          {/* 구분선 + 순서 편집 */}
          {onReorderClick && (
            <>
              <div className="h-px bg-pink-100 mx-3 my-1" />
              <button
                onClick={() => { onReorderClick(); setOpen(false); }}
                className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-400 hover:bg-pink-50 hover:text-pink-500 transition-colors"
              >
                <span className="mr-2">✎</span>
                순서 편집
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}