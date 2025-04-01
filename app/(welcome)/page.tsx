// components/(welcome)/page.tsx

import Navigation from './components/navigation'
import HeroSection from './components/hero-section'
import EarlyAdopterOffer from './components/early-adopter-offer'
import FeaturesGrid from './components/features-grid'
import AssetClasses from './components/asset-classes'
import HowItWorks from './components/how-it-works'
import CallToAction from './components/call-to-action'
import Footer from './components/footer'

export default function WelcomePage() {
  return (
    <div className="min-h-screen relative">
      {/* Background image with different image for small screens */}
      <div className="absolute inset-0 bg-[url('/blue_bg_sm.avif')] sm:bg-[url('/blue_bg.avif')] bg-no-repeat bg-cover sm:rotate-180"></div>
      
      {/* Content */}
      <div className="relative z-10">
        <Navigation />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <HeroSection />
          <EarlyAdopterOffer />
          <FeaturesGrid />
          <AssetClasses />
          <HowItWorks />
          <CallToAction />
        </main>
        <Footer />
      </div>
    </div>
  )
}