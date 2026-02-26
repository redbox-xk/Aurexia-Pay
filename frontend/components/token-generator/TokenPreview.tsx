'use client'

export function TokenPreview({ config }) {
  return (
    <div className="rounded-lg border p-4">
      <h3 className="font-semibold">Live Preview</h3>
      <p>{config.name || 'Untitled Token'} ({config.symbol || 'TKN'})</p>
    </div>
  )
}
