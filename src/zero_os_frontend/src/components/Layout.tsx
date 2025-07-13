import React from 'react';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { logout } = useAuth();

  return (
    <div className="page">
      <div className="page-wrapper">
        <header className="navbar navbar-expand-md navbar-light d-print-none">
          <div className="container-xl">
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbar-menu">
              <span className="navbar-toggler-icon"></span>
            </button>
            <h1 className="navbar-brand navbar-brand-autodark d-none-navbar-horizontal pe-0 pe-md-3">
              <a href="/">
                ZeroOS
              </a>
            </h1>
            <div className="navbar-nav flex-row order-md-last">
              <div className="d-none d-md-flex">
                <a href="?theme=dark" className="nav-link px-0 hide-theme-dark" title="Enable dark mode">
                  <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                    <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z"></path>
                  </svg>
                </a>
              </div>
              <div className="nav-item dropdown">
                <a href="#" className="nav-link d-flex lh-1 text-reset p-0" data-bs-toggle="dropdown">
                  <span className="avatar avatar-sm">OS</span>
                  <div className="d-none d-xl-block ps-2">
                    <div>ZeroOS User</div>
                    <div className="mt-1 small text-muted">Personal Workspace</div>
                  </div>
                </a>
                <div className="dropdown-menu dropdown-menu-end dropdown-menu-arrow">
                  <a href="#" className="dropdown-item">Status</a>
                  <a href="#" className="dropdown-item">Profile</a>
                  <div className="dropdown-divider"></div>
                  <a href="#" className="dropdown-item">Settings</a>
                  <button className="dropdown-item" onClick={() => logout()}>Logout</button>
                </div>
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
