import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../components/layout/themeProvider";
import {
  ClerkProvider,
} from '@clerk/nextjs'
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Collaborative Cloud Code Editor",
  description: "Collaborative Cloud Code Editor",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
        <html lang="en" suppressHydrationWarning={true}>
        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
            <ThemeProvider
            attribute="class"
                defaultTheme="dark"
                enableSystem
                disableTransitionOnChange
            >

            {children}
            <Toaster position="bottom-right" richColors />
            </ThemeProvider>
        </body>
        </html>
    </ClerkProvider>
  );
}
