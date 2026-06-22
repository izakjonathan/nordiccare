import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nordic Auto Care",
  description: "Professionel bilpleje, rengøring, polering og lakbeskyttelse hos Nordic Auto Care.",
  icons: {
    icon: "/images/nordic-logo-splash.jpeg"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#080706"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="da">
      <body>{children}</body>
    </html>
  );
}
