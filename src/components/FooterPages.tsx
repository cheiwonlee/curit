// ============================================================
// src/components/FooterPages.tsx — 푸터 페이지들
//
// guide, faq, privacy, terms 4가지 페이지를 하나의 컴포넌트로 관리
// ============================================================

import { useState } from 'react';
import CuritLogo from './CuritLogo';

type PageType = 'guide' | 'faq' | 'privacy' | 'terms';

interface FooterPagesProps {
  page: PageType;
  onBack: () => void;
}

export default function FooterPages({ page, onBack }: FooterPagesProps) {
  const titles: Record<PageType, string> = {
    guide: '사용 가이드',
    faq: '자주 묻는 질문',
    privacy: '개인정보 처리방침',
    terms: '이용약관',
  };

  return (
    <div className="min-h-screen bg-[#FFF5F7] text-slate-800">
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
            <h2 className="text-lg font-bold text-pink-900">{titles[page]}</h2>
          </div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 pt-28 pb-40">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-lg border border-pink-50">
          {page === 'guide' && <GuidePage />}
          {page === 'faq' && <FaqPage />}
          {page === 'privacy' && <PrivacyPage />}
          {page === 'terms' && <TermsPage />}
        </div>
      </main>
    </div>
  );
}

// ============================================================
// 사용 가이드
// ============================================================
function GuidePage() {
  return (
    <div className="prose-pink">
      <h1 className="text-3xl font-black text-slate-900 mb-8">사용 가이드</h1>

      <Section title="curit이란?">
        curit은 디자인, 취업, 부동산, 재테크 등 카테고리별로 유용한 사이트를 큐레이션하여 보여주는 서비스입니다.
        흩어진 좋은 사이트들을 한곳에서 검색하고, 즐겨찾기하고, 나만의 컬렉션을 만들어보세요.
      </Section>

      <Section title="사이트 둘러보기">
        홈 화면에서 카테고리별로 정리된 사이트들을 둘러볼 수 있습니다.
        상단의 카테고리 탭을 클릭하면 해당 카테고리 위치로 스크롤 이동합니다.
        검색바에 키워드를 입력하면 사이트명, 설명, 태그에서 관련 사이트를 찾아줍니다.
      </Section>

      <Section title="정렬 기능">
        카테고리 탭 왼쪽의 정렬 버튼을 클릭하면 다양한 정렬 옵션을 선택할 수 있습니다.
        카테고리순(기본), 가나다순(ㄱ→ㅎ, ㅎ→ㄱ), 최근 등록순으로 정렬이 가능합니다.
      </Section>

      <Section title="북마크함">
        마음에 드는 사이트의 하트(♥) 버튼을 클릭하면 북마크함에 저장됩니다.
        상단의 [북마크함] 버튼에서 저장한 사이트들을 모아볼 수 있으며,
        카테고리별 필터와 검색 기능도 제공됩니다.
        (로그인이 필요합니다.)
      </Section>

      <Section title="나만의 사이트">
        [내 사이트] 기능을 통해 본인만의 사이트 목록을 관리할 수 있습니다.
        사이트명, 링크, 카테고리, 설명을 입력하여 추가하고,
        CSV 파일로 다운로드도 가능합니다.
        (로그인이 필요합니다.)
      </Section>

      <Section title="사이트 등록 신청">
        유용한 사이트를 발견하셨나요? 페이지 하단의 [사이트 등록 신청]을 통해
        curit에 새로운 사이트를 추천해주세요.
        직접 정보를 입력하거나, 추천글 링크를 공유하거나, 이메일로 신청할 수 있습니다.
      </Section>

      <Section title="카테고리 순서 변경">
        정렬 드롭다운에서 [순서 편집]을 선택하면
        카테고리의 표시 순서를 내 취향대로 변경할 수 있습니다.
        변경한 순서는 내 브라우저에 저장됩니다.
      </Section>
    </div>
  );
}

