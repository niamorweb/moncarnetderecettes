import type { Metadata } from "next";
import { Geist, Geist_Mono, DM_Sans, Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

export const metadata = {
  title: "Mon Carnet de Recettes | Créez votre livre de cuisine numérique",
  description:
    "Organisez vos recettes, partagez votre profil culinaire public et exportez vos créations en PDF haute qualité ou en livre papier. L'écrin numérique des passionnés de cuisine.",
  keywords: [
    "carnet de recettes numérique",
    "créer son livre de cuisine",
    "organisation recettes",
    "export PDF recettes",
    "partage recettes en ligne",
  ],
  openGraph: {
    title: "Mon Carnet de Recettes : Vos recettes méritent un bel écrin.",
    description:
      "Ne laissez plus vos idées s'égarer. Transformez votre cuisine en un catalogue professionnel et partagez-le.",
    url: "https://moncarnetderecettes.vercel.app",
    siteName: "MonCarnetDeRecettes",
    images: [
      {
        url: "/images/hero.webp",
        width: 1200,
        height: 630,
        alt: "Aperçu de Mon Carnet de Recettes",
      },
    ],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mon Carnet de Recettes",
    description:
      "Créez votre catalogue culinaire pro et exportez-le en livre papier.",
    images: ["/images/hero.webp"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable}  antialiased`}>{children}</body>
    </html>
  );
}
