import { NavLink, Outlet } from "react-router-dom";

const navItems = [
  { label: "Home", to: "/" },
  { label: "Reviews", to: "/reviews" },
  { label: "Product Details", to: "/details" },
  { label: "Demo", to: "/demo" },
  { label: "Order", to: "/contact" },
  { label: "Admin", to: "/admin" },
];

export function SiteLayout() {
  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="brand-block">
          <NavLink className="brand-mark" to="/">
            StemiGlide
          </NavLink>
          <p className="brand-copy">
            A 3D printed organizer built to keep EKG leads controlled, visible,
            and ready in high-pressure emergency care.
          </p>
        </div>

        <nav className="site-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              className={({ isActive }) =>
                isActive ? "nav-link nav-link-active" : "nav-link"
              }
              to={item.to}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="page-content">
        <Outlet />
      </main>

      <footer className="site-footer">
        <p>Designed for EMTs, first responders, and emergency care teams.</p>
      </footer>
    </div>
  );
}
