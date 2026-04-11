'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import api from '@/services/api'

const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  first_name: z.string().min(2, 'First name is required'),
  last_name: z.string().min(2, 'Last name is required'),
  role: z.string(),
  password: z.string().min(8, 'Password must be at least 8 characters').optional().or(z.literal('')),
  tenant_id: z.any().transform(v => (v === "" || v === "null" || v === null || v === undefined) ? null : Number(v)),
  is_active: z.boolean().default(true),
}).refine(data => data.role === 'super_admin' || (data.tenant_id !== null && data.tenant_id !== undefined && !isNaN(data.tenant_id)), {
  message: "Hotel assignment is required for staff roles",
  path: ["tenant_id"]
})

type UserFormValues = z.infer<typeof userSchema>

interface UserFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  user?: any // If provided, we are in Edit mode
}

export default function UserFormModal({ isOpen, onClose, onSuccess, user }: UserFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tenants, setTenants] = useState<any[]>([])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      role: 'guest',
      is_active: true,
      tenant_id: null,
    },
  })

  // Load tenants for assignment dropdown
  useEffect(() => {
    if (isOpen) {
      api.get('/api/v1/super-admin/tenants', { params: { limit: 100 } })
        .then(res => setTenants(res.data.tenants))
        .catch(err => console.error('Failed to load tenants', err))
    }
  }, [isOpen])

  // Reset form when user changes (Edit vs Create)
  useEffect(() => {
    if (user) {
      reset({
        email: user.email,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        role: user.role,
        is_active: user.is_active,
        tenant_id: user.tenant_id,
      })
    } else {
      reset({
        email: '',
        first_name: '',
        last_name: '',
        role: 'guest',
        is_active: true,
        tenant_id: null,
        password: '',
      })
    }
  }, [user, reset, isOpen])

  if (!isOpen) return null

  const onSubmit = async (data: UserFormValues) => {
    setIsSubmitting(true)
    setError(null)
    try {
      if (user) {
        // Edit Mode
        const patchData = { ...data }
        if (!patchData.password) delete patchData.password
        await api.patch(`/api/v1/super-admin/users/${user.id}`, patchData)
      } else {
        // Create Mode
        if (!data.password) {
          setError('Password is required for new users')
          setIsSubmitting(false)
          return
        }
        await api.post('/api/v1/super-admin/users', data)
      }
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass-card w-full max-w-xl rounded-3xl p-8 shadow-2xl border border-white/20 slide-up overflow-hidden relative">
        <div className="relative">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold gradient-text">
              {user ? 'Edit User' : 'Add New User'}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100/50 rounded-full transition-colors font-bold text-[#2D4A42] text-xl">
              ✕
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm font-medium">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#1A2E2B] ml-1">First Name</label>
                <input {...register('first_name')} className="input-field w-full px-4 py-3 rounded-2xl border border-gray-200" />
                {errors.first_name && <p className="text-xs text-red-500 ml-1">{errors.first_name.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#1A2E2B] ml-1">Last Name</label>
                <input {...register('last_name')} className="input-field w-full px-4 py-3 rounded-2xl border border-gray-200" />
                {errors.last_name && <p className="text-xs text-red-500 ml-1">{errors.last_name.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#1A2E2B] ml-1">Email Address</label>
              <input {...register('email')} type="email" className="input-field w-full px-4 py-3 rounded-2xl border border-gray-200" />
              {errors.email && <p className="text-xs text-red-500 ml-1">{errors.email.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#1A2E2B] ml-1">Role</label>
                <select {...register('role')} className="input-field w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white">
                  <option value="hotel_admin">Hotel Admin</option>
                  <option value="hotel_manager">Hotel Manager</option>
                  <option value="front_desk">Front Desk</option>
                  <option value="housekeeping">Housekeeping</option>
                  <option value="guest">Guest</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#1A2E2B] ml-1">
                  Assign to Hotel (Tenant)
                  <span className="text-xs text-[#2D4A42] font-normal ml-2 italic">(Required for Staff)</span>
                </label>
                <select {...register('tenant_id')} className="input-field w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white">
                  <option value="">Platform (No Tenant)</option>
                  {tenants.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                {errors.tenant_id && <p className="text-xs text-red-500 ml-1">{errors.tenant_id.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#1A2E2B] ml-1">
                {user ? 'New Password (leave blank to keep current)' : 'Password'}
              </label>
              <input {...register('password')} type="password" placeholder="••••••••" className="input-field w-full px-4 py-3 rounded-2xl border border-gray-200" />
              {errors.password && <p className="text-xs text-red-500 ml-1">{errors.password.message}</p>}
            </div>

            <div className="pt-4 flex items-center gap-4">
              <button type="button" onClick={onClose} className="flex-1 glass px-6 py-4 rounded-2xl font-bold text-[#1A2E2B]">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting} className="flex-[2] btn-primary px-6 py-4 rounded-2xl font-bold shadow-xl shadow-blue-600/20">
                {isSubmitting ? 'Saving...' : user ? 'Update User' : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
