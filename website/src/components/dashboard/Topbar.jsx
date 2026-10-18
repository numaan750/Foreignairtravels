'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  FiCalendar,
  FiChevronDown,
  FiHome,
  FiLogOut,
  FiMenu,
  FiUser,
} from 'react-icons/fi'
import { useApp } from '@/context/AppContext'
import { navItems, isActivePath } from '@/config/navItems'

export default function Topbar({ onMenuClick }) {
  const pathname = usePathname()
  const { user, logout } = useApp()
  const [accountOpen, setAccountOpen] = useState(false)
  const accountRef = useRef(null)

  const current = navItems.find((item) => isActivePath(item.href, pathname))
  const displayName = user?.name?.trim() || user?.email?.split('@')[0] || 'Traveler'

  useEffect(() => {
    if (!accountOpen) return

    const onPointerDown = (event) => {
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setAccountOpen(false)
      }
    }
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setAccountOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [accountOpen])

  const closeAccountMenu = () => setAccountOpen(false)
  const handleLogout = () => {
    closeAccountMenu()
    logout()
  }

  return (
    <header className="sticky top-0 z-20 border-b border-[#003366]/10 bg-white/95 backdrop-blur-md">
      <div className="flex min-h-16 items-center gap-3 px-4 py-2 sm:px-6 lg:min-h-[72px] lg:px-8">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-xl text-[22px] text-[#003366] transition-colors hover:bg-[#e8e5df] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF6B35] lg:hidden"
        >
          <FiMenu aria-hidden="true" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span aria-hidden="true" className="hidden h-5 w-1 rounded-full bg-[#FF6B35] sm:block" />
            <h1 className="truncate text-base font-semibold tracking-[-0.01em] text-[#003366] sm:text-lg">
              {current?.label || 'Dashboard'}
            </h1>
          </div>
          <p className="mt-0.5 hidden truncate text-xs text-[#12314e]/60 sm:block">
            Manage your bookings and travel account
          </p>
        </div>

        <div ref={accountRef} className="relative ml-auto shrink-0">
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={accountOpen}
            aria-controls="account-menu"
            onClick={() => setAccountOpen((open) => !open)}
            className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-2 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF6B35] sm:gap-3 sm:pr-3 ${
              accountOpen
                ? 'border-[#FF6B35]/35 bg-[#e8e5df]'
                : 'border-[#003366]/10 bg-white hover:border-[#FF6B35]/35 hover:bg-[#e8e5df]/70'
            }`}
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#FF6B35] text-base text-white shadow-[0_5px_14px_rgba(255,107,53,0.25)]">
              <FiUser aria-hidden="true" />
            </span>

            <span className="hidden min-w-0 text-left sm:block">
              <span className="block max-w-36 truncate text-xs font-semibold text-[#003366]">
                {displayName}
              </span>
              <span className="block text-[10px] text-[#12314e]/55">My account</span>
            </span>

            <FiChevronDown
              aria-hidden="true"
              className={`hidden text-sm text-[#003366]/60 transition-transform duration-200 sm:block ${
                accountOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          <div
            id="account-menu"
            role="menu"
            aria-label="Account menu"
            className={`absolute right-0 top-[calc(100%+10px)] w-[min(19rem,calc(100vw-2rem))] origin-top-right overflow-hidden rounded-2xl border border-[#003366]/10 bg-white shadow-[0_18px_45px_rgba(0,51,102,0.16)] transition-all duration-200 ${
              accountOpen
                ? 'visible translate-y-0 scale-100 opacity-100'
                : 'invisible -translate-y-1 scale-[0.98] opacity-0'
            }`}
          >
            <div className="border-b border-[#003366]/10 bg-[#e8e5df]/55 px-4 py-3.5">
              <div className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#003366] text-lg text-white">
                  <FiUser aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#003366]">{displayName}</p>
                  <p className="mt-0.5 truncate text-xs text-[#12314e]/60">{user?.email}</p>
                </div>
              </div>
            </div>

            <div className="p-2">
              <Link
                href="/dashboard/profile"
                role="menuitem"
                tabIndex={accountOpen ? 0 : -1}
                onClick={closeAccountMenu}
                className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-[#003366] transition-colors hover:bg-[#e8e5df] focus-visible:outline-2 focus-visible:outline-[#FF6B35]"
              >
                <FiUser aria-hidden="true" className="text-base text-[#FF6B35]" />
                My Profile
              </Link>
              <Link
                href="/dashboard/bookings"
                role="menuitem"
                tabIndex={accountOpen ? 0 : -1}
                onClick={closeAccountMenu}
                className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-[#003366] transition-colors hover:bg-[#e8e5df] focus-visible:outline-2 focus-visible:outline-[#FF6B35]"
              >
                <FiCalendar aria-hidden="true" className="text-base text-[#FF6B35]" />
                My Bookings
              </Link>
              <Link
                href="/"
                role="menuitem"
                tabIndex={accountOpen ? 0 : -1}
                onClick={closeAccountMenu}
                className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-[#003366] transition-colors hover:bg-[#e8e5df] focus-visible:outline-2 focus-visible:outline-[#FF6B35]"
              >
                <FiHome aria-hidden="true" className="text-base text-[#FF6B35]" />
                Main Website
              </Link>
            </div>

            <div className="border-t border-[#003366]/10 p-2">
              <button
                type="button"
                role="menuitem"
                tabIndex={accountOpen ? 0 : -1}
                onClick={handleLogout}
                className="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-xl px-3 text-sm font-semibold text-[#FF6B35] transition-colors hover:bg-[#FF6B35]/10 focus-visible:outline-2 focus-visible:outline-[#FF6B35]"
              >
                <FiLogOut aria-hidden="true" className="text-base" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
