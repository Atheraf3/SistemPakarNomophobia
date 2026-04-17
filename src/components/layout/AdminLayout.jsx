import { Outlet, Link, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";

function AdminLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

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

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="h-14 flex items-center justify-center border-b border-slate-700 font-bold text-lg">
          <Link to="/admin">Admin Dashboard</Link>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
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

        <div className="p-4 border-t border-slate-700">
          <div className="mb-4 text-sm text-slate-300">
            Login sebagai: <br/>
            <span className="font-semibold text-white">{user?.name}</span>
          </div>
          <Button variant="destructive" className="w-full" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-slate-50 flex flex-col">
        <header className="h-14 bg-white border-b flex items-center px-8 shadow-sm">
          <h1 className="text-xl font-semibold">Sistem Pakar Nomophobia</h1>
        </header>
        <div className="p-8 flex-1 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;
