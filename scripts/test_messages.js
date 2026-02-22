(async () => {
  const base = 'http://localhost:4000';
  const log = (t, v) => console.log('---', t, '---', typeof v === 'object' ? JSON.stringify(v, null, 2) : v);

  try {
    const dash = await fetch(`${base}/dashboard`);
    log('GET /dashboard status', dash.status);

    const loginResp = await fetch(`${base}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'agent_node' }),
    });
    const loginText = await loginResp.text();
    log('POST /api/login status', loginResp.status);
    log('POST /api/login body', loginText);

    const setCookie = loginResp.headers.get('set-cookie');
    log('set-cookie header (raw)', setCookie);

    // collect all set-cookie headers
    const rawSetCookies = [];
    for (const [k, v] of loginResp.headers.entries()) {
      if (k.toLowerCase() === 'set-cookie') rawSetCookies.push(v);
    }

    // fallback: some runtimes return only the first set-cookie in get('set-cookie')
    if (rawSetCookies.length === 0 && setCookie) rawSetCookies.push(setCookie);

    const cookies = rawSetCookies.map(s => s.split(';')[0]).join('; ');
    log('Cookie header to send', cookies || '(none)');

    const getMsg = await fetch(`${base}/api/messages`, { headers: { Cookie: cookies } });
    const getJson = await getMsg.text();
    log('GET /api/messages status', getMsg.status);
    log('GET /api/messages body', getJson);

    const postMsg = await fetch(`${base}/api/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: cookies },
      body: JSON.stringify({ text: 'hello from node script' }),
    });
    const postText = await postMsg.text();
    log('POST /api/messages status', postMsg.status);
    log('POST /api/messages body', postText);
  } catch (e) {
    console.error('Error running checks', e);
    process.exitCode = 2;
  }
})();
