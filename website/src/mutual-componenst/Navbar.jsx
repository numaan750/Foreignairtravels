'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { FiChevronDown, FiMenu, FiUser, FiX } from 'react-icons/fi'
import {
    FaFolderOpen,
    FaGlobeEurope,
    FaHome,
    FaKaaba,
    FaLayerGroup,
    FaMapMarkedAlt,
    FaPhoneAlt,
    FaPlane,
    FaPlaneArrival,
    FaPlaneDeparture,
    FaThLarge,
    FaUsers,
    FaWhatsapp,
} from 'react-icons/fa'

/* ------------------------------ CONFIG ------------------------------ */

const WHATSAPP_NUMBER = '+966 59 638 2847'
const WHATSAPP_HREF = 'https://wa.me/966596382847'
const PHONE_NUMBER = '0301 7075427'
const PHONE_HREF = 'tel:+9663017075427'

const groupTypes = [
    { label: 'All Types', href: '/group-tickets', icon: FaThLarge },
    { label: 'KSA TO PAK', href: '/group-tickets/ksa-to-pak', icon: FaPlaneDeparture },
    { label: 'KSA ONE WAY', href: '/group-tickets/ksa-one-way', icon: FaPlaneArrival },
    { label: 'UAE ONE WAY', href: '/group-tickets/uae-one-way', icon: FaLayerGroup },
    { label: 'OMAN ONE WAY', href: '/group-tickets/oman-one-way', icon: FaMapMarkedAlt },
    { label: 'UK ONE WAY', href: '/group-tickets/uk-one-way', icon: FaGlobeEurope },
    { label: 'UMRAH', href: '/group-tickets/umrah', icon: FaKaaba },
    { label: 'TBA GROUPS', href: '/group-tickets/tba-groups', icon: FaUsers },
]

const navItems = [
    { label: 'Home', href: '/', icon: FaHome },
    { label: 'Group Tickets', href: '/group-tickets', icon: FaPlane, children: groupTypes },
    { label: 'My Bookings', href: '/my-bookings', icon: FaFolderOpen },
]

/* ---------------------------- DESKTOP DROPDOWN ---------------------------- */

