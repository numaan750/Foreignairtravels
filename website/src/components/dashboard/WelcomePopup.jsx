'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { FiX } from 'react-icons/fi'
import { DASHBOARD_POPUP_SESSION_KEY, useApp } from '@/context/AppContext'

const SLIDE_MS = 3000

export default function WelcomePopup() {
    const { getPopupImages } = useApp()
    const [images, setImages] = useState([])
    const [open, setOpen] = useState(false)
    const [current, setCurrent] = useState(0)
    const didCheckSession = useRef(false)

    const close = () => setOpen(false)

    // Images load karo, hon to popup kholo
    useEffect(() => {
        if (didCheckSession.current || sessionStorage.getItem(DASHBOARD_POPUP_SESSION_KEY)) return
        didCheckSession.current = true

        const load = async () => {
            const { ok, data } = await getPopupImages()
            if (ok && data.data.length > 0) {
                sessionStorage.setItem(DASHBOARD_POPUP_SESSION_KEY, 'true')
                setImages(data.data)
                setOpen(true)
            }
        }
        load()
    }, [getPopupImages])

    // Slideshow (sirf 2+ images par)
    useEffect(() => {
        if (!open || images.length < 2) return
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % images.length)
        }, SLIDE_MS)
        return () => clearInterval(timer)
    }, [open, images.length])

    // Escape se band + popup ke waqt page scroll band
    useEffect(() => {
        if (!open) return

        const previousOverflow = document.body.style.overflow
        const onKeyDown = (e) => {
            if (e.key === 'Escape') setOpen(false)
        }

        document.body.style.overflow = 'hidden'
        window.addEventListener('keydown', onKeyDown)

        return () => {
            document.body.style.overflow = previousOverflow
            window.removeEventListener('keydown', onKeyDown)
        }
    }, [open])

    if (!open) return null

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label="Announcements"
            onClick={close}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-md overflow-hidden rounded-[22px] bg-white shadow-2xl"
            >
                <button
                    type="button"
                    onClick={close}
                    aria-label="Close popup"
                    className="absolute right-3 top-3 z-20 flex size-9 cursor-pointer items-center justify-center rounded-full bg-black/50 text-lg text-white backdrop-blur transition hover:bg-[#FF6B35]"
                >
                    <FiX aria-hidden="true" />
                </button>

                <div className="relative aspect-[7/8] w-full bg-slate-100">
                    {images.map((item, index) => (
                        <Image
                            key={item._id}
                            src={item.image}
                            alt={`Announcement ${index + 1}`}
                            fill
                            sizes="(min-width: 640px) 448px, 100vw"
                            className={`object-cover transition-opacity duration-700 ${index === current ? 'opacity-100' : 'opacity-0'
                                }`}
                        />
                    ))}

                    {images.length > 1 && (
                        <div className="absolute inset-x-0 bottom-3 z-10 flex justify-center gap-1.5">
                            {images.map((item, index) => (
                                <span
                                    key={item._id}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${index === current ? 'w-5 bg-white' : 'w-1.5 bg-white/50'
                                        }`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}