import Navbar from '@/mutual-componenst/Navbar'
import Footer from '@/mutual-componenst/Footer'
import AnnouncementBar from '@/mutual-componenst/AnnouncementBar'

export default function SiteLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <AnnouncementBar />
      {children}
      <Footer />
    </div>
  )
}
