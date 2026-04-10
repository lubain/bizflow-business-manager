import React, { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

interface SelectOption {
  value: string | number;
  label: string;
}
interface SelectProps extends Omit<ComponentProps<"select">, "onChange"> {
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  value?: string | number | null;
  onChange?: (value: any) => void;
  containerClassName?: string;
}

export const Select: React.FC<SelectProps> = ({
  options,
  placeholder,
  label,
  value,
  onChange,
  className,
  containerClassName,
  ...props
}) => (
  <div className={twMerge("flex flex-col gap-1 w-full", containerClassName)}>
    {label && (
      <label className="text-xs font-semibold text-slate-500 dark:text-white uppercase">
        {label}
      </label>
    )}
    <select
      value={value ?? ""}
      onChange={(e) => onChange?.(e.target.value)}
      className={twMerge(
        "w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-slate-700 dark:text-white",
        className
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
  </div>
);
