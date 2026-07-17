"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";

// VR 실습 분석 더미 데이터
const VR_DUMMY_DATA = {
    scenario: "학부모와의 갈등 해결",
    date: "2026.01.25",
    duration: "18분 45초",
    timestamps: [
        {
            time: "00:30",
            seconds: 30,
            category: "태도",
            type: "positive",
            feedback: "학부모를 맞이할 때 밝은 표정과 정중한 인사로 첫인상을 긍정적으로 형성했습니다.",
            explanation: {
                teacherAction: "\"안녕하세요, 어머니. 오늘 찾아와 주셔서 감사합니다\"라며 일어서서 인사함",
                reactionInterpretation: "학부모가 긴장된 표정에서 다소 완화되며 자리에 앉음",
                alternativeExample: null
            }
        },
        {
            time: "01:15",
            seconds: 75,
            category: "상호작용",
            type: "positive",
            feedback: "학부모가 불만을 표현하기 전에 먼저 자리를 권하고 편안한 분위기를 조성한 점이 좋습니다.",
            explanation: {
                teacherAction: "\"먼저 편하게 앉으시고, 차 한 잔 드릴까요?\"라며 배려하는 제스처",
                reactionInterpretation: "학부모가 경직된 자세에서 의자에 기대앉으며 긴장이 풀리기 시작함",
                alternativeExample: null
            }
        },
        {
            time: "02:40",
            seconds: 160,
            category: "상호작용",
            type: "positive",
            feedback: "학부모의 이야기를 끝까지 경청하며 중간에 끼어들지 않은 점이 인상적입니다.",
            explanation: {
                teacherAction: "고개를 끄덕이며 \"네, 네\" 추임새만 넣고 학부모가 말을 마칠 때까지 경청",
                reactionInterpretation: "학부모가 자신의 이야기를 충분히 할 수 있다고 느껴 더 솔직하게 감정을 표현함",
                alternativeExample: null
            }
        },
        {
            time: "04:10",
            seconds: 250,
            category: "태도",
            type: "constructive",
            feedback: "학부모의 감정적인 발언에 방어적으로 반응하는 모습이 보였습니다. 먼저 공감을 표현한 후 설명하는 것이 효과적입니다.",
            explanation: {
                teacherAction: "\"그건 제가 의도한 게 아니었어요\"라고 즉시 해명하려 함",
                reactionInterpretation: "학부모가 자신의 감정이 무시당했다고 느껴 목소리가 더 높아지고 방어적 자세를 취함",
                alternativeExample: "\"어머니 마음이 많이 속상하셨겠어요. 제가 어떤 부분이 걱정되셨는지 좀 더 들어볼게요.\""
            }
        },
        {
            time: "05:30",
            seconds: 330,
            category: "전달력",
            type: "positive",
            feedback: "학부모의 우려 사항을 정리하여 다시 확인하는 '반영적 경청' 기법을 잘 활용했습니다.",
            explanation: {
                teacherAction: "\"그러니까 어머니께서는 아이가 수업 중에 소외감을 느낀다고 걱정하시는 거죠?\"",
                reactionInterpretation: "학부모가 \"네, 맞아요\"라며 자신의 말이 잘 전달되었다는 안도감을 표현",
                alternativeExample: null
            }
        },
        {
            time: "07:00",
            seconds: 420,
            category: "상호작용",
            type: "positive",
            feedback: "'어머니 마음이 많이 속상하셨겠네요'라고 공감을 표현하여 학부모의 감정을 인정했습니다.",
            explanation: {
                teacherAction: "눈을 맞추며 부드러운 목소리로 \"어머니 마음이 많이 속상하셨겠네요\" 언급",
                reactionInterpretation: "학부모의 어깨가 이완되고 말투가 부드러워지며 협력적 태도로 전환됨",
                alternativeExample: null
            }
        },
        {
            time: "08:45",
            seconds: 525,
            category: "전달력",
            type: "constructive",
            feedback: "교육적 의도를 설명할 때 전문 용어를 사용했습니다. 학부모가 이해하기 쉬운 일상적인 표현으로 바꿔보세요.",
            explanation: {
                teacherAction: "\"협동학습을 통한 사회적 기술 향상이 목표입니다\"라고 교육 용어로 설명",
                reactionInterpretation: "학부모가 고개를 갸웃하며 이해하지 못한 듯한 표정을 지음",
                alternativeExample: "\"아이들이 함께 활동하면서 서로 배려하고 협력하는 방법을 배우게 하려고요.\""
            }
        },
        {
            time: "10:20",
            seconds: 620,
            category: "상호작용",
            type: "positive",
            feedback: "구체적인 사례와 함께 학생의 긍정적인 면을 먼저 언급하여 학부모의 경계심을 낮췄습니다.",
            explanation: {
                teacherAction: "\"지난주에 수민이가 친구를 도와주는 모습이 정말 인상적이었어요\"라며 구체적 사례 언급",
                reactionInterpretation: "학부모가 미소를 지으며 자녀에 대한 긍정적 이야기에 마음을 열기 시작",
                alternativeExample: null
            }
        },
        {
            time: "12:00",
            seconds: 720,
            category: "태도",
            type: "positive",
            feedback: "학부모가 흥분했을 때 목소리 톤을 낮추고 차분하게 대응하여 상황을 진정시켰습니다.",
            explanation: {
                teacherAction: "학부모가 목소리를 높이는 순간, 잠시 침묵 후 더 낮고 천천히 말하기 시작",
                reactionInterpretation: "학부모가 자신도 모르게 목소리를 낮추며 교사의 톤에 맞춰감",
                alternativeExample: null
            }
        },
        {
            time: "14:15",
            seconds: 855,
            category: "상호작용",
            type: "positive",
            feedback: "문제 해결을 위한 구체적인 방안을 학부모와 함께 논의하며 협력적 관계를 구축했습니다.",
            explanation: {
                teacherAction: "\"어머니 생각에는 어떤 방법이 좋을 것 같으세요?\"라며 의견을 구함",
                reactionInterpretation: "학부모가 적극적으로 의견을 제시하며 문제 해결의 파트너로 참여함",
                alternativeExample: null
            }
        },
        {
            time: "16:30",
            seconds: 990,
            category: "전달력",
            type: "positive",
            feedback: "합의된 내용을 명확하게 정리하고 후속 연락 일정을 구체적으로 약속했습니다.",
            explanation: {
                teacherAction: "\"그럼 다음 주 금요일에 제가 연락드려서 변화 상황을 공유드릴게요\"",
                reactionInterpretation: "학부모가 구체적인 계획에 안심하며 만족스러운 표정을 보임",
                alternativeExample: null
            }
        },
        {
            time: "18:00",
            seconds: 1080,
            category: "태도",
            type: "positive",
            feedback: "마무리 시 감사의 말과 함께 언제든 연락해달라는 열린 태도를 보여주었습니다.",
            explanation: {
                teacherAction: "\"오늘 시간 내주셔서 감사합니다. 언제든 궁금한 점 있으시면 연락주세요\"",
                reactionInterpretation: "학부모가 악수를 청하며 \"선생님 덕분에 마음이 놓이네요\"라고 감사 표현",
                alternativeExample: null
            }
        }
    ],
    summary: {
        overall: "학부모와의 갈등 상황에서 전반적으로 차분하고 전문적인 태도를 유지했습니다. 경청과 공감을 통해 학부모의 감정을 인정하고, 구체적인 해결 방안을 함께 모색하는 협력적 접근이 돋보였습니다. 다만, 초반 방어적 반응과 전문 용어 사용은 개선이 필요합니다.",
        strengths: [
            "학부모의 이야기를 끝까지 경청하는 적극적 경청 태도",
            "감정적 상황에서도 차분하고 침착한 목소리 톤 유지",
            "학부모의 감정에 대한 공감 표현이 자연스러움",
            "구체적인 사례를 통한 설명으로 신뢰감 형성",
            "문제 해결을 위한 협력적 접근과 구체적 약속 도출"
        ],
        suggestions: [
            "학부모의 감정적 발언에 방어적으로 반응하지 않고 먼저 공감 표현하기",
            "교육 전문 용어 대신 학부모가 이해하기 쉬운 일상적 표현 사용하기",
            "갈등 상황 초반에 '저도 함께 고민하겠습니다'라는 협력 의지 먼저 표현하기",
            "학부모의 입장에서 상황을 바라보는 관점 전환 연습하기",
            "후속 조치에 대한 문서화된 기록을 학부모와 공유하여 신뢰 강화하기"
        ]
    }
};

