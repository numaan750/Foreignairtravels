import Image from 'next/image'
import Link from 'next/link'
import { FiArrowDown, FiArrowRight } from 'react-icons/fi'

const Hero = () => {
  return (
    <section
      aria-labelledby="packages-hero-title"
      className="relative isolate overflow-hidden bg-[#003366] pt-16 text-white sm:pt-20 lg:pt-24"
    >
      <div
        aria-hidden="true"
        className="absolute -left-28 top-20 -z-10 size-[340px] rounded-full border-[72px] border-white/5"
      />
      <div
        aria-hidden="true"
        className="absolute -right-20 -top-20 -z-10 size-[300px] rounded-full bg-[#FF6B35]/10 blur-3xl sm:size-[440px]"
      />

      <div className="mycontainer">
        <div className="mx-auto text-center">
          <p className="flex items-center justify-center gap-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#ff9c78] sm:text-[12px]">
            <span aria-hidden="true" className="h-px w-8 bg-[#FF6B35]" />
            Travel packages
            <span aria-hidden="true" className="h-px w-8 bg-[#FF6B35]" />
          </p>

          <h1
            id="packages-hero-title"
            className="mt-5 text-[42px] font-semibold leading-[1.05] tracking-[-0.05em] text-balance sm:text-[58px] lg:text-[74px]"
          >
            Find the Right Package.
            <span className="mt-1 block text-[#ff9c78]">Make It Your Journey.</span>
          </h1>

          <p className="mx-auto mt-6 text-[15px] leading-[26px] text-white/70 sm:text-[17px] sm:leading-[29px]">
            Explore thoughtfully selected trips with clear details, flexible
            options and support when you need it.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 min-[430px]:flex-row sm:mt-10">
            <Link
              href="#packages"
              className="group inline-flex h-[52px] items-center justify-center gap-3 rounded-full bg-[#FF6B35] px-7 text-[14px] font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-[#003366] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              View all packages
              <FiArrowDown
                aria-hidden="true"
                className="size-[16px] transition-transform duration-300 group-hover:translate-y-0.5"
              />
            </Link>

            <Link
              href="/#contact"
              className="group inline-flex h-[52px] items-center justify-center gap-3 rounded-full border border-white/30 bg-white/10 px-7 text-[14px] font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-white hover:bg-white hover:text-[#003366] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              Plan a custom trip
              <FiArrowRight
                aria-hidden="true"
                className="size-[16px] transition-transform duration-300 group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </div>

        <div className="relative mt-12 min-h-[320px] overflow-hidden rounded-t-[28px] border-x border-t border-white/15 bg-[#003366] shadow-[0_-18px_70px_rgba(0,0,0,0.18)] sm:mt-14 sm:min-h-[400px] sm:rounded-t-[36px] lg:min-h-[470px]">
          <Image
            src="/hero-travel.jpg"
            alt="A calm boat journey through a mountain lake"
            fill
            preload
            sizes="90vw"
            className="object-cover object-center"
          />

          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,51,102,0.04)_35%,rgba(0,51,102,0.82)_100%)]"
          />

          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-4 p-5 text-white sm:flex-row sm:items-end sm:justify-between sm:p-8 lg:p-10">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#ffb092] sm:text-[11px]">
                Travel at your pace
              </p>
              <p className="mt-2 max-w-[520px] text-[24px] font-semibold leading-[1.14] tracking-[-0.035em] sm:text-[32px]">
                Good journeys begin with the right plan.
              </p>
            </div>

            <span className="inline-flex w-fit rounded-full border border-white/25 bg-white/10 px-4 py-2 text-[11px] font-medium text-white backdrop-blur-md sm:text-[12px]">
              Flights · Stays · Experiences
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
