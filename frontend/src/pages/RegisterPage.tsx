import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import {
  TrendingUp,
  Eye,
  EyeOff,
  User,
  Building2,
  Mail,
  Lock,
  CheckCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { apiPost } from "@/utils/apiClient";
import { AuthTokens } from "@/types";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/utils/helpers";

// ─── Schema de validation ──────────────────────
const registerSchema = z
  .object({
    firstName: z.string().min(1, "Prénom requis"),
    lastName: z.string().min(1, "Nom requis"),
    email: z.string().email("Email invalide"),
    companyName: z.string().min(1, "Nom de société requis"),
    password: z
      .string()
      .min(8, "Minimum 8 caractères")
      .regex(/[A-Z]/, "Au moins une majuscule")
      .regex(/[0-9]/, "Au moins un chiffre"),
    confirmPassword: z.string().min(1, "Confirmez le mot de passe"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

// ─── Indicateur de force du mot de passe ──────
function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8 caractères minimum", ok: password.length >= 8 },
    { label: "Une majuscule", ok: /[A-Z]/.test(password) },
    { label: "Un chiffre", ok: /[0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.ok).length;
  const colors = [
    "bg-red-400",
    "bg-orange-400",
    "bg-yellow-400",
    "bg-green-500",
  ];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors duration-300",
              i < score ? colors[score] : "bg-gray-200",
            )}
          />
        ))}
      </div>
      <div className="space-y-1">
        {checks.map(({ label, ok }) => (
          <div key={label} className="flex items-center gap-1.5">
            <CheckCircle
              size={11}
              className={cn(
                "transition-colors",
                ok ? "text-green-500" : "text-gray-300",
              )}
            />
            <span
              className={cn("text-xs", ok ? "text-gray-600" : "text-gray-400")}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Input avec icône ─────────────────────────
function FormField({
  label,
  icon: Icon,
  error,
  type = "text",
  placeholder,
  registration,
  children,
}: {
  label: string;
  icon: React.ElementType;
  error?: string;
  type?: string;
  placeholder?: string;
  registration?: any;
  children?: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <Icon
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        {children ?? (
          <input
            type={type}
            placeholder={placeholder}
            {...registration}
            className={cn(
              "w-full pl-9 pr-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow",
              error ? "border-red-300 bg-red-50" : "border-gray-200",
            )}
          />
        )}
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

// ─── Page principale ──────────────────────────
export default function RegisterPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch("password", "");

  const mutation = useMutation({
    mutationFn: (data: RegisterForm) =>
      apiPost<AuthTokens>("/auth/register", {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        companyName: data.companyName,
      }),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken);
      toast.success(
        `Bienvenue, ${data.user.firstName} ! Votre compte a été créé.`,
      );
      navigate("/dashboard");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message;
      if (typeof msg === "string" && msg.includes("déjà")) {
        toast.error("Cet email est déjà utilisé.");
      } else {
        toast.error(msg ?? "Erreur lors de la création du compte");
      }
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-600 mb-3">
            <TrendingUp size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">BizFlow</h1>
          <p className="text-gray-500 text-sm mt-1">
            Créez votre compte gratuitement
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-card p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Créer un compte
          </h2>

          <form
            onSubmit={handleSubmit((d) => mutation.mutate(d))}
            className="space-y-4"
          >
            {/* Prénom + Nom */}
            <div className="grid grid-cols-2 gap-3">
              <FormField
                label="Prénom"
                icon={User}
                error={errors.firstName?.message}
                placeholder="Jean"
                registration={register("firstName")}
              />
              <FormField
                label="Nom"
                icon={User}
                error={errors.lastName?.message}
                placeholder="Dupont"
                registration={register("lastName")}
              />
            </div>

            {/* Société */}
            <FormField
              label="Nom de la société"
              icon={Building2}
              error={errors.companyName?.message}
              placeholder="Ma Société SARL"
              registration={register("companyName")}
            />

            {/* Email */}
            <FormField
              label="Email"
              icon={Mail}
              type="email"
              error={errors.email?.message}
              placeholder="jean.dupont@masociete.fr"
              registration={register("email")}
            />

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
                  autoComplete="new-password"
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
              <PasswordStrength password={password} />
            </div>

            {/* Confirmer mot de passe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  {...register("confirmPassword")}
                  className={cn(
                    "w-full pl-9 pr-10 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow",
                    errors.confirmPassword
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200",
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors mt-2"
            >
              {mutation.isPending ? "Création en cours…" : "Créer mon compte"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Déjà un compte ?{" "}
            <Link
              to="/login"
              className="text-brand-600 hover:text-brand-700 font-medium"
            >
              Se connecter
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
