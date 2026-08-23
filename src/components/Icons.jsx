function base(props) {
  return {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    width: 18,
    height: 18,
    ...props,
  }
}

export function IconToday(props) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="8" />
      <path d="M8.5 12.3l2.4 2.4 4.8-4.8" />
    </svg>
  )
}

export function IconMonth(props) {
  return (
    <svg {...base(props)}>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M4 9.5h16M8 3v4M16 3v4" />
    </svg>
  )
}

export function IconDashboard(props) {
  return (
    <svg {...base(props)}>
      <path d="M4 20V11M10 20V4M16 20v-6M21 20H3" />
    </svg>
  )
}

export function IconSignOut(props) {
  return (
    <svg {...base(props)}>
      <path d="M9 4H5.5a1.5 1.5 0 00-1.5 1.5v13A1.5 1.5 0 005.5 20H9M16 16l4-4-4-4M20 12H9" />
    </svg>
  )
}

export function IconSun(props) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 2.5v2.5M12 19v2.5M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M2.5 12H5M19 12h2.5M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" />
    </svg>
  )
}

export function IconMoon(props) {
  return (
    <svg {...base(props)}>
      <path d="M20 14.5A8.5 8.5 0 0110 4.2a8.5 8.5 0 109.99 10.3z" />
    </svg>
  )
}

export function IconBell(props) {
  return (
    <svg {...base(props)}>
      <path d="M6 9a6 6 0 1112 0c0 4 1.5 5.5 1.5 5.5H4.5S6 13 6 9z" />
      <path d="M9.5 18a2.5 2.5 0 005 0" />
    </svg>
  )
}
