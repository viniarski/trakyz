// app/welcome/page.tsx

'use client'

import Image from 'next/image'
import Navigation from './components/navigation'
import HeroSection from './components/hero-section'
import EarlyAdopterOffer from './components/early-adopter-offer'
import FeaturesGrid from './components/features-grid'
import AssetClasses from './components/asset-classes'
import HowItWorks from './components/how-it-works'
import PricingSection from './components/pricing-section'
import CallToAction from './components/call-to-action'
import Footer from './components/footer'

export default function WelcomePage() {
  return (
    <div className="min-h-screen relative">
      {/* Background Image with Next.js Image Component */}
      <Image
        src="/blue_bg.avif"
        alt="Background"
        fill
        sizes="100vw"
        quality={100}
        priority={false}
        className="object-cover sm:rotate-180"
        placeholder="blur"
        blurDataURL="/blue_bg_sm.avif" // Optional: low-res placeholder
      />
      
      {/* Content */}
      <div className="relative z-10">
        <Navigation />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <HeroSection />
          <EarlyAdopterOffer />
          <FeaturesGrid />
          <AssetClasses />
          <HowItWorks />
          <PricingSection />
          <CallToAction />
        </main>
        <Footer />
      </div>
    </div>
  )
}