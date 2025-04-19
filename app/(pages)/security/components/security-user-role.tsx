// app/(pages)/security/components/security-user-role.tsx

'use client'

export default function SecurityUserRole() {
  return (
    <section>
      <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6 text-center">Your Role in Security</h2>
      <p className="text-[var(--text-secondary)] mb-4 text-center">
        You play a key role in keeping your Trakyz account secure:
      </p>
      <div className="space-y-4">
        <div className="bg-[var(--bg-secondary)] rounded-xl p-4">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Secure Your Authentication</h3>
          <p className="text-[var(--text-secondary)] text-sm">
            Enable 2FA on your account method (Email, Google, GitHub, X, or LinkedIn) that you use to access Trakyz and use a strong, unique password for maximum protection.
          </p>
        </div>
        <div className="bg-[var(--bg-secondary)] rounded-xl p-4">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Use YubiKey (Optional)</h3>
          <p className="text-[var(--text-secondary)] text-sm">
            Add a physical YubiKey as an extra MFA layer in your authentication provider settings for maximum protection.
          </p>
        </div>
        <div className="bg-[var(--bg-secondary)] rounded-xl p-4">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Stay Vigilant</h3>
          <p className="text-[var(--text-secondary)] text-sm">
            Avoid phishing attempts and only log in via https://trakyz.com. Report issues to us immediately.
          </p>
        </div>
      </div>
    </section>
  )
}