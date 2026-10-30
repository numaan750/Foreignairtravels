'use client'

import { useEffect, useId, useState } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import {
  FiCheck,
  FiEye,
  FiEyeOff,
  FiLoader,
  FiLock,
  FiMapPin,
  FiMail,
  FiPhone,
  FiUser,
} from 'react-icons/fi'

const getPostLoginPath = () => {
  const returnTo = new URLSearchParams(window.location.search).get('returnTo')
  return returnTo?.startsWith('/dashboard/') && !returnTo.startsWith('//')
    ? returnTo
    : '/dashboard'
}

function Field({ icon: Icon, label, id, ...inputProps }) {
  return (
    <div className="grid min-w-0 gap-2">
      <label className="text-xs font-semibold leading-5 text-[#1f3c54]" htmlFor={id}>
        {label}
      </label>
      <div className="group relative flex items-center">
        <Icon
          aria-hidden="true"
          className="pointer-events-none absolute left-[15px] size-[17px] text-slate-400 transition-colors group-focus-within:text-[#ff6b35]"
        />
        <input
          id={id}
          className="h-[49px] w-full rounded-xl border border-slate-200 bg-white/85 py-0 pr-[15px] pl-[43px] text-[13px] text-[#153750] outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#ff6b35] focus:bg-white focus:ring-4 focus:ring-[#ff6b35]/10"
          {...inputProps}
        />
      </div>
    </div>
  )
}

function PasswordField({ label, id, ...inputProps }) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="grid min-w-0 gap-2">
      <label className="text-xs font-semibold leading-5 text-[#1f3c54]" htmlFor={id}>
        {label}
      </label>
      <div className="group relative flex items-center">
        <FiLock
          aria-hidden="true"
          className="pointer-events-none absolute left-[15px] size-[17px] text-slate-400 transition-colors group-focus-within:text-[#ff6b35]"
        />
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          className="h-[49px] w-full rounded-xl border border-slate-200 bg-white/85 py-0 pr-12 pl-[43px] text-[13px] text-[#153750] outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#ff6b35] focus:bg-white focus:ring-4 focus:ring-[#ff6b35]/10"
          {...inputProps}
        />
        <button
          type="button"
          className="absolute right-2 grid size-9 cursor-pointer place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-[#1e445e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff6b35]"
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          aria-pressed={visible}
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? (
            <FiEyeOff aria-hidden="true" className="size-[17px]" />
          ) : (
            <FiEye aria-hidden="true" className="size-[17px]" />
          )}
        </button>
      </div>
    </div>
  )
}

function CheckBox({ children, id, required = false }) {
  return (
    <label className="inline-flex cursor-pointer items-start gap-[9px] text-xs leading-[1.55] text-slate-500" htmlFor={id}>
      <input id={id} className="peer sr-only" type="checkbox" required={required} />
      <span className="mt-px grid size-[18px] shrink-0 place-items-center rounded-[5px] border border-slate-300 bg-white text-transparent transition peer-checked:border-[#ff6b35] peer-checked:bg-[#ff6b35] peer-checked:text-white peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#ff6b35]/30">
        <FiCheck aria-hidden="true" className="size-[13px] stroke-[3]" />
      </span>
      <span>{children}</span>
    </label>
  )
}

const panelBase =
  '@container w-full min-w-0 rounded-[24px] border border-white/85 bg-white/90 px-5 py-6 shadow-[0_30px_80px_rgba(37,53,55,0.17)] backdrop-blur-2xl transition-all duration-300 sm:rounded-[30px] sm:px-9 sm:py-8 lg:px-11'

const textButton =
  'cursor-pointer border-0 bg-transparent p-0 font-bold text-[#d84c19] transition-colors hover:text-[#003366] hover:underline hover:underline-offset-4 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff6b35]'

const submitButton =
  'group flex h-[51px] w-full cursor-pointer items-center justify-center gap-3 rounded-[13px] border-0 bg-[linear-gradient(135deg,#ff7442_0%,#ed5621_100%)] text-[13px] font-bold tracking-[0.025em] text-white shadow-[0_13px_28px_rgba(216,76,25,0.24)] transition hover:-translate-y-0.5 hover:shadow-[0_17px_30px_rgba(216,76,25,0.29)] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#ff6b35]/35 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70'

