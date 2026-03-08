(async () => {
  try {
    const res = await fetch('http://localhost:5001/api/uploads/sign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folder: 'avatars' })
    });
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Response text:', text);
  } catch (e) {
    console.error('Error:', e);
  }
})();
