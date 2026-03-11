// ============================================================
// src/types/index.ts — 타입 정의 (v2: 회원 + 즐겨찾기 추가)
// ============================================================

/** sites 테이블 */
export interface SiteItem {
  id: number;
  category_id: number;
  name: string;
  url: string;  
  note: string;
  sort_order: number;
  thumbnail_url: string | null;
  tags: string | null;           // 유사 검색어용 태그 (쉼표 구분)
}

/** categories 테이블 */
export interface CategoryRow {
  id: number;
  name: string;
  slug: string;
  sort_order: number;
}

/** 화면 표시용 (카테고리 + 소속 사이트들) */
export interface CategoryWithSites {
  id: number;
  name: string;
  slug: string;
  sort_order: number;
  items: SiteItem[];
}

/** profiles 테이블 */
export interface Profile {
  id: string;
  nickname: string | null;
  avatar_url: string | null;
  username: string | null;    // ← 추가
}

/** favorites 테이블 */
export interface Favorite {
  id: number;
  user_id: string;
  site_id: number;
}
