import Image from 'next/image'
import Link from 'next/link'
import {
  FiArrowUpRight,
  FiFileText,
  FiGlobe,
  FiHeadphones,
  FiHome,
  FiMap,
  FiMoon,
} from 'react-icons/fi'

const services = [
  {
    icon: FiGlobe,
    number: '01',
    title: 'Flight reservations',
    label: 'Worldwide routes',
    text: 'Domestic and international options shaped around your route, timing and budget.',
    image: '/images/services/flight-reservations.webp',
    href: '/contact',
    layout: 'lg:col-span-5',
  },
  {
    icon: FiHome,
    number: '02',
    title: 'Hotel reservations',
    label: 'City & resort stays',
    text: 'Well-located stays across different budgets, selected for the way you plan to travel.',
    image: '/images/services/hotel-reservations.webp',
    href: '/contact',
    layout: 'lg:col-span-3',
  },
  {
    icon: FiFileText,
    number: '03',
    title: 'Visa assistance',
    label: 'Clear guidance',
    text: 'Step-by-step document checks and application support for a more organised process.',
    image: '/images/services/visa-assistance.webp',
    href: '/contact',
    layout: 'lg:col-span-4',
  },
  {
    icon: FiMoon,
    number: '04',
    title: 'Umrah & Hajj',
    label: 'Travel with care',
    text: 'Thoughtfully coordinated flights, accommodation and transport for your sacred journey.',
    image: '/images/services/umrah-hajj.webp',
    href: '/contact',
    layout: 'lg:col-span-4',
  },
  {
    icon: FiMap,
    number: '05',
    title: 'Holiday packages',
    label: 'Built around you',
    text: 'Flexible plans for city breaks, family holidays, nature escapes and group tours.',
    image: '/images/services/holiday-packages.webp',
    href: '/packages',
    layout: 'lg:col-span-5',
  },
  {
    icon: FiHeadphones,
    number: '06',
    title: 'After-sale support',
    label: 'Here after booking',
    text: 'Responsive help with schedule questions, updates and booking changes after confirmation.',
    image: '/images/services/after-sale-support.webp',
    href: '/contact',
    layout: 'lg:col-span-3',
  },
]

const Services = () => {
  return (
    <section
      id="services"
      aria-labelledby="services-title"
      className="relative isolate scroll-mt-[96px] overflow-hidden py-[64px] text-black sm:py-[80px] lg:py-[112px]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      />

      <div className="mycontainer">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
          <div className="max-w-[760px]">
            <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#ff8a61] sm:text-[12px]">
              <span aria-hidden="true" className="h-px w-8 bg-[#ff8a61]" />
              Everything in one place
            </p>
            <h2
              id="services-title"
              className="mt-4 max-w-[720px] text-[32px] font-semibold leading-[1.1] tracking-[-0.04em] text-balance sm:text-[42px] lg:text-[54px]"
            >
              One journey. Every detail handled.
            </h2>
          </div>

          <div className="max-w-[510px] lg:pb-1 lg:text-right">
            <p className="text-[15px] leading-[26px] text-gray-600 sm:text-[16px] sm:leading-[28px]">
              From the first search to the journey home, our six core services
              keep every moving part clear, connected and easy to manage.
            </p>
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400">
              Hover a service to discover more
            </p>
          </div>
        </div>

        <ul className="mt-10 grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:mt-14 lg:grid-cols-12 lg:gap-5">
          {services.map(
            ({ icon: Icon, number, title, label, text, image, href, layout }) => (
              <li key={title} className={`min-w-0 ${layout}`}>
                <Link
                  href={href}
                  aria-label={`${title}: ${text}`}
                  className="group relative isolate flex min-h-[360px] w-full overflow-hidden rounded-[26px] border border-white/10 bg-slate-900 shadow-[0_24px_70px_rgba(0,0,0,0.22)] outline-none transition duration-500 hover:-translate-y-1 hover:border-white/25 hover:shadow-[0_28px_80px_rgba(0,0,0,0.38)] focus-visible:-translate-y-1 focus-visible:border-[#ff8a61] focus-visible:ring-2 focus-visible:ring-[#ff8a61] focus-visible:ring-offset-4 focus-visible:ring-offset-[#071b1c] sm:min-h-[400px] lg:min-h-[430px]"
                >
                  <Image
                    src={image}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 42vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.06] group-focus-visible:scale-[1.06]"
                  />

                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,14,18,0.18)_0%,rgba(2,14,18,0.02)_34%,rgba(2,14,18,0.88)_100%)] transition-colors duration-500 group-hover:bg-[linear-gradient(180deg,rgba(2,14,18,0.24)_0%,rgba(2,14,18,0.10)_28%,rgba(2,14,18,0.96)_100%)] group-focus-visible:bg-[linear-gradient(180deg,rgba(2,14,18,0.24)_0%,rgba(2,14,18,0.10)_28%,rgba(2,14,18,0.96)_100%)]"
                  />

                  <div className="relative z-10 flex w-full flex-col justify-between p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <span className="flex size-[48px] shrink-0 items-center justify-center rounded-2xl border border-white/25 bg-slate-950/25 text-white shadow-sm backdrop-blur-md transition duration-500 group-hover:border-[#ff8a61]/60 group-hover:bg-[#ff6b35] group-focus-visible:border-[#ff8a61]/60 group-focus-visible:bg-[#ff6b35]">
                        <Icon aria-hidden="true" className="size-[20px]" />
                      </span>
                    </div>

                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#ffb092] sm:text-[11px]">
                        {label}
                      </p>
                      <div className="mt-2 flex items-end justify-between gap-4">
                        <h3 className="min-w-0 text-[24px] font-semibold leading-[1.12] tracking-[-0.03em] text-white sm:text-[27px]">
                          {title}
                        </h3>
                        <span className="flex size-[42px] shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-md transition duration-500 group-hover:rotate-45 group-hover:border-white group-hover:bg-white group-hover:text-slate-950 group-focus-visible:rotate-45 group-focus-visible:border-white group-focus-visible:bg-white group-focus-visible:text-slate-950">
                          <FiArrowUpRight aria-hidden="true" className="size-[18px]" />
                        </span>
                      </div>

                      <div className="mt-3 max-h-[120px] translate-y-0 overflow-hidden opacity-100 transition-all duration-500 ease-out lg:mt-0 lg:max-h-0 lg:translate-y-4 lg:opacity-0 lg:group-hover:mt-3 lg:group-hover:max-h-[120px] lg:group-hover:translate-y-0 lg:group-hover:opacity-100 lg:group-focus-visible:mt-3 lg:group-focus-visible:max-h-[120px] lg:group-focus-visible:translate-y-0 lg:group-focus-visible:opacity-100">
                        <p className="max-w-[520px] text-[13px] leading-[21px] text-white/75 sm:text-[14px] sm:leading-[22px]">
                          {text}
                        </p>
                        <span className="mt-3 inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-white">
                          Explore service
                          <span aria-hidden="true" className="h-px w-7 bg-[#ff8a61]" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ),
          )}
        </ul>
      </div>
    </section>
  )
}

export default Services
