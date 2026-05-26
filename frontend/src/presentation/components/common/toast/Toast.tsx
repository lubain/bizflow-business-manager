import { useToastStore } from "@/presentation/hooks/use-toast";
import {
  X,
  CheckCircle2,
  AlertCircle,
  Info,
  AlertTriangle,
} from "lucide-react";

const cfg = {
  success: {
    icon: CheckCircle2,
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-800",
    icon_color: "text-emerald-500",
    bar: "bg-emerald-400",
  },
  error: {
    icon: AlertCircle,
    bg: "bg-rose-50",
    border: "border-rose-200",
    text: "text-rose-800",
    icon_color: "text-rose-500",
    bar: "bg-rose-400",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-800",
    icon_color: "text-amber-500",
    bar: "bg-amber-400",
  },
  info: {
    icon: Info,
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-800",
    icon_color: "text-blue-500",
    bar: "bg-blue-400",
  },
};

export default function ToastContainer() {
  const { toasts, remove } = useToastStore();
  if (!toasts.length) return null;
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]">
      {toasts.map((t) => {
        const c = cfg[t.type];
        const Icon = c.icon;
        return (
          <div
            key={t.id}
            className={`flex items-start gap-3 ${c.bg} border ${c.border} rounded-2xl shadow-lg p-4 animate-slide-right overflow-hidden relative`}
          >
            <div
              className={`absolute bottom-0 left-0 h-0.5 w-full ${c.bar} opacity-40`}
            />
            <Icon size={18} className={`${c.icon_color} shrink-0 mt-0.5`} />
            <p className={`flex-1 text-sm font-medium ${c.text}`}>
              {t.message}
            </p>
            <button
              onClick={() => remove(t.id)}
              className={`${c.icon_color} opacity-60 hover:opacity-100 transition-opacity shrink-0`}
            >
              <X size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
