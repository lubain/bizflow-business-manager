import React, { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

type CardProps = ComponentProps<"div"> & {
  children: React.ReactNode;
  hover?: boolean;
};

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hover,
  ...props
}) => (
  <div
    className={twMerge(
      "bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm",
      hover &&
        "transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer",
      className,
    )}
    {...props}
  >
    {children}
  </div>
);
