"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "./admin-sidebar";
import { AdminTopbar } from "./admin-topbar";

interface StaffInfo {
  name?: string | null;
  email?: string | null;
  roleName?: string | null;
}

interface AdminShellContextValue {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

const AdminShellContext = createContext<AdminShellContextValue>({
  sidebarOpen: false,
  setSidebarOpen: () => {},
  toggleSidebar: () => {},
  closeSidebar: () => {},
  isCollapsed: false,
  toggleCollapse: () => {},
});

export const useAdminSidebar = () => useContext(AdminShellContext);

export function AdminShell({
  staff,
  children,
}: {
  staff?: StaffInfo;
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  return (
    <AdminShellContext.Provider
      value={{
        sidebarOpen,
        setSidebarOpen,
        toggleSidebar: () => setSidebarOpen((prev) => !prev),
        closeSidebar: () => setSidebarOpen(false),
        isCollapsed,
        toggleCollapse: () => setIsCollapsed((prev) => !prev),
      }}
    >
      <div className="min-h-screen flex bg-[#FAF8F5]">
        {/* Full-Height Left Navigation Sidebar (Desktop + Mobile Drawer) */}
        <AdminSidebar staff={staff} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <AdminTopbar staff={staff} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </AdminShellContext.Provider>
  );
}
