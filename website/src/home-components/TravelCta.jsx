import {
  FiArrowUpRight,
  FiClock,
  FiMail,
  FiMapPin,
  FiPhone,
} from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'

const CONTACT = {
  // Change only this address; the text and both map links will update automatically.
  address: "Stayana Road near McDonald's, Faisalabad 38000, Pakistan",
  email: 'info@foreignairtravel.com',
  phone: {
    label: '0301 7075427',
    href: 'tel:+9663017075427',
  },
  whatsapp: {
    label: '+966 59 638 2847',
    href: 'https://wa.me/966596382847',
  },
  hours: 'Mon–Sat, 10:00–18:00',
}

const TravelCta = () => {
  const encodedAddress = encodeURIComponent(CONTACT.address)
  const mapEmbedUrl = `https://www.google.com/maps?q=${encodedAddress}&output=embed`
  const mapDirectionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`

  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      className="scroll-mt-[96px] overflow-hidden bg-[#f5f3ed] py-[64px] sm:py-[84px] lg:py-[112px]"
    >
      <div className="mycontainer">
        <div className="grid gap-5">
          <div>
            <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#e95f2d] sm:text-[12px]">
              <span aria-hidden="true" className="h-px w-8 bg-[#e95f2d]" />
              Contact us
            </p>
            <h2
              id="contact-title"
              className="mt-5 text-[34px] font-semibold leading-[1.08] tracking-[-0.045em] text-[#003366] text-balance sm:text-[44px] lg:text-[54px]"
            >
              Let&apos;s Talk About Your Next Journey.
            </h2>
          </div>

          <p className="max-w-[560px] text-[15px] leading-[26px] text-slate-600 sm:text-[16px] sm:leading-[28px]">
            Call, message or visit our office to discuss flights, stays, visas
            and travel plans with our team.
          </p>
        </div>

        <div className="mt-10 grid overflow-hidden rounded-[28px] border border-[#003366]/10 bg-white shadow-[0_24px_70px_rgba(0,51,102,0.10)] lg:mt-14 lg:grid-cols-[minmax(320px,0.8fr)_minmax(0,1.2fr)] lg:rounded-[34px]">
          <div className="p-5 sm:p-8 lg:p-10 xl:p-12">
            <div className="border-b border-[#003366]/12 pb-6">
              <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#e95f2d]">
                Contact details
              </p>
              <h3 className="mt-2 text-[24px] font-semibold tracking-[-0.03em] text-[#003366] sm:text-[28px]">
                We&apos;re here to help
              </h3>
            </div>

            <ul className="divide-y divide-[#003366]/10">
              <li className="flex items-start gap-4 py-5">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#f5f3ed] text-[#003366]">
                  <FiPhone aria-hidden="true" className="size-[18px]" />
                </span>
                <div className="min-w-0 pt-0.5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                    Call us
                  </p>
                  <a
                    href={CONTACT.phone.href}
                    className="mt-1 inline-block text-[15px] font-semibold text-[#003366] transition-colors hover:text-[#e95f2d] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff6b35] sm:text-[16px]"
                  >
                    {CONTACT.phone.label}
                  </a>
                </div>
              </li>

              <li className="flex items-start gap-4 py-5">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#f5f3ed] text-[#003366]">
                  <FaWhatsapp aria-hidden="true" className="size-[19px]" />
                </span>
                <div className="min-w-0 pt-0.5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                    WhatsApp
                  </p>
                  <a
                    href={CONTACT.whatsapp.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-block text-[15px] font-semibold text-[#003366] transition-colors hover:text-[#e95f2d] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff6b35] sm:text-[16px]"
                  >
                    {CONTACT.whatsapp.label}
                  </a>
                </div>
              </li>

              <li className="flex items-start gap-4 py-5">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#f5f3ed] text-[#003366]">
                  <FiMail aria-hidden="true" className="size-[18px]" />
                </span>
                <div className="min-w-0 pt-0.5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                    Email
                  </p>
                  <a
                    href={`mailto:${CONTACT.email}`}
                    className="mt-1 break-all text-[15px] font-semibold text-[#003366] transition-colors hover:text-[#e95f2d] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff6b35] sm:text-[16px]"
                  >
                    {CONTACT.email}
                  </a>
                </div>
              </li>

              <li className="flex items-start gap-4 py-5">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#f5f3ed] text-[#003366]">
                  <FiMapPin aria-hidden="true" className="size-[18px]" />
                </span>
                <div className="min-w-0 pt-0.5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                    Visit our office
                  </p>
                  <p className="mt-1 max-w-[360px] text-[14px] font-medium leading-[23px] text-[#003366] sm:text-[15px]">
                    {CONTACT.address}
                  </p>
                </div>
              </li>
            </ul>

            <div className="mt-1 flex items-start gap-3 rounded-2xl bg-[#f5f3ed] p-4">
              <FiClock
                aria-hidden="true"
                className="mt-0.5 size-[17px] shrink-0 text-[#e95f2d]"
              />
              <div>
                <p className="text-[13px] font-semibold text-[#003366]">
                  {CONTACT.hours}
                </p>
                <p className="mt-0.5 text-[12px] text-slate-500">Sunday closed</p>
              </div>
            </div>
          </div>

          <div className="relative min-h-[420px] border-t border-[#003366]/10 bg-slate-200 sm:min-h-[500px] lg:min-h-full lg:border-l lg:border-t-0">
            <iframe
              title={`Map showing ${CONTACT.address}`}
              src={mapEmbedUrl}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 h-full w-full border-0"
            />

            <div className="absolute inset-x-4 bottom-4 z-10 flex items-center justify-between gap-4 rounded-2xl border border-white/70 bg-white/95 p-3.5 shadow-[0_14px_35px_rgba(0,51,102,0.16)] backdrop-blur sm:inset-x-6 sm:bottom-6 sm:p-4">
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-[#003366] sm:text-[14px]">
                  Find us on the map
                </p>
                <p className="mt-0.5 truncate text-[11px] text-slate-500 sm:text-[12px]">
                  {CONTACT.address}
                </p>
              </div>
              <a
                href={mapDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open office location in Google Maps"
                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#003366] text-white transition-colors duration-300 hover:bg-[#ff6b35] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff6b35]"
              >
                <FiArrowUpRight aria-hidden="true" className="size-[17px]" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TravelCta