// 회차별 실습 기록 더미 데이터
const VR_SESSION_HISTORY = {
    currentSession: 3,
    sessions: [
        { session: 1, date: "2025.12.10", scenario: "학부모와의 갈등 해결" },
        { session: 2, date: "2026.01.05", scenario: "학부모와의 갈등 해결" },
        { session: 3, date: "2026.01.25", scenario: "학부모와의 갈등 해결" },
    ],
    growthInsights: [
        {
            id: "empathy",
            area: "공감 표현",
            icon: "💝",
            trend: "up",
            summary: "지난 3회 실습에서 공감 표현을 더 이른 시점에 제시하는 경향이 증가했어요.",
            evidence: [
                { session: 1, detail: "03:40에 첫 공감 표현", highlight: false },
                { session: 2, detail: "01:20에 첫 공감 표현", highlight: false },
                { session: 3, detail: "00:35에 첫 공감 표현", highlight: true },
            ]
        },
        {
            id: "listening",
            area: "상호작용",
            icon: "👂",
            trend: "up",
            summary: "학부모/학생의 발화를 끝까지 듣고 응답하는 비율이 늘었어요.",
            evidence: [
                { session: 1, detail: "중간에 끊고 해명하려 함 (3회)", highlight: false },
                { session: 2, detail: "중간 끊음 1회로 감소", highlight: false },
                { session: 3, detail: "끝까지 경청 후 응답 (끊음 0회)", highlight: true },
            ]
        },
        {
            id: "structure",
            area: "대화 구조",
            icon: "🏗️",
            trend: "up",
            summary: "도입–전개–정리의 연결이 이전보다 명확해졌어요.",
            evidence: [
                { session: 1, detail: "정리 없이 대화 종료", highlight: false },
                { session: 2, detail: "정리는 있으나 확인 질문 없음", highlight: false },
                { session: 3, detail: "정리 + 합의 내용 확인 질문", highlight: true },
            ]
        },
        {
            id: "vocabulary",
            area: "표현 전환",
            icon: "📝",
            trend: "up",
            summary: "전문 용어 사용이 줄고, 학부모 눈높이에 맞춘 표현이 증가했어요.",
            evidence: [
                { session: 1, detail: "전문 용어 5회 사용", highlight: false },
                { session: 2, detail: "전문 용어 3회 (일부 쉬운 표현으로 전환)", highlight: false },
                { session: 3, detail: "전문 용어 1회, 일상 표현 위주로 설명", highlight: true },
            ]
        },
    ]
};

