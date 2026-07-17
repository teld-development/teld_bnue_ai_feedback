"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// VR 기반 예비교사 실습 (문제상황 기반) 더미 데이터
const VR_PRACTICE_DATA = [
    {
        id: 1,
        scenario: "학습 동기 저하 상황",
        date: "2026.01.15",
        duration: "12분 34초",
        feedbackSummary: "학생들의 관심을 끌기 위한 다양한 전략을 시도했습니다.",
        feedback: [
            {
                category: "잘한 점",
                icon: "✅",
                items: [
                    "학생 관심 유도를 위해 다양한 질문을 활용했습니다.",
                    "긍정적 피드백 제공이 우수했습니다.",
                    "학생들의 반응을 주의 깊게 관찰하며 수업을 진행했습니다."
                ]
            },
            {
                category: "개선할 점",
                icon: "💡",
                items: [
                    "개별 학생 특성을 고려한 맞춤형 접근이 필요합니다.",
                    "동기 저하의 원인을 파악하기 위한 질문을 추가해보세요."
                ]
            },
            {
                category: "실천 전략",
                icon: "🎯",
                items: [
                    "수업 초반에 학생들의 관심사와 연결된 도입 활동을 계획해보세요.",
                    "성공 경험을 제공하는 단계적 과제를 활용해보세요."
                ]
            }
        ]
    },
    {
        id: 2,
        scenario: "수업 방해 행동 대응",
        date: "2026.01.12",
        duration: "15분 22초",
        feedbackSummary: "차분하고 일관된 태도로 방해 행동에 대응했습니다.",
        feedback: [
            {
                category: "잘한 점",
                icon: "✅",
                items: [
                    "차분하고 일관된 태도를 유지했습니다.",
                    "명확한 규칙 안내가 효과적이었습니다.",
                    "개인 면담 시도가 적절했습니다."
                ]
            },
            {
                category: "개선할 점",
                icon: "💡",
                items: [
                    "비언어적 신호 활용을 확대해 보세요.",
                    "방해 행동의 근본 원인 파악이 필요합니다."
                ]
            },
            {
                category: "실천 전략",
                icon: "🎯",
                items: [
                    "긍정적 행동 강화를 통한 예방적 접근을 시도해보세요.",
                    "학생과의 관계 형성에 더 많은 시간을 투자해보세요."
                ]
            }
        ]
    },
    {
        id: 3,
        scenario: "학습 수준 차이 대응",
        date: "2026.01.08",
        duration: "18분 45초",
        feedbackSummary: "수준별 접근을 시도하며 모든 학생의 참여를 이끌어냈습니다.",
        feedback: [
            {
                category: "잘한 점",
                icon: "✅",
                items: [
                    "수준별 과제 제시가 적절했습니다.",
                    "또래 학습 활용이 효과적이었습니다.",
                    "학습 속도에 따른 유연한 진행이 좋았습니다."
                ]
            },
            {
                category: "개선할 점",
                icon: "💡",
                items: [
                    "상위 학습자를 위한 심화 활동을 추가해보세요.",
                    "학습 부진 학생에 대한 개별 지원 시간을 확보해보세요."
                ]
            },
            {
                category: "실천 전략",
                icon: "🎯",
                items: [
                    "선택형 과제를 통해 학생 자율성을 높여보세요.",
                    "멘토-멘티 활동을 정기적으로 운영해보세요."
                ]
            }
        ]
    }
];