const DesktopDropdown = ({ item, active, pathname }) => {
    const [open, setOpen] = useState(false)
    const [pinnedClosed, setPinnedClosed] = useState(false)
    const ref = useRef(null)
    const Icon = item.icon

    useEffect(() => {
        setOpen(false)
    }, [pathname])

    useEffect(() => {
        if (!open) return
        const onClick = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false)
                setPinnedClosed(true)
            }
        }
        const onKey = (e) => {
            if (e.key === 'Escape') {
                setOpen(false)
                setPinnedClosed(true)
            }
        }
        document.addEventListener('mousedown', onClick)
        document.addEventListener('keydown', onKey)
        return () => {
            document.removeEventListener('mousedown', onClick)
            document.removeEventListener('keydown', onKey)
        }
    }, [open])

    const highlighted = active || open

    return (
        <div
            ref={ref}
            className="relative h-full"
            onMouseEnter={() => {
                if (!pinnedClosed) setOpen(true)
            }}
            onMouseLeave={() => {
                setOpen(false)
                setPinnedClosed(false)
            }}
        >
            <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={open}
                onClick={() => {
                    if (open) {
                        setOpen(false)
                        setPinnedClosed(true)
                    } else {
                        setOpen(true)
                        setPinnedClosed(false)
                    }
                }}
                className={`relative inline-flex h-full items-center gap-2 text-[14px] font-medium transition-colors after:absolute after:inset-x-0 after:bottom-[18px] after:h-[3px] after:origin-left after:rounded-t-full after:bg-[#FF6B35] after:transition-transform after:duration-300 hover:text-[#FF6B35] hover:after:scale-x-100 focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-teal-700 ${highlighted
                    ? 'text-[#FF6B35] after:scale-x-100'
                    : 'text-[#003366] after:scale-x-0'
                    }`}
            >
                <Icon aria-hidden="true" className="size-[16px]" />
                {item.label}
                <FiChevronDown
                    aria-hidden="true"
                    className={`size-[16px] text-slate-400 transition-transform duration-300 ${open ? 'rotate-180' : ''
                        }`}
                />
            </button>

            <div
                role="menu"
                aria-label={item.label}
                className={`absolute left-0 top-full z-50 -mt-3 w-[260px] origin-top pt-6 transition-all duration-200 ${open
                    ? 'visible translate-y-0 opacity-100'
                    : 'invisible -translate-y-2 opacity-0'
                    }`}
            >
                <span
                    aria-hidden="true"
                    className="absolute top-[18px] left-10 size-3 rotate-45 border-l border-t border-slate-200 bg-gray-100"
                />
                <ul className="relative rounded-2xl border border-slate-200 bg-gray-100 p-2 shadow-[0_16px_40px_rgba(15,23,42,0.12)]">
                    {item.children.map(({ label, href, icon: ChildIcon }) => {
                        const current = pathname === href
                        return (
                            <li key={label} role="none">
                                <Link
                                    href={href}
                                    role="menuitem"
                                    tabIndex={open ? 0 : -1}
                                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium uppercase tracking-wide transition-colors hover:bg-white hover:text-[#FF6B35] focus-visible:outline-2 focus-visible:outline-teal-700 ${current ? 'bg-white text-[#FF6B35]' : 'text-[#003366]'
                                        }`}
                                >
                                    <ChildIcon aria-hidden="true" className="size-[16px] shrink-0 text-[#FF6B35]" />
                                    {label}
                                </Link>
                            </li>
                        )
                    })}
                </ul>
            </div>
        </div>
    )
}

/* ---------------------------- MOBILE ACCORDION ---------------------------- */

const MobileAccordion = ({ item, active, pathname, onNavigate }) => {
    const [expanded, setExpanded] = useState(false)
    const Icon = item.icon
    const panelId = 'mobile-group-tickets'

    return (
        <div className="border-b border-slate-100">
            <button
                type="button"
                aria-expanded={expanded}
                aria-controls={panelId}
                onClick={() => setExpanded((v) => !v)}
                className={`flex min-h-[52px] w-full items-center justify-between text-[16px] font-medium transition-colors hover:text-[#FF6B35] focus-visible:outline-2 focus-visible:outline-teal-700 ${active ? 'text-[#FF6B35]' : 'text-[#003366]'
                    }`}
            >
                <span className="flex items-center gap-3">
                    <Icon aria-hidden="true" className="size-[16px] text-[#FF6B35]" />
                    {item.label}
                </span>
                <FiChevronDown
                    aria-hidden="true"
                    className={`size-[18px] text-slate-400 transition-transform duration-300 ${expanded ? 'rotate-180' : ''
                        }`}
                />
            </button>

            <div
                id={panelId}
                aria-hidden={!expanded}
                className={`grid transition-[grid-template-rows,visibility] duration-300 ease-out ${expanded ? 'visible grid-rows-[1fr]' : 'invisible grid-rows-[0fr]'
                    }`}
            >
                <ul className="overflow-hidden">
                    <li className="pb-2">
                        <ul className="space-y-1 rounded-2xl bg-slate-50 p-2">
                            {item.children.map(({ label, href, icon: ChildIcon }) => {
                                const current = pathname === href
                                return (
                                    <li key={label}>
                                        <Link
                                            href={href}
                                            onClick={onNavigate}
                                            className={`flex min-h-[44px] items-center gap-3 rounded-xl px-3 text-[14px] font-medium uppercase tracking-wide transition-colors hover:bg-white hover:text-[#FF6B35] focus-visible:outline-2 focus-visible:outline-teal-700 ${current ? 'bg-white text-[#FF6B35]' : 'text-[#003366]'
                                                }`}
                                        >
                                            <ChildIcon aria-hidden="true" className="size-[15px] shrink-0 text-[#FF6B35]" />
                                            {label}
                                        </Link>
                                    </li>
                                )
                            })}
                        </ul>
                    </li>
                </ul>
            </div>
        </div>
    )
}

/* -------------------------------- NAVBAR -------------------------------- */

const Navbar = () => {
    const pathname = usePathname()
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const pendingHomeScroll = useRef(false)

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8)
        onScroll()
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape') setOpen(false)
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [])

    useEffect(() => {
        setOpen(false)
    }, [pathname])

    const close = () => setOpen(false)
    const handleLogoClick = (event) => {
        if (
            event.button !== 0 ||
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey
        ) {
            close()
            return
        }

        event.preventDefault()
        close()

        if (pathname === '/') {
            window.scrollTo({ top: 0, behavior: 'smooth' })
            return
        }

        pendingHomeScroll.current = true
        router.push('/')
    }
    const isActive = (href) =>
        href === '/' ? pathname === '/' : pathname?.startsWith(href)

    useEffect(() => {
        if (pathname !== '/' || !pendingHomeScroll.current) return

        pendingHomeScroll.current = false
        requestAnimationFrame(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' })
        })
    }, [pathname])

    return (
        <header
            className={`sticky top-0 z-50 border-b bg-white/95 backdrop-blur-md transition-shadow duration-300 ${scrolled
                ? 'border-slate-200 shadow-[0_8px_24px_rgba(15,23,42,0.08)]'
                : 'border-slate-200/80'
                }`}
        >
            <div className="mycontainer flex h-[76px] items-center justify-between gap-4">
                {/* Logo */}
                <Link
                    href="/"
                    onClick={handleLogoClick}
                    aria-label="Foreign Air Travel home"
                    className="flex shrink-0 items-center rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700"
                >
                    <Image
                        src="/FOREIGN-AIR-TRAVEL.png"
                        alt="Foreign Air Travel"
                        width={400}
                        height={120}
                        priority
                        className="h-[56px] w-auto max-w-[200px] object-contain sm:h-[70px] sm:max-w-[240px]"
                    />
                </Link>

                {/* Desktop links */}
                <nav
                    aria-label="Main navigation"
                    className="hidden h-full items-center gap-7 lg:flex xl:gap-10"
                >
                    {navItems.map((item) => {
                        const active = isActive(item.href)
                        const Icon = item.icon

                        if (item.children) {
                            return (
                                <DesktopDropdown
                                    key={item.label}
                                    item={item}
                                    active={active}
                                    pathname={pathname}
                                />
                            )
                        }

                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                aria-current={active ? 'page' : undefined}
                                className={`relative inline-flex h-full items-center gap-2 text-[14px] font-medium transition-colors after:absolute after:inset-x-0 after:bottom-[18px] after:h-[3px] after:origin-left after:rounded-t-full after:bg-[#FF6B35] after:transition-transform after:duration-300 hover:text-[#FF6B35] hover:after:scale-x-100 focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-teal-700 ${active
                                    ? 'text-[#FF6B35] after:scale-x-100'
                                    : 'text-[#003366] after:scale-x-0'
                                    }`}
                            >
                                <Icon aria-hidden="true" className="size-[16px]" />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>

                {/* Desktop right side */}
                <div className="hidden items-center gap-5 lg:flex">
                    <ul className="hidden flex-col gap-1 border-l border-slate-200 pl-5 text-[13px] text-[#003366] xl:flex">
                        <li>
                            <a
                                href={WHATSAPP_HREF}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 transition-colors hover:text-[#FF6B35]"
                            >
                                <FaWhatsapp aria-hidden="true" className="size-[13px] text-[#FF6B35]" />
                                {WHATSAPP_NUMBER}
                            </a>
                        </li>
                        <li>
                            <a
                                href={PHONE_HREF}
                                className="inline-flex items-center gap-2 transition-colors hover:text-[#FF6B35]"
                            >
                                <FaPhoneAlt aria-hidden="true" className="size-[12px] text-[#FF6B35]" />
                                {PHONE_NUMBER}
                            </a>
                        </li>
                    </ul>

                    <Link
                        href="/login"
                        className="inline-flex h-[44px] items-center gap-2 rounded-full bg-[#FF6B35] px-5 text-[13px] font-semibold uppercase tracking-wide text-white shadow-sm shadow-teal-900/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-teal-900 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700"
                    >
                        <FiUser aria-hidden="true" className="size-[15px]" />
                        Login / Register
                    </Link>

                    <a
                        href={WHATSAPP_HREF}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Chat on WhatsApp"
                        className="inline-flex h-[44px] items-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-4 text-[13px] font-semibold text-emerald-700 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-100 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-600"
                    >
                        <FaWhatsapp aria-hidden="true" className="size-[18px]" />
                        <span className="hidden xl:inline">WhatsApp</span>
                    </a>
                </div>

                {/* Mobile toggle */}
                <button
                    type="button"
                    aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
                    aria-expanded={open}
                    aria-controls="mobile-navigation"
                    onClick={() => setOpen((v) => !v)}
                    className="flex size-[44px] shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-800 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 lg:hidden"
                >
                    {open ? (
                        <FiX aria-hidden="true" className="size-[22px]" />
                    ) : (
                        <FiMenu aria-hidden="true" className="size-[22px]" />
                    )}
                </button>
            </div>

            {/* Mobile panel */}
            <div
                id="mobile-navigation"
                aria-hidden={!open}
                className={`absolute inset-x-0 top-full grid transition-[grid-template-rows,visibility] duration-300 ease-out lg:hidden ${open ? 'visible grid-rows-[1fr]' : 'invisible grid-rows-[0fr]'
                    }`}
            >
                <div className="overflow-hidden">
                    <div className="max-h-[calc(100svh-76px)] overflow-y-auto border-t border-slate-100 bg-white shadow-[0_16px_32px_rgba(15,23,42,0.10)]">
                        <nav aria-label="Mobile navigation" className="mycontainer flex flex-col py-2">
                            {navItems.map((item) => {
                                const active = isActive(item.href)
                                const Icon = item.icon

                                if (item.children) {
                                    return (
                                        <MobileAccordion
                                            key={item.label}
                                            item={item}
                                            active={active}
                                            pathname={pathname}
                                            onNavigate={close}
                                        />
                                    )
                                }

                                return (
                                    <Link
                                        key={item.label}
                                        href={item.href}
                                        onClick={close}
                                        aria-current={active ? 'page' : undefined}
                                        className={`flex min-h-[52px] items-center gap-3 border-b border-slate-100 text-[16px] font-medium transition-colors last:border-b-0 hover:text-[#FF6B35] focus-visible:outline-2 focus-visible:outline-teal-700 ${active ? 'text-[#FF6B35]' : 'text-[#003366]'
                                            }`}
                                    >
                                        <Icon aria-hidden="true" className="size-[16px] text-[#FF6B35]" />
                                        {item.label}
                                    </Link>
                                )
                            })}
                        </nav>

                        <div className="mycontainer space-y-4 pb-6 pt-3">
                            <ul className="space-y-3 rounded-2xl bg-slate-50 p-4 text-[14px] leading-[22px] text-slate-600">
                                <li className="flex items-center gap-3">
                                    <FaWhatsapp aria-hidden="true" className="size-[16px] shrink-0 text-[#FF6B35]" />
                                    <a
                                        href={WHATSAPP_HREF}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-medium text-slate-800"
                                    >
                                        {WHATSAPP_NUMBER}
                                    </a>
                                </li>
                                <li className="flex items-center gap-3">
                                    <FaPhoneAlt aria-hidden="true" className="size-[14px] shrink-0 text-[#FF6B35]" />
                                    <a href={PHONE_HREF} className="font-medium text-slate-800">
                                        {PHONE_NUMBER}
                                    </a>
                                </li>
                            </ul>

                            <Link
                                href="/login"
                                onClick={close}
                                className="inline-flex h-[50px] w-full items-center justify-center gap-2 rounded-full bg-[#FF6B35] text-[14px] font-semibold uppercase tracking-wide text-white transition-colors hover:bg-teal-900 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
                            >
                                <FiUser aria-hidden="true" className="size-[16px]" />
                                Login / Register
                            </Link>

                            <a
                                href={WHATSAPP_HREF}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex h-[50px] w-full items-center justify-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 text-[14px] font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
                            >
                                <FaWhatsapp aria-hidden="true" className="size-[18px]" />
                                WhatsApp
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Navbar