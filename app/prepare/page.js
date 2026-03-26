"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const GRADE_OPTIONS = [
    "초등학교 1학년", "초등학교 2학년", "초등학교 3학년",
    "초등학교 4학년", "초등학교 5학년", "초등학교 6학년"
];

const SUBJECT_OPTIONS = [
    { label: "국어", disabled: true },
    { label: "수학", disabled: false },
    { label: "사회", disabled: true },
    { label: "과학", disabled: true },
    { label: "영어", disabled: true },
    { label: "음악", disabled: true },
    { label: "실과", disabled: true },
    { label: "도덕", disabled: true },
    { label: "체육", disabled: true },
    { label: "통합", disabled: true },
];

const FEEDBACK_AREAS = [
    { id: "delivery", label: "전달력", desc: "발성, 속도, 명확성", detail: "목소리 크기와 발음의 정확성, 말하기 속도의 적절성, 핵심 개념 설명의 명확성을 분석합니다." },
    { id: "interaction", label: "상호작용", desc: "질문, 피드백, 참여 유도", detail: "학생에게 던지는 질문의 빈도와 유형, 학생 반응에 대한 피드백, 수업 참여를 유도하는 전략을 분석합니다." },
    { id: "attitude", label: "태도", desc: "시선, 자세, 표정", detail: "학생과의 눈 맞춤, 교사의 자세와 움직임, 표정과 비언어적 소통 방식을 분석합니다." },
    { id: "content", label: "교수·학습 구성", desc: "수업 설계, 학습 활동", detail: "수업의 도입-전개-정리 흐름, 교수 전략과 학습 활동의 적절성, 성취기준 연계성을 분석합니다." },
    { id: "board", label: "판서/자료", desc: "시각 자료 활용", detail: "판서의 구조화 및 가독성, PPT나 교구 등 시각 자료의 효과적인 활용을 분석합니다." },
    { id: "habit", label: "수업 습관", desc: "언어 습관, 행동 패턴", detail: "반복적으로 나타나는 언어 습관(말버릇, 추임새 등)과 행동 패턴(제스처, 이동 동선 등)을 분석합니다." },
];

