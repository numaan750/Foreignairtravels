'use client'

import { useState } from 'react'
import { FiEye, FiEyeOff, FiUploadCloud, FiUser } from 'react-icons/fi'
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
    const { user, updateMe, updatePassword, updateCompanyLogo } = useApp()
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [profileMessage, setProfileMessage] = useState('')
    const [passwordMessage, setPasswordMessage] = useState('')
    const [logoMessage, setLogoMessage] = useState('')
    const [profileError, setProfileError] = useState('')
    const [passwordError, setPasswordError] = useState('')
    const [logoError, setLogoError] = useState('')
    const [savingProfile, setSavingProfile] = useState(false)
    const [savingPassword, setSavingPassword] = useState(false)
    const [savingLogo, setSavingLogo] = useState(false)

    const handleProfileSubmit = async (event) => {
        event.preventDefault()
        setProfileMessage('')
        setProfileError('')
        setSavingProfile(true)

        const form = new FormData(event.currentTarget)
        const result = await updateMe({
            name: String(form.get('name') || '').trim(),
            number: String(form.get('number') || '').trim(),
            agencyname: String(form.get('agencyname') || '').trim(),
        })
        if (result.ok) setProfileMessage(result.message || 'Profile changes sent for administrator approval.')
        else setProfileError(result.message || 'Could not submit your profile changes.')

        setSavingProfile(false)
    }

    const handleLogoChange = async (event) => {
        const file = event.target.files?.[0]
        event.target.value = ''
        if (!file) return
        setLogoMessage('')
        setLogoError('')
        if (!file.type.startsWith('image/')) {
            setLogoError('Choose an image file for your company logo.')
            return
        }
        if (file.size > 4 * 1024 * 1024) {
            setLogoError('Company logo must be smaller than 4 MB.')
            return
        }

        setSavingLogo(true)
        const result = await updateCompanyLogo(file)
        if (result.ok) setLogoMessage(result.message || 'Company logo updated successfully.')
        else setLogoError(result.message || 'Could not update your company logo.')
        setSavingLogo(false)
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
            setPasswordMessage(result.message || 'Password change request sent for administrator approval.')
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
        } else {
            setPasswordError(result.message || 'Could not request a password change.')
        }
        setSavingPassword(false)
    }

    const pendingProfileUpdate = user?.pendingProfileUpdate
    const hasPendingChanges = Boolean(pendingProfileUpdate || user?.hasPendingPasswordChange)

    return (
        <div className="mx-auto w-full max-w-full">
            <section className="mt-6 rounded-2xl border-t-2 border-[#ff6b35] bg-white p-5 shadow-sm sm:p-7">
                <h1 className="flex items-center gap-2 text-xl font-semibold text-[#003366]">
                    <FiUser aria-hidden="true" />
                    Profile Update
                </h1>
                <p className="mt-2 border-b border-slate-200 pb-4 text-sm text-slate-500">
                    Update your account details. Name, phone, agency, and password changes require administrator approval.
                </p>

                {hasPendingChanges && (
                    <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                        <p className="font-semibold">Your changes are waiting for administrator approval.</p>
                        {pendingProfileUpdate && (
                            <p className="mt-2 leading-6">
                                Requested name: {pendingProfileUpdate.name || user?.name} · Phone: {pendingProfileUpdate.number || user?.number} · Agency: {pendingProfileUpdate.agencyname || user?.agencyname}
                            </p>
                        )}
                        {user?.hasPendingPasswordChange && <p className="mt-1">A password change is also pending approval.</p>}
                    </div>
                )}

                <form
                    key={`${user?.id || 'profile'}-${pendingProfileUpdate?.requestedAt || ''}`}
                    className="mt-5"
                    onSubmit={handleProfileSubmit}
                >
                    <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
                        <label className="block text-sm font-medium text-[#1f3c54]" htmlFor="profile-name">
                            Name <span className="text-red-500">*</span>
                            <input
                                id="profile-name"
                                className={inputClass}
                                type="text"
                                autoComplete="name"
                                name="name"
                                defaultValue={pendingProfileUpdate?.name || user?.name || ''}
                                required
                            />
                        </label>
                        <label className="block text-sm font-medium text-[#1f3c54]" htmlFor="profile-email">
                            Email <span className="text-red-500">*</span>
                            <input
                                id="profile-email"
                                className={`${inputClass} cursor-not-allowed bg-slate-100`}
                                type="email"
                                value={user?.email || ''}
                                readOnly
                                aria-describedby="profile-email-note"
                            />
                            <span id="profile-email-note" className="mt-1 block text-xs text-slate-500">Email cannot be changed here.</span>
                        </label>
                        <label className="block text-sm font-medium text-[#1f3c54]" htmlFor="profile-number">
                            Phone number <span className="text-red-500">*</span>
                            <input
                                id="profile-number"
                                className={inputClass}
                                type="tel"
                                autoComplete="tel"
                                name="number"
                                defaultValue={pendingProfileUpdate?.number || user?.number || ''}
                                required
                            />
                        </label>
                        <label className="block text-sm font-medium text-[#1f3c54]" htmlFor="profile-agency">
                            Agency name <span className="text-red-500">*</span>
                            <input
                                id="profile-agency"
                                className={inputClass}
                                type="text"
                                name="agencyname"
                                defaultValue={pendingProfileUpdate?.agencyname || user?.agencyname || ''}
                                required
                            />
                        </label>
                        <div className="text-sm font-medium text-[#1f3c54]">
                            Company logo
                            <div className="mt-2 flex min-h-20 items-center gap-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3">
                                {user?.companyLogo ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={user.companyLogo} alt="Current company logo" className="size-16 shrink-0 rounded-lg border border-slate-200 bg-white object-contain p-1" />
                                ) : (
                                    <div className="grid size-16 shrink-0 place-items-center rounded-lg border border-slate-200 bg-white text-slate-400">
                                        <FiUploadCloud aria-hidden="true" className="size-6" />
                                    </div>
                                )}
                                <div className="min-w-0">
                                    <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg bg-[#003366] px-4 text-sm font-semibold text-white transition hover:bg-[#FF6B35] has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60">
                                        <FiUploadCloud aria-hidden="true" />
                                        {savingLogo ? 'Uploading...' : user?.companyLogo ? 'Change logo' : 'Upload logo'}
                                        <input type="file" accept="image/*" className="sr-only" onChange={handleLogoChange} disabled={savingLogo} />
                                    </label>
                                    <p className="mt-1 text-xs font-normal text-slate-500">Image up to 4 MB. Saved immediately; no approval needed.</p>
                                </div>
                            </div>
                            {logoError && <p className="mt-2 text-sm text-red-600" role="alert">{logoError}</p>}
                            {logoMessage && <p className="mt-2 text-sm text-emerald-700" role="status">{logoMessage}</p>}
                        </div>
                    </div>

                    {profileError && <p className="mt-4 text-sm text-red-600" role="alert">{profileError}</p>}
                    {profileMessage && <p className="mt-4 text-sm text-emerald-700" role="status">{profileMessage}</p>}
                    <div className="mt-5 flex justify-end">
                        <button
                            className="h-11 rounded-xl bg-[#ff6b35] px-5 text-sm font-semibold text-white transition hover:bg-[#FF6B35] disabled:cursor-not-allowed disabled:opacity-60"
                            type="submit"
                            disabled={savingProfile}
                        >
                            {savingProfile ? 'Sending...' : 'Submit profile changes'}
                        </button>
                    </div>
                </form>
            </section>

            <section className="mt-5 rounded-2xl bg-white p-5 shadow-sm sm:p-7">
                <h2 className="text-lg font-semibold text-[#003366]">Change password</h2>
                <p className="mt-1 text-sm text-slate-500">Your new password will take effect after administrator approval.</p>

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
                        {savingPassword ? 'Sending...' : 'Request password change'}
                    </button>
                </form>
            </section>
        </div>
    )
}
