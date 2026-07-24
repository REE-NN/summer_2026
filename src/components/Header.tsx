import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/', label: 'Главная' },
  { to: '/stories', label: 'Истории' },
  { to: '/children', label: 'Детское творчество' },
  { to: '/gallery', label: 'Галерея' },
  { to: '/about', label: 'О проекте' },
]

function Header() {
  return (
    <header className="header">
      <div className="header__inner">
        <NavLink to="/" className="header__logo">
          Задворка 2026
        </NavLink>
        <nav className="header__nav" aria-label="Основная навигация">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `header__link${isActive ? ' header__link--active' : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}

export default Header
