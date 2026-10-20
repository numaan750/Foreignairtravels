'use client'

import { useState } from 'react'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import { useApp } from '@/context/AppContext'

const inputClass =
    'mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 text-sm text-[#153750] outline-none transition placeholder:text-slate-400 focus:border-[#ff6b35] focus:ring-4 focus:ring-[#ff6b35]/10'

function PasswordInput({ id, value, onChange, autoComplete, minLength, required }) {
    const [visible, setVisible] = useState(false)

    return (
        <div className="relative">
            <input
                id={id}
                className={`${inputClass} pr-12`}
                type={visible ? 'text' : 'password'}
                autoComplete={autoComplete}
                minLength={minLength}
                value={value}
                onChange={onChange}
                required={required}
            />
            <button
                type="button"
                className="absolute right-2 top-[calc(50%+4px)] grid size-9 -translate-y-1/2 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-[#1e445e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff6b35]"
                aria-label={visible ? 'Hide password' : 'Show password'}
                aria-pressed={visible}
                onClick={() => setVisible((current) => !current)}
            >
                {visible ? <FiEyeOff aria-hidden="true" className="size-[17px]" /> : <FiEye aria-hidden="true" className="size-[17px]" />}
            </button>
        </div>
    )
}

export default function ProfilePage() {
    const { user, updateMe, updatePassword } = useApp()
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [profileMessage, setProfileMessage] = useState('')
    const [passwordMessage, setPasswordMessage] = useState('')
    const [profileError, setProfileError] = useState('')
    const [passwordError, setPasswordError] = useState('')
    const [savingProfile, setSavingProfile] = useState(false)
    const [savingPassword, setSavingPassword] = useState(false)

    const handleProfileSubmit = async (event) => {
        event.preventDefault()
        setProfileMessage('')
        setProfileError('')
        setSavingProfile(true)

        const form = new FormData(event.currentTarget)
        const name = String(form.get('name') || '').trim()
        const result = await updateMe({ name })
        if (result.ok) setProfileMessage(result.message || 'Name updated successfully.')
        else setProfileError(result.message || 'Could not update your name.')

        setSavingProfile(false)
    }

    const handlePasswordSubmit = async (event) => {
        event.preventDefault()
        setPasswordMessage('')
        setPasswordError('')

        if (newPassword !== confirmPassword) {
            setPasswordError('New password and confirmation do not match.')
            return
        }

        setSavingPassword(true)
        const result = await updatePassword(currentPassword, newPassword)
        if (result.ok) {
            setPasswordMessage(result.message || 'Password updated successfully.')
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
        } else {
            setPasswordError(result.message || 'Could not update your password.')
        }
        setSavingPassword(false)
    }

    return (
        <div className="mx-auto w-full max-w-full">
            {/* <h1 className="text-2xl font-bold text-[#003366] sm:text-3xl">Profile</h1>
            <p className="mt-1 text-sm text-slate-600">Manage your account details and password.</p> */}

            <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm sm:p-7">
                <h2 className="text-lg font-semibold text-[#003366]">Account details</h2>
                <p className="mt-1 text-sm text-slate-500">Your registered email address cannot be changed here.</p>
                <p className="mt-5 text-sm text-slate-600">
                    Email: <span className="font-medium text-[#003366]">{user?.email || '—'}</span>
                </p>

                <form key={`${user?.id || 'profile'}-${user?.name || ''}`} className="mt-5" onSubmit={handleProfileSubmit}>
                    <label className="block text-sm font-medium text-[#1f3c54]" htmlFor="profile-name">
                        Name
                    </label>
                    <input
                        id="profile-name"
                        className={inputClass}
                        type="text"
                        autoComplete="name"
                        name="name"
                        defaultValue={user?.name || ''}
                        required
                    />

                    {profileError && <p className="mt-3 text-sm text-red-600" role="alert">{profileError}</p>}
                    {profileMessage && <p className="mt-3 text-sm text-emerald-700" role="status">{profileMessage}</p>}

                    <button
                        className="mt-5 h-11 rounded-xl bg-[#ff6b35] px-5 text-sm font-semibold text-white transition hover:bg-[#e95724] disabled:cursor-not-allowed disabled:opacity-60"
                        type="submit"
                        disabled={savingProfile}
                    >
                        {savingProfile ? 'Saving...' : 'Save name'}
                    </button>
                </form>
            </section>

            <section className="mt-5 rounded-2xl bg-white p-5 shadow-sm sm:p-7">
                <h2 className="text-lg font-semibold text-[#003366]">Change password</h2>
                <p className="mt-1 text-sm text-slate-500">Enter your current password to set a new one.</p>

                <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={handlePasswordSubmit}>
                    <label className="block text-sm font-medium text-[#1f3c54] sm:col-span-2" htmlFor="current-password">
                        Current password
                        <PasswordInput
                            id="current-password"
                            autoComplete="current-password"
                            value={currentPassword}
                            onChange={(event) => setCurrentPassword(event.target.value)}
                            required
                        />
                    </label>
                    <label className="block text-sm font-medium text-[#1f3c54]" htmlFor="new-password">
                        New password
                        <PasswordInput
                            id="new-password"
                            autoComplete="new-password"
                            minLength={8}
                            value={newPassword}
                            onChange={(event) => setNewPassword(event.target.value)}
                            required
                        />
                    </label>
                    <label className="block text-sm font-medium text-[#1f3c54]" htmlFor="confirm-new-password">
                        Confirm new password
                        <PasswordInput
                            id="confirm-new-password"
                            autoComplete="new-password"
                            minLength={8}
                            value={confirmPassword}
                            onChange={(event) => setConfirmPassword(event.target.value)}
                            required
                        />
                    </label>

                    {(passwordError || passwordMessage) && (
                        <p
                            className={`rounded-xl border px-4 py-3 text-sm leading-5 sm:col-span-2 ${passwordError ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}
                            role={passwordError ? 'alert' : 'status'}
                        >
                            {passwordError || passwordMessage}
                        </p>
                    )}

                    <button
                        className="h-11 w-fit rounded-xl bg-[#ff6b35] px-5 text-sm font-semibold text-white transition hover:bg-[#e95724] disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2"
                        type="submit"
                        disabled={savingPassword}
                    >
                        {savingPassword ? 'Updating...' : 'Change password'}
                    </button>
                </form>
            </section>
        </div>
    )
}
