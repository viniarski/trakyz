// app/(pages)/about/components/about-overview.tsx

'use client'

export default function AboutOverview() {
  return (
    <section className="bg-[var(--bg-secondary)] rounded-xl p-6">
      <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-6">Who We Are</h2>
      <p className="text-[var(--text-secondary)] mb-4">
        Trakyz is a modern investment tracking platform designed to simplify and enhance how you manage your financial assets. We provide a seamless, secure, and intuitive experience for tracking diverse portfolios, from stocks and cryptocurrencies to precious metals and real estate.
      </p>
      <p className="text-[var(--text-secondary)]">
        Our mission is to empower investors—whether beginners or seasoned professionals—with the tools and insights they need to make informed decisions, all within a sleek, user-friendly interface.
      </p>
    </section>
  )
}