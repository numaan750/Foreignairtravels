import Navbar from '@/mutual-componenst/Navbar'
import Footer from '@/mutual-componenst/Footer'

export default function LoginLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      {children}
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  )
}
