"use client";

import React, { useState, FormEvent } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  Lock,
  ExternalLink,
  Mail,
  Key,
  Cookie,
  Loader2,
  CheckCircle2,
  ChevronLeft,
  Check,
  Copy,
} from "lucide-react";
import { User } from "@supabase/supabase-js";
import Button from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface ProfileClientProps {
  user: User;
  initialData: {
    username: string;
    public_name: string;
  };
}

const inputClass =
  "w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-200 placeholder:text-gray-400";
const buttonClass =
  "px-6 py-3 text-sm font-bold rounded-xl transition duration-150 shadow-md active:scale-95 flex items-center justify-center gap-2";

export default function ProfileClient({
  user,
  initialData,
}: ProfileClientProps) {
  const supabase = createClient();

  const router = useRouter();
  // Profil
  const [username, setUsername] = useState(initialData.username);
  const [publicName, setPublicName] = useState(initialData.public_name);
  const [loading, setLoading] = useState(false);
  const [profileStatus, setProfileStatus] = useState<{
    type: "error" | "success";
    msg: string;
  } | null>(null);

  // Password
  const [newPassword, setNewPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState<{
    type: "error" | "success";
    msg: string;
  } | null>(null);
  // À l'intérieur de ProfileClient
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    const url = `https://moncarnetderecettes.vercel.app/public-profile/${username}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset après 2s
    } catch (err) {
      console.error("Erreur lors de la copie", err);
    }
  };

  const handleProfileUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setProfileStatus(null);

    const { error } = await supabase
      .from("profiles")
      .update({
        username: username.trim(),
        public_name: publicName.trim(),
      })
      .eq("id", user.id);

    setLoading(false);

    if (error) {
      const msg =
        error.code === "23505"
          ? "Ce nom d'utilisateur est déjà pris."
          : error.message;
      setProfileStatus({ type: "error", msg });
    } else {
      setProfileStatus({ type: "success", msg: "Profil public mis à jour !" });
    }
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPasswordStatus({ type: "error", msg: "Minimum 6 caractères." });
      return;
    }

    setLoading(true);
    setPasswordStatus(null);

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    setLoading(false);

    if (error) {
      setPasswordStatus({ type: "error", msg: error.message });
    } else {
      setPasswordStatus({ type: "success", msg: "Mot de passe mis à jour !" });
      setNewPassword("");
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="p-6 md:p-12 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 justify-between">
          <Button href="/dashboard" variant="ghost">
            <ChevronLeft size={14} />
            Retour aux recettes
          </Button>
          <Button
            className="bg-red-50 hover:bg-red-100 border-red-300 border !text-red-600"
            onClick={() => handleSignOut()}
          >
            Me déconnecter
          </Button>
        </div>

        <h1 className="text-4xl mt-6 font-black mb-10 text-neutral-900 tracking-tight">
          Mon Compte
        </h1>

        {/* SECTION 1: PROFIL PUBLIC */}
        <div className="bg-white border border-neutral-200 p-8 rounded-[2.5rem] shadow-xl mb-8">
          <h2 className="text-xl font-black pb-4 mb-8 text-neutral-900 flex items-center gap-3 border-b border-neutral-100">
            <div className="p-2 bg-orange-100 rounded-lg">
              <ExternalLink className="size-5 text-orange-600" />
            </div>
            Informations Publiques
          </h2>

          {profileStatus && (
            <div
              className={`p-4 rounded-2xl mb-6 font-bold flex items-center gap-2 ${
                profileStatus.type === "success"
                  ? "bg-green-50 border border-green-200 text-green-700"
                  : "bg-red-50 border border-red-200 text-red-600"
              }`}
            >
              {profileStatus.type === "success" && <CheckCircle2 size={18} />}
              {profileStatus.msg}
            </div>
          )}

          <form onSubmit={handleProfileUpdate} className="space-y-8">
            <div className="space-y-3">
              <label className="block text-xs font-black uppercase tracking-widest text-neutral-400 ml-1">
                Nom public d'affichage
              </label>
              <input
                type="text"
                value={publicName}
                onChange={(e) => setPublicName(e.target.value)}
                placeholder="John Doe"
                className={inputClass}
                required
              />
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-black uppercase tracking-widest text-neutral-400 ml-1">
                Identifiant de profil (URL)
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) =>
                  setUsername(
                    e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "")
                  )
                }
                placeholder="mon_carnet"
                className={inputClass}
                required
              />

              {/* BLOC URL + BOUTON COPIER */}
              <div className="group relative p-4 bg-neutral-50 rounded-2xl border border-neutral-100 flex items-center justify-between gap-4 overflow-hidden transition-colors hover:border-orange-200">
                <div className="min-w-0">
                  <p className="text-[10px] font-black text-neutral-400 uppercase mb-1">
                    Votre lien public :
                  </p>
                  <p className="text-sm font-bold text-orange-600 truncate">
                    https://moncarnetderecettes.vercel.app/public-profile/
                    {username || "..."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={copyToClipboard}
                  className={`shrink-0 p-3 rounded-xl transition-all duration-200 flex items-center gap-2 ${
                    copied
                      ? "bg-green-500 text-white"
                      : "bg-white text-neutral-600 shadow-sm border border-neutral-200 hover:border-orange-400 hover:text-orange-600"
                  }`}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  <span className="text-xs font-black uppercase tracking-tight hidden sm:block">
                    {copied ? "Copié !" : "Copier"}
                  </span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`${buttonClass} bg-neutral-900 text-white hover:bg-neutral-800 disabled:opacity-50`}
            >
              {loading && <Loader2 className="animate-spin" size={18} />}
              Sauvegarder les modifications
            </button>
          </form>
        </div>

        {/* SECTION 2: SÉCURITÉ */}
        <div className="bg-white border border-neutral-200 p-8 rounded-[2.5rem] shadow-xl">
          <h2 className="text-xl font-black pb-4 mb-8 text-neutral-900 flex items-center gap-3 border-b border-neutral-100">
            <div className="p-2 bg-neutral-100 rounded-lg">
              <Lock className="size-5 text-neutral-600" />
            </div>
            Sécurité
          </h2>

          <div className="mb-10 space-y-3">
            <label className="block text-xs font-black uppercase tracking-widest text-neutral-400 ml-1">
              Adresse e-mail
            </label>
            <div className="flex items-center gap-3 p-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-bold text-neutral-500">
              <Mail className="size-4" />
              {user.email}
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-6">
            <div className="space-y-3">
              <label className="block text-xs font-black uppercase tracking-widest text-neutral-400 ml-1">
                Nouveau mot de passe
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className={inputClass}
                required
              />
            </div>

            {passwordStatus && (
              <div
                className={`p-4 rounded-2xl font-bold ${
                  passwordStatus.type === "success"
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-600"
                }`}
              >
                {passwordStatus.msg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || newPassword.length < 6}
              className={`${buttonClass} bg-red-600 text-white hover:bg-red-700 disabled:opacity-50`}
            >
              <Key className="size-4" />
              Mettre à jour le mot de passe
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