// 오프라인 수업 실연 더미 데이터
const OFFLINE_PRACTICE_DATA = [
    {
        id: 1,
        lesson: "과학 - 물의 상태 변화",
        date: "2026.01.14",
        duration: "40분",
        grade: "3학년",
        feedbackSummary: "실험 활동과 설명이 조화롭게 구성된 수업이었습니다.",
        areas: [
            {
                label: "전달력",
                icon: "🎤",
                feedback: "발음이 명확하고 목소리 크기가 적절합니다. 핵심 개념을 설명할 때 속도를 조절한 점이 효과적이었습니다."
            },
            {
                label: "상호작용",
                icon: "💬",
                feedback: "다양한 학생 참여 활동을 계획했습니다. 질문 후 충분한 대기 시간을 주어 학생들이 생각할 여유를 가졌습니다."
            },
            {
                label: "교수·학습 구성",
                icon: "📋",
                feedback: "도입-전개-정리 단계가 명확합니다. 학습 목표와 활동 간의 연결이 자연스러웠습니다."
            },
            {
                label: "자료 활용",
                icon: "📊",
                feedback: "시각 자료와 실험 도구를 효과적으로 활용했습니다. 실물 자료를 더 추가하면 학생 이해도가 높아질 것입니다."
            },
            {
                label: "시간 관리",
                icon: "⏱️",
                feedback: "전체 시간 배분이 적절합니다. 정리 단계에서 핵심 내용 요약 시간을 확보한 점이 좋았습니다."
            }
        ],
        overallFeedback: "과학적 개념을 일상생활과 연결하여 설명한 점이 인상적입니다. 학생들의 호기심을 자극하는 발문을 더 활용해보세요."
    },
    {
        id: 2,
        lesson: "수학 - 분수의 덧셈",
        date: "2026.01.10",
        duration: "40분",
        grade: "4학년",
        feedbackSummary: "개념 설명과 연습 활동의 균형이 좋은 수업이었습니다.",
        areas: [
            {
                label: "전달력",
                icon: "🎤",
                feedback: "핵심 개념 설명이 명확합니다. 수학 용어를 학생 수준에 맞게 풀어서 설명했습니다."
            },
            {
                label: "상호작용",
                icon: "💬",
                feedback: "개방형 질문을 자주 활용했습니다. 오답에 대해서도 긍정적으로 피드백하여 학생들이 자유롭게 답변했습니다."
            },
            {
                label: "교수·학습 구성",
                icon: "📋",
                feedback: "학습 목표가 명확히 제시되었습니다. 단계별 예시 문제의 난이도 조절이 적절했습니다."
            },
            {
                label: "자료 활용",
                icon: "📊",
                feedback: "분수 모델을 활용한 시각화가 좋았습니다. 구체물 활용을 확대하면 개념 이해에 도움이 될 것입니다."
            },
            {
                label: "시간 관리",
                icon: "⏱️",
                feedback: "전개 부분이 충실했습니다. 정리 단계에 더 많은 시간을 배분하여 학생들의 이해도를 확인해보세요."
            }
        ],
        overallFeedback: "분수 개념을 피자나 케이크로 비유한 점이 학생들의 이해를 도왔습니다. 실생활 문제를 더 추가하면 좋겠습니다."
    }
];

// 종합 피드백 요약
const FEEDBACK_SUMMARY = {
    totalPractices: 5,
    vrPractices: 3,
    offlinePractices: 2,
    lastUpdated: "2026.01.15",
    keyStrengths: [
        {
            area: "학생과의 소통",
            description: "개방형 질문과 긍정적 피드백을 통해 학생 참여를 이끌어내는 능력이 뛰어납니다."
        },
        {
            area: "수업 진행력",
            description: "명확한 설명과 적절한 속도로 학생들이 내용을 이해하기 쉽게 전달합니다."
        }
    ],
    keyImprovements: [
        {
            area: "개별화 지도",
            description: "학생별 수준과 특성을 고려한 맞춤형 접근을 더욱 강화해보세요."
        },
        {
            area: "자료 다양화",
            description: "구체물과 실물 자료를 더 활용하면 학생들의 이해도가 높아질 것입니다."
        }
    ],
    recentHighlights: [
        "문제중심 실습에서 문제상황 대응력이 꾸준히 향상되고 있습니다.",
        "수업실연에서 학생 발문 활용이 점차 자연스러워지고 있습니다.",
        "시간 관리 능력이 이전 대비 개선되었습니다."
    ]
};

