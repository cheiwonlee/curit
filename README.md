<div align="center">

# ⭐ curit

**쓸만한 사이트, 여기 다 큐릿했어요.**

디자인, 취업, 부동산, 재테크까지 — 흩어진 좋은 사이트들을 한곳에.
검색하고, 즐겨찾기하고, 나만의 링크 컬렉션을 만들어보세요.

[![Deploy](https://img.shields.io/badge/deploy-Vercel-black?logo=vercel)](https://www.cur-it.duckdns.org)
[![Stack](https://img.shields.io/badge/stack-React%20+%20TypeScript-blue?logo=react)](https://reactjs.org)
[![DB](https://img.shields.io/badge/DB-Supabase-3ECF8E?logo=supabase)](https://supabase.com)

[**🔗 사이트 바로가기**](https://www.cur-it.duckdns.org) · [**📮 문의하기**](mailto:curit.help@gmail.com)

</div>

---

## 📌 소개

**curit**(큐릿)은 카테고리별로 유용한 사이트를 큐레이션하여 보여주는 웹 서비스입니다.

> curit = **cur**ation + **it** — "좋은 사이트를 골라 모으다"

- 🔍 **검색** — 사이트명, 설명, 태그로 원하는 사이트를 빠르게 찾기
- ♥ **북마크** — 마음에 드는 사이트를 저장하여 나만의 컬렉션 만들기
- 📁 **내 사이트** — 개인 사이트 목록 관리 + 엑셀 다운로드
- 💡 **사이트 추천** — 유용한 사이트를 curit에 추천하기

---

## 🖥️ 스크린샷

| 메인 페이지 | 북마크함 | 마이페이지 |
|:-----------:|:--------:|:----------:|
| 카테고리별 사이트 그리드 | 북마크한 사이트 모아보기 | 프로필 관리 + 회원탈퇴 |

---

## ✨ 주요 기능

### 사이트 탐색
- 9개 카테고리, 117개+ 큐레이션된 사이트
- 정렬 (카테고리순 / 가나다순 / 최근 등록순)
- 카테고리 순서 커스텀 (드래그 & 버튼)
- 스크롤 시 카테고리 탭 자동 하이라이트
- 모바일 최적화 (네비 숨김, 검색바 축소, 카테고리 토글)

### 인증
- Google OAuth 로그인 (앱 내 브라우저 감지 + 외부 브라우저 유도)
- 이메일 회원가입 (OTP 인증번호)
- 아이디 또는 이메일로 로그인
- 아이디 찾기 / 비밀번호 재설정
- 회원탈퇴

### 북마크함
- 하트(♥) 버튼으로 즐겨찾기
- 카테고리별 필터 + 검색
- 기존 사이트 + 내 사이트 북마크 통합 표시

### 나만의 사이트
- 개인 사이트 추가 / 수정 / 삭제
- CSV/XLSX 일괄 업로드 (드래그 앤 드롭, 미리보기, 셀 수정, 중복 체크)
- 엑셀 양식 다운로드 (카테고리 드롭다운)
- CSV 엑셀 다운로드
- 선택 모드 (일괄 삭제 / 사이트 추천하기)

### 사이트 추천하기
- 직접 입력 (링크 + 이름 + 카테고리 + 설명)
- 추천글 링크 입력 (트윗 등)
- 이메일 신청

### 기타
- PWA 지원 (바탕화면 바로가기)
- 닉네임 랜덤 생성 (🎲)
- Scroll to Top / Bottom 버튼
- 브라우저 뒤로가기 지원 (모든 서브 페이지)
- 서브 페이지 최상단 표시 + 메인 스크롤 위치 유지
- 푸터 (사용 가이드, FAQ, 개인정보 처리방침, 이용약관, 쿠키 정책)

---

## 🛠️ 기술 스택

| 영역 | 기술 |
|------|------|
| **Frontend** | React 18 · TypeScript · Vite |
| **Styling** | Tailwind CSS v4 |
| **Backend / DB** | Supabase (PostgreSQL · Auth · Storage) |
| **Deploy** | Vercel |
| **Domain** | DuckDNS |
| **Spreadsheet** | SheetJS (읽기) · ExcelJS (쓰기) |

---

## 📁 프로젝트 구조

```
src/
├── lib/
│   └── supabase.ts                # Supabase 클라이언트
├── types/
│   └── index.ts                   # TypeScript 타입 정의
├── hooks/
│   ├── useActiveSection.ts        # 스크롤 기반 카테고리 감지
│   └── useScrollDirection.ts      # 모바일 네비 숨김/표시
├── utils/
│   └── randomNickname.ts          # 닉네임 랜덤 생성기
├── components/
│   ├── SearchBar.tsx              # 검색바
│   ├── CategoryTabs.tsx           # 카테고리 탭
│   ├── SiteCard.tsx               # 사이트 카드
│   ├── SortDropdown.tsx           # 정렬 드롭다운
│   ├── ScrollToTopButton.tsx      # ↑↓ 스크롤 버튼
│   ├── AuthModal.tsx              # 로그인 모달
│   ├── SignupPage.tsx             # 회원가입
│   ├── PasswordResetPage.tsx      # 아이디/비밀번호 찾기
│   ├── NavButtons.tsx             # 네비게이션 버튼
│   ├── CuritLogo.tsx              # 공통 로고
│   ├── MyPage.tsx                 # 마이페이지
│   ├── FavoritesPage.tsx          # 북마크함
│   ├── MySitesPage.tsx            # 나만의 사이트
│   ├── BulkUploadModal.tsx        # 일괄 업로드
│   ├── SiteRequestPage.tsx        # 사이트 추천하기
│   ├── CategoryReorderPage.tsx    # 카테고리 순서 변경
│   └── FooterPages.tsx            # 가이드/FAQ/개인정보/이용약관/쿠키
├── App.tsx                        # 메인 앱
├── main.tsx                       # 엔트리 포인트
└── index.css                      # 글로벌 스타일
```

---

## 🗄️ DB 스키마

| 테이블 | 설명 |
|--------|------|
| `categories` | 사이트 카테고리 (9개) |
| `sites` | 큐레이션된 사이트 (~117개) |
| `profiles` | 회원 프로필 (닉네임, 아이디, 프로필 사진) |
| `favorites` | 사이트 북마크 |
| `user_sites` | 나만의 사이트 (개인 보관함) |
| `user_site_favorites` | 나만의 사이트 북마크 |
| `site_requests` | 사이트 추천 신청 |

### SQL 함수 (RPC)
- `check_username()` — 아이디 중복 확인
- `check_email_exists()` — 이메일 중복 확인 (구글 계정 포함)
- `get_email_by_username()` — 아이디로 이메일 조회 (로그인)
- `get_username_by_email()` — 이메일로 아이디 찾기
- `delete_own_account()` — 회원탈퇴

---

## 🚀 로컬 실행

```bash
# 1. 클론
git clone https://github.com/lxvxxu/curit.git
cd curit

# 2. 의존성 설치
npm install

# 3. 환경 변수 설정
cp .env.example .env
# .env 파일에 Supabase URL과 ANON KEY 입력

# 4. 개발 서버 실행
npm run dev
```

### 환경 변수

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 📜 사이트 카테고리

| 카테고리 | 사이트 수 |
|----------|:---------:|
| 폰트 & 타이포그래피 | 9 |
| 템플릿 & 디자인 리소스 | 22 |
| 이미지 편집 & 변형 | 11 |
| 사진 & 멀티미디어 | 11 |
| 강의 & 교육 | 18 |
| 부동산 정보 | 9 |
| 취업 & 커리어 | 22 |
| 경제 & 트렌드 | 11 |
| 유틸리티 & 생활 | 9 |

---

## 🔐 보안

- 비밀번호 bcrypt 해싱 (Supabase Auth)
- HTTPS 통신 (Vercel)
- RLS (Row Level Security) 모든 테이블 적용
- 환경 변수로 API 키 관리
- 앱 내 브라우저 Google OAuth 차단 감지 + 안내

---

## 📮 문의

- **이메일**: curit.help@gmail.com
- **이슈**: [GitHub Issues](https://github.com/lxvxxu/curit/issues)

---

<div align="center">

**© 2026 curit. All rights reserved.**

*당신의 북마크를 큐레이션합니다.*

</div>
