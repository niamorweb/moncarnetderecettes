"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  ChevronRight,
  Star,
  Users,
  Zap,
  LayoutDashboard,
  Share2,
  Printer,
  Filter,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50 font-sans selection:bg-orange-100">
      {/* --- NAVIGATION --- */}
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 font-bold text-xl text-neutral-900">
          <div className="bg-neutral-900 text-white p-1.5 rounded-lg">
            <BookOpen size={20} />
          </div>
          <span>MonCarnetDeRecettes</span>
        </div>
        <div className="flex items-center gap-6">
          <Link
            href="/login"
            className="text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            Connexion
          </Link>
          <Link
            href="/signup"
            className="text-sm font-bold px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-all shadow-sm"
          >
            Essai gratuit
          </Link>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <main className="max-w-7xl mx-auto px-6 pt-12 pb-24 text-center md:text-left flex flex-col md:flex-row items-center gap-16">
        <div
          className={`flex-1 transition-all duration-1000 transform ${
            isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
          }`}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 bg-white border border-neutral-200 rounded-full shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
            <span className="text-xs font-black uppercase tracking-wider text-neutral-600">
              Nouveau : Export PDF haute qualité
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-neutral-900 leading-[1.1] mb-6 tracking-tighter">
            Vos recettes méritent <br />
            <span className="text-orange-600">un bel écrin.</span>
          </h1>

          <p className="text-lg md:text-xl text-neutral-600 mb-10 max-w-xl leading-relaxed font-medium">
            Ne laissez plus vos meilleures idées s'égarer. Créez un catalogue
            numérique professionnel et transformez-le en livre de cuisine.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/signup"
              className="group flex items-center justify-center gap-2 px-8 py-4 bg-neutral-900 text-white font-bold rounded-2xl hover:bg-neutral-800 transition-all shadow-xl shadow-neutral-200 hover:-translate-y-1"
            >
              Commencer gratuitement
              <ChevronRight
                className="group-hover:translate-x-1 transition-transform"
                size={20}
              />
            </Link>
            <Link
              href="/public/test"
              className="flex items-center justify-center gap-2 px-8 py-4 bg-white border border-neutral-200 text-neutral-900 font-bold rounded-2xl hover:bg-neutral-50 transition-all"
            >
              Découvrir des exemples
            </Link>
          </div>

          {/* Social Proof */}
          <div className="mt-12 flex items-center gap-6 justify-center md:justify-start border-t border-neutral-200 pt-8">
            <div className="flex -space-x-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full border-2 border-white bg-neutral-200 flex items-center justify-center overflow-hidden"
                >
                  <Users size={16} className="text-neutral-400" />
                </div>
              ))}
            </div>
            <div className="text-left">
              <div className="flex text-orange-500 mb-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={14} fill="currentColor" />
                ))}
              </div>
              <p className="text-xs font-black text-neutral-900 uppercase tracking-tight">
                +1,200 chefs nous font confiance
              </p>
            </div>
          </div>
        </div>

        {/* Mockup Side avec Next Image */}
        <div
          className={`flex-1 relative transition-all duration-1000 delay-300 transform ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
          }`}
        >
          <div className="relative z-10 bg-white p-4 rounded-[2.5rem] shadow-2xl border border-neutral-200 transform rotate-2 hover:rotate-0 transition-transform duration-500">
            <div className="relative rounded-[2rem] overflow-hidden w-full h-[500px]">
              <Image
                src="https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=1000"
                alt="Recette mockup"
                fill
                className="object-cover"
                priority
              />
            </div>
            {/* Overlay Card */}
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl border border-neutral-100 max-w-[200px] hidden lg:block animate-in slide-in-from-left-4 duration-1000 delay-500">
              <div className="flex items-center gap-2 mb-2 text-orange-600 font-bold text-sm">
                <Zap size={16} fill="currentColor" />
                <span>Rapide</span>
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed font-medium">
                "J'ai créé mon livre de 40 recettes en moins de 10 minutes."
              </p>
            </div>
          </div>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-orange-100/50 rounded-full blur-3xl -z-10" />
        </div>
      </main>

      {/* --- FEATURES SECTIONS --- */}
      <div className="space-y-48 py-32 bg-white border-y border-neutral-200">
        {/* Feature 1: Dashboard */}
        <section className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-20">
          <div className="flex-1 order-2 md:order-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-neutral-50 p-6 rounded-3xl border border-neutral-200 shadow-sm">
                <LayoutDashboard className="text-orange-600 mb-4" />
                <h4 className="font-black mb-2 uppercase text-xs tracking-widest">
                  Dashboard intuitif
                </h4>
                <p className="text-sm text-neutral-500 leading-relaxed">
                  Gérez toutes vos créations au même endroit.
                </p>
              </div>
              <div className="bg-neutral-50 p-6 rounded-3xl border border-neutral-200 shadow-sm mt-8">
                <Filter className="text-orange-600 mb-4" />
                <h4 className="font-black mb-2 uppercase text-xs tracking-widest">
                  Tri intelligent
                </h4>
                <p className="text-sm text-neutral-500 leading-relaxed">
                  Filtrez par catégorie, temps ou difficulté.
                </p>
              </div>
            </div>
          </div>
          <div className="flex-1 order-1 md:order-2">
            <h2 className="text-3xl md:text-5xl font-black mb-6 text-neutral-900 tracking-tight">
              Organisez vos recettes comme un pro
            </h2>
            <p className="text-neutral-600 text-lg mb-8 leading-relaxed font-medium">
              Notre interface vous permet de saisir vos recettes en quelques
              secondes. Ajoutez des photos, triez par catégories et retrouvez
              toujours ce que vous cherchez.
            </p>
            <ul className="space-y-4">
              {[
                "Création rapide",
                "Gestion des catégories",
                "Photos HD",
                "Temps de cuisson précis",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 font-bold text-neutral-700"
                >
                  <div className="size-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs">
                    ✓
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Feature 2: Link in Bio */}
        <section className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-20">
          <div className="flex-1">
            <h2 className="text-3xl md:text-5xl font-black mb-6 text-neutral-900 tracking-tight">
              Votre profil, votre vitrine
            </h2>
            <p className="text-neutral-600 text-lg mb-8 leading-relaxed font-medium">
              Partagez votre univers culinaire via un lien unique. C'est votre
              "Link-in-bio" dédié à la cuisine. Vos proches peuvent consulter
              vos recettes sans même avoir de compte.
            </p>
            <div className="p-5 bg-neutral-900 rounded-2xl inline-flex items-center gap-3 text-white shadow-xl">
              <Share2 size={18} className="text-orange-400" />
              <span className="text-sm font-mono font-bold">
                moncarnet.app/votre-nom
              </span>
            </div>
          </div>
          <div className="flex-1">
            <div className="bg-orange-50 border-2 border-dashed border-orange-200 rounded-[3rem] p-12 text-center relative overflow-hidden">
              <div className="size-20 bg-white rounded-2xl mx-auto shadow-sm flex items-center justify-center mb-6 transform -rotate-6">
                <Users size={32} className="text-orange-600" />
              </div>
              <h3 className="font-black text-2xl mb-2 text-neutral-900 tracking-tight">
                Profil Public
              </h3>
              <p className="text-neutral-500 text-sm mb-8 leading-relaxed font-medium">
                Vos amis peuvent voir, sauvegarder et imprimer vos recettes
                préférées depuis votre lien personnel.
              </p>
              <div className="space-y-2 max-w-[200px] mx-auto opacity-40">
                <div className="h-2 bg-orange-300 rounded-full w-full"></div>
                <div className="h-2 bg-orange-300 rounded-full w-4/5 mx-auto"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature 3: Printed Book */}
        <section className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-20">
          <div className="flex-1 order-2 md:order-1 relative">
            <div className="relative w-full aspect-video rounded-[2.5rem] overflow-hidden shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1589998059171-988d887df646?q=80&w=1000"
                fill
                className="object-cover opacity-90"
                alt="Livre"
              />
            </div>
            <div className="absolute -top-6 -left-6 bg-orange-600 text-white px-6 py-3 rounded-2xl font-black shadow-lg uppercase text-xs tracking-widest">
              Édition Papier
            </div>
          </div>
          <div className="flex-1 order-1 md:order-2">
            <h2 className="text-3xl md:text-5xl font-black mb-6 text-neutral-900 tracking-tight">
              Du digital au papier glacé
            </h2>
            <p className="text-neutral-600 text-lg mb-10 leading-relaxed font-medium">
              Pourquoi laisser vos souvenirs sur un écran ? Compilez vos
              meilleures recettes et commandez votre livre physique de haute
              qualité. Parfait pour offrir ou pour votre bibliothèque.
            </p>
            <button className="flex items-center gap-3 px-8 py-4 border-2 border-neutral-900 rounded-2xl font-black hover:bg-neutral-900 hover:text-white transition-all active:scale-95 shadow-lg">
              <Printer size={20} />
              Simuler mon livre
            </button>
          </div>
        </section>
      </div>

      {/* --- FOOTER --- */}
      <footer className="bg-neutral-50 py-20 px-6 border-t border-neutral-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-2 font-bold text-neutral-900">
            <div className="bg-neutral-900 text-white p-1 rounded-md">
              <BookOpen size={16} />
            </div>
            <span className="tracking-tighter">MonCarnetDeRecettes</span>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-xs font-black uppercase tracking-widest text-neutral-400">
            <Link href="#" className="hover:text-neutral-900 transition-colors">
              À propos
            </Link>
            <Link href="#" className="hover:text-neutral-900 transition-colors">
              Confidentialité
            </Link>
            <Link href="#" className="hover:text-neutral-900 transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
