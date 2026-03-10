// ============================================================
// components/SiteCard.tsx — 사이트 카드 컴포넌트 (v2)
//
// v1 대비 추가된 점:
//   - FavoriteButton (하트) 통합
//   - thumbnail_url 3단계 폴백 유지
//   - 카드 내부에 relative 추가 (하트 버튼 절대 위치용)
// ============================================================

import { useState } from 'react';
import FavoriteButton from './FavoriteButton';

interface SiteCardProps {
  item: { id: number; name: string; url: string; note: string; thumbnail_url?: string | null };
  isFavorited: boolean;
  userId: string | null;
  onToggleFavorite: (siteId: number) => void;
  onLoginRequired: () => void;
}

export default function SiteCard({ item, isFavorited, userId, onToggleFavorite, onLoginRequired }: SiteCardProps) {
  const [imgError, setImgError] = useState(false);

  // 썸네일 URL 우선순위 (3단계 폴백)
  // 1순위: DB에 저장한 직접 스크린샷
  // 2순위: thum.io 자동 생성
  // 3순위: 그라디언트 플레이스홀더
  const thumbnailUrl = imgError
    ? null
    : item.thumbnail_url || `https://image.thum.io/get/width/400/crop/800/noanimate/${item.url}`;

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="card-hover group relative flex flex-col h-full bg-white border border-pink-50 rounded-[2rem] p-5 hover:border-pink-300 hover:shadow-2xl hover:shadow-pink-100/50"
    >
      {/* 썸네일 영역 (relative로 하트 버튼 위치 기준) */}
      <div className="relative aspect-[16/10] rounded-2xl overflow-hidden mb-5 bg-pink-50/30">
        {/* 즐겨찾기 하트 버튼 */}
        <FavoriteButton
          siteId={item.id}
          isFavorited={isFavorited}
          userId={userId}
          onToggle={onToggleFavorite}
          onLoginRequired={onLoginRequired}
        />

        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={`${item.name} 미리보기`}
            loading="lazy"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-pink-100 to-rose-50 flex items-center justify-center">
            <span className="text-pink-300 font-black text-lg text-center px-4">{item.name}</span>
          </div>
        )}
      </div>

      {/* 텍스트 영역 */}
      <div className="flex flex-col flex-1">
        <div className="flex items-center justify-between mb-3 gap-2">
          <h4 className="text-lg font-black text-slate-900 group-hover:text-pink-500 transition-colors leading-tight">
            {item.name}
          </h4>
          <div className="shrink-0 p-1.5 bg-pink-50 rounded-lg group-hover:bg-pink-100 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-pink-300 group-hover:text-pink-600">
              <path d="M7 17L17 7M17 7H7M17 7V17"/>
            </svg>
          </div>
        </div>
        <p className="text-slate-400 text-xs font-medium leading-relaxed group-hover:text-pink-400/80">
          {item.note}
        </p>
      </div>
    </a>
  );
}
