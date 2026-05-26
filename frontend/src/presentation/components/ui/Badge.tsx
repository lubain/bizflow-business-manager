import React from "react";
import { twMerge } from "tailwind-merge";

type Color =
  | "blue"
  | "green"
  | "red"
  | "yellow"
  | "purple"
  | "slate"
  | "orange";
interface BadgeProps {
  label: string;
  color?: Color;
  dot?: boolean;
  className?: string;
}

const colors: Record<Color, string> = {
  blue: "bg-blue-50 text-blue-700 ring-blue-600/20",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  red: "bg-red-50 text-red-700 ring-red-600/20",
  yellow: "bg-amber-50 text-amber-700 ring-amber-600/20",
  purple: "bg-purple-50 text-purple-700 ring-purple-600/20",
  slate: "bg-slate-100 text-slate-600 ring-slate-500/20",
  orange: "bg-orange-50 text-orange-700 ring-orange-600/20",
};
const dots: Record<Color, string> = {
  blue: "bg-blue-500",
  green: "bg-emerald-500",
  red: "bg-red-500",
  yellow: "bg-amber-500",
  purple: "bg-purple-500",
  slate: "bg-slate-400",
  orange: "bg-orange-500",
};

export const Badge: React.FC<BadgeProps> = ({
  label,
  color = "slate",
  dot,
  className,
}) => (
  <span
    className={twMerge(
      "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset",
      colors[color],
      className,
    )}
  >
    {dot && (
      <span
        className={twMerge("h-1.5 w-1.5 rounded-full shrink-0", dots[color])}
      />
    )}
    {label}
  </span>
);
