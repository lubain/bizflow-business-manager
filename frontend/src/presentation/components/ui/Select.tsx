import React, { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";
import { ChevronDown } from "lucide-react";

interface Option {
  value: string | number;
  label: string;
}
interface SelectProps extends Omit<ComponentProps<"select">, "onChange"> {
  options: Option[];
  placeholder?: string;
  label?: string;
  value?: string | number | null;
  onChange?: (v: any) => void;
  containerClassName?: string;
  error?: string;
}

export const Select: React.FC<SelectProps> = ({
  options,
  placeholder,
  label,
  value,
  onChange,
  className,
  containerClassName,
  error,
  ...props
}) => (
  <div className={twMerge("flex flex-col gap-1.5 w-full", containerClassName)}>
    {label && (
      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
        {label}
      </label>
    )}
    <div className="relative">
      <select
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
        className={twMerge(
          "w-full px-3 py-2.5 rounded-xl text-sm appearance-none pr-9 transition-all",
          "bg-white dark:bg-slate-700",
          "text-slate-800 dark:text-white",
          "border focus:outline-none focus:ring-2",
          error
            ? "border-red-400"
            : "border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 focus:ring-blue-500/30 focus:border-blue-500",
          className,
        )}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={16}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
      />
    </div>
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);
