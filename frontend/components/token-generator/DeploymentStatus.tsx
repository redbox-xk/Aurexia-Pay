'use client'

export function DeploymentStatus({ status }) {
  return (
    <div className="rounded-lg border p-4">
      <p className="font-medium">{status.status}</p>
      <p>{status.message}</p>
    </div>
  )
}
