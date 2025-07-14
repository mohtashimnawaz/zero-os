import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { logout, identity } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: '🏠' },
    { name: 'Files', href: '/files', icon: '📁' },
    { name: 'Notes', href: '/notes', icon: '📝' },
    { name: 'Tasks', href: '/tasks', icon: '✅' },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="page">
      <div className="page-wrapper">
        <header className="navbar navbar-expand-md navbar-light d-print-none">
          <div className="container-xl">
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbar-menu">
              <span className="navbar-toggler-icon"></span>
            </button>
            <h1 className="navbar-brand navbar-brand-autodark d-none-navbar-horizontal pe-0 pe-md-3">
              <Link to="/" className="navbar-brand-text">
                🔗 ZeroOS
              </Link>
            </h1>
            <div className="navbar-nav flex-row order-md-last">
              <div className="nav-item dropdown">
                <a href="#" className="nav-link d-flex lh-1 text-reset p-0" data-bs-toggle="dropdown">
                  <span className="avatar avatar-sm">
                    {identity?.getPrincipal().toString().slice(0, 2).toUpperCase() || 'OS'}
                  </span>
                  <div className="d-none d-xl-block ps-2">
                    <div>ZeroOS User</div>
                    <div className="mt-1 small text-muted">
                      {identity?.getPrincipal().toString().slice(0, 8)}...
                    </div>
                  </div>
                </a>
                <div className="dropdown-menu dropdown-menu-end dropdown-menu-arrow">
                  <div className="dropdown-header">
                    <small className="text-muted">Principal ID</small>
                    <div className="font-monospace small">
                      {identity?.getPrincipal().toString()}
                    </div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item" onClick={() => logout()}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="icon dropdown-item-icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                      <path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2"></path>
                      <path d="M7 12h14l-3 -3m0 6l3 -3"></path>
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        <header className="navbar-expand-md">
          <div className="collapse navbar-collapse" id="navbar-menu">
            <div className="navbar navbar-light">
              <div className="container-xl">
                <ul className="navbar-nav">
                  {navigation.map((item) => (
                    <li key={item.name} className="nav-item">
                      <Link
                        to={item.href}
                        className={`nav-link ${isActive(item.href) ? 'active' : ''}`}
                      >
                        <span className="nav-link-icon">
                          {item.icon}
                        </span>
                        <span className="nav-link-title">
                          {item.name}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </header>

        <div className="page-body">
          <div className="container-xl">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
