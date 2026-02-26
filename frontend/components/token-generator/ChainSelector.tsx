'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'

export function ChainSelector({ config, setConfig, onNext, onBack }) {
  const [selectedChains, setSelectedChains] = useState(config.chains)
  const chains = [
    { id: 'AUREXIA_MAINNET', name: 'Aurexia Mainnet', fee: 1000, active: true },
    { id: 'ETHEREUM', name: 'Ethereum', fee: 500, active: true },
    { id: 'POLYGON', name: 'Polygon', fee: 500, active: true }
  ]

  return (
    <Card>
      <CardHeader><CardTitle>Select Chains</CardTitle><CardDescription>Choose which blockchains to deploy your token on</CardDescription></CardHeader>
      <CardContent>{chains.map((chain) => <div key={chain.id} className="flex items-center gap-2 py-2"><Checkbox checked={selectedChains.includes(chain.id)} onCheckedChange={() => setSelectedChains((prev) => prev.includes(chain.id) ? prev.filter((c) => c !== chain.id) : [...prev, chain.id])} /><span>{chain.name}</span></div>)}</CardContent>
      <CardFooter className="flex justify-between"><Button variant="outline" onClick={onBack}>Back</Button><Button variant="gold" onClick={() => { setConfig({ ...config, chains: selectedChains }); onNext(); }}>Next: Review & Deploy</Button></CardFooter>
    </Card>
  )
}
