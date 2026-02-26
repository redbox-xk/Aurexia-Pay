'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function SettingsPage() {
  const [merchantName, setMerchantName] = useState('Acme Corporation')
  const [email, setEmail] = useState('admin@acme.com')
  const [webhookUrl, setWebhookUrl] = useState('https://example.com/webhooks')
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')

  const handleSaveProfile = async () => {
    setSaveStatus('saving')
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSaveStatus('saved')
    setTimeout(() => setSaveStatus('idle'), 2000)
  }

  const handleSaveWebhook = async () => {
    setSaveStatus('saving')
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSaveStatus('saved')
    setTimeout(() => setSaveStatus('idle'), 2000)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/40 bg-muted/50 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your merchant profile details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Business Name</label>
                  <Input
                    value={merchantName}
                    onChange={(e) => setMerchantName(e.target.value)}
                    className="mt-2"
                    placeholder="Business name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Email Address</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-2"
                    placeholder="Email address"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Account Tier</label>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-semibold">Premium</p>
                    <p className="text-xs text-muted-foreground">29 basis points + $0.005 per transaction</p>
                  </div>
                </div>
                <Button 
                  onClick={handleSaveProfile}
                  disabled={saveStatus === 'saving'}
                  className="w-full"
                >
                  {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save Changes'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Webhooks Tab */}
          <TabsContent value="webhooks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Webhook Configuration</CardTitle>
                <CardDescription>Configure webhook endpoints for event notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Webhook URL</label>
                  <Input
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="mt-2"
                    placeholder="https://example.com/webhooks"
                  />
                  <p className="text-xs text-muted-foreground mt-1">We'll send events to this URL</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Events to Receive</label>
                  <div className="space-y-2">
                    {[
                      { id: 'payment.created', label: 'Payment Created' },
                      { id: 'payment.succeeded', label: 'Payment Succeeded' },
                      { id: 'payment.failed', label: 'Payment Failed' },
                      { id: 'refund.created', label: 'Refund Created' },
                      { id: 'settlement.completed', label: 'Settlement Completed' },
                    ].map((event) => (
                      <label key={event.id} className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked className="rounded" />
                        <span className="text-sm">{event.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={handleSaveWebhook}
                  disabled={saveStatus === 'saving'}
                  className="w-full"
                >
                  {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save Webhook'}
                </Button>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-900">
                    Test your webhook with our test event button. Check your server logs to verify receipt.
                  </p>
                  <Button variant="outline" className="mt-3 w-full" size="sm">
                    Send Test Event
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Control how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {[
                    { id: 'email', label: 'Email Notifications', enabled: true },
                    { id: 'push', label: 'Push Notifications', enabled: false },
                    { id: 'sms', label: 'SMS Notifications', enabled: false },
                  ].map((channel) => (
                    <div key={channel.id} className="flex items-center justify-between p-3 border border-border/50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{channel.label}</p>
                        <p className="text-xs text-muted-foreground">Receive alerts via {channel.label.toLowerCase()}</p>
                      </div>
                      <input 
                        type="checkbox" 
                        defaultChecked={channel.enabled}
                        className="rounded"
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-2 mt-4">
                  <label className="text-sm font-medium">Notify me about:</label>
                  <div className="space-y-2">
                    {[
                      'Payment succeeded',
                      'Payment failed',
                      'Refund processed',
                      'Settlement completed',
                      'Suspicious activity',
                    ].map((event) => (
                      <label key={event} className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked className="rounded" />
                        <span className="text-sm">{event}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <Button className="w-full">Save Preferences</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your account security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 border border-border/50 rounded-lg">
                    <p className="font-medium text-sm">Change Password</p>
                    <p className="text-xs text-muted-foreground mb-3">Update your password regularly</p>
                    <Button variant="outline" size="sm">Change Password</Button>
                  </div>

                  <div className="p-3 border border-border/50 rounded-lg">
                    <p className="font-medium text-sm">Two-Factor Authentication</p>
                    <p className="text-xs text-muted-foreground mb-3">Add an extra layer of security</p>
                    <Button variant="outline" size="sm">Enable 2FA</Button>
                  </div>

                  <div className="p-3 border border-border/50 rounded-lg">
                    <p className="font-medium text-sm">API Key Rotation</p>
                    <p className="text-xs text-muted-foreground mb-3">Rotate your API keys for security</p>
                    <Button variant="outline" size="sm">Rotate Keys</Button>
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
                  <p className="font-semibold text-red-900">Danger Zone</p>
                  <Button variant="destructive" className="w-full">Deactivate Account</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Billing & Pricing</CardTitle>
                <CardDescription>View your current plan and billing information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Current Plan</p>
                  <p className="text-2xl font-bold mt-1">Premium</p>
                  <p className="text-sm mt-2">29 basis points + $0.005 per transaction</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 border border-border/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Monthly Volume Limit</p>
                    <p className="text-lg font-semibold mt-1">1M AURX</p>
                  </div>
                  <div className="p-3 border border-border/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Transaction Limit</p>
                    <p className="text-lg font-semibold mt-1">10K AURX</p>
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  <p className="text-sm font-medium">Next Billing Date</p>
                  <p className="text-sm text-muted-foreground">March 26, 2026</p>
                </div>

                <Button variant="outline" className="w-full">Download Invoice</Button>
                <Button variant="outline" className="w-full">View Billing History</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
