import { useState, useRef } from "react";
import { ChevronRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import useLogin from "@/presentation/hooks/authentification/use-login";
import { useToast } from "@/presentation/hooks/use-toast";

const LoginView = () => {
  const [showPassword, setShowPassword] = useState(false);
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
      toast.success("Connexion réussie !");
    } catch (err) {
      toast.error(err.message || "Email ou mot de passe incorrect");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-900">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        <div className="bg-slate-800 p-8 text-center relative overflow-hidden">
          <div className="relative z-10">
            <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-lg">
              G
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Gestion PME
            </h2>
            <p className="text-slate-400 text-sm mt-2">
              Votre tableau de bord tout-en-un
            </p>
          </div>
        </div>

        <div className="p-8 pt-10">
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">
                Email professionnel
              </label>
              <div className="relative group">
                <input
                  ref={emailRef}
                  type="email"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-slate-50 focus:bg-white"
                  placeholder="nom@entreprise.com"
                />
                <Mail
                  className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors"
                  size={18}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">
                Mot de passe
              </label>
              <div className="relative group">
                <input
                  ref={passwordRef}
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-slate-50 focus:bg-white"
                  placeholder="••••••••"
                />
                <Lock
                  className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors"
                  size={18}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg flex justify-center items-center gap-2 mt-4 disabled:opacity-60"
            >
              {loading ? (
                <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <>
                  <span>Se connecter</span>
                  <ChevronRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
