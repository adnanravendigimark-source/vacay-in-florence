"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { SupplierSidebar } from "./supplier-sidebar";

interface SupplierInfo {
  name?: string | null;
  email?: string | null;
  supplierName?: string | null;
}

interface SupplierShellContextValue {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  closeSidebar: () => void;
}

const SupplierShellContext = createContext<SupplierShellContextValue>({
  sidebarOpen: false,
  setSidebarOpen: () => {},
  toggleSidebar: () => {},
  closeSidebar: () => {},
});

export const useSupplierSidebar = () => useContext(SupplierShellContext);

/**
 * Mirrors AdminShell (src/components/admin/admin-shell.tsx) exactly — same
 * mobile-drawer/body-scroll-lock behavior, same "no overflow-y-auto on the
 * main wrapper" reasoning (a nested `sticky` element, if this shell ever
 * gets one, needs the window itself as its scroll container). No collapse
 * state: the supplier nav is short enough it doesn't need it.
 */
export function SupplierShell({
  supplier,
  unreadNotifications = 0,
  children,
}: {
  supplier?: SupplierInfo;
  unreadNotifications?: number;
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  return (
    <SupplierShellContext.Provider
      value={{
        sidebarOpen,
        setSidebarOpen,
        toggleSidebar: () => setSidebarOpen((prev) => !prev),
        closeSidebar: () => setSidebarOpen(false),
      }}
    >
      <div className="min-h-screen flex bg-[#FAF8F5]">
        <SupplierSidebar supplier={supplier} unreadNotifications={unreadNotifications} />
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </SupplierShellContext.Provider>
  );
}
