"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";

export default function AnalysisPage() {
    const router = useRouter();
    const videoRef = useRef(null);
    const chatEndRef = useRef(null);

    const [isLoading, setIsLoading] = useState(true);
    const [analysisData, setAnalysisData] = useState(null);
    const [videoUrl, setVideoUrl] = useState(null);
    const [videoName, setVideoName] = useState("");
    const [selectedTimestamp, setSelectedTimestamp] = useState(null);
    const [error, setError] = useState("");
    const [showScoreWithFeedback, setShowScoreWithFeedback] = useState(false);

    // AI 성찰 대화 상태
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState("");
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [selectedFeedbackAreas, setSelectedFeedbackAreas] = useState([]);

    // 피드백 영역 정보 (카테고리 매핑 포함)
    const FEEDBACK_AREAS_INFO = {
        delivery: { id: "delivery", label: "전달력", desc: "발성, 속도, 명확성", icon: "🎤", category: "전달력" },
        interaction: { id: "interaction", label: "상호작용", desc: "질문, 피드백, 참여 유도", icon: "💬", category: "상호작용" },
        attitude: { id: "attitude", label: "태도", desc: "시선, 자세, 표정", icon: "🙂", category: "태도" },
        content: { id: "content", label: "교수·학습 구성", desc: "수업 설계, 학습 활동", icon: "📋", category: "내용구성" },
        board: { id: "board", label: "판서/자료", desc: "시각 자료 활용", icon: "📊", category: "판서자료" },
        habit: { id: "habit", label: "수업 습관", desc: "언어 습관, 행동 패턴", icon: "🔄", category: "수업습관" },
    };

    useEffect(() => {
        // localStorage에서 프로필 설정 불러오기
        const savedProfile = localStorage.getItem("profileSettings");
        if (savedProfile) {
            const profileData = JSON.parse(savedProfile);
            setShowScoreWithFeedback(profileData.showScoreWithFeedback || false);
        }

        // sessionStorage에서 분석 결과 및 비디오 URL 로드
        const savedResult = sessionStorage.getItem("analysisResult");
        const savedVideoUrl = sessionStorage.getItem("videoUrl");
        const savedVideoName = sessionStorage.getItem("videoName");

        if (savedResult) {
            try {
                const result = JSON.parse(savedResult);
                setAnalysisData(result);
                setVideoUrl(savedVideoUrl);
                setVideoName(savedVideoName || "업로드된 영상");

                // prepareData에서 선택된 피드백 영역 로드
                const savedPrepareData = sessionStorage.getItem("prepareData");
                if (savedPrepareData) {
                    const prepareData = JSON.parse(savedPrepareData);
                    setSelectedFeedbackAreas(prepareData.feedbackAreas || []);
                }

                setTimeout(() => setIsLoading(false), 300);

                // 초기 AI 인사 메시지
                setChatMessages([{
                    role: "assistant",
                    content: "안녕하세요! 수업 실연에 대해 함께 성찰해볼까요? 🎓\n\n분석 결과를 바탕으로 궁금한 점이나 더 깊이 이야기하고 싶은 부분이 있으시면 말씀해주세요."
                }]);
            } catch (err) {
                setError("분석 결과를 불러오는 데 실패했습니다.");
                setIsLoading(false);
            }
        } else {
            setError("분석 결과가 없습니다. 영상을 먼저 업로드해주세요.");
            setIsLoading(false);
        }
    }, []);

    // 채팅 스크롤
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [chatMessages]);

    // 타임스탬프 클릭 시 영상 해당 위치로 이동
    const handleTimestampClick = (timestamp) => {
        setSelectedTimestamp(timestamp);

        if (videoRef.current && timestamp.seconds !== undefined) {
            videoRef.current.currentTime = timestamp.seconds;
            videoRef.current.play();
        }
    };

    // MM:SS 형식을 초로 변환 (seconds 필드가 없는 경우)
    const parseTimeToSeconds = (timeStr) => {
        if (!timeStr) return 0;
        const parts = timeStr.split(":");
        if (parts.length === 2) {
            return parseInt(parts[0]) * 60 + parseInt(parts[1]);
        }
        return 0;
    };

    // 카테고리별 아이콘
    const getCategoryIcon = (category) => {
        const icons = {
            "전달력": "🎤",
            "상호작용": "💬",
            "태도": "🙂",
            "내용구성": "📋",
            "판서자료": "📊",
            "수업습관": "🔄"
        };
        return icons[category] || "📌";
    };

    // 점수에 따른 색상 반환
    const getScoreColor = (score) => {
        if (score >= 85) return "#22c55e";
        if (score >= 70) return "#f59e0b";
        return "#ef4444";
    };

    // AI 채팅 전송
    const handleChatSubmit = async (e) => {
        e.preventDefault();
        if (!chatInput.trim() || isChatLoading) return;

        const userMessage = chatInput.trim();
        setChatInput("");

        // 사용자 메시지 추가
        const updatedMessages = [...chatMessages, { role: "user", content: userMessage }];
        setChatMessages(updatedMessages);
        setIsChatLoading(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: userMessage,
                    chatHistory: chatMessages, // 이전 대화 히스토리 전달
                    analysisContext: analysisData // 분석 결과 컨텍스트 전달
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "응답 생성 실패");
            }

            setChatMessages(prev => [...prev, { role: "assistant", content: data.response }]);
        } catch (err) {
            console.error("Chat error:", err);
            setChatMessages(prev => [...prev, {
                role: "assistant",
                content: "죄송합니다. 응답을 생성하는 데 문제가 발생했습니다. 다시 시도해주세요."
            }]);
        } finally {
            setIsChatLoading(false);
        }
    };

    if (isLoading) {
        return (
            <main className="analysis-page-v2">
                <div className="loading-container">
                    <div className="loading-spinner">
                        <div className="spinner"></div>
                    </div>
                    <h2 className="loading-title">분석 결과 불러오는 중...</h2>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="analysis-page-v2">
                <div className="loading-container">
                    <h2 className="loading-title">오류</h2>
                    <p className="loading-desc">{error}</p>
                    <button
                        className="btn-primary"
                        onClick={() => router.push("/upload")}
                        style={{ marginTop: "1rem" }}
                    >
                        영상 업로드하기
                    </button>
                </div>
            </main>
        );
    }

    const { timestamps = [], summary = {}, lessonPlanAnalysis = null, conditionsAnalysis = null, curriculumAnalysis = null, areaScores = {} } = analysisData || {};

    return (
        <main className={`analysis-page-v2 ${isChatOpen ? "chat-open" : ""}`}>
            {/* 헤더 */}
            <header className="analysis-header-v2">
                <div className="header-content">
                    <h1>수업 분석 결과</h1>
                    <p>{videoName}</p>
                </div>
                <div className="header-actions">
                    <button className="btn-outline" onClick={() => router.push("/dashboard")}>
                        대시보드
                    </button>
                    <button className="btn-primary-sm" onClick={() => router.push("/upload")}>
                        새 영상 분석
                    </button>
                </div>
            </header>

            {/* 메인 컨텐츠 - 한 화면에 모두 */}
            <div className="analysis-main-v2">
                {/* 상단: 비디오 + 종합 피드백 */}
                <section className="video-summary-section">
                    <div className="video-container-v2">
                        {videoUrl ? (
                            <video
                                ref={videoRef}
                                className="video-player-v2"
                                src={videoUrl}
                                controls
                            >
                                브라우저가 비디오 재생을 지원하지 않습니다.
                            </video>
                        ) : (
                            <div className="video-placeholder-v2">
                                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <polygon points="5 3 19 12 5 21 5 3" />
                                </svg>
                                <p>영상을 불러올 수 없습니다</p>
                            </div>
                        )}
                    </div>

                    <div className="summary-container-v2">
                        <h3> 종합 피드백</h3>
                        <p className="summary-overall">{summary.overall}</p>

                        <div className="summary-lists">
                            <div className="summary-block strengths">
                                <h4>💪 강점</h4>
                                <ul>
                                    {(summary.strengths || []).map((item, idx) => (
                                        <li key={idx}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                            <div className="summary-block suggestions">
                                <h4>💡 개선 제안</h4>
                                <ul>
                                    {(summary.suggestions || []).map((item, idx) => (
                                        <li key={idx}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 하단: 영역별 상세 피드백 + 교과 연계 */}
                <div className="bottom-sections-wrapper">
                    {/* 영역별 상세 피드백 컨테이너 */}
                    <section className="detailed-feedback-section">
                        <div className="detailed-feedback-header">
                            <h3>📝 영역별 상세 피드백</h3>
                            <span className="timestamps-count">{timestamps.length}개 피드백</span>
                        </div>
                        <p className="timestamps-hint-v2">타임스탬프를 클릭하면 해당 위치로 영상이 이동합니다</p>

                        <div className="feedback-areas-grid">
                            {(selectedFeedbackAreas.length > 0 ? selectedFeedbackAreas : Object.keys(FEEDBACK_AREAS_INFO)).map((areaId) => {
                                const areaInfo = FEEDBACK_AREAS_INFO[areaId];
                                if (!areaInfo) return null;

                                // 해당 영역의 타임스탬프 필터링 (카테고리명 정규화 포함)
                                const normalizeCat = (cat) => {
                                    if (!cat) return cat;
                                    const map = {
                                        "교수학습구성": "내용구성",
                                        "교수·학습구성": "내용구성",
                                        "교수·학습 구성": "내용구성",
                                        "교수학습 구성": "내용구성",
                                        "내용 구성": "내용구성",
                                        "판서/자료": "판서자료",
                                        "판서 자료": "판서자료",
                                        "판서/ 자료": "판서자료",
                                        "수업 습관": "수업습관",
                                    };
                                    return map[cat] || cat;
                                };
                                const areaTimestamps = timestamps.filter(
                                    (item) => normalizeCat(item.category) === areaInfo.category
                                );

                                return (
                                    <div key={areaId} className="feedback-area-container">
                                        <div className="feedback-area-header">
                                            <span className="feedback-area-icon">{areaInfo.icon}</span>
                                            <div className="feedback-area-title">
                                                <h4>{areaInfo.label}</h4>
                                                <span className="feedback-area-desc">{areaInfo.desc}</span>
                                            </div>
                                            {showScoreWithFeedback && areaScores[areaInfo.category] !== undefined && (
                                                <div className="feedback-area-score" style={{ color: getScoreColor(areaScores[areaInfo.category]) }}>
                                                    <svg width="40" height="40" viewBox="0 0 36 36">
                                                        <circle cx="18" cy="18" r="15.5" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                                                        <circle
                                                            cx="18" cy="18" r="15.5" fill="none"
                                                            stroke={getScoreColor(areaScores[areaInfo.category])}
                                                            strokeWidth="3"
                                                            strokeDasharray={`${(areaScores[areaInfo.category] / 100) * 97.4} 97.4`}
                                                            strokeLinecap="round"
                                                            transform="rotate(-90 18 18)"
                                                        />
                                                    </svg>
                                                    <span className="score-value">{areaScores[areaInfo.category]}</span>
                                                </div>
                                            )}
                                            <span className="feedback-area-count">{areaTimestamps.length}개</span>
                                        </div>

                                        <div className="feedback-area-content">
                                            {areaTimestamps.length > 0 ? (
                                                areaTimestamps.map((item, index) => {
                                                    const seconds = item.seconds ?? parseTimeToSeconds(item.time);
                                                    const isSelected = selectedTimestamp === item;

                                                    return (
                                                        <div
                                                            key={index}
                                                            className={`timestamp-card-mini ${isSelected ? "selected" : ""}`}
                                                            onClick={() => handleTimestampClick({ ...item, seconds })}
                                                        >
                                                            <span className="time-badge-mini">{item.time}</span>
                                                            <p className="timestamp-feedback-mini">{item.feedback}</p>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div className="no-feedback-message">
                                                    <span>이 영역에 대한 피드백이 없습니다</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* 지도안-수업 정합성 분석 섹션 (지도안이 있을 때만 표시) */}
                    {lessonPlanAnalysis && (
                        <section className="lesson-plan-section">
                            <div className="lesson-plan-header">
                                <span className="lesson-plan-icon">📄</span>
                                <h3>지도안-수업 정합성 분석</h3>
                                <span className={`consistency-badge ${lessonPlanAnalysis.overallConsistency === '높음' ? 'high' : lessonPlanAnalysis.overallConsistency === '보통' ? 'medium' : 'low'}`}>
                                    {lessonPlanAnalysis.overallConsistency}
                                </span>
                            </div>
                            <p className="lesson-plan-summary">{lessonPlanAnalysis.summary}</p>

                            <div className="lesson-plan-details">
                                <div className="lp-block matches">
                                    <h4>✅ 지도안과 일치한 부분</h4>
                                    <ul>
                                        {(lessonPlanAnalysis.matches || []).map((item, idx) => (
                                            <li key={idx}>{item}</li>
                                        ))}
                                    </ul>
                                </div>

                                {lessonPlanAnalysis.deviations && lessonPlanAnalysis.deviations.length > 0 && (
                                    <div className="lp-block deviations">
                                        <h4>⚠️ 지도안과 다르게 진행된 부분</h4>
                                        <ul>
                                            {lessonPlanAnalysis.deviations.map((item, idx) => (
                                                <li key={idx}>{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <div className="lp-block suggestions">
                                    <h4>💡 지도안 활용 개선 제안</h4>
                                    <ul>
                                        {(lessonPlanAnalysis.suggestions || []).map((item, idx) => (
                                            <li key={idx}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* 조건 충족 분석 섹션 (조건이 있을 때만 표시) */}
                    {conditionsAnalysis && conditionsAnalysis.length > 0 && (
                        <section className="conditions-analysis-section">
                            <div className="conditions-analysis-header">
                                <span className="conditions-analysis-icon">🎯</span>
                                <h3>조건 충족 분석</h3>
                                <span className="conditions-count-badge">
                                    {conditionsAnalysis.filter(c => c.fulfilled).length}/{conditionsAnalysis.length} 충족
                                </span>
                            </div>
                            <p className="conditions-analysis-desc">입력하신 조건들의 충족 여부를 분석한 결과입니다.</p>

                            <div className="conditions-analysis-list">
                                {conditionsAnalysis.map((item, idx) => (
                                    <div key={idx} className={`condition-result-card ${item.fulfilled ? 'fulfilled' : 'unfulfilled'}`}>
                                        <div className="condition-result-header">
                                            <span className={`condition-status-icon ${item.fulfilled ? 'fulfilled' : 'unfulfilled'}`}>
                                                {item.fulfilled ? '✓' : '✗'}
                                            </span>
                                            <span className="condition-text">{item.condition}</span>
                                            {item.timestamp && (
                                                <span className="condition-timestamp">{item.timestamp}</span>
                                            )}
                                        </div>
                                        <p className="condition-evidence">{item.evidence}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* 교육과정 정합성 분석 섹션 */}
                    <section className="curriculum-alignment-section">
                        <div className="curriculum-alignment-header">
                            <span className="curriculum-alignment-icon">📚</span>
                            <h3>교육과정 정합성 분석</h3>
                        </div>
                        <p className="curriculum-alignment-desc">
                            교육과정 성취기준 해설 및 적용 시 고려사항에 의거하여 수업의 적합성을 분석합니다.
                        </p>

                        {curriculumAnalysis ? (
                            <div className="curriculum-alignment-content">
                                <div className="curriculum-block overall">
                                    <h4>📋 종합 평가</h4>
                                    <p>{curriculumAnalysis.overall}</p>
                                </div>

                                {curriculumAnalysis.standardsAlignment && curriculumAnalysis.standardsAlignment.length > 0 && (
                                    <div className="curriculum-block standards">
                                        <h4>✅ 성취기준 반영</h4>
                                        <ul>
                                            {curriculumAnalysis.standardsAlignment.map((item, idx) => (
                                                <li key={idx}>{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {curriculumAnalysis.considerations && curriculumAnalysis.considerations.length > 0 && (
                                    <div className="curriculum-block considerations">
                                        <h4>⚠️ 고려사항 준수</h4>
                                        <ul>
                                            {curriculumAnalysis.considerations.map((item, idx) => (
                                                <li key={idx}>{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {curriculumAnalysis.suggestions && curriculumAnalysis.suggestions.length > 0 && (
                                    <div className="curriculum-block suggestions">
                                        <h4>💡 개선 제안</h4>
                                        <ul>
                                            {curriculumAnalysis.suggestions.map((item, idx) => (
                                                <li key={idx}>{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="curriculum-alignment-placeholder">
                                <p>교육과정 정합성 분석은 수학 교과에서만 제공됩니다.</p>
                                <span>수학 성취기준 PDF가 분석에 활용됩니다.</span>
                            </div>
                        )}
                    </section>

                    {/* 교과 간 연계 제언 섹션 */}
                    <section className="cross-curricular-section">
                        <div className="cross-curricular-header">
                            <span className="cross-curricular-icon">🔗</span>
                            <h3>교과 간 연계 제언</h3>
                        </div>
                        <p className="cross-curricular-desc">
                            실연 중인 교과 내용이 타 교과와 연계될 수 있는 지점을 식별하여,
                            교육과정의 통합적 재구성을 시도할 수 있도록 지원합니다.
                        </p>

                        <div className="cross-curricular-content">
                            {summary.crossCurricular ? (
                                <>
                                    {summary.crossCurricular.slice(0, 2).map((item, idx) => (
                                        <div key={idx} className="cross-curricular-item">
                                            <div className="cc-subject-tag">{item.subject}</div>
                                            <p className="cc-suggestion">{item.suggestion}</p>
                                        </div>
                                    ))}
                                </>
                            ) : (
                                <>
                                    <div className="cross-curricular-item">
                                        <div className="cc-subject-tag">과학</div>
                                        <p className="cc-suggestion">
                                            수학적 개념을 활용한 과학 실험 설계 활동과 연계하여
                                            데이터 분석 및 그래프 해석 능력을 통합적으로 지도할 수 있습니다.
                                        </p>
                                    </div>
                                    <div className="cross-curricular-item">
                                        <div className="cc-subject-tag">사회</div>
                                        <p className="cc-suggestion">
                                            통계 자료 해석 단원과 연계하여 실생활 데이터를 활용한
                                            사회 현상 분석 프로젝트를 진행할 수 있습니다.
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="cross-curricular-tip">
                            <span className="tip-icon">💡</span>
                            <span>통합 교육과정 설계를 위해 관련 교과 교사와의 협력 수업을 고려해 보세요.</span>
                        </div>
                    </section>
                </div>
            </div>

            {/* AI 성찰 대화 토글 버튼 */}
            <button
                className={`chat-toggle-btn ${isChatOpen ? "open" : ""}`}
                onClick={() => setIsChatOpen(!isChatOpen)}
                title="AI 성찰 대화"
            >
                {isChatOpen ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                ) : (
                    <>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        <span className="chat-toggle-label">AI 성찰</span>
                    </>
                )}
            </button>

            {/* AI 성찰 대화 패널 */}
            <div className={`reflection-chat-panel ${isChatOpen ? "open" : ""}`}>
                <div className="chat-panel-header">
                    <div className="chat-panel-title">
                        <span className="chat-icon">🤔</span>
                        <h3>AI 수업 성찰 대화</h3>
                    </div>
                    <p className="chat-panel-desc">AI와 함께 수업을 되돌아보며 성찰해보세요</p>
                </div>

                <div className="chat-messages">
                    {chatMessages.map((msg, idx) => (
                        <div key={idx} className={`chat-message ${msg.role}`}>
                            {msg.role === "assistant" && (
                                <div className="message-avatar">🤖</div>
                            )}
                            <div className="message-content markdown-content">
                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                            </div>
                        </div>
                    ))}
                    {isChatLoading && (
                        <div className="chat-message assistant">
                            <div className="message-avatar">🤖</div>
                            <div className="message-content loading">
                                <div className="typing-indicator">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                {/* 예시 질문 */}
                {chatMessages.length <= 1 && (
                    <div className="chat-suggestions">
                        <p className="chat-suggestions-label">💡 이런 질문을 해보세요</p>
                        <div className="chat-suggestion-buttons">
                            <button
                                type="button"
                                className="chat-suggestion-btn"
                                onClick={() => setChatInput("이 수업에서 가장 개선되어야 할 부분이 뭘까?")}
                            >
                                이 수업에서 가장 개선되어야 할 부분이 뭘까?
                            </button>
                            <button
                                type="button"
                                className="chat-suggestion-btn"
                                onClick={() => setChatInput("내가 학생들에게 던진 질문은 적절했어?")}
                            >
                                내가 학생들에게 던진 질문은 적절했어?
                            </button>
                            <button
                                type="button"
                                className="chat-suggestion-btn"
                                onClick={() => setChatInput("다음 수업에서 바로 적용할 수 있는 팁을 알려줘")}
                            >
                                다음 수업에서 바로 적용할 수 있는 팁을 알려줘
                            </button>
                        </div>
                    </div>
                )}

                <form className="chat-input-form" onSubmit={handleChatSubmit}>
                    <textarea
                        className="chat-input"
                        placeholder="수업에 대해 궁금한 점을 물어보세요..."
                        value={chatInput}
                        onChange={(e) => {
                            setChatInput(e.target.value);
                            // 자동 높이 조절
                            e.target.style.height = 'auto';
                            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                        }}
                        onKeyDown={(e) => {
                            // Enter 키로 전송 (Shift+Enter는 줄바꿈)
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                if (chatInput.trim() && !isChatLoading) {
                                    handleChatSubmit(e);
                                }
                            }
                        }}
                        disabled={isChatLoading}
                        rows={1}
                    />
                    <button
                        type="submit"
                        className="chat-send-btn"
                        disabled={!chatInput.trim() || isChatLoading}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                        </svg>
                    </button>
                </form>
            </div>
        </main>
    );
}

