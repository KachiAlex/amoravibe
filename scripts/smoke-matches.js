// Simple node script to wait for dev server and exercise Matches API
const fetch = globalThis.fetch || (url => import('node-fetch').then(m => m.default(url)));

async function delay(ms){ return new Promise(r=>setTimeout(r,ms)); }

async function main(){
  for (let i=0;i<60;i++){
    try{
      const res = await fetch('http://localhost:4000/api/matches');
      if (res && res.ok){
        const data = await res.json();
        console.log('GET_OK', (data.matches || []).length);
        if (data.matches && data.matches.length>0){
          const id = data.matches[0].id;
          const likeRes = await fetch(`http://localhost:4000/api/matches/${id}/like`, { method: 'POST' });
          if (likeRes && likeRes.ok){
            const likeData = await likeRes.json();
            console.log('POST_OK', likeData.match?.id);
          } else {
            console.log('POST_FAIL', likeRes && likeRes.status);
          }
        } else {
          console.log('POST_SKIPPED_NO_MATCH');
        }
        return;
      }
    }catch(e){ /* ignore until server ready */ }
    await delay(1000);
  }
  console.error('PORT_TIMEOUT');
  process.exit(1);
}

main().catch(e=>{ console.error(e); process.exit(1); });
