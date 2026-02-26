'use client'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export function FeeSelector({ config, setConfig, onNext, onBack }) {
  return (
    <Card>
      <CardHeader><CardTitle>Fee Structure</CardTitle><CardDescription>Choose how fees work for your token</CardDescription></CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Buy Fee (%)</Label><Input type="number" value={config.fees.buyFee / 100} onChange={(e) => setConfig({ ...config, fees: { ...config.fees, buyFee: parseFloat(e.target.value) * 100 } })} /></div>
          <div><Label>Sell Fee (%)</Label><Input type="number" value={config.fees.sellFee / 100} onChange={(e) => setConfig({ ...config, fees: { ...config.fees, sellFee: parseFloat(e.target.value) * 100 } })} /></div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between"><Button variant="outline" onClick={onBack}>Back</Button><Button variant="gold" onClick={onNext}>Next: Select Chains</Button></CardFooter>
    </Card>
  )
}
