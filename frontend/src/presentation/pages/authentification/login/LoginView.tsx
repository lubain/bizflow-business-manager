import { useState, useRef } from "react";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  TrendingUp,
  Users,
  Package,
  FileText,
} from "lucide-react";
import useLogin from "@/presentation/hooks/authentification/use-login";
import { useToast } from "@/presentation/hooks/use-toast";

const FEATURES = [
  {
    icon: FileText,
    label: "Facturation",
    desc: "Créez et suivez vos factures",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
  },
  {
    icon: Package,
    label: "Stock",
    desc: "Gérez votre inventaire",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    icon: Users,
    label: "Clients",
    desc: "Centralisez vos contacts",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
  {
    icon: TrendingUp,
    label: "Statistiques",
    desc: "Pilotez votre activité",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
];

export default function LoginView() {
  const [showPwd, setShowPwd] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const { login, loading } = useLogin();
  const toast = useToast();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = emailRef.current?.value.trim() ?? "";
    const password = passwordRef.current?.value.trim() ?? "";
    if (!email || !password) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    try {
      await login(email, password);
    } catch (err) {
      toast.error(err.message || "Email ou mot de passe incorrect");
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-950">
      {/* ── Left panel — branding ──────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between w-[480px] shrink-0 p-12 gradient-sidebar relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-violet-600/20 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="h-10 w-10 gradient-blue rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-base">G</span>
            </div>
            <span className="text-white font-bold text-xl">Gestion PME</span>
          </div>

          <h2 className="text-4xl font-black text-white leading-tight mb-4">
            Pilotez votre
            <br />
            <span className="text-blue-400">entreprise</span>
            <br />
            en toute clarté.
          </h2>
          <p className="text-slate-400 text-base leading-relaxed">
            Une plateforme tout-en-un pour la facturation,
            <br />
            la gestion de stock et le suivi financier.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-3">
          {FEATURES.map(({ icon: Icon, label, desc, color, bg }, i) => (
            <div
              key={label}
              style={{ animationDelay: `${i * 0.1}s` }}
              className="animate-fade-up p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/8 transition-colors"
            >
              <div
                className={`h-8 w-8 ${bg} rounded-lg flex items-center justify-center mb-2`}
              >
                <Icon size={16} className={color} />
              </div>
              <p className="text-white text-sm font-semibold">{label}</p>
              <p className="text-slate-400 text-xs mt-0.5">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel — form ────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white dark:bg-slate-900">
        <div className="w-full max-w-sm animate-fade-up">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="h-9 w-9 gradient-blue rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-sm">G</span>
            </div>
            <span className="text-slate-800 dark:text-white font-bold text-lg">
              Gestion PME
            </span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
              Bienvenue 👋
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Connectez-vous pour accéder à votre espace.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Email
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  ref={emailRef}
                  type="email"
                  required
                  placeholder="nom@entreprise.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm text-slate-800"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Mot de passe
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  ref={passwordRef}
                  type={showPwd ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm text-slate-800"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 gradient-blue text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 hover:opacity-90 active:scale-[.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Se connecter</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
