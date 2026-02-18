(async () => {
  try {
    const payload = {
      legalName: 'Test',
      legalLastName: 'User',
      displayName: 'Tester',
      dateOfBirth: '1990-01-01',
      email: 'test+onboard@example.com',
      password: 'password123',
      gender: 'man',
      orientation: 'heterosexual',
      orientationPreferences: ['heterosexual'],
      discoverySpace: 'straight',
      matchPreferences: ['everyone'],
      city: 'Test City',
      cityLat: 1.23,
      cityLng: 4.56,
      bio: 'This is a short test bio that is long enough to pass validation.',
      photos: ['https://example.com/placeholder.jpg'],
      verificationIntent: 'skip',
    };

    const res = await fetch('https://amoravibe-identity.netlify.app/api/v1/onboarding', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    console.log('STATUS', res.status);
    console.log('BODY', await res.text());
  } catch (e) {
    console.error('ERR', e);
  }
})();
