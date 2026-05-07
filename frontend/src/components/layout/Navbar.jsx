import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

function Navbar() {
  const { isAuthenticated, role, logout } = useAuthStore();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { to: "/", label: "Beranda", show: true },
    { to: "/diagnosis", label: "Diagnosis", show: isAuthenticated && role === "user" },
    { to: "/history", label: "Riwayat", show: isAuthenticated && role === "user" },
    { to: "/about", label: "Informasi", show: true },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
    setMobileOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const visibleItems = navItems.filter((item) => item.show);

  return (
    <>
      {/* Floating Navbar Wrapper */}
      <div
        className="floating-navbar-wrapper"
        style={{
          position: "fixed",
          top: "16px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "calc(100% - 40px)",
          maxWidth: "900px",
          zIndex: 1000,
        }}
      >
        <header
          style={{
            borderRadius: "16px",
            padding: "10px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            transition: "all 0.3s ease",
            background: scrolled
              ? "rgba(255, 255, 255, 0.92)"
              : "rgba(255, 255, 255, 0.80)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            boxShadow: scrolled
              ? "0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06)"
              : "0 4px 24px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(0, 0, 0, 0.04)",
            border: "1px solid rgba(255, 255, 255, 0.6)",
          }}
        >
          {/* Logo */}
          <Link
            to="/"
            style={{ display: "flex", alignItems: "center", textDecoration: "none", flexShrink: 0 }}
          >
            <img
              src="https://ik.imagekit.io/2xthk8ud4/TA/Fav.png"
              alt="Sistem Pakar Logo"
              style={{ height: "40px", width: "auto" }}
            />
          </Link>

          {/* Desktop Nav */}
          <nav
            className="desktop-nav"
            style={{ display: "flex", gap: "4px", alignItems: "center" }}
          >
            {visibleItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                style={({ isActive }) => ({
                  padding: "6px 14px",
                  borderRadius: "10px",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  textDecoration: "none",
                  transition: "all 0.2s ease",
                  color: isActive ? "#2563eb" : "#475569",
                  background: isActive ? "#eff6ff" : "transparent",
                })}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.classList.contains("active")) {
                    e.currentTarget.style.background = "#f1f5f9";
                    e.currentTarget.style.color = "#0f172a";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.currentTarget.classList.contains("active")) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#475569";
                  }
                }}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Desktop Auth Buttons */}
          <div
            className="desktop-auth"
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            {isAuthenticated ? (
              <>
                {role === "admin" && (
                  <Link to="/admin">
                    <Button variant="outline" size="sm" style={{ cursor: "pointer", borderRadius: "10px" }}>
                      Admin
                    </Button>
                  </Link>
                )}
                {role === "user" && (
                  <Link to="/profile">
                    <Button variant="ghost" size="sm" style={{ cursor: "pointer", borderRadius: "10px" }}>
                      Profil
                    </Button>
                  </Link>
                )}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleLogout}
                  style={{ cursor: "pointer", borderRadius: "10px" }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <Link to="/login">
                <Button
                  size="sm"
                  style={{
                    cursor: "pointer",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #2563eb, #4f46e5)",
                    border: "none",
                    fontWeight: "600",
                  }}
                >
                  Login
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="mobile-hamburger"
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{
              display: "none",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "6px",
              borderRadius: "8px",
              color: "#475569",
              transition: "background 0.2s",
            }}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </header>

        {/* Mobile Dropdown Menu */}
        {mobileOpen && (
          <div
            style={{
              marginTop: "8px",
              borderRadius: "16px",
              padding: "12px",
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
              border: "1px solid rgba(255, 255, 255, 0.6)",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            {visibleItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                onClick={() => setMobileOpen(false)}
                style={({ isActive }) => ({
                  padding: "10px 16px",
                  borderRadius: "10px",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                  textDecoration: "none",
                  transition: "all 0.2s ease",
                  color: isActive ? "#2563eb" : "#475569",
                  background: isActive ? "#eff6ff" : "transparent",
                })}
              >
                {item.label}
              </NavLink>
            ))}

            <div
              style={{
                marginTop: "8px",
                paddingTop: "8px",
                borderTop: "1px solid #e2e8f0",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              {isAuthenticated ? (
                <>
                  {role === "admin" && (
                    <Link to="/admin" onClick={() => setMobileOpen(false)}>
                      <Button variant="outline" className="w-full" style={{ borderRadius: "10px" }}>
                        Admin Dashboard
                      </Button>
                    </Link>
                  )}
                  {role === "user" && (
                    <Link to="/profile" onClick={() => setMobileOpen(false)}>
                      <Button variant="ghost" className="w-full" style={{ borderRadius: "10px" }}>
                        Profil
                      </Button>
                    </Link>
                  )}
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={handleLogout}
                    style={{ borderRadius: "10px" }}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <Link to="/login" onClick={() => setMobileOpen(false)}>
                  <Button
                    className="w-full"
                    style={{
                      borderRadius: "10px",
                      background: "linear-gradient(135deg, #2563eb, #4f46e5)",
                      border: "none",
                      fontWeight: "600",
                    }}
                  >
                    Login
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Responsive CSS */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .desktop-auth {
            display: none !important;
          }
          .mobile-hamburger {
            display: flex !important;
          }
        }
      `}</style>
    </>
  );
}

export default Navbar;
