"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// 더미 영역별 최근 피드백 데이터
const AREA_FEEDBACKS = [
  {
    id: "delivery",
    icon: "🎤",
    name: "전달력",
    feedback: "발음이 명확하고 적절한 속도로 설명하고 있습니다. 중요 개념 강조 시 톤 변화가 효과적입니다."
  },
  {
    id: "interaction",
    icon: "💬",
    name: "상호작용",
    feedback: "개방형 질문을 자주 활용하고 있습니다. 더 다양한 학생에게 발표 기회를 주면 좋겠습니다."
  },
  {
    id: "attitude",
    icon: "🙂",
    name: "태도",
    feedback: "학생들과 눈 맞춤을 잘 유지하며 친근한 표정으로 수업을 진행하고 있습니다."
  },
  {
    id: "content",
    icon: "📋",
    name: "교수·학습 구성",
    feedback: "도입부에서 학습 목표를 명확히 제시했습니다. 정리 단계에서 요약을 추가하면 더 효과적입니다."
  },
  {
    id: "board",
    icon: "📊",
    name: "판서/자료",
    feedback: "시각 자료가 학습 내용과 잘 연결되어 있습니다. 핵심 키워드 강조 색상을 활용해보세요."
  },
  {
    id: "habit",
    icon: "🔄",
    name: "수업 습관",
    feedback: "설명 중 '자, 그러면'이라는 표현이 자주 반복됩니다. 다양한 전환 표현을 활용해보세요."
  }
];

export default function DashboardPage() {
  const router = useRouter();
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const handleLogout = () => {
    router.push("/");
  };

  return (
    <div className="dashboard-v2">
      {/* 상단바 */}
      <header className="topbar-v2">
        <div className="topbar-left">
          <img src="/logo.svg" alt="Logo" className="topbar-logo" />
          <h1 className="topbar-title">AI 수업실연 피드백 시스템</h1>
        </div>
        <div className="topbar-account">
          <button
            className="account-btn"
            onClick={() => setAccountMenuOpen(!accountMenuOpen)}
          >
            내 계정
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
          {accountMenuOpen && (
            <div className="account-dropdown">
              <button onClick={() => router.push("/mypage")}>마이페이지</button>
              <button onClick={handleLogout}>로그아웃</button>
            </div>
          )}
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="dashboard-content-v2">
        {/* 상단 네비게이션 */}
        <div className="dashboard-nav-bar">
          <button className="back-to-xr-btn" onClick={() => router.push("/xr_int_dashboard")}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            통합 대시보드로 돌아가기
          </button>
        </div>

        {/* 메인 기능 카드들 */}
        <section className="feature-cards">
          {/* 새 분석 시작 카드 */}
          <div className="feature-card primary-card" onClick={() => router.push("/prepare")}>
            <div className="card-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <polygon points="23 7 16 12 23 17 23 7" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
            </div>
            <div className="card-content">
              <h3>수업 영상 분석하기</h3>
              <p>수업 영상을 업로드하고 AI 피드백을 받아보세요</p>
            </div>
            <div className="card-arrow">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          {/* 영역별 최근 피드백 그리드 */}
          <div className="feedback-areas-grid">
            <div className="feedback-areas-header">
              <h3>📋 영역별 최근 피드백</h3>
              <span className="last-updated">최근 분석: 2026.01.10</span>
            </div>
            <div className="areas-grid-v2">
              {AREA_FEEDBACKS.map((area) => (
                <div key={area.id} className="area-feedback-card">
                  <div className="area-header">
                    <span className="area-icon-v2">{area.icon}</span>
                    <span className="area-name-v2">{area.name}</span>
                  </div>
                  <p className="area-feedback-text">{area.feedback}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 부가 기능 카드들 */}
          <div className="secondary-cards">
            <div className="feature-card secondary-card">
              <div className="card-icon small">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              </div>
              <div className="card-content">
                <h4>피드백 가이드</h4>
                <p>효과적인 수업을 위한 팁</p>
              </div>
            </div>

            <div className="feature-card secondary-card">
              <div className="card-icon small">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <div className="card-content">
                <h4>도움말</h4>
                <p>서비스 이용 안내</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
