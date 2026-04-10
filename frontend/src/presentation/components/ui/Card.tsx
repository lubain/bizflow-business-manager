import React, { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

type CardProps = ComponentProps<"div"> & {
  children: React.ReactNode;
};

export const Card: React.FC<CardProps> = ({
  children,
  className,
  ...props
}) => (
  <div
    className={twMerge(
      "dark:bg-transparent rounded-lg shadow-sm border border-slate-200",
      className
    )}
    {...props}
  >
    {children}
  </div>
);
