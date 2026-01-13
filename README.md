# 🍳 Mon Carnet de Recettes — Frontend (Nuxt 3)

> **L'interface utilisateur d'une plateforme SaaS dédiée à l'édition culinaire, conçue pour transformer une bibliothèque numérique en un livre physique.**

Ce dépôt contient le code source de la partie cliente. L'interface a été pensée comme une **Application Métier (SaaS)**, privilégiant la rapidité de saisie, la clarté visuelle et la fluidité des interactions.

🔗 **Lien vers l'API Backend (NestJS) :** [https://github.com/niamorweb/moncarnetderecettes-backend](https://github.com/niamorweb/moncarnetderecettes-backend)

---

## 🎨 Vision UX/UI

L'enjeu principal était de créer une alternative aux outils généralistes. L'interface propose :

- **Un Design System "Pixel-Perfect"** : Développé sous Tailwind CSS pour une cohérence visuelle totale.
- **Zéro Friction** : Utilisation de modales contextuelles (Picker Modal) pour organiser ses recettes sans changer de page.
- **Expérience Premium** : Animations fluides via transitions natives et Framer Motion (Vue) pour renforcer l'aspect haut de gamme du produit.

## 🛠 Stack Technique

- **Framework :** [Nuxt 3](https://nuxt.com/) — Choisi pour son système de rendu hybride (SSR/CSR) et ses performances.
- **State Management :** [Pinia](https://pinia.vuejs.org/) — Gestion centralisée de l'authentification et de l'état du carnet.
- **Styling :** [Tailwind CSS](https://tailwindcss.com/) — Pour une interface responsive et maintenable.
- **Composants :** Architecture basée sur des composants atomiques réutilisables.
- **Icônes & Assets :** Lucide Vue Next & Cloudinary (via NuxtImg) pour une optimisation automatique des images culinaires.

---

## ✨ Fonctionnalités Frontend

- **Dashboard Interactif :** Vue d'ensemble des recettes avec filtrage dynamique par catégories.
- **Gestion de Contenu en Masse :** Système de sélection multiple pour déplacer ou supprimer des recettes (Bulk Actions).
- **Interface de Composition de Livre :** Espace dédié à la configuration du carnet PDF avant génération.
- **Optimistic UI :** Les interactions utilisateur (ajout/suppression) sont répercutées instantanément pour une sensation de vitesse accrue.
- **Validation de Formulaires :** Gestion rigoureuse des entrées pour garantir l'intégrité des données envoyées à l'API.

---

## 🏗 Architecture du Projet

```text
app/
├── components/         # Composants UI atomiques et Dashboard
├── layouts/            # Layouts pour l'auth et l'application principale
├── pages/              # Système de routage automatique Nuxt
├── stores/             # Gestion d'état avec Pinia (Auth, Recipes)
├── composables/        # Logique métier réutilisable (API calls, formatage)
└── types/              # Interfaces TypeScript partagées avec le Backend
```
