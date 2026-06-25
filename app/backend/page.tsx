import type { Metadata } from "next";
import NordicAutoCareApp from "../components/NordicAutoCareApp";

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

export default function BackendPage() {
  return <NordicAutoCareApp mode="backend" />;
}
