import { handleUpload } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

// 클라이언트 직접 업로드를 위한 핸들러
export async function POST(request) {
    const body = await request.json();

    try {
        const jsonResponse = await handleUpload({
            body,
            request,
            onBeforeGenerateToken: async (pathname) => {
                // 여기서 인증 검사를 할 수 있음
                console.log('[Blob] 업로드 토큰 생성:', pathname);

                return {
                    allowedContentTypes: ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/mpeg', 'application/pdf'],
                    maximumSizeInBytes: 500 * 1024 * 1024, // 500MB
                    addRandomSuffix: true, // 고유한 파일명 생성으로 중복 방지
                };
            },
            onUploadCompleted: async ({ blob, tokenPayload }) => {
                console.log('[Blob] 업로드 완료:', blob.url);
                // 여기서 DB에 저장 등 후처리 가능
            },
        });

        return NextResponse.json(jsonResponse);
    } catch (error) {
        console.error('[Blob] 업로드 오류:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 400 }
        );
    }
}
