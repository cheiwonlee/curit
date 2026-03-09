// ============================================================
// components/SiteCard.tsx — 사이트 카드 컴포넌트
//
// HTML 원본 대응:
//   <a href="${item.url}" target="_blank" class="card-hover group ...">
//     <div>이미지</div>
//     <div>이름 + 설명</div>
//   </a>
//
// React에서 달라진 점:
//   - HTML 문자열 → JSX 요소
//   - onerror="this.src='...'" 인라인 핸들러
//     → onError 이벤트 + useState로 이미지 에러 상태 관리
//   - loading="lazy" 추가 → 성능 개선
// ============================================================

import { useState } from 'react';
// ↑ useState: React의 상태 관리 Hook
//   → 값이 바뀌면 컴포넌트가 자동으로 다시 렌더링됨

import { SiteItem } from '../types';

interface SiteCardProps {
  item: SiteItem;  // 하나의 사이트 정보 (name, url, note)
}

export default function SiteCard({ item }: SiteCardProps) {
  // ============================================================
  // 이미지 에러 상태 관리
  //
  // const [변수명, 변경함수] = useState(초기값);
  //
  // imgError: 이미지 로딩이 실패했는지 여부 (true/false)
  // setImgError: imgError 값을 변경하는 함수
  //
  // HTML 원본에서는:
  //   onerror="this.src='...fallback...'"  ← DOM을 직접 수정
  // React에서는:
  //   상태를 바꾸면 → React가 알아서 화면을 다시 그림
  // ============================================================
  const [imgError, setImgError] = useState(false);

  // ============================================================
  // 썸네일 URL 생성
  //
  // thum.io: URL을 넣으면 해당 사이트의 스크린샷을 반환하는 외부 서비스
  //
  // imgError가 true면 (로딩 실패 시):
  //   → 카테고리 구분 없이 동일한 폴백 이미지 사용
  //   → 개선: 카테고리별 다른 폴백 이미지 또는 아이콘+그라디언트
  // ============================================================
  const thumbnailUrl = imgError
    ? 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&q=80'
    : `https://image.thum.io/get/width/400/crop/800/noanimate/${item.url}`;

  return (
    // ============================================================
    // 카드 전체를 감싸는 <a> 태그
    //
    // href={item.url}: 클릭하면 해당 사이트로 이동
    // target="_blank": 새 탭에서 열기
    // rel="noopener noreferrer": 보안 속성 (새 탭에서 원본 페이지 접근 방지)
    //   → HTML 원본에는 없었지만, target="_blank"와 함께 쓰는 것이 보안 모범 사례
    //
    // group: Tailwind 그룹 호버
    //   → 이 <a>에 마우스를 올리면,
    //     자식 요소에서 group-hover:로 스타일 변경 가능
    //   예: 카드에 마우스 올리면 → 이미지가 확대되고, 이름 색상이 바뀜
    //
    // card-hover: CSS에서 정의한 커스텀 클래스
    //   → hover 시 translateY(-8px)로 카드가 위로 올라가는 효과
    // ============================================================
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="card-hover group flex flex-col h-full bg-white border border-pink-50 rounded-[2rem] p-5 hover:border-pink-300 hover:shadow-2xl hover:shadow-pink-100/50"
    >
      {/* --------------------------------------------------------
          썸네일 이미지 영역
          
          aspect-[16/10]: 가로세로 비율 16:10 유지
          overflow-hidden: 이미지가 영역을 넘으면 잘라냄
          
          loading="lazy": 
          → HTML 원본에 없던 성능 개선!
          → 이 이미지가 화면에 보일 때만 로딩 시작
          → 페이지 첫 로딩 시 70개를 동시에 안 불러와도 됨
          
          group-hover:scale-110: 
          → 카드에 마우스 올리면 이미지가 110%로 확대
          → overflow-hidden 덕분에 넘치는 부분은 잘려서 보임
          → "줌인" 효과
          
          onError={() => setImgError(true)}:
          → 이미지 로딩 실패 시 imgError를 true로 변경
          → 컴포넌트가 다시 렌더링되면서 thumbnailUrl이 폴백으로 바뀜
          
          HTML 원본과의 비교:
            원본: onerror="this.src='...'" ← DOM 직접 수정
            React: onError → 상태 변경 → 자동 재렌더링
      -------------------------------------------------------- */}
      <div className="aspect-[16/10] rounded-2xl overflow-hidden mb-5 bg-pink-50/30">
        <img
          src={thumbnailUrl}
          alt={`${item.name} 미리보기`}
          loading="lazy"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
      </div>

      {/* --------------------------------------------------------
          텍스트 영역
          flex-1: 남은 공간을 차지 (카드 높이가 균일하게)
      -------------------------------------------------------- */}
      <div className="flex flex-col flex-1">
        {/* 사이트 이름 + 외부 링크 화살표 아이콘 */}
        <div className="flex items-center justify-between mb-3 gap-2">
          <h4 className="text-lg font-black text-slate-900 group-hover:text-pink-500 transition-colors leading-tight">
            {item.name}
          </h4>
          {/* 외부 링크 화살표 아이콘 (↗) */}
          <div className="shrink-0 p-1.5 bg-pink-50 rounded-lg group-hover:bg-pink-100 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-pink-300 group-hover:text-pink-600">
              <path d="M7 17L17 7M17 7H7M17 7V17"/>
            </svg>
          </div>
        </div>

        {/* 사이트 설명 */}
        <p className="text-slate-400 text-xs font-medium leading-relaxed group-hover:text-pink-400/80">
          {item.note}
        </p>
      </div>
    </a>
  );
}