export default function PreparePage() {
    const router = useRouter();

    // 수업 정보
    const [grade, setGrade] = useState("");
    const [subject, setSubject] = useState("");
    const [lessonPlan, setLessonPlan] = useState(null);
    const [conditions, setConditions] = useState([]);

    // 피드백 영역 선택
    const [selectedAreas, setSelectedAreas] = useState([]);

    // 동의 항목
    const [consentAnalysis, setConsentAnalysis] = useState(false);

    // 페이지 로드 시 sessionStorage에서 이전 데이터 복원
    useEffect(() => {
        const savedData = sessionStorage.getItem("prepareData");
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                if (data.grade) setGrade(data.grade);
                if (data.subject) setSubject(data.subject);
                if (data.feedbackAreas) setSelectedAreas(data.feedbackAreas);
                if (data.conditions) setConditions(data.conditions);
                // lessonPlan은 File 객체라서 sessionStorage에서 복원 불가
                // 대신 이름만 표시할 수 있도록 처리
            } catch (err) {
                console.error("prepareData 복원 실패:", err);
            }
        }
    }, []);

    const toggleArea = (areaId) => {
        setSelectedAreas((prev) =>
            prev.includes(areaId)
                ? prev.filter((id) => id !== areaId)
                : [...prev, areaId]
        );
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setLessonPlan(file);
        }
    };

    // 조건 추가
    const addCondition = () => {
        if (conditions.length < 6) {
            setConditions([...conditions, ""]);
        }
    };

    // 조건 삭제
    const removeCondition = (index) => {
        setConditions(conditions.filter((_, i) => i !== index));
    };

    // 조건 수정
    const updateCondition = (index, value) => {
        const newConditions = [...conditions];
        newConditions[index] = value;
        setConditions(newConditions);
    };

    const canProceed = grade && subject && consentAnalysis && selectedAreas.length > 0;

    const handleNext = async () => {
        if (canProceed) {
            // 지도안이 있으면 Base64로 변환
            let lessonPlanData = null;
            if (lessonPlan) {
                const buffer = await lessonPlan.arrayBuffer();
                const base64 = btoa(
                    new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
                );
                lessonPlanData = {
                    name: lessonPlan.name,
                    type: lessonPlan.type,
                    base64: base64
                };
            }

            // sessionStorage에 prepare 데이터 저장
            const validConditions = conditions.filter(c => c.trim() !== "");
            sessionStorage.setItem("prepareData", JSON.stringify({
                grade,
                subject,
                feedbackAreas: selectedAreas,
                lessonPlan: lessonPlanData,
                conditions: validConditions
            }));
            router.push("/upload");
        }
    };

    return (
        <main className="prepare-page">
            <div className="prepare-container">
                <header className="prepare-header">
                    <h1>수업 분석 준비</h1>
                    <p>수업 맥락에 맞는 피드백을 제공하기 위해 아래 정보를 입력해주세요.</p>
                </header>

                {/* 섹션 1: 수업 정보 */}
                <section className="prepare-section">
                    <h2>수업 정보</h2>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="grade">학년 *</label>
                            <select
                                id="grade"
                                value={grade}
                                onChange={(e) => setGrade(e.target.value)}
                            >
                                <option value="">선택하세요</option>
                                {GRADE_OPTIONS.map((g) => (
                                    <option key={g} value={g}>{g}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="subject">과목 *</label>
                            <select
                                id="subject"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                            >
                                <option value="">선택하세요</option>
                                {SUBJECT_OPTIONS.map((s) => (
                                    <option key={s.label} value={s.label} disabled={s.disabled}>
                                        {s.label}{s.disabled ? " (확장 예정)" : ""}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>수업 지도안 (선택)</label>
                        <div className="file-upload">
                            <input
                                type="file"
                                accept=".pdf,.hwp,.hwpx"
                                onChange={handleFileChange}
                                id="lessonPlan"
                            />
                            <label htmlFor="lessonPlan" className="file-upload-label">
                                {lessonPlan ? lessonPlan.name : "PDF 파일만 추가 가능"}
                            </label>
                        </div>
                        <span className="form-hint">수업 지도안을 업로드하면 수업 지도안과 수업이 얼마나 잘 맞는지 확인할 수 있습니다.</span>
                    </div>

                    {/* 분석 조건 입력 */}
                    <div className="form-group">
                        <div className="conditions-header">
                            <label>분석 조건 (선택)</label>
                            {conditions.length < 6 && (
                                <button type="button" className="btn-add-condition" onClick={addCondition}>
                                    + 조건 추가
                                </button>
                            )}
                        </div>
                        <span className="form-hint">수업에서 확인하고 싶은 특정 조건을 입력하면 해당 조건의 충족 여부를 분석합니다. (최대 6개)</span>

                        {conditions.length > 0 && (
                            <div className="conditions-list">
                                {conditions.map((condition, index) => (
                                    <div key={index} className="condition-item">
                                        <span className="condition-number">{index + 1}</span>
                                        <input
                                            type="text"
                                            placeholder="예: 학생들에게 발문을 3회 이상 했는가"
                                            value={condition}
                                            onChange={(e) => updateCondition(index, e.target.value)}
                                            className="condition-input"
                                        />
                                        <button
                                            type="button"
                                            className="btn-remove-condition"
                                            onClick={() => removeCondition(index)}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* 섹션 2: 피드백 영역 선택 */}
                <section className="prepare-section">
                    <h2>피드백 영역 선택 *</h2>
                    <p className="section-desc">피드백 받고 싶은 영역을 선택해주세요. (1개 이상)</p>

                    <div className="feedback-grid">
                        {FEEDBACK_AREAS.map((area) => (
                            <button
                                key={area.id}
                                type="button"
                                className={`feedback-chip ${selectedAreas.includes(area.id) ? "selected" : ""}`}
                                onClick={() => toggleArea(area.id)}
                                title={area.detail}
                            >
                                {selectedAreas.includes(area.id) && (
                                    <span className="chip-check">✓</span>
                                )}
                                <span className="chip-label">{area.label}</span>
                                <span className="chip-desc">{area.desc}</span>
                                <span className="chip-detail">{area.detail}</span>
                            </button>
                        ))}
                    </div>
                </section>

                {/* 섹션 3: 개인정보 및 데이터 동의 */}
                <section className="prepare-section consent-section">
                    <h2>개인정보 및 데이터 동의</h2>

                    <div className="consent-box">
                        <label className="consent-item">
                            <input
                                type="checkbox"
                                checked={consentAnalysis}
                                onChange={(e) => setConsentAnalysis(e.target.checked)}
                            />
                            <div className="consent-content">
                                <span className="consent-title">분석 목적 데이터 사용 동의 *</span>
                                <span className="consent-desc">
                                    영상 내 학생 및 동료의 데이터는 수업 분석 목적으로만 사용되며,
                                    분석 완료 후 원본 데이터는 즉시 파기됩니다.
                                </span>
                            </div>
                        </label>

                    </div>
                </section>

                {/* 하단 버튼 */}
                <div className="prepare-actions">
                    <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => router.push("/dashboard")}
                    >
                        이전으로
                    </button>
                    <button
                        type="button"
                        className="btn-primary"
                        disabled={!canProceed}
                        onClick={handleNext}
                    >
                        다음: 영상 업로드
                    </button>
                </div>
            </div>
        </main>
    );
}
