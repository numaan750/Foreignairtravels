import Hero from './home-components/Hero'
import About from './home-components/About'
import Services from './home-components/Services'
import AirlinePartners from './home-components/AirlinePartners'
import CountryCoverage from './home-components/CountryCoverage'
import BookingProcess from './home-components/BookingProcess'
import WhyChooseUs from './home-components/WhyChooseUsSection'
import TravelFaqs from './home-components/TravelFaqs'
import TravelCta from './home-components/TravelCta'

const HomeMain = () => {
  return (
    <main>
      <Hero />
      <About />
      <Services />
      <AirlinePartners />
      <CountryCoverage />
      <BookingProcess />
      <WhyChooseUs />
      <TravelFaqs />
      <TravelCta />
    </main>
  )
}

export default HomeMain
