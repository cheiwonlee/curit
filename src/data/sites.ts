// ============================================================
// data/sites.ts — 사이트 데이터 파일
//
// HTML 원본에서는 <script> 태그 안에 데이터가 UI 코드와 섞여 있었음
// → 데이터를 별도 파일로 분리하면:
//   1. 데이터만 수정할 때 UI 코드를 건드릴 필요 없음
//   2. 나중에 Supabase DB로 교체할 때 이 파일만 바꾸면 됨
//   3. 다른 컴포넌트에서도 import해서 재사용 가능
//
// import 방법:
//   import { websiteData } from '../data/sites';
// ============================================================

import { Category } from '../types';
// ↑ 위에서 정의한 Category 타입을 가져옴
//   Category[] = Category 타입의 배열

/**
 * 전체 사이트 데이터
 * 
 * Category[] 타입을 명시함으로써:
 * - 배열의 각 요소가 { category, id, items } 구조인지 검증
 * - items의 각 요소가 { name, url, note } 구조인지 검증
 * - 오타나 누락된 필드가 있으면 빨간 밑줄로 알려줌
 */
export const websiteData: Category[] = [
  {
    category: "폰트 & 타이포그래피",
    id: "font",
    items: [
      { name: "눈누", url: "https://noonnu.cc", note: "상업적 이용이 가능한 무료 한글 폰트를 한눈에 비교하고 체험해보는 필수 사이트." },
      { name: "산돌구름", url: "https://www.sandollcloud.com/", note: "국내 최대 폰트 플랫폼으로, 기업·지자체의 무료 서체를 전용 앱으로 편리하게 관리." },
      { name: "폰코(FONCO)", url: "https://font.co.kr/", note: "윤디자인그룹 운영 플랫폼. 폰코자키 클라우드 앱을 통해 트렌디한 서체들을 바로 사용." },
      { name: "AI 한글 폰트 검색", url: "https://www.sandollcloud.com/#schpop", note: "이미지 속 한글 폰트를 AI가 분석하여 가장 유사한 폰트 이름을 찾아주는 서비스." },
      { name: "캘리 한글", url: "https://callifont.com/", note: "전문 작가들의 감성적인 한글 캘리그라피 폰트와 소스 제공." },
      { name: "네이버 글꼴", url: "https://hangeul.naver.com/font", note: "나눔고딕부터 마루 부리까지, 네이버가 직접 제작하여 배포하는 고품질 국민 서체 시리즈." },
      { name: "일본 이모티콘", url: "http://kaomoji.ru/en/", note: "텍스트 기반의 아기자기한 아스키 이모티콘을 카테고리별로 제공." },
      { name: "SNS 키보드", url: "https://snskeyboard.com/instafont.php", note: "인스타 프로필용 특수문자 폰트 및 감성 이모티콘 생성." },
      { name: "Creative Tacos", url: "https://creativetacos.com/", note: "세련된 느낌의 해외 무료 영문 폰트 리소스 공유 사이트." },
    ],
  },
  {
    category: "템플릿 & 디자인 리소스",
    id: "design-resource",
    items: [
      { name: "미리캔버스", url: "https://www.miricanvas.com/", note: "한국어 특화 디자인 툴. 카드뉴스, 유튜브 썸네일 등 국내용 템플릿 풍부." },
      { name: "Canva", url: "https://www.canva.com", note: "글로벌 1위 디자인 플랫폼. 방대한 스톡 사진과 AI 디자인 기능 강화." },
      { name: "로고메이커", url: "https://onlinelogomaker.com", note: "웹에서 간편하게 로고를 디자인하고 다운로드할 수 있는 제작 도구." },
      { name: "Floorplanner", url: "https://floorplanner.com/demo", note: "2D/3D 평면도를 그려 가구 배치와 인테리어 시뮬레이션이 가능한 툴." },
      { name: "어피니티 디자인", url: "https://affinity.serif.com/en-us/designer/", note: "어도비 일러스트레이터의 강력한 대안. 전문적인 벡터 그래픽 작업 가능." },
      { name: "Eagle", url: "https://kr.eagle.cool/", note: "수만 장의 레퍼런스 이미지를 태그와 색상별로 정리하는 디자이너 필수 자산 관리 툴." },
      { name: "양식 예스폼", url: "https://www.yesform.com/", note: "비즈니스 문서, 계약서, 인사말 등 실무에 필요한 모든 표준 문서 양식 제공." },
      { name: "망고보드", url: "https://www.mangoboard.net/", note: "인포그래픽 및 데이터 시각화에 특화된 제작 도구." },
      { name: "Minimal Mockups", url: "https://minimalmockups.com/", note: "전자기기 및 패키지의 군더더기 없는 깔끔한 디자인 목업 소스 제공." },
      { name: "Unblast", url: "https://unblast.com/", note: "폰트, 아이콘, 목업 등 전 세계 디자이너들의 고퀄리티 무료 리소스 선별 사이트." },
      { name: "InspirationGrid", url: "https://theinspirationgrid.com", note: "전 세계 창작자들의 뛰어난 디자인을 한눈에 보는 레퍼런스 가이드." },
      { name: "Branding Style Guides", url: "http://brandingstyleguides.com", note: "글로벌 브랜드들의 디자인 정체성이 담긴 실제 가이드북 모음." },
    ],
  },
  {
    category: "이미지 편집 & 변형",
    id: "image-edit",
    items: [
      { name: "Photopea", url: "https://www.photopea.com/", note: "별도 설치 없이 웹에서 바로 쓰는 무료 온라인 포토샵." },
      { name: "Remove.bg", url: "https://remove.bg/ko", note: "AI 기술로 5초 만에 이미지 배경을 깔끔하게 제거하는 도구." },
      { name: "포요포요 (GIF 메이커)", url: "http://poyopoyo.gifanimaker.com/", note: "사진이 포용포용 움직이게 만들어주는 재미있는 GIF 생성 사이트." },
      { name: "Restore Photos", url: "https://restorephotos.io/restore", note: "흐릿한 사진이나 저해상도 인물 사진을 AI로 선명하게 복구." },
      { name: "도트 그림 변환기", url: "https://app.monopro.org/pixel/", note: "사진을 픽셀 아트(도트화) 스타일로 즉석 변환해주는 도구." },
      { name: "Unscreen", url: "https://www.unscreen.com/", note: "영상이나 GIF의 배경을 AI가 자동으로 지워주는 도구." },
      { name: "Picular", url: "https://picular.co/", note: "단어 검색 시 연상되는 컬러 칩들을 추출해주는 색상 검색기." },
      { name: "ColorSpace", url: "https://mycolor.space/", note: "메인 컬러 입력 시 어울리는 다양한 팔레트를 자동 생성." },
    ],
  },
  {
    category: "사진 & 멀티미디어",
    id: "assets",
    items: [
      { name: "Pixabay", url: "https://pixabay.com", note: "상업적 이용 가능한 무료 이미지, 벡터, 일러스트 제공 대표 사이트." },
      { name: "Unsplash", url: "https://unsplash.com", note: "감성적이고 예술적인 고해상도 사진이 가득한 디자인 성지." },
      { name: "무료 효과음", url: "https://soundeffect-lab.info/", note: "다양한 고품질 효과음을 카테고리별로 무료로 받을 수 있는 사운드 리소스." },
      { name: "지브리 이미지", url: "https://www.ghibli.jp/info/013344/", note: "스튜디오 지브리가 공식 배포한 명작 애니메이션 장면들(400장)." },
      { name: "저작권 만료 명화", url: "https://www.artic.edu/collection", note: "시카고 미술관 소장품 중 저작권이 만료된 명화 초고화질 다운로드." },
      { name: "Flaticon", url: "https://www.flaticon.com", note: "다양한 스타일의 무료 아이콘과 벡터 파일을 제공하는 세계적 사이트." },
      { name: "일본 일러스트", url: "https://www.irasutoya.com/", note: "일본 특유의 귀엽고 아기자기한 이라스토야 일러스트 제공." },
    ],
  },
  {
    category: "강의 & 교육",
    id: "education",
    items: [
      { name: "인프런", url: "https://www.inflearn.com/", note: "IT, 비즈니스, 디자인 등 실무 지향적 강의가 많은 국내 최대 학습 플랫폼." },
      { name: "패스트캠퍼스", url: "https://fastcampus.co.kr/", note: "실무 밀착형 교육으로 커리어 성장을 돕는 성인 교육 전문 브랜드." },
      { name: "RISS", url: "https://www.riss.kr/index.do", note: "국내외 학위 논문 및 학술지 검색을 위한 학술연구정보서비스." },
      { name: "CBT 컴활 기출", url: "https://www.comcbt.com/", note: "자격증 필기 기출문제 풀이 서비스. 컴활 등 독학 시 필수." },
      { name: "KOCW", url: "http://www.kocw.net/", note: "국내외 대학 및 기관의 공개 강의를 무료로 수강할 수 있는 서비스." },
      { name: "생활코딩", url: "https://opentutorials.org/", note: "코딩의 원리를 가장 쉽고 친절하게 알려주는 입문자용 무료 교육." },
      { name: "해커랭크", url: "https://www.hackerrank.com/products/developer-skills-platform/", note: "글로벌 기업 채용 시 자주 활용되는 개발 역량 테스트 및 연습 플랫폼." },
      { name: "코드그라운드", url: "https://www.codeground.org/about", note: "삼성전자 등에서 운영하는 알고리즘 문제 풀이 및 프로그래밍 연습 사이트." },
    ],
  },
  {
    category: "부동산 정보",
    id: "real-estate",
    items: [
      { name: "청약홈", url: "https://www.applyhome.co.kr/co/coa/selectMainView.do", note: "아파트 청약 신청 및 당첨 확인을 위한 한국부동산원 공식 서비스." },
      { name: "학구도안내서비스", url: "https://schoolzone.emac.kr/gis/gis.do", note: "주소 입력 시 배정받는 학교와 통학 거리 정보를 제공하는 GIS 서비스." },
      { name: "디스코", url: "https://www.disco.re/", note: "전국 토지 및 빌딩 실거래 내역과 토지대장 정보를 한눈에 보는 앱." },
      { name: "부동산공시가격알리미", url: "https://www.realtyprice.kr/notice/main/main.do", note: "공동주택 및 개별단독주택의 공시가격을 조회하는 공식 창구." },
      { name: "국토교통부 실거래가", url: "http://rt.molit.go.kr/", note: "아파트, 주택, 오피스텔, 분양권 등 국토부 공식 실거래가 데이터 제공." },
      { name: "법원경매정보", url: "https://www.courtauction.go.kr/", note: "공식 경매 공고, 입찰기일 등 법원 경매의 모든 정보 제공." },
      { name: "지지옥션 (유료)", url: "http://www.ggi.co.kr/", note: "단지 정보 및 시세, 상세 권리분석 사이트가 연동된 경매 전문 플랫폼." },
      { name: "호갱노노", url: "https://hogangnono.com/", note: "아파트 실거주 후기 및 입지 분석 특화 앱." },
      { name: "인터넷등기소", url: "http://www.iros.go.kr/", note: "등기부등본 열람, 발급 및 확정일자 부여 신청 필수." },
    ],
  },
  {
    category: "취업 & 커리어",
    id: "job",
    items: [
      { name: "자소설닷컴", url: "https://jasoseol.com/", note: "채용 일정 관리와 글자 수 체크 기능을 제공하는 자소서 작성 툴." },
      { name: "잡플래닛", url: "https://www.jobplanet.co.kr/", note: "전/현직자가 남긴 기업 리뷰, 면접 경험, 연봉 정보 검증 사이트." },
      { name: "링커리어", url: "https://linkareer.com/", note: "대외활동, 공모전 공고와 합격 자소서 데이터베이스 보유." },
      { name: "코멘토", url: "https://comento.kr/?index", note: "현직자의 멘토링과 직무 부트캠프를 통해 취업 역량을 키우는 커뮤니티." },
      { name: "피플앤잡", url: "https://www.peoplenjob.com/", note: "외국계 기업 및 글로벌 채용 소식이 가장 활발하게 공유되는 곳." },
      { name: "사람인", url: "https://www.saramin.co.kr/zf_user/", note: "풍부한 공고량과 맞춤 채용 정보를 제공하는 국내 대표 구인구직 포털." },
      { name: "잡코리아", url: "https://www.jobkorea.co.kr/", note: "방대한 기업 데이터베이스와 합격 지원 전략을 제공하는 구인 사이트." },
      { name: "NCS", url: "https://www.ncs.go.kr/unity/th03/ncsSearchMain.do", note: "국가직무능력표준 검색 및 직업 기초 능력 정보를 제공하는 공공기관 필수 코스." },
    ],
  },
  {
    category: "경제 & 트렌드",
    id: "trend",
    items: [
      { name: "NEWNEEK (뉴닉)", url: "https://newneek.co/", note: "어려운 시사 뉴스를 친구처럼 쉽고 친절하게 풀어주는 뉴스레터." },
      { name: "Carret (캐릿)", url: "https://www.careet.net/", note: "MZ세대와 소통하기 위한 최신 유행과 트렌드를 가장 빠르게 전달하는 곳." },
      { name: "DAILY BITE", url: "https://www.mydailybyte.com/", note: "핵심적인 비즈니스 및 경제 소식을 짧고 굵게 요약해주는 메일링." },
      { name: "The Economist", url: "https://www.economist.com/", note: "깊이 있는 통찰력을 제공하는 세계적인 영국 경제 주간지." },
      { name: "CNBC", url: "https://www.cnbc.com/world/?region=world", note: "실시간 비즈니스 뉴스와 세계 시장 흐름을 파악하기 위한 정석." },
      { name: "Marketwatch", url: "https://www.marketwatch.com/", note: "주식 시장 분석과 개인 재무 관리에 최적화된 경제 정보 포털." },
      { name: "네이버 금융 산업 분석", url: "https://finance.naver.com/research/industry_list.naver?&page=1", note: "각 증권사에서 발행하는 전문적인 산업군별 리서치 리포트 모음." },
      { name: "하나은행 블로그", url: "https://blog.hanabank.com/", note: "생활 금융 상식부터 재테크 팁까지 유용한 금융 정보 블로그." },
      { name: "한국산업은행 미래전략연구소", url: "https://rd.kdb.co.kr/index.jsp", note: "국내외 거시 경제 및 산업 동향에 관한 국책 은행의 전문 분석 자료." },
      { name: "IBK 경제연구소", url: "http://research.ibk.co.kr/research", note: "중소기업 중심의 경제 분석과 최신 경영 트렌드를 제공하는 연구소." },
      { name: "금융경제연구소", url: "https://fei.or.kr/", note: "금융 산업과 노동 경제에 관한 학술적 분석과 연구를 수행하는 기관." },
    ],
  },
  {
    category: "유틸리티 & 생활",
    id: "utility",
    items: [
      { name: "bitly", url: "https://bitly.com/", note: "길고 복잡한 URL을 짧고 깔끔하게 줄여주고 클릭 수 추적 기능을 제공하는 툴." },
      { name: "정부24", url: "https://www.gov.kr/portal/main", note: "등본 발급부터 건축물대장까지 다양한 민원 서류를 온라인으로 처리." },
      { name: "When2meet", url: "https://www.when2meet.com/", note: "여러 명의 가능한 시간을 투표로 받아 미팅 시간을 조율하는 툴." },
      { name: "Smallpdf", url: "https://smallpdf.com", note: "PDF 변환, 합치기, 압축을 한 곳에서 해결하는 만능 오피스 툴." },
      { name: "네이비즘", url: "https://time.navyism.com", note: "수강신청이나 티켓팅의 승패를 결정짓는 서버 시간 확인기." },
      { name: "맞춤법 검사기", url: "https://alldic.daum.net/grammar_checker.do", note: "가장 신뢰받는 한국어 맞춤법 및 문법 교정 서비스." },
      { name: "Internet Archive", url: "https://web.archive.org", note: "웨이백 머신을 통해 사라진 사이트나 웹사이트의 과거 모습 탐험." },
    ],
  },
];
