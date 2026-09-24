import type { ReactNode } from "react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { AuthModalProvider } from "@/components/auth/auth-modal-context";
import { AuthModal } from "@/components/auth/auth-modal";

// Everything that used to live directly in the root layout, moved here
// unchanged (see the note in src/app/layout.tsx). Neither AuthModalProvider
// nor AuthModal.Provider render a wrapping DOM element, so body's
// `flex flex-col` sticky-footer layout is unaffected by this move.
export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <AuthModalProvider>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-terracotta focus:px-4 focus:py-2 focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <SiteFooter />
      <AuthModal />
    </AuthModalProvider>
  );
}
