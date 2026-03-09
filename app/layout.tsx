import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://foxyphoto.netlify.app"),
  title: "Дарья Первушина | Профессиональный фотограф",
  description: "Дарья Первушина — профессиональный фотограф с модельным опытом. Индивидуальные фотосессии, Love Story и художественная обработка. Работаю в России, Таиланде и Вьетнаме.",
  keywords: [
    "фотограф",
    "фотосессия",
    "портрет",
    "love story",
    "Дарья Первушина",
    "фотограф Таиланд",
    "фотограф Вьетнам",
    "фотограф Пхукет",
    "фотограф Нячанг"
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Дарья Первушина | Профессиональный фотограф",
    description: "Индивидуальные фотосессии и Love Story от профессионального фотографа с модельным опытом.",
    url: "https://foxyphoto.netlify.app",
    siteName: "Дарья Первушина | Фотограф",
    locale: "ru_RU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Дарья Первушина | Фотограф",
    description: "Профессиональный фотограф с модельным опытом",
  },
  verification: {
    google: "PLACEHOLDER_FOR_GOOGLE_VERIFICATION_CODE",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${inter.variable} antialiased font-sans`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ProfessionalService",
              "name": "Дарья Первушина | Фотограф",
              "image": "https://foxyphoto.netlify.app/assets/IMG_2333.JPG",
              "description": "Профессиональный фотограф с модельным опытом. Индивидуальные фотосессии, Love Story и обработка фото.",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": ["RU", "TH", "VN"]
              },
              "priceRange": "$$",
              "url": "https://foxyphoto.netlify.app",
              "sameAs": [
                "https://www.instagram.com/foto_foxydy",
                "https://t.me/foxydy"
              ]
            })
          }}
        />
        {children}
      </body>
    </html>
  );
}
