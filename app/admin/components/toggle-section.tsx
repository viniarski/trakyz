// app/admin/components/toggle-section.tsx

import { EarlyAdopterToggle } from './early-adopter-toggle'
import { FreeTrialToggle } from './free-trial-toggle'

export default function ToggleSection() {
  return (
    <>
      <div className="mb-8">
        <EarlyAdopterToggle />
      </div>
      <div className="mb-8">
        <FreeTrialToggle />
      </div>
    </>
  )
}