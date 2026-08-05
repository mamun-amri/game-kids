import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { backgroundById, defaultAvatar } from '../lib/catalog';

const NAV = [
  { to: '/dashboard', icon: '🏠', label: 'Beranda' },
  { to: '/games', icon: '🎮', label: 'Game' },
  { to: '/rewards', icon: '🎁', label: 'Hadiah' },
  { to: '/achievements', icon: '🏅', label: 'Lencana' },
  { to: '/parent', icon: '👨‍👩‍👧', label: 'Orang Tua' },
];

export function Layout() {
  const { currentChild, currentChildId } = useApp();
  const location = useLocation();
  const bg = currentChild
    ? backgroundById(currentChild.profile.backgroundId).gradient
    : 'linear-gradient(160deg,#7c3aed,#ec4899)';
  const isGame = location.pathname.startsWith('/play');

  return (
    <div style={{ '--bg-gradient': bg } as React.CSSProperties}>
      {!isGame && (
        <div className="page">
          <div className="topbar">
            <Link to="/" className="brand">
              <span>🧠</span> Focus Kids
            </Link>
            {currentChild ? (
              <Link
                to="/dashboard"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'rgba(255,255,255,0.25)',
                  borderRadius: 999,
                  padding: '6px 14px',
                  color: '#fff',
                  fontWeight: 800,
                }}
              >
                <span style={{ fontSize: 22 }}>
                  {defaultAvatar(currentChild.profile.avatarId).emoji}
                </span>
                {currentChild.profile.name}
              </Link>
            ) : (
              <Link to="/parent" className="btn ghost small">
                👨‍👩‍👧 Orang Tua
              </Link>
            )}
          </div>
          <div className="page-inner">
            <Outlet />
          </div>
        </div>
      )}
      {isGame ? (
        <Outlet />
      ) : (
        currentChildId && (
          <nav className="bottom-nav">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}
              >
                <span className="n-icon">{n.icon}</span>
                {n.label}
              </NavLink>
            ))}
          </nav>
        )
      )}
    </div>
  );
}
