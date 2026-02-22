// Simple check script to query matches API and log results
(async function(){
  try{
    const res = await fetch('http://localhost:4000/api/matches');
    console.log('GET /api/matches status:', res.status);
    const json = await res.json();
    console.log('matches length:', (json.matches || []).length);
    if ((json.matches||[]).length>0){
      const id = json.matches[0].id;
      const like = await fetch(`http://localhost:4000/api/matches/${id}/like`, { method: 'POST' });
      console.log('POST like status:', like.status);
      const likeJson = await like.json();
      console.log('POST result id:', likeJson.match?.id);
    }
  }catch(e){
    console.error('ERROR', e.message || e);
    process.exit(1);
  }
})();
