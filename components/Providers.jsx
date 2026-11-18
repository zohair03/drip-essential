"use client";

import React from "react";
import { ProductProvider } from "@/components/context/ProductContext";

export function Providers({ children }) {
  return <ProductProvider>{children}</ProductProvider>;
}

export default Providers;
