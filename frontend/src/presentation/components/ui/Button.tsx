import { User, LucideProps } from "lucide-react";
import React, { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

type ButtonProps = ComponentProps<"button"> & {
  children: React.ReactNode;
  icon?: React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
  loading?: boolean;
  variant?: "primary" | "secondary" | "danger" | "ghost";
};

export const Button: React.FC<ButtonProps> = ({
  onClick,
  children,
  loading,
  variant = "primary",
  className,
  icon: Icon,
  ...props
}) => {
  const baseStyle =
    "flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors text-sm";
  const variants = {
    primary:
      "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600/50 dark:hover:bg-blue-700/50",
    secondary:
      "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50",
    danger: "bg-red-50 text-red-600 hover:bg-red-100",
    ghost:
      "text-slate-600 hover:bg-slate-100 dark:text-white dark:hover:text-slate-800",
  };
  return (
    <button
      onClick={onClick}
      className={twMerge(
        `${baseStyle} ${variants[variant as keyof typeof variants]}`,
        className
      )}
      {...props}
    >
      {loading ? (
        <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
      ) : (
        <>
          {Icon && <Icon size={16} />}
          {children}
        </>
      )}
    </button>
  );
};
