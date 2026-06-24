import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "NAC Backend",
  manifest: "/backend.webmanifest",
  appleWebApp: {
    capable: true,
    title: "NAC Backend",
    statusBarStyle: "black-translucent",
  },
};

export default function BackendHomePage() {
  redirect("/backend");
}
