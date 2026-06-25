import type { Metadata } from "next";
import NordicAutoCareApp from "./components/NordicAutoCareApp";

export const metadata: Metadata = {
  title: "Nordic Auto Care",
  applicationName: "Nordic Auto Care",
  manifest: "/site.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Nordic Auto Care",
    statusBarStyle: "black-translucent",
  },
};

export default function Home() {
  return <NordicAutoCareApp mode="frontend" />;
}