export default function VRAnalyzePage() {
    const router = useRouter();
    const chatEndRef = useRef(null);

    const [selectedTimestamp, setSelectedTimestamp] = useState(null);
    const [expandedTimestamps, setExpandedTimestamps] = useState({});
    const [showScoreWithFeedback, setShowScoreWithFeedback] = useState(false);
    const [expandedGrowthItems, setExpandedGrowthItems] = useState({});

    // VR 피드백 영역 정보 (카테고리 매핑 + 점수 포함)
    const VR_FEEDBACK_AREAS = {
        attitude: { id: "attitude", label: "태도", desc: "표정, 시선, 자세, 톤", icon: "🙂", category: "태도", score: 88 },
        interaction: { id: "interaction", label: "상호작용", desc: "경청, 공감, 협력적 대화", icon: "💬", category: "상호작용", score: 82 },
        delivery: { id: "delivery", label: "전달력", desc: "명확성, 적절한 표현, 정리력", icon: "🎤", category: "전달력", score: 75 },
    };

    // AI 성찰 대화 상태
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState([{
        role: "assistant",
        content: "안녕하세요! VR 실습 결과에 대해 함께 성찰해볼까요? 🎓\n\n'학부모와의 갈등 해결' 실습에서 보여주신 대응 방식에 대해 궁금한 점이나 더 깊이 이야기하고 싶은 부분이 있으시면 말씀해주세요."
    }]);
    const [chatInput, setChatInput] = useState("");
    const [isChatLoading, setIsChatLoading] = useState(false);

    // 분석 데이터
    const analysisData = VR_DUMMY_DATA;
    const { timestamps, summary } = analysisData;

    // localStorage에서 프로필 설정 불러오기
    useEffect(() => {
        const saved = localStorage.getItem("profileSettings");
        if (saved) {
            const data = JSON.parse(saved);
            setShowScoreWithFeedback(data.showScoreWithFeedback || false);
        }
    }, []);

    // 채팅 스크롤
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [chatMessages]);

    // 타임스탬프 클릭 시
    const handleTimestampClick = (timestamp) => {
        setSelectedTimestamp(timestamp);
    };

    // 타임스탬프 확장/축소 토글
    const toggleTimestampExpand = (index, e) => {
        e.stopPropagation();
        setExpandedTimestamps(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
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
                    chatHistory: chatMessages,
                    analysisContext: {
                        type: "VR 실습",
                        scenario: analysisData.scenario,
                        ...analysisData
                    }
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

    return (
        <main className={`analysis-page-v2 ${isChatOpen ? "chat-open" : ""}`}>
            {/* 헤더 */}
            <header className="analysis-header-v2">
                <div className="header-content">
                    <h1>🥽 VR 실습 분석 결과</h1>
                    <p>{analysisData.scenario} | {analysisData.date} | {analysisData.duration}</p>
                </div>
                <div className="header-actions">
                    <button className="btn-outline" onClick={() => router.push("/simulation")}>
                        통합 대시보드
                    </button>
                </div>
            </header>

            {/* 메인 컨텐츠 */}
            <div className="analysis-main-v2">
                {/* 상단: VR 플레이스홀더 + 종합 피드백 */}
                <section className="video-summary-section">
                    <div className="video-container-v2">
                        <div className="video-placeholder-v2 vr-placeholder">
                            <div className="vr-icon-large">🥽</div>
                            <p className="vr-placeholder-title">VR 실습 기록</p>
                            <p className="vr-placeholder-desc">{analysisData.scenario}</p>
                            <div className="vr-meta">
                                <span>📅 {analysisData.date}</span>
                                <span>⏱️ {analysisData.duration}</span>
                            </div>
                        </div>
                    </div>

                    <div className="summary-container-v2">
                        <h3>💬 종합 피드백</h3>
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

                {/* 회차별 성장 인사이트 */}
                <section className="session-growth-section">
                    <div className="session-growth-header">
                        <div className="session-growth-title">
                            <span className="session-growth-icon">📈</span>
                            <div>
                                <h3>회차별 성장 기록</h3>
                                <p className="session-growth-subtitle">
                                    {VR_SESSION_HISTORY.sessions.map(s => `${s.session}회차`).join(' → ')} 실습을 비교 분석한 결과입니다
                                </p>
                            </div>
                        </div>
                        <div className="session-badges">
                            {VR_SESSION_HISTORY.sessions.map(s => (
                                <span key={s.session} className={`session-badge ${s.session === VR_SESSION_HISTORY.currentSession ? 'current' : ''}`}>
                                    {s.session}회차
                                    <span className="session-badge-date">{s.date}</span>
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="growth-insights-list">
                        {VR_SESSION_HISTORY.growthInsights.map((insight) => {
                            const isExpanded = expandedGrowthItems[insight.id];
                            return (
                                <div key={insight.id} className={`growth-insight-card ${insight.trend}`}>
                                    <div className="growth-insight-main">
                                        <div className="growth-insight-left">
                                            <span className="growth-insight-area-icon">{insight.icon}</span>
                                            <div className="growth-insight-text">
                                                <span className="growth-insight-area-label">{insight.area}</span>
                                                <p className="growth-insight-summary">{insight.summary}</p>
                                            </div>
                                        </div>
                                        <div className="growth-insight-right">
                                            <span className={`growth-trend-badge ${insight.trend}`}>
                                                {insight.trend === 'up' ? '↑ 향상' : insight.trend === 'same' ? '→ 유지' : '↓ 주의'}
                                            </span>
                                            <button
                                                className="growth-evidence-toggle"
                                                onClick={() => setExpandedGrowthItems(prev => ({ ...prev, [insight.id]: !prev[insight.id] }))}
                                            >
                                                {isExpanded ? '근거 접기 ▲' : '근거 보기 ▼'}
                                            </button>
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="growth-evidence-timeline">
                                            {insight.evidence.map((ev, idx) => (
                                                <div key={idx} className={`evidence-step ${ev.highlight ? 'highlight' : ''}`}>
                                                    <div className="evidence-step-marker">
                                                        <span className="evidence-session-num">{ev.session}회차</span>
                                                        {idx < insight.evidence.length - 1 && <div className="evidence-connector" />}
                                                    </div>
                                                    <div className="evidence-step-content">
                                                        <p>{ev.detail}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* 하단: 영역별 상세 피드백 */}
                <div className="bottom-sections-wrapper">
                    <section className="detailed-feedback-section">
                        <div className="detailed-feedback-header">
                            <h3>📝 영역별 상세 피드백</h3>
                            <span className="timestamps-count">{timestamps.length}개 피드백</span>
                        </div>
                        <p className="timestamps-hint-v2">각 피드백을 클릭하여 상세 내용을 확인하세요</p>

                        <div className="feedback-areas-grid">
                            {Object.keys(VR_FEEDBACK_AREAS).map((areaId) => {
                                const areaInfo = VR_FEEDBACK_AREAS[areaId];

                                // 해당 영역의 타임스탬프 필터링
                                const areaTimestamps = timestamps.filter(
                                    (item) => item.category === areaInfo.category
                                );

                                return (
                                    <div key={areaId} className="feedback-area-container">
                                        <div className="feedback-area-header">
                                            <span className="feedback-area-icon">{areaInfo.icon}</span>
                                            <div className="feedback-area-title">
                                                <h4>{areaInfo.label}</h4>
                                                <span className="feedback-area-desc">{areaInfo.desc}</span>
                                            </div>
                                            {showScoreWithFeedback && (
                                                <div className="feedback-area-score" style={{ color: getScoreColor(areaInfo.score) }}>
                                                    <svg width="40" height="40" viewBox="0 0 36 36">
                                                        <circle cx="18" cy="18" r="15.5" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                                                        <circle
                                                            cx="18" cy="18" r="15.5" fill="none"
                                                            stroke={getScoreColor(areaInfo.score)}
                                                            strokeWidth="3"
                                                            strokeDasharray={`${(areaInfo.score / 100) * 97.4} 97.4`}
                                                            strokeLinecap="round"
                                                            transform="rotate(-90 18 18)"
                                                        />
                                                    </svg>
                                                    <span className="score-value">{areaInfo.score}</span>
                                                </div>
                                            )}
                                            <span className="feedback-area-count">{areaTimestamps.length}개</span>
                                        </div>

                                        <div className="feedback-area-content">
                                            {areaTimestamps.length > 0 ? (
                                                areaTimestamps.map((item, index) => {
                                                    const globalIndex = timestamps.indexOf(item);
                                                    const isSelected = selectedTimestamp === item;
                                                    const isExpanded = expandedTimestamps[globalIndex];

                                                    return (
                                                        <div
                                                            key={index}
                                                            className={`timestamp-card-mini ${isSelected ? "selected" : ""} ${item.type === "positive" ? "positive" : "constructive"}`}
                                                            onClick={() => handleTimestampClick(item)}
                                                        >
                                                            <div className="timestamp-mini-header">
                                                                <span className="time-badge-mini">{item.time}</span>
                                                                <span className={`type-badge-mini ${item.type}`}>
                                                                    {item.type === "positive" ? "✅ 칭찬" : "🔧 개선"}
                                                                </span>
                                                            </div>
                                                            <p className="timestamp-feedback-mini">{item.feedback}</p>

                                                            {/* 상세 설명 보기 버튼 */}
                                                            {item.explanation && (
                                                                <button
                                                                    className="explanation-toggle-btn"
                                                                    onClick={(e) => toggleTimestampExpand(globalIndex, e)}
                                                                >
                                                                    {isExpanded ? "상세 분석 접기 ▲" : "상세 분석 보기 ▼"}
                                                                </button>
                                                            )}

                                                            {/* 3단계 설명형 피드백 */}
                                                            {item.explanation && isExpanded && (
                                                                <div className="explanation-accordion">
                                                                    <div className="explanation-item">
                                                                        <span className="explanation-icon">📢</span>
                                                                        <div className="explanation-content">
                                                                            <h5>교사 발화/행동</h5>
                                                                            <p>{item.explanation.teacherAction}</p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="explanation-item">
                                                                        <span className="explanation-icon">🔄</span>
                                                                        <div className="explanation-content">
                                                                            <h5>상대 반응 변화</h5>
                                                                            <p>{item.explanation.reactionInterpretation}</p>
                                                                        </div>
                                                                    </div>
                                                                    {item.explanation.alternativeExample && (
                                                                        <div className="explanation-item alternative">
                                                                            <span className="explanation-icon">💡</span>
                                                                            <div className="explanation-content">
                                                                                <h5>대안적 표현 예시</h5>
                                                                                <p>"{item.explanation.alternativeExample}"</p>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
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
                        <h3>AI VR 실습 성찰 대화</h3>
                    </div>
                    <p className="chat-panel-desc">AI와 함께 VR 실습을 되돌아보며 성찰해보세요</p>
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
                                onClick={() => setChatInput("이 실습에서 내가 가장 잘한 부분은 뭐야?")}
                            >
                                이 실습에서 내가 가장 잘한 부분은 뭐야?
                            </button>
                            <button
                                type="button"
                                className="chat-suggestion-btn"
                                onClick={() => setChatInput("학생이 방어적으로 반응했을 때, 어떻게 말했으면 더 좋았을까?")}
                            >
                                방어적으로 반응했을 때, 어떻게 말했으면 더 좋았을까?
                            </button>
                            <button
                                type="button"
                                className="chat-suggestion-btn"
                                onClick={() => setChatInput("비슷한 상황이 반복해서 생기면 어떻게 대처해야 할까?")}
                            >
                                비슷한 상황이 또 생기면 어떻게 대처해야 할까?
                            </button>
                        </div>
                    </div>
                )}

                <form className="chat-input-form" onSubmit={handleChatSubmit}>
                    <textarea
                        className="chat-input"
                        placeholder="VR 실습에 대해 궁금한 점을 물어보세요..."
                        value={chatInput}
                        onChange={(e) => {
                            setChatInput(e.target.value);
                            e.target.style.height = 'auto';
                            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                        }}
                        onKeyDown={(e) => {
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
