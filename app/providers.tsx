// app/providers.tsx

"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import React from "react";

// Import the theme provider directly without trying to import its props type
export function ThemeProvider({
  children,
  ...props
}: {
  children: React.ReactNode;
  [key: string]: any;
}) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}