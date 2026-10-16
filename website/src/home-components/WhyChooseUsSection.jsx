import Link from 'next/link'
import {
  FiArrowRight,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiHeadphones,
  FiLayers,
  FiTag,
} from 'react-icons/fi'

const strengths = [
  {
    icon: FiLayers,
    title: 'One connected plan',
    text: 'Flights, hotels, visas and tours coordinated by the same travel team.',
  },
  {
    icon: FiTag,
    title: 'Options for your budget',
    text: 'Relevant choices explained clearly so you can decide with confidence.',
  },
  {
    icon: FiFileText,
    title: 'Document guidance',
    text: 'Practical checklists and support for the documents your journey requires.',
  },
  {
    icon: FiClock,
    title: 'Timely coordination',
    text: 'Important dates, confirmations and next steps kept easy to follow.',
  },
  {
    icon: FiCheckCircle,
    title: 'Careful confirmation',
    text: 'Trip details are reviewed with you before the arrangements are finalised.',
  },
  {
    icon: FiHeadphones,
    title: 'After-sale service',
    text: 'A familiar point of contact remains available after your booking.',
  },
]

const WhyChooseUs = () => {
  return (
    <section
      aria-labelledby="why-title"
      className="overflow-hidden bg-white py-[64px] sm:py-[84px] lg:py-[120px]"
    >
      <div className="mycontainer grid items-start gap-12 lg:grid-cols-[minmax(300px,0.76fr)_minmax(0,1.24fr)] lg:gap-16 xl:gap-24">
        <div className="max-w-[570px] lg:sticky lg:top-[112px]">
          <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#e95f2d] sm:text-[12px]">
            <span aria-hidden="true" className="h-px w-8 bg-[#e95f2d]" />
            Why choose us
          </p>

          <h2
            id="why-title"
            className="mt-5 text-[34px] font-semibold leading-[1.08] tracking-[-0.045em] text-[#003366] text-balance sm:text-[44px] lg:text-[50px]"
          >
            Practical support, without the guesswork.
          </h2>

          <p className="mt-6 text-[15px] leading-[26px] text-slate-600 sm:text-[16px] sm:leading-[28px]">
            Travel decisions feel easier when the information is clear and one
            experienced team is looking after the whole journey from start to
            finish.
          </p>

          <Link
            href="/contact"
            className="group mt-8 inline-flex h-[50px] w-full items-center justify-center gap-3 rounded-full bg-[#003366] px-6 text-[14px] font-semibold text-white transition-colors duration-300 hover:bg-[#0b455d] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff6b35] min-[430px]:w-auto sm:text-[15px]"
          >
            Talk to our team
            <FiArrowRight
              aria-hidden="true"
              className="size-4 transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>

          <p className="mt-5 flex items-center gap-2 text-[12px] font-medium text-[#003366]/65 sm:text-[13px]">
            <FiCheckCircle aria-hidden="true" className="size-4 text-[#e95f2d]" />
            Support before and after your booking
          </p>
        </div>

        <div className="min-w-0">
          <div className="flex items-center justify-between gap-5 border-b border-[#003366]/15 pb-5">
            <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-[#003366] sm:text-[14px]">
              What you can expect
            </p>
            <span className="text-[12px] font-medium text-slate-400">
              06 essentials
            </span>
          </div>

          <ul className="grid sm:grid-cols-2">
            {strengths.map(({ icon: Icon, title, text }, index) => (
              <li
                key={title}
                className={`group border-b border-[#003366]/12 py-6 sm:min-h-[210px] sm:px-6 sm:py-7 lg:min-h-[220px] lg:px-7 lg:py-8 ${
                  index % 2 === 0 ? 'sm:border-r' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#f5f3ed] text-[#003366] transition-colors duration-300 group-hover:bg-[#003366] group-hover:text-white">
                    <Icon aria-hidden="true" className="size-[19px]" />
                  </span>

                  <div className="min-w-0 pt-0.5">
                    <h3 className="text-[17px] font-semibold leading-[23px] tracking-[-0.02em] text-[#003366] sm:text-[18px]">
                      {title}
                    </h3>
                    <p className="mt-2 text-[14px] leading-[23px] text-slate-600 sm:text-[15px] sm:leading-[24px]">
                      {text}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

export default WhyChooseUs
