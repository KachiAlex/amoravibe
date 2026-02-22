// Smoke test for match actions: GET matches, then POST like/unmatch/report
const fetch = globalThis.fetch || (url => import('node-fetch').then(m => m.default(url)));

async function main(){
  const base = process.env.API_BASE || 'http://localhost:3000/api';
  console.log('Querying', base + '/api/matches');
  const res = await fetch(base + '/api/matches');
  console.log('GET status', res.status);
  const json = await res.json();
  const matches = json.matches || [];
  console.log('matches found:', matches.length);
  if (matches.length === 0) process.exit(1);

  const id = matches[0].id;
  console.log('Testing actions for id', id);

  const actions = ['like','unmatch','report'];
  for (const a of actions){
    try{
      const r = await fetch(`${base}/api/matches/${encodeURIComponent(id)}/${a}`, { method: 'POST' });
      const body = await r.text();
      console.log(`${a} ->`, r.status, body.slice(0,200));
    }catch(e){
      console.error(`${a} error`, e.message || e);
    }
  }
}

main().catch(e=>{ console.error('SMOKE ERR', e); process.exit(1); });
