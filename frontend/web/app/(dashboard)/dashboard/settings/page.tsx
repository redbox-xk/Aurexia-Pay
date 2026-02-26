'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { toast } from '@/components/ui/toast'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    merchantName: 'My Business',
    email: 'contact@mybusiness.com',
    webhookUrl: 'https://api.example.com/webhooks',
    notifyOnPayment: true,
    notifyOnFailure: true,
    requireSignature: true,
    apiKeyPublic: 'pk_test_123456789',
    apiKeySecret: 'sk_test_•••••••••••••••',
  })

  const handleSave = () => {
    toast({ title: 'Success', description: 'Settings saved successfully!' })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 animate-slideIn">
        <h1 className="text-4xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account and API settings</p>
      </div>

      <div className="space-y-6">
        {/* Merchant Info */}
        <Card className="animate-slideIn">
          <CardHeader>
            <CardTitle>Merchant Information</CardTitle>
            <CardDescription>Your business details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="merchantName">Business Name</Label>
                <Input
                  id="merchantName"
                  value={settings.merchantName}
                  onChange={(e) => setSettings({ ...settings, merchantName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                />
              </div>
            </div>
            <Button onClick={handleSave}>Save Changes</Button>
          </CardContent>
        </Card>

        {/* Webhook Settings */}
        <Card className="animate-slideIn">
          <CardHeader>
            <CardTitle>Webhook Configuration</CardTitle>
            <CardDescription>Receive real-time payment events</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="webhookUrl">Webhook URL</Label>
              <Input
                id="webhookUrl"
                value={settings.webhookUrl}
                onChange={(e) => setSettings({ ...settings, webhookUrl: e.target.value })}
                placeholder="https://example.com/webhooks"
              />
              <p className="text-xs text-muted-foreground">
                Events: payment.success, payment.failed, subscription.created, refund.processed
              </p>
            </div>
            <Button variant="outline">Test Webhook</Button>
            <Button onClick={handleSave}>Save Webhook</Button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="animate-slideIn">
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Email notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Payment Confirmations</p>
                <p className="text-sm text-muted-foreground">Notify on successful payments</p>
              </div>
              <Switch
                checked={settings.notifyOnPayment}
                onCheckedChange={(checked) => setSettings({ ...settings, notifyOnPayment: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Payment Failures</p>
                <p className="text-sm text-muted-foreground">Alert on failed transactions</p>
              </div>
              <Switch
                checked={settings.notifyOnFailure}
                onCheckedChange={(checked) => setSettings({ ...settings, notifyOnFailure: checked })}
              />
            </div>
            <Button onClick={handleSave}>Save Preferences</Button>
          </CardContent>
        </Card>

        {/* API Keys */}
        <Card className="animate-slideIn border-yellow-200">
          <CardHeader>
            <CardTitle>API Keys</CardTitle>
            <CardDescription>Keep these keys secure and never share them publicly</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="publicKey">Public Key</Label>
              <div className="flex gap-2">
                <Input
                  id="publicKey"
                  type="password"
                  value={settings.apiKeyPublic}
                  disabled
                />
                <Button variant="outline" size="sm">Copy</Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="secretKey">Secret Key</Label>
              <div className="flex gap-2">
                <Input
                  id="secretKey"
                  type="password"
                  value={settings.apiKeySecret}
                  disabled
                />
                <Button variant="outline" size="sm">Regenerate</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="animate-slideIn">
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Account security settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Require Signature</p>
                <p className="text-sm text-muted-foreground">Verify request signatures</p>
              </div>
              <Switch
                checked={settings.requireSignature}
                onCheckedChange={(checked) => setSettings({ ...settings, requireSignature: checked })}
              />
            </div>
            <Button variant="outline" className="w-full">Change Password</Button>
            <Button variant="outline" className="w-full">Enable 2FA</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
