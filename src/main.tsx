// ============================================================
// main.tsx — React 애플리케이션의 진입점 (Entry Point)
//
// HTML 원본에서는:
//   <body> 안에 모든 HTML이 직접 작성되어 있고
//   <script> 태그 안에 JS가 실행됨
//
// React에서는:
//   index.html에 <div id="root"></div> 하나만 있고,
//   이 파일에서 React가 그 <div> 안에 전체 앱을 그려넣음
//
// 이 파일은 거의 건드릴 일 없음
// ============================================================

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';  // 글로벌 CSS (Tailwind + 커스텀 스타일)

// ============================================================
// React 앱을 #root 요소에 마운트(mount)
//
// createRoot: React 18의 새로운 렌더링 방식
// StrictMode: 개발 중 잠재적 문제를 감지해주는 래퍼
//   → 프로덕션에서는 영향 없음, 개발 편의 기능
// ============================================================
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
