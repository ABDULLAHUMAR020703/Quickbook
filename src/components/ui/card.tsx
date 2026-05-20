import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  noPad?: boolean
}

export function Card({ children, className, noPad }: CardProps) {
  return (
    <div className={cn(
      'bg-white rounded-2xl border border-slate-200 shadow-sm',
      !noPad && 'p-6',
      className
    )}>
      {children}
    </div>
  )
}

interface CardHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export function CardHeader({ title, subtitle, action }: CardHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div>
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string
  subValue?: string
  trend?: { value: string; positive: boolean }
  icon: React.ReactNode
  color: 'indigo' | 'green' | 'red' | 'amber' | 'violet' | 'sky'
  className?: string
}

const colorMap = {
  indigo: { icon: 'bg-indigo-500/10 text-indigo-600', border: 'border-indigo-100', accent: 'from-indigo-500/5' },
  green:  { icon: 'bg-emerald-500/10 text-emerald-600', border: 'border-emerald-100', accent: 'from-emerald-500/5' },
  red:    { icon: 'bg-red-500/10 text-red-600', border: 'border-red-100', accent: 'from-red-500/5' },
  amber:  { icon: 'bg-amber-500/10 text-amber-600', border: 'border-amber-100', accent: 'from-amber-500/5' },
  violet: { icon: 'bg-violet-500/10 text-violet-600', border: 'border-violet-100', accent: 'from-violet-500/5' },
  sky:    { icon: 'bg-sky-500/10 text-sky-600', border: 'border-sky-100', accent: 'from-sky-500/5' },
}

export function StatCard({ title, value, subValue, trend, icon, color, className }: StatCardProps) {
  const c = colorMap[color]
  return (
    <div className={cn(
      'bg-white rounded-2xl border shadow-sm p-6 relative overflow-hidden',
      c.border,
      className
    )}>
      <div className={cn('absolute inset-0 bg-gradient-to-br to-transparent opacity-60', c.accent)} />
      <div className="relative flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{title}</p>
          <p className="text-2xl font-bold text-slate-900 tabular leading-none">{value}</p>
          {subValue && <p className="text-xs text-slate-400 mt-1.5">{subValue}</p>}
          {trend && (
            <div className={cn(
              'flex items-center gap-1 mt-2 text-xs font-medium',
              trend.positive ? 'text-emerald-600' : 'text-red-500'
            )}>
              <span>{trend.positive ? '↑' : '↓'}</span>
              <span>{trend.value}</span>
            </div>
          )}
        </div>
        <div className={cn('p-3 rounded-xl flex-shrink-0', c.icon)}>
          {icon}
        </div>
      </div>
    </div>
  )
}
