import {
  FiGrid,
  FiSend,
  FiCalendar,
  FiUser,
  FiCreditCard,
  FiUsers,
} from 'react-icons/fi'

export const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: FiGrid },
    { label: 'Air Line Booking', href: '/dashboard/air-line-booking', icon: FiSend },
    { label: 'Group Bookings', href: '/dashboard/group-bookings', icon: FiUsers },
    { label: 'My Bookings', href: '/dashboard/bookings', icon: FiCalendar },
    { label: 'Bank Account', href: '/dashboard/bank-account', icon: FiCreditCard },
    { label: 'Profile', href: '/dashboard/profile', icon: FiUser },
]

// /dashboard sirf apne exact path par active ho, baqi nested pages par bhi active rahen
export const isActivePath = (href, pathname) =>
    href === '/dashboard'
        ? pathname === href
        : pathname === href || pathname.startsWith(`${href}/`)