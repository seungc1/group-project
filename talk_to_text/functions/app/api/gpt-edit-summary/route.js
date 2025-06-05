// project-root/app/api/gpt-edit-summary/route.js

import { NextResponse } from "next/server";
import { editEntireReport_JSON } from "@/lib/gpt/reportManager";

export async function POST(request) {
  try {
    const { original, userRequest } = await request.json();

    // 필수 파라미터 검사
    if (!original || !userRequest) {
      return NextResponse.json(
        { error: "original(기존 보고서)과 userRequest(요청)는 필수입니다." },
        { status: 400 }
      );
    }

    // GPT(JSON) 방식으로 전체 보고서 편집
    const finalReport = await editEntireReport_JSON(original, userRequest);

    return NextResponse.json({ result: finalReport });
  } catch (err) {
    console.error("[/api/gpt-edit-summary] 에러:", err);
    return NextResponse.json(
      { error: err.message || "서버 에러가 발생했습니다." },
      { status: 500 }
    );
  }
}