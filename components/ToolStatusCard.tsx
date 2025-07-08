"use client";

import React from "react";
import type { ReactElement } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { SiDatadog, SiDynatrace } from "react-icons/si";
import { FaTools } from "react-icons/fa";
import { SiAmazon, SiGooglecloud } from "react-icons/si";

interface ToolStatusCardProps {
  name: string;
  active: boolean;
}

const iconMap: Record<string, ReactElement> =  {
  Datadog: <SiDatadog size={36} />,
  Dynatrace: <SiDynatrace size={36} />,
  Sysdig: <FaTools size={36} />,
  AWS: <SiAmazon size={36} />,
  GCP: <SiGooglecloud size={36} />,
};

export default function ToolStatusCard({ name, active }: ToolStatusCardProps) {
  return (
    <Card
  className={`p-5 rounded-2xl shadow-sm border transition-transform transform hover:scale-[1.02] ${
    active ? "bg-white border-green-400" : "bg-white border-gray-300"
  }`}
>
  <CardContent className="flex items-center gap-4">
    <div className="text-indigo-600">{iconMap[name]}</div>
    <div>
      <p className="text-lg font-semibold">{name}</p>
      <p className={`text-sm ${active ? "text-green-600" : "text-gray-500"}`}>
        {active ? "Connected" : "Disconnected"}
      </p>
    </div>
  </CardContent>
</Card>

  );
}
