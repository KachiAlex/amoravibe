/*
 Node auth test: fetch CSRF, signup, signin (credentials), verify /api/profile
 Usage: node tmp/auth_test.js
*/

const base = 'http://localhost:4000';
let cookieJar = {}; // name -> value

function updateCookies(setCookieHeaders) {
  if (!setCookieHeaders) return;
  const arr = Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders];
  for (const header of arr) {
    const parts = header.split(';')[0].split('=');
    const name = parts.shift().trim();
    const value = parts.join('=');
    cookieJar[name] = value;
  }
}

function cookieHeader() {
  return Object.entries(cookieJar).map(([k, v]) => `${k}=${v}`).join('; ');
}

async function req(path, opts = {}){
  opts.headers = opts.headers || {};
  const cookie = cookieHeader();
  if (cookie) opts.headers['cookie'] = cookie;
  const res = await fetch(base + path, opts);
  const setCookie = res.headers.get('set-cookie');
  // node fetch returns single header string for set-cookie only if present; use raw if available
  if (res.headers.raw) {
    const raw = res.headers.raw();
    if (raw && raw['set-cookie']) updateCookies(raw['set-cookie']);
  } else if (setCookie) updateCookies(setCookie);
  const text = await res.text();
  let body = null;
  try { body = JSON.parse(text); } catch(e) { body = text; }
  return { res, body };
}

(async function main(){
  try {
    console.log('Fetching CSRF token...');
    const { res:csrfRes, body:csrfBody } = await req('/api/auth/csrf', { method: 'GET' });
    if (csrfRes.status !== 200) {
      console.error('CSRF fetch failed', csrfRes.status, csrfBody);
      process.exit(1);
    }
    const csrfToken = csrfBody.csrfToken;
    console.log('CSRF:', csrfToken);

    // Signup (may return 409 if exists)
    const email = 'tester+bot+2026@example.com';
    const password = 'TestPass123!';
    console.log('Attempting signup...');
    const { res:signupRes, body:signupBody } = await req('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    console.log('Signup status:', signupRes.status);
    console.log('Signup body:', signupBody);

    // Warm up server and allow any pending compilation to finish
    console.log('Warming up server (GET /) and waiting briefly...');
    try { await req('/'); } catch (e) { /* ignore */ }
    await new Promise(s => setTimeout(s, 1500));

    // Sign in via credentials callback (form urlencoded) with retries for transient failures
    console.log('Signing in via credentials callback...');
    const form = new URLSearchParams();
    form.set('csrfToken', csrfToken);
    form.set('email', email);
    form.set('password', password);
    let signinRes = null;
    let signinBody = null;
    const maxRetries = 6;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const r = await req('/api/auth/callback/credentials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: form.toString(),
          redirect: 'follow'
        });
        signinRes = r.res; signinBody = r.body;
        console.log(`Signin attempt ${attempt} status:`, signinRes.status);
        break;
      } catch (err) {
        console.warn(`Signin attempt ${attempt} failed: ${err.message}`);
        if (attempt === maxRetries) throw err;
        await new Promise(s => setTimeout(s, 1000 * attempt));
      }
    }

    // Verify profile
    console.log('Fetching /api/profile...');
    const { res:profileRes, body:profileBody } = await req('/api/profile', { method: 'GET' });
    console.log('Profile status:', profileRes.status);
    console.log('Profile body:', profileBody);

    if (profileRes.status === 200) {
      console.log('Auth flow appears to work.');
      process.exit(0);
    } else {
      console.error('Profile fetch failed', profileRes.status, profileBody);
      process.exit(2);
    }
  } catch (err) {
    console.error('Error during auth test:', err);
    process.exit(3);
  }
})();
