'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import api from '@/services/api'

const editTenantSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  plan: z.enum(['starter', 'professional', 'enterprise']),
  commission_rate: z.coerce.number().min(0).max(1),
  hotel_name: z.string().min(2, 'Hotel name must be at least 2 characters'),
  star_rating: z.coerce.number().min(1).max(5),
})

type EditTenantFormValues = z.infer<typeof editTenantSchema>

interface EditTenantModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  tenant: any
}

export default function EditTenantModal({ isOpen, onClose, onSuccess, tenant }: EditTenantModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditTenantFormValues>({
    resolver: zodResolver(editTenantSchema),
    defaultValues: {
      name: tenant?.name || '',
      plan: tenant?.plan || 'starter',
      commission_rate: tenant?.commission_rate || 0.12,
      hotel_name: tenant?.hotels?.[0]?.name || tenant?.name || '',
      star_rating: tenant?.hotels?.[0]?.star_rating || 3,
    },
  })

  // Update form when tenant changes
  useEffect(() => {
    if (tenant) {
      reset({
        name: tenant.name,
        plan: tenant.plan,
        commission_rate: tenant.commission_rate,
        hotel_name: tenant.hotels?.[0]?.name || tenant.name,
        star_rating: tenant.hotels?.[0]?.star_rating || 3,
      })
    }
  }, [tenant, reset])

  if (!isOpen) return null

  const onSubmit = async (data: EditTenantFormValues) => {
    setIsSubmitting(true)
    setError(null)
    try {
      await api.patch(`/api/v1/super-admin/tenants/${tenant.id}`, data)
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update tenant. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass-card w-full max-w-lg rounded-3xl p-8 shadow-2xl border border-white/20 slide-up overflow-hidden relative">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl"></div>

        <div className="relative">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold gradient-text">Edit Property Details</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100/50 rounded-full transition-colors"
            >
              <span className="text-2xl text-[#2D4A42]">✕</span>
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
                <label className="text-sm font-semibold text-[#1A2E2B] ml-1">Tenant Account Name</label>
                <input
                  {...register('name')}
                  placeholder="Organization Name"
                  className="input-field w-full px-5 py-3.5 rounded-2xl text-[#1A2E2B] border border-gray-200 focus:outline-none transition-all"
                />
                {errors.name && <p className="text-xs text-red-500 font-medium ml-1">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#1A2E2B] ml-1">Subscription Plan</label>
                <select
                  {...register('plan')}
                  className="input-field w-full px-5 py-3.5 rounded-2xl text-[#1A2E2B] border border-gray-200 focus:outline-none transition-all appearance-none bg-white"
                >
                  <option value="starter">Starter</option>
                  <option value="professional">Professional</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#1A2E2B] ml-1">Public Hotel Name</label>
              <input
                {...register('hotel_name')}
                placeholder="Public display name"
                className="input-field w-full px-5 py-3.5 rounded-2xl text-[#1A2E2B] border border-gray-200 focus:outline-none transition-all"
              />
              {errors.hotel_name && <p className="text-xs text-red-500 font-medium ml-1">{errors.hotel_name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#1A2E2B] ml-1">Star Rating</label>
                <select
                  {...register('star_rating')}
                  className="input-field w-full px-5 py-3.5 rounded-2xl text-[#1A2E2B] border border-gray-200 focus:outline-none transition-all appearance-none bg-white font-bold text-amber-600"
                >
                  {[1, 2, 3, 4, 5].map(num => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'Star' : 'Stars'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#1A2E2B] ml-1">Commission Rate</label>
                <div className="relative">
                  <input
                    {...register('commission_rate')}
                    type="number"
                    step="0.01"
                    className="input-field w-full px-5 py-3.5 rounded-2xl text-[#1A2E2B] border border-gray-200 focus:outline-none transition-all"
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[#4A6B63] font-medium">%</span>
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center gap-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 glass px-6 py-4 rounded-2xl font-bold text-[#1A2E2B] hover:bg-gray-100 transition-all border border-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-[2] btn-primary px-6 py-4 rounded-2xl font-bold shadow-xl shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </div>
                ) : (
                  '💾 Update Property'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

