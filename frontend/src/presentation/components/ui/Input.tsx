import React, { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

type InputProps = ComponentProps<"input"> & {
  label?: string;
};

export const Input: React.FC<InputProps> = ({ className, ...props }) => {
  const safeValue =
    props.value !== undefined && Number.isNaN(props.value) ? "" : props.value;

  return (
    <div className="flex flex-col gap-1 w-full">
      {props.label && (
        <label className="text-xs font-semibold text-slate-500 dark:text-white uppercase">
          {props.label}
        </label>
      )}
      <input
        {...props}
        value={safeValue}
        className={twMerge(
          "w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm",
          className
        )}
      />
    </div>
  );
};
