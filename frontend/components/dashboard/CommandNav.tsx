"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function CommandNav() {
  const pathname = usePathname();

  const NAV_ITEMS = [
    { name: "Dashboard", path: "/dashboard", icon: "M4 4h6v6H4zm10 0h6v6h-6zM4 14h6v6H4zm10 0h6v6h-6z" },
    { name: "Map Center", path: "/dashboard/map", icon: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" },
    { name: "Fleet Ops", path: "/dashboard/fleet", icon: "M20 21c-1.39 0-2.78-.47-4-1.32-2.44 1.71-5.56 1.71-8 0C6.78 20.53 5.39 21 4 21H2v2h2c1.38 0 2.74-.35 4-.99 2.52 1.29 5.48 1.29 8 0 1.26.65 2.62.99 4 .99h2v-2h-2zM3.95 19H4c1.6 0 3.02-.88 4-2 .98 1.12 2.4 2 4 2s3.02-.88 4-2c.98 1.12 2.4 2 4 2h.05l1.89-6.68c.08-.26.06-.54-.06-.78s-.34-.42-.6-.5L20 10.62V6c0-1.1-.9-2-2-2h-3V1H9v3H6c-1.1 0-2 .9-2 2v4.62l-1.29.42c-.26.08-.48.26-.6.5s-.15.52-.06.78L3.95 19z" },
    { name: "Anomaly Alerts", path: "/dashboard/alerts", icon: "M12 2L1 21h22M12 6l7.53 13H4.47M11 10v4h2v-4m-2 6v2h2v-2" },
    { name: "Hotspot Detection", path: "/dashboard/hotspots", icon: "M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8zm0 18c-3.35 0-6-2.57-6-6.2 0-2.34 1.95-5.44 6-9.14 4.05 3.7 6 6.79 6 9.14 0 3.63-2.65 6.2-6 6.2zm-1-10h2v5h-2zm0 6h2v2h-2z" },
    { name: "Depth Analysis", path: "/dashboard/depth", icon: "M3 13h2v-2H3v2zm0 4h2v-2H3v2zm2 4v-2H3v2h2zM3 9h2V7H3v2zm12 12h2v-2h-2v2zm4-18H9a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7l-4-4zm-1 16H9V5h7v5h5v10z" },
    { name: "Risk Intelligence", path: "/dashboard/risk", icon: "M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" },
    { name: "Cleanup Priority", path: "/dashboard/cleanup", icon: "M15 11V3H9v8H4.16l7.74 7.74 1.15 1.15 1.15-1.15L21.94 11H15zM12 17.15L6.99 12.14h4.01V5h2v7.14h4.01L12 17.15z" },
    { name: "Route Planning", path: "/dashboard/route", icon: "M19 15l-6 6-1.42-1.42L15.17 16H4V4h2v10h9.17l-3.59-3.58L13 9l6 6z" },
    { name: "Survey Analytics", path: "/dashboard/analytics", icon: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" },
    { name: "Survey Comparison", path: "/dashboard/comparison", icon: "M10 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h5v2h2V1h-2v2zm0 15H5l5-6v6zm9-15h-5v2h5v14h-5v2h5c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 9l5 6h-5v-6z" },
    { name: "Reports", path: "/dashboard/reports", icon: "M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" },
  ];

  return (
    <nav className="w-16 h-full flex flex-col items-center py-4 bg-[#0c0c0e] border-r border-zinc-800/80 z-20 flex-shrink-0">
      <Link href="/" className="mb-8 flex items-center justify-center">
        <div className="w-8 h-8 rounded-lg border border-zinc-700 bg-zinc-900 flex items-center justify-center shadow-sm">
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-100 shadow-sm" />
        </div>
      </Link>

      <div className="flex flex-col gap-1.5 w-full px-2 overflow-y-auto hide-scrollbar">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.path || (item.path !== "/dashboard" && pathname?.startsWith(item.path));
          return (
            <Link
              href={item.path}
              key={item.path}
              title={item.name}
              className={`w-full aspect-square rounded-lg flex items-center justify-center transition-all duration-150 ${
                isActive
                  ? "bg-zinc-800 text-zinc-100 border border-zinc-700 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/60 border border-transparent"
              }`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d={item.icon} />
              </svg>
            </Link>
          );
        })}
      </div>

      <div className="mt-auto flex flex-col gap-2 w-full px-2 pt-4 border-t border-zinc-800/60">
        <button className="w-full aspect-square rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/60 transition-all">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z" />
          </svg>
        </button>
      </div>
    </nav>
  );
}
