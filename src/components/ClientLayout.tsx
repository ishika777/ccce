"use client";

import { ReactNode } from "react";
import { ThemeProvider } from "../lib/themeProvider";
import { Toaster } from "sonner";

export function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Toaster />
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </>
  );
}
