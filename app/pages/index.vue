<script setup lang="ts">
import {
  BookOpen,
  ArrowRight,
  Sparkles,
  ChefHat,
  ScanSearch,
  Timer,
  Share2,
  Printer,
  ChevronRight,
  Play,
  Star,
  ExternalLink,
} from "lucide-vue-next";

const isVisible = ref(false);
onMounted(() => {
  setTimeout(() => (isVisible.value = true), 100);
});

const features = [
  {
    title: "Éditeur Intuitif",
    desc: "Saisissez vos recettes à la vitesse de la pensée. Glissez, déposez, savourez.",
    icon: Sparkles,
    class: "col-span-1 md:col-span-2 bg-orange-50 border-orange-100",
    iconClass: "text-orange-600 bg-orange-100",
  },
  {
    title: "Mode Cuisine",
    desc: "L'écran ne s'éteint jamais quand vous avez les mains dans la farine.",
    icon: Timer,
    class: "col-span-1 bg-white border-neutral-200",
    iconClass: "text-neutral-900 bg-neutral-100",
  },
  {
    title: "Organisation Chef",
    desc: "Tags, catégories, temps : retrouvez ce gratin de 2018 en 2 secondes.",
    icon: ScanSearch,
    class: "col-span-1 bg-white border-neutral-200",
    iconClass: "text-neutral-900 bg-neutral-100",
  },
  {
    title: "Export Livre Physique",
    desc: "Générez un PDF prêt à l'impression pour offrir votre héritage culinaire.",
    icon: Printer,
    class:
      "col-span-1 md:col-span-2 bg-neutral-900 text-white border-neutral-900",
    iconClass: "text-white bg-white/20",
    dark: true,
  },
];

const containerRef = ref<HTMLElement | null>(null);

const floatingCards = [
  {
    title: "Pancakes Fluffy",
    img: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&q=80&w=400",
    category: "Petit-Dej",
    time: "15 min",
    finalClass: "top-10 -left-4 md:-left-12 rotate-[-6deg]",
    delay: "0ms",
  },
  {
    title: "Salade César",
    img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=400",
    category: "Healthy",
    time: "10 min",
    finalClass: "bottom-20 -right-4 md:right-4 rotate-[6deg]",
    delay: "200ms",
  },
  {
    title: "Avocado Toast",
    img: "https://plus.unsplash.com/premium_photo-1691090282768-380cc3e34b23?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    category: "Brunch",
    time: "5 min",
    finalClass: "top-20 -right-4 md:-right-12 rotate-[3deg]",
    delay: "400ms",
  },
];

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          isVisible.value = true;
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.4,
      rootMargin: "0px",
    }
  );

  if (containerRef.value) {
    observer.observe(containerRef.value);
  }
});
</script>

