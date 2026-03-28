'use client'

import { useState, useEffect } from 'react'
import api from '@/services/api'
import Link from 'next/link'

interface Stats {
  total_tenants: number
  total_users: number
  role_counts: Record<string, number>
  tenant_status: Record<string, number>
}

interface Tenant {
  id: number
  name: string
  slug: string
  plan: string
  status: string
  commission_rate: number
  created_at: string
}

export default function SuperAdminPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [pendingTenants, setPendingTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [statsRes, tenantsRes] = await Promise.all([
          api.get('/api/v1/super-admin/stats'),
          api.get('/api/v1/super-admin/tenants', { params: { limit: 100 } }),
        ])
        setStats(statsRes.data)
        // Show only pending tenants in the overview
        setPendingTenants(
          (tenantsRes.data.tenants as Tenant[]).filter((t) => t.status === 'pending')
        )
      } catch (err) {
        console.error('Failed to fetch overview data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const Skeleton = () => (
    <div className="animate-pulse bg-gray-200 rounded-xl h-10 w-24" />
  )

  const activeTenants   = stats?.tenant_status?.['TenantStatus.active']   ?? stats?.tenant_status?.['active']   ?? 0
  const pendingCount    = stats?.tenant_status?.['TenantStatus.pending']   ?? stats?.tenant_status?.['pending']  ?? 0
  const suspendedCount  = stats?.tenant_status?.['TenantStatus.suspended'] ?? stats?.tenant_status?.['suspended']?? 0

  return (
    <div className="w-full">
      <div className="max-w-[1600px] mx-auto space-y-8">

        {/* Header */}
        <div className="fade-in">
          <h1 className="text-5xl font-bold gradient-text mb-2">Platform Overview</h1>
          <p className="text-gray-600 text-lg">Real-time platform analytics and metrics</p>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 slide-up" style={{ animationDelay: '0.1s' }}>

          {/* Total Tenants */}
          <div className="glass-card rounded-2xl p-6 card-hover border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-600 font-medium mb-2">Total Tenants</p>
                <p className="text-5xl font-bold gradient-text">
                  {loading ? <Skeleton /> : stats?.total_tenants ?? 0}
                </p>
              </div>
              <div className="text-6xl float">🏨</div>
            </div>
            <div className="flex items-center gap-2 text-green-600 bg-green-100/50 px-3 py-1.5 rounded-full inline-block">
              <span className="font-semibold text-sm">
                {loading ? '—' : `${activeTenants} active`}
              </span>
            </div>
          </div>

          {/* Total Users */}
          <div className="glass-card rounded-2xl p-6 card-hover border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-600 font-medium mb-2">Total Users</p>
                <p className="text-5xl font-bold gradient-text">
                  {loading ? <Skeleton /> : stats?.total_users ?? 0}
                </p>
              </div>
              <div className="text-6xl float">👥</div>
            </div>
            <div className="flex items-center gap-2 text-blue-600 bg-blue-100/50 px-3 py-1.5 rounded-full inline-block">
              <span className="font-semibold text-sm">
                {loading
                  ? '—'
                  : `${
                      Object.entries(stats?.role_counts ?? {})
                        .filter(([k]) => k.includes('guest'))
                        .reduce((a, [, v]) => a + v, 0)
                    } guests`}
              </span>
            </div>
          </div>

          {/* Pending Tenants */}
          <div className="glass-card rounded-2xl p-6 card-hover border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-600 font-medium mb-2">Pending Tenants</p>
                <p className="text-5xl font-bold gradient-text">
                  {loading ? <Skeleton /> : pendingCount}
                </p>
              </div>
              <div className="text-6xl float">⏳</div>
            </div>
            <div className="flex items-center gap-2 text-yellow-600 bg-yellow-100/50 px-3 py-1.5 rounded-full inline-block">
              <span className="font-semibold text-sm">Awaiting approval</span>
            </div>
          </div>

          {/* Hotel Staff */}
          <div className="glass-card rounded-2xl p-6 card-hover border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-600 font-medium mb-2">Hotel Staff</p>
                <p className="text-5xl font-bold gradient-text">
                  {loading ? <Skeleton /> : (
                    Object.entries(stats?.role_counts ?? {})
                      .filter(([k]) => !k.includes('guest') && !k.includes('super_admin'))
                      .reduce((a, [, v]) => a + v, 0)
                  )}
                </p>
              </div>
              <div className="text-6xl float">🛎️</div>
            </div>
            <div className="flex items-center gap-2 text-purple-600 bg-purple-100/50 px-3 py-1.5 rounded-full inline-block">
              <span className="font-semibold text-sm">Across all hotels</span>
            </div>
          </div>
        </div>

        {/* Tenant Status Breakdown */}
        <div className="glass-card rounded-2xl p-8 slide-up border border-gray-200" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-3xl font-bold gradient-text mb-6">Tenant Status Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Active',    value: activeTenants,  color: 'bg-green-100 text-green-700',  bar: 'bg-green-500' },
              { label: 'Pending',   value: pendingCount,   color: 'bg-yellow-100 text-yellow-700', bar: 'bg-yellow-500' },
              { label: 'Suspended', value: suspendedCount, color: 'bg-red-100 text-red-700',    bar: 'bg-red-500' },
            ].map((item) => {
              const total = (stats?.total_tenants ?? 1)
              const pct   = total > 0 ? Math.round((item.value / total) * 100) : 0
              return (
                <div key={item.label} className="glass p-5 rounded-xl border border-transparent hover:border-gray-200 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-gray-700">{item.label}</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${item.color}`}>
                      {loading ? '—' : item.value}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`${item.bar} h-2 rounded-full transition-all duration-700`}
                      style={{ width: loading ? '0%' : `${pct}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{loading ? '—' : `${pct}% of total`}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Pending Tenant Applications */}
        <div className="glass-card rounded-2xl p-8 slide-up border border-gray-200" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold gradient-text flex items-center gap-3">
                📋 Pending Tenant Applications
              </h2>
              <p className="text-gray-600 mt-1">New hotel onboarding requests awaiting action</p>
            </div>
            <Link
              href="/super-admin/tenants"
              className="btn-primary px-6 py-3 rounded-xl font-semibold"
            >
              View All →
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-blue-600" />
            </div>
          ) : pendingTenants.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <div className="text-5xl mb-3">🎉</div>
              <p className="font-semibold">No pending applications</p>
              <p className="text-sm">All tenants have been reviewed.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingTenants.slice(0, 5).map((tenant, index) => (
                <div
                  key={tenant.id}
                  className="glass p-6 rounded-xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-200 slide-up"
                  style={{ animationDelay: `${0.4 + index * 0.05}s` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">🏨</div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{tenant.name}</h3>
                        <p className="text-gray-600">
                          {tenant.slug}.stayos.com &nbsp;•&nbsp;
                          <span className="capitalize">{tenant.plan}</span> plan &nbsp;•&nbsp;
                          {(tenant.commission_rate * 100).toFixed(1)}% commission
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-4 py-2 rounded-full font-semibold text-sm bg-yellow-100 text-yellow-700">
                        Pending
                      </span>
                      <Link
                        href="/super-admin/tenants"
                        className="glass px-4 py-2 rounded-lg hover:bg-gray-100 transition-all text-gray-700 text-sm"
                      >
                        Review →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Role Distribution */}
        <div className="glass-card rounded-2xl p-8 slide-up border border-gray-200" style={{ animationDelay: '0.5s' }}>
          <h2 className="text-3xl font-bold gradient-text mb-6">👥 User Role Distribution</h2>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-blue-600" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { key: 'super_admin',    label: 'Super Admin',  icon: '🏛️', color: 'from-indigo-500 to-purple-600' },
                { key: 'hotel_admin',    label: 'Hotel Admin',  icon: '🏨', color: 'from-blue-500 to-blue-600' },
                { key: 'hotel_manager',  label: 'Manager',      icon: '📋', color: 'from-cyan-500 to-blue-500' },
                { key: 'front_desk',     label: 'Front Desk',   icon: '🛎️', color: 'from-green-500 to-emerald-600' },
                { key: 'housekeeping',   label: 'Housekeeping', icon: '🧹', color: 'from-yellow-500 to-orange-500' },
                { key: 'guest',          label: 'Guests',       icon: '👤', color: 'from-pink-500 to-rose-600' },
              ].map((role) => {
                const count = Object.entries(stats?.role_counts ?? {}).find(([k]) =>
                  k.includes(role.key)
                )?.[1] ?? 0
                return (
                  <div
                    key={role.key}
                    className={`bg-gradient-to-br ${role.color} rounded-2xl p-5 text-white text-center shadow-lg`}
                  >
                    <div className="text-4xl mb-2">{role.icon}</div>
                    <p className="text-3xl font-bold">{count}</p>
                    <p className="text-sm opacity-90 font-medium mt-1">{role.label}</p>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
