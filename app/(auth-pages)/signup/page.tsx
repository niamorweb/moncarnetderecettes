"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { BookOpen, Mail, Lock, AlertCircle, Loader2 } from "lucide-react";

// Library imports pour les formulaires
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// 1. Définition du schéma de validation avec Zod
const signupSchema = z.object({
  email: z.string().email("Format d'email invalide"),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .regex(/[A-Z]/, "Doit contenir au moins une majuscule")
    .regex(/[0-9]/, "Doit contenir au moins un chiffre"),
});

// Extraction du type TypeScript à partir du schéma
type SignupFormValues = z.infer<typeof signupSchema>;

// Configuration Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function SignupPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();

  // 2. Initialisation de React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const onSubmit = async (values: SignupFormValues) => {
    setServerError(null);
    setLoading(true);

    try {
      const { data, error: signupError } = await supabase.auth.signUp({
        email: values.email.trim(),
        password: values.password,
      });

      if (signupError) throw signupError;

      if (data?.user) {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      setServerError(
        err.message || "Une erreur est survenue lors de l'inscription."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4 py-12">
      <div
        className={`w-full max-w-md transition-all duration-700 transform ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <Link
          href="/"
          className="flex items-center justify-center gap-2 mb-10 group"
        >
          <div className="bg-neutral-900 text-white p-2 rounded-xl group-hover:bg-orange-600 transition-colors">
            <BookOpen size={24} />
          </div>
          <span className="text-2xl font-black text-neutral-900 tracking-tight">
            MonCarnetDeRecettes
          </span>
        </Link>

        <div className="bg-white rounded-[2rem] shadow-xl shadow-neutral-200/50 border border-neutral-200 overflow-hidden">
          <div className="p-8 md:p-10">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-neutral-900 mb-2">
                Créer un compte
              </h2>
              <p className="text-neutral-500">
                Commencez votre collection culinaire dès aujourd'hui.
              </p>
            </div>

            {/* Note: on utilise le handleSubmit de react-hook-form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Server Error Alert */}
              {serverError && (
                <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm flex items-start gap-3 animate-shake">
                  <AlertCircle size={18} className="shrink-0" />
                  <span>{serverError}</span>
                </div>
              )}

              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-neutral-700 ml-1">
                  Email
                </label>
                <div className="relative">
                  <input
                    {...register("email")}
                    type="email"
                    placeholder="nom@exemple.com"
                    className={`w-full pl-11 pr-4 py-3.5 bg-neutral-50 border ${
                      errors.email
                        ? "border-red-500 ring-1 ring-red-500"
                        : "border-neutral-200"
                    } rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500 transition-all placeholder:text-neutral-400`}
                  />
                  <Mail
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                    size={18}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-500 ml-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-neutral-700 ml-1">
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    {...register("password")}
                    type="password"
                    placeholder="••••••••"
                    className={`w-full pl-11 pr-4 py-3.5 bg-neutral-50 border ${
                      errors.password
                        ? "border-red-500 ring-1 ring-red-500"
                        : "border-neutral-200"
                    } rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500 transition-all placeholder:text-neutral-400`}
                  />
                  <Lock
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                    size={18}
                  />
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500 ml-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-neutral-900 text-white font-bold rounded-2xl hover:bg-neutral-800 transition-all shadow-lg shadow-neutral-200 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  "Créer mon carnet"
                )}
              </button>
            </form>

            <div className="mt-10 pt-8 border-t border-neutral-100 text-center">
              <p className="text-neutral-500 text-sm mb-4">
                Vous avez déjà un compte ?
              </p>
              <Link
                href="/login"
                className="font-bold text-neutral-900 hover:text-orange-600 transition-colors"
              >
                Connectez-vous ici →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
