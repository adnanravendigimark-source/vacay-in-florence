"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "./admin-sidebar";

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
  permissionKeys,
  children,
}: {
  staff?: StaffInfo;
  /** StaffContext.permissionKeys, serialized to an array server-side —
   * filters which sidebar sections this staff member sees. */
  permissionKeys?: string[];
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
        <AdminSidebar staff={staff} permissionKeys={permissionKeys} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Deliberately no overflow-y-auto here: this wrapper never gets a
             bounded height (the shell uses min-h-screen, not h-screen), so
             it can never scroll internally anyway — the window scrolls,
             exactly like the sidebar/topbar above already assume (both use
             plain viewport-relative `sticky`). overflow-y-auto on this
             element used to be a no-op for visible scrolling but NOT a
             no-op for CSS: it silently became the nearest scroll container
             for any `position: sticky` element nested inside it (e.g. the
             blog editor's toolbar), whose "stuck" offset is computed
             against *that* container's scroll position — which never
             moves, since this element itself never scrolls. The visible
             symptom was a sticky toolbar that just sat in normal flow and
             scrolled away with the page instead of staying pinned. */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </AdminShellContext.Provider>
  );
}
