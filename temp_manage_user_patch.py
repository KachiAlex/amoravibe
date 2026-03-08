from pathlib import Path

path = Path(r"d:/amoravibe/apps/web/src/app/admin/users/page.tsx")
text = path.read_text()

old_import = "import { queryAdminUsers } from '@/lib/admin-users';\n"
new_import = old_import + "import ManageUserButton from './ManageUserButton';\n"

if "import ManageUserButton from './ManageUserButton';" not in text:
    if old_import not in text:
        raise SystemExit('Existing import block not found')
    text = text.replace(old_import, new_import, 1)

old_block = """                <td className=\"px-6 py-4 text-right\">\n                  <button className=\"rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white hover:bg-white/10\">\n                    Manage\n                  </button>\n                </td"""
new_block = """                <td className=\"px-6 py-4 text-right\">\n                  <ManageUserButton\n                    userId={user.id}\n                    email={user.email}\n                    displayName={user.displayName ?? user.email}\n                    initialRole={(user.role as 'admin' | 'user') ?? 'user'}\n                    initialBanned={user.banned}\n                  />\n                </td"""

if "<ManageUserButton" not in text:
    if old_block not in text:
        raise SystemExit('Existing action cell not found')
    text = text.replace(old_block, new_block, 1)

path.write_text(text)
print('Patched admin users table with ManageUserButton integration.')
