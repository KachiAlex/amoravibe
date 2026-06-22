"use client";
import React from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Home, Heart, Globe, Star, User } from "lucide-react";

type NavItem = {
  label: string;
  icon: React.ElementType;
  href: string | { pathname: string; query?: Record<string, string> };
  panel?: string;
};

const items: NavItem[] = [
  { label: "Home", icon: Home, href: "/dashboard" },
  { label: "Matches", icon: Heart, href: "/dashboard", panel: "matches" },
  { label: "Discover", icon: Globe, href: "/dashboard/discover" },
  { label: "Spaces", icon: Star, href: { pathname: "/dashboard", query: { panel: "spaces" } }, panel: "spaces" },
  { label: "Profile", icon: User, href: "/dashboard/profile" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const panelParam = searchParams?.get("panel")?.toLowerCase() ?? null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 flex justify-around items-center px-2 py-2">
      {items.map((item) => {
        const hrefPath = typeof item.href === "string" ? item.href : item.href.pathname;
        const matchesPanel = item.panel ? panelParam === item.panel : false;
        let matchesPath = false;
        if (typeof pathname === "string" && hrefPath) {
          if (hrefPath === "/dashboard") {
            matchesPath = pathname === "/dashboard" && !panelParam;
          } else {
            matchesPath = pathname === hrefPath || pathname.startsWith(hrefPath + "/");
          }
        }
        const isActive = item.panel ? matchesPanel : matchesPath;
        const Icon = item.icon;
        return (
          <Link
            key={item.label}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 p-2 rounded-xl transition ${
              isActive ? "text-fuchsia-500" : "text-gray-400 hover:text-gray-600"
            }`}
            aria-label={item.label}
          >
            <Icon
              className={`w-5 h-5 ${isActive && item.label === "Matches" ? "fill-fuchsia-500" : ""}`}
            />
          </Link>
        );
      })}
    </nav>
  );
}
