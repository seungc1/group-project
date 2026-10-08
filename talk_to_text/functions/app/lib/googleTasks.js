// functions/app/lib/googleTasks.js

/**
 * Google Tasks API에 할 일 목록을 추가하는 함수
 * @param {string} accessToken - Google OAuth2 Access Token
 * @param {string[]} tasks - 등록할 명령형 문장 목록
 */
export async function addTasksToGoogleTasks(accessToken, tasks) {
  if (!accessToken || !Array.isArray(tasks)) {
    throw new Error('잘못된 파라미터: accessToken 또는 tasks');
  }

  const taskListUrl = 'https://tasks.googleapis.com/tasks/v1/users/@me/lists';

  try {
    // 1. 기본 tasklist ID 가져오기
    const listRes = await fetch(taskListUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!listRes.ok) {
      throw new Error('Tasklist 조회 실패');
    }

    const listData = await listRes.json();
    const defaultList = listData.items?.[0];

    if (!defaultList || !defaultList.id) {
      throw new Error('기본 Tasklist ID를 찾을 수 없음');
    }

    const taskListId = defaultList.id;

    // 2. 각 명령형 문장을 할 일로 추가
    for (const title of tasks) {
      await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
        }),
      });
    }
  } catch (err) {
    console.error('❌ Google Tasks 등록 중 오류:', err);
    throw err;
  }
}