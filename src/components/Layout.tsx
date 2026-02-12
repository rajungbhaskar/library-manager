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
        <div className="logo-section">
          <div className="logo-icon-bg">
            <ShelfIcon size="1.4em" color="white" />
          </div>
          <span className="brand-text">My-Shelf</span>
        </div>

        <nav className="main-nav">
          <div className="nav-group">
            <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/library" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              <Library size={20} />
              <span>Library</span>
            </NavLink>
            <NavLink to="/insights" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              <PieChart size={20} />
              <span>Insights</span>
            </NavLink>
            <NavLink to="/settings" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              <SettingsIcon size={20} />
              <span>Settings</span>
            </NavLink>
          </div>
        </nav>

        <div className="user-profile-section">
          {isAuthenticated ? (
            <div className="profile-card">
              <div className="avatar">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="user-details">
                <span className="user-name">{user?.name || 'User'}</span>
                <span className="user-role">Premium Member</span>
              </div>
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to sign out?')) {
                    logout();
                  }
                }}
                className="logout-btn"
                title="Sign Out"
              >
                <LogOut size={18} />
                <span className="sr-only">Sign Out</span>
              </button>
            </div>
          ) : (
            <NavLink to="/signin" className="nav-link">
              <LogIn size={20} />
              <span>Sign In</span>
            </NavLink>
          )}
        </div>
      </aside>
      <main className="content">
        <Outlet />
      </main>

      <style>{`
        .layout {
          display: flex;
          min-height: 100vh;
          background-color: #f3f4f6; /* Light gray background for main content area */
        }
        .sidebar {
          width: 260px;
          background-color: #ffffff;
          border-right: 1px solid #e5e7eb;
          padding: 2rem 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 3rem;
        }

        /* Logo Styles */
        .logo-section {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0 0.5rem;
        }
        .logo-icon-bg {
            background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
            width: 40px;
            height: 40px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.3);
        }
        .brand-text {
            font-size: 1.25rem;
            font-weight: 800;
            color: #1e293b;
            font-style: italic;
            letter-spacing: -0.02em;
        }

        /* Nav Styles */
        .main-nav {
            flex: 1;
        }
        .nav-group {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }
        .nav-link {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.875rem 1rem;
          border-radius: 12px;
          color: #64748b; /* Slate 500 */
          font-weight: 500;
          transition: all 0.2s ease;
          text-decoration: none;
        }
        .nav-link:hover {
          background-color: #f8fafc;
          color: #334155;
        }
        .nav-link.active {
          background-color: #eef2ff; /* Indigo 50 */
          color: #4f46e5; /* Indigo 600 */
        }
        .nav-link.active svg {
            stroke-width: 2.5px;
        }

        /* User Profile Styles */
        .user-profile-section {
            margin-top: auto;
        }
        .profile-card {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.75rem;
            background-color: #f8fafc;
            border-radius: 12px;
            border: 1px solid #f1f5f9;
        }
        .avatar {
            width: 40px;
            height: 40px;
            background-color: #fbbf24; /* Amber */
            color: white;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 1.1rem;
        }
        .user-details {
            display: flex;
            flex-direction: column;
            flex: 1;
            overflow: hidden;
        }
        .user-name {
            font-weight: 600;
            font-size: 0.9rem;
            color: #1e293b;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .user-role {
            font-size: 0.7rem;
            color: #64748b;
        }
        .logout-btn {
            padding: 6px;
            color: #94a3b8;
            border-radius: 6px;
            transition: all 0.2s;
        }
        .logout-btn:hover {
            color: #ef4444;
            background-color: #fef2f2;
        }

        .content {
          flex: 1;
          padding: 0; /* Remove padding here, let pages constrain themselves if needed, or pad the container */
          overflow-y: auto;
          background-color: #f9fafb; /* ensure main bg matches */
        }
      `}</style>
    </div>
  );
};

export default Layout;
