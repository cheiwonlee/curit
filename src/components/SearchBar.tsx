// ============================================================
// components/SearchBar.tsx — 검색바 (curit 브랜딩)
// ============================================================

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative flex-1 w-full max-w-2xl">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-300">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      </div>
      <input
        type="text"
        placeholder="어떤 사이트를 찾고 있나요?"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-pink-50/50 border border-transparent focus:bg-white focus:border-pink-300 rounded-2xl pl-12 pr-4 py-3 text-sm transition-all outline-none placeholder:text-pink-200"
      />
    </div>
  );
}