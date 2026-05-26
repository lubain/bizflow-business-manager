import React, { ComponentProps } from "react";
import { LucideProps } from "lucide-react";
import { twMerge } from "tailwind-merge";

type Variant = "primary" | "secondary" | "danger" | "ghost" | "success";
type Size = "sm" | "md" | "lg";

type ButtonProps = ComponentProps<"button"> & {
  children?: React.ReactNode;
  icon?: React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
  iconRight?: React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
  loading?: boolean;
  variant?: Variant;
  size?: Size;
};

const variants: Record<Variant, string> = {
  primary:
    "bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-200 active:scale-95",
  secondary:
    "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm active:scale-95",
  danger:
    "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 active:scale-95",
  ghost:
    "text-slate-600 hover:bg-slate-100 hover:text-slate-800 active:scale-95",
  success:
    "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-200 active:scale-95",
};
const sizes: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs gap-1.5",
  md: "px-4 py-2 text-sm gap-2",
  lg: "px-6 py-3 text-base gap-2.5",
};

export const Button: React.FC<ButtonProps> = ({
  children,
  loading,
  variant = "primary",
  size = "md",
  className,
  icon: Icon,
  iconRight: IconRight,
  disabled,
  ...props
}) => (
  <button
    disabled={disabled || loading}
    className={twMerge(
      "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
      variants[variant],
      sizes[size],
      className,
    )}
    {...props}
  >
    {loading ? (
      <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
    ) : (
      <>
        {Icon && <Icon size={size === "sm" ? 14 : size === "lg" ? 20 : 16} />}
        {children}
        {IconRight && <IconRight size={16} className="ml-auto" />}
      </>
    )}
  </button>
);
