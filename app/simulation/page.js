"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// 시나리오 데이터 - 카테고리별 그룹화
const SCENARIO_CATEGORIES = [
    {
        id: "random",
        title: "🎲 랜덤 문제",
        scenarios: [
            {
                id: "random",
                icon: "❓",
                iconBg: "bg-indigo-600 text-white",
                title: "랜덤 시나리오",
                titleColor: "text-indigo-700",
                description: "예측할 수 없는 불특정 문제 상황을 연습합니다. 어떤 상황이 발생할지 모르는 긴장감 속에서 대처 능력을 키웁니다.",
                tags: [],
            },
        ],
    },
    {
        id: "teacher-student",
        title: "👨‍🏫 교사-학생 갈등",
        scenarios: [
            {
                id: "light",
                icon: "🟡",
                iconBg: "bg-yellow-50",
                title: "수업 집중력 와해",
                titleColor: "text-slate-700",
                description: "뒷자리 잡담, 지우개 가루 투척, 무기력한 태도 등 산발적인 방해 행동.",
                tags: [{ label: "경미", color: "bg-yellow-50 text-yellow-600" }],
            },
            {
                id: "adhd",
                icon: "💫",
                iconBg: "bg-yellow-100",
                title: "정서 불안 및 산만",
                titleColor: "text-slate-700",
                description: "수업 중 지속적으로 손발을 꼼지락거리고 자리에서 이탈하며, 맥락 없는 질문을 던져 흐름을 끊는다.",
                tags: [
                    { label: "ADHD", color: "bg-purple-50 text-purple-600" },
                    { label: "중학년", color: "bg-slate-100 text-slate-500" },
                ],
            },
            {
                id: "heavy",
                icon: "🟠",
                iconBg: "bg-orange-50",
                title: "조롱 및 인신공격",
                titleColor: "text-slate-700",
                description: "학생이 교사의 말투를 흉내 내며 비웃고, 지시를 의도적으로 무시하며 대든다.",
                tags: [{ label: "심각", color: "bg-orange-50 text-orange-600" }],
            },
            {
                id: "rebellion",
                icon: "💢",
                iconBg: "bg-rose-50",
                title: "사춘기적 반항/분노",
                titleColor: "text-slate-700",
                description: "가정 불화 등의 이유로 억눌린 분노가 교사의 사소한 지적에 폭발하여 공격적인 언행을 보인다.",
                tags: [{ label: "고학년", color: "bg-blue-50 text-blue-600" }],
            },
            {
                id: "critical",
                icon: "🔴",
                iconBg: "bg-red-50",
                title: "폭력 행동 및 안전 위기",
                titleColor: "text-red-700",
                description: "책상을 걷어차고 욕설을 하며 물건을 집어던지는 물리적 폭력을 행사한다.",
                tags: [{ label: "매우 심각", color: "bg-red-50 text-red-600" }],
            },
        ],
    },
    {
        id: "student-student",
        title: "🤜🤛 학생-학생 갈등",
        scenarios: [
            {
                id: "argument",
                icon: "🗣️",
                iconBg: "bg-slate-100",
                title: "학생 간 말다툼",
                titleColor: "text-slate-700",
                description: "모둠 활동 중 의견 차이로 시작된 말다툼이 커져 서로 비난하고 고성을 지르는 상황.",
                tags: [
                    { label: "고학년", color: "bg-blue-50 text-blue-600" },
                    { label: "심각", color: "bg-orange-50 text-orange-600" },
                    { label: "교우관계", color: "bg-green-50 text-green-600" },
                ],
            },
        ],
    },
    {
        id: "external",
        title: "⛈️ 외부 환경 문제",
        scenarios: [
            {
                id: "parent",
                icon: "🤝",
                iconBg: "bg-emerald-50",
                title: "학부모와의 갈등",
                titleColor: "text-slate-700",
                description: "학부모가 \"우리 아이를 문제아로 낙인찍는 것이냐\"며 격앙된 반응을 보인다.",
                tags: [{ label: "상담", color: "bg-emerald-50 text-emerald-600" }],
            },
            {
                id: "digital",
                icon: "🌐",
                iconBg: "bg-indigo-50",
                title: "네트워크 장애",
                titleColor: "text-slate-700",
                description: "디지털 교과서 활용 중 와이파이 접속이 끊겨 수업 진행이 불가능해진다.",
                tags: [{ label: "디지털", color: "bg-slate-100 text-slate-500" }],
            },
            {
                id: "science_accident",
                icon: "🧪",
                iconBg: "bg-red-50",
                title: "과학 실험 중 안전사고",
                titleColor: "text-slate-700",
                description: "실험 중 비커가 깨져 내용물이 튀고, 학생들이 놀라 소리치며 당황한다.",
                tags: [{ label: "안전", color: "bg-red-50 text-red-600" }],
            },
            {
                id: "pe_accident",
                icon: "🩹",
                iconBg: "bg-blue-50",
                title: "체육 활동 중 미끄러짐",
                titleColor: "text-slate-700",
                description: "강당에서 활동 중 학생이 미끄러져 넘어지며 발목 통증을 강하게 호소한다.",
                tags: [{ label: "체육", color: "bg-blue-50 text-blue-600" }],
            },
        ],
    },
];

// 아바타 데이터
const AVATARS = [
    { id: "minchul", name: "민철", trait: "ADHD 성향", image: "/images/minchul.png" },
    { id: "jihye", name: "지혜", trait: "조용한 학생", image: "/images/jihye.png" },
    { id: "ain", name: "아인", trait: "감성적/기복", image: "/images/ain.png" },
    { id: "dongwoo", name: "동우", trait: "호기심 왕성", image: "/images/dongwoo.png" },
];

