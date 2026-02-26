'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { TokenForm } from '@/components/token-generator/TokenForm'
import { FeeSelector } from '@/components/token-generator/FeeSelector'
import { ChainSelector } from '@/components/token-generator/ChainSelector'
import { TokenPreview } from '@/components/token-generator/TokenPreview'
import { DeploymentStatus } from '@/components/token-generator/DeploymentStatus'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { InfoIcon } from 'lucide-react'

export default function CreateTokenPage() {
  const { address, isConnected } = useAccount()
  const [step, setStep] = useState(1)
  const [tokenConfig, setTokenConfig] = useState({
    name: '', symbol: '', totalSupply: 1000000, decimals: 18, feeType: 'STANDARD',
    fees: { buyFee: 0, sellFee: 0, transferFee: 0, reflectionFee: 0, liquidityFee: 0, marketingFee: 0, burnFee: 0, marketingWallet: '' },
    features: { mintable: false, burnable: true, pausable: true, snapshot: false, permit: true, votes: false, blacklist: true },
    limits: { maxTxAmount: 0, maxWalletAmount: 0 },
    chains: ['AUREXIA_MAINNET'], owner: address || ''
  })
  const [deploymentStatus, setDeploymentStatus] = useState<any>(null)

  const handleDeploy = async () => {
    setDeploymentStatus({ status: 'deploying', message: 'Deploying your token...' })
    try {
      const response = await fetch('/api/v1/factory/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: tokenConfig, chains: tokenConfig.chains })
      })
      const data = await response.json()
      setDeploymentStatus({ status: 'success', message: 'Token deployed successfully!', data })
    } catch (error: any) {
      setDeploymentStatus({ status: 'error', message: error.message })
    }
  }

  if (!isConnected) {
    return <div className="container mx-auto py-12"><Card><CardHeader><CardTitle>Connect Wallet</CardTitle><CardDescription>Please connect your wallet to create a token</CardDescription></CardHeader></Card></div>
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Token Generator</h1>
        <Alert className="mb-6"><InfoIcon className="h-4 w-4" /><AlertDescription>Deployment fee: {tokenConfig.chains.length * 1000} AURX + gas.</AlertDescription></Alert>
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            {step === 1 && <TokenForm config={tokenConfig} setConfig={setTokenConfig} onNext={() => setStep(2)} />}
            {step === 2 && <FeeSelector config={tokenConfig} setConfig={setTokenConfig} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
            {step === 3 && <ChainSelector config={tokenConfig} setConfig={setTokenConfig} onNext={() => setStep(4)} onBack={() => setStep(2)} />}
            {step === 4 && <Card><CardHeader><CardTitle>Review & Deploy</CardTitle></CardHeader><CardContent><Button variant="gold" onClick={handleDeploy}>Deploy Token</Button></CardContent></Card>}
          </div>
          <div><TokenPreview config={tokenConfig} /></div>
        </div>
        {deploymentStatus && <div className="mt-8"><DeploymentStatus status={deploymentStatus} /></div>}
      </div>
    </div>
  )
}
