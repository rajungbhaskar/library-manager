import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Library, LayoutDashboard, LogIn, LogOut, Settings as SettingsIcon, PieChart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ShelfIcon from './ShelfIcon';

const Layout: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuth();
  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="logo">
          <span className="brand-text">MY-S</span>
          <ShelfIcon size="1.2em" />
          <span className="brand-text">ELF</span>
        </div>
        <nav>
          <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            <LayoutDashboard size={20} />
            Dashboard
          </NavLink>
          <NavLink to="/library" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            <Library size={20} />
            Library
          </NavLink>
          <NavLink to="/insights" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            <PieChart size={20} />
            Insights
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            <SettingsIcon size={20} />
            Settings
          </NavLink>
          {isAuthenticated ? (
            <>
              <div className="user-info">
                <span>Welcome, {user?.name}</span>
              </div>
              <div className="nav-link" onClick={logout} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <LogOut size={20} />
                  <span>Sign Out</span>
                </div>
              </div>
            </>
          ) : (
            <NavLink to="/signin" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <LogIn size={20} />
                <span>Sign In</span>
              </div>
            </NavLink>
          )}
          {/* We might make this a button to open a modal instead of a route later, 
              but for now let's keep it as a route or just a link */}
        </nav>
      </aside>
      <main className="content">
        <Outlet />
      </main>

      <style>{`
        .layout {
          display: flex;
          min-height: 100vh;
        }
        .sidebar {
          width: 250px;
          background-color: var(--color-surface);
          border-right: 1px solid var(--color-border);
          padding: var(--spacing-lg);
          display: flex;
          flex-direction: column;
        }
        .user-info {
            padding: var(--spacing-md);
            margin-bottom: var(--spacing-xs);
            color: var(--color-text);
            font-weight: 500;
            font-size: var(--font-size-sm);
        }
        .logo {
          display: flex;
          align-items: center;
          gap: 2px;
          font-size: 1.8rem;
          font-weight: 900;
          margin-bottom: var(--spacing-xl);
          color: var(--color-text);
          letter-spacing: 1px;
          line-height: 1;
        }
        
        .h-shelf-logo {
            display: flex;
            justify-content: space-between;
            align-items: center;
            height: 1.2em;
            width: 0.9em;
            margin: 0 1px;
        }

        
        .nav-link {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          padding: var(--spacing-md);
          border-radius: var(--radius-md);
          color: var(--color-text-muted);
          transition: all 0.2s;
          margin-bottom: var(--spacing-xs);
        }
        .nav-link:hover {
          background-color: var(--color-background);
          color: var(--color-text);
        }
        .nav-link.active {
          background-color: var(--color-primary);
          color: white;
        }
        .content {
          flex: 1;
          padding: var(--spacing-xl);
          overflow-y: auto;
        }
      `}</style>
    </div>
  );
};

export default Layout;
