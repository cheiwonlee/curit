// ============================================================
// components/SearchBar.tsx — 검색바 컴포넌트
//
// HTML 원본 대응:
//   <input id="searchInput" type="text" placeholder="..." />
//   + searchInput.addEventListener('input', render);
//
// React에서 달라진 점:
//   - getElementById 대신 → props로 값을 받음
//   - addEventListener 대신 → onChange 이벤트 핸들러
//   - 외부에서 render()를 호출할 필요 없음
//     → 상태(state)가 바뀌면 React가 자동으로 다시 그림
// ============================================================

/**
 * Props 타입 정의
 * 
 * Props = 부모 컴포넌트가 자식에게 전달하는 데이터
 * 
 * 비유: 함수의 매개변수와 같음
 *   function add(a: number, b: number) ← a, b가 매개변수
 *   <SearchBar value="..." onChange={...} /> ← value, onChange가 props
 */
interface SearchBarProps {
  value: string;                              // 현재 검색어 (부모가 관리)
  onChange: (value: string) => void;          // 검색어가 바뀔 때 부모에게 알리는 함수
  // (value: string) => void 의미:
  //   - string 타입의 value를 받아서
  //   - void(아무것도) 반환하지 않는 함수
}

/**
 * SearchBar 컴포넌트
 * 
 * 구조: 돋보기 아이콘 + 검색 input
 * 
 * HTML 원본과의 차이:
 *   원본: searchInput.value를 직접 읽음 (DOM 직접 접근)
 *   React: props.value로 값을 받고, props.onChange로 변경을 알림
 *   → "제어 컴포넌트(Controlled Component)" 패턴이라고 부름
 *   → 데이터의 흐름이 항상 부모 → 자식 방향 (단방향)
 */
export default function SearchBar({ value, onChange }: SearchBarProps) {
  // ↑ { value, onChange }: Props 객체를 구조분해(destructuring)
  //   props.value, props.onChange 대신 바로 value, onChange로 사용

  return (
    <div className="relative flex-1 w-full max-w-2xl">
      {/* --------------------------------------------------------
          돋보기 아이콘
          - absolute: 부모(relative) 기준으로 절대 위치
          - left-4 top-1/2 -translate-y-1/2: 왼쪽 16px, 세로 중앙
          
          주의: React에서는 class 대신 className을 사용
          이유: class는 JavaScript 예약어(클래스 선언에 사용)이므로
      -------------------------------------------------------- */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-300">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {/* 
            주의: SVG 속성도 camelCase로 변환
            stroke-width → strokeWidth
            stroke-linecap → strokeLinecap
            이유: JSX는 JavaScript이므로 하이픈(-)이 빼기 연산자로 해석됨
          */}
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      </div>

      {/* --------------------------------------------------------
          검색 입력창
          
          value={value}: 부모가 전달한 검색어를 표시
          onChange={...}: 사용자가 타이핑할 때마다 실행
          
          HTML 원본과의 비교:
            원본: <input id="searchInput" ... />
                  searchInput.addEventListener('input', render);
            React: <input value={value} onChange={e => onChange(e.target.value)} />
          
          e.target.value 설명:
            e = 이벤트 객체
            e.target = 이벤트가 발생한 요소 (이 input)
            e.target.value = input에 입력된 텍스트
      -------------------------------------------------------- */}
      <input
        type="text"
        placeholder="찾고 있는 서비스나 키워드를 검색해보세요..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-pink-50/50 border border-transparent focus:bg-white focus:border-pink-300 rounded-2xl pl-12 pr-4 py-3 text-sm transition-all outline-none placeholder:text-pink-200"
      />
    </div>
  );
}
