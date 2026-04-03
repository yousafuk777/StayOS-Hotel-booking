'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SystemHealthPage() {
  const router = useRouter()
  const [selectedService, setSelectedService] = useState<string | null>(null)

  const systemMetrics = {
    overallHealth: 98,
    uptime: '99.97%',
    responseTime: '142ms',
    activeUsers: 1247,
    serverLoad: '34%',
    memoryUsage: '62%'
  }

  const services = [
    { name: 'API Gateway', status: 'operational', uptime: 99.99, latency: '45ms', lastChecked: 'Just now' },
    { name: 'Database Cluster', status: 'operational', uptime: 99.95, latency: '12ms', lastChecked: 'Just now' },
    { name: 'Authentication Service', status: 'operational', uptime: 99.98, latency: '28ms', lastChecked: 'Just now' },
    { name: 'Payment Processing', status: 'operational', uptime: 99.92, latency: '156ms', lastChecked: 'Just now' },
    { name: 'Email Service', status: 'degraded', uptime: 98.45, latency: '2.3s', lastChecked: '2 min ago' },
    { name: 'File Storage', status: 'operational', uptime: 99.97, latency: '89ms', lastChecked: 'Just now' },
    { name: 'Cache Layer (Redis)', status: 'operational', uptime: 99.99, latency: '3ms', lastChecked: 'Just now' },
    { name: 'Search Engine', status: 'operational', uptime: 99.94, latency: '67ms', lastChecked: 'Just now' },
  ]

  const recentIncidents = [
    { id: 1, title: 'Email Service Degradation', severity: 'medium', status: 'investigating', time: '2 hours ago', description: 'Increased latency in email delivery' },
    { id: 2, title: 'Database Failover', severity: 'high', status: 'resolved', time: 'Mar 26, 2024', description: 'Primary database switched to replica' },
    { id: 3, title: 'Cache Memory Spike', severity: 'low', status: 'resolved', time: 'Mar 25, 2024', description: 'Redis memory usage exceeded threshold' },
  ]

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">⚙️ System Health</h1>
            <p className="text-[#2D4A42]">Real-time monitoring of all system components</p>
          </div>
          <button className="glass px-6 py-3 rounded-xl font-semibold cursor-pointer hover:bg-gray-50 transition-all">
            🔄 Refresh Status
          </button>
        </div>
      </div>

      {/* Overall Status */}
      <div className="glass-card rounded-2xl p-8 mb-8 slide-up">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="relative inline-block mb-4">
              <svg className="w-40 h-40 transform -rotate-90">
                <circle cx="80" cy="80" r="70" stroke="#e5e7eb" strokeWidth="12" fill="none" />
                <circle cx="80" cy="80" r="70" stroke="url(#gradientLine)" strokeWidth="12" fill="none" strokeDasharray={`${systemMetrics.overallHealth * 4.4} 440`} strokeLinecap="round" />
                <defs>
                  <linearGradient id="gradientLine" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#0F6E56" />
                    <stop offset="100%" stopColor="#C8941A" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-5xl font-bold gradient-text">{systemMetrics.overallHealth}%</p>
                  <p className="text-sm text-[#2D4A42] font-semibold mt-1">System Health</p>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="glass rounded-xl p-4">
                <p className="text-sm text-[#2D4A42] font-semibold mb-1">Uptime</p>
                <p className="text-2xl font-bold text-green-600">{systemMetrics.uptime}</p>
              </div>
              <div className="glass rounded-xl p-4">
                <p className="text-sm text-[#2D4A42] font-semibold mb-1">Response Time</p>
                <p className="text-2xl font-bold text-blue-600">{systemMetrics.responseTime}</p>
              </div>
              <div className="glass rounded-xl p-4">
                <p className="text-sm text-[#2D4A42] font-semibold mb-1">Active Users</p>
                <p className="text-2xl font-bold text-purple-600">{systemMetrics.activeUsers.toLocaleString()}</p>
              </div>
              <div className="glass rounded-xl p-4">
                <p className="text-sm text-[#2D4A42] font-semibold mb-1">Server Load</p>
                <p className="text-2xl font-bold text-green-600">{systemMetrics.serverLoad}</p>
              </div>
              <div className="glass rounded-xl p-4">
                <p className="text-sm text-[#2D4A42] font-semibold mb-1">Memory Usage</p>
                <p className="text-2xl font-bold text-yellow-600">{systemMetrics.memoryUsage}</p>
              </div>
              <div className="glass rounded-xl p-4">
                <p className="text-sm text-[#2D4A42] font-semibold mb-1">Services</p>
                <p className="text-2xl font-bold text-indigo-600">{services.filter(s => s.status === 'operational').length}/{services.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Status */}
      <div className="glass-card rounded-2xl p-6 mb-8 slide-up">
        <h2 className="text-2xl font-bold gradient-text mb-6">🔧 Services Status</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {services.map((service, index) => (
            <div key={index} onClick={() => setSelectedService(service.name)} className={`glass rounded-xl p-5 card-hover cursor-pointer border-2 transition-all ${selectedService === service.name ? 'border-blue-500 scale-105' : 'border-transparent'}`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-[#1A2E2B]">{service.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${service.status === 'operational' ? 'text-green-600 bg-green-100' : service.status === 'degraded' ? 'text-yellow-600 bg-yellow-100' : 'text-red-600 bg-red-100'}`}>
                  {service.status === 'operational' ? '✓' : service.status === 'degraded' ? '⚠' : '✕'}
                </span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-[#2D4A42]">Uptime:</span><span className="font-semibold text-[#1A2E2B]">{service.uptime}%</span></div>
                <div className="flex justify-between"><span className="text-[#2D4A42]">Latency:</span><span className={`font-semibold ${parseInt(service.latency) < 100 ? 'text-green-600' : parseInt(service.latency) < 500 ? 'text-yellow-600' : 'text-red-600'}`}>{service.latency}</span></div>
                <div className="flex justify-between"><span className="text-[#2D4A42]">Last Check:</span><span className="text-[#2D4A42]">{service.lastChecked}</span></div>
              </div>

              <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                <div className={`h-2 rounded-full transition-all duration-500 ${service.uptime >= 99.9 ? 'bg-green-500' : service.uptime >= 99 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${service.uptime}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Incidents */}
      <div className="glass-card rounded-2xl p-6 slide-up">
        <h2 className="text-2xl font-bold gradient-text mb-6">📋 Recent Incidents</h2>
        
        <div className="space-y-4">
          {recentIncidents.map((incident) => (
            <div key={incident.id} className="glass rounded-xl p-5 border-l-4 border-l-yellow-500">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-[#1A2E2B] mb-1">{incident.title}</h3>
                  <p className="text-sm text-[#2D4A42]">{incident.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${incident.severity === 'low' ? 'text-blue-600 bg-blue-100' : incident.severity === 'medium' ? 'text-yellow-600 bg-yellow-100' : 'text-red-600 bg-red-100'}`}>{incident.severity.toUpperCase()}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${incident.status === 'resolved' ? 'bg-green-100 text-green-700' : incident.status === 'investigating' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>{incident.status.replace('_', ' ').toUpperCase()}</span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-[#2D4A42]">
                <span>🕐 {incident.time}</span>
                <span>📝 ID: #{incident.id.toString().padStart(4, '0')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8 slide-up">
        {/* Server Resources */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-xl font-bold gradient-text mb-6">🖥️ Server Resources</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2"><span className="font-semibold text-[#1A2E2B]">CPU Usage</span><span className="font-bold text-[#1A2E2B]">34%</span></div>
              <div className="w-full bg-gray-200 rounded-full h-3"><div className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full" style={{ width: '34%' }} /></div>
            </div>
            <div>
              <div className="flex justify-between mb-2"><span className="font-semibold text-[#1A2E2B]">Memory Usage</span><span className="font-bold text-[#1A2E2B]">62%</span></div>
              <div className="w-full bg-gray-200 rounded-full h-3"><div className="bg-gradient-to-r from-yellow-500 to-orange-500 h-3 rounded-full" style={{ width: '62%' }} /></div>
            </div>
            <div>
              <div className="flex justify-between mb-2"><span className="font-semibold text-[#1A2E2B]">Disk Space</span><span className="font-bold text-[#1A2E2B]">45%</span></div>
              <div className="w-full bg-gray-200 rounded-full h-3"><div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full" style={{ width: '45%' }} /></div>
            </div>
            <div>
              <div className="flex justify-between mb-2"><span className="font-semibold text-[#1A2E2B]">Network I/O</span><span className="font-bold text-[#1A2E2B]">28%</span></div>
              <div className="w-full bg-gray-200 rounded-full h-3"><div className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full" style={{ width: '28%' }} /></div>
            </div>
          </div>
        </div>

        {/* Database Health */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-xl font-bold gradient-text mb-6">🗄️ Database Health</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
              <p className="text-sm text-green-700 font-semibold mb-2">Connection Pool</p>
              <p className="text-3xl font-bold text-green-600">45/100</p>
              <p className="text-xs text-green-600 mt-1">45% utilized</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
              <p className="text-sm text-blue-700 font-semibold mb-2">Query Latency</p>
              <p className="text-3xl font-bold text-blue-600">12ms</p>
              <p className="text-xs text-blue-600 mt-1">Avg response</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-200">
              <p className="text-sm text-purple-700 font-semibold mb-2">Slow Queries</p>
              <p className="text-3xl font-bold text-purple-600">3</p>
              <p className="text-xs text-purple-600 mt-1">Last hour</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-5 border border-orange-200">
              <p className="text-sm text-orange-700 font-semibold mb-2">Replication Lag</p>
              <p className="text-3xl font-bold text-orange-600">0ms</p>
              <p className="text-xs text-orange-600 mt-1">Fully synced</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4 mt-8 slide-up">
        <button className="btn-primary px-8 py-4 rounded-xl font-semibold text-lg cursor-pointer">🔍 Run Diagnostics</button>
        <button className="glass px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all cursor-pointer">📊 View Full Logs</button>
        <button className="glass px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all cursor-pointer">⚙️ Configure Alerts</button>
      </div>
    </div>
  )
}
