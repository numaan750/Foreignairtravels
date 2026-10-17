'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { FiCheckCircle, FiLoader, FiXCircle } from 'react-icons/fi'
import { useApp } from '@/context/AppContext'

const linkButton =
  'inline-flex h-[49px] items-center justify-center rounded-[13px] bg-[linear-gradient(135deg,#ff7442_0%,#ed5621_100%)] px-8 text-[13px] font-bold tracking-[0.025em] text-white shadow-[0_13px_28px_rgba(216,76,25,0.24)] transition hover:-translate-y-0.5'

export default function VerifyEmailStatus() {
  const token = useSearchParams().get('token')
  const { verifyEmail, sendApprovalNotification } = useApp()

  const notificationStarted = useRef(false)
  const [status, setStatus] = useState(token ? 'pending' : 'error')
  const [notificationStatus, setNotificationStatus] = useState('waiting')

  const approveAccount = async () => {
    if (!token || status !== 'pending') return
    setStatus('loading')
    const result = await verifyEmail(token)
    setStatus(result.ok ? 'success' : 'error')
  }

  useEffect(() => {
    if (status !== 'success' || !token || notificationStarted.current) return

    let sendFrame
    const displayDoneFrame = window.requestAnimationFrame(() => {
      sendFrame = window.requestAnimationFrame(async () => {
        notificationStarted.current = true
        setNotificationStatus('sending')
        const result = await sendApprovalNotification(token)
        setNotificationStatus(result.ok ? 'sent' : 'error')
      })
    })

    return () => {
      window.cancelAnimationFrame(displayDoneFrame)
      if (sendFrame !== undefined) window.cancelAnimationFrame(sendFrame)
    }
  }, [status, token, sendApprovalNotification])

  const retryNotification = async () => {
    if (!token || notificationStatus === 'sending') return
    notificationStarted.current = true
    setNotificationStatus('sending')
    const result = await sendApprovalNotification(token)
    setNotificationStatus(result.ok ? 'sent' : 'error')
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#e8e5df] px-4 py-10 text-[#12314e]">
      <section className="w-full max-w-[440px] rounded-[24px] border border-white/85 bg-white/90 px-6 py-10 text-center shadow-[0_30px_80px_rgba(37,53,55,0.17)] sm:rounded-[30px] sm:px-10">
        {status === 'pending' && (
          <>
            <h1 className="text-2xl font-semibold text-[#102f4c]">Approve this account?</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Approving sends a confirmation email to the user and lets them sign in.
            </p>
            <button
              type="button"
              className={`${linkButton} mt-7`}
              onClick={approveAccount}
            >
              Approve account
            </button>
          </>
        )}

        {status === 'loading' && (
          <>
            <FiLoader className="mx-auto size-12 animate-spin text-[#ff6b35]" />
            <h1 className="mt-5 text-2xl font-semibold text-[#102f4c]">Approving account...</h1>
            <p className="mt-2 text-sm text-slate-500">Please wait a moment.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <FiCheckCircle className="mx-auto size-12 text-emerald-600" />
            <h1 className="mt-5 text-2xl font-semibold text-[#102f4c]">Done — account approved</h1>
            <p className="mt-2 text-sm text-slate-500">
              {notificationStatus === 'waiting'
                ? 'Approval is complete. The confirmation email will be sent shortly.'
                : notificationStatus === 'sending'
                  ? 'Sending the confirmation email to the user...'
                  : notificationStatus === 'sent'
                    ? 'The confirmation email has been sent. The user can now sign in.'
                    : 'The account is approved, but the confirmation email could not be sent.'}
            </p>
            {notificationStatus === 'error' ? (
              <button
                type="button"
                className={`${linkButton} mt-7`}
                onClick={retryNotification}
              >
                Retry email
              </button>
            ) : (
              <Link href="/" className={`${linkButton} mt-7`}>
                Done
              </Link>
            )}
          </>
        )}

        {status === 'error' && (
          <>
            <FiXCircle className="mx-auto size-12 text-red-500" />
            <h1 className="mt-5 text-2xl font-semibold text-[#102f4c]">Approval failed</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              This approval link is invalid, expired, or has already been used. Ask the user to resend their approval request if needed.
            </p>
            <Link href="/" className={`${linkButton} mt-7`}>
              Done
            </Link>
          </>
        )}
      </section>
    </main>
  )
}