'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'

export function TokenForm({ config, setConfig, onNext }) {
  const [errors, setErrors] = useState<any>({})

  const validate = () => {
    const newErrors: any = {}
    if (!config.name) newErrors.name = 'Token name is required'
    if (!config.symbol) newErrors.symbol = 'Token symbol is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  return (
    <Card>
      <CardHeader><CardTitle>Basic Information</CardTitle><CardDescription>Enter the basic details for your token</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <Label htmlFor="name">Token Name</Label>
        <Input id="name" value={config.name} onChange={(e) => setConfig({ ...config, name: e.target.value })} />
        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
        <Label htmlFor="symbol">Token Symbol</Label>
        <Input id="symbol" value={config.symbol} onChange={(e) => setConfig({ ...config, symbol: e.target.value.toUpperCase() })} />
        <div className="flex items-center justify-between"><Label htmlFor="mintable">Mintable</Label><Switch id="mintable" checked={config.features.mintable} onCheckedChange={(v) => setConfig({ ...config, features: { ...config.features, mintable: v } })} /></div>
      </CardContent>
      <CardFooter><Button variant="gold" className="w-full" onClick={() => validate() && onNext()}>Next: Configure Fees</Button></CardFooter>
    </Card>
  )
}
