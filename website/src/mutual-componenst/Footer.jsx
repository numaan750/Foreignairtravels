'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'
import {
  FiArrowUpRight,
  FiClock,
  FiMapPin,
  FiPhone,
} from 'react-icons/fi'
import { FaFacebookF, FaInstagram, FaWhatsapp } from 'react-icons/fa'

const exploreLinks = [
  { label: 'About us', target: 'about' },
  { label: 'Our services', target: 'services-title' },
  { label: 'Airline partners', target: 'airlines-title' },
  { label: 'Countries', target: 'countries-title' },
  { label: 'FAQs', target: 'faqs' },
  { label: 'Contact', target: 'contact' },
]

const serviceLinks = [
  { label: 'Flight reservations', target: 'services-title' },
  { label: 'Hotel reservations', target: 'services-title' },
  { label: 'Visa assistance', target: 'services-title' },
  { label: 'Umrah & Hajj', target: 'services-title' },
]

const socialLinks = [
  {
    label: 'Facebook',
    href: ' https://www.facebook.com/share/19JTEp9KRK/?mibextid=wwXIfr',
    icon: FaFacebookF,
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/foreignairtravel?obrf=MXJlYXZ1YW42eXc3',
    icon: FaInstagram,
  },
]

const Footer = () => {
  const pathname = usePathname()
  const router = useRouter()
  const pendingTarget = useRef(null)
  const pendingHomeScroll = useRef(false)

  useEffect(() => {
    if (pathname !== '/') return

    if (pendingHomeScroll.current) {
      pendingHomeScroll.current = false
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      })
      return
    }

    if (!pendingTarget.current) return
    const targetId = pendingTarget.current
    pendingTarget.current = null
    requestAnimationFrame(() => {
      document
        .getElementById(targetId)
        ?.scrollIntoView({ behavior: 'smooth' })
    })
  }, [pathname])

  const handleSectionLinkClick = (event, targetId) => {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return
    }

    event.preventDefault()

    if (pathname === '/') {
      document
        .getElementById(targetId)
        ?.scrollIntoView({ behavior: 'smooth' })
      return
    }

    pendingTarget.current = targetId
    router.push('/')
  }

  const handleLogoClick = (event) => {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return
    }

    event.preventDefault()

    if (pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    pendingTarget.current = null
    pendingHomeScroll.current = true
    router.push('/')
  }

  return (
    <footer className="border-t-4 border-[#ff6b35] bg-[#003366] text-white">
      <div className="mycontainer py-12 sm:py-14 lg:py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[minmax(270px,1.25fr)_0.72fr_0.9fr_1fr] lg:gap-12 xl:gap-16">
          <div className="max-w-[390px] sm:col-span-2 lg:col-span-1">
            <Link
              href="/"
              onClick={handleLogoClick}
              aria-label="Foreign Air Travel home"
              className="inline-flex rounded-2xl bg-white px-4 py-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              <Image
                src="/FOREIGN-AIR-TRAVEL.png"
                alt="Foreign Air Travel"
                width={400}
                height={120}
                sizes="(min-width: 640px) 240px, 210px"
                className="h-[48px] w-auto max-w-[210px] object-contain sm:h-[56px] sm:max-w-[240px]"
              />
            </Link>

            <p className="mt-5 text-[14px] leading-[24px] text-white/60 sm:text-[15px] sm:leading-[25px]">
              Thoughtful support for flights, hotels, visas, holidays and
              spiritual journeys—from first idea to final confirmation.
            </p>

            <Link
              href="/"
              onClick={(event) => handleSectionLinkClick(event, 'contact')}
              className="group mt-6 inline-flex items-center gap-2 text-[13px] font-semibold text-white transition-colors hover:text-[#ff9c78] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:text-[14px]"
            >
              Start a conversation
              <FiArrowUpRight
                aria-hidden="true"
                className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
          </div>

          <nav aria-label="Footer navigation">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#ff9c78] sm:text-[12px]">
              Explore
            </h2>
            <ul className="mt-5 space-y-3">
              {exploreLinks.map(({ label, target }) => (
                <li key={label}>
                  <Link
                    href="/"
                    onClick={(event) =>
                      handleSectionLinkClick(event, target)
                    }
                    className="inline-flex text-[14px] leading-[22px] text-white/65 transition-colors hover:text-white focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    {label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/packeges"
                  className="inline-flex text-[14px] leading-[22px] text-white/65 transition-colors hover:text-white focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  Packeges
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Service links">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#ff9c78] sm:text-[12px]">
              Services
            </h2>
            <ul className="mt-5 space-y-3">
              {serviceLinks.map(({ label, target }) => (
                <li key={label}>
                  <Link
                    href="/"
                    onClick={(event) =>
                      handleSectionLinkClick(event, target)
                    }
                    className="inline-flex text-[14px] leading-[22px] text-white/65 transition-colors hover:text-white focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#ff9c78] sm:text-[12px]">
              Contact
            </h2>
            <ul className="mt-5 space-y-4 text-[14px] leading-[22px] text-white/65">
              <li className="flex items-start gap-3">
                <FiPhone
                  aria-hidden="true"
                  className="mt-[3px] size-4 shrink-0 text-[#ff8a61]"
                />
                <a
                  href="tel:+9663017075427"
                  className="transition-colors hover:text-white focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  0301 7075427
                </a>
              </li>
              <li className="flex items-start gap-3">
                <FaWhatsapp
                  aria-hidden="true"
                  className="mt-[3px] size-4 shrink-0 text-[#ff8a61]"
                />
                <a
                  href="https://wa.me/966596382847"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-white focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  +966 59 638 2847
                </a>
              </li>
              <li className="flex items-start gap-3">
                <FiClock
                  aria-hidden="true"
                  className="mt-[3px] size-4 shrink-0 text-[#ff8a61]"
                />
                <span>
                  Mon–Sat, 10:00–18:00
                  <br />
                  Sunday closed
                </span>
              </li>
              <li className="flex items-start gap-3">
                <FiMapPin
                  aria-hidden="true"
                  className="mt-[3px] size-4 shrink-0 text-[#ff8a61]"
                />
                <Link
                  href="/"
                  onClick={(event) => handleSectionLinkClick(event, 'contact')}
                  className="transition-colors hover:text-white focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  Faisalabad, Pakistan
                </Link>
              </li>
            </ul>
            <ul className="mt-6 flex flex-wrap items-center gap-3">
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Foreign Air Travel on ${label}`}
                    className="flex size-10 items-center justify-center rounded-full border border-white/20 text-white/80 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#ff6b35] hover:bg-[#ff6b35] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    <Icon aria-hidden="true" className="size-[16px]" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-11 flex flex-col gap-3 border-t border-white/12 pt-6 sm:mt-14 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[12px] leading-5 text-white/45 sm:text-[13px]">
            © 2026 Foreign Air Travel. All rights reserved.
          </p>
          <p className="text-[11px] uppercase tracking-[0.16em] text-white/35 sm:text-[12px]">
            Travel, thoughtfully
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
