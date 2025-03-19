import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import { DataProvider } from "@/context/ApiContext";

export const metadata: Metadata = {
  title: "FastChat",
  description: "A chat application built with Next.js.",
};

const inter = Inter({
  subsets: ["latin"],
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        <link rel="icon" href="/favicon.png" />
      </head>
      <body>
        <DataProvider>{children}</DataProvider>
      </body>
    </html>
  );
}
