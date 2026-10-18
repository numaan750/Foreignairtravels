'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useApp } from '@/context/AppContext'
import { FiArrowRight, FiGlobe, FiMapPin } from 'react-icons/fi'

const countries = [
  {
    code: 'SA',
    name: 'Saudi Arabia',
    cities: 'Jeddah · Riyadh · Madinah',
    note: 'Umrah, family and business travel',
  },
  {
    code: 'PK',
    name: 'Pakistan',
    cities: 'Islamabad · Lahore · Karachi',
    note: 'Frequent regional connections',
  },
  {
    code: 'AE',
    name: 'United Arab Emirates',
    cities: 'Dubai · Abu Dhabi · Sharjah',
    note: 'City breaks and connected travel',
  },
  {
    code: 'OM',
    name: 'Oman',
    cities: 'Muscat · Salalah',
    note: 'Direct and one-way route options',
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    cities: 'London · Manchester · Birmingham',
    note: 'Long-haul and family travel',
  },
  {
    code: 'TR',
    name: 'Türkiye',
    cities: 'Istanbul · Antalya',
    note: 'Holidays and onward connections',
  },
  {
    code: 'AS',
    name: 'Australia',
    cities: 'Sydney · Melbourne · Brisbane',
    note: 'Long-haul and family travel',
  },
  {
    code: 'CN',
    name: 'China',
    cities: 'Beijing · Shanghai · Guangzhou',
    note: 'Long-haul and family travel',
  },
]

const flags = {
  SA: 'https://flagcdn.com/sa.svg',
  PK: 'https://flagcdn.com/pk.svg',
  AE: 'https://flagcdn.com/ae.svg',
  OM: 'https://flagcdn.com/om.svg',
  GB: 'https://flagcdn.com/gb.svg',
  TR: 'https://flagcdn.com/tr.svg',
  AS: 'https://flagcdn.com/au.svg',
  CN: 'https://flagcdn.com/cn.svg',
}

const bgImages = {
  SA: 'https://picsum.photos/seed/saudi/800/500',
  PK: 'https://picsum.photos/seed/pakistan/800/500',
  AE: 'https://picsum.photos/seed/uae/800/500',
  OM: 'https://picsum.photos/seed/oman/800/500',
  GB: 'https://picsum.photos/seed/uk/800/500',
  TR: 'https://picsum.photos/seed/turkey/800/500',
  AS: 'https://picsum.photos/seed/australia/800/500',
  CN: 'https://picsum.photos/seed/china/800/500',
}

const CountryCoverage = () => {
  const { getCountries } = useApp()
  const [countries, setCountries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { ok, data } = await getCountries()
      if (ok) setCountries(data.data)
      setLoading(false)
    }
    load()
  }, [getCountries])

  return (
    <section
      aria-labelledby="countries-title"
      className="relative isolate overflow-hidden bg-[#003366] py-[64px] text-white sm:py-[80px] lg:py-[112px]"
    >
      <FiGlobe
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 -z-10 size-[360px] text-white/[0.035] sm:size-[520px] lg:-right-28 lg:-top-36 lg:size-[680px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-2/3 bg-[linear-gradient(180deg,transparent,rgba(15,23,42,0.20))]"
      />

      <div className="mycontainer">
        <div className="grid gap-8 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-end lg:gap-16">
          <div>
            <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#FF6B35] sm:text-[12px]">
              <span aria-hidden="true" className="h-px w-8 bg-[#FF6B35]" />
              Routes that bring you closer
            </p>
            <h2
              id="countries-title"
              className="mt-4 text-[32px] font-semibold leading-[1.1] tracking-[-0.04em] sm:text-[42px] lg:whitespace-nowrap lg:text-[54px]"
            >
              We Work With These Countries
            </h2>
          </div>

          <p className="max-w-[620px] text-[15px] leading-[26px] text-white/65 sm:text-[16px] sm:leading-[28px] lg:justify-self-end lg:text-right">
            From high-demand regional routes to long-haul journeys, we help you
            plan practical connections to the places that matter most.
          </p>
        </div>
        {!loading && countries.length === 0 && (
          <p className="mt-10 text-[15px] text-white/65">
            Countries are coming soon.
          </p>
        )}
        <ul className="mt-10 flex min-w-0 flex-wrap justify-center gap-4 lg:mt-14 lg:gap-5">
          {countries.map(({ _id, name, cities, note, flag, bgImage }) => (
            <li
              key={_id}
              className="group relative isolate w-full min-w-0 overflow-hidden rounded-[24px] border border-white/15 bg-white/[0.07] p-5 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-[#FF6B35]/70 hover:bg-white/[0.11] sm:w-[calc((100%-1rem)/2)] sm:p-6 lg:w-[calc((100%-2.5rem)/3)]"
            >
              <Image
                src={bgImage}
                alt=""
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                unoptimized
                className="-z-10 object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 -z-10 bg-black/55 transition-colors duration-500 group-hover:bg-black/40"
              />

              <div className="flex items-center justify-between gap-4">
                <span className="relative h-[38px] w-[57px] shrink-0 overflow-hidden rounded-md border border-white/20">
                  <Image
                    src={flag}
                    alt={`${name} flag`}
                    fill
                    sizes="57px"
                    unoptimized
                    className="object-cover grayscale transition duration-300 group-hover:grayscale-0"
                  />
                </span>

              </div>

              <h3 className="mt-7 text-[22px] font-semibold leading-[29px] tracking-[-0.025em] text-white sm:text-[24px]">
                {name}
              </h3>
              <p className="mt-3 flex items-start gap-2 text-[13px] leading-[21px] text-white/70 sm:text-[14px]">
                <FiMapPin
                  aria-hidden="true"
                  className="mt-0.5 size-[15px] shrink-0 text-[#FF6B35]"
                />
                {cities}
              </p>

              <div className="mt-6 flex items-center justify-between gap-4 border-t border-white/10 pt-4">
                <p className="min-w-0 text-[12px] leading-[19px] text-white/50 sm:text-[13px]">
                  {note}
                </p>
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-white/20 text-white transition duration-300 group-hover:border-[#FF6B35] group-hover:bg-[#FF6B35]">
                  <FiArrowRight
                    aria-hidden="true"
                    className="size-[15px] transition-transform duration-300 group-hover:translate-x-0.5"
                  />
                </span>
              </div>
            </li>
          ))}
        </ul>

        {/* <div className="mt-9 flex flex-col items-start justify-between gap-5 border-t border-white/15 pt-7 sm:flex-row sm:items-center">
          <div>
            <p className="text-[16px] font-semibold text-white sm:text-[18px]">
              Your destination is not listed?
            </p>
            <p className="mt-1 text-[13px] leading-[21px] text-white/55 sm:text-[14px]">
              Share the route with our team and we will check the available options.
            </p>
          </div>
          <Link
            href="/contact"
            className="group inline-flex h-[50px] shrink-0 items-center justify-center gap-3 rounded-full bg-white px-6 text-[14px] font-semibold text-[#003366] transition duration-300 hover:-translate-y-0.5 hover:bg-[#FF6B35] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            Plan my journey
            <FiArrowRight
              aria-hidden="true"
              className="size-[16px] transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div> */}
      </div>
    </section>
  )
}

export default CountryCoverage