// 히스토리 데이터
const HISTORY_ITEMS = [
    { id: 1, date: "2024.01.24", title: "네트워크 장애 대응", rate: "80%", level: "보통", thumb: "/images/scenario1_thumb.png" },
    { id: 2, date: "2024.01.23", title: "조롱 및 인신공격 대응", rate: "45%", level: "매우 심각", thumb: "/images/scenario2_thumb.png" },
    { id: 3, date: "2024.01.20", title: "학부모와의 갈등 해결", rate: "60%", level: "학부모 격앙", thumb: "/images/scenario3_thumb.png" },
];

// 종합 피드백 요약 (xr_int_dashboard에서 가져옴)
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
        "문제중심 XR에서 문제상황 대응력이 꾸준히 향상되고 있습니다.",
        "수업실연 XR에서 학생 발문 활용이 점차 자연스러워지고 있습니다.",
        "시간 관리 능력이 이전 대비 개선되었습니다."
    ]
};

// 최근 실습 미리보기 데이터
const RECENT_VR_PRACTICES = [
    {
        id: 1,
        scenario: "학습 동기 저하 상황",
        date: "2026.01.15",
        feedbackSummary: "학생들의 관심을 끌기 위한 다양한 전략을 시도했습니다."
    },
    {
        id: 2,
        scenario: "수업 방해 행동 대응",
        date: "2026.01.12",
        feedbackSummary: "차분하고 일관된 태도로 방해 행동에 대응했습니다."
    }
];

const RECENT_OFFLINE_PRACTICES = [
    {
        id: 1,
        lesson: "과학 - 물의 상태 변화",
        date: "2026.01.14",
        feedbackSummary: "실험 활동과 설명이 조화롭게 구성된 수업이었습니다."
    }
];

// 수업실연 히스토리 데이터
const LESSON_HISTORY_ITEMS = [
    {
        id: 1,
        date: "2024.01.22",
        title: "물의 상태 변화",
        grade: "3학년",
        subject: "과학",
        thumb: "/images/prac_thumb1.jpeg"
    },
    {
        id: 2,
        date: "2024.01.18",
        title: "분수의 덧셈과 뺄셈",
        grade: "4학년",
        subject: "수학",
        thumb: "/images/prac_thumb2.jpeg"
    },
    {
        id: 3,
        date: "2024.01.15",
        title: "우리 동네의 모습",
        grade: "2학년",
        subject: "사회",
        thumb: "/images/prac_thumb3.png"
    },
];

const TABS = [
    { id: "profile", icon: "fa-id-card-clip", label: "내 정보" },
    { id: "problem", icon: "fa-triangle-exclamation", label: "문제 중심 XR" },
    { id: "practice", icon: "fa-chalkboard-user", label: "수업 실연 XR" },
    { id: "history", icon: "fa-chart-pie", label: "성찰하기" },
];

const TAB_TITLES = {
    profile: "실습자 정보 확인",
    problem: "문제 중심 시나리오 구성",
    practice: "수업 실연 환경 설정",
    history: "학습 결과 및 성찰",
};

const TAB_SUBTITLES = {
    profile: "김예비 선생님, 오늘도 의미 있는 수업을 만들어보세요.",
    problem: "실제 학교 현장에서 발생하는 다양한 문제 상황을 선택하세요.",
    practice: "수업의 구체적인 환경과 학생 특성을 설정하여 몰입도를 높이세요.",
    history: "지난 시뮬레이션 결과를 되돌아보며 더 나은 수업을 고민해보세요.",
};

// 학년별 과목 데이터
const SUBJECTS_DATA = {
    '1': [
        { val: 'korean', text: '국어' }, { val: 'math', text: '수학' },
        { val: 'good_life', text: '바른 생활' }, { val: 'wise_life', text: '슬기로운 생활' }, { val: 'happy_life', text: '즐거운 생활' }
    ],
    '2': [
        { val: 'korean', text: '국어' }, { val: 'math', text: '수학' },
        { val: 'good_life', text: '바른 생활' }, { val: 'wise_life', text: '슬기로운 생활' }, { val: 'happy_life', text: '즐거운 생활' }
    ],
    '3': [
        { val: 'korean', text: '국어' }, { val: 'math', text: '수학' }, { val: 'social', text: '사회' },
        { val: 'science', text: '과학' }, { val: 'ethics', text: '도덕' }, { val: 'pe', text: '체육' },
        { val: 'music', text: '음악' }, { val: 'art', text: '미술' }, { val: 'english', text: '영어' }
    ],
    '4': [
        { val: 'korean', text: '국어' }, { val: 'math', text: '수학' }, { val: 'social', text: '사회' },
        { val: 'science', text: '과학' }, { val: 'ethics', text: '도덕' }, { val: 'pe', text: '체육' },
        { val: 'music', text: '음악' }, { val: 'art', text: '미술' }, { val: 'english', text: '영어' }
    ],
    '5': [
        { val: 'korean', text: '국어' }, { val: 'math', text: '수학' }, { val: 'social', text: '사회' },
        { val: 'science', text: '과학' }, { val: 'ethics', text: '도덕' }, { val: 'pe', text: '체육' },
        { val: 'music', text: '음악' }, { val: 'art', text: '미술' }, { val: 'english', text: '영어' }, { val: 'practical_arts', text: '실과' }
    ],
    '6': [
        { val: 'korean', text: '국어' }, { val: 'math', text: '수학' }, { val: 'social', text: '사회' },
        { val: 'science', text: '과학' }, { val: 'ethics', text: '도덕' }, { val: 'pe', text: '체육' },
        { val: 'music', text: '음악' }, { val: 'art', text: '미술' }, { val: 'english', text: '영어' }, { val: 'practical_arts', text: '실과' }
    ]
};

