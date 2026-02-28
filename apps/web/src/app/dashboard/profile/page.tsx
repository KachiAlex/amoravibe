
import ProfilePanel from '../components/ProfilePanel';

export const dynamic = 'force-dynamic';

export default function ProfilePage() {
  return (
    <main className="flex-1 px-4 py-6 sm:px-8 lg:px-12 xl:px-16">
      <ProfilePanel />
    </main>
  );
}