<template>
  <div
    class="min-h-screen bg-[#FDFBF9] font-sans selection:bg-orange-200 selection:text-orange-900 overflow-x-hidden"
  >
    <div
      class="fixed inset-0 opacity-[0.03] pointer-events-none z-0"
      style="
        background-image: url('https://grainy-gradients.vercel.app/noise.svg');
      "
    ></div>

    <nav class="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
      <div
        class="bg-white/80 backdrop-blur-md border border-white/20 shadow-lg shadow-neutral-200/20 rounded-full px-6 py-3 flex items-center justify-between gap-8 md:gap-12 transition-all"
      >
        <NuxtLink to="/" class="flex items-center gap-2 group">
          <div
            class="bg-orange-600 text-white p-1.5 rounded-lg rotate-3 group-hover:rotate-0 transition-transform duration-300"
          >
            <BookOpen :size="18" stroke-width="2.5" />
          </div>
          <span
            class="font-bold text-neutral-900 tracking-tight hidden sm:block"
            >MonCarnetDeRecettes.</span
          >
        </NuxtLink>

        <div class="flex items-center gap-2">
          <UiButton variant="ghost" to="/login"> Connexion </UiButton>
          <UiButton to="/signup"> Commencer </UiButton>
        </div>
      </div>
    </nav>

    <main
      class="relative z-10 pt-40 pb-20 md:pt-48 md:pb-32 px-6 max-w-7xl mx-auto"
    >
      <div class="flex flex-col items-center text-center max-w-4xl mx-auto">
        <div
          class="mb-8 opacity-0 animate-fade-in-up"
          style="animation-delay: 0.1s; animation-fill-mode: forwards"
        >
          <span
            class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-100 text-orange-700 text-xs font-bold uppercase tracking-widest hover:bg-orange-100 transition-colors cursor-default"
          >
            <Sparkles :size="12" />
            La nouvelle référence culinaire
          </span>
        </div>

        <h1
          class="text-5xl md:text-7xl font-black text-neutral-900 tracking-tighter leading-[0.95] mb-8 opacity-0 animate-fade-in-up"
          style="animation-delay: 0.2s; animation-fill-mode: forwards"
        >
          Vos recettes ne sont pas <br class="hidden md:block" />
          <span class="relative inline-block">
            juste des notes.
            <svg
              class="absolute -bottom-2 left-0 w-full h-3 text-orange-500 opacity-80"
              viewBox="0 0 100 10"
              preserveAspectRatio="none"
            >
              <path
                d="M0 5 Q 50 10 100 5"
                stroke="currentColor"
                stroke-width="4"
                fill="none"
              />
            </svg>
          </span>
        </h1>

        <p
          class="text-lg md:text-2xl text-neutral-500 font-medium max-w-2xl mb-10 leading-relaxed opacity-0 animate-fade-in-up"
          style="animation-delay: 0.3s; animation-fill-mode: forwards"
        >
          Transformez vos brouillons et captures d'écran en un patrimoine
          culinaire digital, esthétique et éternel.
        </p>

        <div
          class="flex flex-col sm:flex-row items-center gap-4 opacity-0 animate-fade-in-up"
          style="animation-delay: 0.4s; animation-fill-mode: forwards"
        >
          <UiButton
            size="lg"
            class="rounded-full px-8 py-4 text-lg shadow-xl shadow-orange-500/20 hover:scale-105 transition-transform duration-300"
          >
            Créer mon carnet
            <ArrowRight class="ml-2" :size="20" />
          </UiButton>

          <UiButton
            to="/u/username"
            target="_blank"
            size="lg"
            variant="outline"
          >
            <div
              class="size-8 rounded-full bg-neutral-100 flex items-center justify-center group-hover:bg-orange-100 group-hover:text-orange-600 transition-colors"
            >
              <ExternalLink :size="14" />
            </div>
            Voir une demo
          </UiButton>
        </div>

        <div
          class="mt-16 flex items-center gap-4 opacity-0 animate-fade-in-up"
          style="animation-delay: 0.6s; animation-fill-mode: forwards"
        >
          <div class="flex -space-x-4">
            <img
              v-for="i in 4"
              :key="i"
              :src="`https://i.pravatar.cc/100?img=${i + 10}`"
              class="size-10 rounded-full border-2 border-[#FDFBF9]"
              alt="User"
            />
          </div>
          <div class="text-left">
            <div class="flex gap-0.5 text-orange-500">
              <Star v-for="s in 5" :key="s" :size="12" fill="currentColor" />
            </div>
            <p class="text-sm font-bold text-neutral-900">
              <span class="font-black">2,400+</span> passionnés
            </p>
          </div>
        </div>
      </div>

      <div
        ref="containerRef"
        class="mt-32 relative max-w-6xl mx-auto perspective-1000 min-h-[600px] flex items-center justify-center"
      >
        <div
          class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-orange-200/30 via-purple-200/20 to-blue-200/30 blur-[100px] -z-10 rounded-full transition-all duration-1000"
          :class="isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'"
        ></div>

        <div class="relative w-full flex items-center justify-center">
          <div
            class="relative z-30 w-[300px] md:w-[380px] bg-white rounded-[2rem] shadow-2xl border border-white/50 transition-all duration-1000 cubic-bezier-spring group cursor-default"
            :class="
              isVisible
                ? 'translate-y-0 opacity-100 scale-100'
                : 'translate-y-20 opacity-0 scale-90'
            "
          >
            <div class="h-64 overflow-hidden rounded-t-[2rem] relative">
              <img
                src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800"
                alt="Poke Bowl"
                class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div
                class="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider text-orange-600 shadow-sm"
              >
                Nouveau
              </div>
            </div>

            <div class="p-6">
              <div class="flex justify-between items-start mb-4">
                <div>
                  <h3 class="text-2xl font-black text-neutral-900 mb-1">
                    Poke Bowl
                  </h3>
                  <p class="text-neutral-400 text-sm font-medium">@ChefAlex</p>
                </div>
                <button class="p-2 rounded-full bg-orange-50 text-orange-500">
                  <Heart :size="20" fill="currentColor" />
                </button>
              </div>

              <div class="flex gap-2 mb-6">
                <span
                  class="px-3 py-1 rounded-lg bg-neutral-100 text-neutral-600 text-xs font-bold flex items-center gap-1"
                >
                  <Clock :size="12" /> 25 min
                </span>
                <span
                  class="px-3 py-1 rounded-lg bg-green-100 text-green-700 text-xs font-bold flex items-center gap-1"
                >
                  <TrendingUp :size="12" /> Facile
                </span>
              </div>

              <div
                class="flex items-center gap-3 pt-4 border-t border-neutral-100"
              >
                <div class="flex -space-x-2">
                  <div
                    v-for="i in 3"
                    :key="i"
                    class="size-8 rounded-full border-2 border-white bg-neutral-200"
                  ></div>
                </div>
                <p class="text-xs font-bold text-neutral-500">+12 likes</p>
              </div>
            </div>

            <div
              class="absolute -right-8 md:-right-12 top-12 bg-white p-3 pr-5 rounded-2xl shadow-xl border border-green-100 flex items-center gap-3 z-40 transition-all duration-700 delay-1000"
              :class="
                isVisible
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 -translate-x-4'
              "
            >
              <div
                class="bg-green-500 text-white p-2 rounded-xl shadow-lg shadow-green-500/30"
              >
                <CheckCircle2 :size="18" />
              </div>
              <div>
                <p class="text-[10px] text-neutral-400 font-bold uppercase">
                  Succès
                </p>
                <p class="text-xs font-black text-neutral-900">Validé !</p>
              </div>
            </div>
          </div>

          <div
            v-for="(card, idx) in floatingCards"
            :key="idx"
            class="absolute w-48 md:w-56 bg-white p-3 rounded-2xl shadow-lg border border-neutral-100 z-10 transition-all duration-[1200ms] cubic-bezier-spring"
            :class="
              isVisible
                ? `${card.finalClass} opacity-100 scale-100`
                : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 scale-50 rotate-0'
            "
            :style="{ transitionDelay: card.delay }"
          >
            <div class="relative h-32 rounded-xl overflow-hidden mb-3">
              <img :src="card.img" class="w-full h-full object-cover" />
              <div class="absolute inset-0 bg-black/10"></div>
            </div>
            <div class="flex justify-between items-center">
              <div>
                <p class="font-bold text-neutral-900 text-sm truncate">
                  {{ card.title }}
                </p>
                <p class="text-xs text-neutral-400">{{ card.category }}</p>
              </div>
              <button class="bg-neutral-100 p-1.5 rounded-lg text-neutral-400">
                <Plus :size="14" />
              </button>
            </div>
          </div>

          <div
            class="absolute bottom-10 left-4 md:left-20 bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-white/50 w-40 z-0 transform -rotate-12 blur-[1px] transition-all duration-1000 delay-500"
            :class="
              isVisible
                ? 'opacity-60 translate-y-0'
                : 'opacity-0 translate-y-10'
            "
          >
            <div class="h-2 w-12 bg-neutral-200 rounded-full mb-4"></div>
            <div class="space-y-2">
              <div class="h-1.5 w-full bg-neutral-100 rounded-full"></div>
              <div class="h-1.5 w-3/4 bg-neutral-100 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <section class="py-32 px-6 max-w-7xl mx-auto">
      <div class="mb-16 md:text-center max-w-3xl mx-auto">
        <h2
          class="text-4xl md:text-5xl font-black text-neutral-900 tracking-tight mb-6"
        >
          Tout pour le <span class="text-orange-600">Gourmet Moderne</span>.
        </h2>
        <p class="text-xl text-neutral-500">
          Une suite d'outils conçue pour ceux qui prennent la cuisine au
          sérieux, sans se prendre la tête.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          v-for="(feature, idx) in features"
          :key="idx"
          :class="[
            'group p-8 rounded-[2.5rem] border transition-all duration-500 hover:shadow-xl hover:-translate-y-1 relative overflow-hidden',
            feature.class,
          ]"
        >
          <div
            :class="[
              'size-12 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-500',
              feature.iconClass,
            ]"
          >
            <component :is="feature.icon" :size="24" />
          </div>

          <h3
            :class="[
              'text-2xl font-black mb-3 tracking-tight',
              feature.dark ? 'text-white' : 'text-neutral-900',
            ]"
          >
            {{ feature.title }}
          </h3>
          <p
            :class="[
              'text-lg leading-relaxed font-medium',
              feature.dark ? 'text-neutral-400' : 'text-neutral-500',
            ]"
          >
            {{ feature.desc }}
          </p>

          <div
            class="absolute -right-10 -bottom-10 opacity-0 group-hover:opacity-10 transition-opacity duration-500"
          >
            <component :is="feature.icon" :size="150" />
          </div>
        </div>
      </div>
    </section>

    <section class="py-20 px-6 max-w-7xl mx-auto">
      <div
        class="bg-neutral-900 rounded-[3rem] p-8 md:p-20 text-white relative overflow-hidden"
      >
        <div
          class="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-600/20 blur-[100px] rounded-full"
        ></div>

        <div
          class="relative z-10 flex flex-col md:flex-row items-center gap-16"
        >
          <div class="flex-1 w-full space-y-8">
            <div
              class="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/10 text-orange-300 text-xs font-bold uppercase tracking-widest"
            >
              <Share2 :size="12" />
              Vitrine Publique
            </div>
            <h2
              class="text-4xl md:text-6xl font-black tracking-tighter leading-none"
            >
              Ne gardez pas vos secrets
              <span class="text-orange-500">pour vous.</span>
            </h2>
            <p class="text-neutral-400 text-lg md:text-xl font-medium max-w-md">
              Générez un lien public élégant. Vos amis n'auront plus d'excuse
              pour rater vos cookies.
            </p>
            <div
              class="flex items-center gap-2 bg-white/5 p-2 pr-4 rounded-xl border border-white/10 w-fit backdrop-blur-sm"
            >
              <div
                class="bg-green-500 size-2 rounded-full ml-3 animate-pulse"
              ></div>
              <code class="text-xs font-mono text-neutral-300"
                >moncarnetderecettes.app/<span class="text-white font-bold"
                  >username</span
                ></code
              >
              <button
                class="ml-4 hidden md:flex text-xs font-bold bg-white text-neutral-900 px-3 py-1.5 rounded-lg hover:bg-neutral-200 transition-colors"
              >
                Copier
              </button>
            </div>
          </div>

          <div class="flex-1 w-full max-w-sm">
            <div
              class="aspect-[9/16] bg-neutral-800 rounded-[2.5rem] border-4 border-neutral-700 shadow-2xl relative overflow-hidden group hover:border-orange-500/50 transition-colors duration-500"
            >
              <div
                class="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-6 bg-neutral-900 rounded-b-xl z-20"
              ></div>
              <NuxtImg
                src="/images/mobile-sample.webp"
                class="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <footer class="border-t border-neutral-200 bg-white pt-20 pb-10 px-6 mt-20">
      <div
        class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8"
      >
        <div class="flex items-center gap-2">
          <BookOpen class="text-orange-600" :size="24" />
          <span class="font-black text-xl tracking-tight"
            >MonCarnetDeRecettes.</span
          >
        </div>
        <p class="text-neutral-500 text-sm font-medium">
          © {{ new Date().getFullYear() }} — Cuisiné avec amour.
        </p>
      </div>
    </footer>
  </div>
</template>

<style>
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.animate-float {
  animation: float 4s ease-in-out infinite;
}

.perspective-1000 {
  perspective: 1000px;
}

.cubic-bezier-spring {
  transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0) rotate(var(--rotate));
  }
  50% {
    transform: translateY(-15px) rotate(var(--rotate));
  }
}

@keyframes heroEntrance {
  0% {
    transform: translateY(50px) scale(0.9);
    opacity: 0;
  }
  100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}

@keyframes pulseSlow {
  0%,
  100% {
    opacity: 0.6;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 0.8;
    transform: translate(-50%, -50%) scale(1.05);
  }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

.animate-float-delayed {
  animation: float 5s ease-in-out infinite reverse;
}

.animate-hero-entrance {
  animation: heroEntrance 1s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}

.animate-fade-in {
  animation: fadeIn 0.8s ease-out forwards;
}

.animate-pulse-slow {
  animation: pulseSlow 8s ease-in-out infinite;
}
</style>
