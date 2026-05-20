'use client'

import { useEffect, useState } from 'react'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts'
import {
  TrendingUp, TrendingDown, Clock, AlertCircle, ArrowRight,
  RefreshCw, FileText, Receipt
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface DashboardData {
  kpis: {
    totalRevenue: number
    totalExpenses: number
    accountsReceivable: number
    accountsPayable: number
  }
  monthlyData: { month: string; revenue: number; expenses: number }[]
  aging: { current: number; days30: number; days60: number; days90plus: number }
  recentInvoices: {
    id: string; invoiceNo: string; customer: { name: string }
    total: number; status: string; dueDate: string
  }[]
  recentBills: {
    id: string; billNo: string; vendor: { name: string }
    total: number; status: string; dueDate: string
  }[]
}

const AGING_COLORS = ['#22c55e', '#eab308', '#f97316', '#ef4444']

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xl p-3 min-w-[160px]">
      <p className="text-xs font-semibold text-slate-500 mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-slate-600">{p.name}</span>
          </div>
          <span className="font-semibold text-slate-900">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)
  const [seedMsg, setSeedMsg] = useState('')

  async function loadData() {
    setLoading(true)
    try {
      const res = await fetch('/api/dashboard')
      if (res.ok) setData(await res.json())
    } catch { /**/ }
    setLoading(false)
  }

  async function handleSeed() {
    setSeeding(true)
    setSeedMsg('')
    try {
      const res = await fetch('/api/seed', { method: 'POST' })
      const d = await res.json()
      setSeedMsg(d.message || d.error || 'Done')
      await loadData()
    } finally {
      setSeeding(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const kpis = data?.kpis ?? { totalRevenue: 0, totalExpenses: 0, accountsReceivable: 0, accountsPayable: 0 }
  const netProfit = kpis.totalRevenue - kpis.totalExpenses

  const agingData = data ? [
    { name: 'Current', value: data.aging.current },
    { name: '1–30 days', value: data.aging.days30 },
    { name: '31–60 days', value: data.aging.days60 },
    { name: '90+ days', value: data.aging.days90plus },
  ] : []

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Financial Overview</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            NETKOM COMPANY FOR COMMUNICATION · {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {seedMsg && (
            <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg font-medium">
              ✓ {seedMsg}
            </span>
          )}
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl disabled:opacity-50 transition-all shadow-sm"
            style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
          >
            {seeding ? 'Seeding...' : 'Seed Database'}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { title: 'Total Revenue', value: formatCurrency(kpis.totalRevenue), sub: 'All time', color: 'bg-gradient-to-br from-indigo-500 to-indigo-600', icon: <TrendingUp size={20} className="text-white" /> },
          { title: 'Total Expenses', value: formatCurrency(kpis.totalExpenses), sub: 'All time', color: 'bg-gradient-to-br from-rose-500 to-rose-600', icon: <TrendingDown size={20} className="text-white" /> },
          { title: 'Net Profit', value: formatCurrency(netProfit), sub: netProfit >= 0 ? 'Profitable' : 'Net loss', color: netProfit >= 0 ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' : 'bg-gradient-to-br from-orange-500 to-orange-600', icon: <TrendingUp size={20} className="text-white" /> },
          { title: 'Receivable', value: formatCurrency(kpis.accountsReceivable), sub: `Payable: ${formatCurrency(kpis.accountsPayable)}`, color: 'bg-gradient-to-br from-violet-500 to-violet-600', icon: <Clock size={20} className="text-white" /> },
        ].map((kpi, i) => (
          <KpiCard key={kpi.title} {...kpi} loading={loading} delay={i * 60} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Revenue vs Expenses — Area Chart */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 card-lift">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Revenue vs Expenses</h2>
              <p className="text-xs text-slate-400 mt-0.5">Monthly comparison</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="w-3 h-1 rounded-full bg-indigo-500 inline-block" /> Revenue
              </span>
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="w-3 h-1 rounded-full bg-rose-400 inline-block" /> Expenses
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data?.monthlyData ?? []} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#6366f1" strokeWidth={2.5} fill="url(#gradRevenue)" dot={{ r: 3, fill: '#6366f1', strokeWidth: 0 }} />
              <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#f43f5e" strokeWidth={2.5} fill="url(#gradExpenses)" dot={{ r: 3, fill: '#f43f5e', strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* AR Aging */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 card-lift">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-slate-900">AR Aging</h2>
            <p className="text-xs text-slate-400 mt-0.5">Receivable breakdown</p>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={agingData}
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={72}
                paddingAngle={3}
                dataKey="value"
              >
                {agingData.map((_, i) => (
                  <Cell key={i} fill={AGING_COLORS[i]} strokeWidth={0} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => formatCurrency(Number(v))} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-3">
            {agingData.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: AGING_COLORS[i] }} />
                  <span className="text-xs text-slate-500">{item.name}</span>
                </div>
                <span className="text-xs font-semibold text-slate-700 tabular">{formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Profit bar chart */}
      {data?.monthlyData && data.monthlyData.some(d => d.revenue > 0 || d.expenses > 0) && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 card-lift">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-slate-900">Monthly Profit</h2>
            <p className="text-xs text-slate-400 mt-0.5">Revenue minus expenses per month</p>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data.monthlyData.map(d => ({ ...d, profit: d.revenue - d.expenses }))} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="profit" name="Net Profit" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <RecentTable
          title="Recent Invoices"
          link="/invoices"
          icon={<FileText size={16} className="text-indigo-500" />}
          loading={loading}
          rows={data?.recentInvoices ?? []}
          cols={[
            { label: 'Invoice', render: (r) => <span className="font-semibold text-indigo-600 text-xs font-mono">{r.invoiceNo}</span> },
            { label: 'Customer', render: (r) => <span className="text-slate-700 text-sm">{r.customer.name}</span> },
            { label: 'Amount', render: (r) => <span className="font-semibold text-slate-900 tabular text-sm">{formatCurrency(r.total)}</span>, right: true },
            { label: 'Status', render: (r) => <Badge status={r.status} /> },
          ]}
          emptyMsg="No invoices yet"
        />

        <RecentTable
          title="Recent Bills"
          link="/bills"
          icon={<Receipt size={16} className="text-rose-500" />}
          loading={loading}
          rows={data?.recentBills ?? []}
          cols={[
            { label: 'Bill', render: (r) => <span className="font-semibold text-indigo-600 text-xs font-mono">{r.billNo}</span> },
            { label: 'Vendor', render: (r) => <span className="text-slate-700 text-sm">{r.vendor.name}</span> },
            { label: 'Amount', render: (r) => <span className="font-semibold text-slate-900 tabular text-sm">{formatCurrency(r.total)}</span>, right: true },
            { label: 'Status', render: (r) => <Badge status={r.status} /> },
          ]}
          emptyMsg="No bills yet"
        />
      </div>
    </div>
  )
}

function KpiCard({ title, value, sub, color, icon, loading, delay = 0 }: {
  title: string; value: string; sub: string
  color: string; icon: React.ReactNode; loading?: boolean; delay?: number
}) {
  return (
    <div
      className="relative bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden card-lift stat-gradient animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="p-5">
        {loading ? (
          <div className="space-y-3">
            <div className="skeleton h-3 w-24" />
            <div className="skeleton h-7 w-32" />
            <div className="skeleton h-3 w-16" />
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm ${color}`}>
                {icon}
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 tabular leading-none">{value}</p>
            <p className="text-xs text-slate-400 mt-2">{sub}</p>
          </>
        )}
      </div>
      <div className={`h-0.5 w-full ${color} opacity-60`} />
    </div>
  )
}

interface Col<T> {
  label: string
  render: (r: T) => React.ReactNode
  right?: boolean
}

function RecentTable<T extends { id: string }>({
  title, link, icon, loading, rows, cols, emptyMsg
}: {
  title: string; link: string; icon: React.ReactNode
  loading: boolean; rows: T[]; cols: Col<T>[]; emptyMsg: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden card-lift">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        </div>
        <a href={link} className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold transition-colors">
          View all <ArrowRight size={12} />
        </a>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full data-table">
          <thead>
            <tr className="border-b border-slate-50">
              {cols.map((c, i) => (
                <th key={i} className={`px-4 py-2.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider ${c.right ? 'text-right' : 'text-left'}`}>
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  {cols.map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="skeleton h-4 w-full" /></td>
                  ))}
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={cols.length} className="px-4 py-10 text-center text-slate-400 text-sm">{emptyMsg}</td>
              </tr>
            ) : rows.map((row) => (
              <tr key={row.id}>
                {cols.map((c, j) => (
                  <td key={j} className={`px-4 py-3 ${c.right ? 'text-right' : ''}`}>
                    {c.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
