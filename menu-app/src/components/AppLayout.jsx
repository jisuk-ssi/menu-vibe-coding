import { NavLink, Outlet } from 'react-router'
import './AppLayout.css'

const navigationItems = [
  { label: '메뉴 목록', to: '/menus?page=1' },
  { label: '메뉴 등록', to: '/menus/new' },
]

function AppLayout() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-inner">
          <NavLink
            className="brand headline1 bold"
            to="/menus?page=1"
            aria-label="메뉴 관리 홈"
          >
            <span className="brand-mark" aria-hidden="true">
              <span />
              <span />
            </span>
            <span>Tableau</span>
          </NavLink>

          <nav className="primary-navigation" aria-label="주요 메뉴">
            {navigationItems.map(({ label, to }) => (
              <NavLink
                className={({ isActive }) =>
                  `navigation-link body2 ${isActive ? 'active bold' : 'medium'}`
                }
                end
                key={to}
                to={to}
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="app-main" aria-label="본문">
        <Outlet />
      </main>

      <footer className="app-footer">
        <div className="footer-inner label2">
          <span>© 2026 Tableau Menu Studio</span>
          <span>메뉴 관리 서비스</span>
        </div>
      </footer>
    </div>
  )
}

export default AppLayout
