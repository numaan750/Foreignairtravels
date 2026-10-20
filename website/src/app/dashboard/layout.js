'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import Sidebar from '@/components/dashboard/Sidebar'
import Topbar from '@/components/dashboard/Topbar'
import WelcomePopup from '@/components/dashboard/WelcomePopup'

export default function DashboardLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, authLoading } = useApp()
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
       <WelcomePopup />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="min-w-0 lg:pl-64">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className={`p-4 sm:p-6 lg:p-8 ${pathname === '/dashboard/group-bookings' ? 'pt-0' : ''}`}>{children}</main>
      </div>
    </div>
  )
}