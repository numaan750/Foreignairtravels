import Link from 'next/link'
import { FiArrowRight, FiPlus } from 'react-icons/fi'

const faqs = [
  {
    question: 'What information do you need to plan my trip?',
    answer:
      'Share your preferred destination, travel dates, number of travellers, departure city and approximate budget. If your dates are flexible, mention that too so the team can compare more suitable options.',
  },
  {
    question: 'Can you help with both flights and hotels?',
    answer:
      'Yes. Flight and hotel options can be planned together, along with tours, airport transfers and other arrangements required for your itinerary.',
  },
  {
    question: 'Do you guarantee visa approval?',
    answer:
      'No travel agency can guarantee a visa decision because approvals are made by the relevant embassy or immigration authority. The team can guide you through requirements and help organise the application documents.',
  },
  {
    question: 'Can I request changes after booking?',
    answer:
      'Contact the team as early as possible. Changes depend on airline, hotel and supplier rules, and may include fare differences or service charges. Available options will be explained before any change is confirmed.',
  },
  {
    question: 'Do you arrange family and group travel?',
    answer:
      'Yes. Share the group size, room preferences and any special requirements so the team can build a practical plan for families, friends or organised groups.',
  },
]

const TravelFaqs = () => {
  return (
    <section
      id="faqs"
      aria-labelledby="faq-title"
      className="scroll-mt-[96px] overflow-hidden bg-[#f7f8f6] py-[64px] sm:py-[84px] lg:py-[112px]"
    >
      <div className="mycontainer grid items-start gap-10 lg:grid-cols-[minmax(300px,0.72fr)_minmax(0,1.28fr)] lg:gap-16 xl:gap-24">
        <div className="max-w-[560px] lg:sticky lg:top-[112px]">
          <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#e95f2d] sm:text-[12px]">
            <span aria-hidden="true" className="h-px w-8 bg-[#e95f2d]" />
            Good to know
          </p>

          <h2
            id="faq-title"
            className="mt-5 text-[34px] font-semibold leading-[1.08] tracking-[-0.045em] text-[#003366] text-balance sm:text-[44px] lg:text-[50px]"
          >
            Answers Before You Start Planning.
          </h2>

          <p className="mt-6 max-w-[500px] text-[15px] leading-[26px] text-slate-600 sm:text-[16px] sm:leading-[28px]">
            A few practical details to help you prepare. For anything specific,
            our team can guide you directly.
          </p>

          <Link
            href="#contact"
            className="group mt-8 inline-flex h-[50px] w-full items-center justify-center gap-3 rounded-full bg-[#003366] px-6 text-[14px] font-semibold text-white transition-colors duration-300 hover:bg-[#0b455d] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff6b35] min-[430px]:w-auto sm:text-[15px]"
          >
            Ask another question
            <FiArrowRight
              aria-hidden="true"
              className="size-4 transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>

        <div className="min-w-0">
          <div>
            {faqs.map(({ question, answer }, index) => (
              <details
                key={question}
                name="travel-faqs"
                open={index === 0}
                className="group border-b border-[#003366]/15"
              >
                <summary className="flex min-h-[76px] cursor-pointer list-none items-center justify-between gap-5 py-5 text-[#003366] outline-none transition-colors hover:text-[#e95f2d] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff6b35] sm:min-h-[84px] sm:py-6 [&::-webkit-details-marker]:hidden">
                  <span className="text-[15px] font-semibold leading-[23px] sm:text-[17px] sm:leading-[25px]">
                    {question}
                  </span>
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full text-[#003366] transition-all duration-300 group-open:rotate-45 group-open:border-[#ff6b35] group-open:text-[#e95f2d] sm:size-9">
                    <FiPlus aria-hidden="true" className="size-4" />
                  </span>
                </summary>

                <div className="pb-6 pr-10 sm:pb-7 sm:pr-14">
                  <p className="max-w-[720px] text-[14px] leading-[24px] text-slate-600 sm:text-[15px] sm:leading-[26px]">
                    {answer}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default TravelFaqs
