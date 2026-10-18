import {
  FiGrid,
  FiMap,
  FiCalendar,
  FiUsers,
  FiMessageSquare,
  FiSettings,
  FiLayers,
  FiSend,
} from "react-icons/fi";

export const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: FiGrid },
  { label: "Packages", href: "/dashboard/packages", icon: FiMap },
  { label: "Services", href: "/dashboard/services", icon: FiLayers },
  { label: "Airlines", href: "/dashboard/airlines", icon: FiSend },
  { label: "Bookings", href: "/dashboard/bookings", icon: FiCalendar },
  { label: "Customers", href: "/dashboard/customers", icon: FiUsers },
  { label: "Inquiries", href: "/dashboard/inquiries", icon: FiMessageSquare },
  { label: "Settings", href: "/dashboard/settings", icon: FiSettings },
];

// /dashboard sirf apne exact path par active ho, baqi nested pages par bhi active rahen
export const isActivePath = (href, pathname) =>
  href === "/dashboard"
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);