'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { toast } from '@/components/ui/toast'

export default function NFCCardsPage() {
  const [nfcCards, setNfcCards] = useState([
    { id: 'NFC-001', name: 'My Card', lastUsed: '2024-01-15', balance: 500, active: true },
    { id: 'NFC-002', name: 'Business Card', lastUsed: '2024-01-10', balance: 1200, active: true },
  ])
  const [newCardName, setNewCardName] = useState('')

  const handleLinkCard = () => {
    if (!newCardName.trim()) {
      toast({ title: 'Error', description: 'Please enter a card name', variant: 'destructive' })
      return
    }
    toast({ title: 'Success', description: 'NFC card linked successfully!' })
    setNewCardName('')
  }

  const toggleCardStatus = (id: string) => {
    setNfcCards(cards =>
      cards.map(card =>
        card.id === id ? { ...card, active: !card.active } : card
      )
    )
    toast({ title: 'Success', description: 'Card status updated' })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 animate-slideIn">
        <h1 className="text-4xl font-bold mb-2">NFC Cards</h1>
        <p className="text-muted-foreground">Manage your NFC payment cards and rewards</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Card className="animate-slideIn">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Total Cards</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{nfcCards.length}</p>
          </CardContent>
        </Card>
        <Card className="animate-slideIn">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Active Cards</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {nfcCards.filter(c => c.active).length}
            </p>
          </CardContent>
        </Card>
        <Card className="animate-slideIn">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              ${nfcCards.reduce((sum, c) => sum + c.balance, 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8 animate-slideIn">
        <CardHeader>
          <CardTitle>Link New NFC Card</CardTitle>
          <CardDescription>Add a new NFC card to your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cardName">Card Name</Label>
            <Input
              id="cardName"
              placeholder="e.g., My Visa Card"
              value={newCardName}
              onChange={(e) => setNewCardName(e.target.value)}
            />
          </div>
          <div className="p-4 border-2 border-dashed rounded-lg text-center text-muted-foreground">
            <p className="text-sm">📱 Tap your NFC card to link</p>
            <p className="text-xs mt-2">(NFC simulation - requires WebNFC API)</p>
          </div>
          <Button onClick={handleLinkCard} className="w-full">
            Link Card
          </Button>
        </CardContent>
      </Card>

      <Card className="animate-slideIn">
        <CardHeader>
          <CardTitle>Your Cards</CardTitle>
          <CardDescription>{nfcCards.length} cards on your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {nfcCards.map((card) => (
              <div key={card.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-smooth">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="font-semibold">{card.name}</p>
                    <Badge variant={card.active ? 'default' : 'secondary'}>
                      {card.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground font-mono">{card.id}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Last used: {card.lastUsed}
                  </p>
                </div>

                <div className="text-right mr-4">
                  <p className="font-semibold text-lg">${card.balance}</p>
                  <p className="text-xs text-muted-foreground">Balance</p>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={card.active}
                    onCheckedChange={() => toggleCardStatus(card.id)}
                  />
                  <Button variant="ghost" size="sm">⋮</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
