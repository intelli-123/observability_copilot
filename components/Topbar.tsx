"use client";
import React from "react";
import { usePathname } from "next/navigation";

export default function Topbar() {
  const pathname = usePathname();
  const titleMap: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/logs": "Logs",
    "/settings": "Settings",
  };

  const title = pathname && titleMap[pathname] ? titleMap[pathname] : "Observability-CIG";

  return (
    <header className="h-14 flex items-center px-6 border-b bg-white/60 backdrop-blur">
      <h2 className="text-xl font-bold text-indigo-900">{title}</h2>
    </header>
  );
}
