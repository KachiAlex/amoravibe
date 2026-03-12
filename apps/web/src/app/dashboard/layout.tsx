import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import Sidebar from "./components/Sidebar";

async function getSession() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    if (!token) return null;
    const payload = await verifyToken(token);
    return payload;
  } catch (err) {
    return null;
  }
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-gray-900 to-black px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 text-center max-w-md w-full">
          <h2 className="text-xl md:text-2xl font-bold mb-4 text-rose-600">Session Not Found</h2>
          <p className="mb-6 text-sm md:text-base text-gray-700">Your session has expired or you are not signed in.<br/><a href="/?openSignIn=1" className="text-purple-600 underline">Sign in</a> to access your dashboard.</p>
          <a href="/?openSignIn=1" className="inline-block bg-purple-600 text-white px-6 py-3 md:py-2 rounded-full font-semibold shadow hover:bg-purple-700 transition min-h-12 min-w-12">Sign In</a>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-white via-gray-50 to-purple-50">
      {/* Sidebar - drawer on mobile, fixed on desktop */}
      <Sidebar />
      {/* Main content - full width on mobile, flex-1 on desktop */}
      <main className="flex-1 w-full md:min-h-screen overflow-auto">
        {children}
      </main>
    </div>
  );
}
