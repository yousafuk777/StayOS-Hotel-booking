'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import apiClient from '../../../services/apiClient'

export default function TestBookingPage() {
  const router = useRouter()
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [testResult, setTestResult] = useState<string>('')

  useEffect(() => {
    // Collect debug info
    setDebugInfo({
      token: localStorage.getItem('access_token'),
      user: localStorage.getItem('user'),
      tenantId: localStorage.getItem('tenant_id'),
      hasToken: !!localStorage.getItem('access_token'),
    })
  }, [])

  const testBookingCreation = async () => {
    setTestResult('Testing...')
    
    try {
      console.log('Starting booking creation test...')
      
      const response = await apiClient.post('/api/v1/bookings/', {
        guest_name: "Test User",
        email: "test@example.com",
        phone: "+1234567890",
        hotel_id: 1,
        check_in_date: "2026-04-01",
        check_out_date: "2026-04-05",
        nights: 4,
        num_guests: 2,
        room_type: "Deluxe Suite",
        total_amount: 500,
        status: "pending",
        special_requests: "Test booking from debug page"
      })
      
      console.log('Success:', response.data)
      setTestResult('✅ SUCCESS! Booking created: ' + JSON.stringify(response.data, null, 2))
    } catch (error: any) {
      console.error('Error:', error)
      console.error('Response:', error.response)
      setTestResult('❌ FAILED!\n\n' + 
        'Error: ' + error.message + '\n' +
        'Response Status: ' + (error.response?.status || 'N/A') + '\n' +
        'Response Data: ' + JSON.stringify(error.response?.data, null, 2) + '\n' +
        'CORS Error: ' + (error.code === 'ERR_NETWORK' ? 'YES - Check authentication' : 'NO'))
    }
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🔧 Booking Debug Page</h1>
        
        {/* Debug Info */}
        <div className="bg-white rounded-xl p-6 mb-6 shadow">
          <h2 className="text-xl font-bold mb-4">📊 Authentication Status</h2>
          <div className="space-y-2 font-mono text-sm">
            <div className={debugInfo.hasToken ? 'text-green-600' : 'text-red-600'}>
              <strong>Has Token:</strong> {debugInfo.hasToken ? '✅ YES' : '❌ NO'}
            </div>
            <div>
              <strong>Token:</strong> {debugInfo.token ? debugInfo.token.substring(0, 50) + '...' : 'NULL'}
            </div>
            <div>
              <strong>User:</strong> {debugInfo.user ? debugInfo.user : 'NULL'}
            </div>
            <div>
              <strong>Tenant ID:</strong> {debugInfo.tenantId || 'NULL'}
            </div>
          </div>
        </div>

        {/* Test Button */}
        <div className="bg-white rounded-xl p-6 mb-6 shadow">
          <h2 className="text-xl font-bold mb-4">🧪 Test Booking Creation</h2>
          <button
            onClick={testBookingCreation}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all"
          >
            Run Test
          </button>
          
          {testResult && (
            <pre className="mt-4 p-4 bg-gray-100 rounded-lg overflow-auto text-xs whitespace-pre-wrap">
              {testResult}
            </pre>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-xl">
          <h2 className="text-xl font-bold mb-2">⚠️ If you see "Network Error" or CORS:</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li><strong>You are NOT logged in!</strong> Go to <a href="/login" className="text-blue-600 underline">/login</a> first</li>
            <li>Login with: <code className="bg-gray-200 px-2 py-1 rounded">admin@stayos.com</code> / <code className="bg-gray-200 px-2 py-1 rounded">admin123</code></li>
            <li>After login, come back here and try again</li>
            <li>If still failing, check browser console (F12) for detailed errors</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
