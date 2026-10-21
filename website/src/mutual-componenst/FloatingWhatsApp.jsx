'use client'

import { useEffect, useState } from 'react'
import { FaWhatsapp } from 'react-icons/fa'

const FloatingWhatsApp = () => {
  const [showMessage, setShowMessage] = useState(true)

  useEffect(() => {
    const timeout = window.setTimeout(() => setShowMessage(false), 5000)
    return () => window.clearTimeout(timeout)
  }, [])

  return (
    <a
      href="https://wa.me/966596382847"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Message us on WhatsApp"
      className="group fixed bottom-5 left-5 z-[70] inline-flex items-center gap-5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#128C7E]"
    >
      <span className="inline-flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform group-hover:scale-105 group-hover:bg-[#20BD5A] group-active:scale-95">
        <FaWhatsapp aria-hidden="true" className="size-8" />
      </span>
      <span
        className={`relative rounded-lg border border-slate-100 bg-white px-3 py-1 text-sm font-medium text-slate-800 shadow-lg transition-all before:absolute before:left-[-5px] before:top-1/2 before:size-2 before:-translate-y-1/2 before:rotate-45 before:border-b before:border-l before:border-slate-100 before:bg-white before:content-[''] group-hover:-translate-y-0.5 group-hover:opacity-100 group-focus-visible:opacity-100 ${
          showMessage ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-1 opacity-0'
        }`}
      >
        Message us
      </span>
    </a>
  )
}

export default FloatingWhatsApp