export default function AuthPanel() {
  const [mode, setMode] = useState('login')
  const id = useId()
  const isLogin = mode === 'login'

  const router = useRouter()
  const {
    user,
    authLoading,
    login,
    register,
    requestPasswordReset,
    verifyPasswordResetCode,
    resetPassword,
  } = useApp()

  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [forgotOpen, setForgotOpen] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [resetCode, setResetCode] = useState('')
  const [passwordResetToken, setPasswordResetToken] = useState('')
  const [forgotStep, setForgotStep] = useState('email')
  const [forgotError, setForgotError] = useState('')
  const [forgotNotice, setForgotNotice] = useState('')
  const [forgotSubmitting, setForgotSubmitting] = useState(false)

  const resetFeedback = () => {
    setError('')
    setNotice('')
  }

  // Pehle se login ho to dashboard par bhejo
  useEffect(() => {
    if (!authLoading && user) router.replace(getPostLoginPath())
  }, [authLoading, user, router])

  const handleLogin = async (event) => {
    event.preventDefault()
    if (submitting) return

    const form = new FormData(event.currentTarget)
    const email = String(form.get('email')).trim()
    const password = String(form.get('password'))

    resetFeedback()
    setSubmitting(true)

    const result = await login(email, password)

    // Kamyab hone par user set hota hai aur auth effect saved destination kholta hai
    if (!result.ok) {
      setError(result.message)
      if (result.code === 'EMAIL_NOT_VERIFIED') setUnverifiedEmail(email)
      setSubmitting(false)
    }
  }

  const handleSignup = async (event) => {
    event.preventDefault()
    if (submitting) return

    const formElement = event.currentTarget
    const form = new FormData(formElement)
    const name = String(form.get('userName')).trim()
    const agencyname = String(form.get('agencyname')).trim()
    const number = String(form.get('phone')).trim()
    const city = String(form.get('city')).trim()
    const email = String(form.get('email')).trim()
    const password = String(form.get('newPassword'))
    const confirmPassword = String(form.get('confirmPassword'))

    resetFeedback()

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setSubmitting(true)
    const result = await register({ agencyname, name, number, city, email, password })

    if (result.ok) {
      formElement.reset()
      setNotice(
        'Signup request submitted. The admin will review your details, and approve your account. We will email you when you can sign in.'
      )
    } else {
      setError(result.message || 'Could not create your account.')
    }
    setSubmitting(false)
  }

  const handlePasswordResetRequest = async (event) => {
    event.preventDefault()
    if (forgotSubmitting) return

    const email = String(new FormData(event.currentTarget).get('resetEmail')).trim()
    setForgotError('')
    setForgotNotice('')
    setResetCode('')
    setPasswordResetToken('')
    setForgotSubmitting(true)

    const result = await requestPasswordReset(email)
    if (result.ok) {
      setForgotEmail(email)
      setForgotStep('code')
      setForgotNotice(result.message || 'A verification code has been sent to your registered email.')
    } else {
      setForgotError(result.message || 'Could not send a verification code.')
    }
    setForgotSubmitting(false)
  }

  const handlePasswordResetCodeVerification = async (event) => {
    event.preventDefault()
    if (forgotSubmitting) return

    const code = resetCode.trim()
    setForgotError('')
    setForgotNotice('')
    setForgotSubmitting(true)

    const result = await verifyPasswordResetCode(forgotEmail, code)
    if (result.ok) {
      setPasswordResetToken(result.resetToken)
      setForgotStep('password')
      setForgotNotice(result.message || 'Code verified. You can now choose a new password.')
    } else {
      setForgotError(result.message || 'The verification code is invalid or expired.')
    }
    setForgotSubmitting(false)
  }

  const handlePasswordReset = async (event) => {
    event.preventDefault()
    if (forgotSubmitting) return

    const form = new FormData(event.currentTarget)
    const newPassword = String(form.get('resetNewPassword'))
    const confirmPassword = String(form.get('resetConfirmPassword'))

    setForgotError('')
    setForgotNotice('')
    if (newPassword !== confirmPassword) {
      setForgotError('Passwords do not match.')
      return
    }

    setForgotSubmitting(true)
    const result = await resetPassword({
      email: forgotEmail,
      resetToken: passwordResetToken,
      newPassword,
    })
    if (result.ok) {
      setForgotOpen(false)
      setForgotStep('email')
      setResetCode('')
      setPasswordResetToken('')
      setForgotNotice('')
      setNotice('Password reset successfully. You can now sign in.')
    } else {
      setForgotError(result.message || 'Could not reset your password.')
    }
    setForgotSubmitting(false)
  }

  const closeForgotPassword = () => {
    setForgotOpen(false)
    setForgotStep('email')
    setResetCode('')
    setPasswordResetToken('')
    setForgotError('')
    setForgotNotice('')
  }

  const switchMode = (nextMode) => {
    setMode(nextMode)
    closeForgotPassword()
    resetFeedback()
    requestAnimationFrame(() => {
      document.getElementById('auth-heading')?.focus({ preventScroll: true })
    })
  }

  return (
    <main className="relative isolate flex flex-1 flex-col overflow-x-hidden bg-[#e8e5df] text-[#12314e]">
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-20 scale-[1.01] bg-[url('/images/login/login-background-imag.jpg')] bg-cover bg-[position:29%_center] sm:bg-[position:37%_center] lg:bg-center"
      />
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10 bg-[linear-gradient(180deg,rgba(241,238,232,0.44),rgba(241,238,232,0.66))] sm:bg-[linear-gradient(90deg,rgba(236,233,227,0.22),rgba(236,233,227,0.58))] lg:bg-[linear-gradient(90deg,rgba(244,242,237,0.06)_0%,rgba(244,242,237,0)_44%,rgba(239,237,232,0.34)_100%)]"
      />

      <div className="mycontainer grid flex-1 grid-cols-1 items-center justify-items-center py-[18px] sm:py-6 lg:grid-cols-2 lg:justify-items-stretch lg:py-9">
        <section
          className={`${panelBase} ${isLogin ? 'max-w-[474px]' : 'max-w-[560px]'} lg:col-start-2 lg:justify-self-end`}
          aria-label="Account access"
        >
          <div className="flex items-start justify-between gap-3 sm:items-center sm:gap-5">
            <span className="inline-flex items-center gap-2 text-[10px] leading-5 font-bold tracking-[0.105em] text-[#58705c] uppercase sm:text-[11px]">
              <span className="size-[7px] rounded-full bg-[#ff6b35] shadow-[0_0_0_5px_rgba(255,107,53,0.10)]" />
              {isLogin ? 'Welcome back' : 'Join our community'}
            </span>
            <p className="max-w-[140px] text-right text-[11px] leading-[1.45] text-slate-500 sm:max-w-none sm:text-xs">
              {isLogin ? 'New here?' : 'Already a member?'}{' '}
              <button
                type="button"
                className={textButton}
                onClick={() => switchMode(isLogin ? 'signup' : 'login')}
              >
                {isLogin ? 'Create account' : 'Sign in'}
              </button>
            </p>
          </div>

          <header className={isLogin ? 'my-5 sm:my-7' : 'my-5'}>
            <h1
              id="auth-heading"
              className="text-[36px] leading-[1.04] font-semibold tracking-[-0.045em] text-[#102f4c] outline-none sm:text-[42px] lg:text-5xl"
              tabIndex="-1"
            >
              {isLogin ? 'Sign in' : 'Create account'}
            </h1>
            <p className="mt-[11px] max-w-[390px] text-xs leading-[1.65] text-slate-500 sm:text-[13px]">
              {isLogin
                ? 'Access your bookings and manage every journey in one place.'
                : 'A few details and you’ll be ready to plan your next journey.'}
            </p>
          </header>

          {error && (
            <div
              role="alert"
              className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs leading-5 text-red-700"
            >
              {error}
            </div>
          )}

          {notice && (
            <div
              role="status"
              className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs leading-5 text-emerald-800"
            >
              {notice}
            </div>
          )}

          {isLogin ? (
            <form
              key="login"
              className="grid gap-[18px]"
              onSubmit={handleLogin}
            >
              <Field
                id={`${id}-login-email`}
                icon={FiMail}
                label="Email address"
                type="email"
                name="email"
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
              <PasswordField
                id={`${id}-login-password`}
                label="Password"
                name="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />

              <div className="flex items-start justify-between gap-4 sm:items-center">
                <CheckBox id={`${id}-remember`}>Remember me</CheckBox>
                <button
                  type="button"
                  className={`${textButton} shrink-0 text-xs`}
                  onClick={() => {
                    setForgotError('')
                    setForgotNotice('')
                    setForgotStep('email')
                    setForgotOpen(true)
                  }}
                >
                  Forgot password?
                </button>
              </div>

              <button className={submitButton} type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <FiLoader aria-hidden="true" className="animate-spin text-lg" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <span aria-hidden="true" className="text-lg leading-none transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <form
              key="signup"
              className="grid gap-[15px] sm:gap-[13px]"
              onSubmit={handleSignup}
            >
              <Field
                id={`${id}-user-name`}
                icon={FiUser}
                label="User name"
                type="text"
                name="userName"
                placeholder="Your user name"
                autoComplete="username"
                required
              />

              <Field
                id={`${id}-agency-name`}
                icon={FiUser}
                label="Agency name"
                type="text"
                name="agencyname"
                placeholder="Your agency name"
                autoComplete="organization"
                required
              />

              <Field
                id={`${id}-signup-email`}
                icon={FiMail}
                label="Email address"
                type="email"
                name="email"
                placeholder="you@example.com"
                autoComplete="email"
                required
              />

              <Field
                id={`${id}-phone`}
                icon={FiPhone}
                label="Phone number"
                type="tel"
                name="phone"
                placeholder="+92 300 1234567"
                autoComplete="tel"
                required
              />

              <Field
                id={`${id}-city`}
                icon={FiMapPin}
                label="City"
                type="text"
                name="city"
                placeholder="Your city"
                autoComplete="address-level2"
                required
              />

              <div className="grid gap-[15px] @md:grid-cols-2 @md:gap-3">
                <PasswordField
                  id={`${id}-signup-password`}
                  label="Password"
                  name="newPassword"
                  placeholder="8+ characters"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
                <PasswordField
                  id={`${id}-confirm-password`}
                  label="Confirm password"
                  name="confirmPassword"
                  placeholder="Repeat password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </div>

              <CheckBox id={`${id}-terms`} required>
                I agree to the <span className="font-bold text-[#d84c19]">Terms</span> and{' '}
                <span className="font-bold text-[#d84c19]">Privacy Policy</span>.
              </CheckBox>

              <button className={submitButton} type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <FiLoader aria-hidden="true" className="animate-spin text-lg" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account
                    <span aria-hidden="true" className="text-lg leading-none transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </>
                )}
              </button>
            </form>
          )}

          <p className="mt-[17px] flex items-center justify-center gap-[7px] text-center text-[11px] leading-5 text-slate-400">
            <FiLock aria-hidden="true" className="size-[13px] text-[#678069]" />
            Your details stay private and secure.
          </p>
        </section>
      </div>

      {forgotOpen && typeof document !== 'undefined' && createPortal((
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto overscroll-contain bg-slate-950/55 p-3 sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeForgotPassword()
          }}
        >
          <section
            aria-labelledby="forgot-password-title"
            aria-modal="true"
            className="my-auto max-h-[calc(100dvh-1.5rem)] w-full max-w-md overflow-y-auto overscroll-contain rounded-2xl bg-white p-5 shadow-2xl sm:max-h-[calc(100dvh-2.5rem)] sm:p-7"
            role="dialog"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="forgot-password-title" className="text-xl font-semibold text-[#102f4c]">
                  Reset your password
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  {forgotStep === 'email'
                    ? 'Enter your approved account email and we will send you a verification code.'
                    : forgotStep === 'code'
                      ? `Enter the verification code sent to ${forgotEmail}.`
                      : 'Your code is verified. Choose a new password.'}
                </p>
              </div>
              <button
                type="button"
                aria-label="Close password reset"
                className="grid size-9 shrink-0 place-items-center rounded-lg text-xl text-slate-500 hover:bg-slate-100"
                onClick={closeForgotPassword}
              >
                ×
              </button>
            </div>

            {forgotError && (
              <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700" role="alert">
                {forgotError}
              </p>
            )}
            {forgotNotice && (
              <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-5 text-emerald-800" role="status">
                {forgotNotice}
              </p>
            )}

            {forgotStep === 'email' ? (
              <form className="mt-5 grid gap-4" onSubmit={handlePasswordResetRequest}>
                <Field
                  id={`${id}-reset-email`}
                  icon={FiMail}
                  label="Account email"
                  type="email"
                  name="resetEmail"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
                <button className={submitButton} type="submit" disabled={forgotSubmitting}>
                  {forgotSubmitting ? 'Sending code...' : 'Send verification code'}
                </button>
              </form>
            ) : forgotStep === 'code' ? (
              <form className="mt-5 grid gap-4" onSubmit={handlePasswordResetCodeVerification}>
                <Field
                  id={`${id}-reset-code`}
                  icon={FiLock}
                  label="6-digit verification code"
                  type="tel"
                  name="verificationCode"
                  placeholder="Enter code"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  autoComplete="one-time-code"
                  value={resetCode}
                  onChange={(event) => setResetCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                />
                <button className={submitButton} type="submit" disabled={forgotSubmitting || resetCode.length !== 6}>
                  {forgotSubmitting ? 'Verifying code...' : 'Verify code'}
                </button>
                <button
                  className={`${textButton} justify-self-center text-xs`}
                  type="button"
                  disabled={forgotSubmitting}
                  onClick={() => {
                    setForgotError('')
                    setForgotNotice('')
                    setResetCode('')
                    setPasswordResetToken('')
                    setForgotStep('email')
                  }}
                >
                  Use a different email
                </button>
              </form>
            ) : (
              <form className="mt-5 grid gap-4" onSubmit={handlePasswordReset}>
                <PasswordField
                  id={`${id}-reset-new-password`}
                  label="New password"
                  name="resetNewPassword"
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
                <PasswordField
                  id={`${id}-reset-confirm-password`}
                  label="Confirm new password"
                  name="resetConfirmPassword"
                  placeholder="Enter it again"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
                <button className={submitButton} type="submit" disabled={forgotSubmitting}>
                  {forgotSubmitting ? 'Updating password...' : 'Reset password'}
                </button>
              </form>
            )}
          </section>
        </div>
      ), document.body)}
    </main>
  )
}
