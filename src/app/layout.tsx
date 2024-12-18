import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({subsets : ['latin']})


export const metadata: Metadata = {
  title: "Audio Vibes",
  description: "Owned and Developed by Cygnuxxs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning lang="en">
      <body
        className={`${inter.className} antialiased`}
      >
        <ThemeProvider attribute={'class'} defaultTheme="system" enableSystem disableTransitionOnChange>
        {children}
        <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
