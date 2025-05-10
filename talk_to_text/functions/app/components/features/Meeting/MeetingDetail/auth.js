export async function initGapiAuth() {
  const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const loadScripts = () => {
    return Promise.all([
      new Promise((resolve, reject) => {
        const gapiScript = document.createElement('script');
        gapiScript.src = 'https://apis.google.com/js/api.js';
        gapiScript.onload = resolve;
        gapiScript.onerror = reject;
        document.head.appendChild(gapiScript);
      }),
      new Promise((resolve, reject) => {
        const gisScript = document.createElement('script');
        gisScript.src = 'https://accounts.google.com/gsi/client';
        gisScript.onload = resolve;
        gisScript.onerror = reject;
        document.head.appendChild(gisScript);
      })
    ]);
  };

  await loadScripts();

  // gapi client 초기화
  await new Promise((resolve, reject) => {
    gapi.load('client', async () => {
      try {
        await gapi.client.init({
          discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest'],
        });
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  });

  // ✅ 더 넓은 권한 스코프 요청 (compose, modify 포함)
  return new Promise((resolve, reject) => {
    const tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: 'https://www.googleapis.com/auth/gmail.compose https://www.googleapis.com/auth/gmail.modify',
      callback: (response) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          gapi.client.setToken({ access_token: response.access_token });
          resolve(response.access_token);
        }
      }
    });

    tokenClient.requestAccessToken(); // ✅ Gmail 접근 동의 팝업
  });
}