// ============================================================
// FAQ
// ============================================================
function FaqPage() {
  const faqs = [
    {
      q: '로그인은 어떻게 하나요?',
      a: 'Google 계정으로 간편 로그인하거나,\n이메일로 회원가입 후 아이디/비밀번호로 로그인할 수 있습니다.',
    },
    {
      q: '비밀번호를 잊어버렸어요.',
      a: '로그인 화면에서 [비밀번호 찾기]를 통해 이메일 인증 후 비밀번호를 재설정할 수 있습니다.\nGoogle 계정 사용자는 비밀번호가 없으며, Google로 로그인하시면 됩니다.',
    },
    {
      q: '북마크한 사이트가 안 보여요.',
      a: '북마크 기능은 로그인 상태에서만 사용 가능합니다.\n로그인 후 홈 화면에서 사이트 카드의 하트 버튼을 눌러 북마크해보세요.',
    },
    {
      q: '사이트를 추천하고 싶어요.',
      a: '페이지 하단의 [사이트 등록 신청]을 통해 추천할 수 있습니다.\n관리자 검토 후 반영됩니다.',
    },
    {
      q: '등록된 사이트 정보가 잘못되었어요.',
      a: 'curit.help@gmail.com으로 메일을 보내주시면 수정하겠습니다.',
    },
    {
      q: '회원 탈퇴는 어떻게 하나요?',
      a: 'curit.help@gmail.com으로 탈퇴 요청 메일을 보내주시면 처리해드립니다.',
    },
    {
      q: '나만의 사이트 데이터는 안전한가요?',
      a: '모든 데이터는 Supabase 클라우드에 안전하게 저장됩니다. 또한 CSV 다운로드 기능으로 백업을 받아둘 수 있습니다.',
    },
    {
      q: '바탕화면에 바로가기를 만들 수 있나요?',
      a: '네! 크롬 브라우저에서 주소창 오른쪽의 설치 아이콘을 클릭하거나, 메뉴 → [앱 설치]를 선택하면 바탕화면에 curit 아이콘이 생깁니다.',
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-black text-slate-900 mb-8">자주 묻는 질문</h1>
      <div className="flex flex-col gap-4">
        {faqs.map((faq, i) => (
          <FaqItem key={i} q={faq.q} a={faq.a} />
        ))}
      </div>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-pink-100 rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-pink-50/50 transition-colors">
        <span className="text-sm font-bold text-slate-900">{q}</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`text-pink-300 transition-transform shrink-0 ml-4 ${open ? 'rotate-180' : ''}`}>
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>
      {open && (
        <div className="px-6 pb-4">
          <p className="text-sm text-slate-500 leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

// ============================================================
// 개인정보 처리방침
// ============================================================
function PrivacyPage() {
  return (
    <div className="prose-pink">
      <h1 className="text-3xl font-black text-slate-900 mb-2">개인정보 처리방침</h1>
      <p className="text-sm text-slate-400 mb-8">시행일: 2026년 3월 1일</p>

      <Section title="1. 수집하는 개인정보">
        curit은 서비스 제공을 위해 다음의 개인정보를 수집합니다.
        회원가입 시: 이메일 주소, 이름, 닉네임, 아이디
        Google 로그인 시: 이메일 주소, 이름, 프로필 사진 URL
        서비스 이용 시: 북마크 정보, 나만의 사이트 목록
      </Section>

      <Section title="2. 개인정보의 이용 목적">
        수집된 개인정보는 다음의 목적으로 이용됩니다.
        회원 식별 및 로그인 처리, 서비스 제공 (북마크, 나만의 사이트),
        서비스 개선 및 통계 분석 (비식별 처리 후)
      </Section>

      <Section title="3. 개인정보의 보관 및 파기">
        회원 탈퇴 시 개인정보는 즉시 파기됩니다.
        다만, 관계 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다.
      </Section>

      <Section title="4. 개인정보의 제3자 제공">
        curit은 이용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다.
      </Section>

      <Section title="5. 데이터 보안">
        모든 데이터는 Supabase 클라우드에 암호화되어 저장되며,
        비밀번호는 bcrypt 해싱으로 안전하게 관리됩니다.
        HTTPS를 통한 암호화 통신을 사용합니다.
      </Section>

      <Section title="6. 쿠키 사용">
        curit은 로그인 세션 유지를 위해 브라우저 저장소(localStorage)를 사용합니다.
        광고 목적의 쿠키는 사용하지 않습니다.
      </Section>

      <Section title="7. 이용자의 권리">
        이용자는 언제든지 자신의 개인정보를 조회, 수정, 삭제할 수 있습니다.
        마이페이지에서 닉네임, 프로필 사진 등을 수정할 수 있으며,
        회원 탈퇴를 원하시면 curit.help@gmail.com으로 연락해주세요.
      </Section>

      <Section title="8. 문의">
        개인정보 관련 문의: curit.help@gmail.com
      </Section>
    </div>
  );
}

// ============================================================
// 이용약관
// ============================================================
function TermsPage() {
  return (
    <div className="prose-pink">
      <h1 className="text-3xl font-black text-slate-900 mb-2">이용약관</h1>
      <p className="text-sm text-slate-400 mb-8">시행일: 2026년 3월 1일</p>

      <Section title="제1조 (목적)">
        이 약관은 curit(이하 "서비스")의 이용과 관련하여
        서비스 제공자와 이용자 간의 권리, 의무 및 책임 사항을 규정함을 목적으로 합니다.
      </Section>

      <Section title="제2조 (서비스의 내용)">
        curit은 유용한 웹사이트를 카테고리별로 큐레이션하여 제공하는 서비스입니다.
        북마크, 나만의 사이트 관리, 사이트 등록 신청 등의 부가 기능을 제공합니다.
      </Section>

      <Section title="제3조 (회원가입 및 계정)">
        서비스 이용을 위해 이메일 또는 Google 계정으로 회원가입할 수 있습니다.
        회원은 자신의 계정 정보를 안전하게 관리할 책임이 있습니다.
        타인의 계정을 무단으로 사용하는 행위는 금지됩니다.
      </Section>

      <Section title="제4조 (이용자의 의무)">
        이용자는 서비스를 이용함에 있어 다음 행위를 하여서는 안 됩니다.
        타인의 개인정보를 수집, 저장, 공개하는 행위,
        서비스의 정상적인 운영을 방해하는 행위,
        허위 정보를 등록하는 행위,
        기타 법령에 위반되는 행위
      </Section>

      <Section title="제5조 (서비스의 변경 및 중단)">
        서비스 제공자는 서비스의 내용을 변경하거나 중단할 수 있으며,
        이 경우 사전에 공지합니다.
        서비스 중단 시 이용자의 개인 데이터(나만의 사이트 등)는
        CSV 파일로 다운로드받을 수 있도록 안내합니다.
      </Section>

      <Section title="제6조 (링크 사이트에 대한 책임)">
        curit에 등록된 외부 사이트의 내용, 서비스, 개인정보 처리에 대해서는
        해당 사이트의 운영자에게 책임이 있으며, curit은 이에 대해 책임지지 않습니다.
      </Section>

      <Section title="제7조 (저작권)">
        curit 서비스의 디자인, 코드, 콘텐츠에 대한 저작권은 서비스 제공자에게 있습니다.
        등록된 사이트의 로고, 이미지 등의 저작권은 해당 사이트 운영자에게 있습니다.
      </Section>

      <Section title="제8조 (면책)">
        curit은 링크 큐레이션 서비스로, 등록된 사이트의 품질, 안전성, 적법성을 보장하지 않습니다.
        이용자는 외부 사이트 이용 시 본인의 판단과 책임 하에 이용해야 합니다.
      </Section>

      <Section title="제9조 (약관의 변경)">
        이 약관은 필요에 따라 변경될 수 있으며, 변경 시 서비스 내 공지합니다.
      </Section>

      <Section title="문의">
        서비스 관련 문의: curit.help@gmail.com
      </Section>
    </div>
  );
}

// 공통 섹션 컴포넌트
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-black text-slate-900 mb-3">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed whitespace-pre-line">{children}</p>
    </div>
  );
}