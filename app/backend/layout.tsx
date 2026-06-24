import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nordic Auto Care Backend",
  applicationName: "Nordic Auto Care Backend",
  manifest: "/backend.webmanifest",
  appleWebApp: {
    capable: true,
    title: "NAC Backend",
    statusBarStyle: "black-translucent",
  },
};

export default function BackendLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