export default function XRIntDashboardPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("overview");
    const [selectedVRSession, setSelectedVRSession] = useState(null);
    const [selectedOfflineSession, setSelectedOfflineSession] = useState(null);
    const [accountMenuOpen, setAccountMenuOpen] = useState(false);

    const handleXRFeedback = () => {
        alert("본 기능은 개발중입니다!");
    };

    const handleVideoFeedback = () => {
        router.push("/dashboard");
    };

    const handleLogout = () => {
        router.push("/");
    };

    return (
        <div className="xr-dashboard">
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

            {/* 액션 버튼 섹션 */}
            <div className="xr-action-buttons">
                <button className="xr-action-btn xr-btn" onClick={handleXRFeedback}>
                    <span className="action-icon">🥽</span>
                    <div className="action-text">
                        <span className="action-title">XR 실습 피드백받기</span>
                        <span className="action-desc">VR 기반 문제상황 대응 실습</span>
                    </div>
                </button>
                <button className="xr-action-btn video-btn" onClick={handleVideoFeedback}>
                    <span className="action-icon">🎬</span>
                    <div className="action-text">
                        <span className="action-title">실습 영상 피드백받기</span>
                        <span className="action-desc">수업 영상 AI 분석</span>
                    </div>
                </button>
            </div>

            {/* 탭 네비게이션 */}
            <nav className="xr-tabs">
                <button
                    className={`xr-tab ${activeTab === "overview" ? "active" : ""}`}
                    onClick={() => setActiveTab("overview")}
                >
                    💬 종합 피드백
                </button>
                <button
                    className={`xr-tab ${activeTab === "vr" ? "active" : ""}`}
                    onClick={() => setActiveTab("vr")}
                >
                    🧩 문제중심 실습
                </button>
                <button
                    className={`xr-tab ${activeTab === "offline" ? "active" : ""}`}
                    onClick={() => setActiveTab("offline")}
                >
                    🎓 수업실연
                </button>
            </nav>

            {/* 메인 컨텐츠 */}
            <main className="xr-main">
                {/* 종합 피드백 탭 */}
                {activeTab === "overview" && (
                    <div className="xr-overview">
                        {/* 실습 현황 간략 정보 */}
                        <div className="practice-summary-bar">
                            <span className="practice-count">🎯 총 {FEEDBACK_SUMMARY.totalPractices}회 실습</span>
                            <span className="practice-detail">🧩 문제중심 {FEEDBACK_SUMMARY.vrPractices}회</span>
                            <span className="practice-detail">🎓 수업실연 {FEEDBACK_SUMMARY.offlinePractices}회</span>
                        </div>

                        {/* 강점/발전 영역 좌우 배치 */}
                        <div className="feedback-highlights-row">
                            {/* 강점 피드백 */}
                            <div className="feedback-highlight-card strengths">
                                <div className="highlight-header">
                                    <span className="highlight-icon">💪</span>
                                    <h3>강점 영역</h3>
                                </div>
                                <div className="highlight-content">
                                    {FEEDBACK_SUMMARY.keyStrengths.map((item, i) => (
                                        <div key={i} className="highlight-item">
                                            <span className="highlight-area">{item.area}</span>
                                            <p className="highlight-desc">{item.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 개선점 피드백 */}
                            <div className="feedback-highlight-card improvements">
                                <div className="highlight-header">
                                    <span className="highlight-icon">🌱</span>
                                    <h3>발전 방향</h3>
                                </div>
                                <div className="highlight-content">
                                    {FEEDBACK_SUMMARY.keyImprovements.map((item, i) => (
                                        <div key={i} className="highlight-item">
                                            <span className="highlight-area">{item.area}</span>
                                            <p className="highlight-desc">{item.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* 최근 피드백 하이라이트 */}
                        <div className="recent-feedback-section">
                            <h3>📝 최근 피드백 하이라이트</h3>
                            <ul className="feedback-highlights-list">
                                {FEEDBACK_SUMMARY.recentHighlights.map((item, i) => (
                                    <li key={i}>{item}</li>
                                ))}
                            </ul>
                        </div>

                        {/* 최근 실습 피드백 미리보기 */}
                        <div className="recent-practices-preview">
                            <h3>🕒 최근 실습 피드백</h3>
                            <div className="preview-grid">
                                {VR_PRACTICE_DATA.slice(0, 2).map((item) => (
                                    <div
                                        key={`vr-${item.id}`}
                                        className="preview-card vr"
                                        onClick={() => {
                                            setSelectedVRSession(item);
                                            setActiveTab("vr");
                                        }}
                                    >
                                        <div className="preview-badge">🧩 문제중심</div>
                                        <h4>{item.scenario}</h4>
                                        <p className="preview-summary">{item.feedbackSummary}</p>
                                        <span className="preview-date">{item.date}</span>
                                    </div>
                                ))}
                                {OFFLINE_PRACTICE_DATA.slice(0, 1).map((item) => (
                                    <div
                                        key={`offline-${item.id}`}
                                        className="preview-card offline"
                                        onClick={() => {
                                            setSelectedOfflineSession(item);
                                            setActiveTab("offline");
                                        }}
                                    >
                                        <div className="preview-badge">🎓 수업실연</div>
                                        <h4>{item.lesson}</h4>
                                        <p className="preview-summary">{item.feedbackSummary}</p>
                                        <span className="preview-date">{item.date}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* 문제중심 실습 탭 */}
                {activeTab === "vr" && (
                    <div className="xr-vr-section">
                        <div className="vr-sessions-list">
                            <h3>🧩 문제중심 실습 기록</h3>
                            {VR_PRACTICE_DATA.map((session) => (
                                <div
                                    key={session.id}
                                    className={`vr-session-card ${selectedVRSession?.id === session.id ? "selected" : ""}`}
                                    onClick={() => setSelectedVRSession(session)}
                                >
                                    <div className="session-header">
                                        <span className="session-scenario">{session.scenario}</span>
                                        <span className="session-date">{session.date}</span>
                                    </div>
                                    <p className="session-summary">{session.feedbackSummary}</p>
                                    <div className="session-meta">
                                        <span className="meta-item">⏱️ {session.duration}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 상세 피드백 */}
                        {selectedVRSession && (
                            <div className="vr-detail-panel">
                                <h4>{selectedVRSession.scenario}</h4>
                                <p className="session-info">{selectedVRSession.date} | {selectedVRSession.duration}</p>

                                <div className="feedback-categories">
                                    {selectedVRSession.feedback.map((category, i) => (
                                        <div key={i} className={`feedback-category ${category.category === "잘한 점" ? "positive" : category.category === "개선할 점" ? "improve" : "action"}`}>
                                            <div className="category-header">
                                                <span className="category-icon">{category.icon}</span>
                                                <h5>{category.category}</h5>
                                            </div>
                                            <ul className="category-items">
                                                {category.items.map((item, j) => (
                                                    <li key={j}>{item}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* 수업실연 탭 */}
                {activeTab === "offline" && (
                    <div className="xr-offline-section">
                        <div className="offline-sessions-list">
                            <h3>🎓 수업실연 기록</h3>
                            {OFFLINE_PRACTICE_DATA.map((session) => (
                                <div
                                    key={session.id}
                                    className={`offline-session-card ${selectedOfflineSession?.id === session.id ? "selected" : ""}`}
                                    onClick={() => setSelectedOfflineSession(session)}
                                >
                                    <div className="session-header">
                                        <span className="session-lesson">{session.lesson}</span>
                                        <span className="session-date">{session.date}</span>
                                    </div>
                                    <p className="session-summary">{session.feedbackSummary}</p>
                                    <div className="session-meta">
                                        <span className="meta-item">🎓 {session.grade}</span>
                                        <span className="meta-item">⏱️ {session.duration}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 상세 피드백 */}
                        {selectedOfflineSession && (
                            <div className="offline-detail-panel">
                                <h4>{selectedOfflineSession.lesson}</h4>
                                <p className="lesson-info">{selectedOfflineSession.grade} | {selectedOfflineSession.date} | {selectedOfflineSession.duration}</p>

                                {/* 종합 피드백 */}
                                <div className="overall-feedback-box">
                                    <span className="overall-icon">💬</span>
                                    <p>{selectedOfflineSession.overallFeedback}</p>
                                </div>

                                {/* 영역별 피드백 */}
                                <div className="area-feedback-list">
                                    <h5>영역별 피드백</h5>
                                    {selectedOfflineSession.areas.map((area, i) => (
                                        <div key={i} className="area-feedback-item">
                                            <div className="area-feedback-header">
                                                <span className="area-icon">{area.icon}</span>
                                                <span className="area-label">{area.label}</span>
                                            </div>
                                            <p className="area-feedback-text">{area.feedback}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* 푸터 */}
            <footer className="xr-footer">
                <p>최종 업데이트: {FEEDBACK_SUMMARY.lastUpdated}</p>
            </footer>
        </div>
    );
}
