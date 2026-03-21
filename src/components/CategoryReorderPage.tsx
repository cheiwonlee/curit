// ============================================================
// src/components/CategoryReorderPage.tsx — 카테고리 순서 변경
//
// 사용자가 카테고리 순서를 드래그(또는 버튼)로 변경
// 순서는 localStorage에 저장 (개인 설정)
// ============================================================

import { useState } from 'react';
import CuritLogo from './CuritLogo';

interface CategoryReorderPageProps {
  categories: { id: number; name: string; slug: string }[];
  onBack: () => void;
  onSave: (orderedIds: number[]) => void;
}

export default function CategoryReorderPage({ categories, onBack, onSave }: CategoryReorderPageProps) {
  const [items, setItems] = useState(categories);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);

  // 위로 이동
  const moveUp = (index: number) => {
    if (index === 0) return;
    const next = [...items];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    setItems(next);
    setSaved(false);
  };

  // 아래로 이동
  const moveDown = (index: number) => {
    if (index === items.length - 1) return;
    const next = [...items];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    setItems(next);
    setSaved(false);
  };

  // 드래그 시작
  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  // 드래그 오버
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    const next = [...items];
    const dragged = next.splice(dragIndex, 1)[0];
    next.splice(index, 0, dragged);
    setItems(next);
    setDragIndex(index);
    setSaved(false);
  };

  // 저장
  const handleSave = () => {
    const orderedIds = items.map((item) => item.id);
    localStorage.setItem('curit-category-order', JSON.stringify(orderedIds));
    onSave(orderedIds);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // 초기화
  const handleReset = () => {
    setItems(categories);
    localStorage.removeItem('curit-category-order');
    onSave([]);
    setSaved(false);
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
            <h2 className="text-lg font-bold text-pink-900">카테고리 순서 변경</h2>
          </div>
        </div>
      </div>

      <main className="max-w-lg mx-auto px-4 pt-28 pb-40">
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-pink-50 mb-6">
          <p className="text-sm text-slate-400 mb-6">드래그하거나 화살표 버튼으로 순서를 변경하세요.</p>

          <div className="flex flex-col gap-2">
            {items.map((item, index) => (
              <div
                key={item.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={() => setDragIndex(null)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all cursor-grab active:cursor-grabbing ${
                  dragIndex === index
                    ? 'border-pink-400 bg-pink-50 shadow-md'
                    : 'border-pink-100 bg-white hover:border-pink-200'
                }`}
              >
                {/* 드래그 핸들 */}
                <div className="text-pink-200 shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/>
                    <circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/>
                    <circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/>
                  </svg>
                </div>

                {/* 순번 */}
                <span className="text-xs font-bold text-pink-300 w-6 text-center shrink-0">{index + 1}</span>

                {/* 카테고리명 */}
                <span className="flex-1 text-sm font-bold text-slate-700">{item.name}</span>

                {/* 위/아래 버튼 */}
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    className="p-1 rounded hover:bg-pink-50 text-slate-400 hover:text-pink-500 disabled:opacity-20 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 15l-6-6-6 6"/></svg>
                  </button>
                  <button
                    onClick={() => moveDown(index)}
                    disabled={index === items.length - 1}
                    className="p-1 rounded hover:bg-pink-50 text-slate-400 hover:text-pink-500 disabled:opacity-20 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M6 9l6 6 6-6"/></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            className={`flex-1 py-3 rounded-2xl font-bold transition-all ${
              saved ? 'bg-green-500 text-white' : 'bg-pink-500 text-white hover:bg-pink-600'
            }`}
          >
            {saved ? '✓ 저장 완료!' : '이 순서로 저장'}
          </button>
          <button
            onClick={handleReset}
            className="px-6 py-3 bg-white border border-pink-200 text-pink-500 rounded-2xl font-bold hover:bg-pink-50 transition-colors"
          >
            초기화
          </button>
        </div>
      </main>
    </div>
  );
}