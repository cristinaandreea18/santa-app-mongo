import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Sidebar.css'

function Sidebar() {
  const location = useLocation()

  const menuItems = [
    {
      path: '/',
      icon: '📨',
      label: 'Scrisori',
      description: 'Gestionare scrisori'
    },
    {
      path: '/cadouri',
      icon: '🎁', 
      label: 'Cadouri',
      description: 'Urmărire producție'
    },
    {
      path: '/elfi',
      icon: '🧝',
      label: 'Elfi',
      description: 'Echipă de lucru'
    }
  ]

  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-icon">🎄</span>
          <div className="logo-text">
            <h2>Atelierul Moșului</h2>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <div className="nav-content">
              <span className="nav-label">{item.label}</span>
              <span className="nav-description">{item.description}</span>
            </div>
            {isActive(item.path) && <div className="active-indicator"></div>}
          </Link>
        ))}
      </nav>

    </div>
  )
}

export default Sidebar