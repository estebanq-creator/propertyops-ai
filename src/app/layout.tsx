import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClientAuthProvider } from "@/components/ClientAuthProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PropertyOpsAI Control Panel",
  description: "AI-native operations dashboard for property managers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientAuthProvider>{children}</ClientAuthProvider>
      </body>
    </html>
  );
}
