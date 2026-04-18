import { useState } from "react";
import { Outlet, Link, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";

function AdminLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navItems = [
    { to: "/admin/penyakit", label: "Kelola Tingkat" },
    { to: "/admin/gejala", label: "Kelola Gejala" },
    { to: "/admin/knowledge-base", label: "Knowledge Base (CF Pakar)" },
    { to: "/admin/users", label: "Kelola Users" },
    { to: "/admin/solusi", label: "Kelola Solusi" },
  ];

  // Komponen Sidebar Terpisah agar bisa dipakai ulang di Sheet
  const SidebarContent = () => (
    <>
      <div className="h-14 flex items-center justify-center border-b border-slate-700/50 font-bold text-lg text-white">
        <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)}>Admin Dashboard</Link>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) =>
              `block px-4 py-2 rounded-md transition-colors ${
                isActive ? "bg-slate-700 text-white" : "text-slate-300 hover:bg-slate-800"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700/50">
        <div className="mb-4 text-sm text-slate-300">
          Login sebagai: <br/>
          <span className="font-semibold text-white">{user?.name}</span>
        </div>
        <Button variant="destructive" className="w-full" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen">
      {/* Sidebar Dekstop */}
      <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-slate-50 flex flex-col min-w-0">
        <header className="h-14 bg-white border-b flex items-center justify-between md:justify-start px-4 md:px-8 shadow-sm">
          <h1 className="text-lg md:text-xl font-semibold">Sistem Pakar Nomophobia</h1>
          
          {/* Mobile Menu Trigger */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 bg-slate-900 border-r-0 w-64 flex flex-col">
                {/* Aksesibilitas Title & Description (Hidden) */}
                <span className="sr-only">
                  <SheetTitle>Navigasi Admin</SheetTitle>
                  <SheetDescription>Menu admin untuk mengelola sistem pakar.</SheetDescription>
                </span>
                <SidebarContent />
              </SheetContent>
            </Sheet>
          </div>
        </header>
        <div className="p-4 md:p-8 flex-1 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;
