'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FiLogOut } from 'react-icons/fi'
import { useApp } from '@/context/AppContext'

export default function DashboardLayout({ children }) {
  const router = useRouter()
  const { user, authLoading, logout } = useApp()

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login')
  }, [authLoading, user, router])

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#e8e5df] text-sm text-[#12314e]">
        Loading...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#e8e5df] text-[#12314e]">
      <header className="sticky top-0 z-20 border-b border-[#003366]/10 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/" className="truncate text-base font-bold text-[#003366] sm:text-lg">
            Foreign Air Travel
          </Link>

          <div className="flex min-w-0 items-center gap-3">
            <span className="hidden max-w-[220px] truncate text-sm text-slate-600 sm:block">
              {user.email}
            </span>
            <button
              onClick={logout}
              className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#003366] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#ff6b35]"
            >
              <FiLogOut className="text-base" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  )
}