export default function SimulationPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("profile");
    const [selectedScenario, setSelectedScenario] = useState("digital");
    const [showCustomPrompt, setShowCustomPrompt] = useState(false);
    const [selectedAvatars, setSelectedAvatars] = useState([]);
    const [showAvatarModal, setShowAvatarModal] = useState(false);
    const [showSimulationModal, setShowSimulationModal] = useState(false);
    const [simulationImage, setSimulationImage] = useState("");
    const [historySubTab, setHistorySubTab] = useState("overview"); // 성찰하기 서브탭: overview, problem, lesson
    const [showScoreWithFeedback, setShowScoreWithFeedback] = useState(false); // 피드백 유형: false=질적만, true=점수포함
    const [showVideoModal, setShowVideoModal] = useState(false);

    // Profile 탭 상태
    const [profileGrade, setProfileGrade] = useState("4");
    const [profileConfidence, setProfileConfidence] = useState("3");
    const [profileExperience, setProfileExperience] = useState("4");
    const [showSaveToast, setShowSaveToast] = useState(false);

    // localStorage에서 프로필 설정 불러오기
    useEffect(() => {
        const saved = localStorage.getItem("profileSettings");
        if (saved) {
            const data = JSON.parse(saved);
            setProfileGrade(data.grade || "4");
            setProfileConfidence(data.confidence || "3");
            setProfileExperience(data.experience || "4");
            setShowScoreWithFeedback(data.showScoreWithFeedback || false);
        }
    }, []);

    // 프로필 저장
    const handleSaveProfile = () => {
        const profileData = {
            grade: profileGrade,
            confidence: profileConfidence,
            experience: profileExperience,
            showScoreWithFeedback,
        };
        localStorage.setItem("profileSettings", JSON.stringify(profileData));
        setShowSaveToast(true);
        setTimeout(() => setShowSaveToast(false), 2500);
    };

    // Practice 탭 설정 상태
    const [practiceAttention, setPracticeAttention] = useState("");
    const [practiceRules, setPracticeRules] = useState("");
    const [practiceGrade, setPracticeGrade] = useState("");
    const [practiceSubject, setPracticeSubject] = useState("");
    const [practiceStudentCount, setPracticeStudentCount] = useState(20);
    const [practiceNoise, setPracticeNoise] = useState(50);
    const [practiceStructure, setPracticeStructure] = useState("individual");
    const [showStudentTraits, setShowStudentTraits] = useState(true);

    // Problem 탭 설정 상태
    const [problemNoise, setProblemNoise] = useState(50);
    const [problemReaction, setProblemReaction] = useState(2);
    const [showProblemTraits, setShowProblemTraits] = useState(true);

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        setShowCustomPrompt(false);
    };

    const handleScenarioSelect = (scenarioId) => {
        if (scenarioId === "custom") {
            setShowCustomPrompt(true);
        } else {
            setShowCustomPrompt(false);
        }
        setSelectedScenario(scenarioId);
    };

    const toggleAvatar = (avatarId) => {
        setSelectedAvatars((prev) =>
            prev.includes(avatarId)
                ? prev.filter((id) => id !== avatarId)
                : [...prev, avatarId]
        );
    };

    // 표준 수업 환경 설정
    const setStandardEnvironment = () => {
        if (activeTab === "practice") {
            // 수업 실연 XR 표준 설정
            setPracticeAttention("박수 세 번 시작!");
            setPracticeRules("손 들고 말하기");
            setPracticeGrade("3");
            setPracticeSubject("korean");
            setPracticeStudentCount(20);
            setPracticeNoise(50);
            setPracticeStructure("pair");
            setSelectedAvatars(["jihye", "dongwoo"]);
            setShowStudentTraits(true);
        } else if (activeTab === "problem") {
            // 문제 중심 XR 표준 설정
            setSelectedScenario("random");
            setProblemNoise(0);
            setProblemReaction(2);
            setShowProblemTraits(true);
            setShowCustomPrompt(false);
        }
    };

    // 초기화
    const resetSettings = () => {
        if (activeTab === "practice") {
            setPracticeAttention("");
            setPracticeRules("");
            setPracticeGrade("");
            setPracticeSubject("");
            setPracticeStudentCount(20);
            setPracticeNoise(50);
            setPracticeStructure("individual");
            setSelectedAvatars([]);
            setShowStudentTraits(true);
        } else if (activeTab === "problem") {
            setSelectedScenario("");
            setProblemNoise(50);
            setProblemReaction(2);
            setShowProblemTraits(false);
            setShowCustomPrompt(false);
        }
    };

    const startSimulation = () => {
        if (activeTab === "problem") {
            // 시나리오별 이미지 매핑
            const scenarioImages = {
                'random': '/images/problem_simulation.png',      // 랜덤 시나리오
                'light': '/images/problem_simulation1.png',      // 수업 집중력 와해
                'adhd': '/images/class_simulation1.png',         // 정서 불안 및 산만
                'heavy': '/images/problem_simulation.png',       // 조롱 및 인신공격
                'rebellion': '/images/problem_simulation1.png',  // 사춘기적 반항/분노
                'critical': '/images/class_simulation.png',      // 폭력 행동 및 안전 위기
                'argument': '/images/student fight.png',         // 학생 간 말다툼
                'parent': '/images/conflict_w_parent.png',       // 학부모와의 갈등
                'digital': '/images/class_simulation1.png',      // 네트워크 장애
                'science_accident': '/images/science.png',       // 과학 실험 중 안전사고
                'pe_accident': '/images/pe.png',                 // 체육 활동 중 미끄러짐
                'custom': '/images/problem_simulation.png'       // 사용자 정의
            };

            const imageSrc = scenarioImages[selectedScenario] || '/images/problem_simulation.png';
            setSimulationImage(imageSrc);
            setShowSimulationModal(true);
        } else if (activeTab === "practice") {
            setSimulationImage("/images/class_simulation.png");
            setShowSimulationModal(true);
        }
    };

    const showActionButtons = activeTab === "problem" || activeTab === "practice";

    return (
        <div className="sim-wrapper">
            {/* Font Awesome CDN */}
            <link
                rel="stylesheet"
                href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
            />

            {/* Sidebar */}
            <aside className="sim-sidebar">
                <div className="sim-sidebar-header">
                    <h1 className="sim-logo">
                        <i className="fa-solid fa-vr-cardboard"></i> BNUE XR EDU
                    </h1>
                    <p className="sim-logo-sub">Teacher Training Platform</p>
                </div>

                <nav className="sim-nav">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            className={`sim-nav-item ${activeTab === tab.id ? "active" : ""}`}
                        >
                            <i className={`fa-solid ${tab.icon}`}></i>
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="sim-main">
                {/* Header */}
                <header className="sim-header">
                    <div>
                        <h2 className="sim-header-title">{TAB_TITLES[activeTab]}</h2>
                        <p className="sim-header-subtitle">{TAB_SUBTITLES[activeTab]}</p>
                    </div>

                    {showActionButtons && (
                        <div className="sim-header-actions">
                            <button onClick={resetSettings} className="sim-btn-secondary">
                                <i className="fa-solid fa-rotate-right"></i> 초기화
                            </button>
                            <button onClick={setStandardEnvironment} className="sim-btn-tertiary">
                                <i className="fa-solid fa-wand-magic-sparkles"></i> {activeTab === "problem" ? "추천 시나리오" : "추천 수업 환경"}
                            </button>
                            <button onClick={startSimulation} className="sim-btn-primary">
                                <i className="fa-solid fa-play"></i> 시뮬레이션 시작
                            </button>
                        </div>
                    )}
                </header>

                {/* Tab Content */}
                <div className="sim-content">
                    {/* Profile Tab */}
                    {activeTab === "profile" && (
                        <div className="sim-profile-grid">
                            <div className="sim-profile-left">
                                <div className="sim-profile-card">
                                    <div className="sim-avatar-large">👩‍🏫</div>
                                    <h4 className="sim-profile-name">김예비</h4>
                                    <p className="sim-profile-info">부산교육대학교 초등교육과</p>
                                </div>

                                <div className="sim-tutorial-card">
                                    <h3 className="sim-card-title">
                                        <i className="fa-solid fa-circle-play"></i> 플랫폼 튜토리얼
                                    </h3>
                                    <div className="sim-tutorial-buttons">
                                        <button
                                            className="sim-tutorial-btn"
                                            onClick={() => window.open('#', '_blank')}
                                        >
                                            <i className="fa-solid fa-file-pdf sim-icon-red"></i> 가이드 PDF 보기
                                        </button>
                                        <button
                                            className="sim-tutorial-btn"
                                            onClick={() => setShowVideoModal(true)}
                                        >
                                            <i className="fa-solid fa-video sim-icon-blue"></i> 튜토리얼 영상 시청
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="sim-settings-card">
                                <h3 className="sim-card-title">
                                    <i className="fa-solid fa-user-pen"></i> 학습자 정보 설정
                                </h3>

                                <div className="sim-form-group">
                                    <label>1. 현재 학년을 선택해주세요</label>
                                    <select value={profileGrade} onChange={(e) => setProfileGrade(e.target.value)}>
                                        <option value="1">1학년 (교직 입문)</option>
                                        <option value="2">2학년 (기초 역량)</option>
                                        <option value="3">3학년 (심화 학습)</option>
                                        <option value="4">4학년 (실습 준비)</option>
                                    </select>
                                </div>

                                <div className="sim-form-group">
                                    <label>2. 수업 실연에 대한 자신감은 어떠신가요?</label>
                                    <select value={profileConfidence} onChange={(e) => setProfileConfidence(e.target.value)}>
                                        <option value="1">매우 자신없음</option>
                                        <option value="2">자신없음</option>
                                        <option value="3">보통</option>
                                        <option value="4">자신있음</option>
                                        <option value="5">매우 자신있음</option>
                                    </select>
                                </div>

                                <div className="sim-form-group">
                                    <label>3. 실제 수업 경험은 얼마나 있으신가요?</label>
                                    <select value={profileExperience} onChange={(e) => setProfileExperience(e.target.value)}>
                                        <option value="1">거의 없음 (0~1회)</option>
                                        <option value="2">적음 (2~3회)</option>
                                        <option value="3">보통 (4~6회)</option>
                                        <option value="4">많음 (7~10회)</option>
                                        <option value="5">매우 많음 (11회 이상)</option>
                                    </select>
                                </div>

                                <div className="sim-toggle-option-v3">
                                    <div className="sim-toggle-info">
                                        <div className="sim-toggle-label-row">
                                            <span className="sim-toggle-label">점수 포함 피드백</span>
                                            <i className="fa-solid fa-circle-exclamation sim-tooltip-icon"></i>
                                            <div className="sim-tooltip">
                                                활성화하면 질적 피드백과 함께 각 영역별 수행 점수가 표시됩니다. 비활성화 시 서술형 피드백만 제공됩니다.
                                            </div>
                                        </div>
                                        <div className="sim-toggle-hint">
                                            {showScoreWithFeedback
                                                ? "질적 피드백 + 수행 점수"
                                                : "질적 피드백만 제공"}
                                        </div>
                                    </div>
                                    <label className="sim-toggle">
                                        <input
                                            type="checkbox"
                                            checked={showScoreWithFeedback}
                                            onChange={(e) => setShowScoreWithFeedback(e.target.checked)}
                                        />
                                        <span className="sim-toggle-slider"></span>
                                    </label>
                                </div>

                                <div className="sim-form-actions">
                                    <button className="sim-btn-save" onClick={handleSaveProfile}>
                                        <i className="fa-solid fa-check"></i> 정보 저장
                                    </button>
                                </div>
                            </div>

                            {/* 저장 완료 토스트 */}
                            {showSaveToast && (
                                <div className="sim-save-toast">
                                    <i className="fa-solid fa-circle-check"></i> 설정이 저장되었습니다.
                                </div>
                            )}
                        </div>
                    )}

                    {/* Problem Tab */}
                    {activeTab === "problem" && (
                        <div className="sim-problem-grid">
                            <div className="sim-scenarios-section">
                                <div className="sim-section-header">
                                    <h3><i className="fa-solid fa-list-ul"></i> 문제 시나리오 선택</h3>
                                    <span className="sim-hint">하나를 선택하세요</span>
                                </div>

                                <div className="sim-scenarios-list">
                                    {SCENARIO_CATEGORIES.map((category) => (
                                        <section key={category.id} className="sim-scenario-category">
                                            <h4 className="sim-category-title">{category.title}</h4>
                                            {category.scenarios.map((scenario) => (
                                                <label
                                                    key={scenario.id}
                                                    className={`sim-scenario-card ${selectedScenario === scenario.id ? "selected" : ""}`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="scenario"
                                                        checked={selectedScenario === scenario.id}
                                                        onChange={() => handleScenarioSelect(scenario.id)}
                                                    />
                                                    <div className={`sim-scenario-icon ${scenario.iconBg}`}>
                                                        {scenario.id === "random" ? (
                                                            <i className="fa-solid fa-question"></i>
                                                        ) : (
                                                            scenario.icon
                                                        )}
                                                    </div>
                                                    <div className="sim-scenario-content">
                                                        <div className="sim-scenario-header">
                                                            <span className={`sim-scenario-title ${scenario.titleColor}`}>
                                                                {scenario.title}
                                                            </span>
                                                            <div className="sim-scenario-tags">
                                                                {scenario.tags.map((tag, idx) => (
                                                                    <span key={idx} className={`sim-tag ${tag.color}`}>
                                                                        {tag.label}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <p className="sim-scenario-desc">{scenario.description}</p>
                                                    </div>
                                                </label>
                                            ))}
                                        </section>
                                    ))}

                                    {/* Custom Scenario */}
                                    <section className="sim-scenario-category">
                                        <h4 className="sim-category-title">✏️ 사용자 정의</h4>
                                        <label
                                            className={`sim-scenario-card custom ${selectedScenario === "custom" ? "selected" : ""}`}
                                            onClick={() => handleScenarioSelect("custom")}
                                        >
                                            <input
                                                type="radio"
                                                name="scenario"
                                                checked={selectedScenario === "custom"}
                                                onChange={() => handleScenarioSelect("custom")}
                                            />
                                            <i className="fa-solid fa-pen"></i>
                                            <span>직접 시나리오 구성하기</span>
                                        </label>
                                    </section>
                                </div>

                                {showCustomPrompt && (
                                    <div className="sim-custom-prompt">
                                        <label>
                                            <i className="fa-solid fa-wand-magic-sparkles"></i> AI 시나리오 생성 프롬프트
                                        </label>
                                        <textarea
                                            rows={3}
                                            placeholder="[누가] ADHD 학생이, [언제] 수업 중, [어떤 문제]를 일으킨 상황인지..."
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="sim-settings-panel">
                                <div className="sim-panel-header">
                                    <h3><i className="fa-solid fa-sliders"></i> 시나리오 환경 설정</h3>
                                    <p>학습자 수준에 맞게 시뮬레이션 환경 조건을 조절합니다.</p>
                                </div>

                                <div className="sim-slider-group">
                                    <div className="sim-slider-header">
                                        <span>소음 수준</span>
                                        <span className="sim-slider-value-number">{problemNoise}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={problemNoise}
                                        onChange={(e) => setProblemNoise(Number(e.target.value))}
                                    />
                                    <div className="sim-slider-labels-edge">
                                        <span>조용함</span>
                                        <span>시끄러움</span>
                                    </div>
                                </div>

                                <div className="sim-slider-group">
                                    <div className="sim-slider-header">
                                        <span>돌발 반응 빈도</span>
                                        <span className="sim-slider-value-number">
                                            {problemReaction === 1 ? "하" : problemReaction === 2 ? "중" : "상"}
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min="1"
                                        max="3"
                                        value={problemReaction}
                                        onChange={(e) => setProblemReaction(Number(e.target.value))}
                                    />
                                    <div className="sim-slider-labels-edge">
                                        <span>안정</span>
                                        <span>혼란</span>
                                    </div>
                                </div>

                                <div className="sim-toggle-option-v3">
                                    <div className="sim-toggle-info">
                                        <div className="sim-toggle-label-row">
                                            <span className="sim-toggle-label">학생 특성 표시</span>
                                            <i className="fa-solid fa-circle-exclamation sim-tooltip-icon"></i>
                                            <div className="sim-tooltip">
                                                시뮬레이션에 익숙해지면 학생특성을 표시하지 말고 선생님 스스로 학습자의 특성을 파악해보세요.
                                            </div>
                                        </div>
                                        <div className="sim-toggle-hint">시뮬레이션 내 정보 노출</div>
                                    </div>
                                    <label className="sim-toggle">
                                        <input
                                            type="checkbox"
                                            checked={showProblemTraits}
                                            onChange={(e) => setShowProblemTraits(e.target.checked)}
                                        />
                                        <span className="sim-toggle-slider"></span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Practice Tab */}
                    {activeTab === "practice" && (
                        <div className="sim-practice-content">
                            {/* 영상 분석 바로가기 버튼 */}
                            <div className="sim-video-analysis-banner">
                                <div className="sim-banner-content">
                                    <div className="sim-banner-icon">🎬</div>
                                    <div className="sim-banner-text">
                                        <h4>실제 수업 영상이 있으신가요?</h4>
                                        <p>녹화된 수업 실연 영상을 AI가 분석하여 맞춤형 피드백을 제공합니다.</p>
                                    </div>
                                </div>
                                <button
                                    className="sim-btn-video-analysis"
                                    onClick={() => router.push("/prepare")}
                                >
                                    <i className="fa-solid fa-video"></i>
                                    수업 실연 녹화 영상 분석하기
                                </button>
                            </div>

                            {/* Avatar Section */}
                            <section className="sim-avatar-section">
                                <div className="sim-section-header">
                                    <div>
                                        <h3><i className="fa-solid fa-users-viewfinder"></i> 특수 아바타 투입</h3>
                                        <p>수업에 참여할 특별 관찰 대상 학생을 선택하세요.</p>
                                    </div>
                                    <div className="sim-toggle-inline">
                                        <span>학생 특성 표시</span>
                                        <label className="sim-toggle">
                                            <input type="checkbox" defaultChecked />
                                            <span className="sim-toggle-slider"></span>
                                        </label>
                                    </div>
                                </div>

                                <div className="sim-avatar-grid">
                                    {AVATARS.map((avatar) => (
                                        <label
                                            key={avatar.id}
                                            className={`sim-avatar-card ${selectedAvatars.includes(avatar.id) ? "selected" : ""}`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedAvatars.includes(avatar.id)}
                                                onChange={() => toggleAvatar(avatar.id)}
                                            />
                                            <img src={avatar.image} alt={avatar.name} />
                                            <div className="sim-avatar-name">{avatar.name}</div>
                                            <div className="sim-avatar-trait">{avatar.trait}</div>
                                        </label>
                                    ))}
                                    <button className="sim-add-avatar" onClick={() => setShowAvatarModal(true)}>
                                        <i className="fa-solid fa-plus"></i>
                                        <span>아바타 생성</span>
                                    </button>
                                </div>
                            </section>

                            <div className="sim-practice-grid">
                                {/* Class Rules */}
                                <div className="sim-practice-left">
                                    <section className="sim-card">
                                        <div className="sim-card-header-with-tooltip">
                                            <h3>
                                                <i className="fa-solid fa-bullhorn"></i> 학급 운영 규칙
                                                <i className="fa-regular fa-circle-question sim-header-tooltip-icon"></i>
                                            </h3>
                                            <div className="sim-header-tooltip">
                                                <span className="sim-tooltip-title">💡 안내사항</span>
                                                학급 운영 규칙은 수업 중 교사의 개입과 판단을 일관되게 만드는 기준입니다.
                                                예를 들어 집중 유도 방법으로 '박수 세 번 시작!'과 같은 집중 구호 사용, 교사의 손 신호, 즉각적 주의 환기 등을 설정할 수 있습니다.
                                                <br /><br />
                                                기타 운영 방침으로는 손 들고 말하기, 발언 순서 지키기, 반복 행동에 대한 단계적 대응 등을 정할 수 있으며, 이러한 설정은 시뮬레이션 속 학생 반응과 수업 흐름에 직접 반영됩니다.
                                            </div>
                                        </div>
                                        <div className="sim-form-group">
                                            <label>집중 유도 방법</label>
                                            <input
                                                type="text"
                                                value={practiceAttention}
                                                onChange={(e) => setPracticeAttention(e.target.value)}
                                                placeholder="집중 유도 방법을 입력하세요"
                                            />
                                        </div>
                                        <div className="sim-form-group">
                                            <label>기타 운영 방침</label>
                                            <textarea
                                                rows={1}
                                                value={practiceRules}
                                                onChange={(e) => setPracticeRules(e.target.value)}
                                                placeholder="규칙을 입력하세요..."
                                            />
                                        </div>
                                    </section>

                                    <section className="sim-card">
                                        <h3><i className="fa-solid fa-book-open"></i> 수업 개요</h3>
                                        <div className="sim-form-row">
                                            <div className="sim-form-group">
                                                <label>학년</label>
                                                <select
                                                    value={practiceGrade}
                                                    onChange={(e) => {
                                                        setPracticeGrade(e.target.value);
                                                        setPracticeSubject("");
                                                    }}
                                                >
                                                    <option value="">학년 선택</option>
                                                    <option value="1">1학년</option>
                                                    <option value="2">2학년</option>
                                                    <option value="3">3학년</option>
                                                    <option value="4">4학년</option>
                                                    <option value="5">5학년</option>
                                                    <option value="6">6학년</option>
                                                </select>
                                            </div>
                                            <div className="sim-form-group">
                                                <label>과목</label>
                                                <select
                                                    value={practiceSubject}
                                                    onChange={(e) => setPracticeSubject(e.target.value)}
                                                >
                                                    {!practiceGrade ? (
                                                        <option value="">학년을 먼저 선택해주세요</option>
                                                    ) : (
                                                        <>
                                                            <option value="">과목 선택</option>
                                                            {SUBJECTS_DATA[practiceGrade]?.map((sub) => (
                                                                <option key={sub.val} value={sub.val}>{sub.text}</option>
                                                            ))}
                                                        </>
                                                    )}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="sim-form-group">
                                            <label>교수학습과정안 업로드</label>
                                            <input type="file" className="sim-file-input" />
                                        </div>
                                        <div className="sim-form-group">
                                            <label>활용 에듀테크 도구</label>
                                            <div className="sim-checkbox-grid">
                                                <label className="sim-checkbox-item-v3">
                                                    <input type="checkbox" />
                                                    <span>태블릿 PC</span>
                                                </label>
                                                <label className="sim-checkbox-item-v3">
                                                    <input type="checkbox" />
                                                    <span>전자칠판</span>
                                                </label>
                                            </div>
                                        </div>
                                    </section>
                                </div>

                                {/* Environment Settings */}
                                <div className="sim-practice-right">
                                    <section className="sim-card alt">
                                        <h3><i className="fa-solid fa-volume-high"></i> 수업 환경 설정</h3>
                                        <div className="sim-form-group">
                                            <label>학생 수</label>
                                            <input
                                                type="number"
                                                value={practiceStudentCount}
                                                onChange={(e) => setPracticeStudentCount(Number(e.target.value))}
                                            />
                                        </div>
                                        <div className="sim-slider-group">
                                            <div className="sim-slider-header">
                                                <span>소음 수준</span>
                                                <span className="sim-slider-value-number">{practiceNoise}</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                value={practiceNoise}
                                                onChange={(e) => setPracticeNoise(Number(e.target.value))}
                                            />
                                            <div className="sim-slider-labels-edge">
                                                <span>조용함</span>
                                                <span>시끄러움</span>
                                            </div>
                                        </div>
                                        <div className="sim-form-group">
                                            <label>수업 구조</label>
                                            <select
                                                value={practiceStructure}
                                                onChange={(e) => setPracticeStructure(e.target.value)}
                                            >
                                                <option value="individual">개별 활동</option>
                                                <option value="pair">짝 활동 (2인)</option>
                                                <option value="group">모둠 활동 (4인)</option>
                                            </select>
                                        </div>

                                        <div className="sim-divider"></div>

                                        <h4 className="sim-group-level-title">학생 집단 수준</h4>
                                        <div className="sim-slider-group-compact">
                                            <div className="sim-slider-header">
                                                <span className="sim-slider-label-with-tooltip">
                                                    내용 지식
                                                    <i className="fa-regular fa-circle-question sim-tooltip-icon-small"></i>
                                                    <div className="sim-tooltip-small">선수 지식 수준 (하: 부족, 상: 풍부)</div>
                                                </span>
                                                <span className="sim-slider-value-number">중</span>
                                            </div>
                                            <input type="range" min="1" max="3" defaultValue="2" />
                                        </div>
                                        <div className="sim-slider-group-compact">
                                            <div className="sim-slider-header">
                                                <span className="sim-slider-label-with-tooltip">
                                                    학습 태도
                                                    <i className="fa-regular fa-circle-question sim-tooltip-icon-small"></i>
                                                    <div className="sim-tooltip-small">수업 참여 의지 (하: 산만, 상: 집중)</div>
                                                </span>
                                                <span className="sim-slider-value-number">중</span>
                                            </div>
                                            <input type="range" min="1" max="3" defaultValue="2" />
                                        </div>
                                        <div className="sim-slider-group-compact">
                                            <div className="sim-slider-header">
                                                <span className="sim-slider-label-with-tooltip">
                                                    돌발 반응
                                                    <i className="fa-regular fa-circle-question sim-tooltip-icon-small"></i>
                                                    <div className="sim-tooltip-small">방해 행동 빈도 (하: 안정, 상: 빈번)</div>
                                                </span>
                                                <span className="sim-slider-value-number">중</span>
                                            </div>
                                            <input type="range" min="1" max="3" defaultValue="2" />
                                        </div>
                                        <div className="sim-slider-group-compact">
                                            <div className="sim-slider-header">
                                                <span className="sim-slider-label-with-tooltip">
                                                    적극성
                                                    <i className="fa-regular fa-circle-question sim-tooltip-icon-small"></i>
                                                    <div className="sim-tooltip-small">발표 및 참여도 (하: 소극, 상: 적극)</div>
                                                </span>
                                                <span className="sim-slider-value-number">중</span>
                                            </div>
                                            <input type="range" min="1" max="3" defaultValue="2" />
                                        </div>
                                    </section>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* History Tab */}
                    {activeTab === "history" && (
                        <div className="sim-history-content">
                            {/* 모바일 요약 보기 안내 */}
                            <div className="mobile-summary-notice">
                                <div className="notice-icon">📱</div>
                                <h4>핵심 요약 보기</h4>
                                <p>상세 분석은 PC에서 확인하세요</p>
                            </div>

                            {/* 성찰하기 서브탭 네비게이션 */}
                            <div className="sim-subtabs">
                                <button
                                    className={`sim-subtab ${historySubTab === "overview" ? "active" : ""}`}
                                    onClick={() => setHistorySubTab("overview")}
                                >
                                    💬 종합 피드백
                                </button>
                                <button
                                    className={`sim-subtab ${historySubTab === "problem" ? "active" : ""}`}
                                    onClick={() => setHistorySubTab("problem")}
                                >
                                    🧩 문제중심 XR
                                </button>
                                <button
                                    className={`sim-subtab ${historySubTab === "lesson" ? "active" : ""}`}
                                    onClick={() => setHistorySubTab("lesson")}
                                >
                                    🎓 수업실연 XR
                                </button>
                            </div>

                            {/* 종합 피드백 서브탭 */}
                            {historySubTab === "overview" && (
                                <div className="sim-overview-section">
                                    {/* 실습 현황 간략 정보 */}
                                    <div className="sim-practice-summary-bar">
                                        <span className="sim-practice-count">🎯 총 {FEEDBACK_SUMMARY.totalPractices}회 실습</span>
                                        <span className="sim-practice-detail">🧩 문제중심 XR {FEEDBACK_SUMMARY.vrPractices}회</span>
                                        <span className="sim-practice-detail">🎓 수업실연 XR {FEEDBACK_SUMMARY.offlinePractices}회</span>
                                    </div>

                                    {/* 강점/발전 영역 좌우 배치 */}
                                    <div className="sim-feedback-highlights-row">
                                        {/* 강점 피드백 */}
                                        <div className="sim-highlight-card strengths">
                                            <div className="sim-highlight-header">
                                                <span className="sim-highlight-icon">💪</span>
                                                <h3>강점 영역</h3>
                                            </div>
                                            <div className="sim-highlight-content">
                                                {FEEDBACK_SUMMARY.keyStrengths.map((item, i) => (
                                                    <div key={i} className="sim-highlight-item">
                                                        <span className="sim-highlight-area">{item.area}</span>
                                                        <p className="sim-highlight-desc">{item.description}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* 개선점 피드백 */}
                                        <div className="sim-highlight-card improvements">
                                            <div className="sim-highlight-header">
                                                <span className="sim-highlight-icon">🌱</span>
                                                <h3>발전 방향</h3>
                                            </div>
                                            <div className="sim-highlight-content">
                                                {FEEDBACK_SUMMARY.keyImprovements.map((item, i) => (
                                                    <div key={i} className="sim-highlight-item">
                                                        <span className="sim-highlight-area">{item.area}</span>
                                                        <p className="sim-highlight-desc">{item.description}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* 최근 피드백 하이라이트 */}
                                    <div className="sim-recent-feedback-section">
                                        <h3>📝 최근 피드백 하이라이트</h3>
                                        <ul className="sim-feedback-highlights-list">
                                            {FEEDBACK_SUMMARY.recentHighlights.map((item, i) => (
                                                <li key={i}>{item}</li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* 최근 실습 피드백 미리보기 */}
                                    <div className="sim-recent-practices-preview">
                                        <h3>🕒 최근 실습 피드백</h3>
                                        <div className="sim-preview-grid">
                                            {RECENT_VR_PRACTICES.map((item) => (
                                                <div
                                                    key={`vr-${item.id}`}
                                                    className="sim-preview-card vr"
                                                    onClick={() => setHistorySubTab("problem")}
                                                >
                                                    <div className="sim-preview-badge">🧩 문제중심</div>
                                                    <h4>{item.scenario}</h4>
                                                    <p className="sim-preview-summary">{item.feedbackSummary}</p>
                                                    <span className="sim-preview-date">{item.date}</span>
                                                </div>
                                            ))}
                                            {RECENT_OFFLINE_PRACTICES.map((item) => (
                                                <div
                                                    key={`offline-${item.id}`}
                                                    className="sim-preview-card offline"
                                                    onClick={() => setHistorySubTab("lesson")}
                                                >
                                                    <div className="sim-preview-badge">🎓 수업실연 XR</div>
                                                    <h4>{item.lesson}</h4>
                                                    <p className="sim-preview-summary">{item.feedbackSummary}</p>
                                                    <span className="sim-preview-date">{item.date}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 문제중심 실습 서브탭 */}
                            {historySubTab === "problem" && (
                                <div className="sim-problem-history">
                                    <h3 className="sim-history-title">
                                        <i className="fa-solid fa-clock-rotate-left"></i> 지난 시뮬레이션 성찰 기록
                                    </h3>
                                    <div className="sim-history-grid">
                                        {HISTORY_ITEMS.map((item) => (
                                            <div key={item.id} className="sim-history-card">
                                                <div className="sim-history-thumb">
                                                    <img src={item.thumb} alt="썸네일" />
                                                    <div className="sim-history-date">{item.date}</div>
                                                </div>
                                                <h4>{item.title}</h4>
                                                <p>성공률 {item.rate} • {item.level}</p>
                                                <div className="sim-history-actions">
                                                    <button
                                                        className="sim-btn-outline"
                                                        onClick={() => window.open("https://bnue-ai-feedback.vercel.app/vr_analyze", "_blank")}
                                                    >
                                                        결과 리포트
                                                    </button>
                                                    <button className="sim-btn-amber">다시하기</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 수업실연 서브탭 */}
                            {historySubTab === "lesson" && (
                                <div className="sim-lesson-history">
                                    <h3 className="sim-history-title">
                                        <i className="fa-solid fa-graduation-cap"></i> 지난 수업실연 XR 성찰 기록
                                    </h3>
                                    <div className="sim-history-grid">
                                        {LESSON_HISTORY_ITEMS.map((item) => (
                                            <div key={item.id} className="sim-history-card">
                                                <div className="sim-history-thumb">
                                                    <img src={item.thumb} alt="썸네일" />
                                                    <div className="sim-history-date">{item.date}</div>
                                                </div>
                                                <h4>{item.title}</h4>
                                                <p>{item.grade} • {item.subject}</p>
                                                <div className="sim-history-actions">
                                                    <button
                                                        className="sim-btn-outline"
                                                        onClick={() => window.open("https://bnue-ai-feedback.vercel.app/vr_analyze", "_blank")}
                                                    >
                                                        결과 리포트
                                                    </button>
                                                    <button className="sim-btn-amber">다시하기</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* Avatar Modal */}
            {showAvatarModal && (
                <div className="sim-modal-overlay" onClick={() => setShowAvatarModal(false)}>
                    <div className="sim-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="sim-modal-header">
                            <h3>✨ 새로운 아바타 만들기</h3>
                            <button onClick={() => setShowAvatarModal(false)}>
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                        <div className="sim-modal-body">
                            <div className="sim-form-group">
                                <label>아바타 외형 묘사</label>
                                <input type="text" placeholder="예: 안경을 쓰고 단정한 교복을 입은 남학생" />
                            </div>
                            <div className="sim-form-group">
                                <label>성격 및 학습 특징</label>
                                <textarea
                                    rows={4}
                                    placeholder="[성격] 내성적이나 칭찬에 민감함&#10;[특징] 수학 문제는 잘 풀지만 발표를 꺼려함"
                                />
                            </div>
                        </div>
                        <div className="sim-modal-footer">
                            <button className="sim-btn-ghost" onClick={() => setShowAvatarModal(false)}>
                                취소
                            </button>
                            <button className="sim-btn-primary">생성하기</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Video Tutorial Modal */}
            {showVideoModal && (
                <div className="sim-modal-overlay sim-video-modal-overlay" onClick={() => setShowVideoModal(false)}>
                    <div className="sim-video-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="sim-video-modal-header">
                            <h3><i className="fa-solid fa-circle-play"></i> 플랫폼 튜토리얼 영상</h3>
                            <button onClick={() => setShowVideoModal(false)}>
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                        <div className="sim-video-placeholder">
                            <div className="sim-video-placeholder-content">
                                <i className="fa-solid fa-play"></i>
                                <p>영상 콘텐츠가 재생되는 영역입니다.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Simulation Modal */}
            {showSimulationModal && (
                <div className="sim-fullscreen-modal">
                    <button className="sim-close-btn" onClick={() => setShowSimulationModal(false)}>
                        <i className="fa-solid fa-xmark"></i> 종료
                    </button>
                    <div className="sim-image-wrapper">
                        <img src={simulationImage} alt="VR Simulation" />
                        <button className="sim-help-btn" type="button">
                            <i className="fa-solid fa-hand-holding-heart"></i> 도움요청
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
