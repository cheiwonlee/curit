// ============================================================
// src/lib/supabase.ts — Supabase 클라이언트 설정
//
// 이 파일은 Supabase에 접속하기 위한 "연결 통로"를 만드는 곳
// 
// 비유: 식당에 전화하려면 전화번호가 필요하듯이,
//       Supabase에 접속하려면 URL과 키가 필요함
//
// 이 파일은 한 번만 만들면 됨. 다른 파일에서 import해서 사용.
// ============================================================

import { createClient } from '@supabase/supabase-js';

// .env 파일에서 환경 변수 읽기
// import.meta.env: Vite에서 환경 변수에 접근하는 방법
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Supabase 클라이언트 생성 (앱 전체에서 이 하나만 사용)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
