from pathlib import Path

target = Path(r'd:/amoravibe/apps/web/src/app/api/auth/signin/route.ts')
text = target.read_text()
block = "    response.cookies.set('auth-token', token, {\n      httpOnly: true,\n      secure: process.env.NODE_ENV === 'production',\n      sameSite: 'lax',\n      maxAge: 30 * 24 * 60 * 60, // 30 days\n      path: '/',\n    });\n"
if "lovedate_session" not in text:
    replacement = block + "\n    response.cookies.set('lovedate_session', JSON.stringify({ userId: user.id }), {\n      httpOnly: true,\n      secure: process.env.NODE_ENV === 'production',\n      sameSite: 'lax',\n      maxAge: 30 * 24 * 60 * 60, // 30 days\n      path: '/',\n    });\n"
    if block not in text:
        raise SystemExit('auth-token block not found')
    text = text.replace(block, replacement, 1)
    target.write_text(text)
else:
    print('lovedate_session already set; no changes made')
