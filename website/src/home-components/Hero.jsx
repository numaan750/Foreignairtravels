import Image from 'next/image'
import Link from 'next/link'
import { FiArrowRight, FiArrowDown, FiMapPin } from 'react-icons/fi'

const Hero = () => {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate h-[calc(100svh-76px)] min-h-[420px] w-full overflow-hidden bg-slate-950 text-white"
    >
      {/* Background image */}
      <Image
        src="/hero-travel.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover object-center"
      />

      {/* Overlay (center content ke liye uniform dark + bottom gradient) */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(0deg,rgba(7,20,28,0.65)_0%,transparent_40%),linear-gradient(0deg,rgba(7,20,28,0.5),rgba(7,20,28,0.5))]"
      />

      <div className="mycontainer box-border flex h-full flex-col justify-between gap-4 pb-4 sm:pb-6">
        {/* CENTER CONTENT */}
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          {/* Badge */}
          <div className="mb-4 inline-flex min-h-[28px] items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 text-[10px] font-medium uppercase tracking-[0.16em] text-white/90 backdrop-blur-sm sm:mb-6 sm:min-h-[32px] sm:text-[11px] [@media(max-height:600px)]:mb-2">
            <span aria-hidden="true" className="size-[6px] rounded-full bg-[#FF6B35]" />
            Travel, thoughtfully
          </div>

          <h1
            id="hero-title"
            className="mx-auto w-full max-w-full text-[clamp(28px,8vw,40px)] font-semibold leading-[1.1] tracking-[-0.04em] text-balance sm:text-[clamp(40px,6.6vw,52px)] md:text-[clamp(48px,6.4vw,64px)] lg:text-[clamp(64px,6.2vw,88px)] xl:text-[88px] 2xl:text-[96px] [@media(max-height:600px)]:!text-[26px] [@media(max-height:600px)]:sm:!text-[34px] [@media(max-height:600px)]:md:!text-[40px] [@media(max-height:600px)]:lg:!text-[48px]"
          >
            <span className="block md:whitespace-nowrap">
              Find Your Special <br className="sm:hidden" />
              Tour Today
            </span>
            <span className="block text-white/75">somewhere.</span>
          </h1>

          {/* Paragraph */}
          <p className="mx-auto mt-4 max-w-[300px] text-[14px] leading-[22px] text-white/80 min-[400px]:max-w-[360px] min-[400px]:text-[15px] min-[400px]:leading-[24px] sm:mt-5 sm:max-w-[480px] sm:text-[16px] sm:leading-[26px] md:max-w-[540px] md:text-[17px] md:leading-[28px] lg:mt-6 lg:max-w-[600px] lg:text-[18px] [@media(max-height:600px)]:mt-2 [@media(max-height:600px)]:text-[13px] [@media(max-height:600px)]:leading-[19px]">
            Thoughtful journeys, remarkable places, and the freedom to travel
            your own way.
          </p>

          {/* Buttons */}
          <div className="mt-6 flex w-full flex-col items-center justify-center gap-3 min-[480px]:flex-row min-[480px]:gap-4 sm:mt-8 [@media(max-height:600px)]:mt-3">
            {/* Primary */}
            <Link
              href="#destinations"
              className="group inline-flex h-[48px] w-full max-w-[250px] md:max-w-[365px] items-center justify-between rounded-full bg-white px-5 pl-6 pr-2 text-[14px] font-semibold text-slate-900 shadow-[0_8px_24px_rgba(0,0,0,0.25)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-teal-50 hover:shadow-[0_12px_32px_rgba(0,0,0,0.35)] active:translate-y-0 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white min-[480px]:w-auto sm:h-[52px] sm:gap-8 sm:pl-8 sm:pr-2 sm:text-[15px]"
            >
              <span className="whitespace-nowrap">
                Explore destinations
              </span>

              <span className="flex size-[36px] shrink-0 items-center justify-center rounded-full bg-slate-900 text-white transition-colors duration-300 group-hover:bg-[#FF6B35]">
                <FiArrowRight
                  aria-hidden="true"
                  className="size-[16px] transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-rotate-45"
                />
              </span>
            </Link>

            {/* Secondary */}
            <Link
              href="#about"
              className="inline-flex h-[48px] w-full max-w-[250px] items-center justify-center whitespace-nowrap rounded-full border border-white/40 bg-white/10 px-7 text-[14px] font-semibold text-white backdrop-blur-md transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-white hover:bg-white hover:text-slate-900 active:translate-y-0 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white min-[480px]:w-auto sm:h-[52px] sm:px-8 sm:text-[15px]"
            >
              Our approach
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero