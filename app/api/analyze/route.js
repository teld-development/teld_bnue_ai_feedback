import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { del } from '@vercel/blob';

// Pro 플랜: 60초 실행 시간
export const maxDuration = 60;

export async function POST(request) {
    let blobUrl = null;

    try {
        console.log("[분석 API] 요청 시작");

        const body = await request.json();
        const {
            blobUrl: videoUrl,
            fileName,
            mimeType,
            grade = "",
            subject = "",
            unitName = "",
            feedbackAreas = "",
            lessonPlanUrl = null,
            conditions = [],
            showScoreWithFeedback = false
        } = body;

        blobUrl = videoUrl;
        console.log("[분석 API] Blob URL:", blobUrl);
        console.log("[분석 API] 파일명:", fileName);

        if (!blobUrl) {
            return Response.json({ error: "비디오 URL이 필요합니다." }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return Response.json({ error: "GEMINI_API_KEY가 설정되지 않았습니다." }, { status: 500 });
        }

        const cleanApiKey = apiKey.trim();

        // Blob에서 비디오 다운로드
        console.log("[분석 API] Blob에서 비디오 다운로드 중...");
        const videoResponse = await fetch(blobUrl);
        if (!videoResponse.ok) {
            throw new Error("Blob에서 비디오를 가져오지 못했습니다.");
        }

        const videoBuffer = Buffer.from(await videoResponse.arrayBuffer());
        console.log("[분석 API] 다운로드 완료, 크기:", videoBuffer.length);

        // File Manager 초기화
        console.log("[분석 API] FileManager 초기화 중...");
        const fileManager = new GoogleAIFileManager(cleanApiKey);

        // 임시 파일 저장
        const fs = await import("fs");
        const path = await import("path");
        const os = await import("os");

        const tempDir = os.tmpdir();
        const tempFilePath = path.join(tempDir, `upload_${Date.now()}_${fileName}`);

        fs.writeFileSync(tempFilePath, videoBuffer);
        console.log("[분석 API] 임시 파일 저장 완료");

        // Gemini File API로 업로드
        console.log("[분석 API] Gemini File API 업로드 시작...");
        let uploadResult;
        try {
            uploadResult = await fileManager.uploadFile(tempFilePath, {
                mimeType: mimeType || "video/mp4",
                displayName: fileName,
            });
            console.log("[분석 API] Gemini 업로드 성공:", uploadResult.file?.name);
        } catch (uploadError) {
            console.error("[분석 API] Gemini 업로드 오류:", uploadError.message);
            fs.unlinkSync(tempFilePath);
            throw new Error("Gemini 업로드 실패: " + uploadError.message);
        }

        // 임시 파일 삭제
        fs.unlinkSync(tempFilePath);

        // 파일 처리 상태 확인 (ACTIVE가 될 때까지 대기)
        console.log("[분석 API] 파일 처리 상태 확인 중...");
        let file = await fileManager.getFile(uploadResult.file.name);
        let waitCount = 0;
        while (file.state === "PROCESSING" && waitCount < 10) {
            console.log("[분석 API] 파일 처리 중... (", waitCount + 1, "/10)");
            await new Promise((resolve) => setTimeout(resolve, 3000));
            file = await fileManager.getFile(uploadResult.file.name);
            waitCount++;
        }

        console.log("[분석 API] 파일 상태:", file.state);
        if (file.state === "FAILED") {
            throw new Error("영상 처리에 실패했습니다.");
        }
        if (file.state === "PROCESSING") {
            throw new Error("영상 처리 시간이 초과되었습니다. 더 짧은 영상을 시도해주세요.");
        }

        // ===== 지도안 PDF 처리 (있는 경우) =====
        let lessonPlanFile = null;
        let lessonPlanTempPath = null;
        if (lessonPlanUrl) {
            console.log("[분석 API] 지도안 PDF 처리 시작...");
            try {
                const lpResponse = await fetch(lessonPlanUrl);
                if (lpResponse.ok) {
                    const lpBuffer = Buffer.from(await lpResponse.arrayBuffer());
                    const lpFileName = lessonPlanUrl.split('/').pop() || 'lesson_plan.pdf';
                    lessonPlanTempPath = path.join(tempDir, `lp_${Date.now()}_${lpFileName}`);
                    fs.writeFileSync(lessonPlanTempPath, lpBuffer);

                    const lpUploadResult = await fileManager.uploadFile(lessonPlanTempPath, {
                        mimeType: 'application/pdf',
                        displayName: lpFileName,
                    });

                    // PDF 처리 대기
                    lessonPlanFile = await fileManager.getFile(lpUploadResult.file.name);
                    let lpWaitCount = 0;
                    while (lessonPlanFile.state === "PROCESSING" && lpWaitCount < 5) {
                        await new Promise((resolve) => setTimeout(resolve, 2000));
                        lessonPlanFile = await fileManager.getFile(lpUploadResult.file.name);
                        lpWaitCount++;
                    }

                    if (lessonPlanFile.state === "ACTIVE") {
                        console.log("[분석 API] 지도안 Gemini 업로드 성공");
                    } else {
                        console.warn("[분석 API] 지도안 처리 실패, 건너뜁니다.");
                        lessonPlanFile = null;
                    }

                    fs.unlinkSync(lessonPlanTempPath);
                }
            } catch (lpError) {
                console.warn("[분석 API] 지도안 처리 오류:", lpError.message);
                if (lessonPlanTempPath && fs.existsSync(lessonPlanTempPath)) {
                    fs.unlinkSync(lessonPlanTempPath);
                }
            }
        }

        // ===== 수학 성취기준 PDF 처리 (수학 과목이고 내용구성 분석 시) =====
        let mathStandardsFile = null;
        const isMathSubject = subject === "수학";
        const includesContentArea = feedbackAreas.includes("content");

        if (isMathSubject && includesContentArea) {
            console.log("[분석 API] 수학 성취기준 PDF 처리 시작...");
            try {
                // public 폴더의 PDF 파일 경로
                const mathStandardsPath = path.join(process.cwd(), 'public', 'math_acheive_standard.pdf');

                if (fs.existsSync(mathStandardsPath)) {
                    const msUploadResult = await fileManager.uploadFile(mathStandardsPath, {
                        mimeType: 'application/pdf',
                        displayName: 'math_achievement_standards.pdf',
                    });

                    // PDF 처리 대기
                    mathStandardsFile = await fileManager.getFile(msUploadResult.file.name);
                    let msWaitCount = 0;
                    while (mathStandardsFile.state === "PROCESSING" && msWaitCount < 5) {
                        await new Promise((resolve) => setTimeout(resolve, 2000));
                        mathStandardsFile = await fileManager.getFile(msUploadResult.file.name);
                        msWaitCount++;
                    }

                    if (mathStandardsFile.state === "ACTIVE") {
                        console.log("[분석 API] 수학 성취기준 Gemini 업로드 성공");
                    } else {
                        console.warn("[분석 API] 수학 성취기준 처리 실패, 건너뜁니다.");
                        mathStandardsFile = null;
                    }
                } else {
                    console.warn("[분석 API] 수학 성취기준 PDF 파일을 찾을 수 없습니다.");
                }
            } catch (msError) {
                console.warn("[분석 API] 수학 성취기준 처리 오류:", msError.message);
            }
        }

        // Gemini AI 초기화
        console.log("[분석 API] Gemini AI 분석 시작...");
        const genAI = new GoogleGenerativeAI(cleanApiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // 분석 프롬프트 구성
        const feedbackAreasList = feedbackAreas ? feedbackAreas.split(",") : [];
        const areaDescriptions = {
            delivery: "전달력 (발성, 속도, 명확성)",
            interaction: "상호작용 (질문, 피드백, 참여 유도)",
            attitude: "태도 (시선, 자세, 표정)",
            content: "교수·학습 구성 (수업 설계, 학습 활동)",
            board: "판서/자료 (시각 자료 활용)",
            habit: "수업 습관 (반복적 언어 습관, 행동 패턴)"
        };

        const selectedAreasText = feedbackAreasList
            .map(area => areaDescriptions[area] || area)
            .join(", ");

        // 지도안 분석 포함 여부에 따른 프롬프트 구성
        const lessonPlanSection = lessonPlanFile ? `

⚠️ 중요 - 지도안-수업 정합성 분석 (필수):
함께 제공된 수업 지도안(PDF)을 상세히 분석하여, 실제 수업 영상과 비교해주세요.
이 분석은 예비교사가 계획한 수업과 실제 수업의 차이를 파악하는 데 핵심적인 피드백입니다.

다음 항목을 꼼꼼하게 분석해주세요:
1. 수업 흐름(도입-전개-정리)이 지도안과 일치하는지
2. 계획된 학습 활동이 실제로 진행되었는지
3. 발문, 설명 방식이 지도안에 적힌 것과 유사한지
4. 시간 배분이 지도안과 비슷한지
5. 예상치 못한 변경 사항이 있었는지

응답 JSON에 다음 "lessonPlanAnalysis" 필드를 반드시 포함해주세요:
"lessonPlanAnalysis": {
  "overallConsistency": "높음/보통/낮음 중 하나 선택",
  "summary": "지도안 대비 실제 수업의 전반적인 정합성 평가 (2-3문장으로 구체적으로)",
  "matches": [
    "지도안과 일치한 구체적 부분 1 (예: 도입 단계에서 계획된 동기유발 활동이 잘 진행됨)",
    "지도안과 일치한 구체적 부분 2",
    "지도안과 일치한 구체적 부분 3"
  ],
  "deviations": [
    "지도안과 다르게 진행된 부분 1 (예: 계획된 모둠활동 대신 전체 토론으로 변경됨)",
    "지도안과 다르게 진행된 부분 2 (없으면 빈 배열)"
  ],
  "suggestions": [
    "지도안 활용 개선 제안 1 (예: 시간 배분을 좀 더 여유있게 계획하면 좋겠습니다)",
    "지도안 활용 개선 제안 2"
  ]
}` : '';

        // 조건 분석 포함 여부에 따른 프롬프트 구성
        const conditionsSection = conditions.length > 0 ? `

추가 분석 요청 - 조건 충족 여부 분석:
사용자가 입력한 다음 조건들을 수업 영상을 분석하여 각 조건의 충족 여부를 판단해주세요:
${conditions.map((c, i) => `${i + 1}. ${c}`).join('\n')}

응답 JSON에 다음 필드를 추가해주세요:
"conditionsAnalysis": [
  {
    "condition": "조건 내용",
    "fulfilled": true/false,
    "evidence": "해당 조건의 충족/미충족 근거 (영상에서 관찰된 구체적인 내용)",
    "timestamp": "MM:SS (해당 조건과 관련된 시점, 없으면 null)"
  }
]` : '';

        const prompt = `당신은 수업 분석 전문가입니다. 다음 수업 영상을 분석하고 구체적인 피드백을 제공해주세요.
점수나 평가가 아닌, 건설적이고 구체적인 피드백에 집중해주세요.

수업 정보:
- 학년: ${grade || "미지정"}
- 과목: ${subject || "미지정"}
- 단원명: ${unitName || "미지정"}
- 분석 영역: ${selectedAreasText || "전체"}

다음 JSON 형식으로 응답해주세요 (JSON만 출력, 다른 텍스트 없이):

{
  "timestamps": [
    { 
      "time": "MM:SS", 
      "seconds": 초단위숫자, 
      "category": "관련 영역 (전달력/상호작용/태도/내용구성/판서자료/수업습관 중 하나, 반드시 이 6개 중 하나를 정확히 사용)",
      "feedback": "해당 시점에서 관찰된 내용과 구체적인 피드백. 잘한 점이나 개선할 점을 명확히 설명해주세요."
    }
  ],
  "summary": {
    "overall": "전체 수업에 대한 종합적인 피드백 (3-4문장)",
    "strengths": ["강점 피드백 1", "강점 피드백 2", "강점 피드백 3"],
    "suggestions": ["개선 제안 1", "개선 제안 2", "개선 제안 3"]
  }${showScoreWithFeedback ? (() => {
                const areaCategoryMap = {
                    delivery: "전달력",
                    interaction: "상호작용",
                    attitude: "태도",
                    content: "내용구성",
                    board: "판서자료",
                    habit: "수업습관"
                };
                const activeAreas = feedbackAreasList.length > 0
                    ? feedbackAreasList.filter(a => areaCategoryMap[a])
                    : Object.keys(areaCategoryMap);
                const exampleScores = activeAreas.map(a => `    "${areaCategoryMap[a]}": 75`).join(',\n');
                return `,\n  "areaScores": {\n${exampleScores}\n  }`;
            })() : ''}
}

분석 시 주의사항:
1. timestamps는 영상 전체에서 10-15개의 주요 시점을 선정해주세요.
2. 각 타임스탬프의 seconds 필드는 해당 시점의 초 단위 값입니다 (예: "02:30"은 150초).
3. 피드백은 구체적이고 건설적으로 작성해주세요. "잘했습니다" 같은 모호한 표현은 피해주세요.
4. 강점과 개선점을 균형있게 제시해주세요.
5. 한국어로 응답해주세요.
6. ⚠️ 매우 중요: 분석 영역으로 지정된 모든 영역(${selectedAreasText || "전체"})에 대해 반드시 최소 1개 이상의 타임스탬프 피드백을 포함해야 합니다. 어떤 영역도 빠뜨리지 마세요. 각 영역에 대해 고르게 피드백을 분배해주세요.${showScoreWithFeedback ? `
7. ⚠️ 필수: "areaScores" 필드를 반드시 포함해주세요. 위 JSON 예시에 나열된 모든 분석 영역에 대해 100점 만점 기준의 점수를 빠짐없이 넣어주세요. areaScores를 누락하면 안 됩니다. 점수는 영상에서 관찰된 행동을 기반으로 엄격하게 평가해주세요.` : ''}${lessonPlanSection}${conditionsSection}${mathStandardsFile ? `

추가 분석 요청 - 수학 성취기준 기반 교수·학습 구성 피드백:
함께 제공된 "수학 성취기준" PDF를 참고하여, "교수·학습 구성" 영역에 대한 피드백을 제공할 때 다음을 반드시 포함해주세요:
1. 해당 학년(${grade})의 관련 성취기준을 참조하여 피드백하세요.
2. 성취기준 해설과 적용 시 고려사항을 반영하여 구체적인 개선점을 제시하세요.
3. **모든 피드백에는 반드시 근거로 사용한 성취기준 코드와 내용을 명시해주세요.**

⚠️ 중요 - 할루시네이션 방지 지침:
- 성취기준 코드는 반드시 제공된 PDF 문서에 실제로 존재하는 것만 인용하세요.
- PDF에서 직접 확인할 수 없는 성취기준 코드는 절대 만들어내지 마세요.
- 확실하지 않은 경우 구체적인 코드 대신 "해당 학년의 수와 연산 영역 성취기준에 따르면"과 같이 일반적으로 표현하세요.
- 성취기준 내용도 PDF에 기재된 원문 그대로 인용하세요.

예시: "성취기준 [4수와연-1-01]에 따르면 '다섯 자리 수의 덧셈과 뺄셈의 계산 원리를 이해하고 계산할 수 있다'가 목표입니다. 수업에서..."

응답 JSON의 "교수학습구성" 카테고리 피드백에서는 다음 형식을 사용해주세요:
"feedback": "[성취기준 코드] 성취기준 내용 - 구체적인 피드백 내용"

또한 summary.strengths와 summary.suggestions 중 교수·학습 구성 관련 항목에도 성취기준 근거를 포함해주세요.

추가로 응답 JSON에 다음 "curriculumAnalysis" 필드를 반드시 포함해주세요:
"curriculumAnalysis": {
  "overall": "성취기준 해설과 고려사항에 비추어 본 수업의 교육과정 정합성에 대한 종합 평가 (2-3문장)",
  "standardsAlignment": [
    "성취기준 반영 사항 1 (예: [4수와연-1-01] 성취기준이 수업의 00 활동에서 잘 반영됨) - PDF에서 확인된 성취기준만 인용",
    "성취기준 반영 사항 2"
  ],
  "considerations": [
    "고려사항 준수 여부 1 (예: 성취기준 해설의 '00 고려사항'이 수업에서 00하게 적용됨/미흡함)",
    "고려사항 준수 여부 2"
  ],
  "suggestions": [
    "교육과정 정합성 향상을 위한 제안 1",
    "교육과정 정합성 향상을 위한 제안 2"
  ]
}` : ''}`;

        // 멀티모달 분석 실행
        const contentParts = [
            {
                fileData: {
                    mimeType: file.mimeType,
                    fileUri: file.uri,
                },
            },
        ];

        // 지도안 파일이 있으면 추가
        if (lessonPlanFile) {
            contentParts.push({
                fileData: {
                    mimeType: lessonPlanFile.mimeType,
                    fileUri: lessonPlanFile.uri,
                },
            });
        }

        // 수학 성취기준 파일이 있으면 추가
        if (mathStandardsFile) {
            contentParts.push({
                fileData: {
                    mimeType: mathStandardsFile.mimeType,
                    fileUri: mathStandardsFile.uri,
                },
            });
        }

        contentParts.push({ text: prompt });

        const result = await model.generateContent(contentParts);

        const responseText = result.response.text();
        console.log("[분석 API] AI 분석 완료");

        // JSON 파싱 (코드 블록 제거)
        let analysisResult;
        try {
            const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) ||
                responseText.match(/```\s*([\s\S]*?)\s*```/);
            const jsonString = jsonMatch ? jsonMatch[1] : responseText;
            analysisResult = JSON.parse(jsonString.trim());
        } catch (parseError) {
            console.error("[분석 API] JSON 파싱 오류:", parseError);
            analysisResult = {
                timestamps: [
                    { time: "00:30", seconds: 30, category: "전달력", feedback: "수업 도입부에서 학습 목표를 명확하게 안내하고 있습니다." }
                ],
                summary: {
                    overall: "분석 결과를 파싱하는 데 문제가 발생했습니다. 다시 시도해주세요.",
                    strengths: ["분석 재시도 필요"],
                    suggestions: ["분석 재시도 필요"]
                }
            };
        }

        // Gemini에 업로드된 파일 삭제
        try {
            await fileManager.deleteFile(file.name);
            console.log("[분석 API] Gemini 영상 파일 삭제 완료");
        } catch (e) {
            console.warn("[분석 API] Gemini 영상 파일 삭제 실패:", e.message);
        }

        // 지도안 파일 삭제
        if (lessonPlanFile) {
            try {
                await fileManager.deleteFile(lessonPlanFile.name);
                console.log("[분석 API] Gemini 지도안 파일 삭제 완료");
            } catch (e) {
                console.warn("[분석 API] Gemini 지도안 파일 삭제 실패:", e.message);
            }
        }

        // 수학 성취기준 파일 삭제
        if (mathStandardsFile) {
            try {
                await fileManager.deleteFile(mathStandardsFile.name);
                console.log("[분석 API] Gemini 수학 성취기준 파일 삭제 완료");
            } catch (e) {
                console.warn("[분석 API] Gemini 수학 성취기준 파일 삭제 실패:", e.message);
            }
        }

        // Vercel Blob 파일 삭제
        try {
            await del(blobUrl);
            console.log("[분석 API] Blob 파일 삭제 완료");
        } catch (e) {
            console.warn("[분석 API] Blob 파일 삭제 실패:", e.message);
        }

        return Response.json(analysisResult);

    } catch (error) {
        console.error("[분석 API] 오류:", error);

        // 에러 시에도 Blob 정리 시도
        if (blobUrl) {
            try {
                await del(blobUrl);
            } catch (e) {
                console.warn("[분석 API] 에러 후 Blob 정리 실패:", e.message);
            }
        }

        return Response.json(
            { error: "영상 분석 중 오류가 발생했습니다: " + error.message },
            { status: 500 }
        );
    }
}
