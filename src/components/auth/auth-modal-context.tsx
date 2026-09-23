"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  Suspense,
  type ReactNode,
} from "react";
import { useSearchParams } from "next/navigation";

export type AuthModalView = "email" | "login" | "register" | "forgot";

export interface AuthModalOptions {
  view?: AuthModalView;
  email?: string;
  redirectTo?: string;
}

interface AuthModalContextType {
  isOpen: boolean;
  view: AuthModalView;
  email: string;
  redirectTo: string;
  openAuthModal: (options?: AuthModalOptions) => void;
  closeAuthModal: () => void;
  setView: (view: AuthModalView) => void;
  setEmail: (email: string) => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

function AuthModalUrlSync({
  openAuthModal,
}: {
  openAuthModal: (options?: AuthModalOptions) => void;
}) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const authParam = searchParams.get("auth");
    if (authParam === "login" || authParam === "signin") {
      openAuthModal({ view: "email" });
    } else if (authParam === "register" || authParam === "signup") {
      openAuthModal({ view: "register" });
    }
  }, [searchParams, openAuthModal]);

  return null;
}

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<AuthModalView>("email");
  const [email, setEmail] = useState("");
  const [redirectTo, setRedirectTo] = useState("/account");

  const openAuthModal = useCallback((options?: AuthModalOptions) => {
    if (options?.view) setView(options.view);
    else setView("email");

    if (options?.email !== undefined) setEmail(options.email);
    if (options?.redirectTo) setRedirectTo(options.redirectTo);

    setIsOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Listen for custom "open-auth-modal" events across the application
  useEffect(() => {
    function handleCustomEvent(e: Event) {
      const customEvent = e as CustomEvent<AuthModalOptions | undefined>;
      openAuthModal(customEvent.detail);
    }

    window.addEventListener("open-auth-modal", handleCustomEvent as EventListener);
    return () => {
      window.removeEventListener("open-auth-modal", handleCustomEvent as EventListener);
    };
  }, [openAuthModal]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  return (
    <AuthModalContext.Provider
      value={{
        isOpen,
        view,
        email,
        redirectTo,
        openAuthModal,
        closeAuthModal,
        setView,
        setEmail,
      }}
    >
      <Suspense fallback={null}>
        <AuthModalUrlSync openAuthModal={openAuthModal} />
      </Suspense>
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal(): AuthModalContextType {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error("useAuthModal must be used within an AuthModalProvider");
  }
  return context;
}
