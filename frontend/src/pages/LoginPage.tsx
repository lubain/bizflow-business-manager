import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { TrendingUp, Eye, EyeOff, Mail, Lock } from "lucide-react";
import { toast } from "react-hot-toast";
import { apiPost } from "@/utils/apiClient";
import { AuthTokens } from "@/types";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/utils/helpers";

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Mot de passe trop court"),
});
type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const mutation = useMutation({
    mutationFn: (data: LoginForm) => apiPost<AuthTokens>("/auth/login", data),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken);
      toast.success(`Bienvenue, ${data.user.firstName} !`);
      navigate("/dashboard");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message ?? "Identifiants incorrects");
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-600 mb-3">
            <TrendingUp size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">BizFlow</h1>
          <p className="text-gray-500 text-sm mt-1">
            Gérez votre entreprise simplement
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-card p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Connexion
          </h2>

          <form
            onSubmit={handleSubmit((d) => mutation.mutate(d))}
            className="space-y-4"
          >
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="vous@exemple.fr"
                  {...register("email")}
                  className={cn(
                    "w-full pl-9 pr-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow",
                    errors.email
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200",
                  )}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Mot de passe
              </label>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  {...register("password")}
                  className={cn(
                    "w-full pl-9 pr-10 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow",
                    errors.password
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200",
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors mt-2"
            >
              {mutation.isPending ? "Connexion…" : "Se connecter"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Pas encore de compte ?{" "}
            <Link
              to="/register"
              className="text-brand-600 hover:text-brand-700 font-medium"
            >
              Créer un compte
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          © {new Date().getFullYear()} BizFlow — Tous droits réservés
        </p>
      </div>
    </div>
  );
}
