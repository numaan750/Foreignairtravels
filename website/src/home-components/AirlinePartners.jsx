import Image from 'next/image'
import Link from 'next/link'
import { FiArrowRight, FiCheck, FiShield } from 'react-icons/fi'
import { FaPlane } from 'react-icons/fa'

const airlines = [
  {
    code: 'PK',
    name: 'Pakistan International',
    network: 'Islamabad · Lahore · Karachi',
  },
  {
    code: 'SV',
    name: 'Saudia',
    network: 'Jeddah · Riyadh · Madinah',
  },
  {
    code: 'EK',
    name: 'Emirates',
    network: 'Dubai and worldwide connections',
  },
  {
    code: 'QR',
    name: 'Qatar Airways',
    network: 'Doha and worldwide connections',
  },
  {
    code: 'EY',
    name: 'Etihad Airways',
    network: 'Abu Dhabi and onward travel',
  },
  {
    code: 'FZ',
    name: 'flydubai',
    network: 'Dubai and regional routes',
  },
  {
    code: 'G9',
    name: 'Air Arabia',
    network: 'Sharjah and regional routes',
  },
  {
    code: 'TK',
    name: 'Turkish Airlines',
    network: 'Istanbul and global connections',
  },
  {
    code: 'IN',
    name: 'IndiGo',
    network: 'India and regional routes',
  },
  {
    code: 'JP',
    name: 'Japan Airlines',
    network: 'Tokyo and global connections',
  },
]
const logos = {
  PK: 'https://pics.avs.io/200/100/PK.png',
  SV: 'https://pics.avs.io/200/100/SV.png',
  EK: 'https://pics.avs.io/200/100/EK.png',
  QR: 'https://pics.avs.io/200/100/QR.png',
  EY: 'https://pics.avs.io/200/100/EY.png',
  FZ: 'https://pics.avs.io/200/100/FZ.png',
  G9: 'https://pics.avs.io/200/100/G9.png',
  TK: 'https://pics.avs.io/200/100/TK.png',
  IN: 'https://pics.avs.io/200/100/6E.png',
  JP: 'https://pics.avs.io/200/100/JL.png',
}

const AirlinePartners = () => {
  return (
    <section
      aria-labelledby="airlines-title"
      className="overflow-hidden bg-white py-[64px] sm:py-[80px] lg:py-[112px]"
    >
      <div className="mycontainer">
        <div>
          <div className="max-w-[760px]">
            <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#FF6B35] sm:text-[12px]">
              <span aria-hidden="true" className="h-px w-8 bg-[#FF6B35]" />
              Trusted flight options
            </p>
            <h2
              id="airlines-title"
              className="mt-4 text-[32px] font-semibold leading-[1.1] tracking-[-0.04em] text-[#003366] text-balance sm:text-[42px] lg:text-[54px]"
            >
              We work with these airlines
            </h2>
          </div>

          <p className="mt-5 max-w-[640px] text-[15px] leading-[26px] text-slate-600 sm:text-[16px] sm:leading-[28px]">
            Compare dependable carriers, practical timings and connected routes
            without searching across multiple places.
          </p>
        </div>

        <ul className="mt-10 flex min-w-0 flex-wrap justify-center gap-4 lg:mt-14 lg:gap-5">
          {airlines.map(({ code, name, network }, index) => (
            <li
              key={code}
              className="group relative w-full min-w-0 overflow-hidden rounded-[22px] border border-slate-200 bg-white p-5 shadow-[0_12px_36px_rgba(0,51,102,0.06)] transition duration-300 hover:-translate-y-1 hover:border-[#FF6B35]/40 hover:shadow-[0_22px_55px_rgba(0,51,102,0.13)] sm:w-[calc((100%-1rem)/2)] sm:p-6 lg:w-[calc((100%-3.75rem)/4)]"
            >
              <span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-[#FF6B35] transition-transform duration-300 group-hover:scale-x-100"
              />

              <div className="flex items-start justify-between gap-4">
                <span className="relative h-[54px] w-[96px] shrink-0">
                  <Image
                    src={logos[code]}
                    alt={`${name} logo`}
                    fill
                    sizes="96px"
                    unoptimized
                    className="object-contain object-left grayscale opacity-70 transition duration-300 group-hover:opacity-100 group-hover:grayscale-0"
                  />
                </span>
                <span className="flex size-9 items-center justify-center rounded-full border border-slate-200 text-[#003366]">
                  <FaPlane
                    aria-hidden="true"
                    className="size-[16px] -rotate-45 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </span>
              </div>

              <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#FF6B35]">
                Carrier {String(index + 1).padStart(2, '0')}
              </p>
              <h3 className="mt-2 text-[18px] font-semibold leading-[24px] tracking-[-0.02em] text-[#003366] sm:text-[19px]">
                {name}
              </h3>
              <p className="mt-2 text-[13px] leading-[21px] text-slate-500">
                {network}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-col gap-5 rounded-[24px] bg-[#003366] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7 lg:px-9">
          <div className="flex min-w-0 items-start gap-4">
            <span className="flex size-[46px] shrink-0 items-center justify-center rounded-2xl bg-white/10 text-[#FF6B35]">
              <FiShield aria-hidden="true" className="size-[21px]" />
            </span>
            <div>
              <p className="flex items-center gap-2 text-[15px] font-semibold text-white sm:text-[16px]">
                <FiCheck aria-hidden="true" className="size-[17px] text-[#FF6B35]" />
                More airlines are available on request
              </p>
              <p className="mt-1 text-[13px] leading-[21px] text-white/65 sm:text-[14px]">
                Final carrier options depend on your route, dates and seat availability.
              </p>
            </div>
          </div>

          <Link
            href="/contact"
            className="group inline-flex h-[50px] shrink-0 items-center justify-center gap-3 rounded-full bg-[#FF6B35] px-6 text-[14px] font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-[#003366] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FF6B35]"
          >
            Check your route
            <FiArrowRight
              aria-hidden="true"
              className="size-[16px] transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </section>
  )
}

export default AirlinePartners
