'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FiArrowUpRight, FiX } from 'react-icons/fi'
import { navItems, isActivePath } from '@/config/navItems'

export default function Sidebar({ open, onClose }) {
  const pathname = usePathname()

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close navigation menu"
          className="fixed inset-0 z-30 cursor-default bg-[#003366]/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        aria-label="Dashboard navigation"
        className={`fixed inset-y-0 left-0 z-40 flex w-72 max-w-[85vw] flex-col overflow-hidden bg-[#003366] text-white shadow-[12px_0_40px_rgba(0,51,102,0.18)] transition-transform duration-300 ease-out lg:w-64 lg:max-w-none lg:translate-x-0 lg:shadow-none ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="shrink-0 border-b border-white/10 px-4 pb-5 pt-4">
          <div className="flex items-start gap-3">
            <Link
              href="/"
              onClick={onClose}
              aria-label="Foreign Air Travel home"
              className="flex min-h-[72px] flex-1 items-center justify-center rounded-2xl bg-white px-4 shadow-[0_10px_26px_rgba(0,51,102,0.18)] transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF6B35]"
            >
              <Image
                src="/FOREIGN-AIR-TRAVEL.png"
                alt="Foreign Air Travel"
                width={450}
                height={200}
                preload
                className="h-auto w-full max-w-[176px] object-contain"
              />
            </Link>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close menu"
              className="mt-1 flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-xl text-xl text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF6B35] lg:hidden"
            >
              <FiX aria-hidden="true" />
            </button>
          </div>

          <div className="mt-4 px-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#FF6B35]">
              Traveler portal
            </p>
            <p className="mt-1 text-sm text-white/65">Everything for your next journey.</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/45">
            My account
          </p>

          <div className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActivePath(item.href, pathname)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  aria-current={active ? 'page' : undefined}
                  className={`group relative flex min-h-12 items-center gap-3 overflow-hidden rounded-xl px-3.5 text-sm font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF6B35] ${
                    active
                      ? 'bg-[#FF6B35] text-white shadow-[0_10px_24px_rgba(255,107,53,0.22)]'
                      : 'text-white/75 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span
                    className={`flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
                      active ? 'bg-white/15' : 'bg-white/5 group-hover:bg-white/10'
                    }`}
                  >
                    <Icon aria-hidden="true" className="text-[17px]" />
                  </span>
                  <span className="truncate">{item.label}</span>
                  {active && (
                    <span
                      aria-hidden="true"
                      className="ml-auto size-1.5 shrink-0 rounded-full bg-white"
                    />
                  )}
                </Link>
              )
            })}
          </div>
        </nav>

        <div className="shrink-0 border-t border-white/10 p-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <p className="px-1 text-xs font-semibold text-white">Planning another trip?</p>
            <p className="mt-1 px-1 text-[11px] leading-4 text-white/55">
              Explore destinations and travel services.
            </p>
            <Link
              href="/"
              onClick={onClose}
              className="mt-3 flex min-h-10 items-center justify-between rounded-xl bg-white px-3 text-xs font-semibold text-[#003366] transition-colors hover:bg-[#FF6B35] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF6B35]"
            >
              Visit main website
              <FiArrowUpRight aria-hidden="true" className="text-base" />
            </Link>
          </div>
        </div>
      </aside>
    </>
  )
}
