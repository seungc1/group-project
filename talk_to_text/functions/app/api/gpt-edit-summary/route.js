// 파일 위치: project-root/app/api/gpt-edit-summary/route.js

import { NextResponse } from "next/server";
import { requestReportEdit } from "@/lib/gpt/summaryEditor";

export async function POST(request) {
  try {
    const { original, userRequest } = await request.json();

    if (!original || !userRequest) {
      return NextResponse.json(
        { error: "original(기존 보고서)과 userRequest(요청)는 필수입니다." },
        { status: 400 }
      );
    }

    // 변경된 부분: editEntireReport 대신 requestReportEdit 호출
    const editedReport = await requestReportEdit(original, userRequest);

    return NextResponse.json({ result: editedReport });
  } catch (err) {
    console.error("[/api/gpt-edit-summary] 에러:", err);
    return NextResponse.json(
      { error: err.message || "서버 에러가 발생했습니다." },
      { status: 500 }
    );
  }
}