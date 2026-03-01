import { getServerSession } from "next-auth";
import { buildAuthOptions } from "../api/auth/[...nextauth]/route";
import Sidebar from "./components/Sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(await buildAuthOptions());
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-gray-900 to-black">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-rose-600">Session Not Found</h2>
          <p className="mb-6 text-gray-700">Your session has expired or you are not signed in.<br/>Please <a href="/?openSignIn=1" className="text-purple-600 underline">sign in</a> to access your dashboard.</p>
          <a href="/?openSignIn=1" className="inline-block bg-purple-600 text-white px-6 py-2 rounded-full font-semibold shadow hover:bg-purple-700 transition">Sign In</a>
        </div>
      </div>
    );
  }
  return (
    <div className="h-screen min-h-screen flex bg-gradient-to-br from-purple-900 via-gray-900 to-black">
      <Sidebar />
      <main className="flex-1 flex min-h-screen h-screen overflow-auto">
        {children}
      </main>
    </div>
  );
}
