// app/(pages)/about/components/about-header.tsx

'use client'

export default function AboutHeader() {
  return (
    <div className="mb-12">
      <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-4">About Trakyz</h1>
      <p className="text-lg text-[var(--text-secondary)]">
        Empowering investors with cutting-edge portfolio management tools.
      </p>
    </div>
  )
}