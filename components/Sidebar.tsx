"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { RiDashboard2Line, RiFileList3Line, RiSettings3Line } from "react-icons/ri";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: <RiDashboard2Line size={20} /> },
  { href: "/logs", label: "Logs", icon: <RiFileList3Line size={20} /> },
  { href: "/settings", label: "Settings", icon: <RiSettings3Line size={20} /> },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="h-screen w-60 bg-indigo-700 text-indigo-50 flex flex-col">
      <div className="font-extrabold text-2xl tracking-tight px-6 py-5">
        Observability-CIG
      </div>
      <nav className="flex-1 px-2 space-y-1">
        {nav.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className={cn(
              "flex items-center gap-3 px-4 py-2 rounded-lg transition-colors",
              pathname?.startsWith(n.href)
                ? "bg-indigo-600"
                : "hover:bg-indigo-600/40"
            )}
          >
            {n.icon}
            <span>{n.label}</span>
          </Link>
        ))}
      </nav>
      <p className="px-4 py-3 text-xs opacity-70">© 2025 CIG Dash</p>
    </aside>
  );
}
