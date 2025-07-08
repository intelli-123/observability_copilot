"use client";
import React from "react";

interface ToolButtonProps {
  name: string;
  isActive: boolean;
  onClick: () => void;
}

const ToolButton: React.FC<ToolButtonProps> = ({ name, isActive, onClick }) => {
  return (
    <button
      onClick={isActive ? onClick : undefined}
      disabled={!isActive}
      className={`px-6 py-3 m-2 rounded-xl font-semibold text-sm transition-all shadow-md ${
        isActive
          ? "bg-blue-600 text-white hover:bg-blue-700 active:scale-95"
          : "bg-gray-200 text-gray-500 cursor-not-allowed"
      }`}
    >
      {name}
    </button>
  );
};

export default ToolButton;
