'use client'

import { useApp } from '@/context/AppContext'

export default function ProfilePage() {
    const { user } = useApp()

    return (
        <div>
            <h1 className="text-2xl font-bold text-[#003366] sm:text-3xl">Profile</h1>
            <p className="mt-1 text-sm text-slate-600">Your account details.</p>

            <div className="mt-6 space-y-3 rounded-2xl bg-white p-6 text-sm shadow-sm">
                <p>
                    <span className="text-slate-500">Name: </span>
                    <span className="font-medium text-[#003366]">{user?.name}</span>
                </p>
                <p>
                    <span className="text-slate-500">Email: </span>
                    <span className="font-medium text-[#003366]">{user?.email}</span>
                </p>
            </div>
        </div>
    )
}