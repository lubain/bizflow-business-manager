import React, { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";
import { LucideIcon } from "lucide-react";

type InputProps = ComponentProps<"input"> & {
  label?: string;
  hint?: string;
  error?: string;
  icon?: LucideIcon;
  containerClassName?: string;
};

export const Input: React.FC<InputProps> = ({
  label,
  hint,
  error,
  icon: Icon,
  className,
  containerClassName,
  ...props
}) => {
  const safeValue =
    props.value !== undefined && Number.isNaN(props.value) ? "" : props.value;
  return (
    <div
      className={twMerge("flex flex-col gap-1.5 w-full", containerClassName)}
    >
      {label && (
        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
        )}
        <input
          {...props}
          value={safeValue}
          className={twMerge(
            "w-full px-3 py-2.5 rounded-xl text-sm transition-all",
            "bg-white dark:bg-slate-700",
            "text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500",
            "border focus:outline-none focus:ring-2",
            error
              ? "border-red-400 focus:ring-red-500/20 focus:border-red-500"
              : "border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 focus:ring-blue-500/30 focus:border-blue-500",
            Icon ? "pl-9" : "",
            className,
          )}
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
};
