import { FiGrid, FiCalendar, FiUser, FiCreditCard } from 'react-icons/fi'

export const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: FiGrid },
    { label: 'Air Line Booking', href: '/dashboard/air-line-booking', icon: FiCreditCard },
    { label: 'My Bookings', href: '/dashboard/bookings', icon: FiCalendar },
    { label: 'Profile', href: '/dashboard/profile', icon: FiUser },
    { label: 'Bank Account', href: '/dashboard/bank-account', icon: FiCreditCard },
    { label: 'Change Password', href: '/dashboard/change-password', icon: FiCreditCard },
]

// /dashboard sirf apne exact path par active ho, baqi nested pages par bhi active rahen
export const isActivePath = (href, pathname) =>
    href === '/dashboard'
        ? pathname === href
        : pathname === href || pathname.startsWith(`${href}/`)