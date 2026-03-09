// ============================================================
// src/types/index.ts — 타입 정의 (DB 스키마에 맞춤)
//
// 이전 버전과의 차이:
//   이전: { category: string, id: string, items: SiteItem[] }
//   지금: DB 테이블 구조에 맞춰서 id가 숫자, category_id로 연결
// ============================================================

/** sites 테이블의 한 행 */
export interface SiteItem {
  id: number;
  category_id: number;
  name: string;
  url: string;
  note: string;
  sort_order: number;
}

/** categories 테이블의 한 행 */
export interface CategoryRow {
  id: number;
  name: string;        // "폰트 & 타이포그래피"
  slug: string;        // "font"
  sort_order: number;
}

/** 화면에 표시할 때 사용하는 형태 (카테고리 + 소속 사이트들) */
export interface CategoryWithSites {
  id: number;
  name: string;
  slug: string;
  sort_order: number;
  items: SiteItem[];
}
