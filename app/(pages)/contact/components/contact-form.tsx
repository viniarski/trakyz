// app/contact/components/contact-form.tsx

'use client'

import { useState } from 'react'
import HCaptcha from '@hcaptcha/react-hcaptcha'
import Link from 'next/link'

export default function ContactForm() {
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [hCaptchaToken, setHCaptchaToken] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleHCaptchaVerify = (token: string) => {
    console.log('hCaptcha Token Generated:', token)
    setHCaptchaToken(token)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!hCaptchaToken) {
      setSubmitStatus('error')
      setErrorMessage('Please complete the CAPTCHA.')
      return
    }
    setSubmitStatus('submitting')
    setErrorMessage(null)

    const form = e.currentTarget
    const formData = {
      access_key: process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY,
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      message: (form.elements.namedItem('message') as HTMLTextAreaElement).value,
      'h-captcha-response': hCaptchaToken,
    }
    console.log('Form Data Sent to Web3Forms:', JSON.stringify(formData, null, 2))

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()
      console.log('Web3Forms Response:', JSON.stringify(result, null, 2))

      if (result.success) {
        setSubmitStatus('success')
        form.reset()
        setHCaptchaToken(null)
      } else {
        setSubmitStatus('error')
        setErrorMessage(result.message || 'Submission failed. Please try again.')
      }
    } catch (error) {
      console.error('Network Error:', error)
      setSubmitStatus('error')
      setErrorMessage('Network error. Please check your connection and try again.')
    }
    setTimeout(() => {
      setSubmitStatus('idle')
      setErrorMessage(null)
    }, 5000)
  }

  return (
    <section className="bg-[var(--bg-secondary)] rounded-xl p-6 text-center">
      <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-6">Get in Touch</h2>
      <p className="text-[var(--text-secondary)] mb-6">
        Whether you have a question, need support, or want to help shape Trakyz’s future, we’d love to hear from you! Email us at{' '}
        <Link
          href="mailto:support@trakyz.com"
          className="text-[var(--accent-primary)] hover:text-[var(--accent-secondary)] transition-colors"
        >
          support@trakyz.com
        </Link>{' '}
        (typically responds within 24 hours) or use the form below.
      </p>
      <div className="max-w-md mx-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              required
              className="w-full px-4 py-2 bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--bg-hover)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary-80)]"
            />
          </div>
          <div>
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              required
              className="w-full px-4 py-2 bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--bg-hover)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary-80)]"
            />
          </div>
          <div>
            <textarea
              name="message"
              placeholder="Your Message or Feedback"
              rows={4}
              required
              className="w-full px-4 py-2 bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--bg-hover)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary-80)] resize-none"
            />
          </div>
          <div className="flex justify-center">
            <HCaptcha
              sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || '50b2fe65-b00b-4b9e-ad62-3ba471098be2'}
              reCaptchaCompat={false}
              onVerify={handleHCaptchaVerify}
            />
          </div>
          <button
            type="submit"
            disabled={submitStatus === 'submitting' || !hCaptchaToken}
            className="w-full px-6 py-3 bg-blue-500/20 text-blue-500 rounded-xl hover:bg-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitStatus === 'submitting' ? 'Sending...' : 'Send Message'}
          </button>
        </form>
        {submitStatus === 'success' && (
          <p className="text-sm text-[var(--accent-primary)] mt-4">Thank you! Your message has been sent successfully.</p>
        )}
        {submitStatus === 'error' && (
          <p className="text-sm text-red-500 mt-4">
            {errorMessage || 'Something went wrong. Please try again or email us directly.'}
          </p>
        )}
      </div>
    </section>
  )
}