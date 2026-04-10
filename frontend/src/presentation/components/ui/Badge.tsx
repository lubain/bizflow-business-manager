import React, { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

type BadgeProps = ComponentProps<"samp"> & {
  children: React.ReactNode;
  color?: string;
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  color = "blue",
  className,
  ...props
}) => {
  const colors = {
    blue: "bg-blue-100 text-blue-800",
    green: "bg-green-100 text-green-800",
    red: "bg-red-100 text-red-800",
    orange: "bg-orange-100 text-orange-800",
    gray: "bg-slate-100 text-slate-800",
  };
  return (
    <span
      className={twMerge(
        `px-2 py-0.5 rounded-full text-xs font-medium ${colors[color]}`,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
