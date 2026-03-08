(async () => {
  try {
    const res = await fetch('http://localhost:4001/api/uploads/sign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folder: 'avatars' })
    });
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Error:', e);
  }
})();
