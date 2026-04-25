import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";

function Navbar() {
  const { isAuthenticated, role, logout } = useAuthStore();
  const navigate = useNavigate();

  const navItems = [
    { to: "/", label: "Beranda", show: true },
    { to: "/diagnosis", label: "Diagnosis", show: isAuthenticated && role === "user" },
    { to: "/history", label: "Riwayat", show: isAuthenticated && role === "user" },
    { to: "/about", label: "Informasi", show: true },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center px-4 justify-between">
        <div className="flex items-center">
          <Link to="/" className="mr-6 flex items-center font-bold text-lg">
            <img src="https://ik.imagekit.io/2xthk8ud4/TA/Fav.png" alt="Sistem Pakar Logo" className="h-16 w-auto" />
          </Link>
          <nav className="flex gap-6 text-sm font-medium">
            {navItems
              .filter((item) => item.show)
              .map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground transition-colors"
                  }
                >
                  {item.label}
                </NavLink>
              ))}
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              {role === "admin" && (
                <Link to="/admin">
                  <Button variant="outline" size="sm" className="cursor-pointer">Admin Dashboard</Button>
                </Link>
              )}
              {role === "user" && (
                <Link to="/profile">
                  <Button variant="ghost" size="sm" className="cursor-pointer">Profil</Button>
                </Link>
              )}
              <Button variant="destructive" size="sm" onClick={handleLogout} className="cursor-pointer">Logout</Button>
            </>
          ) : (
            <Link to="/login">
              <Button size="sm" className="cursor-pointer">Login</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
