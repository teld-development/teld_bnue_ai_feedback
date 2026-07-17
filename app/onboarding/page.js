"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const YEAR_OPTIONS = [
    { value: 1, label: "1학년", description: "교직 입문" },
    { value: 2, label: "2학년", description: "기초 역량" },
    { value: 3, label: "3학년", description: "심화 학습" },
    { value: 4, label: "4학년", description: "실습 준비" }
];

const CONFIDENCE_OPTIONS = [
    { value: 1, label: "매우 자신없음", emoji: "😰" },
    { value: 2, label: "자신없음", emoji: "😟" },
    { value: 3, label: "보통", emoji: "😐" },
    { value: 4, label: "자신있음", emoji: "🙂" },
    { value: 5, label: "매우 자신있음", emoji: "😊" }
];

const EXPERIENCE_OPTIONS = [
    { value: 1, label: "거의 없음", description: "0~1회" },
    { value: 2, label: "적음", description: "2~3회" },
    { value: 3, label: "보통", description: "4~6회" },
    { value: 4, label: "많음", description: "7~10회" },
    { value: 5, label: "매우 많음", description: "11회 이상" }
];

export default function OnboardingPage() {
    const router = useRouter();
    const [year, setYear] = useState(null);
    const [confidence, setConfidence] = useState(null);
    const [experience, setExperience] = useState(null);

    const isComplete = year !== null && confidence !== null && experience !== null;

    const handleSubmit = () => {
        if (!isComplete) return;

        // 추후 서버에 저장하거나 로컬 스토리지에 저장할 수 있음
        const profileData = {
            year,
            confidence,
            experience,
            createdAt: new Date().toISOString()
        };

        // 로컬 스토리지에 임시 저장
        localStorage.setItem("teacherProfile", JSON.stringify(profileData));

        router.push("/xr_int_dashboard");
    };

    return (
        <main className="onboarding-page">
            <div className="onboarding-card">
                {/* 헤더 */}
                <div className="onboarding-header">
                    <div className="onboarding-icon">👋</div>
                    <h1>환영합니다!</h1>
                    <p>더 나은 피드백을 위해 몇 가지 정보를 알려주세요</p>
                </div>

                {/* 학년 선택 */}
                <section className="onboarding-section">
                    <h2>
                        <span className="section-number">1</span>
                        현재 학년을 선택해주세요
                    </h2>
                    <div className="year-options">
                        {YEAR_OPTIONS.map((option) => (
                            <button
                                key={option.value}
                                className={`year-card ${year === option.value ? "selected" : ""}`}
                                onClick={() => setYear(option.value)}
                            >
                                <span className="year-number">{option.value}</span>
                                <span className="year-label">{option.label}</span>
                                <span className="year-desc">{option.description}</span>
                            </button>
                        ))}
                    </div>
                </section>

                {/* 자신감 선택 */}
                <section className="onboarding-section">
                    <h2>
                        <span className="section-number">2</span>
                        수업 실연에 대한 자신감은 어떠신가요?
                    </h2>
                    <div className="confidence-options">
                        {CONFIDENCE_OPTIONS.map((option) => (
                            <button
                                key={option.value}
                                className={`confidence-card ${confidence === option.value ? "selected" : ""}`}
                                onClick={() => setConfidence(option.value)}
                            >
                                <span className="confidence-emoji">{option.emoji}</span>
                                <span className="confidence-label">{option.label}</span>
                            </button>
                        ))}
                    </div>
                </section>

                {/* 경험 선택 */}
                <section className="onboarding-section">
                    <h2>
                        <span className="section-number">3</span>
                        실제 수업 경험은 얼마나 있으신가요?
                    </h2>
                    <div className="experience-options">
                        {EXPERIENCE_OPTIONS.map((option) => (
                            <button
                                key={option.value}
                                className={`experience-card ${experience === option.value ? "selected" : ""}`}
                                onClick={() => setExperience(option.value)}
                            >
                                <span className="experience-label">{option.label}</span>
                                <span className="experience-desc">{option.description}</span>
                            </button>
                        ))}
                    </div>
                </section>

                {/* 제출 버튼 */}
                <button
                    className={`onboarding-submit ${isComplete ? "" : "disabled"}`}
                    onClick={handleSubmit}
                    disabled={!isComplete}
                >
                    {isComplete ? "시작하기 →" : "모든 항목을 선택해주세요"}
                </button>
            </div>
        </main>
    );
}
