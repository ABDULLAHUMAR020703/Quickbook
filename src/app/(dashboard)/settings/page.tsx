'use client'

import { useEffect, useState } from 'react'
import { Save, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input, Select } from '@/components/ui/input'
import { PageHeader } from '@/components/ui/page-header'

interface Settings {
  companyName: string; legalName: string; taxId: string; address: string
  city: string; country: string; phone: string; email: string
  currency: string; fiscalYearStart: string; zatcaEnabled: boolean
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    companyName: 'NETKOM COMPANY FOR COMMUNICATION', legalName: '', taxId: '',
    address: '', city: '', country: 'Saudi Arabia', phone: '', email: '',
    currency: 'SAR', fiscalYearStart: '01-01', zatcaEnabled: false,
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(d => { if (d) setSettings(s => ({ ...s, ...d })) }).catch(() => null)
  }, [])

  async function handleSave() {
    setSaving(true)
    const res = await fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings) })
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000) }
    setSaving(false)
  }

  const f = (field: keyof Settings, val: string | boolean) => setSettings(s => ({ ...s, [field]: val }))

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="Settings"
        subtitle="Company information and system configuration"
        breadcrumb={[{ label: 'Administration' }, { label: 'Settings' }]}
        action={
          <div className="flex items-center gap-3">
            {saved && <span className="text-sm text-emerald-600 font-medium bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg">✓ Saved</span>}
            <Button onClick={handleSave} loading={saving}><Save size={15} /> Save Changes</Button>
          </div>
        }
      />

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
            <Building2 size={18} className="text-indigo-600" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">Company Information</h2>
            <p className="text-xs text-slate-400">Legal and billing details</p>
          </div>
        </div>
        <Input label="Company Name" required value={settings.companyName} onChange={e => f('companyName', e.target.value)} />
        <Input label="Legal Name" value={settings.legalName} onChange={e => f('legalName', e.target.value)} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Tax ID (VAT #)" value={settings.taxId} onChange={e => f('taxId', e.target.value)} placeholder="3xxxxxxxxxxxxxxxxxxx3" />
          <Input label="Email" type="email" value={settings.email} onChange={e => f('email', e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Phone" value={settings.phone} onChange={e => f('phone', e.target.value)} />
          <Input label="City" value={settings.city} onChange={e => f('city', e.target.value)} />
        </div>
        <Input label="Address" value={settings.address} onChange={e => f('address', e.target.value)} />
        <Input label="Country" value={settings.country} onChange={e => f('country', e.target.value)} />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
        <div className="pb-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Financial Settings</h2>
          <p className="text-xs text-slate-400">Currency and fiscal year configuration</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Select label="Currency" value={settings.currency} onChange={e => f('currency', e.target.value)}>
            <option value="SAR">SAR — Saudi Riyal</option>
            <option value="USD">USD — US Dollar</option>
            <option value="EUR">EUR — Euro</option>
            <option value="AED">AED — UAE Dirham</option>
          </Select>
          <Input label="Fiscal Year Start (MM-DD)" value={settings.fiscalYearStart} onChange={e => f('fiscalYearStart', e.target.value)} placeholder="01-01" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="pb-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">ZATCA / E-invoicing</h2>
          <p className="text-xs text-slate-400">Saudi e-invoicing compliance settings</p>
        </div>
        <label className="flex items-start gap-3 cursor-pointer group">
          <div className="relative mt-0.5">
            <input
              type="checkbox"
              checked={settings.zatcaEnabled}
              onChange={e => f('zatcaEnabled', e.target.checked)}
              className="sr-only"
            />
            <div className={`w-10 h-6 rounded-full transition-colors ${settings.zatcaEnabled ? 'bg-indigo-600' : 'bg-slate-200'}`}>
              <div className={`w-4 h-4 bg-white rounded-full shadow-sm absolute top-1 transition-transform ${settings.zatcaEnabled ? 'translate-x-5' : 'translate-x-1'}`} />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700">Enable ZATCA Integration</p>
            <p className="text-xs text-slate-400 mt-0.5">Enable Phase 2 e-invoicing compliance with QR codes and XML generation</p>
          </div>
        </label>
      </div>
    </div>
  )
}
