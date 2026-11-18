import { Suspense } from "react";
import WatchPage from "@/components/pages/WatchPage";

export default function ProductDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>}>
      <WatchPage />
    </Suspense>
  );
}
