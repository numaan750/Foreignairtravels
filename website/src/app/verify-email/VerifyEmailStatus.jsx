'use client'

import Link from 'next/link'

const linkButton =
  'inline-flex h-[49px] items-center justify-center rounded-[13px] bg-[linear-gradient(135deg,#ff7442_0%,#ed5621_100%)] px-8 text-[13px] font-bold tracking-[0.025em] text-white shadow-[0_13px_28px_rgba(216,76,25,0.24)] transition hover:-translate-y-0.5'

export default function VerifyEmailStatus() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#e8e5df] px-4 py-10 text-[#12314e]">
      <section className="w-full max-w-[440px] rounded-[24px] border border-white/85 bg-white/90 px-6 py-10 text-center shadow-[0_30px_80px_rgba(37,53,55,0.17)] sm:rounded-[30px] sm:px-10">
        <h1 className="text-2xl font-semibold text-[#102f4c]">Admin approval required</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Account approvals are handled in the admin panel. You will receive an email after your account is approved.
        </p>
        <Link href="/login" className={`${linkButton} mt-7`}>
          Return to sign in
        </Link>
      </section>
    </main>
  )
}
