import type { Metadata } from "next";
import { Playfair_Display, EB_Garamond } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const garamond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-garamond",
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MET Art Tour — European Masterworks with Raphael Exhibition",
  description:
    "A premium 3.5-hour guided journey through European art history at the Metropolitan Museum of Art. From Roman antiquity to Impressionism, including the Raphael Exhibition.",
  openGraph: {
    title: "MET Art Tour — European Masterworks",
    description: "Premium guided art experience at the Metropolitan Museum of Art",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${garamond.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
