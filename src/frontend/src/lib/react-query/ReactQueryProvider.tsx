"use client";

import { ReactNode } from "react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { getQueryClient } from "./queryClient";

let client: QueryClient | null = null;

export function ReactQueryProvider({ children }: { children: ReactNode }) {
  if (!client) {
    client = getQueryClient();
  }

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
