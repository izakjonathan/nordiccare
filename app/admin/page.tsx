import type { Metadata } from "next";
import NordicAutoCareApp from "../components/NordicAutoCareApp";

export const metadata: Metadata = {
  title: "Nordic Auto Care Admin",
  applicationName: "Nordic Auto Care Admin",
  manifest: "/admin.webmanifest",
  appleWebApp: {
    capable: true,
    title: "NAC Admin",
    statusBarStyle: "black-translucent",
  },
};

export default function Page() {
  return <NordicAutoCareApp mode="backend" />;
}
